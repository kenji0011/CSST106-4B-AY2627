import React from 'react';
import { Sun, Moon, Printer, Code, Sparkles, FileText, FlaskConical } from 'lucide-react';
import { COURSE_INFO } from '../utils/reportData';

export default function Navbar({ activeLab, viewMode, setViewMode, theme, toggleTheme, onPrint }) {
  return (
    <header className="comic-nav">
      <div className="comic-nav-container">
        {/* Left: Branding & Course Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="comic-tag comic-tag-yellow" style={{ fontSize: '14px', padding: '6px 12px' }}>
            <span>CSST 106.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '14px', letterSpacing: '0.02em' }}>
              COMPUTER VISION LAB SUITE
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.75, letterSpacing: '0.05em' }}>
              LSPU • BSCS 4B • AY 2026-2027
            </span>
          </div>
        </div>

        {/* Center: Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="no-print">
          <button
            onClick={() => setViewMode('playground')}
            className={`comic-tab ${viewMode === 'playground' ? 'active' : ''}`}
            title="Interactive Computer Vision Demo"
          >
            <FlaskConical size={14} />
            <span>Playground</span>
          </button>

          <button
            onClick={() => setViewMode('code')}
            className={`comic-tab ${viewMode === 'code' ? 'active' : ''}`}
            title="View Python Source Code"
          >
            <Code size={14} />
            <span>Python Source</span>
          </button>

          <button
            onClick={() => setViewMode('report')}
            className={`comic-tab ${viewMode === 'report' ? 'active' : ''}`}
            title="Academic Laboratory Report"
          >
            <FileText size={14} />
            <span>Lab Report</span>
          </button>
        </div>

        {/* Right: Actions (Print, Theme, GitHub) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="no-print">
          {viewMode === 'report' && (
            <button
              onClick={onPrint}
              className="comic-btn comic-btn-accent"
              style={{ padding: '6px 12px', fontSize: '11px' }}
              title="Print Hard-Copy Report"
            >
              <Printer size={14} />
              <span>Print Report</span>
            </button>
          )}

          <a
            href="https://github.com/kenji0011/CSST106-4B-AY2627"
            target="_blank"
            rel="noopener noreferrer"
            className="comic-btn comic-btn-secondary comic-btn-icon"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>

          <button
            onClick={toggleTheme}
            className="comic-btn comic-btn-secondary comic-btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
