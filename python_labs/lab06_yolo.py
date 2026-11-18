"""
CSST 106 - Perception and Computer Vision
Laboratory Exercise No. 6: Object Detection with YOLOv11
Laguna State Polytechnic University (LSPU) - AY 2026-2027

Topic: YOLOv11 Inference, Custom Dataset Format (YOLO .txt & data.yaml), Training & Evaluation
Author: Kean Gabriel Salvahan (BSCS 4B)
"""

import base64
import time
import cv2
import numpy as np
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter(prefix="/api/lab06", tags=["Lab 06 - YOLOv11 Object Detection"])

_YOLO_MODELS = {}


def encode_image_to_base64(img_ndarray: np.ndarray) -> str:
    """Encodes an OpenCV BGR image to base64 JPEG format."""
    success, buffer = cv2.imencode(".jpg", img_ndarray)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"


def run_ultralytics_yolo(img_bgr: np.ndarray, model_variant: str, conf: float, iou: float):
    """Runs Ultralytics YOLOv11 inference if ultralytics is installed."""
    from ultralytics import YOLO

    if model_variant not in _YOLO_MODELS:
        _YOLO_MODELS[model_variant] = YOLO(f"{model_variant}.pt")
    model = _YOLO_MODELS[model_variant]

    results = model.predict(img_bgr, conf=conf, iou=iou, verbose=False)
    res = results[0]
    h, w = img_bgr.shape[:2]
    detections = []

    if res.boxes is not None:
        for i, box in enumerate(res.boxes):
            x1, y1, x2, y2 = [int(round(v)) for v in box.xyxy[0].tolist()]
            cls_id = int(box.cls[0].item())
            cls_name = str(res.names.get(cls_id, f"class_{cls_id}"))
            score = float(box.conf[0].item())

            bw = max(1, x2 - x1)
            bh = max(1, y2 - y1)
            xc = (x1 + bw / 2.0) / float(w)
            yc = (y1 + bh / 2.0) / float(h)
            nw = bw / float(w)
            nh = bh / float(h)

            detections.append(
                {
                    "id": i + 1,
                    "class_id": cls_id,
                    "class_name": cls_name,
                    "confidence": round(score, 3),
                    "bbox_px": [x1, y1, x2, y2],
                    "yolo_txt": f"{cls_id} {xc:.6f} {yc:.6f} {nw:.6f} {nh:.6f}",
                }
            )

    return detections, f"Ultralytics {model_variant.upper()}"


def run_opencv_object_fallback(
    img_bgr: np.ndarray, model_variant: str, conf_thresh: float, iou_thresh: float
):
    """
    Clean OpenCV-native object proposal + NMS fallback when ultralytics/torch are not installed.
    Uses HOG people detector + multi-threshold edge/contour region proposals + NMSBoxes.
    """
    h, w = img_bgr.shape[:2]
    raw_boxes = []
    raw_scores = []
    raw_classes = []

    # 1. HOG Pedestrian / Person Detection
    try:
        hog = cv2.HOGDescriptor()
        hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        if w >= 64 and h >= 128:
            rects, weights = hog.detectMultiScale(
                img_bgr, winStride=(8, 8), padding=(8, 8), scale=1.05
            )
            for (rx, ry, rw, rh), wt in zip(rects, weights):
                score = float(min(0.96, max(0.30, 0.50 + float(wt) * 0.22)))
                if score >= conf_thresh:
                    raw_boxes.append([int(rx), int(ry), int(rw), int(rh)])
                    raw_scores.append(score)
                    raw_classes.append((0, "person"))
    except Exception:
        pass

    # 2. Structural Object Proposals via Adaptive Canny + Morphological Closing
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 45, 140)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    img_area = float(w * h)
    # Slight confidence adjustment by model capacity (n < s < m)
    variant_boost = {"yolo11n": 0.0, "yolo11s": 0.04, "yolo11m": 0.07}.get(
        model_variant, 0.0
    )

    for cnt in contours:
        bx, by, bw, bh = cv2.boundingRect(cnt)
        area = float(bw * bh)
        if area < img_area * 0.015 or area > img_area * 0.85:
            continue

        aspect = bw / float(max(1, bh))
        # Estimate object-ness score from edge density inside box
        roi_edges = edges[by : by + bh, bx : bx + bw]
        edge_ratio = float(np.count_nonzero(roi_edges)) / max(1.0, area)
        score = float(min(0.95, 0.42 + edge_ratio * 2.4 + variant_boost))

        if score < conf_thresh:
            continue

        # Heuristic class assignment based on geometry & aspect ratio (COCO classes)
        if 0.35 <= aspect <= 0.72 and bh > h * 0.25:
            cls_id, cls_name = 0, "person"
        elif aspect > 1.25 and bw > w * 0.16:
            cls_id, cls_name = 2, "car"
        elif aspect < 0.55 and area < img_area * 0.15:
            cls_id, cls_name = 39, "bottle"
        else:
            cls_id, cls_name = 63, "object"

        raw_boxes.append([int(bx), int(by), int(bw), int(bh)])
        raw_scores.append(score)
        raw_classes.append((cls_id, cls_name))

    detections = []
    if raw_boxes:
        indices = cv2.dnn.NMSBoxes(raw_boxes, raw_scores, conf_thresh, iou_thresh)
        if len(indices) > 0:
            flat_idx = indices.flatten() if hasattr(indices, "flatten") else [int(i) for i in indices]
            for rank, idx in enumerate(flat_idx[:15]):
                bx, by, bw, bh = raw_boxes[idx]
                cls_id, cls_name = raw_classes[idx]
                score = raw_scores[idx]
                xc = (bx + bw / 2.0) / float(w)
                yc = (by + bh / 2.0) / float(h)
                nw = bw / float(w)
                nh = bh / float(h)
                detections.append(
                    {
                        "id": rank + 1,
                        "class_id": cls_id,
                        "class_name": cls_name,
                        "confidence": round(score, 3),
                        "bbox_px": [bx, by, bx + bw, by + bh],
                        "yolo_txt": f"{cls_id} {xc:.6f} {yc:.6f} {nw:.6f} {nh:.6f}",
                    }
                )

    return detections, f"OpenCV Proposal Fallback ({model_variant} simulated; install ultralytics for weights)"


