"""
CSST 106 - Perception and Computer Vision
Laboratory Exercise No. 4: SURF Feature Detection in Python using OpenCV
Laguna State Polytechnic University (LSPU) - AY 2026-2027

Topic: SURF (Speeded-Up Robust Features), U-SURF, SIFT, ORB, and Feature Matching
Author: Kean Gabriel Salvahan (BSCS 4B)
"""

import base64
import sys
import time
from typing import Optional
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/lab04", tags=["Lab 04 - SURF Feature Detection"])


def encode_image_to_base64(img_ndarray: np.ndarray) -> str:
    """Encodes an OpenCV image to base64 JPEG format."""
    success, buffer = cv2.imencode(".jpg", img_ndarray)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"


def detect_hessian_surf_fallback(
    img_gray: np.ndarray,
    hessian_threshold: int = 400,
    upright: bool = False,
):
    """
    OpenCV 4+/5 excludes patented cv2.xfeatures2d.SURF_create unless built with OPENCV_ENABLE_NONFREE.
    This helper computes multi-scale Determinant-of-Hessian blob responses (the core mechanism
    of SURF's Fast-Hessian detector) across multiple Gaussian scales, applies non-maximum
    suppression controlled by hessian_threshold, and uses SIFT descriptors (with angle=-1 for
    U-SURF upright mode or Haar-gradient orientation for standard SURF).
    """
    img_f = img_gray.astype(np.float32)
    h, w = img_gray.shape
    keypoints = []

    # Scale octaves approximating SURF box filter scales (sigmas: 1.2, 2.0, 3.2, 4.8)
    scales = [(1.2, 9.0), (2.0, 15.0), (3.2, 21.0), (4.8, 27.0)]

    # Normalize threshold relative to Hessian determinant magnitude
    # Empirical scaling so hessianThreshold (100..1000) cleanly filters weak vs strong blobs
    det_thresh = max(10.0, float(hessian_threshold) * 2.5)

    gx_full = cv2.Sobel(img_f, cv2.CV_32F, 1, 0, ksize=3)
    gy_full = cv2.Sobel(img_f, cv2.CV_32F, 0, 1, ksize=3)

    candidates = []
    for sigma, kp_size in scales:
        blurred = cv2.GaussianBlur(img_f, (0, 0), sigma)
        dxx = cv2.Sobel(blurred, cv2.CV_32F, 2, 0, ksize=3) * (sigma ** 2)
        dyy = cv2.Sobel(blurred, cv2.CV_32F, 0, 2, ksize=3) * (sigma ** 2)
        dxy = cv2.Sobel(blurred, cv2.CV_32F, 1, 1, ksize=3) * (sigma ** 2)

        # SURF Hessian approximation: det(H) = Dxx * Dyy - (0.9 * Dxy)^2
        det_h = (dxx * dyy) - ((0.9 * dxy) ** 2)

        # Local 3x3 non-maximum suppression
        dilated = cv2.dilate(det_h, np.ones((5, 5), np.float32))
        mask = (det_h == dilated) & (det_h > det_thresh)

        ys, xs = np.where(mask)
        for y, x in zip(ys, xs):
            if 4 <= x < w - 4 and 4 <= y < h - 4:
                score = float(det_h[y, x])
                if upright:
                    angle = -1.0  # U-SURF skips orientation assignment
                else:
                    dx = float(np.sum(gx_full[y - 2 : y + 3, x - 2 : x + 3]))
                    dy = float(np.sum(gy_full[y - 2 : y + 3, x - 2 : x + 3]))
                    angle = float((np.degrees(np.arctan2(dy, dx)) + 360.0) % 360.0)
                candidates.append((score, float(x), float(y), kp_size, angle))

    # Sort strongest blobs first and cap to reasonable count
    candidates.sort(key=lambda c: c[0], reverse=True)
    for score, x, y, kp_size, angle in candidates[:1200]:
        keypoints.append(cv2.KeyPoint(x=x, y=y, size=kp_size, angle=angle, response=score))

    # Compute floating-point descriptors for matching
    sift = cv2.SIFT_create()
    if keypoints:
        keypoints, descriptors = sift.compute(img_gray, keypoints)
    else:
        descriptors = None

    return keypoints, descriptors


def run_surf_detector(
    img_gray: np.ndarray,
    hessian_threshold: int = 400,
    upright: bool = False,
):
    """
    Runs native cv2.xfeatures2d.SURF_create if nonfree module is enabled,
    otherwise cleanly falls back to Hessian-Blob emulation.
    """
    try:
        surf = cv2.xfeatures2d.SURF_create(
            hessianThreshold=hessian_threshold,
            upright=upright,
        )
        keypoints, descriptors = surf.detectAndCompute(img_gray, None)
        return keypoints, descriptors, "OpenCV Native SURF"
    except Exception:
        keypoints, descriptors = detect_hessian_surf_fallback(
            img_gray, hessian_threshold=hessian_threshold, upright=upright
        )
        mode_tag = "U-SURF" if upright else "SURF"
        return (
            keypoints,
            descriptors,
            f"Hessian-{mode_tag} (OpenCV nonfree disabled)",
        )


