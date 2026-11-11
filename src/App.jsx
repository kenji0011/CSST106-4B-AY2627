import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LabCardGrid from './components/LabCardGrid';
import CodeViewer from './components/CodeViewer';
import { LAB_MODULES, getLabById } from './labs/registry';
import { PYTHON_SNIPPETS } from './utils/pythonCodeSnippets';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Active Lab Components
import Lab01_Images from './labs/Lab01_Images';
import Lab02_EdgeDetection from './labs/Lab02_EdgeDetection';

export default function App() {
  // null = Home/Cards Grid view; 'lab-01' = Individual Lab page
  const [activeLabId, setActiveLabId] = useState(null);
  const [viewMode, setViewMode] = useState('playground'); // 'playground', 'code'
  const [theme, setTheme] = useState(() => localStorage.getItem('csst106_theme') || 'dark');
  const [currentImage, setCurrentImage] = useState(null);

  // Sync theme attribute to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('csst106_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Open specific lab from card grid
  const handleSelectLab = (id) => {
    setActiveLabId(id);
    setViewMode('playground');
    setCurrentImage(null);
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
            {/* Unified Experiment Header Banner */}
            <div className="comic-box" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="comic-tag comic-tag-yellow" style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {activeLab.shortTag}
                  </span>
                  <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
                    {activeLab.category.toUpperCase()}
                  </span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1.2, margin: '0 0 4px 0' }}>
                  {activeLab.title}
                </h1>
                <p style={{ fontSize: '13px', opacity: 0.85, maxWidth: '800px', margin: 0 }}>
                  {activeLab.description}
                </p>
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
                  {String(currentIndex + 1).padStart(2, '0')} / {String(LAB_MODULES.length).padStart(2, '0')}
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

            {/* Mode Views: Playground or Code */}
            {viewMode === 'playground' && (
              <div>
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
              </div>
            )}

            {viewMode === 'code' && activeSnippet && (
              <CodeViewer
                filename={activeSnippet.filename}
                code={activeSnippet.code}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