def draw_yolo_boxes(img_bgr: np.ndarray, detections: list) -> np.ndarray:
    """Draws clean bounding boxes, class labels, and confidence scores."""
    out = img_bgr.copy()
    palette = [
        (59, 130, 246),   # Blue
        (16, 185, 129),   # Green
        (249, 115, 22),   # Orange
        (168, 85, 247),   # Purple
        (236, 72, 153),   # Pink
    ]

    for det in detections:
        x1, y1, x2, y2 = det["bbox_px"]
        color = palette[det["class_id"] % len(palette)]
        cv2.rectangle(out, (x1, y1), (x2, y2), color, 2)

        label = f"{det['class_name']} {det['confidence']:.2f}"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
        ty = max(th + 8, y1)
        cv2.rectangle(out, (x1, ty - th - 8), (x1 + tw + 8, ty), color, -1)
        cv2.putText(
            out,
            label,
            (x1 + 4, ty - 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )
    return out


@router.post("/detect")
async def detect_lab06(
    file: UploadFile = File(...),
    model_variant: str = Form("yolo11n"),
    conf_threshold: float = Form(0.35),
    iou_threshold: float = Form(0.45),
):
    """
    Runs YOLOv11 (or OpenCV fallback when ultralytics is not installed) object detection,
    returning annotated image, bounding boxes, and normalized YOLO .txt annotations.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    h, w = img_bgr.shape[:2]
    safe_conf = max(0.05, min(0.95, float(conf_threshold)))
    safe_iou = max(0.05, min(0.95, float(iou_threshold)))
    safe_variant = (
        model_variant if model_variant in ("yolo11n", "yolo11s", "yolo11m") else "yolo11n"
    )

    t0 = time.perf_counter()
    try:
        detections, engine = run_ultralytics_yolo(img_bgr, safe_variant, safe_conf, safe_iou)
    except Exception:
        detections, engine = run_opencv_object_fallback(
            img_bgr, safe_variant, safe_conf, safe_iou
        )
    inference_ms = round((time.perf_counter() - t0) * 1000.0, 2)

    annotated = draw_yolo_boxes(img_bgr, detections)
    yolo_txt_lines = "\n".join([d["yolo_txt"] for d in detections])

    return {
        "annotated_image_base64": encode_image_to_base64(annotated),
        "detections": detections,
        "yolo_txt_file": yolo_txt_lines,
        "metrics": {
            "width": w,
            "height": h,
            "num_detections": len(detections),
            "inference_ms": inference_ms,
            "model_variant": safe_variant,
            "conf_threshold": safe_conf,
            "iou_threshold": safe_iou,
            "engine": engine,
        },
    }


def run_webcam_yolo11():
    """Standalone Part 1 script: Real-time YOLOv11 detection from webcam."""
    try:
        from ultralytics import YOLO
    except ImportError:
        print("ultralytics not installed. Run: pip install ultralytics opencv-python")
        return

    model = YOLO("yolo11n.pt")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = model(frame, conf=0.35)
        annotated_frame = results[0].plot()
        cv2.imshow("YOLOv11 Real-time Detection", annotated_frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_webcam_yolo11()
