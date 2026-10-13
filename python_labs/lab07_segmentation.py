"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 07: Image Segmentation (Otsu & K-Means)
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt

def main():
    img_bgr = cv2.imread('sample.jpg')
    if img_bgr is None:
        img_bgr = np.zeros((400, 400, 3), dtype=np.uint8)
        cv2.circle(img_bgr, (150, 150), 80, (0, 0, 255), -1)      # Red circle
        cv2.rectangle(img_bgr, (220, 200), (350, 350), (0, 255, 0), -1) # Green square

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Otsu's Automatic Thresholding
    val, otsu_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    print(f"[Lab 07] Otsu Optimal Threshold Computed: {val}")

    # 2. K-Means Color Clustering
    # Reshape image into 2D array of RGB pixels
    pixel_vals = img_rgb.reshape((-1, 3))
    pixel_vals = np.float32(pixel_vals)

    # Criteria: Stop after 100 iterations or epsilon < 0.2
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    k = 4  # Number of clusters
    _, labels, centers = cv2.kmeans(pixel_vals, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    # Convert back to 8-bit values
    centers = np.uint8(centers)
    segmented_data = centers[labels.flatten()]
    segmented_image = segmented_data.reshape(img_rgb.shape)

    # Plot comparisons
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    axes[0].imshow(img_rgb); axes[0].set_title('Original RGB')
    axes[1].imshow(otsu_mask, cmap='gray'); axes[1].set_title(f'Otsu Binarization (Threshold: {int(val)})')
    axes[2].imshow(segmented_image); axes[2].set_title(f'K-Means Clustering (k={k} Colors)')

    for ax in axes: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
