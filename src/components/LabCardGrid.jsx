import React from 'react';
import { LAB_MODULES } from '../labs/registry';
import { COURSE_INFO } from '../utils/courseInfo';
import { ArrowRight, Clock } from 'lucide-react';

export default function LabCardGrid({ onSelectLab }) {
  const LAB_TAGS = {
    'lab-01': ['RGB & BGR', 'GRAYSCALE', 'CHANNELS', 'PIXEL INSPECT', 'ROI CROP', 'RESIZE', 'ROTATE 90°'],
    'lab-02': ['SOBEL OPERATOR', 'CANNY DETECTOR', 'GAUSSIAN BLUR', 'GRADIENTS GX/GY', 'HYSTERESIS', '3-WAY COMPARISON'],
    'lab-03': ['HISTOGRAM', 'EQUALIZEHIST', 'CLAHE', 'CONTRAST STRETCH', 'YUV LUMINANCE', 'CDF MAPPING']
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Hero Header Section */}
      <section className="comic-box" style={{ padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="comic-tag comic-tag-yellow" style={{ fontSize: '11px', padding: '4px 10px' }}>
              CHAPTER 01
            </span>
          </div>
        </div>

        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '12px' }}>
            COMPUTER VISION LABORATORY SUITE.
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.6, marginBottom: '20px' }}>
            A unified interactive laboratory compilation for <strong>CSST 106: Perception and Computer Vision</strong> at Laguna State Polytechnic University.
            Explore fundamental image processing concepts, test live OpenCV pipelines with custom uploaded images, and directly inspect the underlying Python backend implementations.
          </p>
        </div>

        {/* Student & Course Metadata Strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', paddingTop: '18px', borderTop: '2.5px dashed var(--border-color)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, display: 'block' }}>STUDENT</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{COURSE_INFO.studentName}</strong>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, display: 'block' }}>SECTION</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{COURSE_INFO.section}</strong>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, display: 'block' }}>INSTITUTION</span>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{COURSE_INFO.institution}</strong>
          </div>
        </div>
      </section>

      {/* Laboratory Modules Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="comic-tag" style={{ fontSize: '12px', padding: '4px 10px' }}>
            CHAPTER 02 
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            LABORATORY ACTIVITIES
          </h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {LAB_MODULES.length} COMPILED • UPCOMING MODULES PENDING
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
                {/* Card Header: Number box */}
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
                </div>

                {/* Card Title & Description */}
                <h3 style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1.25, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {lab.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.6, marginBottom: '18px' }}>
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
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Button */}
              <div style={{ paddingTop: '16px', borderTop: '2px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  {lab.chapter}
                </span>

                <button
                  className="comic-btn comic-btn-accent"
                  style={{ padding: '8px 16px', fontSize: '11px', gap: '6px' }}
                >
                  <span>Open Lab {lab.number}</span>
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
            minHeight: '300px'
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
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)'
            }}
          >
            <Clock size={24} />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '6px', color: 'var(--text-primary)' }}>
              LABORATORY ACTIVITIES
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
              Upcoming laboratory modules will be added here one by one as instructions and starter files are provided.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
