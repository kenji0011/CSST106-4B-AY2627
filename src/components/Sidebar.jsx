import React from 'react';
import { LAB_MODULES } from '../labs/registry';
import { CheckCircle2, PlusCircle, User, Award, BookOpen } from 'lucide-react';
import { COURSE_INFO } from '../utils/reportData';

export default function Sidebar({ activeLabId, onSelectLab }) {
  return (
    <aside className="comic-sidebar no-print">
      {/* Student & Course Profile Card */}
      <div className="comic-box comic-sidebar-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div className="comic-tag comic-tag-yellow" style={{ fontSize: '10px' }}>
            CREATOR // 01
          </div>
          <span className="comic-tag comic-tag-green" style={{ fontSize: '10px' }}>
            ALL 7 COMPILED
          </span>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 900, marginBottom: '2px' }}>
          {COURSE_INFO.studentName}
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.8, marginBottom: '12px' }}>
          {COURSE_INFO.section} • {COURSE_INFO.courseCode}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '2px dashed var(--border-color)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            <span style={{ opacity: 0.6, display: 'block' }}>MODULES</span>
            <strong>7 LABS READY</strong>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            <span style={{ opacity: 0.6, display: 'block' }}>EVALUATION</span>
            <strong style={{ color: 'var(--accent-green)' }}>READY FOR CHECK</strong>
          </div>
        </div>
      </div>

      {/* Lab Module Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', opacity: 0.7 }}>
          LABORATORY MODULES
        </span>
        <span className="comic-tag-outline" style={{ fontSize: '9px', padding: '1px 6px' }}>
          7 TOTAL
        </span>
      </div>

      {/* List of Experiments */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {LAB_MODULES.map((lab) => {
          const isActive = activeLabId === lab.id;
          return (
            <button
              key={lab.id}
              onClick={() => onSelectLab(lab.id)}
              className={`comic-nav-item comic-box-sm ${isActive ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span className={isActive ? 'comic-tag comic-tag-yellow' : 'comic-tag-outline'} style={{ fontSize: '9px', padding: '2px 6px' }}>
                  EXP {lab.number}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 700 }}>
                  <CheckCircle2 size={12} />
                  <span>COMPILED</span>
                </span>
              </div>

              <div style={{ textAlign: 'left', width: '100%', marginTop: '2px' }}>
                <strong style={{ display: 'block', fontSize: '13px', lineHeight: 1.25 }}>
                  {lab.title}
                </strong>
                <span style={{ fontSize: '11px', opacity: 0.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '2px' }}>
                  {lab.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Extensible Lab n Placeholder Card */}
      <div
        className="comic-box-sm"
        style={{
          padding: '12px',
          borderStyle: 'dashed',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={14} />
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            LAB ACTIVITY n (EXTENSIBLE)
          </strong>
        </div>
        <p style={{ fontSize: '10px', opacity: 0.7 }}>
          Easily register subsequent activities into <code>src/labs/registry.js</code> to expand the web UI.
        </p>
      </div>
    </aside>
  );
}