def create_query_transform(img_gray: np.ndarray) -> np.ndarray:
    """Creates a rotated (25 deg) & scaled (0.85x) test target for 2-image matching."""
    h, w = img_gray.shape
    center = (w / 2.0, h / 2.0)
    rot_mat = cv2.getRotationMatrix2D(center, 25.0, 0.85)
    return cv2.warpAffine(
        img_gray, rot_mat, (w, h), borderMode=cv2.BORDER_CONSTANT, borderValue=0
    )


def match_features(
    img1_gray: np.ndarray,
    img2_gray: np.ndarray,
    algo: str,
    hessian_threshold: int,
    upright: bool,
    orb_nfeatures: int,
):
    """Computes and visualizes feature matches between two images using BFMatcher."""
    algo_lower = algo.lower()
    if algo_lower == "orb":
        orb = cv2.ORB_create(nfeatures=orb_nfeatures)
        kp1, des1 = orb.detectAndCompute(img1_gray, None)
        kp2, des2 = orb.detectAndCompute(img2_gray, None)
        if des1 is None or des2 is None or len(kp1) == 0 or len(kp2) == 0:
            matched_img = cv2.hconcat(
                [
                    cv2.cvtColor(img1_gray, cv2.COLOR_GRAY2BGR),
                    cv2.cvtColor(img2_gray, cv2.COLOR_GRAY2BGR),
                ]
            )
            return matched_img, 0, "Hamming (ORB)"

        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = sorted(bf.match(des1, des2), key=lambda m: m.distance)
        good_matches = matches[:40]
        matched_img = cv2.drawMatches(
            img1_gray,
            kp1,
            img2_gray,
            kp2,
            good_matches,
            None,
            flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS,
        )
        return matched_img, len(good_matches), "Hamming (ORB)"

    if algo_lower == "sift":
        sift = cv2.SIFT_create()
        kp1, des1 = sift.detectAndCompute(img1_gray, None)
        kp2, des2 = sift.detectAndCompute(img2_gray, None)
        dist_label = "L2 + Ratio Test (SIFT)"
    else:
        kp1, des1, _ = run_surf_detector(
            img1_gray, hessian_threshold=hessian_threshold, upright=upright
        )
        kp2, des2, _ = run_surf_detector(
            img2_gray, hessian_threshold=hessian_threshold, upright=upright
        )
        dist_label = "L2 + Ratio Test (U-SURF)" if upright else "L2 + Ratio Test (SURF)"

    if des1 is None or des2 is None or len(kp1) < 2 or len(kp2) < 2:
        matched_img = cv2.hconcat(
            [
                cv2.cvtColor(img1_gray, cv2.COLOR_GRAY2BGR),
                cv2.cvtColor(img2_gray, cv2.COLOR_GRAY2BGR),
            ]
        )
        return matched_img, 0, dist_label

    bf = cv2.BFMatcher(cv2.NORM_L2)
    knn_matches = bf.knnMatch(des1, des2, k=2)
    good_matches = []
    for pair in knn_matches:
        if len(pair) == 2:
            m, n = pair
            if m.distance < 0.75 * n.distance:
                good_matches.append(m)

    good_matches = sorted(good_matches, key=lambda m: m.distance)[:45]
    matched_img = cv2.drawMatches(
        img1_gray,
        kp1,
        img2_gray,
        kp2,
        good_matches,
        None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS,
    )
    return matched_img, len(good_matches), dist_label


