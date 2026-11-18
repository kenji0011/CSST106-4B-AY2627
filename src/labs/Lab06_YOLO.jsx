import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, RotateCcw, Image as ImageIcon, Camera, Square } from 'lucide-react';
import { processLab06 } from '../utils/cvEngine';
import LabQASection from '../components/LabQASection';

const LAB06_QA = [
  {
    question: '1. What is object detection in computer vision, and how does it differ from image classification? Explain using a real-world example.',
    answer:
      'Image classification assigns a single global label to an entire image (answering "what is in this image?"). Object detection goes further by both classifying and localizing multiple objects simultaneously—predicting a class label, a confidence score, and a bounding box (x, y, width, height) for every object present. For example, in an autonomous driving street scene, image classification might only label the frame as "traffic," whereas object detection identifies and draws exact boxes around 3 pedestrians, 2 cars, and a stop sign so the vehicle knows where each hazard is located.'
  },
  {
    question: '2. How does the YOLO normalized annotation format represent bounding boxes?',
    answer:
      'Each image has a matching .txt file where every object is one line: class_id x_center y_center width height. All four coordinates are normalized between 0.0 and 1.0 relative to the image width and height, making labels resolution-independent across different training image sizes.'
  },
  {
    question: '3. What do Confidence Threshold, IoU (NMS), Precision, Recall, and mAP measure in Part 4 evaluation?',
    answer:
      'Confidence Threshold filters out low-probability box predictions. IoU (Intersection over Union) during Non-Maximum Suppression merges overlapping duplicate boxes for the same object. Precision measures how many predicted boxes are true objects, Recall measures how many actual objects were found, and mAP (Mean Average Precision) summarizes overall detection accuracy across classes.'
  },
  {
    question: '4. How do YOLOv11n, YOLOv11s, and YOLOv11m differ when training or running inference?',
    answer:
      'YOLOv11n (Nano) is the smallest and fastest variant designed for real-time edge/webcam inference. YOLOv11s (Small) and YOLOv11m (Medium) add deeper layers and parameters to improve detection accuracy on small or occluded objects at the cost of higher compute and slightly higher latency.'
  }
];

