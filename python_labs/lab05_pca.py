"""
CSST 106 - Perception and Computer Vision
Laboratory Exercise No. 5: Facial Recognition using PCA (Eigenfaces)
Laguna State Polytechnic University (LSPU) - AY 2026-2027

Topic: Principal Component Analysis (Eigenfaces), Explained Variance, Whitening & SVM
Author: Kean Gabriel Salvahan (BSCS 4B)
"""

import base64
import time
import cv2
import numpy as np
from fastapi import APIRouter, Form, HTTPException
from sklearn.datasets import fetch_lfw_people
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

router = APIRouter(prefix="/api/lab05", tags=["Lab 05 - PCA Eigenfaces"])

_LFW_CACHE = None


def get_lfw_split():
    """Loads and caches LFW (min_faces_per_person=70, resize=0.4) and 80/20 split."""
    global _LFW_CACHE
    if _LFW_CACHE is not None:
        return _LFW_CACHE

    lfw_people = fetch_lfw_people(min_faces_per_person=70, resize=0.4)
    n_samples, h, w = lfw_people.images.shape
    X = lfw_people.data
    y = lfw_people.target
    target_names = lfw_people.target_names
    n_classes = int(target_names.shape[0])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    _LFW_CACHE = {
        "n_samples": int(n_samples),
        "h": int(h),
        "w": int(w),
        "n_features": int(X.shape[1]),
        "n_classes": n_classes,
        "target_names": [str(name) for name in target_names],
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
    }
    return _LFW_CACHE


def face_array_to_base64(arr_2d: np.ndarray, normalize: bool = True) -> str:
    """Converts a 2D grayscale image (eigenface or face) to an upscaled base64 PNG."""
    arr = arr_2d.astype(np.float32)
    if normalize:
        mn, mx = float(arr.min()), float(arr.max())
        if mx - mn > 1e-8:
            arr = (arr - mn) / (mx - mn) * 255.0
        else:
            arr = np.zeros_like(arr)
    else:
        if arr.max() <= 1.5:
            arr = arr * 255.0
        arr = np.clip(arr, 0.0, 255.0)

    uint8_img = arr.astype(np.uint8)
    # Upscale small 37x50 LFW portraits cleanly for web viewing
    upscaled = cv2.resize(uint8_img, (111, 150), interpolation=cv2.INTER_LINEAR)
    success, buffer = cv2.imencode(".png", upscaled)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode face image")
    return f"data:image/png;base64,{base64.b64encode(buffer).decode('utf-8')}"


