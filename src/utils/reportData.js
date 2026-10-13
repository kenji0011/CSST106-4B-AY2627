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
  },

  'lab-02': {
    title: 'Lab Experiment 02: Edge Detection & Gradient Operators',
    chapter: 'EXPERIMENT 02 // EDGES',
    objectives: [
      'Investigate spatial gradient operators for boundary and edge detection.',
      'Implement first-order derivative masks (Sobel, Prewitt, Scharr) and second-order derivative masks (Laplacian).',
      'Analyze the multi-stage Canny Edge Detector: Gaussian smoothing, gradient calculation, non-maximum suppression, and hysteresis thresholding.'
    ],
    theory: `Edges correspond to sharp discontinuities in image brightness. The spatial gradient vector $\\nabla I = \\left[ \\frac{\\partial I}{\\partial x}, \\frac{\\partial I}{\\partial y} \\right]^T$ points in the direction of maximum rate of change.
Magnitude: $G = \\sqrt{G_x^2 + G_y^2} \\approx |G_x| + |G_y|$
Direction: $\\theta = \\arctan\\left(\\frac{G_y}{G_x}\\right)$
The Canny detector optimizes edge localization through:
1. Gaussian Convolution: $I_\\sigma = I * G_\\sigma$ to suppress high-frequency noise.
2. Gradient Computation: Computing directional derivatives $G_x$ and $G_y$.
3. Non-Maximum Suppression (NMS): Thinning edges to 1-pixel wide ridges by comparing pixel values along gradient normal $\\theta$.
4. Hysteresis Thresholding: Using dual thresholds ($T_{\\text{low}}, T_{\\text{high}}$) to eliminate spurious edges while preserving continuous contours.`,
    procedure: [
      'Convert test imagery to grayscale and apply Gaussian kernel convolution for noise reduction.',
      'Convolve the smoothed image with horizontal ($G_x$) and vertical ($G_y$) Sobel and Prewitt kernel matrices.',
      'Compute combined gradient magnitude maps and examine directional edge sensitivity.',
      'Evaluate second-order isotropic Laplacian operators.',
      'Execute the full Canny edge pipeline with adjustable upper and lower hysteresis threshold sliders.',
      'Compare edge continuity, noise immunity, and computational trade-offs.'
    ],
    conclusion: 'The experiment proved that while simple gradient operators (Sobel and Prewitt) efficiently highlight directional transitions, they are vulnerable to image noise and produce thick, blurred edges. In contrast, the Canny edge detector produced exceptionally clean, single-pixel connected contours through non-maximum suppression and hysteresis thresholding, establishing its superiority as a robust feature extraction technique.'
  },

  'lab-03': {
    title: 'Lab Experiment 03: Histogram Analysis & Equalization',
    chapter: 'EXPERIMENT 03 // HISTOGRAM',
    objectives: [
      'Construct and analyze intensity frequency histograms for grayscale and RGB color channels.',
      'Implement Global Histogram Equalization (GHE) to optimize global image dynamic range.',
      'Evaluate Contrast Limited Adaptive Histogram Equalization (CLAHE) for localized contrast enhancement.'
    ],
    theory: `An image histogram represents the probability density function (PDF) of intensity occurrences:
$$p(r_k) = \\frac{n_k}{N}$$
where $n_k$ is the number of pixels with intensity $r_k$, and $N$ is total pixels.
Global Histogram Equalization applies a monotonic transformation function based on the Cumulative Distribution Function (CDF):
$$s_k = T(r_k) = (L - 1) \\sum_{j=0}^{k} p(r_j) = \\frac{L - 1}{N} \\sum_{j=0}^{k} n_j$$
CLAHE prevents over-amplification of noise in homogenous regions by subdividing the image into contextual tiles and clipping histogram peaks before bilinear interpolation.`,
    procedure: [
      'Calculate 256-bin discrete frequency histograms across Red, Green, Blue, and Luminance channels.',
      'Visualize probability density distributions for under-exposed and over-exposed scenes.',
      'Implement global cumulative distribution function mapping to linearize intensity spread.',
      'Evaluate CLAHE with parameterized tile grid size and clip limit constraints.',
      'Compare visual clarity and artifact suppression between GHE and CLAHE.'
    ],
    conclusion: 'Histogram analysis provided vital insights into the statistical distribution of image illumination. While global histogram equalization successfully expanded the dynamic range of low-contrast images, it occasionally over-amplified background noise. CLAHE resolved this issue by redistributing contrast locally across contextual grid blocks, demonstrating optimal clarity without saturation.'
  },

  'lab-04': {
    title: 'Lab Experiment 04: SURF / Keypoint Detection & Feature Matching',
    chapter: 'EXPERIMENT 04 // FEATURES',
    objectives: [
      'Understand local invariant feature descriptors (Harris, FAST, ORB, SIFT, and SURF).',
      'Detect scale and rotation-invariant keypoints within scenes.',
      'Perform feature correspondence matching between paired reference and query images.'
    ],
    theory: `Local feature detectors identify salient, repeatable interest points unaffected by viewpoint changes. The Harris corner detector computes the auto-correlation matrix $M$:
$$M = \\sum_{x, y} w(x, y) \\begin{bmatrix} I_x^2 & I_x I_y \\\\ I_x I_y & I_y^2 \\end{bmatrix}$$
Corner response: $R = \\det(M) - k(\\text{trace}(M))^2$
SURF (Speeded-Up Robust Features) utilizes box filters and Integral Images to approximate the Hessian matrix determinant rapidly:
$$\\mathcal{H}(x, \\sigma) = \\begin{bmatrix} L_{xx}(x, \\sigma) & L_{xy}(x, \\sigma) \\\\ L_{xy}(x, \\sigma) & L_{yy}(x, \\sigma) \\end{bmatrix}$$
Keypoint descriptors are matched across images using Euclidean distance with Lowe\'s ratio test ($d_1 / d_2 < 0.75$) to reject ambiguous matches.`,
    procedure: [
      'Compute spatial derivative gradients to construct the second-moment structure tensor.',
      'Identify localized corner extrema with non-maximum suppression.',
      'Assign characteristic orientation vectors and scale metrics to detected keypoints.',
      'Extract local feature descriptors from keypoint neighborhoods.',
      'Execute nearest-neighbor matching across two images and render correspondence vectors.'
    ],
    conclusion: 'Keypoint detection and feature matching demonstrated the capability of computer vision systems to maintain object recognition invariant to geometric rotations, translations, and scale variations. Using scale-space extrema and robust descriptor vectors enables reliable image stitching, 3D tracking, and object retrieval.'
  },

  'lab-05': {
    title: 'Lab Experiment 05: Principal Component Analysis (PCA) in Computer Vision',
    chapter: 'EXPERIMENT 05 // PCA',
    objectives: [
      'Apply dimensionality reduction to high-dimensional image vector spaces.',
      'Compute the empirical mean, centered data matrix, and covariance matrix.',
      'Derive eigenvectors and eigenvalues for Eigenfaces and image compression reconstruction.'
    ],
    theory: `Consider a set of $M$ images reshaped into $D$-dimensional vectors $\\mathbf{x}_i \\in \\mathbb{R}^D$.
1. Compute mean vector: $\\mathbf{\\mu} = \\frac{1}{M} \\sum_{i=1}^{M} \\mathbf{x}_i$
2. Center vectors: $\\mathbf{\\Phi}_i = \\mathbf{x}_i - \\mathbf{\\mu}$
3. Covariance Matrix: $C = \\frac{1}{M} A A^T$ where $A = [\\mathbf{\\Phi}_1, \\dots, \\mathbf{\\Phi}_M]$
4. Eigen-decomposition: $C \\mathbf{u}_k = \\lambda_k \\mathbf{u}_k$
Selecting the top $k \\ll D$ eigenvectors with largest eigenvalues yields the optimal linear subspace that maximizes retained variance. Any image is approximated as:
$$\\mathbf{\\hat{x}} = \\mathbf{\\mu} + \\sum_{j=1}^{k} \\omega_j \\mathbf{u}_j$$`,
    procedure: [
      'Vectorize image blocks into high-dimensional matrix representations.',
      'Calculate the empirical mean vector and zero-center the data space.',
      'Decompose the covariance structure into orthogonal eigenvector bases.',
      'Project test images into low-dimensional weight coordinates.',
      'Reconstruct imagery using variable principal component counts $k \\in [1, 50]$.',
      'Quantify compression ratio and cumulative explained variance.'
    ],
    conclusion: 'PCA proved highly effective for dimensionality reduction and image reconstruction. With a fraction of the original components (e.g., $k=12$ out of 64), the essential visual structure was preserved with over 85% explained variance, demonstrating the mathematical basis of Eigenface recognition and lossy image compression.'
  },

  'lab-06': {
    title: 'Lab Experiment 06: YOLOv8 Real-Time Object Detection',
    chapter: 'EXPERIMENT 06 // YOLOV8',
    objectives: [
      'Understand the architecture and principles of single-stage deep learning detectors (YOLOv8).',
      'Evaluate anchor-free regression, task-aligned assignment, and loss functions.',
      'Execute object detection inference, analyze bounding box coordinates, class labels, and confidence thresholds.'
    ],
    theory: `YOLOv8 is a state-of-the-art single-stage convolutional detector featuring:
- Backbone: Modified CSPDarknet with C2f modules for feature extraction.
- Neck: PANet (Path Aggregation Network) combining multi-scale semantic features.
- Head: Anchor-free decoupled head separating classification and bounding box regression branches.
Non-Maximum Suppression (NMS) eliminates redundant candidate boxes using Intersection over Union (IoU):
$$\\text{IoU} = \\frac{\\text{Area}(B_1 \\cap B_2)}{\\text{Area}(B_1 \\cup B_2)}$$
Detections with $\\text{IoU} > \\text{threshold}$ are pruned, preserving only maximum-confidence predictions.`,
    procedure: [
      'Load pre-trained YOLOv8 model weights and configure inference hyperparameters.',
      'Feed test input images and video streams into the neural network pipeline.',
      'Adjust detection confidence threshold ($\tau_{\text{conf}}$) and IoU suppression parameters.',
      'Inspect localized bounding box overlays, class tags, and confidence scores.',
      'Tabulate class frequencies and compute inference latency metrics.'
    ],
    conclusion: 'The YOLOv8 experiment demonstrated the power of modern deep learning object detectors. Single-stage anchor-free detection achieved high accuracy and real-time processing speeds, accurately localizing diverse classes in complex urban scenes while providing robust confidence scores.'
  },

  'lab-07': {
    title: 'Lab Experiment 07: Image Segmentation (Otsu & K-Means)',
    chapter: 'EXPERIMENT 07 // SEGMENTATION',
    objectives: [
      'Implement threshold-based and clustering-based image segmentation methodologies.',
      'Formulate Otsu\'s algorithm for automated binarization maximizing inter-class variance.',
      'Apply unsupervised K-Means color quantization to segment multi-region imagery.'
    ],
    theory: `Image segmentation partitions an image into distinct, semantically meaningful regions $R_1, \\dots, R_m$.
Otsu\'s Method selects threshold $t^*$ that maximizes between-class variance:
$$\\sigma_B^2(t) = \\omega_0(t) \\omega_1(t) [\\mu_0(t) - \\mu_1(t)]^2$$
where $\\omega_0, \\omega_1$ are class probabilities and $\\mu_0, \\mu_1$ are class mean intensities.
K-Means Clustering minimizes the within-cluster sum of squares (WCSS) in RGB color space:
$$J = \\sum_{i=1}^{k} \\sum_{\\mathbf{x} \\in S_i} ||\\mathbf{x} - \\mathbf{\\mu}_i||^2$$
Iteratively updating centroid positions: $\\mathbf{\\mu}_i = \\frac{1}{|S_i|} \\sum_{\\mathbf{x} \\in S_i} \\mathbf{x}$.`,
    procedure: [
      'Compute grayscale histogram and calculate intra-class and inter-class variances across all threshold candidates.',
      'Determine the optimal Otsu threshold $t^*$ and generate binary segmented foreground masks.',
      'Map image pixels into a 3D Euclidean color vector space $(R, G, B)$.',
      'Execute iterative K-Means clustering for cluster counts $k \\in [2, 8]$.',
      'Reconstruct segmented image using cluster centroid centroids and render color palette breakdown.'
    ],
    conclusion: 'Both Otsu thresholding and K-Means clustering successfully partitioned complex scenes into coherent semantic segments. Otsu provided rapid, parameter-free binarization for high-contrast objects, while K-Means clustering effectively identified distinct material and color regions without spatial supervision.'
  }
};
