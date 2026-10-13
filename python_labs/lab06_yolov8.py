"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 06: YOLOv8 Real-Time Object Detection
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

# pip install ultralytics opencv-python matplotlib
import cv2
import matplotlib.pyplot as plt

def main():
    try:
        from ultralytics import YOLO
        # Load YOLOv8 pre-trained model (nano version for fast edge inference)
        model = YOLO('yolov8n.pt')

        img_path = 'sample.jpg'
        img_bgr = cv2.imread(img_path)
        if img_bgr is None:
            print("[Lab 06] Please provide sample.jpg to run YOLOv8 object detection.")
            return

        # Perform inference
        results = model.predict(source=img_bgr, conf=0.45, iou=0.5, save=False)
        result = results[0]

        # Draw detected bounding boxes
        annotated_bgr = result.plot()
        annotated_rgb = cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB)

        # Print detection summaries
        print(f"\n[YOLOv8 Results] Detected {len(result.boxes)} objects:")
        for box in result.boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()
            print(f" - {cls_name.upper()} (Confidence: {conf*100:.1f}%) BBox: {xyxy}")

        plt.figure(figsize=(10, 8))
        plt.imshow(annotated_rgb)
        plt.title(f'YOLOv8 Object Detection ({len(result.boxes)} detections)')
        plt.axis('off')
        plt.tight_layout()
        plt.show()

    except ImportError:
        print("[Notice] Install ultralytics with: pip install ultralytics")

if __name__ == '__main__':
    main()
