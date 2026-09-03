import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const ManageVisitPasses = () => {
  const [dbVisits, setDbVisits] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // AI Review States
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDbVisits = async () => {
    try {
      const res = await API.get('/admin/visit-passes');
      const mapped = (res.data || []).map(v => ({
        _id: v._id,
        parentName: v.parentId?.name || v.visitorName || 'Parent',
        relation: v.relationship || 'Parent',
        name: v.studentId?.name || 'Student',
        roll: v.studentId?.studentId || 'N/A',
        hostel: v.studentId?.hostel || 'Hostel',
        room: v.studentId?.roomNumber || 'N/A',
        date: new Date(v.visitDate).toLocaleDateString(),
        timings: `${v.arrivalTime} – ${v.departureTime}`,
        purpose: v.purpose,
        visitors: `${v.visitorCount} visitor${v.visitorCount > 1 ? 's' : ''}`,
        visitorCount: v.visitorCount || 1,
        status: v.status
      }));
      setDbVisits(mapped);
    } catch (error) {
      console.error('Error fetching database visits:', error);
      toast.error('Failed to load visit passes from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbVisits();
  }, []);

  const uniqueList = dbVisits;

  // Filter based on status tab and search queries
  const filteredVisits = uniqueList.filter(pass => {
    const matchesTab = activeTab === 'ALL' || pass.status.toUpperCase() === activeTab;
    const matchesSearch = 
      pass.parentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pass.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pass.roll.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate live summary metric numbers
  const totalRequests = Math.round(uniqueList.length);
  const pendingReview = Math.round(uniqueList.filter(p => p.status.toUpperCase() === 'PENDING').length);
  const approvedToday = Math.round(uniqueList.filter(p => p.status.toUpperCase() === 'APPROVED').length);
  const rejectedCount = Math.round(uniqueList.filter(p => p.status.toUpperCase() === 'REJECTED').length);

  // AI Review Call
  useEffect(() => {
    if (selectedPass) {
      fetchAiReview(selectedPass);
    } else {
      setAiText('');
    }
  }, [selectedPass]);

  const fetchAiReview = async (pass) => {
    setAiLoading(true);
    setAiText('');
    try {
      const res = await API.post('/admin/ai-review', {
        passDetails: {
          name: pass.name,
          roll: pass.roll,
          hostel: pass.hostel,
          room: pass.room,
          visitorName: pass.parentName,
          relationship: pass.relation,
          timings: pass.timings,
          purpose: pass.purpose,
          visitorCount: pass.visitorCount,
          status: pass.status
        },
        systemPrompt: "You are a hostel warden AI assistant for a university. Review parent visit pass requests and give a concise 2–3 sentence assessment: check if the purpose is valid, note if visit timings are within allowed hours (9am–6pm), flag if visitor count seems unusual, and recommend Approve or Reject. Be brief and factual."
      });
      setAiText(res.data.response);
    } catch (error) {
      console.error('Error calling Anthropic AI review:', error);
      setAiText('Error loading review: Failed to retrieve Warden review from Claude.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = async (passId, newStatus) => {
    try {
      // Sample data update
      if (String(passId).startsWith('sample-')) {
        const updated = localVisits.map(v => v._id === passId ? { ...v, status: newStatus } : v);
        setLocalVisits(updated);
        if (selectedPass && selectedPass._id === passId) {
          setSelectedPass({ ...selectedPass, status: newStatus });
        }
        toast.success(`Pass status updated to ${newStatus} successfully.`);
        return;
      }

      // Live server database update
      const endpoint = newStatus === 'APPROVED' 
        ? `/admin/visit-passes/${passId}/approve`
        : `/admin/visit-passes/${passId}/reject`;

      const payload = newStatus === 'REJECTED' ? { rejectionReason: 'Rejected by Administrator' } : {};
      await API.put(endpoint, payload);

      // Refresh database
      await fetchDbVisits();

      if (selectedPass && selectedPass._id === passId) {
        setSelectedPass({ ...selectedPass, status: newStatus });
      }

      toast.success(`Pass ${newStatus.toLowerCase()} successfully.`);
    } catch (error) {
      console.error('Error updating visit pass status:', error);
      toast.error('Failed to update status on server');
    }
  };

  const sendPrompt = (pass) => {
    const promptText = `Warden Assistant Chat: Please analyze this parent's hostel visit request in detail: Parent: ${pass.parentName} (${pass.relation}), Child: ${pass.name} (ID: ${pass.roll}), Hostel: ${pass.hostel}, Room: ${pass.room}, Purpose: ${pass.purpose}, Visitors Count: ${pass.visitors}, Visit Date: ${pass.date}, Timings: ${pass.timings}, Status: ${pass.status}`;
    console.log('sendPrompt called:', promptText);
    toast.success(`Prompt sent to AI assistant: "${pass.parentName}'s visit details"`);
  };

  return (
    <div className="relative min-h-[500px] pb-10 text-left font-normal" style={{ background: 'var(--surface-0)', color: 'var(--text-primary)' }}>
      {/* CSS variables & classes style block */}
      <style>{`
        :root {
          --surface-0: #ffffff;
          --surface-1: #f1f5f9;
          --surface-2: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --fill-accent: #3b82f6; /* light blue */
          --fill-accent-hover: #1d4ed8; /* dark blue */
          --text-accent: #2563eb;
          --border-accent: #3b82f6;
          --bg-accent: #eff6ff;
          --bg-warning: #fef3c7;
          --text-warning: #d97706;
          --bg-success: #d1fae5;
          --text-success: #059669;
          --bg-danger: #fee2e2;
          --text-danger: #dc2626;
          --radius: 8px;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --surface-0: #ffffff;
            --surface-1: #f1f5f9;
            --surface-2: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --fill-accent: #3b82f6;
            --fill-accent-hover: #1d4ed8;
            --text-accent: #2563eb;
            --border-accent: #3b82f6;
            --bg-accent: #eff6ff;
            --bg-warning: #fef3c7;
            --text-warning: #d97706;
            --bg-success: #d1fae5;
            --text-success: #059669;
            --bg-danger: #fee2e2;
            --text-danger: #dc2626;
            --radius: 8px;
          }
        }

        .page-title {
          font-size: 20px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .page-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .metric-card {
          background: var(--surface-1);
          border-radius: var(--radius);
          padding: 1rem;
          border: none;
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1;
        }

        .metric-value-warning {
          color: var(--text-warning);
        }

        .metric-value-success {
          color: var(--text-success);
        }

        .metric-value-danger {
          color: var(--text-danger);
        }

        .tab-btn {
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius);
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          border: none;
          text-transform: uppercase;
          cursor: pointer;
        }

        .tab-btn:hover {
          background: var(--surface-1);
        }

        .tab-btn.active {
          background: var(--fill-accent);
          color: #ffffff;
        }

        .tab-btn.active:hover {
          background: var(--fill-accent-hover);
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          background: var(--surface-2);
          border: 0.5px solid var(--border);
          border-radius: var(--radius);
          padding: 8px 12px 8px 32px;
          font-size: 13px;
          color: var(--text-primary);
        }

        .search-input:focus {
          border-color: var(--border-accent);
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .table-container {
          background: var(--surface-2);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1.6fr 1.4fr 1.4fr 1.2fr 1.2fr 0.8fr 0.6fr;
          align-items: center;
          gap: 1rem;
          padding: 12px 16px;
          border-bottom: 0.5px solid var(--border);
          background: var(--surface-2);
          transition: background 0.15s;
        }

        .table-row:hover {
          background: var(--surface-1);
        }

        .table-header {
          background: var(--surface-2);
          border-bottom: 0.5px solid var(--border);
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .text-bold-14 {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .text-muted-12 {
          font-size: 12px;
          color: var(--text-muted);
        }

        .text-secondary-13 {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          line-height: none;
        }

        .badge-pending {
          background: var(--bg-warning);
          color: var(--text-warning);
        }

        .badge-approved {
          background: var(--bg-success);
          color: var(--text-success);
        }

        .badge-rejected {
          background: var(--bg-danger);
          color: var(--text-danger);
        }

        .badge-cancelled {
          background: var(--surface-1);
          color: var(--text-secondary);
        }

        .badge-expired {
          background: var(--surface-1);
          color: var(--text-muted);
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: var(--radius);
          background: var(--surface-2);
          color: var(--text-secondary);
          border: 0.5px solid var(--border);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .action-btn:hover {
          background: var(--surface-1);
          color: var(--text-primary);
        }

        .action-btn-warning {
          color: var(--text-warning);
          border-color: var(--text-warning);
        }

        .action-btn-warning:hover {
          background: var(--bg-warning);
        }

        .faux-modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-card {
          width: 400px;
          background: var(--surface-2);
          border-radius: 12px;
          border: 0.5px solid var(--border);
          padding: 1.5rem;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 16px;
          color: var(--text-muted);
          cursor: pointer;
          border: none;
          background: transparent;
        }

        .modal-close:hover {
          color: var(--text-primary);
        }

        .modal-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .modal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 0.5px solid var(--border);
          font-size: 13px;
        }

        .modal-row:last-of-type {
          border-bottom: none;
        }

        .modal-label {
          color: var(--text-muted);
        }

        .modal-value {
          color: var(--text-primary);
          text-align: right;
        }

        .btn-filled-green {
          background: var(--text-success);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: var(--radius);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .btn-filled-green:hover {
          opacity: 0.9;
        }

        .btn-filled-red {
          background: var(--text-danger);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: var(--radius);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .btn-filled-red:hover {
          opacity: 0.9;
        }

        .ai-panel {
          margin-top: 1.5rem;
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

        .ai-btn-chat {
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
          margin-top: 8px;
        }

        .ai-btn-chat:hover {
          text-decoration: underline;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
      `}</style>

      {/* Header Area */}
      <div className="mb-6">
        <h1 className="page-title">Manage parent visit passes</h1>
        <p className="page-subtitle">Search, audit and manage parent hostel visit permits</p>
      </div>

      {/* Toolbar row: Tabs left, Search input right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search input container */}
        <div className="w-full md:w-72 search-container">
          <span className="ti ti-search search-icon"></span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by parent name, student or roll…"
            className="search-input"
          />
        </div>
      </div>

      {/* Summary Metric Cards row */}
      <div className="metrics-grid">
        {/* Card 1: Total Requests */}
        <div className="metric-card">
          <div className="metric-label">Total Requests</div>
          <div className="metric-value">{totalRequests}</div>
        </div>

        {/* Card 2: Pending Review */}
        <div className="metric-card">
          <div className="metric-label">Pending Review</div>
          <div className="metric-value metric-value-warning">{pendingReview}</div>
        </div>

        {/* Card 3: Approved Today */}
        <div className="metric-card">
          <div className="metric-label">Approved Today</div>
          <div className="metric-value metric-value-success">{approvedToday}</div>
        </div>

        {/* Card 4: Rejected */}
        <div className="metric-card">
          <div className="metric-label">Rejected</div>
          <div className="metric-value metric-value-danger">{rejectedCount}</div>
        </div>
      </div>

      {/* Visit Permits Data Table */}
      <div className="table-container">
        {/* Headers */}
        <div className="table-row table-header">
          <div className="pl-4">Visitor (relationship)</div>
          <div>Student child</div>
          <div>Hostel detail</div>
          <div>Visit date / time</div>
          <div>Purpose</div>
          <div>Status</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Loading visit permits…
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="empty-state">
            <span className="ti ti-users empty-icon"></span>
            <span>No visit passes found</span>
          </div>
        ) : (
          filteredVisits.map(pass => (
            <div key={pass._id} className="table-row">
              {/* Parent Info */}
              <div className="pl-4">
                <div className="text-bold-14">{pass.parentName}</div>
                <div className="text-muted-12">{pass.relation}</div>
              </div>

              {/* Student child Info */}
              <div>
                <div className="text-secondary-13">{pass.name}</div>
                <div className="text-muted-12">ID: {pass.roll}</div>
              </div>

              {/* Hostel details */}
              <div className="text-secondary-13">
                <div>{pass.hostel}</div>
                <div className="text-muted-12">Room: {pass.room}</div>
              </div>

              {/* Visit date and timings */}
              <div className="text-secondary-13 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-12">
                  <span className="ti ti-calendar"></span>
                  <span>{pass.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-12">
                  <span className="ti ti-clock"></span>
                  <span>{pass.timings}</span>
                </div>
              </div>

              {/* Purpose and visitors count */}
              <div className="text-secondary-13">
                <div className="text-bold-14" style={{ fontSize: '13px' }}>{pass.purpose}</div>
                <div className="text-muted-12">{pass.visitors}</div>
              </div>

              {/* Status badge */}
              <div>
                <span className={`badge ${
                  pass.status.toUpperCase() === 'PENDING' ? 'badge-pending' :
                  pass.status.toUpperCase() === 'APPROVED' ? 'badge-approved' :
                  pass.status.toUpperCase() === 'REJECTED' ? 'badge-rejected' :
                  pass.status.toUpperCase() === 'CANCELLED' ? 'badge-cancelled' :
                  'badge-expired'
                }`}>
                  {pass.status}
                </span>
              </div>

              {/* Actions */}
              <div className="text-right pr-4 space-x-1.5 flex justify-end items-center">
                <button
                  onClick={() => setSelectedPass(pass)}
                  className="action-btn"
                  title="View Details"
                >
                  <span className="ti ti-eye"></span>
                </button>

                {pass.status.toUpperCase() === 'PENDING' && (
                  <button
                    onClick={() => setSelectedPass(pass)}
                    className="action-btn action-btn-warning"
                    title="Audit Permit"
                  >
                    <span className="ti ti-edit"></span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Review Panel card wrapper */}
      {selectedPass && (
        <div className="ai-panel">
          <div className="ai-header">
            <span className="ti ti-robot"></span>
            <span>AI visit pass review</span>
          </div>
          <div className="ai-body">
            {aiLoading ? (
              <div className="italic" style={{ color: 'var(--text-muted)' }}>Analyzing visit pass…</div>
            ) : (
              <div>
                <p className="mb-2">{aiText || 'Select a parent visit pass to run safety audits.'}</p>
                <button
                  onClick={() => sendPrompt(selectedPass)}
                  className="ai-btn-chat"
                >
                  Ask AI about this pass ↗
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Faux Viewport Modal Overlay container */}
      {selectedPass && (
        <div className="faux-modal-overlay">
          <div className="modal-card">
            {/* Close Button top-right */}
            <button
              onClick={() => setSelectedPass(null)}
              className="modal-close"
            >
              <span className="ti ti-x"></span>
            </button>

            {/* Title: Parent Name - visit pass */}
            <h2 className="modal-title">{selectedPass.parentName} — visit pass</h2>

            {/* Details table rows */}
            <div className="space-y-0.5">
              <div className="modal-row">
                <span className="modal-label">Parent Name</span>
                <span className="modal-value">{selectedPass.parentName}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Relation</span>
                <span className="modal-value">{selectedPass.relation}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Student Name</span>
                <span className="modal-value">{selectedPass.name}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Roll ID</span>
                <span className="modal-value">{selectedPass.roll}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Hostel</span>
                <span className="modal-value">{selectedPass.hostel}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Room</span>
                <span className="modal-value">{selectedPass.room}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Visit Date</span>
                <span className="modal-value">{selectedPass.date}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Visit Timings</span>
                <span className="modal-value">{selectedPass.timings}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Purpose</span>
                <span className="modal-value">{selectedPass.purpose}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">No. of Visitors</span>
                <span className="modal-value">{selectedPass.visitors}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Status</span>
                <span className="modal-value">
                  <span className={`badge ${
                    selectedPass.status.toUpperCase() === 'PENDING' ? 'badge-pending' :
                    selectedPass.status.toUpperCase() === 'APPROVED' ? 'badge-approved' :
                    selectedPass.status.toUpperCase() === 'REJECTED' ? 'badge-rejected' :
                    selectedPass.status.toUpperCase() === 'CANCELLED' ? 'badge-cancelled' :
                    'badge-expired'
                  }`}>
                    {selectedPass.status}
                  </span>
                </span>
              </div>
            </div>

            {/* If status is PENDING: Approve & Reject buttons */}
            {selectedPass.status.toUpperCase() === 'PENDING' && (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => handleStatusChange(selectedPass._id, 'REJECTED')}
                  className="btn-filled-red"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange(selectedPass._id, 'APPROVED')}
                  className="btn-filled-green"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVisitPasses;
