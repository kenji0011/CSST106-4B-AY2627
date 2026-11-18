import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import LabQASection from '../components/LabQASection';

const LAB05_QA = [
  {
    question: 'Post-Lab 1. How many components are required to retain 90% of the variance in the LFW dataset?',
    answer:
      'On the LFW dataset (1,850 raw dimensions per 50x37 grayscale face), retaining 90% of the cumulative explained variance requires 85 principal components (about 4.6% of the original feature space). Using 150 components retains 94.56% of total variance.'
  },
  {
    question: 'Post-Lab 2. What features do the first 3 Eigenfaces capture compared to the last 3 Eigenfaces?',
    answer:
      'The first 3 Eigenfaces capture coarse global structures and illumination gradients such as overall brightness, left/right shadow direction, forehead, eye sockets, and jawline contours. The last 3 Eigenfaces (indices 147 to 149) capture high-frequency edge textures, fine hair patterns, background noise, and negligible variance.'
  },
  {
    question: 'Post-Lab 3. What does whiten=True do mathematically, and why does it benefit SVM?',
    answer:
      'Setting whiten=True divides each projected component by the square root of its eigenvalue, normalizing every PCA axis to unit variance instead of letting early lighting components dominate Euclidean distances. An RBF-kernel SVM relies on isotropic distances across coordinates, boosting LFW test accuracy from 79.46% (whiten=False) to 84.88% (whiten=True).'
  },
  {
    question: 'Post-Lab 4. Failure Analysis: Why does the Eigenface SVM misclassify certain test faces?',
    answer:
      'Because PCA relies on global linear pixel alignment without geometric warping, misclassifications in X_test commonly arise from off-angle head poses or yaw, harsh uneven shadows across the eyes, accessories like eyeglasses or microphones, and distracting background clutter.'
  },
  {
    question: 'Follow-Up 1. Why is dimensionality reduction important in computer vision?',
    answer:
      'Raw images have thousands to millions of correlated pixels, creating the curse of dimensionality. Dimensionality reduction removes redundant features, speeds up model training and inference, lowers memory overhead, and reduces overfitting.'
  },
  {
    question: 'Follow-Up 2. What is the difference between the first principal component and the second principal component?',
    answer:
      'The first principal component (PC1) points along the direction in feature space that captures the largest possible dataset variance. The second principal component (PC2) captures the highest remaining variance under the constraint that it is strictly orthogonal (perpendicular) to PC1.'
  },
  {
    question: 'Follow-Up 3. If PCA reduces an image from 1,000 features to 100 components, what information might be lost?',
    answer:
      'Keeping only the top 100 components discards high-frequency spatial variations and low-variance details such as fine skin texture, sharp wrinkles, subtle edge details, lighting micro-variations, and sensor noise, while retaining global structure and identity cues.'
  },
  {
    question: 'Follow-Up 4. How can PCA be applied to face recognition?',
    answer:
      'All training face images are flattened, mean-centered, and used to compute top eigenvectors (Eigenfaces). Any new query face is centered by the training mean, projected onto the Eigenfaces to yield a compact weight vector, and classified using a model like an RBF SVM or nearest-neighbor matcher.'
  },
  {
    question: 'Follow-Up 5. Why should image features generally be centered before applying PCA?',
    answer:
      'Subtracting the mean image centers the data cloud around the origin so principal components measure covariance around the average face rather than being skewed toward the overall mean brightness vector of the images.'
  }
];

function VarianceCurveCanvas({ curve, k90 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !curve || curve.length === 0) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const padL = 44;
    const padR = 16;
    const padT = 16;
    const padB = 28;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal grid lines at 25%, 50%, 75%, 90%, 100%
    ctx.font = '10px monospace';
    for (const pct of [25, 50, 75, 90, 100]) {
      const y = padT + plotH * (1 - pct / 100);
      ctx.strokeStyle = pct === 90 ? '#ef4444' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = pct === 90 ? 1.5 : 1;
      if (pct === 90) ctx.setLineDash([5, 4]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();

      ctx.fillStyle = pct === 90 ? '#f87171' : '#a1a1aa';
      ctx.textAlign = 'right';
      ctx.fillText(`${pct}%`, padL - 6, y + 3);
    }
    ctx.setLineDash([]);

    const maxK = curve[curve.length - 1].k;

    // Vertical marker for k90 if reached
    if (k90 && k90 <= maxK) {
      const x90 = padL + ((k90 - 1) / Math.max(1, maxK - 1)) * plotW;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x90, padT);
      ctx.lineTo(x90, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'left';
      ctx.fillText(`90% at k=${k90}`, Math.min(w - padR - 80, x90 + 6), padT + plotH - 8);
    }

    // Cumulative explained variance line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    curve.forEach((pt, idx) => {
      const x = padL + (idx / Math.max(1, curve.length - 1)) * plotW;
      const y = padT + plotH * (1 - pt.cumulative / 100);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // X-axis ticks
    ctx.fillStyle = '#a1a1aa';
    ctx.textAlign = 'center';
    for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
      const kVal = Math.max(1, Math.round(1 + frac * (maxK - 1)));
      const x = padL + frac * plotW;
      ctx.fillText(String(kVal), x, h - 8);
    }
  }, [curve, k90]);

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={200}
      style={{
        width: '100%',
        height: '200px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        display: 'block'
      }}
    />
  );
}

