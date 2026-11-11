// ============================================================================
// CSST 106 - Laboratory Registry
// Currently compiled: Laboratory Activity 01 (More will be added as instructions arrive)
// ============================================================================

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
    icon: 'ImageIcon'
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
    icon: 'Activity'
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
    icon: 'BarChart2'
  }
];

export function getLabById(id) {
  return LAB_MODULES.find(lab => lab.id === id) || LAB_MODULES[0];
}
