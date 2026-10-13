"""
CSST 106 - Perception and Computer Vision
Laboratory Experiment 04: SURF / Feature Detection & Keypoint Matching
Student: Kean Gabriel Salvahan | Section: BSCS 4B | AY 2026-2027
Laguna State Polytechnic University (LSPU)
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt

def main():
    img_bgr = cv2.imread('sample.jpg')
    if img_bgr is None:
        img_bgr = np.zeros((400, 400, 3), dtype=np.uint8)
        cv2.putText(img_bgr, "CV TEST", (80, 200), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 4)

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. ORB / SIFT / SURF Keypoint Detection
    # Note: Modern OpenCV includes SIFT and ORB as open standards
    orb = cv2.ORB_create(nfeatures=500)
    keypoints, descriptors = orb.detectAndCompute(gray, None)

    # 2. Draw keypoints with rich scale circles & orientation rays
    img_keypoints = cv2.drawKeypoints(
        img_bgr, keypoints, None,
        color=(0, 255, 0),
        flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
    )

    # 3. Simulated Rotation & Feature Matching
    h, w = gray.shape
    rot_matrix = cv2.getRotationMatrix2D((w/2, h/2), 30, 0.9)
    rotated_gray = cv2.warpAffine(gray, rot_matrix, (w, h))

    kp_rot, des_rot = orb.detectAndCompute(rotated_gray, None)

    # Match descriptors using BFMatcher with Hamming distance
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(descriptors, des_rot) if descriptors is not None and des_rot is not None else []
    matches = sorted(matches, key=lambda x: x.distance)

    # Draw top 30 matches
    matched_img = cv2.drawMatches(
        img_bgr, keypoints,
        cv2.cvtColor(rotated_gray, cv2.COLOR_GRAY2BGR), kp_rot,
        matches[:30], None, flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )

    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    axes[0].imshow(cv2.cvtColor(img_keypoints, cv2.COLOR_BGR2RGB))
    axes[0].set_title(f'Detected Keypoints (Found: {len(keypoints)})')
    axes[1].imshow(cv2.cvtColor(matched_img, cv2.COLOR_BGR2RGB))
    axes[1].set_title(f'Keypoint Correspondences ({len(matches)} matches)')

    for ax in axes: ax.axis('off')
    plt.tight_layout()
    plt.show()

if __name__ == '__main__':
    main()
