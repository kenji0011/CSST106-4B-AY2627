// ============================================================================
// CSST 106 - Laboratory Registry
// Currently compiled: Laboratory Activity 01 (More will be added as instructions arrive)
// ============================================================================

const BASE = import.meta.env.BASE_URL;

export const LAB_MODULES = [
  {
    id: 'lab-01',
    number: '01',
    chapter: 'CHAPTER 01 // FUNDAMENTALS',
    shortTag: 'EXP 01 // IMAGES',
    title: 'Introduction to Computer Vision',
    description: 'Image representation, BGR channels, pixel manipulation, cropping ROI, resizing, and rotation.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Fundamentals',
    icon: 'ImageIcon',
    docxFilename: 'lab01_report.docx',
    docxPath: `${BASE}docs/lab01_report.docx`
  },
  {
    id: 'lab-02',
    number: '02',
    chapter: 'CHAPTER 02 // FEATURE EXTRACTION',
    shortTag: 'EXP 02 // EDGE DETECTION',
    title: 'Edge Detection Technique',
    description: 'Implementation and comparative analysis of Sobel and Canny edge detectors with Gaussian smoothing and directional gradients.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Feature Extraction',
    icon: 'Activity',
    docxFilename: 'lab02_report.docx',
    docxPath: `${BASE}docs/lab02_report.docx`
  },
  {
    id: 'lab-03',
    number: '03',
    chapter: 'CHAPTER 03 // CONTRAST ENHANCEMENT',
    shortTag: 'EXP 03 // HISTOGRAM EQUALIZATION',
    title: 'Histogram Equalization & Contrast Adjustment',
    description: 'Global histogram equalization, adaptive CLAHE, and linear contrast stretching across grayscale and YUV color spaces.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Image Enhancement',
    icon: 'BarChart2',
    docxFilename: 'lab03_report.docx',
    docxPath: `${BASE}docs/lab03_report.docx`
  },
  {
    id: 'lab-04',
    number: '04',
    chapter: 'CHAPTER 04 // LOCAL FEATURES',
    shortTag: 'EXP 04 // SURF FEATURES',
    title: 'SURF Feature Detection & Matching',
    description: 'SURF and U-SURF keypoint detection with Hessian threshold tuning, two-image descriptor matching, and comparison against SIFT and ORB.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Feature Detection',
    icon: 'Crosshair',
    docxFilename: 'lab04_report.docx',
    docxPath: `${BASE}docs/lab04_report.docx`
  },
  {
    id: 'lab-05',
    number: '05',
    chapter: 'CHAPTER 05 // DIMENSIONALITY REDUCTION',
    shortTag: 'EXP 05 // PCA EIGENFACES',
    title: 'Facial Recognition using PCA (Eigenfaces)',
    description: 'LFW dataset acquisition, Eigenfaces extraction, cumulative explained variance analysis, whitening impact, and RBF SVM face recognition.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Machine Learning',
    icon: 'Users',
    docxFilename: 'lab05_report.docx',
    docxPath: `${BASE}docs/lab05_report.docx`
  },
  {
    id: 'lab-06',
    number: '06',
    chapter: 'CHAPTER 06 // OBJECT DETECTION',
    shortTag: 'EXP 06 // YOLOV11',
    title: 'Object Detection with YOLOv11',
    description: 'Real-time YOLOv11 inference, custom YOLO .txt annotation format, data.yaml setup, model training, and evaluation.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Deep Learning',
    icon: 'Box',
    docxFilename: 'lab06_report.docx',
    docxPath: `${BASE}docs/lab06_report.docx`
  },
  {
    id: 'lab-07',
    number: '07',
    chapter: 'CHAPTER 07 // IMAGE SEGMENTATION',
    shortTag: 'EXP 07 // SEGMENTATION',
    title: 'Image Segmentation Techniques',
    description: 'Comparative analysis of Otsu/Adaptive thresholding, seeded region growing, Watershed, Canny contours, and DeepLab/LRASPP semantic segmentation.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Segmentation',
    icon: 'Layers',
    docxFilename: 'lab07_report.docx',
    docxPath: `${BASE}docs/lab07_report.docx`
  }
];

export function getLabById(id) {
  return LAB_MODULES.find(lab => lab.id === id) || LAB_MODULES[0];
}
