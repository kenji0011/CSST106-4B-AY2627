import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import { processLab07, getImageDataFromElement } from '../utils/cvEngine';
import { Boxes, Sliders, Palette, CheckCircle2 } from 'lucide-react';

export default function Lab07_Segmentation({ currentImage, onImageChange, onSnapshotReady }) {
  const [algorithm, setAlgorithm] = useState('kmeans'); // 'kmeans', 'otsu'
  const [clusters, setClusters] = useState(4); // k for kmeans (2 - 8)
  const [palette, setPalette] = useState([]);
  const [thresholdVal, setThresholdVal] = useState(128);
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 600, 600);

      const result = processLab07(imageData, {
        algorithm,
        clusters
      });

      if (result.palette) setPalette(result.palette);
      if (result.threshold) setThresholdVal(result.threshold);

      const canvas = processedCanvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(result.output, 0, 0);

        if (onSnapshotReady) {
          onSnapshotReady(canvas.toDataURL('image/png'));
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(`${elapsed}ms`);
    };
    img.src = currentImage;
  }, [currentImage, algorithm, clusters]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px' }}>
      {/* Visual Canvas Workspace */}
      <div>
        <ImageWorkspace
          originalSrc={currentImage}
          processedCanvasRef={processedCanvasRef}
          onImageChange={onImageChange}
          metrics={{
            latency,
            resolution: '600 × 600',
            extra: algorithm === 'kmeans' ? `K-MEANS (k=${clusters})` : `OTSU (t*=${thresholdVal})`
          }}
        />
      </div>

      {/* Comic Control Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            SEGMENTATION SUITE
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            EXP 07
          </span>
        </div>

        {/* Algorithm Picker */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Segmentation Strategy</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => setAlgorithm('kmeans')}
              className={`comic-tab ${algorithm === 'kmeans' ? 'active' : ''}`}
              style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
            >
              K-Means Colors
            </button>
            <button
              onClick={() => setAlgorithm('otsu')}
              className={`comic-tab ${algorithm === 'otsu' ? 'active' : ''}`}
              style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
            >
              Otsu Auto-Threshold
            </button>
          </div>
        </div>

        {/* K-Means Clusters Slider */}
        {algorithm === 'kmeans' && (
          <div className="comic-control-group">
            <div className="comic-control-label">
              <span>Cluster Count (k Centroids)</span>
              <span style={{ color: 'var(--accent-yellow)', fontWeight: 900 }}>k = {clusters}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={clusters}
              onChange={(e) => setClusters(Number(e.target.value))}
              className="comic-slider"
            />
          </div>
        )}

        {/* Otsu Threshold Feedback */}
        {algorithm === 'otsu' && (
          <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                OPTIMAL THRESHOLD (t*):
              </span>
              <strong style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>
                {thresholdVal}
              </strong>
            </div>
            <p style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
              Maximizes between-class variance σ_B²(t) between foreground and background.
            </p>
          </div>
        )}

        {/* Cluster Palette Swatches */}
        {palette.length > 0 && (
          <div className="comic-control-group">
            <label className="comic-control-label">
              <span>Color Centroids Palette ({palette.length})</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${palette.length}, 1fr)`, gap: '4px' }}>
              {palette.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    height: '34px',
                    background: color,
                    border: '2px solid var(--border-color)',
                    boxShadow: '2px 2px 0px var(--shadow-color)'
                  }}
                  title={`Centroid ${idx + 1}: ${color}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
            METHODOLOGY NOTE:
          </strong>
          <p style={{ fontSize: '10px', opacity: 0.75, lineHeight: 1.5 }}>
            {algorithm === 'kmeans'
              ? 'Unsupervised clustering in 3D RGB Euclidean space grouping perceptually similar color pixels into discrete clusters.'
              : 'Statistical binarization separating bi-modal illumination peaks without requiring manual threshold tuning.'}
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setAlgorithm('kmeans');
            setClusters(4);
          }}
          className="comic-btn comic-btn-secondary"
          style={{ marginTop: '4px', fontSize: '11px' }}
        >
          Reset Segmentation
        </button>
      </div>
    </div>
  );
}
