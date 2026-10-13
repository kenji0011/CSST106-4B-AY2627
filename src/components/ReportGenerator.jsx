import React, { useState } from 'react';
import { COURSE_INFO, LAB_REPORTS } from '../utils/reportData';
import { Printer, CheckCircle, Edit3 } from 'lucide-react';

export default function ReportGenerator({ activeLabId, snapshotUrl, onPrint }) {
  const report = LAB_REPORTS[activeLabId] || LAB_REPORTS['lab-01'];
  const [customConclusion, setCustomConclusion] = useState(report.conclusion);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Print Action Bar */}
      <div className="comic-box-sm no-print" style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', textTransform: 'uppercase' }}>
            Academic Laboratory Report Mode (A4 Hard-Copy Submission)
          </strong>
          <p style={{ fontSize: '11px', opacity: 0.7 }}>
            Formatted to institutional standard for Laguna State Polytechnic University. Edit your observations below and print.
          </p>
        </div>

        <button
          onClick={onPrint}
          className="comic-btn comic-btn-accent"
          style={{ padding: '8px 18px' }}
        >
          <Printer size={15} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="report-sheet">
        {/* Institutional Header */}
        <div className="report-header">
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4b5563', margin: 0 }}>
            Republic of the Philippines
          </p>
          <h2>{COURSE_INFO.institution.toUpperCase()}</h2>
          <h3>{COURSE_INFO.campus} • Department of Computer Science</h3>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>
            {COURSE_INFO.courseCode}: {COURSE_INFO.courseTitle} ({COURSE_INFO.academicYear})
          </p>
        </div>

        {/* Experiment Title Banner */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '2px solid #000', paddingBottom: '6px', display: 'inline-block' }}>
            {report.title}
          </h1>
        </div>

        {/* Student & Submission Details Table */}
        <table className="report-meta-table">
          <tbody>
            <tr>
              <td style={{ width: '20%', fontWeight: 700, background: '#f3f4f6' }}>Student Name</td>
              <td style={{ width: '30%' }}>{COURSE_INFO.studentName}</td>
              <td style={{ width: '20%', fontWeight: 700, background: '#f3f4f6' }}>Section / Year</td>
              <td style={{ width: '30%' }}>{COURSE_INFO.section}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 700, background: '#f3f4f6' }}>Instructor</td>
              <td>{COURSE_INFO.instructor}</td>
              <td style={{ fontWeight: 700, background: '#f3f4f6' }}>Submission Date</td>
              <td>{COURSE_INFO.submissionDate}</td>
            </tr>
          </tbody>
        </table>

        {/* I. Objectives */}
        <div className="report-section">
          <div className="report-section-title">I. LABORATORY OBJECTIVES</div>
          <ul style={{ paddingLeft: '24px', fontSize: '12px', lineHeight: 1.65 }}>
            {report.objectives.map((obj, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{obj}</li>
            ))}
          </ul>
        </div>

        {/* II. Theoretical Background & Mathematical Formulation */}
        <div className="report-section">
          <div className="report-section-title">II. THEORETICAL BACKGROUND &amp; ALGORITHMS</div>
          <div style={{ fontSize: '12px', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
            {report.theory}
          </div>
        </div>

        {/* III. Methodology & Step-by-Step Procedures */}
        <div className="report-section">
          <div className="report-section-title">III. METHODOLOGY &amp; PROCEDURES</div>
          <ol style={{ paddingLeft: '24px', fontSize: '12px', lineHeight: 1.65 }}>
            {report.procedure.map((step, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{step}</li>
            ))}
          </ol>
        </div>

        {/* IV. Experimental Visual Output */}
        <div className="report-section">
          <div className="report-section-title">IV. EXPERIMENTAL RESULTS &amp; VISUAL OUTPUTS</div>
          <div style={{ textAlign: 'center', border: '1.5px solid #000', padding: '12px', background: '#fafafa' }}>
            {snapshotUrl ? (
              <img
                src={snapshotUrl}
                alt="Experimental Output"
                style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', border: '1px solid #000' }}
              />
            ) : (
              <div style={{ padding: '40px', fontSize: '12px', color: '#6b7280' }}>
                Run the interactive playground to render visual experiment outputs.
              </div>
            )}
            <p style={{ fontSize: '11px', marginTop: '8px', fontStyle: 'italic', color: '#374151' }}>
              Figure: Processed experimental output and verification in the CSST 106 Web User Interface.
            </p>
          </div>
        </div>

        {/* V. Discussion & Conclusion */}
        <div className="report-section">
          <div className="report-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>V. ANALYSIS, OBSERVATIONS &amp; CONCLUSION</span>
            <span className="no-print" style={{ fontSize: '10px', textTransform: 'none', color: '#4b5563', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Edit3 size={11} /> Editable before printing
            </span>
          </div>

          <textarea
            className="report-textarea"
            value={customConclusion}
            onChange={(e) => setCustomConclusion(e.target.value)}
          />
        </div>

        {/* Signatures Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '48px', paddingTop: '20px', borderTop: '1px solid #000' }}>
          <div>
            <p style={{ fontSize: '11px', marginBottom: '32px' }}>Submitted by:</p>
            <p style={{ fontSize: '12px', fontWeight: 800, textDecoration: 'underline' }}>
              {COURSE_INFO.studentName.toUpperCase()}
            </p>
            <p style={{ fontSize: '11px', color: '#4b5563' }}>Student, BSCS 4B</p>
          </div>

          <div>
            <p style={{ fontSize: '11px', marginBottom: '32px' }}>Evaluated by:</p>
            <p style={{ fontSize: '12px', fontWeight: 800, textDecoration: 'underline' }}>
              {COURSE_INFO.instructor.toUpperCase()}
            </p>
            <p style={{ fontSize: '11px', color: '#4b5563' }}>Faculty / Instructor, CSST 106</p>
          </div>
        </div>
      </div>
    </div>
  );
}
