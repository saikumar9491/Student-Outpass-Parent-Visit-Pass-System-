import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const ManageOutpasses = () => {
  const [dbOutpasses, setDbOutpasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // AI Review States
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDbOutpasses = async () => {
    try {
      const res = await API.get('/admin/outpasses');
      const mapped = (res.data || []).map(o => ({
        _id: o._id,
        name: o.studentId?.name || 'Student',
        roll: o.studentId?.studentId || 'N/A',
        hostel: o.studentId?.hostel || 'Hostel',
        room: o.studentId?.roomNumber || 'N/A',
        date: new Date(o.outingDate).toLocaleDateString(),
        timings: `${new Date(o.outingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()} – ${new Date(o.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}`,
        destination: o.destination,
        purpose: o.purpose,
        status: o.status
      }));
      setDbOutpasses(mapped);
    } catch (error) {
      console.error('Error fetching database outpasses:', error);
      toast.error('Failed to load outpasses from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbOutpasses();
  }, []);

  const uniqueList = dbOutpasses;

  // Filter lists based on tab status and search query
  const filteredOutpasses = uniqueList.filter(pass => {
    const matchesTab = activeTab === 'ALL' || pass.status.toUpperCase() === activeTab;
    const matchesSearch = 
      pass.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pass.roll.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
          destination: pass.destination,
          purpose: pass.purpose,
          date: pass.date,
          timings: pass.timings,
          status: pass.status
        }
      });
      setAiText(res.data.response);
    } catch (error) {
      console.error('Error calling Anthropic review:', error);
      setAiText('Error loading review: Failed to retrieve Warden review from Claude API.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusChange = async (passId, newStatus) => {
    try {
      // If it is a sample pass (contains "sample-" prefix in ID)
      if (String(passId).startsWith('sample-')) {
        const updated = localOutpasses.map(p => p._id === passId ? { ...p, status: newStatus } : p);
        setLocalOutpasses(updated);
        // If selected pass is updated, update its modal state too
        if (selectedPass && selectedPass._id === passId) {
          setSelectedPass({ ...selectedPass, status: newStatus });
        }
        toast.success(`Pass status updated to ${newStatus} successfully.`);
        return;
      }

      // Live Database update
      const endpoint = newStatus === 'APPROVED' 
        ? `/admin/outpasses/${passId}/approve`
        : `/admin/outpasses/${passId}/reject`;

      const payload = newStatus === 'REJECTED' ? { rejectionReason: 'Rejected by Administrator' } : {};
      await API.put(endpoint, payload);

      // Refresh database records
      await fetchDbOutpasses();

      // Update current modal state if active
      if (selectedPass && selectedPass._id === passId) {
        setSelectedPass({ ...selectedPass, status: newStatus });
      }

      toast.success(`Pass ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error changing pass status:', error);
      toast.error('Failed to update status on server');
    }
  };

  const sendPrompt = (pass) => {
    const promptText = `Warden Assistant Chat: Please analyze this student's outpass request in detail: Name: ${pass.name}, Roll: ${pass.roll}, Hostel: ${pass.hostel}, Room: ${pass.room}, Destination: ${pass.destination}, Purpose: ${pass.purpose}, Date: ${pass.date}, Timings: ${pass.timings}, Status: ${pass.status}`;
    console.log('sendPrompt called:', promptText);
    toast.success(`Prompt sent to AI assistant: "${pass.name}'s pass details"`);
  };

  return (
    <div className="relative min-h-[500px] pb-10 text-left font-normal" style={{ background: 'var(--surface-0)', color: 'var(--text-primary)' }}>
      {/* Design System CSS variables & scoped helper style tags */}
      <style>{`
        :root {
          --surface-0: #ffffff;
          --surface-1: #f1f5f9;
          --surface-2: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --fill-accent: #2563eb;
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

        .page-title {
          font-size: 20px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .page-subtitle {
          font-size: 13px;
          color: var(--text-muted);
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
          grid-template-columns: 1.8fr 1.3fr 1.5fr 1.4fr 0.8fr 0.6fr;
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
          background: var(--surface-1);
          border-bottom: 0.5px solid var(--border);
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
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
          width: 380px;
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
          border: 0.5px solid var(--border);
          background: var(--surface-2);
          overflow: hidden;
        }

        .ai-header {
          background: var(--bg-accent);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 0.5px solid var(--border);
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

      {/* Header section */}
      <div className="mb-6">
        <h1 className="page-title">Manage student outpasses</h1>
        <p className="page-subtitle">Search, audit and manage student hostel outing permits</p>
      </div>

      {/* Toolbar section: Filter tabs left, search bar right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Filter Tabs */}
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

        {/* Search Input Box */}
        <div className="w-full md:w-72 search-container">
          <span className="ti ti-search search-icon"></span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or roll…"
            className="search-input"
          />
        </div>
      </div>

      {/* Outpasses List / Table */}
      <div className="table-container">
        {/* Table header row using grid */}
        <div className="table-row table-header">
          <div className="pl-4">Student info</div>
          <div>Hostel detail</div>
          <div>Outing timings</div>
          <div>Destination / purpose</div>
          <div>Status</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Loading outpasses…
          </div>
        ) : filteredOutpasses.length === 0 ? (
          <div className="empty-state">
            <span className="ti ti-inbox empty-icon"></span>
            <span>No outpasses found</span>
          </div>
        ) : (
          filteredOutpasses.map(pass => (
            <div key={pass._id} className="table-row">
              {/* Student info */}
              <div className="pl-4">
                <div className="text-bold-14">{pass.name}</div>
                <div className="text-muted-12">ID: {pass.roll}</div>
              </div>

              {/* Hostel details */}
              <div className="text-secondary-13">
                <div>{pass.hostel}</div>
                <div className="text-muted-12">Room: {pass.room}</div>
              </div>

              {/* Outing timings */}
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

              {/* Destination / Purpose */}
              <div className="text-secondary-13">
                <div className="text-bold-14" style={{ fontSize: '13px' }}>{pass.destination}</div>
                <div className="text-muted-12">{pass.purpose}</div>
              </div>

              {/* Status pill badge */}
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

              {/* Action buttons */}
              <div className="text-right pr-4 space-x-1.5 flex justify-end items-center">
                <button
                  onClick={() => setSelectedPass(pass)}
                  className="action-btn"
                  title="View / Edit"
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

      {/* AI Review Panel (Warden assistant) */}
      {selectedPass && (
        <div className="ai-panel">
          <div className="ai-header">
            <span className="ti ti-robot"></span>
            <span>AI outpass review</span>
          </div>
          <div className="ai-body">
            {aiLoading ? (
              <div className="italic" style={{ color: 'var(--text-muted)' }}>Analyzing outpass…</div>
            ) : (
              <div>
                <p className="mb-2">{aiText || 'Select a student pass to get automated safety audits.'}</p>
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

      {/* Faux Viewport Modal Overlay (Self-contained inside parent frame) */}
      {selectedPass && (
        <div className="faux-modal-overlay">
          <div className="modal-card">
            {/* Close Modal button */}
            <button
              onClick={() => setSelectedPass(null)}
              className="modal-close"
            >
              <span className="ti ti-x"></span>
            </button>

            {/* Title: Student name - outpass */}
            <h2 className="modal-title">{selectedPass.name} — outpass</h2>

            {/* Details Rows */}
            <div className="space-y-0.5">
              <div className="modal-row">
                <span className="modal-label">Roll ID</span>
                <span className="modal-value">{selectedPass.roll}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Hostel</span>
                <span className="modal-value">{selectedPass.hostel}, Room: {selectedPass.room}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Date</span>
                <span className="modal-value">{selectedPass.date}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Timings</span>
                <span className="modal-value">{selectedPass.timings}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Destination</span>
                <span className="modal-value">{selectedPass.destination}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Purpose</span>
                <span className="modal-value">{selectedPass.purpose}</span>
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

            {/* If status is PENDING: show Approve and Reject actions */}
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

export default ManageOutpasses;
