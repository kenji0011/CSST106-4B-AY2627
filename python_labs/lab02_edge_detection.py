"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 02: Edge Detection & Spatial Derivatives
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
        cv2.circle(img_bgr, (200, 200), 100, (255, 255, 255), -1)
        cv2.rectangle(img_bgr, (50, 50), (250, 250), (128, 128, 128), -1)

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 1.4)

    # 1. Sobel Operator
    sobel_x = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = cv2.magnitude(sobel_x, sobel_y)
    sobel_mag = np.uint8(np.clip(sobel_mag, 0, 255))

    # 2. Prewitt Operator (Custom Kernels)
    kernel_prewitt_x = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
    kernel_prewitt_y = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
    prewitt_x = cv2.filter2D(blurred, cv2.CV_64F, kernel_prewitt_x)
    prewitt_y = cv2.filter2D(blurred, cv2.CV_64F, kernel_prewitt_y)
    prewitt_mag = cv2.magnitude(prewitt_x, prewitt_y)
    prewitt_mag = np.uint8(np.clip(prewitt_mag, 0, 255))

    # 3. Laplacian Operator (Second-order derivative)
    laplacian = cv2.Laplacian(blurred, cv2.CV_64F, ksize=3)
    laplacian_abs = np.uint8(np.clip(np.absolute(laplacian), 0, 255))

    # 4. Canny Edge Detector (Hysteresis & Non-Maximum Suppression)
    canny = cv2.Canny(blurred, threshold1=50, threshold2=150)

    # Display results
    fig, axes = plt.subplots(2, 3, figsize=(12, 8))
    axes[0, 0].imshow(gray, cmap='gray'); axes[0, 0].set_title('Grayscale Input')
    axes[0, 1].imshow(sobel_x, cmap='gray'); axes[0, 1].set_title('Sobel Gx (Horizontal)')
    axes[0, 2].imshow(sobel_y, cmap='gray'); axes[0, 2].set_title('Sobel Gy (Vertical)')
    axes[1, 0].imshow(sobel_mag, cmap='gray'); axes[1, 0].set_title('Sobel Magnitude')
    axes[1, 1].imshow(laplacian_abs, cmap='gray'); axes[1, 1].set_title('Laplacian of Gaussian')
    axes[1, 2].imshow(canny, cmap='gray'); axes[1, 2].set_title('Canny Edge Detector')

    for ax in axes.flat: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
