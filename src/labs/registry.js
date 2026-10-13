// ============================================================================
// CSST 106 - Laboratory Registry
// Modular registry for all computer vision laboratory activities (Lab 1 .. Lab n)
// ============================================================================

export const LAB_MODULES = [
  {
    id: 'lab-01',
    number: '01',
    chapter: 'CHAPTER 01 // FUNDAMENTALS',
    shortTag: 'EXP 01 // IMAGES',
    title: 'Image Representation & Operations',
    description: 'Matrix structure, RGB/Gray/HSV/Binary color spaces, channel splitting, brightness & contrast.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Fundamentals',
    icon: 'ImageIcon'
  },
  {
    id: 'lab-02',
    number: '02',
    chapter: 'CHAPTER 02 // GRADIENTS',
    shortTag: 'EXP 02 // EDGES',
    title: 'Edge Detection & Derivatives',
    description: 'First & second order spatial gradients: Sobel, Prewitt, Laplacian, and Canny hysteresis detector.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Spatial Filters',
    icon: 'Activity'
  },
  {
    id: 'lab-03',
    number: '03',
    chapter: 'CHAPTER 03 // DISTRIBUTION',
    shortTag: 'EXP 03 // HISTOGRAM',
    title: 'Histogram Analysis & CLAHE',
    description: 'Intensity probability distribution, Global Histogram Equalization (CDF), contrast stretching, and CLAHE.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Enhancement',
    icon: 'BarChart3'
  },
  {
    id: 'lab-04',
    number: '04',
    chapter: 'CHAPTER 04 // INVARIANCE',
    shortTag: 'EXP 04 // FEATURES',
    title: 'SURF & Feature Detection',
    description: 'Corner and interest point detectors (Harris, FAST, ORB, SURF), scale-space keypoints, and feature matching.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Feature Extraction',
    icon: 'Crosshair'
  },
  {
    id: 'lab-05',
    number: '05',
    chapter: 'CHAPTER 05 // EIGENSPACES',
    shortTag: 'EXP 05 // PCA',
    title: 'PCA in Computer Vision',
    description: 'Covariance matrix eigen-decomposition, principal components slider, Eigenfaces, and image reconstruction.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Dimensionality Reduction',
    icon: 'Layers'
  },
  {
    id: 'lab-06',
    number: '06',
    chapter: 'CHAPTER 06 // NEURAL DETECTION',
    shortTag: 'EXP 06 // YOLOV8',
    title: 'YOLOv8 Object Detection',
    description: 'Single-stage anchor-free object detector with bounding boxes, confidence scoring, class tags, and IoU NMS.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Deep Learning',
    icon: 'Scan'
  },
  {
    id: 'lab-07',
    number: '07',
    chapter: 'CHAPTER 07 // PARTITIONING',
    shortTag: 'EXP 07 // SEGMENTATION',
    title: 'Image Segmentation',
    description: 'Automated Otsu thresholding, unsupervised K-Means color clustering, cluster palette breakdown, and HSV masks.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Segmentation',
    icon: 'Boxes'
  }
];

export function getLabById(id) {
  return LAB_MODULES.find(lab => lab.id === id) || LAB_MODULES[0];
}