@router.post("/run")
async def run_lab05_pca(
    n_components: int = Form(150),
    whiten: bool = Form(True),
    svm_c: float = Form(1.0),
    sample_idx: int = Form(0),
):
    """
    Executes Tasks 1-4 and Section 5 Analysis on the LFW dataset:
    1. Load LFW dataset (min_faces_per_person=70, resize=0.4) and split 80/20
    2. Fit randomized PCA on X_train with configurable n_components & whiten
    3. Extract Eigenfaces (Top 12 + Last 3), Mean Face, and Cumulative Explained Variance
    4. Train RBF SVM with class_weight='balanced', generate Classification Report & Failure Analysis
    5. Reconstruct chosen test sample from PCA projection
    """
    try:
        ds = get_lfw_split()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"LFW dataset load failed: {exc}")

    X_train = ds["X_train"]
    X_test = ds["X_test"]
    y_train = ds["y_train"]
    y_test = ds["y_test"]
    h, w = ds["h"], ds["w"]
    target_names = ds["target_names"]

    max_comps = min(300, X_train.shape[0])
    safe_n = max(10, min(max_comps, int(n_components)))
    safe_c = max(0.1, min(100.0, float(svm_c)))

    # Task 2: Computing Principal Components (Fit ONLY on X_train)
    t0 = time.perf_counter()
    pca = PCA(
        n_components=safe_n,
        svd_solver="randomized",
        whiten=whiten,
        random_state=42,
    ).fit(X_train)
    pca_time_s = round(time.perf_counter() - t0, 4)

    X_train_pca = pca.transform(X_train)
    X_test_pca = pca.transform(X_test)

    cum_var = np.cumsum(pca.explained_variance_ratio_)
    total_variance = round(float(cum_var[-1]) * 100.0, 2)
    if np.any(cum_var >= 0.90):
        k_90 = int(np.argmax(cum_var >= 0.90) + 1)
    else:
        k_90 = None

    variance_curve = [
        {
            "k": int(i + 1),
            "variance": round(float(pca.explained_variance_ratio_[i]) * 100.0, 3),
            "cumulative": round(float(cum_var[i]) * 100.0, 2),
        }
        for i in range(safe_n)
    ]

    # Task 3: Extracting & Reshaping Eigenfaces
    eigenfaces = pca.components_.reshape((safe_n, h, w))
    top_count = min(12, safe_n)
    eigenfaces_top12 = [
        {
            "index": i,
            "title": f"Eigenface {i}",
            "variance_pct": round(float(pca.explained_variance_ratio_[i]) * 100.0, 2),
            "image": face_array_to_base64(eigenfaces[i], normalize=True),
        }
        for i in range(top_count)
    ]

    last_start = max(0, safe_n - 3)
    eigenfaces_last3 = [
        {
            "index": i,
            "title": f"Eigenface {i}",
            "variance_pct": round(float(pca.explained_variance_ratio_[i]) * 100.0, 3),
            "image": face_array_to_base64(eigenfaces[i], normalize=True),
        }
        for i in range(last_start, safe_n)
    ]

    mean_face_b64 = face_array_to_base64(pca.mean_.reshape((h, w)), normalize=False)

    # Task 4: SVM Classification in Reduced PCA Space
    t1 = time.perf_counter()
    clf = SVC(kernel="rbf", class_weight="balanced", C=safe_c, random_state=42)
    clf.fit(X_train_pca, y_train)
    svm_time_s = round(time.perf_counter() - t1, 4)

    y_pred = clf.predict(X_test_pca)
    accuracy = round(float(accuracy_score(y_test, y_pred)) * 100.0, 2)

    report_dict = classification_report(
        y_test, y_pred, target_names=target_names, output_dict=True, zero_division=0
    )
    report_text = classification_report(
        y_test, y_pred, target_names=target_names, zero_division=0
    )

    report_rows = []
    for name in target_names:
        row = report_dict.get(name, {})
        report_rows.append(
            {
                "name": name,
                "precision": round(float(row.get("precision", 0.0)), 2),
                "recall": round(float(row.get("recall", 0.0)), 2),
                "f1": round(float(row.get("f1-score", 0.0)), 2),
                "support": int(row.get("support", 0)),
            }
        )

    # Reconstruct all test faces for interactive inspection & failure comparison
    X_test_recon = pca.inverse_transform(X_test_pca)

    # Correct predictions sample
    correct_indices = np.where(y_pred == y_test)[0]
    sample_predictions = []
    for idx in correct_indices[:6]:
        sample_predictions.append(
            {
                "idx": int(idx),
                "true_name": target_names[int(y_test[idx])],
                "pred_name": target_names[int(y_pred[idx])],
                "orig_image": face_array_to_base64(X_test[idx].reshape((h, w)), normalize=False),
                "recon_image": face_array_to_base64(
                    X_test_recon[idx].reshape((h, w)), normalize=False
                ),
            }
        )

    # Section 5 Q4: Failure Analysis (Misclassified test faces)
    wrong_indices = np.where(y_pred != y_test)[0]
    failures = []
    for idx in wrong_indices[:8]:
        failures.append(
            {
                "idx": int(idx),
                "true_name": target_names[int(y_test[idx])],
                "pred_name": target_names[int(y_pred[idx])],
                "orig_image": face_array_to_base64(X_test[idx].reshape((h, w)), normalize=False),
                "recon_image": face_array_to_base64(
                    X_test_recon[idx].reshape((h, w)), normalize=False
                ),
            }
        )

    # Selected single test sample reconstruction inspector
    safe_idx = max(0, min(len(X_test) - 1, int(sample_idx)))
    orig_flat = X_test[safe_idx]
    recon_flat = X_test_recon[safe_idx]
    mse = round(float(np.mean((orig_flat - recon_flat) ** 2)), 5)

    reconstruction = {
        "idx": safe_idx,
        "true_name": target_names[int(y_test[safe_idx])],
        "pred_name": target_names[int(y_pred[safe_idx])],
        "correct": bool(y_pred[safe_idx] == y_test[safe_idx]),
        "mse": mse,
        "orig_image": face_array_to_base64(orig_flat.reshape((h, w)), normalize=False),
        "recon_image": face_array_to_base64(recon_flat.reshape((h, w)), normalize=False),
    }

    return {
        "dataset": {
            "n_samples": ds["n_samples"],
            "n_train": int(X_train.shape[0]),
            "n_test": int(X_test.shape[0]),
            "h": h,
            "w": w,
            "n_features": ds["n_features"],
            "n_classes": ds["n_classes"],
            "target_names": target_names,
        },
        "pca_metrics": {
            "n_components": safe_n,
            "whiten": whiten,
            "pca_time_s": pca_time_s,
            "total_variance": total_variance,
            "k_90": k_90,
            "compression_ratio": round(ds["n_features"] / float(safe_n), 2),
        },
        "variance_curve": variance_curve,
        "mean_face": mean_face_b64,
        "eigenfaces_top12": eigenfaces_top12,
        "eigenfaces_last3": eigenfaces_last3,
        "svm_metrics": {
            "svm_c": safe_c,
            "svm_time_s": svm_time_s,
            "accuracy": accuracy,
            "macro_f1": round(float(report_dict["macro avg"]["f1-score"]), 2),
            "weighted_f1": round(float(report_dict["weighted avg"]["f1-score"]), 2),
            "total_test": int(len(y_test)),
            "misclassified_count": int(len(wrong_indices)),
            "report_rows": report_rows,
            "classification_report_text": report_text,
        },
        "sample_predictions": sample_predictions,
        "failures": failures,
        "reconstruction": reconstruction,
    }


