import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function CodeViewer({ filename, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-viewer-container">
      {/* Header Bar */}
      <div className="code-viewer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} />
          <strong style={{ letterSpacing: '0.02em' }}>{filename}</strong>
          <span className="comic-tag" style={{ fontSize: '10px', padding: '2px 8px', background: '#27272a', color: '#f8fafc', borderColor: '#3f3f46' }}>
            Python 3 / OpenCV
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="comic-btn"
          style={{ padding: '5px 12px', fontSize: '11px', background: '#ffffff', color: '#09090b', borderColor: '#ffffff' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Code Text with Line Numbers */}
      <pre className="code-viewer-pre">
        <code>
          {code.split('\n').map((line, idx) => (
            <div key={idx} style={{ display: 'flex' }}>
              <span style={{ width: '40px', opacity: 0.35, userSelect: 'none', textAlign: 'right', paddingRight: '16px' }}>
                {idx + 1}
              </span>
              <span style={{ flex: 1, whiteSpace: 'pre' }}>
                {line}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
