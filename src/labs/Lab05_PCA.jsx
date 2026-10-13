import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import { processLab05, getImageDataFromElement } from '../utils/cvEngine';
import { Layers, Sliders, Cpu, Activity } from 'lucide-react';

export default function Lab05_PCA({ currentImage, onImageChange, onSnapshotReady }) {
  const [components, setComponents] = useState(12); // 1 to 64
  const [compressionRatio, setCompressionRatio] = useState('5.3x');
  const [varianceExplained, setVarianceExplained] = useState('88.4%');
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 480, 480);

      const result = processLab05(imageData, {
        components,
        blockSize: 8
      });

      setCompressionRatio(result.compressionRatio);
      setVarianceExplained(result.varianceExplained);

      const canvas = processedCanvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(result.outputImageData, 0, 0);

        if (onSnapshotReady) {
          onSnapshotReady(canvas.toDataURL('image/png'));
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(`${elapsed}ms`);
    };
    img.src = currentImage;
  }, [currentImage, components]);

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
            resolution: '480 × 480',
            extra: `RECONSTRUCTED (k=${components} / 64)`
          }}
        />
      </div>

      {/* Comic Control Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            PCA EIGEN-DECOMPOSITION
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            EXP 05
          </span>
        </div>

        {/* Principal Components Slider */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Principal Components (k)</span>
            <span style={{ color: 'var(--accent-yellow)', fontWeight: 900 }}>{components} of 64</span>
          </div>
          <input
            type="range"
            min="1"
            max="64"
            value={components}
            onChange={(e) => setComponents(Number(e.target.value))}
            className="comic-slider"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '2px' }}>
            <span>k=1 (Extreme)</span>
            <span>k=16 (Standard)</span>
            <span>k=64 (Lossless)</span>
          </div>
        </div>

        {/* Analytical Metrics Card */}
        <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            EIGENSPACE EFFICIENCY METRICS:
          </strong>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '8px', border: '1.5px solid var(--border-color)' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.7, display: 'block' }}>
                COMPRESSION
              </span>
              <strong style={{ fontSize: '18px', color: 'var(--accent-cyan)' }}>
                {compressionRatio}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '8px', border: '1.5px solid var(--border-color)' }}>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.7, display: 'block' }}>
                VARIANCE KEPT
              </span>
              <strong style={{ fontSize: '18px', color: 'var(--accent-green)' }}>
                {varianceExplained}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: '10px', opacity: 0.75, lineHeight: 1.5 }}>
            Eigen-decomposition projects pixels onto orthonormal eigenvectors maximizing covariance variance. Higher $k$ preserves sharp texture; lower $k$ abstracts high-frequency noise.
          </p>
        </div>

        {/* Quick Component Presets */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Standard Subspaces</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[2, 8, 20, 50].map((kVal) => (
              <button
                key={kVal}
                onClick={() => setComponents(kVal)}
                className={`comic-tab ${components === kVal ? 'active' : ''}`}
                style={{ padding: '6px 4px', fontSize: '10px', justifyContent: 'center' }}
              >
                k={kVal}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => setComponents(12)}
          className="comic-btn comic-btn-secondary"
          style={{ marginTop: '4px', fontSize: '11px' }}
        >
          Reset to k=12 Default
        </button>
      </div>
    </div>
  );
}
