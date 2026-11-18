import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function LabQASection({ title, items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="comic-box qa-accordion" style={{ overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className="qa-accordion-trigger"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'left' }}>
            {title}
          </span>
          <span className="comic-tag-outline" style={{ fontSize: '10px', padding: '2px 7px' }}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`qa-accordion-chevron ${isOpen ? 'open' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div className={`qa-accordion-panel ${isOpen ? 'open' : ''}`}>
        <div className="qa-accordion-inner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 20px 20px 20px' }}>
            {items.map((item, idx) => (
              <div key={idx} className="comic-box-sm" style={{ padding: '14px', background: 'var(--bg-surface)' }}>
                <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '4px' }}>
                  {item.question}
                </strong>
                <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: 'var(--text-secondary)', fontWeight: 400, margin: 0 }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
