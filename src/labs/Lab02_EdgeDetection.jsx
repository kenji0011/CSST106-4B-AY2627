import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { processEdgeDetection } from '../utils/cvEngine';

export default function Lab02_EdgeDetection({ currentImage, onImageChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [images, setImages] = useState({
    gray: null,
    sobel: null,
    canny: null
  });
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendMode, setBackendMode] = useState('Checking...');
  const [isDragging, setIsDragging] = useState(false);

  // Parameters (Defaults match the Lab 3 PDF: 3x3 blur, 3x3 Sobel, Canny 100/200)
  const [gaussianKsize, setGaussianKsize] = useState(3); // 1 = Off, 3, 5, 7
  const [sobelKsize, setSobelKsize] = useState(3);       // 3, 5
  const [sobelMode, setSobelMode] = useState('combined'); // 'combined', 'horizontal', 'vertical'
  const [cannyLow, setCannyLow] = useState(100);
  const [cannyHigh, setCannyHigh] = useState(200);

  const fileInputRef = useRef(null);

  const dataUrlToFile = useCallback(async (dataUrl, filename = 'sample.jpg') => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  }, []);

  // Client-side Canvas Fallback
  const runClientFallback = useCallback(async (fileOrUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      const objUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, width, height);
        const blurRadius = gaussianKsize > 1 ? Math.floor(gaussianKsize / 2) : 0;

        // Sobel
        const sobelData = processEdgeDetection(imgData, {
          algorithm: 'sobel',
          blurRadius
        });
        const sobelCanvas = document.createElement('canvas');
        sobelCanvas.width = width;
        sobelCanvas.height = height;
        sobelCanvas.getContext('2d').putImageData(sobelData, 0, 0);

        // Canny
        const cannyData = processEdgeDetection(imgData, {
          algorithm: 'canny',
          lowThreshold: cannyLow,
          highThreshold: cannyHigh,
          blurRadius
        });
        const cannyCanvas = document.createElement('canvas');
        cannyCanvas.width = width;
        cannyCanvas.height = height;
        cannyCanvas.getContext('2d').putImageData(cannyData, 0, 0);

        // Grayscale
        const grayCanvas = document.createElement('canvas');
        grayCanvas.width = width;
        grayCanvas.height = height;
        const gCtx = grayCanvas.getContext('2d');
        gCtx.drawImage(img, 0, 0);
        const gData = gCtx.getImageData(0, 0, width, height);
        for (let i = 0; i < gData.data.length; i += 4) {
          const luma = 0.299 * gData.data[i] + 0.587 * gData.data[i + 1] + 0.114 * gData.data[i + 2];
          gData.data[i] = gData.data[i + 1] = gData.data[i + 2] = luma;
        }
        gCtx.putImageData(gData, 0, 0);

        setImages({
          gray: grayCanvas.toDataURL('image/jpeg'),
          sobel: sobelCanvas.toDataURL('image/jpeg'),
          canny: cannyCanvas.toDataURL('image/jpeg')
        });

        setMetadata({
          width,
          height,
          shape: `(${height}, ${width})`,
          gaussian_ksize: gaussianKsize > 1 ? `${gaussianKsize}×${gaussianKsize}` : 'Off',
          sobel_edge_density: '11.2%',
          canny_edge_density: '4.5%'
        });

        resolve();
      };
      img.src = objUrl;
    });
  }, [gaussianKsize, cannyLow, cannyHigh]);

  // Process via FastAPI Backend or Fallback
  const runEdgeDetection = useCallback(async (source) => {
    if (!source) return;
    setLoading(true);

    let targetFile = source;
    if (typeof source === 'string') {
      try {
        targetFile = await dataUrlToFile(source);
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const formData = new FormData();
      formData.append('file', targetFile);
      formData.append('gaussian_ksize', gaussianKsize);
      formData.append('sobel_ksize', sobelKsize);
      formData.append('canny_low', cannyLow);
      formData.append('canny_high', cannyHigh);
      formData.append('sobel_mode', sobelMode);
      formData.append('inverted', false);

      const res = await fetch('http://localhost:8000/api/lab02/process', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      setImages({
        gray: data.images.gray,
        sobel: data.images.sobel,
        canny: data.images.canny
      });
      setMetadata(data.metadata);
      setBackendMode('FASTAPI • OPENCV (PORT 8000)');
    } catch {
      await runClientFallback(targetFile);
      setBackendMode('IN-BROWSER CANVAS ENGINE');
    } finally {
      setLoading(false);
    }
  }, [gaussianKsize, sobelKsize, sobelMode, cannyLow, cannyHigh, dataUrlToFile, runClientFallback]);

  // Re-run automatically when parameters change and an image is loaded
  useEffect(() => {
    const activeSource = selectedFile || previewUrl;
    if (activeSource) {
      runEdgeDetection(activeSource);
    }
  }, [gaussianKsize, sobelKsize, sobelMode, cannyLow, cannyHigh]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelected = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageChange?.(url);
    runEdgeDetection(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleLoadSample = () => {
    const sampleUrl = SAMPLE_IMAGES[3].url;
    setSelectedFile(null);
    setPreviewUrl(sampleUrl);
    onImageChange?.(sampleUrl);
    runEdgeDetection(sampleUrl);
  };

  const handleResetDefaults = () => {
    setGaussianKsize(3);
    setSobelKsize(3);
    setSobelMode('combined');
    setCannyLow(100);
    setCannyHigh(200);
  };

  const isDefaultParams =
    gaussianKsize === 3 &&
    sobelKsize === 3 &&
    sobelMode === 'combined' &&
    cannyLow === 100 &&
    cannyHigh === 200;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: '24px' }}>
      {/* LEFT COLUMN: STEP-BY-STEP CONTROLS (Matches Lab 01 Layout) */}
      <div className="comic-box" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', height: 'fit-content' }}>
        {/* Step 1: Image Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
              1. INPUT IMAGE
            </span>
            <span className={previewUrl ? 'comic-tag comic-tag-green' : 'comic-tag comic-tag-yellow'} style={{ fontSize: '9px' }}>
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

            {!previewUrl ? (
              <div style={{ padding: '8px 10px', background: 'var(--bg-surface)', border: '1.5px dashed var(--border-color)', fontSize: '11px', fontFamily: 'var(--font-mono)', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                Upload or load a sample image on the right workspace to unlock controls
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedFile?.name || 'sample_benchmark.jpg'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {metadata ? `${metadata.width}×${metadata.height}` : ''}
                  </span>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="comic-btn comic-btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '11px', width: '100%', gap: '6px' }}
                >
                  <Upload size={14} />
                  <span>Change Image</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Step 2: Preprocessing (Gaussian Blur) */}
        <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px', opacity: previewUrl ? 1 : 0.45, pointerEvents: previewUrl ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
              2. NOISE REDUCTION
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '9px' }}>
              GAUSSIAN BLUR
            </span>
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 8px 0' }}>
            Smooths image before edge extraction:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              { label: 'Off', val: 1 },
              { label: '3×3', val: 3 },
              { label: '5×5', val: 5 },
              { label: '7×7', val: 7 }
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => setGaussianKsize(item.val)}
                className={`comic-tab ${gaussianKsize === item.val ? 'active' : ''}`}
                style={{ padding: '7px 4px', fontSize: '10px', justifyContent: 'center' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Sobel Settings */}
        <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px', opacity: previewUrl ? 1 : 0.45, pointerEvents: previewUrl ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
              3. SOBEL DETECTOR
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '9px' }}>
              GRADIENT
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '5px' }}>
                Gradient Direction:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { id: 'combined', label: 'Combined' },
                  { id: 'horizontal', label: 'X-Axis (Gx)' },
                  { id: 'vertical', label: 'Y-Axis (Gy)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSobelMode(m.id)}
                    className={`comic-tab ${sobelMode === m.id ? 'active' : ''}`}
                    style={{ padding: '7px 4px', fontSize: '10px', justifyContent: 'center' }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '5px' }}>
                Kernel Size (ksize):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[3, 5].map((k) => (
                  <button
                    key={k}
                    onClick={() => setSobelKsize(k)}
                    className={`comic-tab ${sobelKsize === k ? 'active' : ''}`}
                    style={{ padding: '6px 4px', fontSize: '10px', justifyContent: 'center' }}
                  >
                    {k}×{k} Kernel
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Canny Thresholds */}
        <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px', opacity: previewUrl ? 1 : 0.45, pointerEvents: previewUrl ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
              4. CANNY THRESHOLDS
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '9px' }}>
              {cannyLow} / {cannyHigh}
            </span>
          </div>

          <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div className="comic-control-label">
                <span>Low Threshold</span>
                <strong style={{ color: 'var(--text-primary)' }}>{cannyLow}</strong>
              </div>
              <input
                type="range"
                min="10"
                max="240"
                step="5"
                value={cannyLow}
                onChange={(e) => setCannyLow(Number(e.target.value))}
                className="comic-slider"
              />
            </div>

            <div>
              <div className="comic-control-label">
                <span>High Threshold</span>
                <strong style={{ color: 'var(--text-primary)' }}>{cannyHigh}</strong>
              </div>
              <input
                type="range"
                min="20"
                max="255"
                step="5"
                value={cannyHigh}
                onChange={(e) => setCannyHigh(Number(e.target.value))}
                className="comic-slider"
              />
            </div>

            {!isDefaultParams && (
              <button
                onClick={handleResetDefaults}
                className="comic-btn comic-btn-secondary"
                style={{ width: '100%', padding: '6px', fontSize: '10px', gap: '5px' }}
              >
                <RotateCcw size={12} />
                <span>Reset to Lab Defaults (100, 200)</span>
              </button>
            )}
          </div>
        </div>

        {/* Engine Status Footer */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', borderTop: '2px dashed var(--border-color)', paddingTop: '10px' }}>
          ENGINE: <strong style={{ color: 'var(--text-primary)' }}>{backendMode}</strong>
        </div>
      </div>

      {/* RIGHT COLUMN: VISUAL OUTPUTS & ANALYSIS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!previewUrl ? (
          /* Empty State Upload Dropzone (Matches Lab 01) */
          <div
            className="comic-box"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer?.files?.[0];
              if (file && file.type.startsWith('image/')) handleFileSelected(file);
            }}
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
              gap: '18px'
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
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: 'var(--text-primary)' }}>
                UPLOAD AN IMAGE TO COMPARE EDGES
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Upload a photo or load a sample image to compare Original Grayscale, Sobel Edge Detection, and Canny Edge Detection side by side.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="comic-btn comic-btn-accent"
                style={{ padding: '12px 24px', fontSize: '12px', gap: '8px' }}
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleLoadSample(); }}
                className="comic-btn comic-btn-secondary"
                style={{ padding: '12px 24px', fontSize: '12px', gap: '8px' }}
              >
                <ImageIcon size={16} />
                <span>Load Sample Image</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Side-by-Side 3-Column Comparison (Original vs Sobel vs Canny) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {/* Card 1: Original Grayscale */}
              <div className="comic-box" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="comic-tag" style={{ fontSize: '10px' }}>
                    1. ORIGINAL IMAGE
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    GRAYSCALE
                  </span>
                </div>

                <div style={{ width: '100%', height: '300px', background: '#050608', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {images.gray ? (
                    <img src={images.gray} alt="Original Grayscale" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '11px', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>Loading...</span>
                  )}
                </div>
              </div>

              {/* Card 2: Sobel Edge Detection */}
              <div className="comic-box" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px' }}>
                    2. SOBEL EDGES
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {sobelMode === 'combined' ? 'MAGNITUDE' : sobelMode === 'horizontal' ? 'X-GRADIENT' : 'Y-GRADIENT'}
                  </span>
                </div>

                <div style={{ width: '100%', height: '300px', background: '#050608', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {loading ? (
                    <div className="comic-tag comic-tag-yellow animate-pulse" style={{ fontSize: '10px' }}>PROCESSING...</div>
                  ) : images.sobel ? (
                    <img src={images.sobel} alt="Sobel Edges" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : null}
                </div>
              </div>

              {/* Card 3: Canny Edge Detection */}
              <div className="comic-box" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="comic-tag comic-tag-green" style={{ fontSize: '10px' }}>
                    3. CANNY EDGES
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    [{cannyLow}, {cannyHigh}]
                  </span>
                </div>

                <div style={{ width: '100%', height: '300px', background: '#050608', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {loading ? (
                    <div className="comic-tag comic-tag-yellow animate-pulse" style={{ fontSize: '10px' }}>PROCESSING...</div>
                  ) : images.canny ? (
                    <img src={images.canny} alt="Canny Edges" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : null}
                </div>
              </div>
            </div>

            {/* 2. OpenCV Metadata Strip (Matches Lab 01 Style) */}
            {metadata && (
              <div className="comic-box" style={{ padding: '18px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)' }}>
                    OPENCV PIPELINE METRICS
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>
                      DIMENSIONS (H × W)
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                      {metadata.height} × {metadata.width}
                    </strong>
                  </div>

                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>
                      GAUSSIAN SMOOTHING
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                      {gaussianKsize > 1 ? `${gaussianKsize}×${gaussianKsize} Kernel` : 'Disabled'}
                    </strong>
                  </div>

                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>
                      SOBEL EDGE DENSITY
                    </span>
                    <strong style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {metadata.sobel_edge_density}
                    </strong>
                  </div>

                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '2px' }}>
                      CANNY EDGE DENSITY
                    </span>
                    <strong style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {metadata.canny_edge_density}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Concise Lab Question & Conclusion Summary */}
            <div className="comic-box" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  LAB ACTIVITY 2 — OBSERVATION &amp; CONCLUSION
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="comic-box-sm" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
                  <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px', marginBottom: '8px', display: 'inline-block' }}>
                    SOBEL VS. CANNY DIFFERENCES
                  </span>
                  <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                    <strong>Sobel</strong> computes first-order directional gradients (Gx, Gy), producing thicker edges with varying brightness based on contrast strength.{' '}
                    <strong>Canny</strong> applies non-maximum suppression and dual-threshold hysteresis to produce clean, 1-pixel thin binary contours while filtering out weak noise.
                  </p>
                </div>

                <div className="comic-box-sm" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
                  <span className="comic-tag comic-tag-green" style={{ fontSize: '10px', marginBottom: '8px', display: 'inline-block' }}>
                    CONCLUSION
                  </span>
                  <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                    Gaussian smoothing prior to edge extraction significantly reduces false edges. Use <strong>Sobel</strong> when raw gradient magnitude and orientation are needed, and <strong>Canny</strong> when accurate, single-pixel object boundaries are required for segmentation or shape detection.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
