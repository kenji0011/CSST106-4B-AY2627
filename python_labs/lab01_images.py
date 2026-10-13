"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 01: Image Representation & Fundamental Operations
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt

def main():
    # 1. Image Acquisition & Representation
    img_path = 'sample.jpg'
    img_bgr = cv2.imread(img_path)
    if img_bgr is None:
        # Generate synthetic test image if not found
        img_bgr = np.zeros((400, 400, 3), dtype=np.uint8)
        cv2.circle(img_bgr, (200, 200), 120, (0, 255, 255), -1)
        cv2.rectangle(img_bgr, (80, 80), (320, 320), (255, 0, 128), 4)

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    height, width, channels = img_rgb.shape
    print(f"[Lab 01] Image Loaded: {width}x{height}, Channels: {channels}, Dtype: {img_rgb.dtype}")

    # 2. Color Space Conversions
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY)
    inverted = cv2.bitwise_not(img_rgb)

    # 3. Channel Decomposition
    r_channel = img_rgb[:, :, 0]
    g_channel = img_rgb[:, :, 1]
    b_channel = img_rgb[:, :, 2]

    # 4. Point Operations (Brightness & Contrast)
    alpha = 1.3  # Contrast control (1.0-3.0)
    beta = 30    # Brightness control (0-100)
    adjusted = cv2.convertScaleAbs(img_rgb, alpha=alpha, beta=beta)

    # 5. Geometric Transformations
    rotated_90 = cv2.rotate(img_rgb, cv2.ROTATE_90_CLOCKWISE)
    flipped_h = cv2.flip(img_rgb, 1)

    # Visual Display
    fig, axes = plt.subplots(2, 4, figsize=(14, 7))
    axes[0, 0].imshow(img_rgb); axes[0, 0].set_title('Original RGB')
    axes[0, 1].imshow(gray, cmap='gray'); axes[0, 1].set_title('Grayscale')
    axes[0, 2].imshow(hsv); axes[0, 2].set_title('HSV Space')
    axes[0, 3].imshow(binary, cmap='gray'); axes[0, 3].set_title('Binarized (Threshold 128)')
    axes[1, 0].imshow(r_channel, cmap='Reds'); axes[1, 0].set_title('Red Channel')
    axes[1, 1].imshow(g_channel, cmap='Greens'); axes[1, 1].set_title('Green Channel')
    axes[1, 2].imshow(b_channel, cmap='Blues'); axes[1, 2].set_title('Blue Channel')
    axes[1, 3].imshow(adjusted); axes[1, 3].set_title('Brightness & Contrast')

    for ax in axes.flat: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