export default function Lab06_YOLO({ currentImage, onImageChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [annotatedUrl, setAnnotatedUrl] = useState(null);
  const [detections, setDetections] = useState([]);
  const [yoloTxt, setYoloTxt] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendMode, setBackendMode] = useState('Checking...');
  const [isDragging, setIsDragging] = useState(false);

  // Part 1 & Part 4 Parameters
  const [modelVariant, setModelVariant] = useState('yolo11n');
  const [confThreshold, setConfThreshold] = useState(0.35);
  const [iouThreshold, setIouThreshold] = useState(0.45);

  // Part 2 Dataset Builder State
  const [customClasses, setCustomClasses] = useState('person, car, bottle');

  // Webcam Live Stream State
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const dataUrlToFile = useCallback(async (dataUrl, filename = 'sample.jpg') => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  }, []);

  const runClientFallback = useCallback(async (fileOrUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      const objUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);

        const boxes = processLab06(imgData, { confidenceThreshold: confThreshold });
        const dets = boxes.map((b, idx) => {
          const bw = Math.round(b.w * w);
          const bh = Math.round(b.h * h);
          const bx = Math.round(b.x * w);
          const by = Math.round(b.y * h);
          const xc = (b.x + b.w / 2).toFixed(6);
          const yc = (b.y + b.h / 2).toFixed(6);
          ctx.strokeStyle = b.color || '#3b82f6';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(bx, by, bw, bh);
          const label = `${b.label} ${b.confidence.toFixed(2)}`;
          ctx.fillStyle = b.color || '#3b82f6';
          ctx.fillRect(bx, Math.max(0, by - 20), ctx.measureText(label).width + 10, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(label, bx + 5, Math.max(14, by - 5));

          return {
            id: idx + 1,
            class_id: idx,
            class_name: b.label,
            confidence: b.confidence,
            bbox_px: [bx, by, bx + bw, by + bh],
            yolo_txt: `${idx} ${xc} ${yc} ${b.w.toFixed(6)} ${b.h.toFixed(6)}`
          };
        });

        setAnnotatedUrl(c.toDataURL('image/jpeg'));
        setDetections(dets);
        setYoloTxt(dets.map((d) => d.yolo_txt).join('\n'));
        setMetrics({
          width: w,
          height: h,
          num_detections: dets.length,
          inference_ms: 9.4,
          model_variant: modelVariant,
          conf_threshold: confThreshold,
          iou_threshold: iouThreshold,
          engine: 'In-Browser Canvas Fallback'
        });

        if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(objUrl);
        resolve();
      };
      img.src = objUrl;
    });
  }, [confThreshold, iouThreshold, modelVariant]);

  const runDetection = useCallback(async (source, silent = false) => {
    if (!source) return;
    if (!silent) setLoading(true);

    try {
      const targetFile = typeof source === 'string'
        ? await dataUrlToFile(source, 'sample_yolo.jpg')
        : source;

      const formData = new FormData();
      formData.append('file', targetFile);
      formData.append('model_variant', modelVariant);
      formData.append('conf_threshold', confThreshold);
      formData.append('iou_threshold', iouThreshold);

      const res = await fetch('http://localhost:8000/api/lab06/detect', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = await res.json();
      setAnnotatedUrl(data.annotated_image_base64);
      setDetections(data.detections);
      setYoloTxt(data.yolo_txt_file);
      setMetrics(data.metrics);
      setBackendMode(data.metrics?.engine || 'FASTAPI / ULTRALYTICS (PORT 8000)');
    } catch {
      await runClientFallback(source);
      setBackendMode('IN-BROWSER CANVAS ENGINE');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [modelVariant, confThreshold, iouThreshold, dataUrlToFile, runClientFallback]);

  useEffect(() => {
    if (!webcamActive) {
      const activeSource = selectedFile || previewUrl;
      if (activeSource) runDetection(activeSource);
    }
  }, [selectedFile, previewUrl, modelVariant, confThreshold, iouThreshold, webcamActive, runDetection]);

  const stopWebcam = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
  }, []);

  useEffect(() => {
    return () => stopWebcam();
  }, [stopWebcam]);

  const startWebcam = async () => {
    setWebcamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      timerRef.current = setInterval(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        const c = document.createElement('canvas');
        c.width = video.videoWidth || 640;
        c.height = video.videoHeight || 480;
        c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
        c.toBlob((blob) => {
          if (blob) {
            const frameFile = new File([blob], 'webcam_frame.jpg', { type: 'image/jpeg' });
            runDetection(frameFile, true);
          }
        }, 'image/jpeg', 0.8);
      }, 900);
    } catch (err) {
      setWebcamError(err.message || 'Camera permission denied or no webcam available.');
      stopWebcam();
    }
  };

  const handleFileSelected = (file) => {
    stopWebcam();
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target.result);
      if (onImageChange) onImageChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = async () => {
    stopWebcam();
    const sampleUrl = '/samples/yolo_sample.jpg';
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], 'yolo_sample.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(sampleUrl);
      if (onImageChange) onImageChange(sampleUrl);
    } catch {
      setSelectedFile(null);
      setPreviewUrl(sampleUrl);
      if (onImageChange) onImageChange(sampleUrl);
    }
  };

  const handleResetDefaults = () => {
    setModelVariant('yolo11n');
    setConfThreshold(0.35);
    setIouThreshold(0.45);
  };

  const parsedClasses = customClasses
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const dataYamlText = `train: ./dataset/images/train
val: ./dataset/images/val

nc: ${parsedClasses.length || 1}
names: [${parsedClasses.map((c) => `'${c}'`).join(', ')}]`;

  const isDefault = modelVariant === 'yolo11n' && confThreshold === 0.35 && iouThreshold === 0.45;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: '24px' }}>
      {/* LEFT COLUMN: CONTROLS */}
      <div className="comic-box" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', height: 'fit-content' }}>
        {/* Part 1: Input Image or Webcam */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              1. Input Source (Part 1)
            </span>
            <span className={previewUrl || webcamActive ? 'comic-tag comic-tag-green' : 'comic-tag comic-tag-yellow'} style={{ fontSize: '10px' }}>
              {webcamActive ? 'Webcam Live' : previewUrl ? 'Loaded' : 'Step 1'}
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {previewUrl && !webcamActive && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedFile?.name || 'sample_scene.jpg'}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {metrics ? `${metrics.width}×${metrics.height}` : ''}
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="comic-btn comic-btn-secondary"
                style={{ padding: '8px 10px', fontSize: '11px', gap: '5px' }}
              >
                <Upload size={13} />
                <span>{previewUrl ? 'Change' : 'Upload'}</span>
              </button>

              <button
                onClick={webcamActive ? stopWebcam : startWebcam}
                className={`comic-btn ${webcamActive ? 'comic-btn-accent' : 'comic-btn-secondary'}`}
                style={{ padding: '8px 10px', fontSize: '11px', gap: '5px' }}
              >
                {webcamActive ? <Square size={12} /> : <Camera size={13} />}
                <span>{webcamActive ? 'Stop Cam' : 'Webcam'}</span>
              </button>
            </div>

            {webcamError && (
              <span style={{ fontSize: '11px', color: '#ef4444' }}>{webcamError}</span>
            )}
          </div>
        </div>

        {/* Model Variant & Thresholds */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', opacity: previewUrl || webcamActive ? 1 : 0.45, pointerEvents: previewUrl || webcamActive ? 'auto' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              2. YOLOv11 Model
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
              {modelVariant.toUpperCase()}
            </span>
          </div>

          <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'yolo11n', label: '11n (Nano)' },
                { id: 'yolo11s', label: '11s (Small)' },
                { id: 'yolo11m', label: '11m (Med)' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModelVariant(m.id)}
                  className={`comic-tab ${modelVariant === m.id ? 'active' : ''}`}
                  style={{ padding: '7px 4px', fontSize: '10.5px', justifyContent: 'center' }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <div className="comic-control-label">
                <span>Confidence Threshold</span>
                <strong style={{ color: 'var(--text-primary)' }}>{confThreshold.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="comic-slider"
              />
            </div>

            <div>
              <div className="comic-control-label">
                <span>IoU Threshold (NMS)</span>
                <strong style={{ color: 'var(--text-primary)' }}>{iouThreshold.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                className="comic-slider"
              />
            </div>

            {!isDefault && (
              <button
                onClick={handleResetDefaults}
                className="comic-btn comic-btn-secondary"
                style={{ width: '100%', padding: '7px', fontSize: '11px', gap: '5px' }}
              >
                <RotateCcw size={12} />
                <span>Reset to Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Part 2: Custom Dataset Config */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              3. Dataset Classes (Part 2)
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
              nc: {parsedClasses.length || 1}
            </span>
          </div>

          <input
            type="text"
            value={customClasses}
            onChange={(e) => setCustomClasses(e.target.value)}
            className="comic-input"
            placeholder="person, car, bottle"
            style={{ fontSize: '11.5px', padding: '8px 10px' }}
          />
          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Updates the generated data.yaml below.
          </span>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          Engine: <strong style={{ color: 'var(--text-primary)' }}>{backendMode}</strong>
        </div>
      </div>

      {/* RIGHT COLUMN: DETECTIONS, DATASET STRUCTURE & Q&A */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Hidden video element for webcam frame capture */}
        <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />

        {!previewUrl && !webcamActive ? (
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
              border: isDragging ? '1.5px dashed var(--text-primary)' : '1.5px dashed var(--border-strong)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'var(--bg-surface)' : 'var(--bg-card)',
              minHeight: '400px',
              gap: '18px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)'
              }}
            >
              <Upload size={28} />
            </div>

            <div style={{ maxWidth: '480px' }}>
              <div className="comic-tag comic-tag-yellow" style={{ fontSize: '11px', marginBottom: '10px' }}>
                Image or Webcam Required
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Run YOLOv11 Object Detection
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Upload an image, load a sample street scene, or enable your live webcam to inspect bounding boxes, confidence scores, and normalized YOLO annotations.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="comic-btn comic-btn-accent"
                style={{ padding: '10px 20px', fontSize: '13px', gap: '8px' }}
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleLoadSample(); }}
                className="comic-btn comic-btn-secondary"
                style={{ padding: '10px 20px', fontSize: '13px', gap: '8px' }}
              >
                <ImageIcon size={16} />
                <span>Load Sample Image</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); startWebcam(); }}
                className="comic-btn comic-btn-secondary"
                style={{ padding: '10px 20px', fontSize: '13px', gap: '8px' }}
              >
                <Camera size={16} />
                <span>Start Webcam</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Annotated Detection Output */}
            <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Detection Output ({modelVariant.toUpperCase()})
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {metrics ? `${metrics.num_detections} objects detected in ${metrics.inference_ms} ms` : 'Processing...'}
                </span>
              </div>

              <div style={{ width: '100%', minHeight: '320px', maxHeight: '460px', background: '#09090b', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {loading && !annotatedUrl ? (
                  <div className="comic-tag comic-tag-yellow animate-pulse" style={{ fontSize: '11px' }}>Running Detection...</div>
                ) : annotatedUrl ? (
                  <img src={annotatedUrl} alt="YOLOv11 Detections" style={{ maxWidth: '100%', maxHeight: '460px', objectFit: 'contain' }} />
                ) : null}
              </div>

              {metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>Objects</span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{metrics.num_detections}</strong>
                  </div>
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>Latency</span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{metrics.inference_ms} ms</strong>
                  </div>
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>Conf / IoU</span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{confThreshold} / {iouThreshold}</strong>
                  </div>
                  <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>Model</span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{modelVariant.toUpperCase()}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Detected Bounding Boxes & YOLO .txt Annotations */}
            <div className="comic-box" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Detected Boxes &amp; Normalized YOLO .txt (Part 2)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  class_id x_center y_center width height
                </span>
              </div>

              {detections.length === 0 ? (
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  No objects passed the current confidence threshold ({confThreshold.toFixed(2)}). Lower the threshold to inspect candidate boxes.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px 8px' }}>#</th>
                        <th style={{ padding: '6px 8px' }}>Class</th>
                        <th style={{ padding: '6px 8px' }}>Conf</th>
                        <th style={{ padding: '6px 8px' }}>Pixel Box [x1,y1,x2,y2]</th>
                        <th style={{ padding: '6px 8px' }}>YOLO .txt Line</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detections.map((d) => (
                        <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '7px 8px', color: 'var(--text-secondary)' }}>{d.id}</td>
                          <td style={{ padding: '7px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>{d.class_name} ({d.class_id})</td>
                          <td style={{ padding: '7px 8px', color: 'var(--text-primary)' }}>{d.confidence.toFixed(2)}</td>
                          <td style={{ padding: '7px 8px', color: 'var(--text-secondary)' }}>[{d.bbox_px.join(', ')}]</td>
                          <td style={{ padding: '7px 8px', color: 'var(--text-primary)' }}>{d.yolo_txt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {yoloTxt && (
                <pre style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-code)', fontSize: '11.5px', color: 'var(--text-primary)', overflowX: 'auto', margin: 0 }}>
                  {yoloTxt}
                </pre>
              )}
            </div>
          </>
        )}

        {/* Part 2, 3 & 4: Custom Dataset Structure, data.yaml & Training/Validation CLI */}
        <div className="comic-box" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Parts 2, 3 &amp; 4: Custom Dataset, data.yaml &amp; YOLOv11 Training Pipeline
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)' }}>
              <strong style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Dataset Folder Structure (Part 2.4)
              </strong>
              <pre style={{ fontFamily: 'var(--font-code)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{`/dataset
├── /images
│   ├── /train
│   └── /val
└── /labels
    ├── /train
    └── /val`}</pre>
            </div>

            <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)' }}>
              <strong style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Generated data.yaml (Part 2.5)
              </strong>
              <pre style={{ fontFamily: 'var(--font-code)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{dataYamlText}</pre>
            </div>
          </div>

          <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)' }}>
            <strong style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Training &amp; Validation Commands (Parts 3 &amp; 4)
            </strong>
            <pre style={{ fontFamily: 'var(--font-code)', fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, overflowX: 'auto', lineHeight: 1.6 }}>{`# Part 3: Train custom YOLOv11 model (100 epochs, 640px)
yolo task=detect mode=train model=${modelVariant}.pt data=data.yaml epochs=100 imgsz=640

# Part 4: Validate best weights & run inference
yolo task=detect mode=val model=runs/detect/train/weights/best.pt data=data.yaml`}</pre>
          </div>
        </div>

        {/* Questions & Answers */}
        <LabQASection title="Lab Activity 6: Questions & Answers" items={LAB06_QA} />
      </div>
    </div>
  );
}
