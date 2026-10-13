import React, { useEffect, useRef } from 'react';
import { computeHistograms } from '../utils/cvEngine';

export default function HistogramCanvas({ imageData, activeChannel = 'all' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const { rHist, gHist, bHist, lHist } = computeHistograms(imageData);

    // Find peak value across active channels
    let maxVal = 1;
    for (let i = 0; i < 256; i++) {
      if (activeChannel === 'all' || activeChannel === 'red') maxVal = Math.max(maxVal, rHist[i]);
      if (activeChannel === 'all' || activeChannel === 'green') maxVal = Math.max(maxVal, gHist[i]);
      if (activeChannel === 'all' || activeChannel === 'blue') maxVal = Math.max(maxVal, bHist[i]);
      if (activeChannel === 'luminance') maxVal = Math.max(maxVal, lHist[i]);
    }

    const drawChannel = (hist, color, alpha = 0.5) => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const barHeight = (hist[i] / maxVal) * (height - 10);
        const y = height - barHeight;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    if (activeChannel === 'all') {
      drawChannel(rHist, '#ef4444', 0.25);
      drawChannel(gHist, '#10b981', 0.25);
      drawChannel(bHist, '#3b82f6', 0.25);
    } else if (activeChannel === 'red') {
      drawChannel(rHist, '#ef4444', 0.4);
    } else if (activeChannel === 'green') {
      drawChannel(gHist, '#10b981', 0.4);
    } else if (activeChannel === 'blue') {
      drawChannel(bHist, '#3b82f6', 0.4);
    } else if (activeChannel === 'luminance') {
      drawChannel(lHist, '#ffe600', 0.4);
    }

    // Grid lines
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 4, 0); ctx.lineTo(width / 4, height);
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.moveTo((width * 3) / 4, 0); ctx.lineTo((width * 3) / 4, height);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

  }, [imageData, activeChannel]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800 }}>
          HISTOGRAM FREQUENCY DISTRIBUTION (256 BINS)
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.7 }}>
          [0 ── 128 ── 255]
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={130}
        className="histogram-canvas"
      />
    </div>
  );
}
