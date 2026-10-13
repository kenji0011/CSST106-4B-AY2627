// Embedded Python OpenCV companion code snippets for CodeViewer

export const PYTHON_SNIPPETS = {
  'lab-01': {
    filename: 'python_labs/lab01_images.py',
    code: `"""
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
    img_bgr = cv2.imread('sample.jpg')
    if img_bgr is None:
        img_bgr = np.zeros((400, 400, 3), dtype=np.uint8)
        cv2.circle(img_bgr, (200, 200), 120, (0, 255, 255), -1)

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    height, width, channels = img_rgb.shape
    print(f"[Lab 01] Loaded: {width}x{height}, Channels: {channels}")

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
    alpha = 1.3  # Contrast scale
    beta = 30    # Brightness bias
    adjusted = cv2.convertScaleAbs(img_rgb, alpha=alpha, beta=beta)

    # 5. Geometric Transformations
    rotated_90 = cv2.rotate(img_rgb, cv2.ROTATE_90_CLOCKWISE)
    flipped_h = cv2.flip(img_rgb, 1)

    # Display results
    fig, axes = plt.subplots(2, 4, figsize=(14, 7))
    axes[0, 0].imshow(img_rgb); axes[0, 0].set_title('Original RGB')
    axes[0, 1].imshow(gray, cmap='gray'); axes[0, 1].set_title('Grayscale')
    axes[0, 2].imshow(hsv); axes[0, 2].set_title('HSV Space')
    axes[0, 3].imshow(binary, cmap='gray'); axes[0, 3].set_title('Binarized')
    axes[1, 0].imshow(r_channel, cmap='Reds'); axes[1, 0].set_title('Red Channel')
    axes[1, 1].imshow(g_channel, cmap='Greens'); axes[1, 1].set_title('Green Channel')
    axes[1, 2].imshow(b_channel, cmap='Blues'); axes[1, 2].set_title('Blue Channel')
    axes[1, 3].imshow(adjusted); axes[1, 3].set_title('Contrast & Brightness')

    for ax in axes.flat: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()`
  },

  'lab-02': {
    filename: 'python_labs/lab02_edge_detection.py',
    code: `"""
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
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 1.4)

    # 1. Sobel Operator
    sobel_x = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = cv2.magnitude(sobel_x, sobel_y)
    sobel_mag = np.uint8(np.clip(sobel_mag, 0, 255))

    # 2. Prewitt Operator (Convolution Kernels)
    kernel_px = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
    kernel_py = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
    prewitt_x = cv2.filter2D(blurred, cv2.CV_64F, kernel_px)
    prewitt_y = cv2.filter2D(blurred, cv2.CV_64F, kernel_py)
    prewitt_mag = cv2.magnitude(prewitt_x, prewitt_y)
    prewitt_mag = np.uint8(np.clip(prewitt_mag, 0, 255))

    # 3. Laplacian Operator (2nd Order Isotropic)
    laplacian = cv2.Laplacian(blurred, cv2.CV_64F, ksize=3)
    laplacian_abs = np.uint8(np.clip(np.absolute(laplacian), 0, 255))

    # 4. Canny Edge Detector (Hysteresis & Non-Maximum Suppression)
    canny = cv2.Canny(blurred, threshold1=50, threshold2=150)

    # Display Comparisons
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
    main()`
  },

  'lab-03': {
    filename: 'python_labs/lab03_histogram.py',
    code: `"""
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
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Global Histogram Equalization (GHE via CDF)
    equalized_global = cv2.equalizeHist(gray)

    # 2. Adaptive CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    equalized_clahe = clahe.apply(gray)

    # 3. Compute 256-bin histograms
    hist_orig = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist_ghe = cv2.calcHist([equalized_global], [0], None, [256], [0, 256])
    hist_clahe = cv2.calcHist([equalized_clahe], [0], None, [256], [0, 256])

    # Plot Visual Distribution
    fig, axes = plt.subplots(2, 3, figsize=(14, 8))
    axes[0, 0].imshow(gray, cmap='gray'); axes[0, 0].set_title('Original Input')
    axes[0, 1].imshow(equalized_global, cmap='gray'); axes[0, 1].set_title('Global Equalization (GHE)')
    axes[0, 2].imshow(equalized_clahe, cmap='gray'); axes[0, 2].set_title('Adaptive CLAHE')

    axes[1, 0].plot(hist_orig, color='black'); axes[1, 0].set_title('Original Histogram')
    axes[1, 1].plot(hist_ghe, color='blue'); axes[1, 1].set_title('GHE Histogram')
    axes[1, 2].plot(hist_clahe, color='green'); axes[1, 2].set_title('CLAHE Histogram')

    for ax in axes[0, :]: ax.axis('off')
    for ax in axes[1, :]: ax.set_xlim([0, 256]); ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()`
  },

  'lab-04': {
    filename: 'python_labs/lab04_surf_features.py',
    code: `"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 04: SURF / Feature Detection & Keypoint Matching
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt

def main():
    img_bgr = cv2.imread('sample.jpg')
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Feature Detector & Descriptor Extractor (ORB / SIFT)
    orb = cv2.ORB_create(nfeatures=500)
    keypoints, descriptors = orb.detectAndCompute(gray, None)

    # 2. Draw keypoints with rich scale circles & orientation rays
    img_keypoints = cv2.drawKeypoints(
        img_bgr, keypoints, None,
        color=(0, 255, 0),
        flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
    )

    # 3. Simulate Affine Transformation & Keypoint Matching
    h, w = gray.shape
    rot_matrix = cv2.getRotationMatrix2D((w/2, h/2), 30, 0.9)
    rotated_gray = cv2.warpAffine(gray, rot_matrix, (w, h))

    kp_rot, des_rot = orb.detectAndCompute(rotated_gray, None)

    # Match descriptors using BFMatcher with Hamming distance
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(descriptors, des_rot) if descriptors is not None and des_rot is not None else []
    matches = sorted(matches, key=lambda x: x.distance)

    # Draw top 30 correspondences
    matched_img = cv2.drawMatches(
        img_bgr, keypoints,
        cv2.cvtColor(rotated_gray, cv2.COLOR_GRAY2BGR), kp_rot,
        matches[:30], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )

    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    axes[0].imshow(cv2.cvtColor(img_keypoints, cv2.COLOR_BGR2RGB))
    axes[0].set_title(f'Detected Keypoints ({len(keypoints)} points)')
    axes[1].imshow(cv2.cvtColor(matched_img, cv2.COLOR_BGR2RGB))
    axes[1].set_title(f'Keypoint Matching ({len(matches)} pairs)')

    for ax in axes: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()`
  },

  'lab-05': {
    filename: 'python_labs/lab05_pca_cv.py',
    code: `"""
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
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # 1. Flatten into 2D Data Matrix
    X = gray.astype(np.float64)

    # 2. Compute Mean & Zero-Center Matrix
    mean = np.mean(X, axis=0)
    X_centered = X - mean

    # 3. Covariance Matrix & Singular Value Decomposition (SVD)
    U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)

    # 4. Low-Rank Approximations with variable top k components
    k_components = [1, 5, 15, 30, 50]
    fig, axes = plt.subplots(2, 3, figsize=(14, 8))
    axes[0, 0].imshow(gray, cmap='gray'); axes[0, 0].set_title(f'Original ({w}x{h})')

    total_variance = np.sum(S ** 2)

    for idx, k in enumerate(k_components, start=1):
        r, c = divmod(idx, 3)
        X_recon = np.dot(U[:, :k] * S[:k], Vt[:k, :]) + mean
        X_recon = np.clip(X_recon, 0, 255).astype(np.uint8)

        var_explained = (np.sum(S[:k] ** 2) / total_variance) * 100
        axes[r, c].imshow(X_recon, cmap='gray')
        axes[r, c].set_title(f'PCA k={k} ({var_explained:.1f}% Variance)')

    for ax in axes.flat: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()`
  },

  'lab-06': {
    filename: 'python_labs/lab06_yolov8.py',
    code: `"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 06: YOLOv8 Real-Time Object Detection
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

import cv2
import matplotlib.pyplot as plt

def main():
    from ultralytics import YOLO

    # 1. Load Pre-Trained YOLOv8 Neural Network
    model = YOLO('yolov8n.pt')

    # 2. Execute Inference
    img_bgr = cv2.imread('sample.jpg')
    results = model.predict(source=img_bgr, conf=0.45, iou=0.5, save=False)
    result = results[0]

    # 3. Visualize Bounding Boxes
    annotated_bgr = result.plot()
    annotated_rgb = cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB)

    print(f"[YOLOv8 Results] Total Detections: {len(result.boxes)}")
    for box in result.boxes:
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        conf = float(box.conf[0])
        print(f" - {cls_name.upper()} ({conf*100:.1f}%) BBox: {box.xyxy[0].tolist()}")

    plt.figure(figsize=(10, 8))
    plt.imshow(annotated_rgb)
    plt.title(f'YOLOv8 Detection ({len(result.boxes)} objects)')
    plt.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()`
  },

  'lab-07': {
    filename: 'python_labs/lab07_segmentation.py',
    code: `"""
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
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Otsu's Automatic Thresholding
    val, otsu_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    print(f"[Lab 07] Otsu Optimal Threshold: {val}")

    # 2. K-Means Color Quantization & Clustering
    pixel_vals = img_rgb.reshape((-1, 3))
    pixel_vals = np.float32(pixel_vals)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    k = 4  # Number of color clusters
    _, labels, centers = cv2.kmeans(pixel_vals, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    centers = np.uint8(centers)
    segmented_data = centers[labels.flatten()]
    segmented_image = segmented_data.reshape(img_rgb.shape)

    # Plot Segmented Regions
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    axes[0].imshow(img_rgb); axes[0].set_title('Original RGB')
    axes[1].imshow(otsu_mask, cmap='gray'); axes[1].set_title(f'Otsu Binarization (Threshold: {int(val)})')
    axes[2].imshow(segmented_image); axes[2].set_title(f'K-Means Clustering (k={k} Clusters)')

    for ax in axes: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()`
  }
};
