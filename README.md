# CSST 106: Perception & Computer Vision — Laboratory Web UI Suite

**Laguna State Polytechnic University (LSPU)**  
**Course Code**: CSST 106 (BSCS 4B — AY 2026–2027, 1st Semester)  
**Author**: **Kean Gabriel Salvahan**  
**Repository**: [github.com/kenji0011/CSST106-4B-AY2627](https://github.com/kenji0011/CSST106-4B-AY2627.git)

---

##  Project Overview

This web application serves as the **centralized compilation and interactive evaluation platform** for all Computer Vision laboratory activities (Lab 1 through Lab 7, plus extensible modules for Lab $n$). 

Designed with a **Neo-Brutalist Comic Book Aesthetic** (featuring halftone dot patterns, hard offset drop shadows, comic chapter tags, and dynamic Light/Dark mode toggling), it allows the course instructor to seamlessly navigate, execute, and verify all computer vision techniques through a single unified interface.

---

##  Compiled Laboratory Modules

| Experiment | Chapter Tag | Core Topics & Computer Vision Techniques | Interactive Web Features |
| :--- | :--- | :--- | :--- |
| **Lab 01** | `EXP 01 // IMAGES` | Digital image representation as 2D/3D NumPy arrays $(H, W, C)$, OpenCV BGR color ordering, Grayscale conversion (`cv2.cvtColor`), coordinate-level pixel inspection and color modification, Region of Interest (ROI) slicing, image resizing (`cv2.resize`), and $90^\circ$ clockwise rotation (`cv2.rotate`). | Dual-card comparison (Original vs. Processed), 6 operation modes (`Inspect`, `Grayscale`, `Rotate 90°`, `Resize`, `Crop ROI`, `Modify Pixel`), interactive $(X, Y)$ coordinate picker, BGR replacement color input, scale factor slider ($0.1\times - 2.0\times$), crop coordinate inputs, and live metadata cards displaying dimensions, channels, inspected pixel values, and NumPy shape. |
| **Lab 02** | `EXP 02 // EDGE DETECTION` | Noise reduction using Gaussian Blur (`cv2.GaussianBlur`), 1st-order Sobel gradient estimation along $X$ and $Y$ (`cv2.Sobel`), combined gradient magnitude calculation (`cv2.magnitude`), and multi-stage Canny edge detection (`cv2.Canny`) featuring Non-Maximum Suppression (1-pixel thin edges) and double-threshold hysteresis. | Triple-column side-by-side comparison suite (`Original Grayscale` vs. `Sobel Edge Map` vs. `Canny Edge Map`) directly matching `plt.subplot(1, 3, 1..3)`, Gaussian kernel size switcher ($3\times3$, $5\times5$, $7\times7$), directional gradient mode ($G_x$, $G_y$, Combined Magnitude), Sobel aperture slider ($k=1,3,5,7$), interactive Canny lower ($T_{low}$) and upper ($T_{high}$) threshold sliders, edge sketch inversion toggle, edge density metric counters, and dedicated interactive academic Q&A answering Question 1 and Lab Conclusion. |
| **Lab 03** | `EXP 03 // HISTOGRAM EQUALIZATION` | Image contrast enhancement, probability density function (PDF) and cumulative distribution function (CDF) intensity mapping, global histogram equalization (`cv2.equalizeHist`), Contrast Limited Adaptive Histogram Equalization (`cv2.createCLAHE`), and linear contrast stretching (min-max normalization) across grayscale and YUV luminance channels. | 4-way side-by-side comparison grid (`Original` vs. `Contrast Stretched` vs. `Global Equalization` vs. `Adaptive CLAHE`) with inline interactive 256-bin histogram frequency charts for each version, color space toggle (Grayscale vs. YUV Luminance channel), interactive CLAHE clip limit slider ($1.0 - 5.0$) and tile grid size selector ($4\times4, 8\times8, 16\times16$), standard deviation ($\sigma$) contrast spread metrics, and interactive Q&A answering all 5 lab evaluation questions. |
| **Lab 04** | `EXP 04 // SURF FEATURES` | Speeded-Up Robust Features (`SURF` and `U-SURF` upright mode), Hessian threshold filtering, scale and orientation keypoint visualization (`cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS`), comparison with `SIFT` (`128-D`) and `ORB` (`32-B`), and two-image descriptor matching (`cv2.BFMatcher`). | 3-column keypoint comparison (`SURF` vs. `SIFT` vs. `ORB`) with live keypoint counts and execution latency, interactive Hessian threshold slider ($100 - 1200$), `U-SURF` upright mode toggle, rich keypoint toggle, two-image `BFMatcher` descriptor matching panel (with optional Query Image 2 upload or auto rotated/scaled query), and complete Q&A covering all 3 evaluation questions. |
| **Lab 05** | `EXP 05 // PCA EIGENFACES` | Dimensionality reduction and facial recognition via Principal Component Analysis (`sklearn.decomposition.PCA` with `svd_solver='randomized'` and `whiten=True`), Eigenfaces visualization, Cumulative Explained Variance (`90%` threshold), and RBF SVM classification (`sklearn.svm.SVC`) on the Labeled Faces in the Wild (`LFW`) dataset. | Interactive `n_components` slider ($10 - 250$), `whiten` toggle (`True`/`False`) showing live SVM accuracy delta, Cumulative Explained Variance canvas chart with $90\%$ marker ($k=85$), Top 12 Eigenfaces gallery + Mean Face + First 3 vs. Last 3 Eigenfaces visual comparison, per-class SVM classification report table, interactive Test Face Reconstruction inspector, Failure Analysis gallery (`y_pred != y_test`), and answers to all Post-Lab and Follow-Up questions. |
| **Lab 06** | `EXP 06 // YOLOV11` | Real-time object detection using `YOLOv11` (`yolo11n`, `yolo11s`, `yolo11m`), normalized YOLO `.txt` annotation format (`class_id x_center y_center width height`), `data.yaml` dataset organization, custom training (`epochs=100, imgsz=640`), and evaluation metrics (`Confidence`, `IoU`, `Precision`, `Recall`, `mAP`). | Image upload, sample street scene, or live browser webcam detection, model variant switcher (`11n`, `11s`, `11m`), Confidence and IoU NMS sliders, live bounding-box table + normalized YOLO `.txt` export, interactive `data.yaml` generator, training/validation CLI reference, and complete Q&A. |
| **Lab 07** | `EXP 07 // SEGMENTATION` | Comparative image segmentation: Global Otsu & Adaptive thresholding, seeded Region Growing, Watershed segmentation, Edge-based Canny closed contours, and Deep Learning Semantic Segmentation (`LRASPP MobileNetV3` on PASCAL VOC). | 6-method side-by-side segmentation grid, interactive click-on-image seed picker for Region Growing, Adaptive block size & Canny threshold sliders, Watershed basin & contour counters, semantic class pixel coverage pills, and full Q&A + IoU analysis. |




##  Standalone Python Scripts

In addition to the interactive Web UI, standalone Python scripts corresponding to each laboratory experiment are provided in the [`python_labs/`](./python_labs/) directory:

```
python_labs/
├── lab01_images.py           # OpenCV color spaces, channels, and transformations
├── lab02_edge_detection.py   # Sobel & Canny edge detection with matplotlib side-by-side
├── lab03_histogram.py        # Global HE, CLAHE, and Contrast Stretching with histograms
├── lab04_features.py         # SURF, U-SURF, SIFT, ORB keypoint detection & matching
├── lab05_pca.py              # LFW PCA Eigenfaces, variance analysis & RBF SVM classifier
├── lab06_yolo.py             # YOLOv11 real-time object detection & YOLO .txt exporter
├── lab07_segmentation.py     # Otsu, Adaptive, Region Growing, Watershed, Contours & Semantic
```

### Running Standalone Python Labs

Each laboratory experiment can be run independently using Python:

```bash
# Run Lab 01 (OpenCV Basic Transformations)
python python_labs/lab01_images.py

# Run Lab 02 (Sobel & Canny Edge Detection with Matplotlib 3-subplot window)
python python_labs/lab02_edge_detection.py <optional_path_to_image>

# Run Lab 03 (Histogram Equalization & CLAHE with Matplotlib 2x4 grid)
python python_labs/lab03_histogram.py <optional_path_to_image>

# Run Lab 04 (SURF, SIFT, and ORB Feature Detection comparison)
python python_labs/lab04_features.py <optional_path_to_image>

# Run Lab 05 (LFW PCA Eigenfaces & SVM Face Recognition)
python python_labs/lab05_pca.py

# Run Lab 06 (YOLOv11 Webcam Detection)
python python_labs/lab06_yolo.py

# Run Lab 07 (Image Segmentation & Deep Learning Semantic Segmentation)
python python_labs/lab07_segmentation.py <optional_path_to_image>
```

---

##  Getting Started

### Prerequisites
- **Node.js** (v18 or higher) and `npm`
- **Python** (3.10 or higher) and `pip`

### Installation & Local Run

#### 1. Clone the Repository
```bash
git clone https://github.com/kenji0011/CSST106-4B-AY2627.git
cd CSST106-4B-AY2627
```

#### 2. Install Python Backend Dependencies
*(Recommended: use a Python virtual environment)*
```bash
pip install fastapi uvicorn python-multipart opencv-python numpy matplotlib scikit-learn ultralytics torch torchvision pillow
```
- `fastapi`, `uvicorn`, `python-multipart`: FastAPI server and file/form upload handling
- `opencv-python`, `numpy`, `matplotlib`: Core image processing & standalone lab plots (Labs 01–04, 07)
- `scikit-learn`: LFW dataset, PCA Eigenfaces, and RBF SVM classifier (Lab 05)
- `ultralytics`: YOLOv11 object detection (Lab 06)
- `torch`, `torchvision`, `pillow`: LRASPP MobileNetV3 semantic segmentation (Lab 07)

#### 3. Install Frontend Dependencies
```bash
npm install
```

#### 4. Start Both Servers (Two Separate Terminals)

**Terminal 1 — FastAPI Backend Server:**
```bash
python server.py
# Backend API runs at http://localhost:8000 (Swagger docs at http://localhost:8000/docs)
```

**Terminal 2 — Vite React Frontend:**
```bash
npm run dev
# Frontend runs at http://localhost:5173
```

> **Note:** Keep both `python server.py` (port `8000`) and `npm run dev` (port `5173`) running simultaneously so interactive labs such as Lab 05 (PCA Eigenfaces), Lab 06 (YOLOv11), and Lab 07 (Semantic Segmentation) can communicate with the backend.

### Production Build
```bash
npm run build
npm run preview
```

---

<<<<<<< HEAD
## 👨‍💻 Author
=======

---

##  Author
>>>>>>> ef7027774e5e53145ed19960d6ad135a576d7c08

**Kean Gabriel Salvahan**  
BS Computer Science — Laguna State Polytechnic University  
Portfolio: [kenji-dev.vercel.app](https://kenji-dev.vercel.app) • GitHub: [@kenji0011](https://github.com/kenji0011)
