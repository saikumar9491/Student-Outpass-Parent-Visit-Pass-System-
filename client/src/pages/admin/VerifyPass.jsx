import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const VerifyPass = () => {
  const [searchParams] = useSearchParams();
  const [passIdInput, setPassIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // AI Legitimacy Verification states
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Local sample pass data for gate checkpoints
  const localPasses = [
    {
      id: "E78FA250ABC12345",
      type: "OUTPASS",
      name: "Arjun Sharma",
      rollId: "ROLL-1787091234567",
      hostel: "Cauvery Boys Hostel | room: 204",
      date: "27/8/2026",
      timings: "09:00 am – 01:00 pm",
      destination: "Railway Station",
      purpose: "Picking up family",
      status: "ACTIVE",
      approvedBy: "Dr. R. Sharma (Warden)"
    },
    {
      id: "F91BC340DEF67890",
      type: "VISIT PASS",
      name: "Mrs. Kavitha Sharma",
      student: "Arjun Sharma",
      rollId: "ROLL-1787091234567",
      hostel: "Cauvery Boys Hostel | room: 204",
      date: "27/8/2026",
      timings: "10:00 am – 01:00 pm",
      purpose: "Family visit | visitors: 3",
      status: "ACTIVE",
      approvedBy: "Dr. R. Sharma (Warden)"
    },
    {
      id: "G44DE120GHI11223",
      type: "OUTPASS",
      name: "Rohan Mehta",
      rollId: "ROLL-1787078901234",
      hostel: "Kaveri Boys Hostel | room: 115",
      date: "27/8/2026",
      timings: "08:00 am – 11:00 am",
      destination: "City Market",
      purpose: "Buying supplies",
      status: "EXPIRED",
      approvedBy: "Mr. K. Patel (Warden)"
    },
    {
      id: "H77FA890JKL44556",
      type: "OUTPASS",
      name: "Priya Patel",
      rollId: "ROLL-1787055678901",
      hostel: "Ganga Girls Hostel | room: 312",
      date: "26/8/2026",
      timings: "02:00 pm – 06:00 pm",
      destination: "City Hospital",
      purpose: "Medical checkup",
      status: "EXPIRED",
      approvedBy: "Mrs. S. Nair (Warden)"
    }
  ];

  // Auto load query param if present
  useEffect(() => {
    const qId = searchParams.get('id');
    if (qId) {
      setPassIdInput(qId);
      runVerification(qId);
    }
  }, [searchParams]);

  // AI scan call for valid active passes
  useEffect(() => {
    if (result && result.status === 'ACTIVE') {
      fetchAiCheck(result);
    } else {
      setAiText('');
    }
  }, [result]);

  const fetchAiCheck = async (pass) => {
    setAiLoading(true);
    setAiText('');
    try {
      const res = await API.post('/admin/ai-review', {
        passDetails: {
          id: pass.id,
          type: pass.type,
          name: pass.name,
          rollId: pass.rollId,
          hostel: pass.hostel,
          date: pass.date,
          timings: pass.timings,
          destination: pass.destination || pass.purpose,
          purpose: pass.purpose,
          status: pass.status,
          approvedBy: pass.approvedBy
        },
        systemPrompt: "You are a hostel gate security AI for a university. A guard is verifying a student or parent permit at the gate. Review the permit details and give a brief 2–3 sentence security assessment: confirm if the pass looks legitimate, check if the current time is within the permitted window, note any concerns, and state clearly whether the person should be ALLOWED or HELD for warden verification. Be direct and use simple language a gate guard can act on immediately."
      });
      setAiText(res.data.response);
    } catch (error) {
      console.error('Error fetching AI legitimacy verification scan:', error);
      setAiText('Error generating legitimacy audit: AI monitor offline.');
    } finally {
      setAiLoading(false);
    }
  };

  const runVerification = async (targetId) => {
    const searchId = (targetId || passIdInput).trim().toUpperCase();
    if (!searchId) {
      setErrorMsg('Enter a pass ID first');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    // 1. Look up in local array
    const matchedLocal = localPasses.find(p => p.id === searchId);
    if (matchedLocal) {
      setResult(matchedLocal);
      setLoading(false);
      return;
    }

    // 2. Look up in live database API
    try {
      const res = await API.get(`/verify/pass/${searchId}`);
      const dbPass = res.data;
      // Map database structure to our common verification layout
      const mapped = {
        id: dbPass.passId,
        type: dbPass.passType.toUpperCase(),
        name: dbPass.name,
        rollId: dbPass.studentId,
        hostel: `${dbPass.hostel} | room: ${dbPass.roomNumber}`,
        date: new Date(dbPass.date).toLocaleDateString(),
        timings: dbPass.validTime,
        destination: dbPass.destination || '',
        purpose: dbPass.purpose || '',
        status: dbPass.status === 'VALID' ? 'ACTIVE' : dbPass.status,
        approvedBy: 'Registrar Office'
      };
      setResult(mapped);
    } catch (error) {
      console.error('Verification query failed:', error);
      // STATE 3: INVALID / NOT FOUND
      setResult({ status: 'INVALID' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setPassIdInput(e.target.value);
    if (errorMsg) {
      setErrorMsg('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      runVerification();
    }
  };

  const sendPrompt = (pass) => {
    const promptText = `Security Desk Chat: Please verify legitimacy of: ${pass.name} (Pass ID: ${pass.id}), Type: ${pass.type}, Hostel: ${pass.hostel}, Valid window: ${pass.date} (${pass.timings}), Purpose: ${pass.purpose}, Authorized by: ${pass.approvedBy}`;
    console.log('sendPrompt called:', promptText);
    toast.success(`Prompt sent to security desk: "${pass.name}'s active permit verification"`);
  };

  // Parse AI response to show highlight verdict badges
  const isVerdictAllowed = aiText.toUpperCase().includes('ALLOWED') || aiText.toUpperCase().includes('ALLOW ');
  const isVerdictHeld = aiText.toUpperCase().includes('HELD') || aiText.toUpperCase().includes('HOLD');

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-0)', color: 'var(--text-primary)' }}>
      {/* Navigation Bar */}
      <nav className="w-full bg-[#110e2c] text-white py-4 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img 
            src="https://www.rgukt.in/assets/media/logos/rgukt.png" 
            alt="RGUT Logo" 
            className="h-8 w-8 object-contain" 
          />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-extrabold text-white tracking-tight leading-tight uppercase">Rajiv Gandhi University of Technology</span>
            <span className="text-[9px] text-slate-450 font-semibold mt-0.5">Hostel Pass System &bull; Gate Control</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-pill badge-pill-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span className="ti ti-shield-check"></span>
            <span>Gate Checkpoint</span>
          </span>
        </div>
      </nav>

      {/* CSS variables & centered container styling */}
      <style>{`
        :root {
          --surface-0: #ffffff;
          --surface-2: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --border-success: #10b981;
          --border-warning: #f59e0b;
          --border-danger: #ef4444;
          --border-accent: #3b82f6;
          --bg-success: #d1fae5;
          --bg-warning: #fef3c7;
          --bg-danger: #fee2e2;
          --bg-accent: #eff6ff;
          --text-success: #059669;
          --text-warning: #d97706;
          --text-danger: #dc2626;
          --text-accent: #2563eb;
          --fill-accent: #3b82f6; /* light blue */
          --fill-accent-hover: #1d4ed8; /* dark blue */
          --radius: 8px;
          --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }

        .verify-card-width {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .heading-22 {
          font-size: 22px;
          font-weight: 500;
          color: var(--text-primary);
          text-align: center;
        }

        .subtitle-13 {
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .search-card {
          background: var(--surface-2);
          border-radius: 12px;
          border: 0.5px solid var(--border);
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .search-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .input-scan-icon {
          font-size: 16px;
          color: var(--text-muted);
          position: absolute;
          left: 0;
        }

        .pass-input {
          width: 100%;
          background: transparent;
          border: none;
          padding: 8px 12px 8px 24px;
          font-size: 14px;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-primary);
        }

        .pass-input::placeholder {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        .pass-input:focus {
          outline: none;
        }

        .btn-search {
          background: var(--fill-accent);
          color: #ffffff;
          padding: 8px 20px;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.15s;
        }

        .btn-search:hover {
          background: var(--fill-accent-hover);
        }

        .validation-error {
          font-size: 12px;
          color: var(--text-danger);
          margin-top: 8px;
          text-align: left;
        }

        .result-card-container {
          transition: opacity 0.2s ease, transform 0.2s ease;
          animation: cardFadeIn 0.2s forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .result-card-container {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result-card {
          background: var(--surface-2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .result-card-valid {
          border: 0.5px solid var(--border-success);
        }

        .result-card-expired {
          border: 0.5px solid var(--border-warning);
        }

        .result-card-invalid {
          border: 0.5px solid var(--border-danger);
          background: var(--bg-danger);
          text-align: center;
          padding: 2.5rem 1.5rem;
        }

        .status-banner {
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .status-banner-valid {
          background: var(--bg-success);
          color: var(--text-success);
        }

        .status-banner-expired {
          background: var(--bg-warning);
          color: var(--text-warning);
        }

        .status-label {
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-icon {
          font-size: 20px;
        }

        .badge-pill {
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .badge-pill-success {
          background: var(--bg-success);
          color: var(--text-success);
        }

        .badge-pill-warning {
          background: var(--bg-warning);
          color: var(--text-warning);
        }

        .badge-type {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 999px;
          margin-top: 1rem;
          font-weight: 500;
        }

        .badge-type-outpass {
          background: var(--bg-accent);
          color: var(--text-accent);
        }

        .badge-type-visit {
          background: var(--bg-success);
          color: var(--text-success);
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          font-size: 13px;
        }

        .detail-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .detail-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .detail-value-dimmed {
          color: var(--text-secondary);
        }

        .result-footer {
          margin-top: 1rem;
          border-top: 0.5px solid var(--border);
          padding-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-muted);
        }

        .footer-verify-text {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .footer-icon-valid {
          color: var(--text-success);
        }

        .footer-icon-expired {
          color: var(--text-warning);
        }

        .ai-panel {
          border-radius: 12px;
          border: 0.5px solid var(--border-accent);
          background: var(--surface-2);
          overflow: hidden;
        }

        .ai-header {
          background: var(--bg-accent);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 0.5px solid var(--border-accent);
          color: var(--text-accent);
          font-size: 13px;
          font-weight: 500;
        }

        .ai-body {
          padding: 16px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .ai-verdict-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: var(--radius);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .ai-verdict-allowed {
          background: var(--bg-success);
          color: var(--text-success);
        }

        .ai-verdict-held {
          background: var(--bg-warning);
          color: var(--text-warning);
        }

        .ai-btn-action {
          background: transparent;
          color: var(--text-accent);
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          margin-top: 10px;
        }

        .ai-btn-action:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Main Body Centering */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="verify-card-width mt-[-5vh]">
          <h1 className="heading-22">Verify Digital Permit</h1>
          <p className="subtitle-13">Scan or enter the unique 16-character Pass ID to check legitimacy.</p>

          {/* Search Box Input Card */}
          <div className="search-card">
            <div className="search-row">
              {/* Scan icon left */}
              <div className="input-wrapper">
                <span className="ti ti-scan input-scan-icon"></span>
                <input
                  type="text"
                  value={passIdInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="ENTER UNIQUE PASS ID (E.G. E78FA250)"
                  className="pass-input"
                />
              </div>

              {/* Submit button right */}
              <button
                onClick={() => runVerification()}
                className="btn-search"
              >
                <span className="ti ti-search"></span>
                <span>Search</span>
              </button>
            </div>

            {/* Validation error display */}
            {errorMsg && (
              <div className="validation-error">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}

          {/* Result Card outputs */}
          {result && !loading && (
            <div className="result-card-container">
              {result.status === 'INVALID' ? (
                /* STATE 3: INVALID / NOT FOUND card */
                <div className="result-card result-card-invalid">
                  <span className="ti ti-shield-x" style={{ fontSize: '32px', color: 'var(--text-danger)' }}></span>
                  <h2 className="heading-22" style={{ fontSize: '16px', color: 'var(--text-danger)', marginTop: '8px' }}>Permit not found</h2>
                  <p className="text-secondary-13" style={{ marginTop: '4px' }}>
                    No permit matches this ID. It may be fake, revoked, or incorrectly entered.
                  </p>
                </div>
              ) : result.status === 'ACTIVE' ? (
                /* STATE 1: VALID & ACTIVE card */
                <div className="result-card result-card-valid">
                  {/* Banner Header Valid */}
                  <div className="status-banner status-banner-valid">
                    <div className="status-label">
                      <span className="ti ti-circle-check status-icon"></span>
                      <span>PERMIT VALID</span>
                    </div>
                    <span className="badge-pill badge-pill-success">ACTIVE</span>
                  </div>

                  {/* Pass Type Badge */}
                  <div className={`badge-type ${result.type.includes('OUTPASS') ? 'badge-type-outpass' : 'badge-type-visit'}`}>
                    <span className={`ti ${result.type.includes('OUTPASS') ? 'ti-walk' : 'ti-users'}`}></span>
                    <span>{result.type.includes('OUTPASS') ? 'Outpass' : 'Visit Pass'}</span>
                  </div>

                  {/* Details Section */}
                  <div className="details-grid">
                    {result.type.includes('OUTPASS') ? (
                      <>
                        <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{result.name}</span></div>
                        <div className="detail-item"><span className="detail-label">Roll ID</span><span className="detail-value">{result.rollId}</span></div>
                        <div className="detail-item"><span className="detail-label">Hostel & Room</span><span className="detail-value">{result.hostel}</span></div>
                        <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{result.date}</span></div>
                        <div className="detail-item"><span className="detail-label">Timings</span><span className="detail-value">{result.timings}</span></div>
                        <div className="detail-item"><span className="detail-label">Destination</span><span className="detail-value">{result.destination}</span></div>
                        <div className="detail-item"><span className="detail-label">Purpose</span><span className="detail-value">{result.purpose}</span></div>
                        <div className="detail-item"><span className="detail-label">Approved By</span><span className="detail-value">{result.approvedBy}</span></div>
                      </>
                    ) : (
                      <>
                        <div className="detail-item"><span className="detail-label">Parent Name</span><span className="detail-value">{result.name}</span></div>
                        <div className="detail-item"><span className="detail-label">Student Name</span><span className="detail-value">{result.student || 'Student'}</span></div>
                        <div className="detail-item"><span className="detail-label">Roll ID</span><span className="detail-value">{result.rollId}</span></div>
                        <div className="detail-item"><span className="detail-label">Hostel & Room</span><span className="detail-value">{result.hostel}</span></div>
                        <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{result.date}</span></div>
                        <div className="detail-item"><span className="detail-label">Timings</span><span className="detail-value">{result.timings}</span></div>
                        <div className="detail-item"><span className="detail-label">Purpose</span><span className="detail-value">{result.purpose}</span></div>
                        <div className="detail-item"><span className="detail-label">Approved By</span><span className="detail-value">{result.approvedBy}</span></div>
                      </>
                    )}
                  </div>

                  {/* Bottom verification Row */}
                  <div className="result-footer">
                    <div className="footer-verify-text">
                      <span className="ti ti-shield-check footer-icon-valid"></span>
                      <span>Verified by Hostel Pass System</span>
                    </div>
                    <div>
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                /* STATE 2: EXPIRED / USED card */
                <div className="result-card result-card-expired">
                  {/* Status banner Expired */}
                  <div className="status-banner status-banner-expired">
                    <div className="status-label">
                      <span className="ti ti-clock-x status-icon"></span>
                      <span>PERMIT EXPIRED</span>
                    </div>
                    <span className="badge-pill badge-pill-warning">EXPIRED</span>
                  </div>

                  {/* Pass Type Badge */}
                  <div className={`badge-type ${result.type.includes('OUTPASS') ? 'badge-type-outpass' : 'badge-type-visit'}`} style={{ opacity: 0.6 }}>
                    <span className={`ti ${result.type.includes('OUTPASS') ? 'ti-walk' : 'ti-users'}`}></span>
                    <span>{result.type.includes('OUTPASS') ? 'Outpass' : 'Visit Pass'}</span>
                  </div>

                  {/* Details Section Dimmed */}
                  <div className="details-grid">
                    {result.type.includes('OUTPASS') ? (
                      <>
                        <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value detail-value-dimmed">{result.name}</span></div>
                        <div className="detail-item"><span className="detail-label">Roll ID</span><span className="detail-value detail-value-dimmed">{result.rollId}</span></div>
                        <div className="detail-item"><span className="detail-label">Hostel & Room</span><span className="detail-value detail-value-dimmed">{result.hostel}</span></div>
                        <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value detail-value-dimmed">{result.date}</span></div>
                        <div className="detail-item"><span className="detail-label">Timings</span><span className="detail-value detail-value-dimmed">{result.timings}</span></div>
                        <div className="detail-item"><span className="detail-label">Destination</span><span className="detail-value detail-value-dimmed">{result.destination}</span></div>
                        <div className="detail-item"><span className="detail-label">Purpose</span><span className="detail-value detail-value-dimmed">{result.purpose}</span></div>
                        <div className="detail-item"><span className="detail-label">Approved By</span><span className="detail-value detail-value-dimmed">{result.approvedBy}</span></div>
                      </>
                    ) : (
                      <>
                        <div className="detail-item"><span className="detail-label">Parent Name</span><span className="detail-value detail-value-dimmed">{result.name}</span></div>
                        <div className="detail-item"><span className="detail-label">Student Name</span><span className="detail-value detail-value-dimmed">{result.student || 'Student'}</span></div>
                        <div className="detail-item"><span className="detail-label">Roll ID</span><span className="detail-value detail-value-dimmed">{result.rollId}</span></div>
                        <div className="detail-item"><span className="detail-label">Hostel & Room</span><span className="detail-value detail-value-dimmed">{result.hostel}</span></div>
                        <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value detail-value-dimmed">{result.date}</span></div>
                        <div className="detail-item"><span className="detail-label">Timings</span><span className="detail-value detail-value-dimmed">{result.timings}</span></div>
                        <div className="detail-item"><span className="detail-label">Purpose</span><span className="detail-value detail-value-dimmed">{result.purpose}</span></div>
                        <div className="detail-item"><span className="detail-label">Approved By</span><span className="detail-value detail-value-dimmed">{result.approvedBy}</span></div>
                      </>
                    )}
                  </div>

                  {/* Bottom warning Row */}
                  <div className="result-footer">
                    <div className="footer-verify-text text-warning">
                      <span className="ti ti-alert-triangle footer-icon-expired"></span>
                      <span>This permit is no longer valid</span>
                    </div>
                    <div>
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Legitimacy verification panel (for Active state only) */}
              {result.status === 'ACTIVE' && (
                <div className="ai-panel">
                  <div className="ai-header">
                    <span className="ti ti-robot"></span>
                    <span>AI legitimacy check</span>
                  </div>
                  <div className="ai-body">
                    {aiLoading ? (
                      <div className="italic" style={{ color: 'var(--text-muted)' }}>Running legitimacy check…</div>
                    ) : (
                      <div>
                        {isVerdictAllowed && (
                          <div className="ai-verdict-tag ai-verdict-allowed">Verdict: ALLOWED</div>
                        )}
                        {isVerdictHeld && (
                          <div className="ai-verdict-tag ai-verdict-held">Verdict: HELD FOR VERIFICATION</div>
                        )}
                        <p className="line-height-1.6">{aiText || 'No verification data analyzed.'}</p>
                        <button onClick={() => sendPrompt(result)} className="ai-btn-action">
                          Ask AI security desk ↗
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPass;
