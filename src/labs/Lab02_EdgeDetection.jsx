import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import { processLab02, getImageDataFromElement } from '../utils/cvEngine';
import { Activity, EyeOff, Sliders } from 'lucide-react';

export default function Lab02_EdgeDetection({ currentImage, onImageChange, onSnapshotReady }) {
  const [algorithm, setAlgorithm] = useState('canny'); // 'canny', 'sobel', 'prewitt', 'laplacian', 'scharr'
  const [lowThreshold, setLowThreshold] = useState(50);
  const [highThreshold, setHighThreshold] = useState(150);
  const [blurRadius, setBlurRadius] = useState(1);
  const [inverted, setInverted] = useState(false);
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 600, 600);

      const result = processLab02(imageData, {
        algorithm,
        lowThreshold,
        highThreshold,
        blurRadius,
        inverted
      });

      const canvas = processedCanvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(result, 0, 0);

        if (onSnapshotReady) {
          onSnapshotReady(canvas.toDataURL('image/png'));
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(`${elapsed}ms`);
    };
    img.src = currentImage;
  }, [currentImage, algorithm, lowThreshold, highThreshold, blurRadius, inverted]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }}>
      {/* Visual Canvas Workspace */}
      <div>
        <ImageWorkspace
          originalSrc={currentImage}
          processedCanvasRef={processedCanvasRef}
          onImageChange={onImageChange}
          metrics={{ latency, resolution: '600 × 600', extra: `OPERATOR: ${algorithm.toUpperCase()}` }}
        />
      </div>

      {/* Comic Control Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            EDGE PARAMETERS
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            EXP 02
          </span>
        </div>

        {/* Algorithm Picker */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Gradient Operator</span>
          </label>
          <select
            className="comic-select"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="canny">Canny Edge Detector (Hysteresis)</option>
            <option value="sobel">Sobel Gradient Operator</option>
            <option value="prewitt">Prewitt Edge Filter</option>
            <option value="laplacian">Laplacian of Gaussian (2nd Order)</option>
            <option value="scharr">Scharr High-Accuracy Kernel</option>
          </select>
        </div>

        {/* Canny Hysteresis Dual Sliders */}
        {algorithm === 'canny' && (
          <>
            <div className="comic-control-group">
              <div className="comic-control-label">
                <span>Lower Threshold (T_low)</span>
                <span>{lowThreshold}</span>
              </div>
              <input
                type="range"
                min="5"
                max="180"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(Number(e.target.value))}
                className="comic-slider"
              />
            </div>

            <div className="comic-control-group">
              <div className="comic-control-label">
                <span>Upper Threshold (T_high)</span>
                <span>{highThreshold}</span>
              </div>
              <input
                type="range"
                min="50"
                max="255"
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="comic-slider"
              />
            </div>
          </>
        )}

        {/* Gaussian Pre-smoothing */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Gaussian Smoothing (Kernel)</span>
            <span>{blurRadius === 0 ? 'None' : `${blurRadius * 2 + 1}×${blurRadius * 2 + 1}`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            value={blurRadius}
            onChange={(e) => setBlurRadius(Number(e.target.value))}
            className="comic-slider"
          />
        </div>

        {/* Invert Edge Display Toggle */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Edge Color Display</span>
          </label>
          <button
            onClick={() => setInverted(!inverted)}
            className={`comic-btn ${inverted ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
            style={{ fontSize: '11px', padding: '8px' }}
          >
            {inverted ? 'Dark Edges on White Paper' : 'White Edges on Black Dark'}
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setAlgorithm('canny');
            setLowThreshold(50);
            setHighThreshold(150);
            setBlurRadius(1);
            setInverted(false);
          }}
          className="comic-btn comic-btn-secondary"
          style={{ marginTop: '4px', fontSize: '11px' }}
        >
          Reset Edge Settings
        </button>
      </div>
    </div>
  );
}