def run_standalone_pca_lab():
    """Standalone CLI script executing Tasks 1-4 and Section 5 plots with Matplotlib."""
    import matplotlib.pyplot as plt

    print("Downloading/Loading LFW dataset (min_faces_per_person=70, resize=0.4)...")
    lfw_people = fetch_lfw_people(min_faces_per_person=70, resize=0.4)

    n_samples, h, w = lfw_people.images.shape
    X = lfw_people.data
    y = lfw_people.target
    target_names = lfw_people.target_names
    n_classes = target_names.shape[0]

    print("Total dataset size:")
    print(f"n_samples: {n_samples}")
    print(f"n_features: {X.shape[1]} ({h}x{w} pixels)")
    print(f"n_classes: {n_classes}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    n_components = 150
    print(f"Extracting the top {n_components} eigenfaces from {X_train.shape[0]} faces...")
    t0 = time.time()
    pca = PCA(n_components=n_components, svd_solver="randomized", whiten=True).fit(X_train)
    print(f"Done in {time.time() - t0:.3f}s")

    X_train_pca = pca.transform(X_train)
    X_test_pca = pca.transform(X_test)

    eigenfaces = pca.components_.reshape((n_components, h, w))

    print("Fitting the SVM classifier to the training set...")
    t0 = time.time()
    clf = SVC(kernel="rbf", class_weight="balanced")
    clf.fit(X_train_pca, y_train)
    print(f"Done in {time.time() - t0:.3f}s")

    print("Predicting people's names on the test set...")
    y_pred = clf.predict(X_test_pca)
    print(classification_report(y_test, y_pred, target_names=target_names))

    # Post-Lab Q1: Cumulative Explained Variance
    cum_var = pca.explained_variance_ratio_.cumsum()
    k90 = int(np.argmax(cum_var >= 0.90) + 1)
    print(f"Components required to retain 90% variance: {k90}")

    def plot_gallery(images, titles, n_row=3, n_col=4):
        plt.figure(figsize=(1.8 * n_col, 2.4 * n_row))
        plt.subplots_adjust(bottom=0, left=0.01, right=0.99, top=0.90, hspace=0.35)
        for i in range(min(len(images), n_row * n_col)):
            plt.subplot(n_row, n_col, i + 1)
            plt.imshow(images[i], cmap=plt.cm.gray)
            plt.title(titles[i], size=10)
            plt.xticks(())
            plt.yticks(())
        plt.show()

    eigenface_titles = [f"eigenface {i}" for i in range(eigenfaces.shape[0])]
    plot_gallery(eigenfaces[:12], eigenface_titles[:12])

    plt.figure(figsize=(7, 4))
    plt.plot(range(1, n_components + 1), cum_var, linewidth=2)
    plt.axhline(0.90, color="r", linestyle="--", label="90% Variance")
    plt.axvline(k90, color="g", linestyle="--", label=f"{k90} components")
    plt.xlabel("Number of Principal Components")
    plt.ylabel("Cumulative Explained Variance")
    plt.title("Dimensionality vs. Cumulative Explained Variance")
    plt.legend()
    plt.grid(True, alpha=0.4)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    run_standalone_pca_lab()
