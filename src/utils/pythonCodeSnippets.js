// Embedded Python OpenCV companion code snippets for CodeViewer

export const PYTHON_SNIPPETS = {
  'lab-01': {
    filename: 'python_labs/lab01_images.py',
    code: `import base64
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/lab01", tags=["Lab 01 - Images"])

def encode_image_to_base64(img_ndarray: np.ndarray) -> str:
    """Encodes an OpenCV image to base64 JPEG format."""
    success, buffer = cv2.imencode(".jpg", img_ndarray)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

@router.post("/process")
async def process_lab01(
    file: UploadFile = File(...),
    action: str = Form("inspect"),       # inspect, grayscale, crop, resize, rotate, modify_pixel
    pixel_x: int = Form(0),
    pixel_y: int = Form(0),
    new_color: str = Form("0,255,0"),    # B,G,R format e.g. green: 0,255,0
    crop_x1: int = Form(0),
    crop_y1: int = Form(0),
    crop_x2: int = Form(100),
    crop_y2: int = Form(100),
    resize_scale: float = Form(0.5),     # scale factor
):
    # 1. Read uploaded image using OpenCV
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    height, width, channels = img.shape
    metadata = {
        "height": height,
        "width": width,
        "channels": channels,
        "shape": f"({height}, {width}, {channels})",
        "color_order": "BGR (OpenCV standard: Blue, Green, Red)",
    }

    processed_img = img.copy()
    inspected_pixel = None

    # Safe coordinate clamping for pixel inspection
    safe_x = min(max(0, pixel_x), width - 1)
    safe_y = min(max(0, pixel_y), height - 1)
    b, g, r = img[safe_y, safe_x].tolist()
    inspected_pixel = {
        "x": safe_x,
        "y": safe_y,
        "bgr": [b, g, r],
        "rgb": [r, g, b],
    }

    # 2. Execute selected operations
    if action == "grayscale":
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        processed_img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    elif action == "modify_pixel":
        try:
            b_val, g_val, r_val = map(int, new_color.split(","))
            cv2.rectangle(
                processed_img,
                (max(0, safe_x - 7), max(0, safe_y - 7)),
                (min(width - 1, safe_x + 7), min(height - 1, safe_y + 7)),
                (b_val, g_val, r_val),
                -1,
            )
        except Exception:
            processed_img[safe_y, safe_x] = [0, 255, 0]

    elif action == "crop":
        x1, x2 = sorted([max(0, min(crop_x1, width)), max(0, min(crop_x2, width))])
        y1, y2 = sorted([max(0, min(crop_y1, height)), max(0, min(crop_y2, height))])
        if x2 - x1 > 0 and y2 - y1 > 0:
            processed_img = img[y1:y2, x1:x2]

    elif action == "resize":
        new_w = max(1, int(width * resize_scale))
        new_h = max(1, int(height * resize_scale))
        processed_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    elif action == "rotate":
        processed_img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

    processed_h, processed_w = processed_img.shape[:2]
    return {
        "metadata": metadata,
        "inspected_pixel": inspected_pixel,
        "processed_dimensions": f"{processed_w}x{processed_h}",
        "processed_image_base64": encode_image_to_base64(processed_img),
    }`
  },
  'lab-02': {
    filename: 'python_labs/lab02_edge_detection.py',
    code: `"""
CSST 106 - Perception and Computer Vision
Laboratory Exercise No. 2: Edge Detection Technique (Sobel & Canny)
Laguna State Polytechnic University (LSPU) - AY 2026-2027
"""

import cv2
import matplotlib.pyplot as plt
import numpy as np

def edge_detection(image_path):
    # 1. Load the image in grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print("Error: Image not found or path is incorrect.")
        return

    # 2. Apply Gaussian blur to reduce noise
    img_blur = cv2.GaussianBlur(img, (3, 3), 0)

    # 3. Sobel edge detection (detects edges along x and y gradient directions)
    sobelx = cv2.Sobel(img_blur, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(img_blur, cv2.CV_64F, 0, 1, ksize=3)
    sobel_combined = cv2.magnitude(sobelx, sobely)

    # 4. Canny edge detection (detects strong edges using gradient and thresholding)
    edges_canny = cv2.Canny(img_blur, 100, 200)

    # 5. Display results side by side using matplotlib
    plt.figure(figsize=(12, 6))

    plt.subplot(1, 3, 1)
    plt.imshow(img, cmap='gray')
    plt.title('Original Image')
    plt.axis('off')

    plt.subplot(1, 3, 2)
    plt.imshow(sobel_combined, cmap='gray')
    plt.title('Sobel Edge Detection')
    plt.axis('off')

    plt.subplot(1, 3, 3)
    plt.imshow(edges_canny, cmap='gray')
    plt.title('Canny Edge Detection')
    plt.axis('off')

    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    # Replace 'input.jpg' with the path to your image file
    edge_detection('input.jpg')`
  }
};
