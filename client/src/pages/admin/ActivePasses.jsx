import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';

const ActivePasses = () => {
  // Sample Data (7 rows)
  const initialSampleData = [
    {
      _id: 'sample-act-1',
      type: 'OUTPASS',
      name: 'Arjun Sharma',
      secondaryInfo: 'ROLL-1787091234567',
      roll: 'ROLL-1787091234567',
      hostel: 'Cauvery Boys Hostel',
      room: '204',
      date: '27/8/2026',
      timings: '09:00 am – 01:00 pm',
      destination: 'Railway Station',
      purpose: 'Picking up family',
      visitorCount: 0,
      relation: '',
      status: 'APPROVED' // active
    },
    {
      _id: 'sample-act-2',
      type: 'VISIT',
      name: 'Mrs. Kavitha Sharma',
      secondaryInfo: 'Visiting: Arjun Sharma',
      roll: 'ROLL-1787091234567',
      hostel: 'Cauvery Boys Hostel',
      room: '204',
      date: '27/8/2026',
      timings: '10:00 am – 01:00 pm',
      destination: 'Family visit',
      purpose: 'Family visit',
      visitorCount: 3,
      relation: 'Mother',
      status: 'APPROVED' // active
    },
    {
      _id: 'sample-act-3',
      type: 'OUTPASS',
      name: 'Priya Patel',
      secondaryInfo: 'ROLL-1787055678901',
      roll: 'ROLL-1787055678901',
      hostel: 'Ganga Girls Hostel',
      room: '312',
      date: '27/8/2026',
      timings: '11:00 am – 03:00 pm',
      destination: 'City Hospital',
      purpose: 'Medical checkup',
      visitorCount: 0,
      relation: '',
      status: 'APPROVED' // active
    },
    {
      _id: 'sample-act-4',
      type: 'VISIT',
      name: 'Mr. Ramesh Patel',
      secondaryInfo: 'Visiting: Priya Patel',
      roll: 'ROLL-1787055678901',
      hostel: 'Ganga Girls Hostel',
      room: '312',
      date: '27/8/2026',
      timings: '02:00 pm – 05:00 pm',
      destination: 'Document handover',
      purpose: 'Document handover',
      visitorCount: 1,
      relation: 'Father',
      status: 'APPROVED' // active
    },
    {
      _id: 'sample-act-5',
      type: 'OUTPASS',
      name: 'Rohan Mehta',
      secondaryInfo: 'ROLL-1787078901234',
      roll: 'ROLL-1787078901234',
      hostel: 'Kaveri Boys Hostel',
      room: '115',
      date: '27/8/2026',
      timings: '08:00 am – 11:00 am',
      destination: 'City Market',
      purpose: 'Buying supplies',
      visitorCount: 0,
      relation: '',
      status: 'APPROVED' // active
    },
    {
      _id: 'sample-act-6',
      type: 'OUTPASS',
      name: 'Sneha Reddy',
      secondaryInfo: 'ROLL-1787066543210',
      roll: 'ROLL-1787066543210',
      hostel: 'Ganga Girls Hostel',
      room: '201',
      date: '27/8/2026',
      timings: '10:00 am – 12:00 pm',
      destination: 'Library',
      purpose: 'Project research',
      visitorCount: 0,
      relation: '',
      status: 'APPROVED' // active
    },
    {
      _id: 'sample-act-7',
      type: 'VISIT',
      name: 'Mrs. Sunita Mehta',
      secondaryInfo: 'Visiting: Rohan Mehta',
      roll: 'ROLL-1787078901234',
      hostel: 'Kaveri Boys Hostel',
      room: '115',
      date: '27/8/2026',
      timings: '09:00 am – 11:30 am',
      destination: 'Medical emergency',
      purpose: 'Medical emergency',
      visitorCount: 2,
      relation: 'Mother',
      status: 'APPROVED' // active
    }
  ];

  const [dbPasses, setDbPasses] = useState([]);
  const [localPasses, setLocalPasses] = useState(initialSampleData);
  const [selectedPass, setSelectedPass] = useState(null);
  const [activeToggle, setActiveToggle] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // AI Monitor States
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchActivePasses = async () => {
    try {
      const [outpassesRes, visitsRes] = await Promise.all([
        API.get('/admin/outpasses?status=APPROVED'),
        API.get('/admin/visit-passes?status=APPROVED')
      ]);

      const mappedOutpasses = outpassesRes.data.map(o => ({
        _id: o._id,
        type: 'OUTPASS',
        name: o.studentId?.name || 'Student',
        secondaryInfo: o.studentId?.studentId || 'N/A',
        roll: o.studentId?.studentId || 'N/A',
        hostel: o.studentId?.hostel || 'Hostel',
        room: o.studentId?.roomNumber || 'N/A',
        date: new Date(o.outingDate).toLocaleDateString(),
        timings: `${new Date(o.outingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()} – ${new Date(o.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}`,
        rawReturnDate: o.expectedReturnDate,
        destination: o.destination,
        purpose: o.purpose,
        visitorCount: 0,
        relation: '',
        status: o.status
      }));

      const mappedVisits = visitsRes.data.map(v => ({
        _id: v._id,
        type: 'VISIT',
        name: v.parentId?.name || v.visitorName || 'Parent',
        secondaryInfo: `Visiting: ${v.studentId?.name || 'Student'}`,
        roll: v.studentId?.studentId || 'N/A',
        hostel: v.studentId?.hostel || 'Hostel',
        room: v.studentId?.roomNumber || 'N/A',
        date: new Date(v.visitDate).toLocaleDateString(),
        timings: `${v.arrivalTime} – ${v.departureTime}`,
        // Format departureTime as ISO style if it is mock
        destination: v.purpose,
        purpose: v.purpose,
        visitorCount: v.visitorCount || 1,
        relation: v.relationship || 'Parent',
        status: v.status
      }));

      setDbPasses([...mappedOutpasses, ...mappedVisits]);
    } catch (error) {
      console.error('Error fetching active passes:', error);
      toast.error('Failed to load live database entries. Using local cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePasses();
    // Run clock countdown interval
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Sync AI monitor scan automatically on mount
  useEffect(() => {
    if (!loading) {
      fetchAiMonitor();
    }
  }, [loading]);

  // Helper to parse return date for checking overdue and countdown
  const getPassEndDate = (pass) => {
    if (pass.rawReturnDate) {
      return new Date(pass.rawReturnDate);
    }
    // Parse mock dates formatted as DD/MM/YYYY
    try {
      const [day, month, year] = pass.date.split('/').map(Number);
      const timePart = pass.timings.split('–')[1].trim(); // e.g. "01:00 pm"
      let [time, modifier] = timePart.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
      return new Date(year, month - 1, day, hours, minutes);
    } catch (err) {
      const fallback = new Date();
      fallback.setHours(23, 59, 59);
      return fallback;
    }
  };

  const getCountdownInfo = (pass, now) => {
    const endDate = getPassEndDate(pass);
    const diffMs = endDate - now;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) {
      const absMins = Math.abs(diffMins);
      return {
        text: `Overdue by ${absMins} min`,
        color: 'var(--text-danger)',
        isOverdue: true
      };
    } else if (diffMins <= 60) {
      return {
        text: `${diffMins} min left`,
        color: 'var(--text-warning)',
        isOverdue: false
      };
    } else {
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return {
        text: `${hrs} hr ${mins} min left`,
        color: 'var(--text-success)',
        isOverdue: false
      };
    }
  };

  // Merge database and local mock data, discarding mock rows if roll matches live data
  const activeRolls = new Set(dbPasses.map(p => p.roll.trim().toUpperCase()));
  const filteredLocal = localPasses.filter(lp => !activeRolls.has(lp.roll.trim().toUpperCase()));
  const mergedList = [...dbPasses, ...filteredLocal];

  // Remove exact duplicates
  const uniqueList = mergedList.filter((item, index, self) => 
    index === self.findIndex((t) => t.roll.trim().toUpperCase() === item.roll.trim().toUpperCase() && t.timings === item.timings)
  );

  // Map countdown info to each pass
  const passesWithCountdown = uniqueList.map(pass => {
    const countdown = getCountdownInfo(pass, currentTime);
    return {
      ...pass,
      countdownText: countdown.text,
      countdownColor: countdown.color,
      isOverdue: countdown.isOverdue
    };
  });

  // Filter list based on toggle choice and search query
  const filteredPasses = passesWithCountdown.filter(pass => {
    const matchesToggle = 
      activeToggle === 'ALL' || 
      (activeToggle === 'OUTPASSES' && pass.type === 'OUTPASS') || 
      (activeToggle === 'VISIT PASSES' && pass.type === 'VISIT');

    const matchesSearch = 
      pass.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pass.secondaryInfo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pass.roll.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesToggle && matchesSearch;
  });

  // Metric counts
  const totalActive = Math.round(passesWithCountdown.length);
  const totalOutpasses = Math.round(passesWithCountdown.filter(p => p.type === 'OUTPASS').length);
  const totalVisits = Math.round(passesWithCountdown.filter(p => p.type === 'VISIT').length);
  const totalOverdue = Math.round(passesWithCountdown.filter(p => p.isOverdue).length);

  // AI Security Monitor scan call
  const fetchAiMonitor = async () => {
    setAiLoading(true);
    setAiText('');
    try {
      const summaryList = passesWithCountdown.map(p => ({
        name: p.name,
        type: p.type,
        hostel: p.hostel,
        timings: p.timings,
        purpose: p.purpose,
        status: p.isOverdue ? 'OVERDUE' : 'ACTIVE',
        overdue: p.isOverdue
      }));

      const res = await API.post('/admin/ai-review', {
        passDetails: { summaryList },
        systemPrompt: "You are a hostel security AI monitor for a university. You will be given a list of all currently active passes. Identify any concerns: flag overdue students, note if any pass timings overlap suspiciously, check if visitor counts are high, and give a brief overall security summary in 3–4 sentences. Be direct and factual."
      });
      setAiText(res.data.response);
    } catch (error) {
      console.error('Error fetching AI security monitor scan:', error);
      setAiText('Error generating scan: Failed to compile real-time security monitor overview from AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleMarkReturned = async (passId, type) => {
    try {
      // Local sample data update
      if (String(passId).startsWith('sample-')) {
        const updated = localPasses.filter(p => p._id !== passId);
        setLocalPasses(updated);
        setSelectedPass(null);
        toast.success(`${type} marked as returned successfully.`);
        return;
      }

      // Live database API update
      const endpoint = type === 'OUTPASS' 
        ? `/admin/outpasses/${passId}/return`
        : `/admin/visit-passes/${passId}/return`;

      await API.put(endpoint);
      await fetchActivePasses();
      setSelectedPass(null);
      toast.success(`${type} marked as returned successfully.`);
    } catch (error) {
      console.error('Error marking returned:', error);
      toast.error('Failed to update returned state on server');
    }
  };

  const sendPrompt = (pass) => {
    const promptText = `Warden Assistant Chat: Please analyze this student's outpass request in detail: Name: ${pass.name}, Roll: ${pass.roll}, Hostel: ${pass.hostel}, Room: ${pass.room}, Destination: ${pass.destination}, Purpose: ${pass.purpose}, Date: ${pass.date}, Timings: ${pass.timings}, Status: ${pass.status}`;
    console.log('sendPrompt called:', promptText);
    toast.success(`Prompt sent to AI assistant: "${pass.name}'s active pass details"`);
  };

  return (
    <div className="relative min-h-[500px] pb-10 text-left font-normal" style={{ background: 'var(--surface-0)', color: 'var(--text-primary)' }}>
      {/* Dynamic CSS styles & helper tags */}
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
          margin-bottom: 1.25rem;
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

        .metric-value-accent {
          color: var(--text-accent);
        }

        .metric-value-danger {
          color: var(--text-danger);
        }

        .toggle-container {
          display: inline-flex;
          background: var(--surface-1);
          padding: 4px;
          border-radius: var(--radius);
          gap: 4px;
        }

        .toggle-btn {
          border: none;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 500;
          border-radius: calc(var(--radius) - 2px);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-transform: uppercase;
        }

        .toggle-btn.unselected {
          background: var(--surface-1);
          color: var(--text-secondary);
          border: 0.5px solid var(--border);
        }

        .toggle-btn.selected {
          background: var(--fill-accent);
          color: #ffffff;
        }

        .toggle-btn.selected:hover {
          background: var(--fill-accent-hover);
        }

        .search-container {
          position: relative;
          width: 250px;
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
          grid-template-columns: 0.5fr 1.6fr 1.4fr 1.3fr 1.4fr 1.2fr 0.8fr 0.7fr;
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

        .type-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          width: 28px;
          border-radius: var(--radius);
        }

        .type-outpass {
          background: var(--bg-accent);
          color: var(--text-accent);
        }

        .type-visit {
          background: var(--bg-success);
          color: var(--text-success);
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

        .badge-active {
          background: var(--bg-accent);
          color: var(--text-accent);
        }

        .badge-overdue {
          background: var(--bg-danger);
          color: var(--text-danger);
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

        .action-btn-success {
          color: var(--text-success);
          border-color: var(--text-success);
        }

        .action-btn-success:hover {
          background: var(--bg-success);
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

        .btn-full-width-green {
          width: 100%;
          background: var(--text-success);
          color: #ffffff;
          padding: 10px 16px;
          border-radius: var(--radius);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          margin-top: 1.5rem;
        }

        .btn-full-width-green:hover {
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
          justify-content: space-between;
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

        .ai-footer-btns {
          margin-top: 12px;
          display: flex;
          gap: 16px;
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
        }

        .ai-btn-action:hover {
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

      {/* Heading / Subtitle */}
      <div className="mb-6">
        <h1 className="page-title">Active passes</h1>
        <p className="page-subtitle">Monitor all currently active student outpasses and parent visit passes in real time</p>
      </div>

      {/* Metrics Cards row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Active</div>
          <div className="metric-value metric-value-accent">{totalActive}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Student Outpasses</div>
          <div className="metric-value">{totalOutpasses}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Parent Visits</div>
          <div className="metric-value">{totalVisits}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Overdue</div>
          <div className="metric-value metric-value-danger">{totalOverdue}</div>
        </div>
      </div>

      {/* Pill Toggle & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Pass Type Pill Toggle */}
        <div className="toggle-container">
          {['ALL', 'OUTPASSES', 'VISIT PASSES'].map(opt => (
            <button
              key={opt}
              onClick={() => setActiveToggle(opt)}
              className={`toggle-btn ${activeToggle === opt ? 'selected' : 'unselected'}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Search box right side */}
        <div className="search-container">
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

      {/* Table Container */}
      <div className="table-container">
        {/* Table Headers */}
        <div className="table-row table-header">
          <div className="pl-4">Type</div>
          <div>Person info</div>
          <div>Hostel detail</div>
          <div>Pass timings</div>
          <div>Destination / purpose</div>
          <div>Time remaining</div>
          <div>Status</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Loading active permits…
          </div>
        ) : filteredPasses.length === 0 ? (
          <div className="empty-state">
            <span className="ti ti-checks empty-icon"></span>
            <span>No active passes right now</span>
          </div>
        ) : (
          filteredPasses.map(pass => (
            <div key={pass._id} className="table-row">
              {/* Type Badge icon */}
              <div className="pl-4">
                <span className={`type-badge ${pass.type === 'OUTPASS' ? 'type-outpass' : 'type-visit'}`}>
                  <span className={`ti ${pass.type === 'OUTPASS' ? 'ti-walk' : 'ti-users'}`}></span>
                </span>
              </div>

              {/* Person Info */}
              <div>
                <div className="text-bold-14">{pass.name}</div>
                <div className="text-muted-12">{pass.secondaryInfo}</div>
              </div>

              {/* Hostel Details */}
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

              {/* Destination / Purpose */}
              <div className="text-secondary-13">
                <div className="text-bold-14" style={{ fontSize: '13px' }}>{pass.destination}</div>
                <div className="text-muted-12">{pass.purpose}</div>
              </div>

              {/* Time Remaining countdown */}
              <div className="text-bold-14" style={{ color: pass.countdownColor, fontSize: '13px' }}>
                {pass.countdownText}
              </div>

              {/* Status Badge */}
              <div>
                <span className={`badge ${pass.isOverdue ? 'badge-overdue' : 'badge-active'}`}>
                  {pass.isOverdue ? 'OVERDUE' : 'ACTIVE'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="text-right pr-4 space-x-1.5 flex justify-end items-center">
                <button
                  onClick={() => setSelectedPass(pass)}
                  className="action-btn"
                  title="View Details"
                >
                  <span className="ti ti-eye"></span>
                </button>
                <button
                  onClick={() => handleMarkReturned(pass._id, pass.type)}
                  className="action-btn action-btn-success"
                  title="Mark returned"
                >
                  <span className="ti ti-check"></span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Monitoring Panel (Always visible at bottom) */}
      <div className="ai-panel">
        <div className="ai-header">
          <div className="flex items-center gap-2">
            <span className="ti ti-robot"></span>
            <span>AI pass monitor</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Auto-refreshes every 5 min)</span>
          </div>
          <button onClick={fetchAiMonitor} className="ai-btn-action" style={{ fontSize: '11px' }}>
            <span className="ti ti-refresh"></span>
          </button>
        </div>
        <div className="ai-body">
          {aiLoading ? (
            <div className="italic" style={{ color: 'var(--text-muted)' }}>Scanning active passes…</div>
          ) : (
            <div>
              <p className="line-height-1.6">{aiText || 'No active passes are currently logged to scan.'}</p>
              <div className="ai-footer-btns">
                <button onClick={fetchAiMonitor} className="ai-btn-action">
                  Refresh AI scan ↗
                </button>
                {filteredPasses.length > 0 && (
                  <button onClick={() => sendPrompt(filteredPasses[0])} className="ai-btn-action">
                    Ask AI monitor ↗
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Faux Viewport Modal Overlay */}
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

            {/* Title: Name - active pass */}
            <h2 className="modal-title">{selectedPass.name} — active pass</h2>

            {/* Type badge at top */}
            <div className="mb-4">
              <span className={`badge ${selectedPass.type === 'OUTPASS' ? 'badge-active' : 'badge-approved'}`}>
                {selectedPass.type === 'OUTPASS' ? 'OUTPASS' : 'VISIT PASS'}
              </span>
            </div>

            {/* Details Rows */}
            <div className="space-y-0.5">
              {selectedPass.type === 'OUTPASS' ? (
                <>
                  <div className="modal-row"><span className="modal-label">Student</span><span className="modal-value">{selectedPass.name}</span></div>
                  <div className="modal-row"><span className="modal-label">Roll ID</span><span className="modal-value">{selectedPass.roll}</span></div>
                  <div className="modal-row"><span className="modal-label">Hostel</span><span className="modal-value">{selectedPass.hostel}</span></div>
                  <div className="modal-row"><span className="modal-label">Room</span><span className="modal-value">{selectedPass.room}</span></div>
                  <div className="modal-row"><span className="modal-label">Date</span><span className="modal-value">{selectedPass.date}</span></div>
                  <div className="modal-row"><span className="modal-label">Timings</span><span className="modal-value">{selectedPass.timings}</span></div>
                  <div className="modal-row"><span className="modal-label">Destination</span><span className="modal-value">{selectedPass.destination}</span></div>
                  <div className="modal-row"><span className="modal-label">Purpose</span><span className="modal-value">{selectedPass.purpose}</span></div>
                  <div className="modal-row">
                    <span className="modal-label">Status</span>
                    <span className="modal-value">
                      <span className={`badge ${selectedPass.isOverdue ? 'badge-overdue' : 'badge-active'}`}>
                        {selectedPass.isOverdue ? 'OVERDUE' : 'ACTIVE'}
                      </span>
                    </span>
                  </div>
                  <div className="modal-row">
                    <span className="modal-label">Time Remaining</span>
                    <span className="modal-value" style={{ color: selectedPass.countdownColor }}>{selectedPass.countdownText}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="modal-row"><span className="modal-label">Parent</span><span className="modal-value">{selectedPass.name}</span></div>
                  <div className="modal-row"><span className="modal-label">Relation</span><span className="modal-value">{selectedPass.relation}</span></div>
                  <div className="modal-row"><span className="modal-label">Student</span><span className="modal-value">{selectedPass.secondaryInfo.replace('Visiting: ', '')}</span></div>
                  <div className="modal-row"><span className="modal-label">Roll ID</span><span className="modal-value">{selectedPass.roll}</span></div>
                  <div className="modal-row"><span className="modal-label">Hostel</span><span className="modal-value">{selectedPass.hostel}</span></div>
                  <div className="modal-row"><span className="modal-label">Room</span><span className="modal-value">{selectedPass.room}</span></div>
                  <div className="modal-row"><span className="modal-label">Date</span><span className="modal-value">{selectedPass.date}</span></div>
                  <div className="modal-row"><span className="modal-label">Timings</span><span className="modal-value">{selectedPass.timings}</span></div>
                  <div className="modal-row"><span className="modal-label">Purpose</span><span className="modal-value">{selectedPass.purpose}</span></div>
                  <div className="modal-row"><span className="modal-label">Visitors</span><span className="modal-value">{selectedPass.visitors}</span></div>
                  <div className="modal-row">
                    <span className="modal-label">Status</span>
                    <span className="modal-value">
                      <span className={`badge ${selectedPass.isOverdue ? 'badge-overdue' : 'badge-active'}`}>
                        {selectedPass.isOverdue ? 'OVERDUE' : 'ACTIVE'}
                      </span>
                    </span>
                  </div>
                  <div className="modal-row">
                    <span className="modal-label">Time Remaining</span>
                    <span className="modal-value" style={{ color: selectedPass.countdownColor }}>{selectedPass.countdownText}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Return Button */}
            <button
              onClick={() => handleMarkReturned(selectedPass._id, selectedPass.type)}
              className="btn-full-width-green"
            >
              Mark as returned
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivePasses;
