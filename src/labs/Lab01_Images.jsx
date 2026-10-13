import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import { processLab01, getImageDataFromElement } from '../utils/cvEngine';
import { RotateCw, Crop, Maximize2, MousePointer, Paintbrush, Sliders } from 'lucide-react';

export default function Lab01_Images({ currentImage, onImageChange, onSnapshotReady }) {
  // Part 1 States
  const [colorSpace, setColorSpace] = useState('rgb'); // 'rgb', 'grayscale'
  const [inspectCoord, setInspectCoord] = useState({ x: 150, y: 150 });
  const [pixelValue, setPixelValue] = useState({ r: 240, g: 180, b: 120, gray: 185 });
  const [modifiedPixel, setModifiedPixel] = useState(null);
  const [paintColor, setPaintColor] = useState('#00e5ff');

  // Part 2 States (Image Operations)
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [resizeScale, setResizeScale] = useState(1.0); // 0.5 to 1.5
  const [cropROI, setCropROI] = useState(false);
  const [roiBox, setRoiBox] = useState({ x: 100, y: 100, width: 280, height: 280 });

  // Additional point operations
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [channel, setChannel] = useState('all');

  const [imageDims, setImageDims] = useState({ width: 600, height: 600, channels: 3 });
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);
  const rawImageDataRef = useRef(null);

  // Main CV Processing
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 600, 600);
      rawImageDataRef.current = imageData;
      setImageDims({
        width,
        height,
        channels: colorSpace === 'grayscale' ? 1 : 3
      });

      // Sample current pixel
      samplePixelAt(inspectCoord.x, inspectCoord.y, imageData);

      const result = processLab01(imageData, {
        colorSpace,
        channel,
        brightness,
        contrast,
        rotation,
        resizeScale,
        cropROI,
        roi: roiBox,
        modifiedPixel
      });

      const canvas = processedCanvasRef.current;
      if (canvas && result.canvas) {
        canvas.width = result.width;
        canvas.height = result.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(result.canvas, 0, 0);

        if (onSnapshotReady) {
          onSnapshotReady(canvas.toDataURL('image/png'));
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(`${elapsed}ms`);
    };
    img.src = currentImage;
  }, [currentImage, colorSpace, channel, brightness, contrast, rotation, resizeScale, cropROI, roiBox, modifiedPixel]);

  // Sample pixel at coordinate (Step 3)
  const samplePixelAt = (x, y, srcData = rawImageDataRef.current) => {
    if (!srcData) return;
    const pxX = Math.max(0, Math.min(srcData.width - 1, Math.round(x)));
    const pxY = Math.max(0, Math.min(srcData.height - 1, Math.round(y)));
    const idx = (pxY * srcData.width + pxX) * 4;
    const r = srcData.data[idx];
    const g = srcData.data[idx + 1];
    const b = srcData.data[idx + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    setPixelValue({ r, g, b, gray });
    setInspectCoord({ x: pxX, y: pxY });
  };

  // Modify pixel color at coordinates (Step 3)
  const handleModifyPixel = () => {
    setModifiedPixel({
      x: inspectCoord.x,
      y: inspectCoord.y,
      hex: paintColor,
      size: 24 // 24x24 pixel patch for prominent visual verification
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px' }}>
      {/* Visual Canvas Workspace */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <ImageWorkspace
          originalSrc={currentImage}
          processedCanvasRef={processedCanvasRef}
          onImageChange={onImageChange}
          metrics={{
            latency,
            resolution: `${imageDims.width} × ${imageDims.height}`,
            extra: `SHAPE: (${imageDims.height}, ${imageDims.width}, ${imageDims.channels})`
          }}
        />

        {/* Part 1: Step 2 & 3 Interactive Pixel Inspector Strip */}
        <div className="comic-box" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px' }}>
                PART 1: STEP 3
              </span>
              <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', textTransform: 'uppercase' }}>
                Coordinate &amp; Pixel Value Inspector
              </strong>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
              COORDINATES: ({inspectCoord.x}, {inspectCoord.y})
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
            <div className="comic-box-sm" style={{ padding: '8px', textAlign: 'center', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block' }}>RED (R)</span>
              <strong style={{ fontSize: '16px', color: '#ef4444' }}>{pixelValue.r}</strong>
            </div>
            <div className="comic-box-sm" style={{ padding: '8px', textAlign: 'center', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block' }}>GREEN (G)</span>
              <strong style={{ fontSize: '16px', color: '#10b981' }}>{pixelValue.g}</strong>
            </div>
            <div className="comic-box-sm" style={{ padding: '8px', textAlign: 'center', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block' }}>BLUE (B)</span>
              <strong style={{ fontSize: '16px', color: '#3b82f6' }}>{pixelValue.b}</strong>
            </div>
            <div className="comic-box-sm" style={{ padding: '8px', textAlign: 'center', background: 'var(--bg-surface)' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block' }}>GRAY (Y)</span>
              <strong style={{ fontSize: '16px', color: 'var(--accent-yellow)' }}>{pixelValue.gray}</strong>
            </div>
          </div>

          {/* Coordinate Sliders & Pixel Modification Action */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>X:</label>
              <input
                type="range"
                min="0"
                max={Math.max(1, imageDims.width - 1)}
                value={inspectCoord.x}
                onChange={(e) => samplePixelAt(Number(e.target.value), inspectCoord.y)}
                className="comic-slider"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>Y:</label>
              <input
                type="range"
                min="0"
                max={Math.max(1, imageDims.height - 1)}
                value={inspectCoord.y}
                onChange={(e) => samplePixelAt(inspectCoord.x, Number(e.target.value))}
                className="comic-slider"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={paintColor}
                onChange={(e) => setPaintColor(e.target.value)}
                style={{ width: '32px', height: '32px', border: '2px solid var(--border-color)', cursor: 'pointer', background: 'transparent' }}
                title="Select New Pixel Color"
              />
              <button
                onClick={handleModifyPixel}
                className="comic-btn comic-btn-accent"
                style={{ padding: '6px 12px', fontSize: '10px', gap: '4px' }}
                title="Change pixel's color at specified coordinates (Step 3)"
              >
                <Paintbrush size={13} />
                <span>Paint Pixel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Matrix Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            LAB 01 OPERATIONS
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            STEPS 1–5
          </span>
        </div>

        {/* PART 1: COLOR SPACE CONVERSION (Step 2) */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Part 1: Color Space (Step 2)</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => setColorSpace('rgb')}
              className={`comic-tab ${colorSpace === 'rgb' ? 'active' : ''}`}
              style={{ padding: '6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Color (RGB/BGR)
            </button>
            <button
              onClick={() => setColorSpace('grayscale')}
              className={`comic-tab ${colorSpace === 'grayscale' ? 'active' : ''}`}
              style={{ padding: '6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Grayscale (Y)
            </button>
          </div>
        </div>

        {/* PART 2: ROTATE 90 DEGREES (Step 4) */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Part 2: Rotation (Step 4)</span>
            <span>{rotation}° Clockwise</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {[0, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                onClick={() => setRotation(deg)}
                className={`comic-btn ${rotation === deg ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
                style={{ padding: '6px 2px', fontSize: '10px' }}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        {/* PART 2: RESIZE DIMENSIONS (Step 4) */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Part 2: Resize (Step 4)</span>
            <span>{resizeScale.toFixed(2)}× Scale</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[0.5, 1.0, 1.5].map((scale) => (
              <button
                key={scale}
                onClick={() => setResizeScale(scale)}
                className={`comic-tab ${resizeScale === scale ? 'active' : ''}`}
                style={{ padding: '6px', fontSize: '10px', justifyContent: 'center' }}
              >
                {scale === 0.5 ? '0.5x (Half)' : scale === 1.0 ? '1.0x (Orig)' : '1.5x (Large)'}
              </button>
            ))}
          </div>
        </div>

        {/* PART 2: CROP REGION OF INTEREST (ROI) (Step 4) */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Part 2: Crop ROI (Step 4)</span>
          </label>
          <button
            onClick={() => setCropROI(!cropROI)}
            className={`comic-btn ${cropROI ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
            style={{ fontSize: '11px', padding: '8px', gap: '6px' }}
          >
            <Crop size={14} />
            <span>{cropROI ? 'ROI Crop Active (280×280)' : 'Enable Region of Interest (ROI) Crop'}</span>
          </button>
        </div>

        {/* Additional: Brightness & Contrast Adjustment */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Brightness (Bias β)</span>
            <span>{brightness}</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="comic-slider"
          />
        </div>

        {/* OpenCV Explanation Card */}
        <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
            OPENCV BGR CONVENTION:
          </strong>
          <p style={{ fontSize: '10px', opacity: 0.8, lineHeight: 1.5 }}>
            OpenCV reads color matrices in <code>[Blue, Green, Red]</code> order. For standard RGB display, use <code>cv2.cvtColor(img, cv2.COLOR_BGR2RGB)</code>.
          </p>
        </div>

        {/* Reset All */}
        <button
          onClick={() => {
            setColorSpace('rgb');
            setRotation(0);
            setResizeScale(1.0);
            setCropROI(false);
            setBrightness(0);
            setContrast(0);
            setModifiedPixel(null);
          }}
          className="comic-btn comic-btn-secondary"
          style={{ fontSize: '11px' }}
        >
          Reset Lab 1 Operations
        </button>
      </div>
    </div>
  );
}
