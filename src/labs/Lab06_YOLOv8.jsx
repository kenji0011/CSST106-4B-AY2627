import React, { useState, useEffect, useRef } from 'react';
import ImageWorkspace from '../components/ImageWorkspace';
import { processLab06, getImageDataFromElement } from '../utils/cvEngine';
import { Scan, Sliders, ShieldCheck, Tag } from 'lucide-react';

export default function Lab06_YOLOv8({ currentImage, onImageChange, onSnapshotReady }) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.40);
  const [selectedClasses, setSelectedClasses] = useState(['all']);
  const [detections, setDetections] = useState([]);
  const [latency, setLatency] = useState('0ms');

  const processedCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const startTime = performance.now();
      const { imageData, width, height } = getImageDataFromElement(img, 600, 600);

      const result = processLab06(imageData, {
        confidenceThreshold,
        selectedClasses
      });

      setDetections(result.detections);

      const canvas = processedCanvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw original scene
        ctx.putImageData(imageData, 0, 0);

        // Draw Comic Bounding Boxes
        result.detections.forEach((det) => {
          const { x, y, width: bw, height: bh } = det.bbox;

          // Box border
          ctx.strokeStyle = det.color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, bw, bh);

          // Subtle box tint
          ctx.fillStyle = det.color + '22'; // 15% opacity tint
          ctx.fillRect(x, y, bw, bh);

          // Comic Label Pill
          const labelText = `${det.label.toUpperCase()} ${(det.confidence * 100).toFixed(0)}%`;
          ctx.font = 'bold 11px monospace';
          const textWidth = ctx.measureText(labelText).width;

          // Label background
          ctx.fillStyle = det.color;
          ctx.fillRect(x, Math.max(0, y - 22), textWidth + 14, 22);

          // Label text
          ctx.fillStyle = '#000000';
          ctx.fillText(labelText, x + 7, Math.max(15, y - 7));
        });

        if (onSnapshotReady) {
          onSnapshotReady(canvas.toDataURL('image/png'));
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setLatency(`${elapsed}ms`);
    };
    img.src = currentImage;
  }, [currentImage, confidenceThreshold, selectedClasses]);

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
            extra: `DETECTED: ${detections.length} OBJECTS`
          }}
        />
      </div>

      {/* Comic Control Panel */}
      <div className="comic-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900 }}>
            YOLOv8 INFERENCE PIPELINE
          </span>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '9px' }}>
            EXP 06
          </span>
        </div>

        {/* Confidence Threshold Slider */}
        <div className="comic-control-group">
          <div className="comic-control-label">
            <span>Confidence Threshold (τ)</span>
            <span style={{ color: 'var(--accent-yellow)', fontWeight: 900 }}>{(confidenceThreshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.20"
            max="0.85"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            className="comic-slider"
          />
        </div>

        {/* Detected Objects Inventory */}
        <div className="comic-control-group">
          <label className="comic-control-label">
            <span>Detected Entities ({detections.length})</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {detections.length === 0 ? (
              <div style={{ fontSize: '11px', opacity: 0.6, padding: '8px', textAlign: 'center' }}>
                No objects above current confidence score. Lower threshold slider to inspect candidate boxes.
              </div>
            ) : (
              detections.map((det, idx) => (
                <div
                  key={idx}
                  className="comic-box-sm"
                  style={{
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: `4px solid ${det.color}`
                  }}
                >
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                    {det.label}
                  </strong>
                  <span className="comic-tag" style={{ fontSize: '9px', padding: '1px 5px', background: det.color, color: '#000' }}>
                    {(det.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Model Architecture Info Card */}
        <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
            YOLOv8 ARCHITECTURE SUMMARY:
          </strong>
          <ul style={{ fontSize: '10px', opacity: 0.8, paddingLeft: '14px', lineHeight: 1.5 }}>
            <li>Single-Stage Anchor-Free Regression</li>
            <li>C2f Cross-Stage Partial Backbone</li>
            <li>Decoupled Head (Classification &amp; BBox)</li>
            <li>Soft-NMS IoU IoU Threshold = 0.45</li>
          </ul>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setConfidenceThreshold(0.40);
            setSelectedClasses(['all']);
          }}
          className="comic-btn comic-btn-secondary"
          style={{ marginTop: '4px', fontSize: '11px' }}
        >
          Reset YOLO Parameters
        </button>
      </div>
    </div>
  );
}
