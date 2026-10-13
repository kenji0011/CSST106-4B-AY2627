import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CodeViewer from './components/CodeViewer';
import ReportGenerator from './components/ReportGenerator';
import { LAB_MODULES, getLabById } from './labs/registry';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { PYTHON_SNIPPETS } from './utils/pythonCodeSnippets';

// Lab Components
import Lab01_Images from './labs/Lab01_Images';
import Lab02_EdgeDetection from './labs/Lab02_EdgeDetection';
import Lab03_Histogram from './labs/Lab03_Histogram';
import Lab04_Features from './labs/Lab04_Features';
import Lab05_PCA from './labs/Lab05_PCA';
import Lab06_YOLOv8 from './labs/Lab06_YOLOv8';
import Lab07_Segmentation from './labs/Lab07_Segmentation';

export default function App() {
  const [activeLabId, setActiveLabId] = useState('lab-01');
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
    setSnapshots(prev => ({
      ...prev,
      [activeLabId]: dataUrl
    }));
  };

  const activeLab = getLabById(activeLabId);
  const activeSnippet = PYTHON_SNIPPETS[activeLabId] || PYTHON_SNIPPETS['lab-01'];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Halftone Comic Dots Pattern Background */}
      <div className="comic-dots-bg" />

      {/* Top Navbar */}
      <Navbar
        activeLab={activeLab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        toggleTheme={toggleTheme}
        onPrint={handlePrint}
      />

      {/* Main Layout Grid */}
      <div className="comic-app-layout">
        {/* Left Sidebar */}
        <Sidebar
          activeLabId={activeLabId}
          onSelectLab={(id) => {
            setActiveLabId(id);
            // Default to appropriate sample for specific labs
            if (id === 'lab-06') setCurrentImage(SAMPLE_IMAGES[1].url); // Traffic for YOLO
            else if (id === 'lab-07') setCurrentImage(SAMPLE_IMAGES[2].url); // Shapes for Segmentation
          }}
        />

        {/* Main Workspace Area */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Experiment Title Banner */}
          <div className="comic-box" style={{ padding: '18px 24px' }}>
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
                STATUS // EVALUATION READY
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1.2, margin: '6px 0 4px 0' }}>
              {activeLab.title}
            </h1>
            <p style={{ fontSize: '13px', opacity: 0.8, maxWidth: '850px' }}>
              {activeLab.description}
            </p>
          </div>

          {/* Mode View Switcher: Interactive Playground / Code / Report */}
          {viewMode === 'playground' && (
            <div>
              {activeLabId === 'lab-01' && (
                <Lab01_Images
                  currentImage={currentImage}
                  onImageChange={setCurrentImage}
                  onSnapshotReady={handleSnapshotReady}
                />
              )}
              {activeLabId === 'lab-02' && (
                <Lab02_EdgeDetection
                  currentImage={currentImage}
                  onImageChange={setCurrentImage}
                  onSnapshotReady={handleSnapshotReady}
                />
              )}
              {activeLabId === 'lab-03' && (
                <Lab03_Histogram
                  currentImage={currentImage}
                  onImageChange={setCurrentImage}
                  onSnapshotReady={handleSnapshotReady}
                />
              )}
              {activeLabId === 'lab-04' && (
                <Lab04_Features
                  currentImage={currentImage}
                  onImageChange={setCurrentImage}
                  onSnapshotReady={handleSnapshotReady}
                />
              )}
              {activeLabId === 'lab-05' && (
                <Lab05_PCA
                  currentImage={currentImage}
                  onImageChange={setCurrentImage}
                  onSnapshotReady={handleSnapshotReady}
                />
              )}
              {activeLabId === 'lab-06' && (
                <Lab06_YOLOv8
                  currentImage={currentImage}
                  onImageChange={setCurrentImage}
                  onSnapshotReady={handleSnapshotReady}
                />
              )}
              {activeLabId === 'lab-07' && (
                <Lab07_Segmentation
                  currentImage={currentImage}
                  onImageChange={setCurrentImage}
                  onSnapshotReady={handleSnapshotReady}
                />
              )}
            </div>
          )}

          {viewMode === 'code' && (
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
        </main>
      </div>
    </div>
  );
}
