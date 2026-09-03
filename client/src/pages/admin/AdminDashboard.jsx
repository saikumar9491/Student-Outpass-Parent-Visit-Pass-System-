import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../../services/api';
import { 
  Users, FileText, ClipboardList, CheckCircle, AlertCircle, 
  Search, Scan, Megaphone, Eye, Trash2, Calendar, ArrowRight, Download, Shield 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import HostelBlocks from './HostelBlocks';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [pendingOutpasses, setPendingOutpasses] = useState([]);
  const [pendingVisitPasses, setPendingVisitPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualPassId, setManualPassId] = useState('');
  const [renderError, setRenderError] = useState(null);

  // Redirect to /admin/hostel-blocks or /admin/users-roles if navigated via query param
  useEffect(() => {
    if (location.search.includes('tab=hostel-blocks')) {
      navigate('/admin/hostel-blocks', { replace: true });
    } else if (location.search.includes('tab=users-roles')) {
      navigate('/admin/users-roles', { replace: true });
    }
  }, [location, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, outpassesRes, visitsRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/outpasses?status=PENDING'),
        API.get('/admin/visit-passes?status=PENDING')
      ]);
      setStats(statsRes.data);
      setPendingOutpasses(outpassesRes.data);
      setPendingVisitPasses(visitsRes.data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard statistics');
      setRenderError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerifyManual = (e) => {
    e.preventDefault();
    if (!manualPassId) return;
    navigate(`/verify-pass?id=${manualPassId.trim()}`);
  };

  const handleDelete = async (passId, type) => {
    if (!window.confirm(`Are you sure you want to reject this pending ${type} request?`)) return;
    try {
      const endpoint = type === 'Outpass' 
        ? `/admin/outpasses/${passId}/reject` 
        : `/admin/visit-passes/${passId}/reject`;
      
      await API.put(endpoint, { rejectionReason: 'Cancelled by Administrator' });
      toast.success(`${type} request rejected successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  if (renderError) {
    return (
      <div className="p-8 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 space-y-4 text-left">
        <h2 className="text-lg font-bold">Dashboard Diagnostic Alert</h2>
        <p className="text-xs">An error occurred while loading the dashboard stats. See technical details below:</p>
        <pre className="text-xs bg-red-100 p-4 rounded-xl overflow-auto max-w-full font-mono">
          {renderError.stack || renderError.message || String(renderError)}
        </pre>
        <button 
          onClick={() => { setRenderError(null); setLoading(true); fetchDashboardData(); }}
          className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-750 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) return <Loading size="lg" />;

  // Real Database Metrics from API
  let studentCount = 0;
  let parentCount = 0;
  let activePasses = 0;
  let outpassPending = 0;
  let outpassApproved = 0;
  let outpassRejected = 0;
  let outpassTotal = 0;
  let visitPending = 0;
  let visitApproved = 0;
  let visitRejected = 0;
  let visitTotal = 0;
  let totalPending = 0;
  let totalApproved = 0;
  let totalRejected = 0;
  let totalRequestsCount = 0;
  let pendingPercent = 0;
  let approvedPercent = 0;
  let rejectedPercent = 0;
  let dailyPath = "M 5,70 L 40,30 L 80,55 L 120,40 L 160,50 L 195,38";
  let monthlyPath = "M 5,85 L 40,65 L 80,72 L 120,60 L 160,78 L 195,68";
  let dailyData = [];
  let monthlyData = [];
  let blockA = 12;
  let blockB = 9;
  let blockC = 7;
  let blockD = 4;
  const recentRequests = [];

  try {
    studentCount = stats?.metrics?.totalStudents || 0;
    parentCount = stats?.metrics?.totalParents || 0;
    activePasses = stats?.metrics?.activePasses || 0;

    // Outpass metrics split
    outpassPending = stats?.metrics?.outpasses?.pending || 0;
    outpassApproved = stats?.metrics?.outpasses?.approved || 0;
    outpassRejected = stats?.metrics?.outpasses?.rejected || 0;
    outpassTotal = outpassPending + outpassApproved + outpassRejected;

    // Visit pass metrics split
    visitPending = stats?.metrics?.visitPasses?.pending || 0;
    visitApproved = stats?.metrics?.visitPasses?.approved || 0;
    visitRejected = stats?.metrics?.visitPasses?.rejected || 0;
    visitTotal = visitPending + visitApproved + visitRejected;

    // Donut chart status mapping (Pending vs Approved vs Rejected)
    totalPending = outpassPending + visitPending;
    totalApproved = outpassApproved + visitApproved;
    totalRejected = outpassRejected + visitRejected;
    totalRequestsCount = totalPending + totalApproved + totalRejected;

    pendingPercent = totalRequestsCount > 0 ? Math.round((totalPending / totalRequestsCount) * 100) : 0;
    approvedPercent = totalRequestsCount > 0 ? Math.round((totalApproved / totalRequestsCount) * 100) : 0;
    rejectedPercent = totalRequestsCount > 0 ? Math.round((totalRejected / totalRequestsCount) * 100) : 0;

    // Real-time line graph paths mapping
    dailyData = Array.isArray(stats?.charts?.dailyOutpasses) ? stats.charts.dailyOutpasses : [];
    const maxDaily = Math.max(...dailyData.map(d => d.requests || 0), 1);
    if (dailyData.length > 0) {
      dailyPath = dailyData.map((d, idx) => {
        const reqs = d.requests || 0;
        const x = 5 + idx * 31.6;
        const y = 80 - (reqs / maxDaily) * 50;
        return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ');
    }

    monthlyData = Array.isArray(stats?.charts?.monthlyVisits) ? stats.charts.monthlyVisits : [];
    const maxMonthly = Math.max(...monthlyData.map(m => m.requests || 0), 1);
    if (monthlyData.length > 0) {
      monthlyPath = monthlyData.map((m, idx) => {
        const reqs = m.requests || 0;
        const x = 5 + idx * 38;
        const y = 85 - (reqs / maxMonthly) * 50;
        return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
      }).join(' ');
    }

    // Group real outpasses by hostel block
    const blockCounts = { 'Block A': 0, 'Block B': 0, 'Block C': 0, 'Block D': 0 };
    let hasBlockData = false;
    if (Array.isArray(pendingOutpasses)) {
      pendingOutpasses.forEach(o => {
        if (!o) return;
        const block = o.studentId?.hostel || '';
        hasBlockData = true;
        if (block.toUpperCase().includes('A')) blockCounts['Block A']++;
        else if (block.toUpperCase().includes('B')) blockCounts['Block B']++;
        else if (block.toUpperCase().includes('C')) blockCounts['Block C']++;
        else if (block.toUpperCase().includes('D')) blockCounts['Block D']++;
      });
    }

    blockA = hasBlockData ? blockCounts['Block A'] : 12;
    blockB = hasBlockData ? blockCounts['Block B'] : 9;
    blockC = hasBlockData ? blockCounts['Block C'] : 7;
    blockD = hasBlockData ? blockCounts['Block D'] : 4;

    const outpassItems = Array.isArray(pendingOutpasses) ? pendingOutpasses.map(o => {
      if (!o) return null;
      const passId = o.passId || (o._id && typeof o._id === 'string' ? `OUT-${o._id.slice(-4).toUpperCase()}` : 'OUT-XXXX');
      const outingDateStr = o.outingDate ? new Date(o.outingDate).toLocaleDateString() : 'N/A';
      return {
        _id: o._id || Math.random().toString(),
        passId,
        type: 'Outpass',
        name: o.studentId?.name || 'Student',
        roll: o.studentId?.studentId || 'N/A',
        details: o.destination || 'N/A',
        date: outingDateStr,
        status: o.status || 'PENDING',
        raw: o
      };
    }).filter(Boolean) : [];

    const visitItems = Array.isArray(pendingVisitPasses) ? pendingVisitPasses.map(v => {
      if (!v) return null;
      const passId = v.passId || (v._id && typeof v._id === 'string' ? `VIS-${v._id.slice(-4).toUpperCase()}` : 'VIS-XXXX');
      const visitDateStr = v.visitDate ? new Date(v.visitDate).toLocaleDateString() : 'N/A';
      return {
        _id: v._id || Math.random().toString(),
        passId,
        type: 'Visit Pass',
        name: v.visitorName || 'Visitor',
        roll: `Father of ${v.studentId?.name || 'N/A'}`,
        details: `Visit on ${visitDateStr}`,
        date: visitDateStr,
        status: v.status || 'PENDING',
        raw: v
      };
    }).filter(Boolean) : [];

    recentRequests.push(...outpassItems, ...visitItems);
    recentRequests.sort((a, b) => {
      const dateA = a.raw?.createdAt ? new Date(a.raw.createdAt).getTime() : 0;
      const dateB = b.raw?.createdAt ? new Date(b.raw.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    if (recentRequests.length > 5) {
      recentRequests.splice(5);
    }
  } catch (err) {
    console.error('Error in AdminDashboard calculations:', err);
    if (!renderError) {
      setRenderError(err);
    }
  }

  return (
    <div className="space-y-6 text-left">
      {/* Welcome / Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-display">Welcome back, Admin! 👋</h1>
          <p className="text-slate-500 text-xs font-sans">Here's what's happening in your system today.</p>
        </div>
        
        {/* Date Selector */}
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</span>
        </div>
      </div>

      {/* Metrics Row (6 columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[105px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Students</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-650 flex items-center justify-center"><Users className="h-4 w-4" /></div>
          </div>
          <div className="mt-2.5">
            <h4 className="text-lg font-bold text-slate-805 leading-none">{studentCount}</h4>
            <span className="text-[8px] text-emerald-500 font-bold block mt-1.5">Enrolled Students</span>
          </div>
        </div>

        {/* Total Parents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[105px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Parents</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Users className="h-4 w-4" /></div>
          </div>
          <div className="mt-2.5">
            <h4 className="text-lg font-bold text-slate-805 leading-none">{parentCount}</h4>
            <span className="text-[8px] text-emerald-500 font-bold block mt-1.5">Registered Parents</span>
          </div>
        </div>

        {/* Outpass Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[105px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Outpass Requests</span>
            <div className="h-7 w-7 rounded-lg bg-yellow-500/10 text-yellow-550 flex items-center justify-center"><FileText className="h-4 w-4" /></div>
          </div>
          <div className="mt-2.5">
            <h4 className="text-lg font-bold text-slate-805 leading-none">{outpassTotal}</h4>
            <div className="flex gap-1 text-[7px] font-bold mt-1 text-slate-450 uppercase leading-none">
              <span className="text-yellow-600 font-mono">{outpassPending} P</span>
              <span className="text-emerald-555 font-mono">{outpassApproved} A</span>
              <span className="text-red-500 font-mono">{outpassRejected} R</span>
            </div>
          </div>
        </div>

        {/* Visit Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[105px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Visit Requests</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center"><ClipboardList className="h-4 w-4" /></div>
          </div>
          <div className="mt-2.5">
            <h4 className="text-lg font-bold text-slate-805 leading-none">{visitTotal}</h4>
            <div className="flex gap-1 text-[7px] font-bold mt-1 text-slate-450 uppercase leading-none">
              <span className="text-yellow-600 font-mono">{visitPending} P</span>
              <span className="text-emerald-555 font-mono">{visitApproved} A</span>
              <span className="text-red-500 font-mono">{visitRejected} R</span>
            </div>
          </div>
        </div>

        {/* Active Passes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[105px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Passes</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle className="h-4 w-4" /></div>
          </div>
          <div className="mt-2.5">
            <h4 className="text-lg font-bold text-slate-850 leading-none">{activePasses}</h4>
            <span className="text-[8px] text-emerald-500 font-bold block mt-1.5">Active Passes Today</span>
          </div>
        </div>

        {/* Expired Passes */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[105px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-red-700 font-bold uppercase tracking-wider">Expired Passes</span>
            <div className="h-7 w-7 rounded-lg bg-red-500/15 text-red-600 flex items-center justify-center"><AlertCircle className="h-4 w-4" /></div>
          </div>
          <div className="mt-2">
            <h4 className="text-lg font-bold text-red-755 leading-none">{outpassRejected + visitRejected}</h4>
            <Link to="/admin/outpasses" className="text-[7.5px] text-red-500 font-extrabold flex items-center gap-0.5 mt-1 hover:underline">
              View & Manage <ArrowRight className="h-2 w-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2 Analytics Widgets Grid (Overview, Status, Block bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Line Chart graph (span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-4">
            <h3 className="text-xs font-bold text-slate-800 font-display">Requests Overview</h3>
            <select className="bg-slate-50 border border-slate-200 text-[10px] text-slate-650 rounded-lg px-2 py-1 font-bold cursor-pointer">
              <option>This Week</option>
            </select>
          </div>
          {/* SVG Line Graph */}
          <div className="h-36 relative px-1">
            <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="200" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="200" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
              
              {/* Outpass requests line (purple) */}
              <path d={dailyPath} fill="none" stroke="#4d3efb" strokeWidth="1.5" strokeLinecap="round" />
              {dailyData.length > 0 && <circle cx="195" cy="38" r="2" fill="#4d3efb" />}

              {/* Visit requests line (blue) */}
              <path d={monthlyPath} fill="none" stroke="#1070ff" strokeWidth="1.5" strokeLinecap="round" />
              {monthlyData.length > 0 && <circle cx="195" cy="68" r="2" fill="#1070ff" />}
            </svg>
          </div>
          <div className="w-full flex justify-between text-[8px] font-extrabold text-slate-400 pt-2 border-t border-slate-200/60 font-sans uppercase mt-2">
            <span>1 May</span>
            <span>3 May</span>
            <span>5 May</span>
            <span>7 May</span>
            <span>9 May</span>
            <span>10 May</span>
          </div>
          {/* Legend */}
          <div className="flex gap-4 text-[9px] font-bold text-slate-500 mt-3 justify-center">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#4d3efb]"></span> Outpass Requests</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1070ff]"></span> Visit Pass Requests</span>
          </div>
        </div>

        {/* Donut Chart graph (span 3) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-center">
          <div className="border-b border-slate-100 pb-2.5 mb-2.5">
            <h3 className="text-xs font-bold text-slate-800 font-display">Requests Status</h3>
          </div>
          {/* Donut SVG */}
          <div className="h-28 w-28 mx-auto relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
              {/* Approved segment */}
              <circle cx="56" cy="56" r="40" stroke="#10b981" strokeWidth="10" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * approvedPercent) / 100} strokeLinecap="round" />
              {/* Pending segment */}
              <circle cx="56" cy="56" r="40" stroke="#f59e0b" strokeWidth="10" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * pendingPercent) / 100} strokeLinecap="round" className="origin-center" style={{ transform: `rotate(${approvedPercent * 3.6}deg)` }} />
              {/* Rejected segment */}
              <circle cx="56" cy="56" r="40" stroke="#ef4444" strokeWidth="10" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * rejectedPercent) / 100} strokeLinecap="round" className="origin-center" style={{ transform: `rotate(${(approvedPercent + pendingPercent) * 3.6}deg)` }} />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-extrabold text-slate-850 leading-none">{totalRequestsCount}</span>
              <span className="text-[7.5px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-1 text-[9px] font-bold text-slate-655 w-full mt-3">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span> Pending</span> <span>{totalPending} ({pendingPercent}%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Approved</span> <span>{totalApproved} ({approvedPercent}%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Rejected</span> <span>{totalRejected} ({rejectedPercent}%)</span></div>
          </div>
        </div>

        {/* Progress Bars blocks (span 4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2.5 mb-3">
            <h3 className="text-xs font-bold text-slate-800 font-display">Top Hostel Blocks (Outpass)</h3>
          </div>
          <div className="space-y-4">
            {[
              { block: 'Block A', count: blockA, max: Math.max(blockA, 15), color: 'bg-purple-650' },
              { block: 'Block B', count: blockB, max: Math.max(blockB, 15), color: 'bg-blue-600' },
              { block: 'Block C', count: blockC, max: Math.max(blockC, 15), color: 'bg-emerald-500' },
              { block: 'Block D', count: blockD, max: Math.max(blockD, 15), color: 'bg-yellow-550' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-805 leading-none">
                  <span>{item.block}</span>
                  <span className="font-mono font-extrabold">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / item.max) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 Recent Requests table + Right Side Column pass verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests Table (70%) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 font-display">Recent Requests</h3>
            <button onClick={() => navigate('/admin/outpasses')} className="text-[10px] bg-slate-50 border border-slate-200 text-blue-605 font-bold px-3 py-1 rounded-xl shadow-sm hover:bg-slate-100 transition-colors cursor-pointer">
              View All
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentRequests.length === 0 ? (
              <div className="py-24 text-center text-xs text-slate-500">No recent pending permits.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] text-slate-500 font-bold uppercase border-b border-slate-200">
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Student / Parent</th>
                    <th className="px-4 py-2.5">Details</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-xs">
                  {recentRequests.map(req => (
                    <tr key={req._id} className="hover:bg-slate-50/40 text-slate-650 transition-colors">
                      <td className="px-4 py-3 font-bold font-mono text-[10px] text-slate-800">{req.passId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                          req.type === 'Outpass' 
                            ? 'bg-purple-50 text-purple-650 border border-purple-100' 
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 block text-left">{req.name}</span>
                        <span className="text-[9px] text-slate-500 block font-mono text-left">{req.roll}</span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[120px]">{req.details}</td>
                      <td className="px-4 py-3 text-[10px]">{req.date}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <Link 
                            to={req.type === 'Outpass' ? `/student/outpass/${req._id}` : `/parent/history`}
                            className="p-1 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(req._id, req.type)}
                            className="p-1 text-slate-550 hover:text-red-500 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Branding Info */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
              © {new Date().getFullYear()} Rajiv Gandhi University of Technology Hostel Pass System. All rights reserved.
            </span>
          </div>
        </div>

        {/* Right Columns (Scans & Announcements) */}
        <div className="space-y-6">
          {/* Pass Verification Widget */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-805 font-display flex items-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-blue-600" /> Pass Verification
            </h3>
            <p className="text-[9px] text-slate-500 font-sans leading-normal">Verify any pass validity by scanning the QR code on the student outpass or parent visit pass.</p>
            
            <button 
              onClick={() => navigate('/verify-pass')}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Scan className="h-4.5 w-4.5" /> Scan QR Code
            </button>

            <form onSubmit={handleVerifyManual} className="border-t border-slate-100 pt-4 space-y-2">
              <label className="text-[8.5px] font-bold text-slate-500 uppercase block mb-1">Enter Pass ID manually</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={manualPassId}
                  onChange={(e) => setManualPassId(e.target.value)}
                  placeholder="e.g. OUT-A1F9"
                  className="flex-1 bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl py-1.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 rounded-xl shadow cursor-pointer transition-colors"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>

          {/* System Announcements */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5">
                <Megaphone className="h-4.5 w-4.5 text-blue-600" /> System Announcements
              </h3>
              <span className="text-[9px] text-blue-600 font-bold cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-4 text-left">
              {[
                { title: 'College Annual Day on 15th May 2024', time: '2 hours ago' },
                { title: 'Hostel maintenance on 18th May', time: '5 hours ago' },
                { title: 'New mess timings from next week', time: '1 day ago' },
                { title: 'Library will remain closed on Sunday', time: '2 days ago' }
              ].map((ann, idx) => (
                <div key={idx} className="flex gap-2.5 items-start border-b border-slate-55 pb-3 last:border-0 last:pb-0">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-605 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="text-[9px] space-y-0.5 leading-normal">
                    <h4 className="font-bold text-slate-850">{ann.title}</h4>
                    <span className="text-[8px] text-slate-400 font-bold block">{ann.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
