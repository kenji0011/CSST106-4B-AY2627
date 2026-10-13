import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import { detectFeatures, getImageDataFromElement } from '../utils/cvEngine';
import { Crosshair, Sliders, Zap, Check } from 'lucide-react';

export default function Lab04_Features({ currentImage, onImageChange, onSnapshotReady }) {
  const [detector, setDetector] = useState('orb'); // 'orb', 'harris', 'fast'
  const [maxPoints, setMaxPoints] = useState(200);
  const [showOrientations, setShowOrientations] = useState(true);
  const [showScales, setShowScales] = useState(true);
  const [detectedCount, setDetectedCount] = useState(0);
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 600, 600);

      // Detect corners / features
      const keypoints = detectFeatures(imageData, {
        algorithm: detector,
        maxPoints
      });

      setDetectedCount(keypoints.length);

      const canvas = processedCanvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw slightly darkened base image so keypoints pop
        ctx.putImageData(imageData, 0, 0);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, height);

        // Draw detected keypoints with neon circular scale badges & orientation rays
        keypoints.forEach((kp) => {
          const radius = showScales ? kp.scale : 6;

          // Outer circle
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, radius, 0, Math.PI * 2);
          ctx.strokeStyle = '#00e5ff'; // Cyan
          ctx.lineWidth = 2;
          ctx.stroke();

          // Center point
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffe600'; // Yellow
          ctx.fill();

          // Orientation ray
          if (showOrientations && kp.angle !== undefined) {
            ctx.beginPath();
            ctx.moveTo(kp.x, kp.y);
            ctx.lineTo(
              kp.x + Math.cos(kp.angle) * radius * 1.5,
              kp.y + Math.sin(kp.angle) * radius * 1.5
            );
            ctx.strokeStyle = '#ff2a85'; // Pink
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });

        if (onSnapshotReady) {
          onSnapshotReady(canvas.toDataURL('image/png'));
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(`${elapsed}ms`);
    };
    img.src = currentImage;
  }, [currentImage, detector, maxPoints, showOrientations, showScales]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }}>
      {/* Visual Canvas Workspace */}
      <div>
        <ImageWorkspace
          originalSrc={currentImage}
          processedCanvasRef={processedCanvasRef}
          onImageChange={onImageChange}
          metrics={{
            latency,
            resolution: '600 × 600',
            extra: `KEYPOINTS: ${detectedCount} / ${maxPoints}`
          }}
        />
      </div>

      {/* Comic Control Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            FEATURE EXTRACTOR
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            EXP 04
          </span>
        </div>

        {/* Detector Method */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Interest Point Detector</span>
          </label>
          <select
            className="comic-select"
            value={detector}
            onChange={(e) => setDetector(e.target.value)}
          >
            <option value="orb">ORB (Oriented FAST &amp; Rotated BRIEF)</option>
            <option value="harris">Harris Corner Matrix (Auto-Correlation)</option>
            <option value="fast">FAST (Features from Accelerated Segment Test)</option>
          </select>
        </div>

        {/* Max Keypoints Slider */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Max Keypoints NMS</span>
            <span>{maxPoints}</span>
          </div>
          <input
            type="range"
            min="50"
            max="400"
            step="25"
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
            className="comic-slider"
          />
        </div>

        {/* Feature Visual Overlays */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Visual Overlays</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setShowScales(!showScales)}
              className={`comic-btn ${showScales ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
              style={{ fontSize: '11px', padding: '7px' }}
            >
              {showScales ? 'Scale Rings Enabled (SURF/ORB)' : 'Fixed 6px Radius Points'}
            </button>

            <button
              onClick={() => setShowOrientations(!showOrientations)}
              className={`comic-btn ${showOrientations ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
              style={{ fontSize: '11px', padding: '7px' }}
            >
              {showOrientations ? 'Orientation Vectors Enabled (Pink Rays)' : 'Hide Orientations'}
            </button>
          </div>
        </div>

        {/* Keypoint Legend Card */}
        <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', display: 'block', marginBottom: '6px' }}>
            VISUAL LEGEND:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffe600', border: '1px solid #000' }} />
              <span>Center Keypoint Extrema</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #00e5ff' }} />
              <span>Scale-Space Neighborhood (σ)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 12, height: 2, background: '#ff2a85' }} />
              <span>Dominant Gradient Angle (θ)</span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setDetector('orb');
            setMaxPoints(200);
            setShowOrientations(true);
            setShowScales(true);
          }}
          className="comic-btn comic-btn-secondary"
          style={{ marginTop: '4px', fontSize: '11px' }}
        >
          Reset Feature Settings
        </button>
      </div>
    </div>
  );
}