@router.post("/process")
async def process_lab04(
    file: UploadFile = File(...),
    file2: Optional[UploadFile] = File(None),
    hessian_threshold: int = Form(400),
    upright: bool = Form(False),
    draw_rich: bool = Form(True),
    orb_nfeatures: int = Form(500),
    matcher_algo: str = Form("surf"),
):
    """
    Executes Lab 04 pipeline:
    1. SURF (or Hessian-SURF fallback) keypoint detection with configurable Hessian threshold & U-SURF mode
    2. SIFT feature detection comparison
    3. ORB feature detection comparison
    4. Two-image BFMatcher descriptor matching
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_gray = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    if img_gray is None:
        raise HTTPException(status_code=400, detail="Invalid primary image file.")

    # Resize very large uploads for responsive interactive lab performance
    h, w = img_gray.shape
    max_dim = 900
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img_gray = cv2.resize(img_gray, (int(w * scale), int(h * scale)))
        h, w = img_gray.shape

    safe_hessian = max(50, min(2000, int(hessian_threshold)))
    safe_orb_n = max(50, min(2000, int(orb_nfeatures)))
    kp_flag = (
        cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
        if draw_rich
        else cv2.DRAW_MATCHES_FLAGS_DEFAULT
    )

    # 1. SURF Feature Detection
    t0 = time.perf_counter()
    surf_kp, surf_des, surf_engine = run_surf_detector(
        img_gray, hessian_threshold=safe_hessian, upright=upright
    )
    surf_ms = round((time.perf_counter() - t0) * 1000.0, 2)
    img_surf = cv2.drawKeypoints(img_gray, surf_kp, None, (255, 0, 0), kp_flag)

    # 2. SIFT Feature Detection
    t0 = time.perf_counter()
    sift = cv2.SIFT_create()
    sift_kp, sift_des = sift.detectAndCompute(img_gray, None)
    sift_ms = round((time.perf_counter() - t0) * 1000.0, 2)
    img_sift = cv2.drawKeypoints(img_gray, sift_kp, None, (0, 200, 80), kp_flag)

    # 3. ORB Feature Detection
    t0 = time.perf_counter()
    orb = cv2.ORB_create(nfeatures=safe_orb_n)
    orb_kp, orb_des = orb.detectAndCompute(img_gray, None)
    orb_ms = round((time.perf_counter() - t0) * 1000.0, 2)
    img_orb = cv2.drawKeypoints(img_gray, orb_kp, None, (0, 140, 255), kp_flag)

    # 4. Feature Matching (Image 1 vs Image 2 or Auto-Transformed Query)
    query_mode = "Auto Transformed Query (25 deg, 0.85x)"
    img2_gray = None
    if file2 is not None:
        contents2 = await file2.read()
        if contents2:
            nparr2 = np.frombuffer(contents2, np.uint8)
            decoded2 = cv2.imdecode(nparr2, cv2.IMREAD_GRAYSCALE)
            if decoded2 is not None:
                h2, w2 = decoded2.shape
                if max(h2, w2) > max_dim:
                    scale2 = max_dim / float(max(h2, w2))
                    decoded2 = cv2.resize(decoded2, (int(w2 * scale2), int(h2 * scale2)))
                img2_gray = decoded2
                query_mode = "Uploaded Query Image 2"

    if img2_gray is None:
        img2_gray = create_query_transform(img_gray)

    img_matches, match_count, matcher_label = match_features(
        img_gray,
        img2_gray,
        algo=matcher_algo,
        hessian_threshold=safe_hessian,
        upright=upright,
        orb_nfeatures=safe_orb_n,
    )

    surf_desc_dim = f"{surf_des.shape[1]}-D float32" if surf_des is not None else "0"
    sift_desc_dim = f"{sift_des.shape[1]}-D float32" if sift_des is not None else "0"
    orb_desc_dim = f"{orb_des.shape[1]}-B uint8" if orb_des is not None else "0"

    return {
        "images": {
            "surf": encode_image_to_base64(img_surf),
            "sift": encode_image_to_base64(img_sift),
            "orb": encode_image_to_base64(img_orb),
            "matches": encode_image_to_base64(img_matches),
        },
        "metadata": {
            "width": w,
            "height": h,
            "surf_kp": len(surf_kp),
            "sift_kp": len(sift_kp),
            "orb_kp": len(orb_kp),
            "surf_ms": surf_ms,
            "sift_ms": sift_ms,
            "orb_ms": orb_ms,
            "surf_desc": surf_desc_dim,
            "sift_desc": sift_desc_dim,
            "orb_desc": orb_desc_dim,
            "surf_engine": surf_engine,
            "upright": upright,
            "hessian_threshold": safe_hessian,
            "match_count": match_count,
            "matcher_label": matcher_label,
            "query_mode": query_mode,
        },
    }


def surf_feature_detection_lab(image_path: str):
    """Standalone Python CLI matching Laboratory Exercise No. 4 Activity Steps."""
    import matplotlib.pyplot as plt

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print(f"Error loading image: {image_path}")
        return

    hessian_threshold = 400
    keypoints, descriptors, engine = run_surf_detector(
        img, hessian_threshold=hessian_threshold, upright=False
    )
    print(f"[{engine}] Number of keypoints detected: {len(keypoints)}")

    img_keypoints = cv2.drawKeypoints(
        img, keypoints, None, (255, 0, 0), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
    )

    sift = cv2.SIFT_create()
    sift_kp, _ = sift.detectAndCompute(img, None)
    img_sift = cv2.drawKeypoints(
        img, sift_kp, None, (0, 255, 0), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
    )

    orb = cv2.ORB_create(nfeatures=500)
    orb_kp, _ = orb.detectAndCompute(img, None)
    img_orb = cv2.drawKeypoints(
        img, orb_kp, None, (0, 128, 255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
    )

    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    axes[0].imshow(cv2.cvtColor(img_keypoints, cv2.COLOR_BGR2RGB))
    axes[0].set_title(f"SURF ({len(keypoints)} keypoints)")
    axes[0].axis("off")

    axes[1].imshow(cv2.cvtColor(img_sift, cv2.COLOR_BGR2RGB))
    axes[1].set_title(f"SIFT ({len(sift_kp)} keypoints)")
    axes[1].axis("off")

    axes[2].imshow(cv2.cvtColor(img_orb, cv2.COLOR_BGR2RGB))
    axes[2].set_title(f"ORB ({len(orb_kp)} keypoints)")
    axes[2].axis("off")

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "sample_image.jpg"
    surf_feature_detection_lab(target)
