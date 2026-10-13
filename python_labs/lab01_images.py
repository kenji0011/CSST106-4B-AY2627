"""
CSST 106 - Perception and Computer Vision
Laboratory Activity 01: Introduction to Computer Vision
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)

Objective:
To familiarize students with the concept of computer vision, understand how digital
images are represented and manipulated, and perform basic image operations using OpenCV.
"""

import cv2
import numpy as np

def main():
    print("=" * 60)
    print("LABORATORY ACTIVITY 01: INTRODUCTION TO COMPUTER VISION")
    print("=" * 60)

    # ---------------------------------------------------------
    # PART 1: UNDERSTANDING DIGITAL IMAGES
    # ---------------------------------------------------------

    # Step 2: Hands-on Exercise: Load and Explore an Image
    image_path = 'sample.jpg'
    img = cv2.imread(image_path)
    if img is None:
        # Create a sample color image if no file is present
        img = np.zeros((400, 500, 3), dtype=np.uint8)
        img[:] = (230, 216, 173) # Soft cyan-blue background in BGR
        cv2.circle(img, (250, 200), 100, (60, 20, 220), -1) # Crimson circle in BGR
        cv2.rectangle(img, (100, 80), (400, 320), (0, 200, 255), 4)

    # Print shape: (height, width, channels)
    h, w, c = img.shape
    print(f"\n[Step 2] Image Shape: {img.shape}")
    print(f" - Height (Rows): {h} px")
    print(f" - Width (Columns): {w} px")
    print(f" - Channels: {c} (BGR Ordering: Blue, Green, Red)")
    print(f" - Total Pixels: {h * w:,}")
    print(f" - Data Type: {img.dtype}")

    # Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    print(f" - Grayscale Shape: {gray.shape} (Single Channel 2D Array)")

    # Step 3: Explore Image Properties
    # Examine pixel values at specific coordinates (y, x)
    sample_y, sample_x = h // 2, w // 2
    b, g, r = img[sample_y, sample_x]
    print(f"\n[Step 3] Pixel properties at coordinate (y={sample_y}, x={sample_x}):")
    print(f" - BGR Values: Blue={b}, Green={g}, Red={r}")
    print(f" - Grayscale Intensity: {gray[sample_y, sample_x]}")

    # Change a pixel's color to a new value (e.g. bright yellow [0, 255, 255] in BGR)
    modified_img = img.copy()
    new_color = [0, 255, 255] # Yellow in BGR
    # Modify a 20x20 patch around coordinate to clearly observe the change
    modified_img[sample_y-10:sample_y+10, sample_x-10:sample_x+10] = new_color
    print(f" - Changed 20x20 patch at ({sample_y}, {sample_x}) to new BGR value: {new_color}")

    # ---------------------------------------------------------
    # PART 2: BASIC IMAGE OPERATIONS
    # ---------------------------------------------------------

    # Step 4: Image Manipulation
    # a. Crop a region of interest (ROI)
    roi_y1, roi_y2 = int(h * 0.2), int(h * 0.8)
    roi_x1, roi_x2 = int(w * 0.2), int(w * 0.8)
    cropped_roi = img[roi_y1:roi_y2, roi_x1:roi_x2]
    print(f"\n[Step 4] Cropped ROI Shape: {cropped_roi.shape}")

    # b. Resize the image (smaller 0.5x and larger 1.5x)
    resized_small = cv2.resize(img, (int(w * 0.5), int(h * 0.5)), interpolation=cv2.INTER_AREA)
    resized_large = cv2.resize(img, (int(w * 1.5), int(h * 1.5)), interpolation=cv2.INTER_LINEAR)
    print(f" - Resized (Smaller 0.5x): {resized_small.shape}")
    print(f" - Resized (Larger 1.5x): {resized_large.shape}")

    # c. Rotate the image by 90 degrees
    rotated_90 = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    print(f" - Rotated 90 degrees clockwise: {rotated_90.shape}")

    # Display outputs
    cv2.imshow("1. Original Image (BGR)", img)
    cv2.imshow("2. Grayscale Conversion", gray)
    cv2.imshow("3. Modified Pixel Patch", modified_img)
    cv2.imshow("4. Cropped Region of Interest (ROI)", cropped_roi)
    cv2.imshow("5. Rotated 90 Degrees", rotated_90)

    print("\nPress any key in image windows to close...")
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
