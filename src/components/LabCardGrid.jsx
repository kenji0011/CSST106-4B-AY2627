import React from 'react';
import { LAB_MODULES } from '../labs/registry';
import { COURSE_INFO } from '../utils/reportData';
import { ArrowRight, CheckCircle2, PlusCircle, Sparkles, Layers, Terminal, BookOpen } from 'lucide-react';

export default function LabCardGrid({ onSelectLab }) {
  // Tags/keywords for each lab to show on cards
  const LAB_TAGS = {
    'lab-01': ['RGB', 'GRAYSCALE', 'HSV', 'CHANNELS', 'CONTRAST', 'GAMMA'],
    'lab-02': ['CANNY', 'SOBEL', 'PREWITT', 'LAPLACIAN', 'HYSTERESIS'],
    'lab-03': ['HISTOGRAM', 'CDF', 'EQUALIZATION', 'CLAHE', 'CONTRAST'],
    'lab-04': ['ORB', 'HARRIS', 'SURF', 'KEYPOINTS', 'ORIENTATION'],
    'lab-05': ['PCA', 'EIGENFACES', 'COVARIANCE', 'SVD', 'COMPRESSION'],
    'lab-06': ['YOLOV8', 'DEEP LEARNING', 'BBOX', 'IOU NMS', 'CONFIDENCE'],
    'lab-07': ['OTSU', 'K-MEANS', 'CLUSTERING', 'BINARIZATION', 'COLOR SEGMENT']
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Hero Header Section */}
      <section className="comic-box" style={{ padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="comic-tag comic-tag-yellow" style={{ fontSize: '11px', padding: '4px 10px' }}>
              CHAPTER 01 // OVERVIEW
            </span>
            <span className="comic-tag-outline" style={{ fontSize: '11px', padding: '4px 10px' }}>
              CSST 106 • AY 2026-2027
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="comic-tag comic-tag-green" style={{ fontSize: '11px' }}>
              STATUS // ALL 7 LABS COMPILED
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '12px' }}>
            COMPUTER VISION LABORATORY SUITE.
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: 1.6, marginBottom: '20px' }}>
            Integrated web platform compiling all Computer Vision laboratory activities for Laguna State Polytechnic University.
            Select any laboratory card below to access its interactive playground, examine the Python implementation, or generate a formal hard-copy laboratory report.
          </p>
        </div>

        {/* Student & Course Metadata Strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', paddingTop: '18px', borderTop: '2.5px dashed var(--border-color)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6, display: 'block' }}>STUDENT</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{COURSE_INFO.studentName}</strong>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6, display: 'block' }}>SECTION</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{COURSE_INFO.section}</strong>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6, display: 'block' }}>INSTITUTION</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{COURSE_INFO.institution}</strong>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6, display: 'block' }}>EVALUATION</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>READY FOR CHECKING</strong>
          </div>
        </div>
      </section>

      {/* Laboratory Modules Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="comic-tag" style={{ fontSize: '12px', padding: '4px 10px' }}>
            CHAPTER 02 // MODULES
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            SELECT LABORATORY ACTIVITY
          </h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, opacity: 0.7 }}>
          7 MODULES AVAILABLE
        </span>
      </div>

      {/* Grid of Laboratory Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}
      >
        {LAB_MODULES.map((lab) => {
          const tags = LAB_TAGS[lab.id] || [];
          return (
            <div
              key={lab.id}
              onClick={() => onSelectLab(lab.id)}
              className="comic-box comic-card-hover"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                minHeight: '280px',
                position: 'relative'
              }}
            >
              <div>
                {/* Card Header: Number box & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      className="comic-box-sm"
                      style={{
                        width: '38px',
                        height: '38px',
                        background: 'var(--accent-yellow)',
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '16px'
                      }}
                    >
                      {lab.number}
                    </div>
                    <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
                      {lab.category.toUpperCase()}
                    </span>
                  </div>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 800 }}>
                    <CheckCircle2 size={13} />
                    <span>COMPILED</span>
                  </span>
                </div>

                {/* Card Title & Description */}
                <h3 style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1.25, marginBottom: '8px' }}>
                  {lab.title}
                </h3>
                <p style={{ fontSize: '12px', opacity: 0.75, lineHeight: 1.55, marginBottom: '16px' }}>
                  {lab.description}
                </p>

                {/* Key Technique Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-surface)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Button */}
              <div style={{ paddingTop: '14px', borderTop: '2px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }}>
                  {lab.chapter}
                </span>

                <button
                  className="comic-btn comic-btn-accent"
                  style={{ padding: '6px 14px', fontSize: '11px', gap: '6px' }}
                >
                  <span>Open Lab</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Extensible Lab n Card */}
        <div
          className="comic-box-sm"
          style={{
            padding: '24px',
            borderStyle: 'dashed',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
            minHeight: '280px',
            opacity: 0.8
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: '2.5px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PlusCircle size={24} />
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '4px' }}>
              LAB ACTIVITY n (EXTENSIBLE)
            </h3>
            <p style={{ fontSize: '12px', opacity: 0.7, maxWidth: '280px', margin: '0 auto' }}>
              Modular architecture ready for future experiments. Easily add new laboratory components via <code>registry.js</code>.
            </p>
          </div>

          <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
            REGISTRY READY
          </span>
        </div>
      </div>
    </div>
  );
}
