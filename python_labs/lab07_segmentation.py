"""
CSST 106 - Perception and Computer Vision
Laboratory Exercise No. 7 (PDF Exercise 6): Image Segmentation Techniques
Laguna State Polytechnic University (LSPU) - AY 2026-2027

Topic: Thresholding (Otsu & Adaptive), Region-Based (Region Growing & Watershed),
       Edge-Based Contours, and Deep Learning Semantic Segmentation (PASCAL VOC)
Author: Kean Gabriel Salvahan (BSCS 4B)
"""

import base64
import time
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/lab07", tags=["Lab 07 - Segmentation Techniques"])

_SEMANTIC_MODEL = None
_SEMANTIC_WEIGHTS = None

# Distinct RGB palette for 21 PASCAL VOC semantic classes
VOC_PALETTE = np.array(
    [
        [15, 15, 20],     # 0: __background__
        [128, 0, 0],      # 1: aeroplane
        [0, 128, 0],      # 2: bicycle
        [128, 128, 0],    # 3: bird
        [0, 0, 128],      # 4: boat
        [128, 0, 128],    # 5: bottle
        [0, 128, 128],    # 6: bus
        [128, 128, 128],  # 7: car
        [64, 0, 0],       # 8: cat
        [192, 0, 0],      # 9: chair
        [64, 128, 0],     # 10: cow
        [192, 128, 0],    # 11: diningtable
        [64, 0, 128],     # 12: dog
        [192, 0, 128],    # 13: horse
        [64, 128, 128],   # 14: motorbike
        [59, 130, 246],   # 15: person (crisp blue)
        [0, 64, 0],       # 16: pottedplant
        [128, 64, 0],     # 17: sheep
        [0, 192, 0],      # 18: sofa
        [128, 192, 0],    # 19: train
        [0, 64, 128],     # 20: tvmonitor
    ],
    dtype=np.uint8,
)


def encode_image_to_base64(img_ndarray: np.ndarray) -> str:
    """Encodes an OpenCV image to base64 JPEG format."""
    success, buffer = cv2.imencode(".jpg", img_ndarray)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"


def get_semantic_model():
    """Lazily loads and caches torchvision LRASPP MobileNetV3 (PASCAL VOC)."""
    global _SEMANTIC_MODEL, _SEMANTIC_WEIGHTS
    if _SEMANTIC_MODEL is None:
        from torchvision.models.segmentation import (
            LRASPP_MobileNet_V3_Large_Weights,
            lraspp_mobilenet_v3_large,
        )

        _SEMANTIC_WEIGHTS = LRASPP_MobileNet_V3_Large_Weights.DEFAULT
        _SEMANTIC_MODEL = lraspp_mobilenet_v3_large(weights=_SEMANTIC_WEIGHTS).eval()
    return _SEMANTIC_MODEL, _SEMANTIC_WEIGHTS


def run_semantic_segmentation(img_bgr: np.ndarray):
    """Runs PyTorch LRASPP MobileNetV3 semantic segmentation on PASCAL VOC 21 classes."""
    import torch
    from PIL import Image

    model, weights = get_semantic_model()
    preprocess = weights.transforms()
    categories = weights.meta["categories"]

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    input_tensor = preprocess(pil_img).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)["out"][0]
    pred_mask = output.argmax(0).cpu().numpy().astype(np.uint8)

    h, w = img_bgr.shape[:2]
    pred_resized = cv2.resize(pred_mask, (w, h), interpolation=cv2.INTER_NEAREST)

    color_mask_rgb = VOC_PALETTE[np.clip(pred_resized, 0, len(VOC_PALETTE) - 1)]
    color_mask_bgr = cv2.cvtColor(color_mask_rgb, cv2.COLOR_RGB2BGR)
    blended = cv2.addWeighted(img_bgr, 0.45, color_mask_bgr, 0.55, 0)

    total_px = float(h * w)
    unique_ids, counts = np.unique(pred_resized, return_counts=True)
    detected_classes = []
    for cid, cnt in zip(unique_ids, counts):
        pct = round((float(cnt) / total_px) * 100.0, 1)
        if int(cid) == 0 or pct < 0.5:
            continue
        label = categories[int(cid)] if int(cid) < len(categories) else f"class_{cid}"
        detected_classes.append({"id": int(cid), "name": label, "coverage_pct": pct})

    detected_classes.sort(key=lambda c: c["coverage_pct"], reverse=True)
    return blended, detected_classes, "PyTorch LRASPP MobileNetV3 (PASCAL VOC)"


