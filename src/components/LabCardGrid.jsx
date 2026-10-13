import React from 'react';
import { LAB_MODULES } from '../labs/registry';
import { COURSE_INFO } from '../utils/reportData';
import { ArrowRight, CheckCircle2, Clock, PlusCircle } from 'lucide-react';

export default function LabCardGrid({ onSelectLab }) {
  const LAB_TAGS = {
    'lab-01': ['RGB & BGR', 'GRAYSCALE', 'CHANNELS', 'PIXEL INSPECT', 'ROI CROP', 'RESIZE', 'ROTATE 90°']
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
              STATUS // LAB 01 COMPILED &amp; ACTIVE
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '12px' }}>
            COMPUTER VISION LABORATORY SUITE.
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: 1.6, marginBottom: '20px' }}>
            Integrated web platform compiling all Computer Vision laboratory activities for Laguna State Polytechnic University.
            Select Laboratory 1 below to test the interactive OpenCV pipeline, inspect the Python backend code, or generate the official laboratory report.
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6, display: 'block' }}>STATUS</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>ACTIVE &amp; READY FOR CHECKING</strong>
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
            LABORATORY ACTIVITIES
          </h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, opacity: 0.7 }}>
          1 COMPILED • UPCOMING MODULES PENDING
        </span>
      </div>

      {/* Grid of Laboratory Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Lab 01 Card */}
        {LAB_MODULES.map((lab) => {
          const tags = LAB_TAGS[lab.id] || [];
          return (
            <div
              key={lab.id}
              onClick={() => onSelectLab(lab.id)}
              className="comic-box comic-card-hover"
              style={{
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                minHeight: '300px',
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
                        width: '42px',
                        height: '42px',
                        background: 'var(--accent-yellow)',
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '18px'
                      }}
                    >
                      {lab.number}
                    </div>
                    <span className="comic-tag-outline" style={{ fontSize: '10px' }}>
                      {lab.category.toUpperCase()}
                    </span>
                  </div>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 800 }}>
                    <CheckCircle2 size={14} />
                    <span>COMPILED &amp; TESTED</span>
                  </span>
                </div>

                {/* Card Title & Description */}
                <h3 style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1.25, marginBottom: '8px' }}>
                  {lab.title}
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6, marginBottom: '18px' }}>
                  {lab.description}
                </p>

                {/* Key Technique Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
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
              <div style={{ paddingTop: '16px', borderTop: '2px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }}>
                  {lab.chapter}
                </span>

                <button
                  className="comic-btn comic-btn-accent"
                  style={{ padding: '8px 16px', fontSize: '11px', gap: '6px' }}
                >
                  <span>Open Lab 1</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Placeholder Card for Labs 2 through n */}
        <div
          className="comic-box-sm"
          style={{
            padding: '26px',
            borderStyle: 'dashed',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: '14px',
            minHeight: '300px',
            opacity: 0.85
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2.5px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface)'
            }}
          >
            <Clock size={24} />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '6px' }}>
              LABORATORY ACTIVITIES 02 TO 07
            </h3>
            <p style={{ fontSize: '12px', opacity: 0.7, maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
              Upcoming laboratory modules will be added here one by one as instructions and starter files are provided.
            </p>
          </div>

          <span className="comic-tag-outline" style={{ fontSize: '10px', padding: '3px 8px' }}>
            AWAITING INSTRUCTIONS
          </span>
        </div>
      </div>
    </div>
  );
}
