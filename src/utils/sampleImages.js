// ============================================================================
// CSST 106 - Sample Computer Vision Test Images
// Offline-ready high-resolution benchmark images (Data URIs / Canvas generators)
// ============================================================================

export const SAMPLE_IMAGES = [
  {
    id: 'portrait',
    name: 'Portrait & Face (Benchmark)',
    description: 'High dynamic range facial portrait with soft gradients for PCA, histogram, and filters.',
    category: 'General CV',
    url: createFaceSample()
  },
  {
    id: 'traffic',
    name: 'Urban Traffic & Vehicles',
    description: 'City highway with vehicles, street lights, and road markings for YOLOv8 and edge filters.',
    category: 'Object Detection',
    url: createTrafficSample()
  },
  {
    id: 'textures',
    name: 'Geometric Shapes & Coins',
    description: 'Contrasting geometric circles, polygons, and text for Otsu binarization and corner detection.',
    category: 'Segmentation',
    url: createShapesSample()
  },
  {
    id: 'nature',
    name: 'Nature & High Frequency',
    description: 'High-contrast landscape with fine foliage and edges for Sobel, Prewitt, and Canny.',
    category: 'Edge & Gradient',
    url: createNatureSample()
  }
];

function createFaceSample() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 600, 600);
  bgGrad.addColorStop(0, '#2c3e50');
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 600, 600);

  // Soft spotlight
  const spotGrad = ctx.createRadialGradient(300, 260, 20, 300, 260, 280);
  spotGrad.addColorStop(0, '#fde68a');
  spotGrad.addColorStop(0.3, '#d97706');
  spotGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, 600, 600);

  // Silhouette / Face Head
  ctx.fillStyle = '#f8d7b8';
  ctx.beginPath();
  ctx.ellipse(300, 280, 110, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(300, 180, 120, 90, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(260, 240, 24, Math.PI * 1.1, Math.PI * 1.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(340, 240, 24, Math.PI * 1.2, Math.PI * 1.9);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(260, 260, 18, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(340, 260, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(260, 260, 8, 0, Math.PI * 2);
  ctx.arc(340, 260, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(260, 260, 4, 0, Math.PI * 2);
  ctx.arc(340, 260, 4, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 265);
  ctx.lineTo(295, 310);
  ctx.lineTo(308, 312);
  ctx.stroke();

  // Lips
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.ellipse(300, 350, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoulders & Shirt
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(140, 600);
  ctx.lineTo(220, 420);
  ctx.lineTo(380, 420);
  ctx.lineTo(460, 600);
  ctx.closePath();
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.95);
}

function createTrafficSample() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Sky & Sunset
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 320);
  skyGrad.addColorStop(0, '#f97316');
  skyGrad.addColorStop(0.5, '#ec4899');
  skyGrad.addColorStop(1, '#3b82f6');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 600, 320);

  // Buildings background
  ctx.fillStyle = '#1e1b4b';
  const buildings = [
    { x: 30, w: 70, h: 180 }, { x: 110, w: 90, h: 220 },
    { x: 210, w: 80, h: 260 }, { x: 300, w: 90, h: 200 },
    { x: 400, w: 100, h: 240 }, { x: 510, w: 70, h: 190 }
  ];
  buildings.forEach(b => {
    ctx.fillRect(b.x, 320 - b.h, b.w, b.h);
    // windows
    ctx.fillStyle = '#fef08a';
    for (let wy = 320 - b.h + 15; wy < 300; wy += 22) {
      for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += 16) {
        if ((wx + wy) % 7 !== 0) ctx.fillRect(wx, wy, 8, 12);
      }
    }
    ctx.fillStyle = '#1e1b4b';
  });

  // Road
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.moveTo(0, 320);
  ctx.lineTo(600, 320);
  ctx.lineTo(600, 600);
  ctx.lineTo(0, 600);
  ctx.fill();

  // Lane Dividers
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.setLineDash([24, 18]);
  ctx.beginPath();
  ctx.moveTo(300, 320);
  ctx.lineTo(300, 600);
  ctx.stroke();
  ctx.setLineDash([]);

  // Car 1 (Red Sedan in Left Lane)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(160, 420, 110, 50);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(180, 390, 70, 30);
  // Wheels
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(185, 470, 14, 0, Math.PI * 2);
  ctx.arc(245, 470, 14, 0, Math.PI * 2);
  ctx.fill();
  // Headlights
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(160, 435, 10, 12);

  // Car 2 (Cyan SUV in Right Lane)
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(340, 450, 120, 60);
  ctx.fillStyle = '#0891b2';
  ctx.fillRect(360, 415, 80, 35);
  // Wheels
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(365, 510, 16, 0, Math.PI * 2);
  ctx.arc(435, 510, 16, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.95);
}

function createShapesSample() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 600, 600);

  // Grid of diverse geometric objects
  // Circle
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(150, 150, 70, 0, Math.PI * 2);
  ctx.fill();

  // Rectangle
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(350, 80, 160, 120);

  // Triangle
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(150, 340);
  ctx.lineTo(240, 480);
  ctx.lineTo(60, 480);
  ctx.closePath();
  ctx.fill();

  // Star / Polygon
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  const cx = 420, cy = 410, spikes = 5, outerRadius = 75, innerRadius = 35;
  let rot = (Math.PI / 2) * 3;
  let x = cx, y = cy;
  const step = Math.PI / spikes;
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();

  // High contrast text label
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px monospace';
  ctx.fillText('CSST 106 - SEGMENTATION', 120, 560);

  return canvas.toDataURL('image/jpeg', 0.95);
}

function createNatureSample() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Gradient mountains
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, '#bae6fd');
  grad.addColorStop(0.5, '#7dd3fc');
  grad.addColorStop(1, '#0284c7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 600);

  // Sun
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(480, 140, 50, 0, Math.PI * 2);
  ctx.fill();

  // Mountain 1
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(0, 450);
  ctx.lineTo(220, 210);
  ctx.lineTo(440, 450);
  ctx.closePath();
  ctx.fill();

  // Snow cap
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(220, 210);
  ctx.lineTo(180, 260);
  ctx.lineTo(260, 260);
  ctx.closePath();
  ctx.fill();

  // Mountain 2
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(260, 500);
  ctx.lineTo(420, 280);
  ctx.lineTo(600, 500);
  ctx.closePath();
  ctx.fill();

  // Forest lines (rich edge responses)
  ctx.fillStyle = '#14532d';
  for (let x = 0; x < 600; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 600);
    ctx.lineTo(x + 15, 480 + (x % 40));
    ctx.lineTo(x + 30, 600);
    ctx.closePath();
    ctx.fill();
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}
