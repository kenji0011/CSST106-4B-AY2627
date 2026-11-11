# CSST 106: Perception & Computer Vision — Laboratory Web UI Suite

**Laguna State Polytechnic University (LSPU)**  
**Course Code**: CSST 106 (BSCS 4B — AY 2026–2027, 1st Semester)  
**Author**: **Kean Gabriel Salvahan**  
**Repository**: [github.com/kenji0011/CSST106-4B-AY2627](https://github.com/kenji0011/CSST106-4B-AY2627.git)

---

## 📌 Project Overview

This web application serves as the **centralized compilation and interactive evaluation platform** for all Computer Vision laboratory activities (Lab 1 through Lab 7, plus extensible modules for Lab $n$). 

Designed with a **Neo-Brutalist Comic Book Aesthetic** (featuring halftone dot patterns, hard offset drop shadows, comic chapter tags, and dynamic Light/Dark mode toggling), it allows the course instructor to seamlessly navigate, execute, and verify all computer vision techniques through a single unified interface.

---

## 🧪 Compiled Laboratory Modules

| Experiment | Chapter Tag | Core Topics & Computer Vision Techniques | Interactive Web Features |
| :--- | :--- | :--- | :--- |
| **Lab 01** | `EXP 01 // IMAGES` | Digital image representation as 2D/3D NumPy arrays $(H, W, C)$, OpenCV BGR color ordering, Grayscale conversion (`cv2.cvtColor`), coordinate-level pixel inspection and color modification, Region of Interest (ROI) slicing, image resizing (`cv2.resize`), and $90^\circ$ clockwise rotation (`cv2.rotate`). | Dual-card comparison (Original vs. Processed), 6 operation modes (`Inspect`, `Grayscale`, `Rotate 90°`, `Resize`, `Crop ROI`, `Modify Pixel`), interactive $(X, Y)$ coordinate picker, BGR replacement color input, scale factor slider ($0.1\times - 2.0\times$), crop coordinate inputs, and live metadata cards displaying dimensions, channels, inspected pixel values, and NumPy shape. |
| **Lab 02** | `EXP 02 // EDGE DETECTION` | Noise reduction using Gaussian Blur (`cv2.GaussianBlur`), 1st-order Sobel gradient estimation along $X$ and $Y$ (`cv2.Sobel`), combined gradient magnitude calculation (`cv2.magnitude`), and multi-stage Canny edge detection (`cv2.Canny`) featuring Non-Maximum Suppression (1-pixel thin edges) and double-threshold hysteresis. | Triple-column side-by-side comparison suite (`Original Grayscale` vs. `Sobel Edge Map` vs. `Canny Edge Map`) directly matching `plt.subplot(1, 3, 1..3)`, Gaussian kernel size switcher ($3\times3$, $5\times5$, $7\times7$), directional gradient mode ($G_x$, $G_y$, Combined Magnitude), Sobel aperture slider ($k=1,3,5,7$), interactive Canny lower ($T_{low}$) and upper ($T_{high}$) threshold sliders, edge sketch inversion toggle, edge density metric counters, and dedicated interactive academic Q&A answering Question 1 and Lab Conclusion. |
| **Lab 03** | `EXP 03 // HISTOGRAM EQUALIZATION` | Image contrast enhancement, probability density function (PDF) and cumulative distribution function (CDF) intensity mapping, global histogram equalization (`cv2.equalizeHist`), Contrast Limited Adaptive Histogram Equalization (`cv2.createCLAHE`), and linear contrast stretching (min-max normalization) across grayscale and YUV luminance channels. | 4-way side-by-side comparison grid (`Original` vs. `Contrast Stretched` vs. `Global Equalization` vs. `Adaptive CLAHE`) with inline interactive 256-bin histogram frequency charts for each version, color space toggle (Grayscale vs. YUV Luminance channel), interactive CLAHE clip limit slider ($1.0 - 5.0$) and tile grid size selector ($4\times4, 8\times8, 16\times16$), standard deviation ($\sigma$) contrast spread metrics, and interactive Q&A answering all 5 lab evaluation questions. |



---

## 🎨 Design System & Highlights

- **Comic & Neo-Brutalist Theme**: Bold `2.5px` solid borders, sharp `4px`/`8px` hard offset shadows (no soft blur), and tactile button click physics.
- **Halftone Dot Pattern**: Halftone comic grid background adapting smoothly across both themes.
- **Full Light & Dark Mode**: One-click Sun/Moon toggle in the navigation bar.
- **Interactive Split Comparison Slider**: Draggable handle dividing the raw input image and the processed output in real time, plus Dual Side-by-Side mode.
- **Python Source Code Viewer**: Integrated syntax-highlighted viewer to inspect the exact FastAPI and OpenCV Python implementations directly within the web app.

---

## 💻 Standalone Python Scripts

In addition to the interactive Web UI, standalone Python scripts corresponding to each laboratory experiment are provided in the [`python_labs/`](./python_labs/) directory:

```
python_labs/
├── lab01_images.py           # OpenCV color spaces, channels, and transformations
├── lab02_edge_detection.py   # Sobel & Canny edge detection with matplotlib side-by-side
├── lab03_histogram.py        # Global HE, CLAHE, and Contrast Stretching with histograms
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
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.10+ with `opencv-python`, `fastapi`, `uvicorn`, `numpy`, and `matplotlib`

### Installation & Local Run

#### 1. Start the FastAPI Backend Server
```bash
python server.py
# Backend API runs at http://localhost:8000 (Swagger docs at /docs)
```

#### 2. Start the Vite React Frontend
```bash
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

### Production Build
```bash
npm run build
```

---


---

## 👨‍💻 Author

**Kean Gabriel Salvahan**  
BS Computer Science — Laguna State Polytechnic University  
Portfolio: [kenji-dev.vercel.app](https://kenji-dev.vercel.app) • GitHub: [@kenji0011](https://github.com/kenji0011)
