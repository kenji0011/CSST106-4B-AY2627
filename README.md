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
