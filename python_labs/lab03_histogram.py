"""
CSST 106 - Perception and Computer Vision
Laboratory Exercise No. 3: Histogram Equalization and Contrast Adjustment
Laguna State Polytechnic University (LSPU) - AY 2026-2027

Topic: Global Histogram Equalization, CLAHE, and Contrast Stretching
Author: Kean Gabriel Salvahan (BSCS 4B)
"""

import base64
import sys
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/lab03", tags=["Lab 03 - Histogram Equalization"])


def encode_image_to_base64(img_ndarray: np.ndarray) -> str:
    """Encodes an OpenCV image to base64 JPEG format."""
    success, buffer = cv2.imencode(".jpg", img_ndarray)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"


def compute_histogram_bins(img_gray: np.ndarray) -> list:
    """Computes normalized 256-bin histogram for a single-channel image."""
    hist = cv2.calcHist([img_gray], [0], None, [256], [0, 256]).flatten()
    return [int(val) for val in hist]


@router.post("/process")
async def process_lab03(
    file: UploadFile = File(...),
    color_mode: str = Form("grayscale"),  # 'grayscale' or 'color'
    clip_limit: float = Form(2.0),       # CLAHE clip limit
    grid_size: int = Form(8)             # CLAHE tile grid size (e.g. 8x8)
):
    """
    Computes:
    1. Original Image (Grayscale or Color)
    2. Linear Contrast Stretched Image
    3. Global Histogram Equalized Image (cv2.equalizeHist or YUV luminance channel)
    4. Adaptive Histogram Equalization (CLAHE via cv2.createCLAHE)
    Together with their 256-bin histogram frequency arrays for live charting.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    height, width, _ = img_bgr.shape
    total_pixels = height * width
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Base Image according to color_mode
    if color_mode == "color":
        base_display = img_bgr.copy()
        hist_orig = compute_histogram_bins(img_gray)
    else:
        base_display = img_gray.copy()
        hist_orig = compute_histogram_bins(img_gray)

    # 2. Linear Contrast Stretching (Min-Max Normalization: [0, 255])
    if color_mode == "color":
        # Stretch on YUV Luminance channel
        yuv_stretch = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YUV)
        y_channel = yuv_stretch[:, :, 0]
        y_stretched = cv2.normalize(y_channel, None, 0, 255, cv2.NORM_MINMAX)
        yuv_stretch[:, :, 0] = y_stretched
        img_stretched = cv2.cvtColor(yuv_stretch, cv2.COLOR_YUV2BGR)
        hist_stretched = compute_histogram_bins(y_stretched)
    else:
        img_stretched = cv2.normalize(img_gray, None, 0, 255, cv2.NORM_MINMAX)
        hist_stretched = compute_histogram_bins(img_stretched)

    # 3. Global Histogram Equalization
    if color_mode == "color":
        # Apply cv2.equalizeHist on YUV Y-channel (Luminance) as requested in PDF Part 1.4.b
        yuv_eq = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YUV)
        y_channel = yuv_eq[:, :, 0]
        y_equalized = cv2.equalizeHist(y_channel)
        yuv_eq[:, :, 0] = y_equalized
        img_equalized = cv2.cvtColor(yuv_eq, cv2.COLOR_YUV2BGR)
        hist_equalized = compute_histogram_bins(y_equalized)
    else:
        # Grayscale cv2.equalizeHist (Part 1.4.a)
        img_equalized = cv2.equalizeHist(img_gray)
        hist_equalized = compute_histogram_bins(img_equalized)

    # 4. Adaptive Histogram Equalization (CLAHE)
    safe_grid = max(2, min(32, int(grid_size)))
    safe_clip = max(0.5, min(20.0, float(clip_limit)))
    clahe = cv2.createCLAHE(clipLimit=safe_clip, tileGridSize=(safe_grid, safe_grid))

    if color_mode == "color":
        yuv_clahe = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YUV)
        y_channel = yuv_clahe[:, :, 0]
        y_clahe = clahe.apply(y_channel)
        yuv_clahe[:, :, 0] = y_clahe
        img_clahe = cv2.cvtColor(yuv_clahe, cv2.COLOR_YUV2BGR)
        hist_clahe = compute_histogram_bins(y_clahe)
    else:
        img_clahe = clahe.apply(img_gray)
        hist_clahe = compute_histogram_bins(img_clahe)

    # Contrast & Dynamic Range Metrics
    std_orig = round(float(np.std(img_gray)), 2)
    std_eq = round(float(np.std(y_equalized if color_mode == "color" else img_equalized)), 2)
    std_clahe = round(float(np.std(y_clahe if color_mode == "color" else img_clahe)), 2)

    return {
        "metadata": {
            "width": width,
            "height": height,
            "shape": f"({height}, {width})",
            "total_pixels": total_pixels,
            "color_mode": color_mode,
            "clip_limit": safe_clip,
            "grid_size": f"{safe_grid}×{safe_grid}",
            "std_orig": std_orig,
            "std_eq": std_eq,
            "std_clahe": std_clahe
        },
        "images": {
            "original": encode_image_to_base64(base_display),
            "stretched": encode_image_to_base64(img_stretched),
            "equalized": encode_image_to_base64(img_equalized),
            "clahe": encode_image_to_base64(img_clahe)
        },
        "histograms": {
            "original": hist_orig,
            "stretched": hist_stretched,
            "equalized": hist_equalized,
            "clahe": hist_clahe
        }
    }


# ============================================================================
# STANDALONE SCRIPT EXECUTION (Direct Implementation from Lab Sheet)
# ============================================================================

def histogram_equalization_lab(image_path: str):
    """
    Reference standalone script matching Laboratory Exercise No. 3 specification.
    Loads image, calculates histograms, applies standard equalization & CLAHE,
    and displays side-by-side images with their respective histograms using matplotlib.
    """
    import matplotlib.pyplot as plt

    # 1. Load image in grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print(f"Error: Image not found at path '{image_path}'")
        return

    # 2. Contrast Stretching (Min-Max)
    img_stretched = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX)

    # 3. Global Histogram Equalization
    img_equalized = cv2.equalizeHist(img)

    # 4. Adaptive Histogram Equalization (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_clahe = clahe.apply(img)

    # 5. Display 4 Images + 4 Histograms using Matplotlib
    fig, axes = plt.subplots(2, 4, figsize=(16, 8))

    titles = [
        "Original Image",
        "Linear Contrast Stretched",
        "Global Equalization (HE)",
        "Adaptive Equalization (CLAHE)"
    ]
    images = [img, img_stretched, img_equalized, img_clahe]

    for i in range(4):
        # Top Row: Images
        axes[0, i].imshow(images[i], cmap="gray")
        axes[0, i].set_title(titles[i], fontsize=11, fontweight="bold")
        axes[0, i].axis("off")

        # Bottom Row: Histograms
        axes[1, i].hist(images[i].ravel(), 256, [0, 256], color="#2563eb", alpha=0.75)
        axes[1, i].set_xlim([0, 256])
        axes[1, i].set_title(f"Histogram ({titles[i]})", fontsize=10)
        axes[1, i].grid(True, linestyle="--", alpha=0.5)

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    test_image = sys.argv[1] if len(sys.argv) > 1 else "src/assets/hero.png"
    print(f"Executing Lab Activity 3 Histogram Equalization on '{test_image}'...")
    histogram_equalization_lab(test_image)