export default function Lab05_PCA() {
  const [nComponents, setNComponents] = useState(150);
  const [whiten, setWhiten] = useState(true);
  const [svmC, setSvmC] = useState(1.0);
  const [sampleIdx, setSampleIdx] = useState(0);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendMode, setBackendMode] = useState('Checking...');
  const abortControllerRef = useRef(null);

  const runPipeline = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('n_components', nComponents);
      formData.append('whiten', whiten ? 'true' : 'false');
      formData.append('svm_c', svmC);
      formData.append('sample_idx', sampleIdx);

      const res = await fetch('http://localhost:8000/api/lab05/run', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Server returned ${res.status}: ${detail}`);
      }

      const data = await res.json();
      if (controller.signal.aborted) return;

      setError(null);
      setResult(data);
      setBackendMode('FASTAPI / SCIKIT-LEARN LFW (PORT 8000)');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Failed to connect to FastAPI backend on port 8000.');
      setBackendMode('BACKEND OFFLINE');
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [nComponents, whiten, svmC, sampleIdx]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runPipeline();
    }, 120);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [runPipeline]);

  const handleResetDefaults = () => {
    setNComponents(150);
    setWhiten(true);
    setSvmC(1.0);
    setSampleIdx(0);
  };

  const isDefault = nComponents === 150 && whiten === true && svmC === 1.0 && sampleIdx === 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: '24px' }}>
      {/* LEFT COLUMN: CONTROLS */}
      <div className="comic-box" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', height: 'fit-content' }}>
        {/* Task 1: Dataset Info */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              1. LFW Dataset (Task 1)
            </span>
            <span className="comic-tag comic-tag-green" style={{ fontSize: '10px' }}>
              {result ? `${result.dataset.n_samples} Faces` : 'Loading'}
            </span>
          </div>

          <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', fontSize: '11.5px', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>min_faces_per_person: <strong>70</strong>, resize: <strong>0.4</strong></div>
            <div>Image Shape: <strong>{result ? `${result.dataset.h}×${result.dataset.w} (${result.dataset.n_features} px)` : '50×37 (1850 px)'}</strong></div>
            <div>Split (80/20): <strong>{result ? `${result.dataset.n_train} train / ${result.dataset.n_test} test` : '1030 train / 258 test'}</strong></div>
            <div>Classes: <strong>{result ? result.dataset.n_classes : 7}</strong></div>
          </div>
        </div>

        {/* Task 2: PCA Parameters */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              2. PCA Config (Task 2)
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
              k = {nComponents}
            </span>
          </div>

          <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div className="comic-control-label">
                <span>n_components</span>
                <strong style={{ color: 'var(--text-primary)' }}>{nComponents}</strong>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="10"
                value={nComponents}
                onChange={(e) => setNComponents(Number(e.target.value))}
                className="comic-slider"
              />
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Default is 150 randomized SVD components.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Whitening (Q3):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => setWhiten(true)}
                  className={`comic-tab ${whiten ? 'active' : ''}`}
                  style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
                >
                  whiten=True
                </button>
                <button
                  onClick={() => setWhiten(false)}
                  className={`comic-tab ${!whiten ? 'active' : ''}`}
                  style={{ padding: '7px 4px', fontSize: '11px', justifyContent: 'center' }}
                >
                  whiten=False
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task 4: SVM Classifier Parameters */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              3. SVM Classifier (Task 4)
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
              RBF / Balanced
            </span>
          </div>

          <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Regularization C:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[0.5, 1.0, 5.0, 10.0].map((cVal) => (
                  <button
                    key={cVal}
                    onClick={() => setSvmC(cVal)}
                    className={`comic-tab ${svmC === cVal ? 'active' : ''}`}
                    style={{ padding: '6px 4px', fontSize: '11px', justifyContent: 'center' }}
                  >
                    {cVal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="comic-control-label">
                <span>Inspect Test Sample #</span>
                <strong style={{ color: 'var(--text-primary)' }}>{sampleIdx}</strong>
              </div>
              <input
                type="range"
                min="0"
                max={result ? Math.max(0, result.dataset.n_test - 1) : 257}
                step="1"
                value={sampleIdx}
                onChange={(e) => setSampleIdx(Number(e.target.value))}
                className="comic-slider"
              />
            </div>

            <button
              onClick={runPipeline}
              disabled={loading}
              className="comic-btn comic-btn-accent"
              style={{ width: '100%', padding: '8px', fontSize: '12px', gap: '6px' }}
            >
              <Play size={13} />
              <span>{loading ? 'Running PCA + SVM...' : 'Re-Run Pipeline'}</span>
            </button>

            {!isDefault && (
              <button
                onClick={handleResetDefaults}
                className="comic-btn comic-btn-secondary"
                style={{ width: '100%', padding: '7px', fontSize: '11px', gap: '6px' }}
              >
                <RotateCcw size={12} />
                <span>Reset to PDF Defaults</span>
              </button>
            )}
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          Engine: <strong style={{ color: 'var(--text-primary)' }}>{backendMode}</strong>
        </div>
      </div>

      {/* RIGHT COLUMN: RESULTS, CHARTS & DELIVERABLES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div className="comic-box" style={{ padding: '20px', borderColor: '#ef4444' }}>
            <strong style={{ color: '#ef4444', display: 'block', marginBottom: '6px' }}>Backend Connection Error</strong>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {error}. Make sure <code>python server.py</code> is running on port 8000 with scikit-learn installed.
            </p>
          </div>
        )}

        {!result && loading && (
          <div className="comic-box" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Loading LFW dataset, fitting PCA (n_components={nComponents}), and training RBF SVM...
            </p>
          </div>
        )}

        {result && (
          <>
            {/* 1. Key Pipeline Metrics Strip */}
            <div className="comic-box" style={{ padding: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)' }}>
                  <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '3px' }}>
                    SVM Test Accuracy
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {result.svm_metrics.accuracy}%
                  </strong>
                </div>

                <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)' }}>
                  <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '3px' }}>
                    Variance Retained
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {result.pca_metrics.total_variance}%
                  </strong>
                </div>

                <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)' }}>
                  <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '3px' }}>
                    90% Variance At (Q1)
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {result.pca_metrics.k_90 ? `${result.pca_metrics.k_90} comps` : 'Not reached'}
                  </strong>
                </div>

                <div className="comic-box-sm" style={{ padding: '12px', background: 'var(--bg-surface)' }}>
                  <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '3px' }}>
                    Dimension Compression
                  </span>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    {result.pca_metrics.compression_ratio}x ({result.dataset.n_features} -&gt; {result.pca_metrics.n_components})
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. Section 5 Q1: Cumulative Explained Variance Plot */}
            <div className="comic-box" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Cumulative Explained Variance (Q1)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {result.pca_metrics.k_90
                    ? `90% threshold reached at k = ${result.pca_metrics.k_90} components`
                    : `Max retained at k=${result.pca_metrics.n_components}: ${result.pca_metrics.total_variance}%`}
                </span>
              </div>
              <VarianceCurveCanvas curve={result.variance_curve} k90={result.pca_metrics.k_90} />
            </div>

            {/* 3. Task 3: Top 12 Eigenfaces Gallery */}
            <div className="comic-box" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Eigenfaces Gallery (Task 3: Top {result.eigenfaces_top12.length} Principal Components)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Fit Time: {result.pca_metrics.pca_time_s}s | Reshaped ({result.dataset.h}×{result.dataset.w})
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                {result.eigenfaces_top12.map((ef) => (
                  <div key={ef.index} className="comic-box-sm" style={{ padding: '8px', background: 'var(--bg-surface)', textAlign: 'center' }}>
                    <img
                      src={ef.image}
                      alt={ef.title}
                      style={{ width: '100%', aspectRatio: '37 / 50', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'block', marginBottom: '6px' }}
                    />
                    <strong style={{ display: 'block', fontSize: '11px', color: 'var(--text-primary)' }}>
                      {ef.title}
                    </strong>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {ef.variance_pct}% var
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Visual Interpretation: Mean Face + First 3 vs Last 3 Eigenfaces (Q2) */}
            <div className="comic-box" style={{ padding: '18px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Visual Interpretation (Q2): Mean Face, First 3 vs Last 3 Eigenfaces
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                <div className="comic-box-sm" style={{ padding: '8px', background: 'var(--bg-surface)', textAlign: 'center' }}>
                  <img
                    src={result.mean_face}
                    alt="Mean Face"
                    style={{ width: '100%', aspectRatio: '37 / 50', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'block', marginBottom: '6px' }}
                  />
                  <strong style={{ display: 'block', fontSize: '11px', color: 'var(--text-primary)' }}>Mean Face</strong>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Centering base</span>
                </div>

                {result.eigenfaces_top12.slice(0, 3).map((ef) => (
                  <div key={`first-${ef.index}`} className="comic-box-sm" style={{ padding: '8px', background: 'var(--bg-surface)', textAlign: 'center' }}>
                    <img
                      src={ef.image}
                      alt={ef.title}
                      style={{ width: '100%', aspectRatio: '37 / 50', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'block', marginBottom: '6px' }}
                    />
                    <strong style={{ display: 'block', fontSize: '11px', color: 'var(--text-primary)' }}>First #{ef.index}</strong>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{ef.variance_pct}% var</span>
                  </div>
                ))}

                {result.eigenfaces_last3.map((ef) => (
                  <div key={`last-${ef.index}`} className="comic-box-sm" style={{ padding: '8px', background: 'var(--bg-surface)', textAlign: 'center' }}>
                    <img
                      src={ef.image}
                      alt={ef.title}
                      style={{ width: '100%', aspectRatio: '37 / 50', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'block', marginBottom: '6px' }}
                    />
                    <strong style={{ display: 'block', fontSize: '11px', color: 'var(--text-primary)' }}>Last #{ef.index}</strong>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{ef.variance_pct}% var</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Task 4: SVM Classification Report & Face Reconstruction Inspector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '16px' }}>
              {/* Classification Report Table */}
              <div className="comic-box" style={{ padding: '18px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    SVM Classification Report (Task 4)
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    SVM Fit: {result.svm_metrics.svm_time_s}s | Macro F1: {result.svm_metrics.macro_f1}
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '6px 8px' }}>Person</th>
                      <th style={{ padding: '6px 8px' }}>Precision</th>
                      <th style={{ padding: '6px 8px' }}>Recall</th>
                      <th style={{ padding: '6px 8px' }}>F1-Score</th>
                      <th style={{ padding: '6px 8px' }}>Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.svm_metrics.report_rows.map((row) => (
                      <tr key={row.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '7px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</td>
                        <td style={{ padding: '7px 8px', color: 'var(--text-secondary)' }}>{row.precision.toFixed(2)}</td>
                        <td style={{ padding: '7px 8px', color: 'var(--text-secondary)' }}>{row.recall.toFixed(2)}</td>
                        <td style={{ padding: '7px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.f1.toFixed(2)}</td>
                        <td style={{ padding: '7px 8px', color: 'var(--text-secondary)' }}>{row.support}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Single Test Face Reconstruction Inspector */}
              <div className="comic-box" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Face Reconstruction (#{result.reconstruction.idx})
                  </span>
                  <span className={result.reconstruction.correct ? 'comic-tag comic-tag-green' : 'comic-tag-outline'} style={{ fontSize: '10px' }}>
                    {result.reconstruction.correct ? 'Correct' : 'Misclassified'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
                  <div>
                    <img
                      src={result.reconstruction.orig_image}
                      alt="Original Test Face"
                      style={{ width: '100%', aspectRatio: '37 / 50', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'block', marginBottom: '4px' }}
                    />
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      Original ({result.dataset.n_features}D)
                    </span>
                  </div>
                  <div>
                    <img
                      src={result.reconstruction.recon_image}
                      alt="PCA Reconstructed Face"
                      style={{ width: '100%', aspectRatio: '37 / 50', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'block', marginBottom: '4px' }}
                    />
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      PCA ({result.pca_metrics.n_components}D)
                    </span>
                  </div>
                </div>

                <div className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                  <div>True: <strong>{result.reconstruction.true_name}</strong></div>
                  <div>Predicted: <strong>{result.reconstruction.pred_name}</strong></div>
                  <div>Reconstruction MSE: <strong>{result.reconstruction.mse}</strong></div>
                </div>
              </div>
            </div>

            {/* 6. Section 5 Q4: Failure Analysis Gallery */}
            <div className="comic-box" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Failure Analysis: Misclassified Test Faces (Q4)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {result.svm_metrics.misclassified_count} misclassified of {result.svm_metrics.total_test} test samples
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: '10px' }}>
                {result.failures.map((f) => (
                  <div key={f.idx} className="comic-box-sm" style={{ padding: '10px', background: 'var(--bg-surface)' }}>
                    <img
                      src={f.orig_image}
                      alt={`Misclassified #${f.idx}`}
                      style={{ width: '100%', aspectRatio: '37 / 50', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'block', marginBottom: '8px' }}
                    />
                    <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Pred:</span> <strong>{f.pred_name}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>True:</span> <strong>{f.true_name}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}

        <LabQASection title="Lab Activity 5: Post-Lab Analysis & Follow-Up Questions" items={LAB05_QA} />
      </div>
    </div>
  );
}
