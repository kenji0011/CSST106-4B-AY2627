import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { Upload, Download, Split, Columns2, Eye, RefreshCw, Cpu, Image as ImageIcon } from 'lucide-react';

export default function ImageWorkspace({
  originalSrc,
  processedCanvasRef,
  processedDataUrl,
  onImageChange,
  metrics = {},
  overlayContent = null
}) {
  const [viewStyle, setViewStyle] = useState('split'); // 'split', 'side', 'single'
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Split slider mouse/touch tracking
  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onTouchMove = (e) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, handleMove]);

  // Handle custom file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download resulting output
  const handleDownload = () => {
    if (!processedCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `csst106_output_${Date.now()}.png`;
    link.href = processedCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Bar: Sample Selectors & Workspace View Toggles */}
      <div className="comic-box-sm" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {/* Sample Image Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800 }}>
            TEST IMAGE:
          </span>
          <select
            className="comic-select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '11px' }}
            onChange={(e) => {
              const selected = SAMPLE_IMAGES.find(img => img.id === e.target.value);
              if (selected) onImageChange(selected.url);
            }}
          >
            {SAMPLE_IMAGES.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="comic-btn comic-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '11px' }}
            title="Upload Custom Image"
          >
            <Upload size={13} />
            <span>Upload</span>
          </button>
        </div>

        {/* View Mode (Split, Side-by-Side, Output Only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewStyle('split')}
            className={`comic-tab ${viewStyle === 'split' ? 'active' : ''}`}
            style={{ padding: '5px 10px', fontSize: '11px' }}
            title="Split Comparison Slider"
          >
            <Split size={13} />
            <span>Split</span>
          </button>

          <button
            onClick={() => setViewStyle('side')}
            className={`comic-tab ${viewStyle === 'side' ? 'active' : ''}`}
            style={{ padding: '5px 10px', fontSize: '11px' }}
            title="Side-by-Side View"
          >
            <Columns2 size={13} />
            <span>Dual</span>
          </button>

          <button
            onClick={() => setViewStyle('single')}
            className={`comic-tab ${viewStyle === 'single' ? 'active' : ''}`}
            style={{ padding: '5px 10px', fontSize: '11px' }}
            title="Output Only"
          >
            <Eye size={13} />
            <span>Output</span>
          </button>

          <button
            onClick={handleDownload}
            className="comic-btn comic-btn-accent"
            style={{ padding: '6px 12px', fontSize: '11px' }}
            title="Save Rendered Output"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Render Area */}
      <div className="comic-box" style={{ padding: '4px', overflow: 'hidden', position: 'relative' }}>
        {/* VIEW STYLE: SPLIT SLIDER */}
        {viewStyle === 'split' && (
          <div
            ref={containerRef}
            className="split-compare-container"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {/* Processed (Background Layer) */}
            <div className="split-layer">
              <canvas
                ref={processedCanvasRef}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Original (Foreground Clipped Layer) */}
            <div
              className="split-layer"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
              }}
            >
              <img
                src={originalSrc}
                alt="Original CV Input"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Draggable Divider */}
            <div
              className="split-divider"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="split-divider-handle">
                ⇄
              </div>
            </div>

            {/* Watermark Tags */}
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 30 }}>
              <span className="comic-tag" style={{ fontSize: '10px' }}>
                ORIGINAL INPUT
              </span>
            </div>
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 30 }}>
              <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px' }}>
                PROCESSED OUTPUT
              </span>
            </div>

            {/* Overlay (e.g. YOLO Bounding Boxes) */}
            {overlayContent}
          </div>
        )}

        {/* VIEW STYLE: SIDE BY SIDE */}
        {viewStyle === 'side' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', minHeight: '440px', background: '#050608', padding: '8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <span className="comic-tag" style={{ fontSize: '10px' }}>ORIGINAL INPUT</span>
              </div>
              <img
                src={originalSrc}
                alt="Original"
                style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px' }}>PROCESSED OUTPUT</span>
              </div>
              <canvas
                ref={processedCanvasRef}
                style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
              />
              {overlayContent}
            </div>
          </div>
        )}

        {/* VIEW STYLE: OUTPUT ONLY */}
        {viewStyle === 'single' && (
          <div style={{ minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050608', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
              <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px' }}>PROCESSED OUTPUT</span>
            </div>
            <canvas
              ref={processedCanvasRef}
              style={{ maxWidth: '100%', maxHeight: '520px', objectFit: 'contain' }}
            />
            {overlayContent}
          </div>
        )}
      </div>

      {/* Bottom Status & Metrics Strip */}
      <div className="comic-box-sm" style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Cpu size={13} />
            <span>LATENCY:</span> <strong>{metrics.latency || '8ms'}</strong>
          </span>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.8 }}>
            RESOLUTION: <strong>{metrics.resolution || '600 × 600'}</strong>
          </span>

          {metrics.extra && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-green)' }}>
              {metrics.extra}
            </span>
          )}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.7 }}>
          ENGINE: <strong>CLIENT-SIDE CANVAS &amp; TYPEDARRAY CV</strong>
        </div>
      </div>
    </div>
  );
}
