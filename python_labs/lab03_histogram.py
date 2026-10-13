"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 03: Histogram Analysis & Equalization
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt

def main():
    img_bgr = cv2.imread('sample.jpg')
    if img_bgr is None:
        # Create dark low-contrast sample
        img_bgr = np.random.randint(40, 110, (400, 400, 3), dtype=np.uint8)

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Global Histogram Equalization (GHE)
    equalized_global = cv2.equalizeHist(gray)

    # 2. Contrast Limited Adaptive Histogram Equalization (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    equalized_clahe = clahe.apply(gray)

    # Compute histograms
    hist_orig = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist_ghe = cv2.calcHist([equalized_global], [0], None, [256], [0, 256])
    hist_clahe = cv2.calcHist([equalized_clahe], [0], None, [256], [0, 256])

    # Plot images and their respective histograms
    fig, axes = plt.subplots(2, 3, figsize=(14, 8))
    axes[0, 0].imshow(gray, cmap='gray'); axes[0, 0].set_title('Original Image (Low Contrast)')
    axes[0, 1].imshow(equalized_global, cmap='gray'); axes[0, 1].set_title('Global Histogram Equalization')
    axes[0, 2].imshow(equalized_clahe, cmap='gray'); axes[0, 2].set_title('Adaptive CLAHE Equalization')

    axes[1, 0].plot(hist_orig, color='black'); axes[1, 0].set_title('Original Histogram')
    axes[1, 1].plot(hist_ghe, color='blue'); axes[1, 1].set_title('Global Equalized Histogram')
    axes[1, 2].plot(hist_clahe, color='green'); axes[1, 2].set_title('CLAHE Histogram')

    for ax in axes[0, :]: ax.axis('off')
    for ax in axes[1, :]: ax.set_xlim([0, 256]); ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
