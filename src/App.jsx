import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LabCardGrid from './components/LabCardGrid';
import CodeViewer from './components/CodeViewer';
import { LAB_MODULES, getLabById } from './labs/registry';
import { PYTHON_SNIPPETS } from './utils/pythonCodeSnippets';
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from 'lucide-react';

// Active Lab Components
import Lab01_Images from './labs/Lab01_Images';
import Lab02_EdgeDetection from './labs/Lab02_EdgeDetection';
import Lab03_Histogram from './labs/Lab03_Histogram';
import Lab04_Features from './labs/Lab04_Features';
import Lab05_PCA from './labs/Lab05_PCA';
import Lab06_YOLO from './labs/Lab06_YOLO';
import Lab07_Segmentation from './labs/Lab07_Segmentation';

export default function App() {
  // null = Home/Cards Grid view; 'lab-01' = Individual Lab page
  const [activeLabId, setActiveLabId] = useState(null);
  const [viewMode, setViewMode] = useState('playground'); // 'playground', 'code'
  const [theme, setTheme] = useState(() => localStorage.getItem('csst106_theme') || 'dark');
  const [currentImage, setCurrentImage] = useState(null);
  const [docxNotice, setDocxNotice] = useState(null);
  const [isHeroTitleVisible, setIsHeroTitleVisible] = useState(true);
  const [navDirection, setNavDirection] = useState('up'); // 'up' | 'next' | 'prev'

  // Sync theme attribute to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('csst106_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Open specific lab from card grid or Prev/Next switcher
  const handleSelectLab = (id, direction = 'up') => {
    setNavDirection(direction);
    setActiveLabId(id);
    setViewMode('playground');
    setCurrentImage(null);
    setDocxNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to card grid overview
  const handleBackToGrid = () => {
    setActiveLabId(null);
    setDocxNotice(null);
    setIsHeroTitleVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadDocx = async () => {
    if (!activeLab?.docxPath) return;
    setDocxNotice(null);
    try {
      const res = await fetch(activeLab.docxPath);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('text/html')) {
        setDocxNotice(`Place ${activeLab.docxFilename} inside public/docs/ to enable download.`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = activeLab.docxFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setDocxNotice(`Place ${activeLab.docxFilename} inside public/docs/ to enable download.`);
    }
  };

  const activeLab = activeLabId ? getLabById(activeLabId) : null;
  const activeSnippet = activeLabId ? (PYTHON_SNIPPETS[activeLabId] || PYTHON_SNIPPETS['lab-01']) : null;

  const currentIndex = LAB_MODULES.findIndex(l => l.id === activeLabId);
  const prevLab = currentIndex > 0 ? LAB_MODULES[currentIndex - 1] : null;
  const nextLab = currentIndex < LAB_MODULES.length - 1 ? LAB_MODULES[currentIndex + 1] : null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Top Navbar */}
      <Navbar
        activeLabId={activeLabId}
        showNavTitle={Boolean(activeLabId) || !isHeroTitleVisible}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        toggleTheme={toggleTheme}
        onBackToGrid={handleBackToGrid}
      />

      {/* Main Content Area */}
      <div className="comic-single-layout">
        {/* VIEW 1: HOME CARD GRID OVERVIEW */}
        {!activeLabId && (
          <div className="view-enter">
            <LabCardGrid
              onSelectLab={handleSelectLab}
              onHeroTitleVisibilityChange={setIsHeroTitleVisible}
            />
          </div>
        )}

        {/* VIEW 2: DEDICATED LABORATORY PAGE */}
        {activeLabId && activeLab && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Back to All Labs Button (persistent below Navbar) */}
            <div className="view-enter">
              <button
                onClick={handleBackToGrid}
                className="comic-btn comic-btn-secondary back-to-labs-btn"
                style={{ padding: '7px 14px', fontSize: '12px', gap: '6px' }}
                title="Return to Laboratory Cards Overview"
              >
                <ArrowLeft size={14} className="back-arrow-icon" />
                <span>All Labs</span>
              </button>
            </div>

            <div
              key={activeLabId}
              className={`lab-transition-${navDirection}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Unified Experiment Header Banner */}
            <div className="comic-box" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="comic-tag-outline" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    {activeLab.category}
                  </span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.25, margin: '0 0 4px 0' }}>
                  {activeLab.title}
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, maxWidth: '800px', margin: 0 }}>
                  {activeLab.description}
                </p>
              </div>

              {/* Download DOCX & Prev / Next Experiment Switcher */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDownloadDocx}
                    className="comic-btn comic-btn-accent"
                    style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}
                    title={`Download ${activeLab.docxFilename}`}
                  >
                    <Download size={14} />
                    <span>Download DOCX</span>
                  </button>

                  <button
                    disabled={!prevLab}
                    onClick={() => prevLab && handleSelectLab(prevLab.id, 'prev')}
                    className="comic-btn comic-btn-secondary nav-prev-btn"
                    style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                    title="Previous Lab"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  <span className="comic-tag comic-tag-yellow" style={{ fontSize: '11px', padding: '5px 10px' }}>
                    {String(currentIndex + 1).padStart(2, '0')} / {String(LAB_MODULES.length).padStart(2, '0')}
                  </span>

                  <button
                    disabled={!nextLab}
                    onClick={() => nextLab && handleSelectLab(nextLab.id, 'next')}
                    className="comic-btn comic-btn-secondary nav-next-btn"
                    style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                    title="Next Lab"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {docxNotice && (
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {docxNotice}
                  </span>
                )}
              </div>
            </div>

            {/* Mode Views: Playground or Code */}
            {viewMode === 'playground' && (
              <div key="playground" className="view-enter">
                {activeLabId === 'lab-01' && (
                  <Lab01_Images
                    currentImage={currentImage}
                    onImageChange={setCurrentImage}
                  />
                )}
                {activeLabId === 'lab-02' && (
                  <Lab02_EdgeDetection
                    currentImage={currentImage}
                    onImageChange={setCurrentImage}
                  />
                )}
                {activeLabId === 'lab-03' && (
                  <Lab03_Histogram
                    currentImage={currentImage}
                    onImageChange={setCurrentImage}
                  />
                )}
                {activeLabId === 'lab-04' && (
                  <Lab04_Features
                    currentImage={currentImage}
                    onImageChange={setCurrentImage}
                  />
                )}
                {activeLabId === 'lab-05' && (
                  <Lab05_PCA />
                )}
                {activeLabId === 'lab-06' && (
                  <Lab06_YOLO
                    currentImage={currentImage}
                    onImageChange={setCurrentImage}
                  />
                )}
                {activeLabId === 'lab-07' && (
                  <Lab07_Segmentation
                    currentImage={currentImage}
                    onImageChange={setCurrentImage}
                  />
                )}
              </div>
            )}

            {viewMode === 'code' && activeSnippet && (
              <div key="code" className="view-enter">
                <CodeViewer
                  filename={activeSnippet.filename}
                  code={activeSnippet.code}
                />
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
