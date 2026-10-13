"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 05: Principal Component Analysis (PCA) in Computer Vision
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt

def main():
    img_bgr = cv2.imread('sample.jpg')
    if img_bgr is None:
        img_bgr = np.zeros((300, 300, 3), dtype=np.uint8)
        cv2.circle(img_bgr, (150, 150), 90, (200, 200, 200), -1)

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # 1. Flatten into 2D data matrix (Rows = image rows, Cols = pixels)
    X = gray.astype(np.float64)

    # 2. Compute Mean and Center the Data
    mean = np.mean(X, axis=0)
    X_centered = X - mean

    # 3. Covariance Matrix & SVD / Eigen-decomposition
    # X_centered = U * S * V^T
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)

    # 4. Reconstruct using variable top k components
    k_components = [1, 5, 15, 30, 50]
    fig, axes = plt.subplots(2, 3, figsize=(14, 8))
    axes[0, 0].imshow(gray, cmap='gray'); axes[0, 0].set_title(f'Original Image ({w}x{h})')

    total_variance = np.sum(S ** 2)

    for idx, k in enumerate(k_components, start=1):
        r, c = divmod(idx, 3)
        # Low rank reconstruction: U[:, :k] * S[:k] * Vt[:k, :] + mean
        X_recon = np.dot(U[:, :k] * S[:k], Vt[:k, :]) + mean
        X_recon = np.clip(X_recon, 0, 255).astype(np.uint8)

        var_explained = (np.sum(S[:k] ** 2) / total_variance) * 100
        axes[r, c].imshow(X_recon, cmap='gray')
        axes[r, c].set_title(f'PCA k={k} ({var_explained:.1f}% Variance)')

    for ax in axes.flat: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
