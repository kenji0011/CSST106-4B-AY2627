import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import HistogramCanvas from '../components/HistogramCanvas';
import { processLab03, getImageDataFromElement } from '../utils/cvEngine';
import { BarChart3, Sliders, Layers } from 'lucide-react';

export default function Lab03_Histogram({ currentImage, onImageChange, onSnapshotReady }) {
  const [method, setMethod] = useState('equalization'); // 'equalization', 'clahe', 'stretch'
  const [channel, setChannel] = useState('all'); // 'all', 'luminance'
  const [clipLimit, setClipLimit] = useState(2.0);
  const [gridSize, setGridSize] = useState(8);
  const [activeHistChannel, setActiveHistChannel] = useState('all');
  const [currentImageData, setCurrentImageData] = useState(null);
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 600, 600);

      const result = processLab03(imageData, {
        method,
        channel,
        clipLimit,
        gridSize
      });

      const canvas = processedCanvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(result, 0, 0);

        setCurrentImageData(result);

        if (onSnapshotReady) {
          onSnapshotReady(canvas.toDataURL('image/png'));
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(`${elapsed}ms`);
    };
    img.src = currentImage;
  }, [currentImage, method, channel, clipLimit, gridSize]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px' }}>
      {/* Visual Canvas Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ImageWorkspace
          originalSrc={currentImage}
          processedCanvasRef={processedCanvasRef}
          onImageChange={onImageChange}
          metrics={{ latency, resolution: '600 × 600', extra: `METHOD: ${method.toUpperCase()}` }}
        />

        {/* Real-Time Histogram Graph Below */}
        <div className="comic-box" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 900 }}>
              LIVE PROCESSED SPECTRUM
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['all', 'red', 'green', 'blue', 'luminance'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveHistChannel(ch)}
                  className={`comic-tag ${activeHistChannel === ch ? 'comic-tag-yellow' : 'comic-tag-outline'}`}
                  style={{ cursor: 'pointer', padding: '2px 6px', fontSize: '9px' }}
                >
                  {ch.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <HistogramCanvas
            imageData={currentImageData}
            activeChannel={activeHistChannel}
          />
        </div>
      </div>

      {/* Comic Control Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            EQUALIZATION ENGINE
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            EXP 03
          </span>
        </div>

        {/* Enhancement Method */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Equalization Algorithm</span>
          </label>
          <select
            className="comic-select"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="equalization">Global Histogram Equalization (CDF)</option>
            <option value="clahe">Adaptive CLAHE (Contextual Tiles)</option>
            <option value="stretch">Contrast Stretching (Min-Max Normalization)</option>
          </select>
        </div>

        {/* Target Channel */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Color Equalization Scope</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => setChannel('all')}
              className={`comic-tab ${channel === 'all' ? 'active' : ''}`}
              style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
            >
              All RGB Channels
            </button>
            <button
              onClick={() => setChannel('luminance')}
              className={`comic-tab ${channel === 'luminance' ? 'active' : ''}`}
              style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
            >
              Luminance Only
            </button>
          </div>
        </div>

        {/* CLAHE Parameter Sliders */}
        {method === 'clahe' && (
          <>
            <div className="comic-control-group">
              <div className="comic-control-label">
                <span>Clip Limit (Threshold)</span>
                <span>{clipLimit.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.2"
                value={clipLimit}
                onChange={(e) => setClipLimit(Number(e.target.value))}
                className="comic-slider"
              />
            </div>

            <div className="comic-control-group">
              <div className="comic-control-label">
                <span>Tile Grid Dimension</span>
                <span>{gridSize}×{gridSize}</span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                step="2"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                className="comic-slider"
              />
            </div>
          </>
        )}

        {/* Info Card */}
        <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
            CDF FORMULATION:
          </strong>
          <code style={{ fontSize: '10px', opacity: 0.85, display: 'block' }}>
            s_k = round((L - 1) * sum(p(r_j)))
          </code>
          <p style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
            Spreads clustered probability masses across full [0, 255] dynamic range.
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setMethod('equalization');
            setChannel('all');
            setClipLimit(2.0);
            setGridSize(8);
          }}
          className="comic-btn comic-btn-secondary"
          style={{ marginTop: '4px', fontSize: '11px' }}
        >
          Reset Histogram Settings
        </button>
      </div>
    </div>
  );
}
