import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import { processLab01, getImageDataFromElement } from '../utils/cvEngine';
import { Sliders, Palette, FlipHorizontal, FlipVertical, RotateCw } from 'lucide-react';

export default function Lab01_Images({ currentImage, onImageChange, onSnapshotReady }) {
  const [colorSpace, setColorSpace] = useState('rgb');
  const [channel, setChannel] = useState('all');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [gamma, setGamma] = useState(1.0);
  const [binaryThreshold, setBinaryThreshold] = useState(128);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 600, 600);

      const result = processLab01(imageData, {
        colorSpace,
        channel,
        brightness,
        contrast,
        gamma,
        binaryThreshold,
        flipH,
        flipV
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
  }, [currentImage, colorSpace, channel, brightness, contrast, gamma, binaryThreshold, flipH, flipV]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '20px' }}>
      {/* Visual Canvas Workspace */}
      <div>
        <ImageWorkspace
          originalSrc={currentImage}
          processedCanvasRef={processedCanvasRef}
          onImageChange={onImageChange}
          metrics={{ latency, resolution: '600 × 600', extra: `SPACE: ${colorSpace.toUpperCase()}` }}
        />
      </div>

      {/* Comic Control Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            CONTROL MATRIX
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            EXP 01
          </span>
        </div>

        {/* Color Space Selector */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Color Representation</span>
          </label>
          <select
            className="comic-select"
            value={colorSpace}
            onChange={(e) => setColorSpace(e.target.value)}
          >
            <option value="rgb">RGB (Standard 24-bit)</option>
            <option value="grayscale">Grayscale (Luminance Y)</option>
            <option value="hsv">HSV Space Projection</option>
            <option value="invert">Inverted (Negative Map)</option>
            <option value="binary">Binary (Thresholded)</option>
          </select>
        </div>

        {/* Channel Selector */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Isolated Channel</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['all', 'red', 'green', 'blue'].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={`comic-tab ${channel === ch ? 'active' : ''}`}
                style={{ padding: '6px 8px', fontSize: '10px', justifyContent: 'center' }}
              >
                {ch.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Binary Threshold Slider if Binary */}
        {colorSpace === 'binary' && (
          <div className="comic-control-group">
            <div className="comic-control-label">
              <span>Binarization Threshold</span>
              <span>{binaryThreshold}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={binaryThreshold}
              onChange={(e) => setBinaryThreshold(Number(e.target.value))}
              className="comic-slider"
            />
          </div>
        )}

        {/* Brightness Slider */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Brightness (Bias β)</span>
            <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="comic-slider"
          />
        </div>

        {/* Contrast Slider */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Contrast (Scale α)</span>
            <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="comic-slider"
          />
        </div>

        {/* Gamma Slider */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Gamma Correction (γ)</span>
            <span>{gamma.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            className="comic-slider"
          />
        </div>

        {/* Spatial Reflection Toggles */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Geometric Reflection</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => setFlipH(!flipH)}
              className={`comic-btn ${flipH ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
              style={{ fontSize: '10px', padding: '6px' }}
            >
              <FlipHorizontal size={13} />
              <span>Flip H</span>
            </button>

            <button
              onClick={() => setFlipV(!flipV)}
              className={`comic-btn ${flipV ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
              style={{ fontSize: '10px', padding: '6px' }}
            >
              <FlipVertical size={13} />
              <span>Flip V</span>
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setColorSpace('rgb');
            setChannel('all');
            setBrightness(0);
            setContrast(0);
            setGamma(1.0);
            setBinaryThreshold(128);
            setFlipH(false);
            setFlipV(false);
          }}
          className="comic-btn comic-btn-secondary"
          style={{ marginTop: '4px', fontSize: '11px' }}
        >
          Reset Parameters
        </button>
      </div>
    </div>
  );
}
