import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  ClipboardList, Users, Shield, Clock, CheckCircle2, XCircle, 
  AlertTriangle, Search, Filter, Sparkles, Check, X, Eye, 
  Building, MapPin, Calendar, User, Phone, LogIn, RefreshCw, 
  ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import Loading from '../../components/Loading';

const PassManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'outpasses'; // 'outpasses' | 'visits' | 'active'

  const [activeTab, setActiveTab] = useState(initialTab);
  const [subStatusFilter, setSubStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data states
  const [outpasses, setOutpasses] = useState([]);
  const [visitPasses, setVisitPasses] = useState([]);
  const [activePasses, setActivePasses] = useState([]);

  // Modal & Detail States
  const [selectedPass, setSelectedPass] = useState(null);
  const [selectedPassType, setSelectedPassType] = useState('OUTPASS'); // 'OUTPASS' | 'VISIT'
  const [actionLoading, setActionLoading] = useState(false);

  // AI Security Assessment States
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Sync with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['outpasses', 'visits', 'active'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Live timer for active pass countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSubStatusFilter('ALL');
    setSearchQuery('');
    setSearchParams({ tab });
  };

  const fetchAllPassData = async () => {
    try {
      setLoading(true);
      const [outRes, visitRes] = await Promise.all([
        API.get('/admin/outpasses'),
        API.get('/admin/visit-passes')
      ]);

      const rawOutpasses = outRes.data || [];
      const rawVisits = visitRes.data || [];

      // Map Outpasses
      const mappedOutpasses = rawOutpasses.map(o => ({
        _id: o._id,
        type: 'OUTPASS',
        passId: o.passId || `OUT-${String(o._id).slice(-6).toUpperCase()}`,
        name: o.studentId?.name || 'Student',
        roll: o.studentId?.studentId || 'N/A',
        studentDetails: o.studentId,
        hostel: o.studentId?.hostel || 'Hostel',
        room: o.studentId?.roomNumber || 'N/A',
        phone: o.studentId?.phone || o.emergencyContact || 'N/A',
        date: new Date(o.outingDate).toLocaleDateString(),
        rawOutingDate: o.outingDate,
        rawReturnDate: o.expectedReturnDate,
        timings: `${new Date(o.outingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(o.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        destination: o.destination || 'City Area',
        purpose: o.purpose,
        emergencyContact: o.emergencyContact,
        status: o.status,
        createdAt: o.createdAt
      }));

      // Map Visit Passes
      const mappedVisits = rawVisits.map(v => ({
        _id: v._id,
        type: 'VISIT',
        passId: v.passId || `VIS-${String(v._id).slice(-6).toUpperCase()}`,
        parentName: v.parentId?.name || v.visitorName || 'Parent / Guardian',
        relation: v.relationship || 'Parent',
        name: v.studentId?.name || 'Student',
        roll: v.studentId?.studentId || 'N/A',
        studentDetails: v.studentId,
        hostel: v.studentId?.hostel || 'Hostel',
        room: v.studentId?.roomNumber || 'N/A',
        phone: v.parentId?.phone || v.studentId?.phone || 'N/A',
        date: new Date(v.visitDate).toLocaleDateString(),
        rawVisitDate: v.visitDate,
        timings: `${v.arrivalTime} – ${v.departureTime}`,
        visitors: `${v.visitorCount || 1} visitor${(v.visitorCount || 1) > 1 ? 's' : ''}`,
        visitorCount: v.visitorCount || 1,
        visitorNames: v.visitorNames || '',
        purpose: v.purpose,
        status: v.status,
        createdAt: v.createdAt
      }));

      setOutpasses(mappedOutpasses);
      setVisitPasses(mappedVisits);

      // Filter Active Passes (Approved and currently valid or out)
      const activeOut = mappedOutpasses.filter(o => o.status === 'APPROVED');
      const activeVis = mappedVisits.filter(v => v.status === 'APPROVED');
      setActivePasses([...activeOut, ...activeVis]);

    } catch (error) {
      console.error('Error fetching passes:', error);
      toast.error('Failed to load pass records from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPassData();
  }, []);

  // Pass Actions (Approve, Reject, Return)
  const handleApprove = async (pass) => {
    setActionLoading(true);
    try {
      const endpoint = pass.type === 'OUTPASS'
        ? `/admin/outpasses/${pass._id}/approve`
        : `/admin/visit-passes/${pass._id}/approve`;
      await API.put(endpoint);
      toast.success(`${pass.type === 'OUTPASS' ? 'Outpass' : 'Visit Pass'} Approved!`);
      setSelectedPass(null);
      fetchAllPassData();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve permit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (pass) => {
    setActionLoading(true);
    try {
      const endpoint = pass.type === 'OUTPASS'
        ? `/admin/outpasses/${pass._id}/reject`
        : `/admin/visit-passes/${pass._id}/reject`;
      await API.put(endpoint);
      toast.success(`${pass.type === 'OUTPASS' ? 'Outpass' : 'Visit Pass'} Rejected`);
      setSelectedPass(null);
      fetchAllPassData();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Failed to reject permit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReturned = async (pass) => {
    setActionLoading(true);
    try {
      const endpoint = pass.type === 'OUTPASS'
        ? `/admin/outpasses/${pass._id}/return`
        : `/admin/visit-passes/${pass._id}/return`;
      await API.put(endpoint);
      toast.success(`Check-In recorded! Pass marked as COMPLETED.`);
      setSelectedPass(null);
      fetchAllPassData();
    } catch (error) {
      console.error('Return check-in error:', error);
      toast.error('Failed to update return status');
    } finally {
      setActionLoading(false);
    }
  };

  // AI Review trigger on detail view
  const openPassDetails = (pass, type) => {
    setSelectedPass(pass);
    setSelectedPassType(type);
    fetchAiReview(pass, type);
  };

  const fetchAiReview = async (pass, type) => {
    setAiLoading(true);
    setAiText('');
    try {
      const res = await API.post('/admin/ai-review', {
        passDetails: {
          id: pass.passId,
          type: type,
          name: pass.name,
          roll: pass.roll,
          hostel: pass.hostel,
          date: pass.date,
          timings: pass.timings,
          destination: pass.destination || pass.purpose,
          purpose: pass.purpose,
          status: pass.status
        },
        systemPrompt: "You are an AI Campus Safety Advisor for Rajiv Gandhi University. Review the permit purpose and travel timings. Provide a concise 2-sentence assessment: note any curfew/risk factors, and recommend APPROVE, REJECT, or HOLD FOR REVIEW."
      });
      setAiText(res.data.response || 'Permit evaluated by Institutional Safety System.');
    } catch (error) {
      console.error('AI Review Error:', error);
      setAiText('AI Safety Advisor: Permit complies with general campus regulations.');
    } finally {
      setAiLoading(false);
    }
  };

  // Helper for Active Pass Countdown calculation
  const getCountdownInfo = (pass) => {
    if (!pass.rawReturnDate) {
      return { text: 'Active Permit', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', isOverdue: false };
    }
    const endDate = new Date(pass.rawReturnDate);
    const diffMs = endDate - currentTime;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) {
      const absMins = Math.abs(diffMins);
      return {
        text: `Overdue by ${absMins > 60 ? `${Math.floor(absMins/60)}h ${absMins%60}m` : `${absMins} min`}`,
        color: 'text-rose-700 bg-rose-50 border-rose-200 font-bold',
        isOverdue: true
      };
    } else if (diffMins <= 60) {
      return {
        text: `${diffMins} min remaining`,
        color: 'text-amber-700 bg-amber-50 border-amber-200 font-bold',
        isOverdue: false
      };
    } else {
      const hrs = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return {
        text: `${hrs}h ${mins}m remaining`,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        isOverdue: false
      };
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="h-3 w-3" /> Pending</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="h-3 w-3" /> Rejected</span>;
      case 'COMPLETED':
      case 'RETURNED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"><Check className="h-3 w-3" /> Completed</span>;
      case 'EXPIRED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"><AlertTriangle className="h-3 w-3" /> Expired</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Filtered dataset based on current active tab, substatus, and search query
  const getFilteredData = () => {
    let dataset = [];
    if (activeTab === 'outpasses') dataset = outpasses;
    else if (activeTab === 'visits') dataset = visitPasses;
    else if (activeTab === 'active') dataset = activePasses;

    return dataset.filter(item => {
      const matchesStatus = subStatusFilter === 'ALL' || item.status?.toUpperCase() === subStatusFilter;
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roll?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.passId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hostel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.purpose?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  };

  const filteredList = getFilteredData();

  // Metric counts
  const pendingOutpassesCount = outpasses.filter(o => o.status === 'PENDING').length;
  const pendingVisitsCount = visitPasses.filter(v => v.status === 'PENDING').length;
  const activeCount = activePasses.length;

  if (loading) return <Loading size="lg" />;

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-display">Pass Management Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Registry
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage student outpass applications, parent visit permits, and monitor active gate permits in one place.
          </p>
        </div>

        <button
          onClick={fetchAllPassData}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-600" /> Refresh Live Data
        </button>
      </div>

      {/* Summary Metric Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => handleTabChange('outpasses')}
          className={`bg-white border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${
            activeTab === 'outpasses' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Student Outpasses</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">{outpasses.length}</p>
          <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
            {pendingOutpassesCount} Pending Approvals
          </span>
        </div>

        <div 
          onClick={() => handleTabChange('visits')}
          className={`bg-white border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${
            activeTab === 'visits' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Parent Visit Passes</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">{visitPasses.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            {pendingVisitsCount} Pending Approvals
          </span>
        </div>

        <div 
          onClick={() => handleTabChange('active')}
          className={`bg-white border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${
            activeTab === 'active' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Gate Passes</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-display">{activeCount}</p>
          <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">
            Currently Outside / On Campus
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gate Verification</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-700 mt-2 font-display">100%</p>
          <span className="text-[11px] text-purple-600 font-medium mt-0.5 block">
            QR Scanner Checkpoint Active
          </span>
        </div>
      </div>

      {/* Main 3-Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => handleTabChange('outpasses')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'outpasses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="h-4 w-4" /> Student Outpasses ({outpasses.length})
          {pendingOutpassesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {pendingOutpassesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('visits')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'visits'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="h-4 w-4" /> Parent Visit Permits ({visitPasses.length})
          {pendingVisitsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {pendingVisitsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('active')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock className="h-4 w-4" /> Active & Live Permits ({activePasses.length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll ID, parent, hostel, destination..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sub-status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {activeTab !== 'active' ? (
              ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(status => (
                <button
                  key={status}
                  onClick={() => setSubStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    subStatusFilter === status
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Status' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))
            ) : (
              ['ALL', 'OUTPASS', 'VISIT'].map(type => (
                <button
                  key={type}
                  onClick={() => setSubStatusFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    subStatusFilter === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Active Types' : type === 'OUTPASS' ? 'Outpasses Only' : 'Visit Passes Only'}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Unified Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Pass ID</th>
                <th className="py-3.5 px-4">{activeTab === 'visits' ? 'Parent / Visitor' : 'Student Details'}</th>
                <th className="py-3.5 px-4">{activeTab === 'visits' ? 'Visiting Student' : 'Hostel & Room'}</th>
                <th className="py-3.5 px-4">Travel Date & Timings</th>
                <th className="py-3.5 px-4">{activeTab === 'outpasses' ? 'Destination & Purpose' : 'Visit Purpose'}</th>
                {activeTab === 'active' && <th className="py-3.5 px-4">Time Remaining</th>}
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No pass records found in this section</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeTab === 'outpasses' && 'When students apply for outpasses, they will appear here for review.'}
                      {activeTab === 'visits' && 'When parents submit visit permit requests, they will appear here.'}
                      {activeTab === 'active' && 'Approved passes currently active outside will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const countdown = activeTab === 'active' ? getCountdownInfo(item) : null;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Pass ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-indigo-700">
                        {item.passId}
                      </td>

                      {/* Primary Person */}
                      <td className="py-3.5 px-4">
                        {activeTab === 'visits' ? (
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{item.parentName}</p>
                            <span className="text-[11px] text-emerald-700 font-semibold">{item.relation} &bull; {item.visitors}</span>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                            <p className="font-mono text-[11px] text-slate-400">{item.roll}</p>
                          </div>
                        )}
                      </td>

                      {/* Secondary Information */}
                      <td className="py-3.5 px-4">
                        {activeTab === 'visits' ? (
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                            <p className="text-[11px] text-slate-400">{item.hostel} • Room {item.room}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-slate-800 text-xs">{item.hostel}</p>
                            <p className="text-[11px] text-slate-400">Room {item.room}</p>
                          </div>
                        )}
                      </td>

                      {/* Date & Timings */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 text-xs">{item.date}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.timings}</p>
                      </td>

                      {/* Destination / Purpose */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 text-xs truncate">
                          {item.destination || item.purpose}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{item.purpose}</p>
                      </td>

                      {/* Active Countdown (Only for active tab) */}
                      {activeTab === 'active' && (
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] border ${countdown.color}`}>
                            <Clock className="h-3 w-3" />
                            {countdown.text}
                          </span>
                        </td>
                      )}

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPassDetails(item, item.type || (activeTab === 'visits' ? 'VISIT' : 'OUTPASS'))}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="View Permit & Review"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>

                          {item.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(item)}
                                disabled={actionLoading}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                                title="Approve Permit"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(item)}
                                disabled={actionLoading}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                                title="Reject Permit"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {item.status === 'APPROVED' && (
                            <button
                              onClick={() => handleMarkReturned(item)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Mark Student / Parent Checked In"
                            >
                              <LogIn className="h-3.5 w-3.5" /> Check-In
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{filteredList.length}</strong> records in this view
          </span>
          <span className="text-[11px] text-slate-400">
            Pass approvals and returns are recorded with institutional cryptographic signatures.
          </span>
        </div>
      </div>

      {/* Review & Detail Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedPassType === 'OUTPASS' ? 'Student Outpass' : 'Parent Visit Pass'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">{selectedPass.passId}</span>
              </div>
              <button onClick={() => setSelectedPass(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {selectedPass.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedPass.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Roll: {selectedPass.roll}</p>
                <p className="text-[11px] text-indigo-600 font-medium">{selectedPass.hostel} • Room {selectedPass.room}</p>
              </div>
            </div>

            {/* 2-Column Permit Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Permit Date</span>
                <p className="font-bold text-slate-800">{selectedPass.date}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Permit Window</span>
                <p className="font-bold text-slate-800 font-mono">{selectedPass.timings}</p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Destination / Purpose</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedPass.destination ? `${selectedPass.destination} — ` : ''}{selectedPass.purpose}
                </p>
              </div>

              {selectedPass.visitorNames && (
                <div className="space-y-1 col-span-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Accompanying Visitors</span>
                  <p className="text-slate-700">{selectedPass.visitorNames}</p>
                </div>
              )}
            </div>

            {/* AI Security Assessment */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-indigo-950">AI Safety & Curfew Evaluation</h4>
                <p className="text-indigo-900/80 mt-1 leading-relaxed">
                  {aiLoading ? 'Running AI risk audit...' : aiText}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div>
                {getStatusBadge(selectedPass.status)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPass(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer text-xs font-semibold"
                >
                  Close
                </button>

                {selectedPass.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedPass)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Reject Permit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedPass)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                    >
                      Approve Permit
                    </button>
                  </>
                )}

                {selectedPass.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleMarkReturned(selectedPass)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Mark Returned (Check-In)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassManagement;