@router.post("/process")
async def process_lab07(
    file: UploadFile = File(...),
    adaptive_block: int = Form(11),
    seed_x: int = Form(-1),
    seed_y: int = Form(-1),
    region_tolerance: int = Form(22),
    canny_low: int = Form(80),
    canny_high: int = Form(180),
):
    """
    Executes all 4 Lab 07 segmentation categories:
    1. Thresholding: Global Otsu & Adaptive Gaussian Thresholding
    2. Region-Based: Seeded Region Growing & Watershed Algorithm
    3. Edge-Based: Canny Edges + Closed Contours
    4. Semantic Segmentation: PyTorch LRASPP MobileNetV3 (PASCAL VOC)
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    h, w = img_bgr.shape[:2]
    max_dim = 720
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)))
        h, w = img_bgr.shape[:2]

    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blur_gray = cv2.GaussianBlur(img_gray, (5, 5), 0)

    # 1a. Global Otsu Thresholding
    otsu_val, img_otsu = cv2.threshold(
        blur_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # 1b. Adaptive Thresholding (non-uniform illumination)
    blk = max(3, int(adaptive_block))
    if blk % 2 == 0:
        blk += 1
    img_adaptive = cv2.adaptiveThreshold(
        blur_gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blk,
        4,
    )

    # 2a. Seeded Region Growing (cv2.floodFill around seed)
    sx = (w // 2) if seed_x < 0 or seed_x >= w else int(seed_x)
    sy = (h // 2) if seed_y < 0 or seed_y >= h else int(seed_y)
    tol = max(3, min(100, int(region_tolerance)))

    flood_mask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(
        blur_gray.copy(),
        flood_mask,
        (sx, sy),
        255,
        loDiff=tol,
        upDiff=tol,
        flags=4 | (255 << 8) | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE,
    )
    region_mask = flood_mask[1:-1, 1:-1]
    region_pct = round((float(np.count_nonzero(region_mask)) / float(h * w)) * 100.0, 1)

    img_region = img_bgr.copy()
    overlay_blue = np.zeros_like(img_bgr)
    overlay_blue[:, :] = (246, 130, 59)  # Blue highlight in BGR
    mask_bool = region_mask > 0
    img_region[mask_bool] = cv2.addWeighted(img_bgr, 0.35, overlay_blue, 0.65, 0)[mask_bool]
    cv2.circle(img_region, (sx, sy), 6, (0, 255, 255), -1)
    cv2.circle(img_region, (sx, sy), 7, (0, 0, 0), 2)

    # 2b. Watershed Segmentation (for separating touching regions)
    kernel = np.ones((3, 3), np.uint8)
    opening = cv2.morphologyEx(img_otsu, cv2.MORPH_OPEN, kernel, iterations=2)
    sure_bg = cv2.dilate(opening, kernel, iterations=3)
    dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
    _, sure_fg = cv2.threshold(
        dist_transform, 0.35 * max(1e-5, float(dist_transform.max())), 255, 0
    )
    sure_fg = np.uint8(sure_fg)
    unknown = cv2.subtract(sure_bg, sure_fg)
    num_labels, markers = cv2.connectedComponents(sure_fg)
    markers = markers + 1
    markers[unknown == 255] = 0
    markers = cv2.watershed(img_bgr.copy(), markers)

    img_watershed = img_bgr.copy()
    # Colorize watershed basins and draw boundary lines
    rng = np.random.default_rng(42)
    basin_colors = rng.integers(40, 230, size=(max(2, num_labels + 2), 3), dtype=np.uint8)
    basin_colors[0] = [20, 20, 25]
    basin_colors[1] = [30, 30, 40]
    valid_markers = np.clip(markers, 0, len(basin_colors) - 1)
    ws_colored = basin_colors[valid_markers]
    img_watershed = cv2.addWeighted(img_bgr, 0.45, ws_colored, 0.55, 0)
    img_watershed[markers == -1] = [0, 255, 255]  # Watershed boundaries

    # 3. Edge-Based Segmentation (Canny + Closed Contours)
    edges = cv2.Canny(blur_gray, int(canny_low), int(canny_high))
    closed_edges = cv2.morphologyEx(
        edges, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    )
    contours, _ = cv2.findContours(closed_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    significant_contours = [c for c in contours if cv2.contourArea(c) > (h * w * 0.004)]

    img_contours = img_bgr.copy()
    contour_overlay = np.zeros_like(img_bgr)
    for idx, cnt in enumerate(significant_contours):
        c_color = tuple(int(v) for v in rng.integers(60, 240, size=3))
        cv2.drawContours(contour_overlay, [cnt], -1, c_color, -1)
        cv2.drawContours(img_contours, [cnt], -1, (0, 255, 160), 2)
    img_contours = cv2.addWeighted(img_contours, 0.65, contour_overlay, 0.35, 0)

    # 4. Semantic Segmentation (PyTorch LRASPP PASCAL VOC)
    t0 = time.perf_counter()
    try:
        img_semantic, semantic_classes, semantic_engine = run_semantic_segmentation(img_bgr)
    except Exception:
        # Fallback K-Means segmentation if torch fails
        z = img_bgr.reshape((-1, 3)).astype(np.float32)
        _, lbls, centers = cv2.kmeans(
            z, 4, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0), 3, cv2.KMEANS_RANDOM_CENTERS
        )
        img_semantic = np.uint8(centers)[lbls.flatten()].reshape(img_bgr.shape)
        semantic_classes = []
        semantic_engine = "OpenCV K-Means Fallback"
    semantic_ms = round((time.perf_counter() - t0) * 1000.0, 1)

    return {
        "images": {
            "original": encode_image_to_base64(img_bgr),
            "otsu": encode_image_to_base64(img_otsu),
            "adaptive": encode_image_to_base64(img_adaptive),
            "region_growing": encode_image_to_base64(img_region),
            "watershed": encode_image_to_base64(img_watershed),
            "edge_contours": encode_image_to_base64(img_contours),
            "semantic": encode_image_to_base64(img_semantic),
        },
        "metrics": {
            "width": w,
            "height": h,
            "otsu_threshold": round(float(otsu_val), 1),
            "adaptive_block": blk,
            "seed": {"x": sx, "y": sy},
            "region_coverage_pct": region_pct,
            "watershed_regions": int(max(0, num_labels - 1)),
            "contour_count": len(significant_contours),
            "semantic_classes": semantic_classes,
            "semantic_ms": semantic_ms,
            "semantic_engine": semantic_engine,
        },
    }
