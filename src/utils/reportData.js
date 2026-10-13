// ============================================================================
// CSST 106 - Academic Laboratory Report Metadata & Documentation Templates
// Laguna State Polytechnic University (LSPU) - AY 2026-2027
// ============================================================================

export const COURSE_INFO = {
  institution: 'Laguna State Polytechnic University',
  campus: 'College of Computer Studies',
  courseCode: 'CSST 106',
  courseTitle: 'Perception and Computer Vision',
  academicYear: 'AY 2026-2027 | First Semester',
  section: 'BSCS 4B',
  studentName: 'Kean Gabriel Salvahan',
  instructor: 'Engr. / Prof. Computer Vision Instructor',
  submissionDate: 'October 2026'
};

export const LAB_REPORTS = {
  'lab-01': {
    title: 'Laboratory Activity 01: Introduction to Computer Vision',
    chapter: 'EXPERIMENT 01 // IMAGES',
    objectives: [
      'To familiarize students with the concept of computer vision.',
      'Understand how digital images are represented and manipulated as 2D/3D arrays of pixel values.',
      'Perform basic image operations (loading, color conversions, coordinate exploration, ROI cropping, resizing, and rotation) using OpenCV.'
    ],
    materials: [
      'Computer with Python and OpenCV library installed',
      'Sample images (color and grayscale)'
    ],
    theory: `1. Digital Image Representation:
In computer vision, a digital image is mathematically modeled as a discrete matrix:
- Grayscale Image: A 2D matrix $I(y, x) \\in [0, 255]$ representing light intensity at row $y$ and column $x$.
- Color Image (BGR): A 3D tensor of shape $(H, W, C)$ with three channels: Blue (index 0), Green (index 1), and Red (index 2).

2. BGR vs. RGB Color Ordering:
Unlike standard RGB imaging conventions, OpenCV natively reads and stores color channels in BGR format (Blue, Green, Red). Conversion to Grayscale follows:
$$Y = 0.299R + 0.587G + 0.114B$$

3. Spatial Coordinate System & Pixel Indexing:
Coordinates are indexed as $(y, x)$ corresponding to row $y$ and column $x$, where $(0, 0)$ resides at the top-left corner of the image canvas. Modifying pixel intensity $I(y, x) = [B, G, R]$ directly alters color output.

4. Basic Image Transformations:
- Crop Region of Interest (ROI): Slicing array bounds $I[y_1:y_2, x_1:x_2]$.
- Resizing: Interpolating pixel values across scaled grids using bilinear interpolation.
- Rotation: Performing spatial rotation by $90^\\circ$ through matrix transposition and reflection.`,
    procedure: [
      'Part 1 - Step 1: Study digital image representation as 2D/3D matrices, color spaces (grayscale vs. color), and spatial resolution.',
      'Part 1 - Step 2: Load color image using cv2.imread(), display with cv2.imshow(), and print img.shape to inspect (Height, Width, Channels). Convert image to Grayscale using cv2.cvtColor().',
      'Part 1 - Step 3: Examine pixel values [B, G, R] at specific coordinates (y, x). Modify the pixel color value and observe visual changes on the canvas.',
      'Part 2 - Step 4: Crop a Region of Interest (ROI) from the image array using slicing. Resize the image to smaller (0.5x) and larger (1.5x) dimensions using cv2.resize(). Rotate the image by 90 degrees using cv2.rotate().',
      'Part 2 - Step 5: Document the summary discussion on digital representation, channel significance, and real-world CV applications.'
    ],
    conclusion: `Summary Discussion & Findings:
1. Image Representation: Digital images are arrays of numerical intensity values. Color images possess 3 channels (BGR in OpenCV), while grayscale images consist of a single luminance plane.
2. Significance of Color Channels: Each channel represents the spectral reflectance in that wavelength band. Directly manipulating pixel coordinates allows targeted feature modifications.
3. Real-Life Applications: Basic image manipulation forms the foundational pipeline for medical imaging analysis, autonomous vehicle perception, facial recognition, satellite remote sensing, and industrial quality inspection.`
  }
};
