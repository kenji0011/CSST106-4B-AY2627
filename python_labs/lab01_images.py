import base64
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
        # Conversion to single-channel intensity
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Convert back to 3-channel BGR for consistent browser encoding
        processed_img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    elif action == "modify_pixel":
        # Draw a visible 15x15 block around the coordinate so change is visible to the naked eye
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
        # ROI Slicing via numpy array indexing [y1:y2, x1:x2]
        x1, x2 = sorted([max(0, min(crop_x1, width)), max(0, min(crop_x2, width))])
        y1, y2 = sorted([max(0, min(crop_y1, height)), max(0, min(crop_y2, height))])
        if x2 - x1 > 0 and y2 - y1 > 0:
            processed_img = img[y1:y2, x1:x2]

    elif action == "resize":
        # Scale dimension modification using bilinear interpolation
        new_w = max(1, int(width * resize_scale))
        new_h = max(1, int(height * resize_scale))
        processed_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    elif action == "rotate":
        # 90 degrees clockwise rotation
        processed_img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)

    # 3. Output payload
    processed_h, processed_w = processed_img.shape[:2]
    return {
        "metadata": metadata,
        "inspected_pixel": inspected_pixel,
        "processed_dimensions": f"{processed_w}x{processed_h}",
        "processed_image_base64": encode_image_to_base64(processed_img),
    }
