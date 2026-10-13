import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LabCardGrid from './components/LabCardGrid';
import CodeViewer from './components/CodeViewer';
import ReportGenerator from './components/ReportGenerator';
import { LAB_MODULES, getLabById } from './labs/registry';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { PYTHON_SNIPPETS } from './utils/pythonCodeSnippets';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

// Currently Active Lab Component
import Lab01_Images from './labs/Lab01_Images';

export default function App() {
  // null = Home/Cards Grid view; 'lab-01' = Individual Lab page
  const [activeLabId, setActiveLabId] = useState(null);
  const [viewMode, setViewMode] = useState('playground'); // 'playground', 'code', 'report'
  const [theme, setTheme] = useState(() => localStorage.getItem('csst106_theme') || 'dark');
  const [currentImage, setCurrentImage] = useState(SAMPLE_IMAGES[0].url);
  const [snapshots, setSnapshots] = useState({});

  // Sync theme attribute to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('csst106_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handlePrint = () => {
    setViewMode('report');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleSnapshotReady = (dataUrl) => {
    if (activeLabId) {
      setSnapshots(prev => ({
        ...prev,
        [activeLabId]: dataUrl
      }));
    }
  };

  // Open specific lab from card grid
  const handleSelectLab = (id) => {
    setActiveLabId(id);
    setViewMode('playground');
    setCurrentImage(SAMPLE_IMAGES[0].url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to card grid overview
  const handleBackToGrid = () => {
    setActiveLabId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeLab = activeLabId ? getLabById(activeLabId) : null;
  const activeSnippet = activeLabId ? (PYTHON_SNIPPETS[activeLabId] || PYTHON_SNIPPETS['lab-01']) : null;

  const currentIndex = LAB_MODULES.findIndex(l => l.id === activeLabId);
  const prevLab = currentIndex > 0 ? LAB_MODULES[currentIndex - 1] : null;
  const nextLab = currentIndex < LAB_MODULES.length - 1 ? LAB_MODULES[currentIndex + 1] : null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Halftone Comic Dots Pattern Background */}
      <div className="comic-dots-bg" />

      {/* Top Navbar */}
      <Navbar
        activeLabId={activeLabId}
        activeLab={activeLab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        toggleTheme={toggleTheme}
        onPrint={handlePrint}
        onBackToGrid={handleBackToGrid}
      />

      {/* Main Content Area */}
      <div className="comic-single-layout">
        {/* VIEW 1: HOME CARD GRID OVERVIEW */}
        {!activeLabId && (
          <LabCardGrid onSelectLab={handleSelectLab} />
        )}

        {/* VIEW 2: DEDICATED LABORATORY PAGE */}
        {activeLabId && activeLab && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Navigation Banner with Breadcrumbs & Back Button */}
            <div className="comic-box no-print" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleBackToGrid}
                  className="comic-btn comic-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '11px', gap: '6px' }}
                >
                  <ArrowLeft size={13} />
                  <span>All Laboratories</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.75 }}>
                  <span>LABS</span>
                  <span>/</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    EXP {activeLab.number}: {activeLab.title.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Prev / Next Experiment Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  disabled={!prevLab}
                  onClick={() => prevLab && handleSelectLab(prevLab.id)}
                  className="comic-btn comic-btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '10px', gap: '4px' }}
                  title="Previous Lab"
                >
                  <ChevronLeft size={13} />
                  <span>Prev</span>
                </button>

                <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px', padding: '4px 8px' }}>
                  {activeLab.number} / {String(LAB_MODULES.length).padStart(2, '0')}
                </span>

                <button
                  disabled={!nextLab}
                  onClick={() => nextLab && handleSelectLab(nextLab.id)}
                  className="comic-btn comic-btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '10px', gap: '4px' }}
                  title="Next Lab"
                >
                  <span>Next</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Experiment Title & Header Banner */}
            <div className="comic-box" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="comic-tag comic-tag-yellow" style={{ fontSize: '11px' }}>
                    {activeLab.chapter}
                  </span>
                  <span className="comic-tag-outline" style={{ fontSize: '11px' }}>
                    CATEGORY // {activeLab.category.toUpperCase()}
                  </span>
                </div>

                <span className="comic-tag comic-tag-green" style={{ fontSize: '10px' }}>
                  STATUS // READY FOR EVALUATION
                </span>
              </div>

              <h1 style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1.2, margin: '6px 0 4px 0' }}>
                {activeLab.title}
              </h1>
              <p style={{ fontSize: '13px', opacity: 0.85, maxWidth: '900px' }}>
                {activeLab.description}
              </p>
            </div>

            {/* Mode Views: Playground / Code / Report */}
            {viewMode === 'playground' && (
              <div>
                {activeLabId === 'lab-01' && (
                  <Lab01_Images
                    currentImage={currentImage}
                    onImageChange={setCurrentImage}
                    onSnapshotReady={handleSnapshotReady}
                  />
                )}
              </div>
            )}

            {viewMode === 'code' && activeSnippet && (
              <CodeViewer
                filename={activeSnippet.filename}
                code={activeSnippet.code}
              />
            )}

            {viewMode === 'report' && (
              <ReportGenerator
                activeLabId={activeLabId}
                snapshotUrl={snapshots[activeLabId]}
                onPrint={handlePrint}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
