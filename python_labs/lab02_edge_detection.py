"""
CSST 106 - Perception and Computer Vision
Laboratory Exercise No. 2: Edge Detection Technique
Laguna State Polytechnic University (LSPU) - AY 2026-2027

Topic: Sobel and Canny Edge Detection Algorithms
Author: Kean Gabriel Salvahan (BSCS 4B)
"""

import base64
import sys
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/lab02", tags=["Lab 02 - Edge Detection"])


def encode_image_to_base64(img_ndarray: np.ndarray) -> str:
    """Encodes an OpenCV image to base64 JPEG format."""
    success, buffer = cv2.imencode(".jpg", img_ndarray)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"


@router.post("/process")
async def process_lab02(
    file: UploadFile = File(...),
    gaussian_ksize: int = Form(3),     # Kernel size for Gaussian blur (1, 3, 5, 7)
    sobel_ksize: int = Form(3),        # Aperture size for Sobel (1, 3, 5, 7)
    canny_low: int = Form(100),        # Canny hysteresis lower threshold
    canny_high: int = Form(200),       # Canny hysteresis upper threshold
    sobel_mode: str = Form("combined"),# 'combined', 'horizontal', 'vertical'
    inverted: bool = Form(False)       # True = black edges on white; False = white on black
):
    """
    Executes Gaussian blur, Sobel gradient estimation, and Canny edge detection.
    Returns all 3 representation maps for side-by-side comparison.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    height, width, _ = img_bgr.shape

    # 1. Convert to Grayscale
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 2. Apply Gaussian Blur to reduce high-frequency noise
    g_k = max(1, gaussian_ksize)
    if g_k % 2 == 0:
        g_k += 1  # Kernel must be odd
    
    if g_k > 1:
        img_blur = cv2.GaussianBlur(img_gray, (g_k, g_k), 0)
    else:
        img_blur = img_gray.copy()

    # 3. Sobel Edge Detection (detects edges along x and y gradient directions)
    s_k = max(1, min(7, sobel_ksize))
    if s_k % 2 == 0:
        s_k += 1

    sobelx = cv2.Sobel(img_blur, cv2.CV_64F, 1, 0, ksize=s_k)
    sobely = cv2.Sobel(img_blur, cv2.CV_64F, 0, 1, ksize=s_k)

    # Compute magnitude
    sobel_magnitude = cv2.magnitude(sobelx, sobely)
    
    # Scale to 8-bit unsigned integer [0, 255]
    max_val = np.max(sobel_magnitude)
    if max_val > 0:
        sobel_norm = np.uint8(255 * (sobel_magnitude / max_val))
    else:
        sobel_norm = np.zeros_like(img_gray, dtype=np.uint8)

    # Individual directional gradient representations
    sobelx_abs = cv2.convertScaleAbs(sobelx)
    sobely_abs = cv2.convertScaleAbs(sobely)

    if sobel_mode == "horizontal":
        selected_sobel = sobelx_abs
    elif sobel_mode == "vertical":
        selected_sobel = sobely_abs
    else:
        selected_sobel = sobel_norm

    # 4. Canny Edge Detection (detects strong edges using gradient and thresholding)
    c_low = max(0, min(255, canny_low))
    c_high = max(0, min(255, canny_high))
    if c_low > c_high:
        c_low, c_high = c_high, c_low

    edges_canny = cv2.Canny(img_blur, c_low, c_high)

    # Optional inversion (useful for sketch / comic appearance)
    if inverted:
        selected_sobel = cv2.bitwise_not(selected_sobel)
        edges_canny = cv2.bitwise_not(edges_canny)

    # Calculate Edge Density Metrics
    canny_edge_pixels = int(np.count_nonzero(edges_canny if not inverted else cv2.bitwise_not(edges_canny)))
    total_pixels = height * width
    canny_density = round((canny_edge_pixels / total_pixels) * 100, 2)

    sobel_thresholded = sobel_norm > 40
    sobel_density = round((int(np.count_nonzero(sobel_thresholded)) / total_pixels) * 100, 2)

    # Encode images to Base64
    original_b64 = encode_image_to_base64(img_bgr)
    gray_b64 = encode_image_to_base64(img_gray)
    blur_b64 = encode_image_to_base64(img_blur)
    sobel_combined_b64 = encode_image_to_base64(selected_sobel)
    sobel_x_b64 = encode_image_to_base64(cv2.bitwise_not(sobelx_abs) if inverted else sobelx_abs)
    sobel_y_b64 = encode_image_to_base64(cv2.bitwise_not(sobely_abs) if inverted else sobely_abs)
    canny_b64 = encode_image_to_base64(edges_canny)

    return {
        "metadata": {
            "width": width,
            "height": height,
            "shape": f"({height}, {width})",
            "gaussian_ksize": f"{g_k}x{g_k}",
            "sobel_ksize": s_k,
            "canny_thresholds": f"({c_low}, {c_high})",
            "canny_edge_density": f"{canny_density}%",
            "sobel_edge_density": f"{sobel_density}%",
        },
        "images": {
            "original": original_b64,
            "gray": gray_b64,
            "blur": blur_b64,
            "sobel": sobel_combined_b64,
            "sobel_x": sobel_x_b64,
            "sobel_y": sobel_y_b64,
            "canny": canny_b64,
        }
    }


# ============================================================================
# STANDALONE SCRIPT EXECUTION (Direct Implementation from Lab Sheet)
# ============================================================================

def edge_detection(image_path: str):
    """
    Reference implementation matching Laboratory Activity No. 3 PDF specification.
    Loads image, applies Gaussian blur, computes Sobel and Canny edge maps,
    and displays side-by-side using matplotlib.
    """
    import matplotlib.pyplot as plt

    # Load the image in grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print(f"Error: Image not found or path is incorrect: '{image_path}'")
        return

    # Apply Gaussian blur to reduce noise
    img_blur = cv2.GaussianBlur(img, (3, 3), 0)

    # Sobel edge detection (detects edges along x and y gradient directions)
    sobelx = cv2.Sobel(img_blur, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(img_blur, cv2.CV_64F, 0, 1, ksize=3)
    sobel_combined = cv2.magnitude(sobelx, sobely)

    # Canny edge detection (detects strong edges using gradient and thresholding)
    edges_canny = cv2.Canny(img_blur, 100, 200)

    # Display results using matplotlib
    plt.figure(figsize=(12, 6))

    plt.subplot(1, 3, 1)
    plt.imshow(img, cmap="gray")
    plt.title("Original Image")
    plt.axis("off")

    plt.subplot(1, 3, 2)
    plt.imshow(sobel_combined, cmap="gray")
    plt.title("Sobel Edge Detection")
    plt.axis("off")

    plt.subplot(1, 3, 3)
    plt.imshow(edges_canny, cmap="gray")
    plt.title("Canny Edge Detection")
    plt.axis("off")

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    test_image = sys.argv[1] if len(sys.argv) > 1 else "public/sample-images/gear.png"
    print(f"Executing Lab Activity 2 on '{test_image}'...")
    edge_detection(test_image)

