import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Eye,
  RotateCw,
  Crop,
  Maximize2,
  Paintbrush,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

export default function Lab01_Images({ currentImage, onImageChange, onSnapshotReady }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [inspectedPixel, setInspectedPixel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Interactive Controls State
  const [action, setAction] = useState('inspect');
  const [pixelCoord, setPixelCoord] = useState({ x: 100, y: 100 });
  const [newColor, setNewColor] = useState('0,255,0'); // B,G,R format e.g. green: 0,255,0
  const [blockSize, setBlockSize] = useState(50);      // Block size in pixels for visible modification
  const [cropCoords, setCropCoords] = useState({ x1: 50, y1: 50, x2: 350, y2: 350 });
  const [resizeScale, setResizeScale] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [backendMode, setBackendMode] = useState('Checking...');

  const fileInputRef = useRef(null);

  // Sync external image changes if provided
  useEffect(() => {
    if (currentImage && currentImage !== previewUrl) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const handleFileSelected = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageChange?.(url);
    runOperationWithFile(file, action);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelected(file);
    }
  };

  // Click on image to pick exact coordinates
  const handleImageClick = (e) => {
    if (!metadata || (action !== 'inspect' && action !== 'modify_pixel')) return;
    const imgEl = e.currentTarget;
    const rect = imgEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const naturalX = Math.round((clickX / rect.width) * metadata.width);
    const naturalY = Math.round((clickY / rect.height) * metadata.height);

    const safeX = Math.min(Math.max(0, naturalX), metadata.width - 1);
    const safeY = Math.min(Math.max(0, naturalY), metadata.height - 1);

    const nextCoord = { x: safeX, y: safeY };
    setPixelCoord(nextCoord);
    if (selectedFile) {
      runOperationWithFile(selectedFile, action, nextCoord);
    }
  };

  // Run operation against FastAPI backend, with client-side canvas fallback
  const runOperation = async (overrideAction = null) => {
    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }
    await runOperationWithFile(selectedFile, overrideAction || action);
  };

  const runOperationWithFile = async (file, currentAction, overrideCoord = null) => {
    setLoading(true);
    const targetCoord = overrideCoord || pixelCoord;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', currentAction);
    formData.append('pixel_x', targetCoord.x);
    formData.append('pixel_y', targetCoord.y);
    formData.append('new_color', newColor);
    formData.append('block_size', blockSize);
    formData.append('crop_x1', cropCoords.x1);
    formData.append('crop_y1', cropCoords.y1);
    formData.append('crop_x2', cropCoords.x2);
    formData.append('crop_y2', cropCoords.y2);
    formData.append('resize_scale', resizeScale);

    try {
      // 1. Try FastAPI backend on port 8000
      const response = await fetch('http://localhost:8000/api/lab01/process', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setProcessedImageUrl(data.processed_image_base64);
      setMetadata(data.metadata);
      setInspectedPixel(data.inspected_pixel);
      setBackendMode('FASTAPI • OPENCV (PORT 8000)');

      if (onSnapshotReady) {
        onSnapshotReady(data.processed_image_base64);
      }
    } catch (err) {
      console.warn('FastAPI backend not reached, using client-side OpenCV fallback:', err);
      // 2. Client-side fallback matching identical output schema
      await runClientSideFallback(file, currentAction, targetCoord);
      setBackendMode('IN-BROWSER CANVAS ENGINE');
    } finally {
      setLoading(false);
    }
  };

  // Client-side fallback implementation for 100% offline reliability
  const runClientSideFallback = (file, currentAction, overrideCoord = null) => {
    const targetCoord = overrideCoord || pixelCoord;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const safeX = Math.min(Math.max(0, targetCoord.x), width - 1);
        const safeY = Math.min(Math.max(0, targetCoord.y), height - 1);
        const pData = ctx.getImageData(safeX, safeY, 1, 1).data;
        const b = pData[2], g = pData[1], r = pData[0];

        const meta = {
          height,
          width,
          channels: 3,
          shape: `(${height}, ${width}, 3)`,
          color_order: 'BGR (OpenCV standard: Blue, Green, Red)'
        };
        const inspected = {
          x: safeX,
          y: safeY,
          bgr: [b, g, r],
          rgb: [r, g, b]
        };

        let targetCanvas = canvas;

        if (currentAction === 'grayscale') {
          const imgData = ctx.getImageData(0, 0, width, height);
          for (let i = 0; i < imgData.data.length; i += 4) {
            const gray = Math.round(0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2]);
            imgData.data[i] = gray;
            imgData.data[i + 1] = gray;
            imgData.data[i + 2] = gray;
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (currentAction === 'modify_pixel') {
          const half = Math.max(1, Math.round(blockSize / 2));
          try {
            const [bV, gV, rV] = newColor.split(',').map(Number);
            ctx.fillStyle = `rgb(${rV}, ${gV}, ${bV})`;
            ctx.fillRect(Math.max(0, safeX - half), Math.max(0, safeY - half), blockSize, blockSize);
          } catch {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(Math.max(0, safeX - half), Math.max(0, safeY - half), blockSize, blockSize);
          }
        } else if (currentAction === 'crop') {
          const x1 = Math.min(cropCoords.x1, cropCoords.x2);
          const x2 = Math.max(cropCoords.x1, cropCoords.x2);
          const y1 = Math.min(cropCoords.y1, cropCoords.y2);
          const y2 = Math.max(cropCoords.y1, cropCoords.y2);
          const cW = Math.max(1, x2 - x1);
          const cH = Math.max(1, y2 - y1);
          const cCanvas = document.createElement('canvas');
          cCanvas.width = cW;
          cCanvas.height = cH;
          const cCtx = cCanvas.getContext('2d');
          cCtx.drawImage(canvas, x1, y1, cW, cH, 0, 0, cW, cH);
          targetCanvas = cCanvas;
        } else if (currentAction === 'resize') {
          const newW = Math.max(1, Math.round(width * resizeScale));
          const newH = Math.max(1, Math.round(height * resizeScale));
          const rCanvas = document.createElement('canvas');
          rCanvas.width = newW;
          rCanvas.height = newH;
          const rCtx = rCanvas.getContext('2d');
          rCtx.drawImage(canvas, 0, 0, newW, newH);
          targetCanvas = rCanvas;
        } else if (currentAction === 'rotate') {
          const rotCanvas = document.createElement('canvas');
          rotCanvas.width = height;
          rotCanvas.height = width;
          const rotCtx = rotCanvas.getContext('2d');
          rotCtx.translate(height / 2, width / 2);
          rotCtx.rotate((90 * Math.PI) / 180);
          rotCtx.drawImage(canvas, -width / 2, -height / 2);
          targetCanvas = rotCanvas;
        }

        const base64Url = targetCanvas.toDataURL('image/jpeg', 0.92);
        setProcessedImageUrl(base64Url);
        setMetadata(meta);
        setInspectedPixel(inspected);
        if (onSnapshotReady) onSnapshotReady(base64Url);
        resolve();
      };
      img.src = previewUrl;
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: '24px' }}>
      {/* LEFT COLUMN: COMIC CONTROLS MATRIX */}
      <div className="comic-box" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', height: 'fit-content' }}>
        {/* Section 1: Image Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
              1. INPUT IMAGE
            </span>
            <span className={previewUrl ? "comic-tag comic-tag-green" : "comic-tag comic-tag-yellow"} style={{ fontSize: '9px' }}>
              {previewUrl ? 'LOADED' : 'STEP 1'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`comic-btn ${previewUrl ? 'comic-btn-secondary' : 'comic-btn-accent'}`}
              style={{ padding: '9px 12px', fontSize: '11px', width: '100%', gap: '6px' }}
            >
              <Upload size={14} />
              <span>{previewUrl ? 'Upload Different Image' : 'Upload Image'}</span>
            </button>

            {previewUrl && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', fontWeight: 700 }}>
                  {selectedFile?.name || 'custom_image.jpg'}
                </span>
                <span style={{ opacity: 0.6 }}>
                  {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Operation Buttons */}
        <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
              2. SELECT OPERATION
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '9px' }}>
              6 MODES
            </span>
          </div>

          {!previewUrl && (
            <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', border: '1.5px dashed var(--border-color)', marginBottom: '10px', fontSize: '10px', fontFamily: 'var(--font-mono)', textAlign: 'center', opacity: 0.8 }}>
              Upload an image first to unlock operations
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', opacity: previewUrl ? 1 : 0.45, pointerEvents: previewUrl ? 'auto' : 'none' }}>
            <button
              disabled={!previewUrl}
              onClick={() => { setAction('inspect'); runOperation('inspect'); }}
              className={`comic-tab ${action === 'inspect' ? 'active' : ''}`}
              style={{ padding: '8px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Inspect Properties
            </button>

            <button
              disabled={!previewUrl}
              onClick={() => { setAction('grayscale'); runOperation('grayscale'); }}
              className={`comic-tab ${action === 'grayscale' ? 'active' : ''}`}
              style={{ padding: '8px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Grayscale
            </button>

            <button
              disabled={!previewUrl}
              onClick={() => { setAction('rotate'); runOperation('rotate'); }}
              className={`comic-tab ${action === 'rotate' ? 'active' : ''}`}
              style={{ padding: '8px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Rotate 90°
            </button>

            <button
              disabled={!previewUrl}
              onClick={() => setAction('resize')}
              className={`comic-tab ${action === 'resize' ? 'active' : ''}`}
              style={{ padding: '8px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Resize Image
            </button>

            <button
              disabled={!previewUrl}
              onClick={() => setAction('crop')}
              className={`comic-tab ${action === 'crop' ? 'active' : ''}`}
              style={{ padding: '8px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Crop (ROI)
            </button>

            <button
              disabled={!previewUrl}
              onClick={() => setAction('modify_pixel')}
              className={`comic-tab ${action === 'modify_pixel' ? 'active' : ''}`}
              style={{ padding: '8px 6px', fontSize: '10px', justifyContent: 'center' }}
            >
              Modify Pixel
            </button>
          </div>
        </div>

        {/* Section 3: Sub-Controls (Conditional based on active operation) */}
        {previewUrl && (
          <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px' }}>
            {action === 'resize' && (
              <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="comic-control-label">
                  <span>Scale Factor</span>
                  <strong style={{ color: 'var(--accent-yellow)' }}>{resizeScale}×</strong>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={resizeScale}
                  onChange={(e) => setResizeScale(parseFloat(e.target.value))}
                  className="comic-slider"
                />
                <button
                  onClick={() => runOperation('resize')}
                  className="comic-btn comic-btn-accent"
                  style={{ width: '100%', padding: '6px', fontSize: '11px' }}
                >
                  Apply Resize (cv2.resize)
                </button>
              </div>
            )}

            {action === 'crop' && (
              <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800 }}>
                  CROP REGION: (x1, y1) TO (x2, y2)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>x1 (col min)</label>
                    <input
                      type="number"
                      value={cropCoords.x1}
                      onChange={(e) => setCropCoords({ ...cropCoords, x1: +e.target.value })}
                      className="comic-input"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>y1 (row min)</label>
                    <input
                      type="number"
                      value={cropCoords.y1}
                      onChange={(e) => setCropCoords({ ...cropCoords, y1: +e.target.value })}
                      className="comic-input"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>x2 (col max)</label>
                    <input
                      type="number"
                      value={cropCoords.x2}
                      onChange={(e) => setCropCoords({ ...cropCoords, x2: +e.target.value })}
                      className="comic-input"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>y2 (row max)</label>
                    <input
                      type="number"
                      value={cropCoords.y2}
                      onChange={(e) => setCropCoords({ ...cropCoords, y2: +e.target.value })}
                      className="comic-input"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => runOperation('crop')}
                  className="comic-btn comic-btn-accent"
                  style={{ width: '100%', padding: '6px', fontSize: '11px' }}
                >
                  Apply Crop (Array Slice)
                </button>
              </div>
            )}

            {(action === 'inspect' || action === 'modify_pixel') && (
              <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800 }}>
                    PIXEL COORDINATES (X, Y)
                  </span>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--accent-yellow)' }}>
                    TARGET: ({pixelCoord.x}, {pixelCoord.y})
                  </span>
                </div>

                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.85, padding: '5px 8px', background: 'var(--bg-card)', border: '1.5px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎯</span>
                  <span><strong>Tip:</strong> Click anywhere on the original photo to pick coordinates!</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>X (Column)</label>
                    <input
                      type="number"
                      value={pixelCoord.x}
                      onChange={(e) => setPixelCoord({ ...pixelCoord, x: +e.target.value })}
                      className="comic-input"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>Y (Row)</label>
                    <input
                      type="number"
                      value={pixelCoord.y}
                      onChange={(e) => setPixelCoord({ ...pixelCoord, y: +e.target.value })}
                      className="comic-input"
                      style={{ padding: '4px 6px', fontSize: '11px' }}
                    />
                  </div>
                </div>

                {action === 'modify_pixel' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.7, display: 'block', marginBottom: '3px' }}>
                        Patch Size (Higher is easier to spot on high-res photos):
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                        {[
                          { label: '1px', size: 1 },
                          { label: '20px', size: 20 },
                          { label: '50px', size: 50 },
                          { label: '100px', size: 100 }
                        ].map((preset) => (
                          <button
                            key={preset.size}
                            type="button"
                            onClick={() => setBlockSize(preset.size)}
                            className={`comic-tab ${blockSize === preset.size ? 'active' : ''}`}
                            style={{ padding: '4px 2px', fontSize: '10px', justifyContent: 'center' }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.8, display: 'block', marginBottom: '4px' }}>
                        Replacement BGR Color:
                      </label>
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="comic-input"
                        placeholder="B,G,R e.g. 0,255,0"
                        style={{ padding: '6px 8px', fontSize: '11px' }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Green', bgr: '0,255,0', bg: '#00ff00', color: '#000' },
                          { label: 'Red', bgr: '0,0,255', bg: '#ff2222', color: '#fff' },
                          { label: 'Blue', bgr: '255,0,0', bg: '#0066ff', color: '#fff' },
                          { label: 'Yellow', bgr: '0,255,255', bg: '#ffe600', color: '#000' },
                          { label: 'White', bgr: '255,255,255', bg: '#ffffff', color: '#000' }
                        ].map((c) => (
                          <button
                            key={c.bgr}
                            type="button"
                            onClick={() => setNewColor(c.bgr)}
                            className="comic-btn"
                            style={{
                              padding: '2px 6px',
                              fontSize: '9px',
                              background: newColor === c.bgr ? c.bg : 'var(--bg-card)',
                              color: newColor === c.bgr ? c.color : 'var(--text-primary)',
                              border: '1.5px solid var(--border-color)'
                            }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => runOperation()}
                  className="comic-btn comic-btn-accent"
                  style={{ width: '100%', padding: '7px', fontSize: '11px', marginTop: '2px' }}
                >
                  {action === 'modify_pixel' ? 'Apply Pixel Change (cv2.rectangle)' : 'Inspect Coordinate Values'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Engine status indicator */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', opacity: 0.6, borderTop: '2px dashed var(--border-color)', paddingTop: '10px' }}>
          ENGINE: <strong>{backendMode}</strong>
        </div>
      </div>

      {/* RIGHT COLUMN: VISUAL OUTPUTS & METADATA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!previewUrl ? (
          <div
            className="comic-box"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              padding: '64px 28px',
              border: isDragging ? '3px dashed var(--accent-yellow)' : '2.5px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'var(--bg-surface)' : 'var(--bg-card)',
              minHeight: '440px',
              gap: '18px',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                border: '2.5px solid var(--border-color)',
                background: 'var(--accent-yellow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000'
              }}
            >
              <Upload size={32} />
            </div>

            <div style={{ maxWidth: '480px' }}>
              <div className="comic-tag comic-tag-yellow" style={{ fontSize: '10px', marginBottom: '10px' }}>
                IMAGE REQUIRED
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>
                PLEASE UPLOAD AN IMAGE TO PROCEED
              </h2>
              <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6 }}>
                Upload an image to start experimenting with OpenCV image operations, pixel coordinates inspection, BGR color channels, cropping, resizing, and rotation.
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="comic-btn comic-btn-accent"
              style={{ padding: '12px 28px', fontSize: '12px', gap: '8px', marginTop: '6px' }}
            >
              <Upload size={16} />
              <span>Upload Image</span>
            </button>

            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
              Drag &amp; drop file here, or click to browse (PNG, JPG, JPEG, WEBP)
            </span>
          </div>
        ) : (
          <>
            {/* Side-by-Side Dual Image Display */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Original Input Card */}
              <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="comic-tag" style={{ fontSize: '10px' }}>
                    ORIGINAL INPUT
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6 }}>
                    BGR COLOR
                  </span>
                </div>

                <div style={{ width: '100%', height: '360px', background: '#050608', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={previewUrl} alt="Original Input" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Processed Output Card */}
              <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px' }}>
                    PROCESSED OUTPUT ({action.toUpperCase()})
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-green)', fontWeight: 700 }}>
                    {loading ? 'PROCESSING...' : 'RESULT READY'}
                  </span>
                </div>

                <div style={{ width: '100%', height: '360px', background: '#050608', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div className="comic-tag comic-tag-yellow animate-pulse">EXECUTING OPENCV...</div>
                    </div>
                  ) : processedImageUrl ? (
                    <img src={processedImageUrl} alt="Processed Output" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '11px', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>Run an operation to see output</span>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Display Cards */}
            {metadata && (
              <div className="comic-box" style={{ padding: '18px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 900 }}>
                    OPENCV METADATA &amp; MATRIX PROPERTIES
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                  {/* Dimensions */}
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginBottom: '2px' }}>
                      DIMENSIONS (H × W)
                    </span>
                    <strong style={{ fontSize: '15px' }}>
                      {metadata.height} × {metadata.width}
                    </strong>
                  </div>

                  {/* Channels */}
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginBottom: '2px' }}>
                      CHANNELS
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--accent-cyan)' }}>
                      {metadata.channels} ({metadata.color_order.split(' ')[0]})
                    </strong>
                  </div>

                  {/* Inspected Pixel */}
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginBottom: '2px' }}>
                      INSPECTED PIXEL ({inspectedPixel?.x}, {inspectedPixel?.y})
                    </span>
                    <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-yellow)' }}>
                      BGR: [{inspectedPixel?.bgr?.join(', ')}]
                    </strong>
                  </div>

                  {/* Numpy Shape */}
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', opacity: 0.6, marginBottom: '2px' }}>
                      NUMPY ARRAY SHAPE
                    </span>
                    <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                      {metadata.shape}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
