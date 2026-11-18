import React from 'react';
import { LAB_MODULES } from '../labs/registry';
import { COURSE_INFO } from '../utils/courseInfo';
import { ArrowRight, Clock } from 'lucide-react';

export default function LabCardGrid({ onSelectLab }) {
  const LAB_TAGS = {
    'lab-01': ['RGB & BGR', 'Grayscale', 'Channels', 'Pixel Inspect', 'ROI Crop', 'Resize', 'Rotate 90°'],
    'lab-02': ['Sobel Operator', 'Canny Detector', 'Gaussian Blur', 'Gradients Gx/Gy', 'Hysteresis', '3-Way Comparison'],
    'lab-03': ['Histogram', 'equalizeHist', 'CLAHE', 'Contrast Stretch', 'YUV Luminance', 'CDF Mapping'],
    'lab-04': ['SURF', 'Hessian Threshold', 'U-SURF', 'SIFT', 'ORB', 'Feature Matching']
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Hero Header Section */}
      <section className="comic-box" style={{ padding: '28px 32px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="comic-tag comic-tag-yellow" style={{ fontSize: '11px', padding: '4px 10px' }}>
            CSST 106
          </span>
          <span className="comic-tag-outline" style={{ fontSize: '11px', padding: '4px 10px' }}>
            Course Overview
          </span>
        </div>

        <div style={{ maxWidth: '880px' }}>
          <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 700, lineHeight: 1.15, marginBottom: '10px' }}>
            Computer Vision Laboratory Suite
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 400, lineHeight: 1.6, marginBottom: '20px' }}>
            A unified interactive laboratory compilation for <strong>CSST 106: Perception and Computer Vision</strong> at Laguna State Polytechnic University.
            Explore fundamental image processing concepts, test live OpenCV pipelines with custom uploaded images, and inspect the underlying Python implementations.
          </p>
        </div>

        {/* Student & Course Metadata Strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Student</span>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{COURSE_INFO.studentName}</strong>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Section</span>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{COURSE_INFO.section}</strong>
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Institution</span>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{COURSE_INFO.institution}</strong>
          </div>
        </div>
      </section>

      {/* Laboratory Modules Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            Laboratory Activities
          </h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {LAB_MODULES.length} Compiled / Upcoming Modules Pending
        </span>
      </div>

      {/* Grid of Laboratory Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px'
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
                minHeight: '290px',
                position: 'relative'
              }}
            >
              <div>
                {/* Card Header: Number badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-strong)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '15px'
                      }}
                    >
                      {lab.number}
                    </div>
                    <span className="comic-tag-outline" style={{ fontSize: '11px' }}>
                      {lab.category}
                    </span>
                  </div>
                </div>

                {/* Card Title & Description */}
                <h3 style={{ fontSize: '19px', fontWeight: 700, lineHeight: 1.3, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {lab.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 400, lineHeight: 1.55, marginBottom: '18px' }}>
                  {lab.description}
                </p>

                {/* Key Technique Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '3px 9px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
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
              <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Lab {lab.number}
                </span>

                <button
                  className="comic-btn comic-btn-accent"
                  style={{ padding: '7px 14px', fontSize: '12px', gap: '6px' }}
                >
                  <span>Open Lab {lab.number}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Placeholder Card for upcoming Labs */}
        <div
          style={{
            padding: '24px',
            border: '1.5px dashed var(--border-strong)',
            borderRadius: '12px',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: '14px',
            minHeight: '290px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)'
            }}
          >
            <Clock size={20} />
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Upcoming Activities
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 400, maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
              Subsequent laboratory modules will appear here as new experiments are added.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
