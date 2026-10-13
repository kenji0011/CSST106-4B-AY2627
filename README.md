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
| **Lab 01** | `EXP 01 // IMAGES` | Digital image representation, 24-bit RGB, Grayscale, HSV projection, channel decomposition, contrast ($\alpha$), brightness ($\beta$), gamma ($\gamma$), geometric reflections. | Live color space switcher, channel isolation (R, G, B), brightness/contrast/gamma sliders, flip tools. |
| **Lab 02** | `EXP 02 // EDGES` | Spatial derivatives, first-order kernels (Sobel, Prewitt, Scharr), second-order isotropic Laplacian, Canny edge detector (hysteresis thresholding & NMS). | Interactive gradient selector, Canny $T_{\text{low}}$ & $T_{\text{high}}$ threshold sliders, Gaussian blur radius, dark/light edge invert. |
| **Lab 03** | `EXP 03 // HISTOGRAM` | Discrete frequency distribution (256 bins), Global Histogram Equalization (CDF mapping), Contrast Limited Adaptive Histogram Equalization (CLAHE), Min-Max contrast stretching. | Real-time Canvas histogram graph (R, G, B, Luminance), CDF equalization toggle, CLAHE clip limit & grid dimensions. |
| **Lab 04** | `EXP 04 // FEATURES` | Interest point & invariant feature extraction: Harris corner auto-correlation matrix, FAST corner detector, ORB (Oriented FAST and Rotated BRIEF), SURF scale-space extrema. | Neon keypoint visualizer, scale-space neighborhood rings ($\sigma$), dominant gradient orientation vectors ($\theta$). |
| **Lab 05** | `EXP 05 // PCA` | Principal Component Analysis, covariance matrix eigen-decomposition, Eigenfaces, low-rank dimensionality reduction, image compression & reconstruction. | $k$-components slider ($1 \dots 64$), live reconstructed preview, compression ratio calculator, explained variance percentage. |
| **Lab 06** | `EXP 06 // YOLOV8` | Deep learning single-stage object detector: C2f backbone, decoupled head, anchor-free bounding box regression, Intersection-over-Union (IoU) Non-Maximum Suppression (NMS). | Real-time candidate box overlay, comic entity label badges, confidence threshold filter ($\tau$), detected classes tally. |
| **Lab 07** | `EXP 07 // SEGMENTATION` | Image partitioning: Otsu's automatic binarization (maximizing inter-class variance $\sigma_B^2$), unsupervised K-Means color quantization in 3D RGB Euclidean space. | Strategy switcher (Otsu vs. K-Means), $k$-clusters slider ($2 \dots 8$), centroid color palette swatches, optimal threshold $t^*$ readout. |

---

## 🎨 Design System & Highlights

- **Comic & Neo-Brutalist Theme**: Bold `2.5px` solid borders, sharp `4px`/`8px` hard offset shadows (no soft blur), and tactile button click physics.
- **Halftone Dot Pattern**: Halftone comic grid background adapting smoothly across both themes.
- **Full Light & Dark Mode**: One-click Sun/Moon toggle in the navigation bar.
- **Interactive Split Comparison Slider**: Draggable handle dividing the raw input image and the processed output in real time, plus Dual Side-by-Side mode.
- **Client-Side Computer Vision Engine**: High-performance Canvas & TypedArray image processing running directly in the browser with sub-15ms latency and zero backend configuration needed for checking.
- **Built-in Academic Report & Hard-Copy Print Mode**: Institutional Laguna State Polytechnic University format with editable observations and `@media print` A4 formatting for printed hard-copy submissions.

---

## 💻 Standalone Python Scripts

In addition to the interactive Web UI, standalone Python scripts corresponding to each laboratory experiment are provided in the [`python_labs/`](./python_labs/) directory:

```
python_labs/
├── lab01_images.py           # OpenCV color spaces, channels, and transformations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/kenji0011/CSST106-4B-AY2627.git

# 2. Navigate to project root
cd CSST106-4B-AY2627

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
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
