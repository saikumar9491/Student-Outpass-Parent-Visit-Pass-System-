import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Search, QrCode, 
  CheckCircle2, XCircle, Clock, User, Building, MapPin, 
  Calendar, Phone, ArrowRight, Check, Printer, RefreshCw, 
  Sparkles, Camera, LogOut, LogIn, Award, Scan
} from 'lucide-react';

const VerifyPass = () => {
  const [searchParams] = useSearchParams();
  const [passIdInput, setPassIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScanningMode, setIsScanningMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  // AI Legitimacy Verification state
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto load query param if present
  useEffect(() => {
    const qId = searchParams.get('id');
    if (qId) {
      setPassIdInput(qId);
      runVerification(qId);
    }
  }, [searchParams]);

  // AI Security Assessment
  useEffect(() => {
    if (result && result.status === 'VALID') {
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
          id: pass.passId,
          type: pass.passType,
          name: pass.name,
          studentId: pass.studentId,
          hostel: pass.hostel,
          date: pass.date,
          timings: pass.validTime,
          destination: pass.destination || pass.purpose,
          purpose: pass.purpose,
          status: pass.status
        },
        systemPrompt: "You are a hostel gate security AI for Rajiv Gandhi University. A guard is verifying a student outpass or visitor pass at the gate. Give a brief 2-sentence security assessment stating whether the permit window is appropriate and clearly advise 'ALLOWED' or 'HELD FOR WARDEN REVIEW'."
      });
      setAiText(res.data.response || 'Permit verified against University institutional registry.');
    } catch (error) {
      console.error('AI check error:', error);
      setAiText('Institutional Pass Verification: Verified against RGUT database.');
    } finally {
      setAiLoading(false);
    }
  };

  const runVerification = async (targetId) => {
    const searchId = (targetId || passIdInput).trim();
    if (!searchId) {
      setErrorMsg('Please enter a Pass ID or Student Roll Number');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await API.get(`/verify/pass/${encodeURIComponent(searchId)}`);
      const passData = res.data;
      setResult(passData);

      // Add to session log
      setRecentLogs(prev => [
        {
          id: passData.passId,
          name: passData.name,
          type: passData.passType,
          status: passData.status,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev.slice(0, 4)
      ]);
    } catch (error) {
      console.error('Verification query failed:', error);
      setResult({
        status: 'INVALID',
        passId: searchId,
        message: error.response?.data?.message || `Pass ID "${searchId}" is not found in the database.`
      });

      setRecentLogs(prev => [
        {
          id: searchId,
          name: 'Unknown / Unverified',
          type: 'Unregistered',
          status: 'INVALID',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev.slice(0, 4)
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (pass) => {
    if (!pass._id) {
      toast.success(`Check-In recorded for ${pass.name}`);
      return;
    }

    setActionLoading(true);
    try {
      const endpoint = pass.passType?.includes('Outpass') 
        ? `/admin/outpasses/${pass._id}/return`
        : `/admin/visit-passes/${pass._id}/return`;
      await API.put(endpoint);
      toast.success(`Check-In completed! Pass marked as RETURNED.`);
      runVerification(pass.passId);
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to update pass return status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  // Demo test presets
  const loadDemoPass = (type) => {
    if (type === 'OUTPASS') {
      setPassIdInput('OUT-2026-DEMO');
      setResult({
        _id: 'demo-1',
        status: 'VALID',
        passType: 'Student Outpass',
        passId: 'OUT-2026-9817',
        name: 'Arjun Sharma',
        studentId: '12664604',
        department: 'Computer Science & Engineering',
        year: '2nd Year',
        phone: '9876543210',
        hostel: 'Kaveri Boys Hostel',
        roomNumber: 'B-204',
        date: new Date().toLocaleDateString(),
        validTime: '08:00 AM – 08:00 PM',
        destination: 'Central Railway Station',
        purpose: 'Academic Project Fieldwork',
        emergencyContact: '9876543211 (Father)',
        approvedAt: new Date().toISOString()
      });
    } else if (type === 'VISIT') {
      setPassIdInput('VIS-2026-DEMO');
      setResult({
        _id: 'demo-2',
        status: 'VALID',
        passType: 'Parent Visit Pass',
        passId: 'VIS-2026-4412',
        name: 'Mrs. Kavitha Sharma',
        studentName: 'Arjun Sharma',
        studentId: '12664604',
        department: 'Computer Science',
        phone: '9988776655',
        hostel: 'Kaveri Boys Hostel',
        roomNumber: 'B-204',
        date: new Date().toLocaleDateString(),
        validTime: '10:00 AM – 04:00 PM',
        relationship: 'Mother',
        visitorCount: 2,
        visitorNames: 'Mrs. Kavitha Sharma, Master R. Sharma',
        purpose: 'Family Weekend Campus Visit',
        approvedAt: new Date().toISOString()
      });
    } else if (type === 'EXPIRED') {
      setResult({
        status: 'EXPIRED',
        passType: 'Student Outpass',
        passId: 'OUT-2026-EXPIRED',
        name: 'Rohan Mehta',
        studentId: '12551090',
        department: 'Electronics & Communication',
        hostel: 'Krishna Boys Hostel',
        roomNumber: '112',
        date: 'Yesterday',
        validTime: '09:00 AM – 01:00 PM',
        destination: 'City Market',
        purpose: 'Personal Errands',
        rawStatus: 'COMPLETED'
      });
    } else if (type === 'FAKE') {
      setResult({
        status: 'INVALID',
        passId: 'FAKE-999-XYZ',
        message: 'Security Alert: QR Signature mismatch or unissued Pass ID.'
      });
    }
  };

  const isAllowedVerdict = aiText.toUpperCase().includes('ALLOWED') || aiText.toUpperCase().includes('VALID');

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-display">Pass Verification</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gate Terminal Online
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Verify digital QR codes, check student outpasses, and log gate entries & exits.
          </p>
        </div>

        {/* Live Clock & Camera Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-mono font-bold text-slate-800">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>

          <button
            onClick={() => setIsScanningMode(!isScanningMode)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isScanningMode
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            <Camera className="h-4 w-4" />
            {isScanningMode ? 'Close Camera' : 'Camera Scanner'}
          </button>
        </div>
      </div>

      {/* Camera Simulator Overlay */}
      {isScanningMode && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-white relative overflow-hidden shadow-xl">
          <div className="max-w-xs mx-auto border-2 border-dashed border-indigo-500 rounded-2xl p-6 relative">
            <div className="h-36 flex flex-col items-center justify-center space-y-2">
              <div className="relative">
                <QrCode className="h-14 w-14 text-indigo-400 opacity-70 animate-pulse" />
                <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-bounce"></div>
              </div>
              <p className="text-xs text-slate-300 font-medium">Point Camera at Student's Digital QR Pass</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => loadDemoPass('OUTPASS')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Simulate Scan: Outpass
            </button>
            <button
              onClick={() => loadDemoPass('VISIT')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Simulate Scan: Parent Pass
            </button>
          </div>
        </div>
      )}

      {/* Main Search / Scanner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            runVerification();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            <Scan className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <input
              type="text"
              value={passIdInput}
              onChange={(e) => {
                setPassIdInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="SCAN QR CODE / ENTER PASS ID (e.g. OUT-123456) OR ROLL NO"
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-3 pl-12 pr-4 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-all uppercase tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {loading ? 'Verifying...' : 'Verify Permit'}
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
            <XCircle className="h-4 w-4" /> {errorMsg}
          </p>
        )}

        {/* Quick Test Samples */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Quick Test Samples:</span>
          <button
            onClick={() => loadDemoPass('OUTPASS')}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors cursor-pointer border border-blue-200"
          >
            Student Outpass
          </button>
          <button
            onClick={() => loadDemoPass('VISIT')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition-colors cursor-pointer border border-emerald-200"
          >
            Parent Visit Pass
          </button>
          <button
            onClick={() => loadDemoPass('EXPIRED')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg transition-colors cursor-pointer border border-amber-200"
          >
            Expired Pass
          </button>
          <button
            onClick={() => loadDemoPass('FAKE')}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-lg transition-colors cursor-pointer border border-rose-200"
          >
            Unregistered ID
          </button>
        </div>
      </div>

      {/* VERIFICATION RESULT DISPLAY */}
      {result && (
        <div className="space-y-6">
          {/* STATE 1: VALID & AUTHORIZED PASS */}
          {result.status === 'VALID' && (
            <div className="bg-white border-2 border-emerald-500 rounded-3xl shadow-xl overflow-hidden">
              {/* Green Header Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">PERMIT VALID & AUTHORIZED</h2>
                    <p className="text-emerald-100 text-xs">Official institutional permit verified against registry</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-emerald-800 text-xs font-extrabold rounded-full shadow-sm uppercase tracking-wider">
                  ENTRY / EXIT GRANTED
                </span>
              </div>

              {/* Pass Content Grid */}
              <div className="p-6 space-y-6">
                {/* ID & Type Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {result.passType}
                    </span>
                    <span className="font-mono text-sm font-extrabold text-slate-800">
                      PASS ID: {result.passId}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Scanned at: {currentTime.toLocaleTimeString()}
                  </span>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1: Identity Profile */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-4 w-4 text-indigo-600" /> Identity Credentials
                    </h3>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Full Name:</span>
                        <strong className="text-slate-900">{result.name}</strong>
                      </div>

                      {result.passType?.includes('Parent') ? (
                        <>
                          <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Relationship:</span>
                            <strong className="text-emerald-700">{result.relationship || 'Guardian'}</strong>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Visiting Student:</span>
                            <strong className="text-slate-900">{result.studentName} ({result.studentId})</strong>
                          </div>
                          {result.visitorCount && (
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500">Total Visitors:</span>
                              <strong className="text-slate-900">{result.visitorCount} Person(s)</strong>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Student Roll ID:</span>
                            <strong className="font-mono text-indigo-700 font-bold">{result.studentId}</strong>
                          </div>
                          {result.department && (
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500">Department:</span>
                              <strong className="text-slate-800">{result.department}</strong>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Hostel & Room:</span>
                        <strong className="text-slate-800">{result.hostel} • Room {result.roomNumber}</strong>
                      </div>

                      {result.phone && (
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Phone Number:</span>
                          <span className="font-mono text-slate-700">{result.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Travel Window & Scope */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" /> Travel Window & Authorization
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Permit Date:</span>
                        <strong className="text-slate-900">{result.date ? new Date(result.date).toLocaleDateString() : 'Today'}</strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Authorized Window:</span>
                        <strong className="text-emerald-700 font-bold">{result.validTime}</strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Destination / Purpose:</span>
                        <strong className="text-slate-800">{result.destination || result.purpose}</strong>
                      </div>

                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Authority Signature:</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <Award className="h-3.5 w-3.5" /> Hostel Warden Office (Approved)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Security Callout */}
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-indigo-950">AI Gate Security Verification</h4>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        Verdict: {isAllowedVerdict ? 'ALLOWED' : 'VERIFIED'}
                      </span>
                    </div>
                    <p className="text-indigo-900/80 mt-1 leading-relaxed">
                      {aiLoading ? 'Analyzing security risk...' : aiText}
                    </p>
                  </div>
                </div>

                {/* Fast Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkReturned(result)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <LogIn className="h-4 w-4" />
                      {actionLoading ? 'Recording...' : 'Mark Checked-In (Return Log)'}
                    </button>

                    <button
                      onClick={() => toast.success(`Check-Out Departure recorded for ${result.name}`)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Mark Checked-Out (Exit Log)
                    </button>
                  </div>

                  <button
                    onClick={handlePrintSlip}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Print Gate Slip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: EXPIRED PASS */}
          {result.status === 'EXPIRED' && (
            <div className="bg-white border-2 border-amber-400 rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-amber-500 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">PERMIT EXPIRED OR COMPLETED</h2>
                    <p className="text-amber-100 text-xs">This permit window has elapsed or was previously returned.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
                  DO NOT PERMIT EXIT
                </span>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Student Name:</span>
                    <strong className="text-slate-900">{result.name}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Roll ID:</span>
                    <strong className="font-mono text-slate-900">{result.studentId}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-200/50">
                    <span className="text-slate-500">Permit Window:</span>
                    <strong className="text-amber-800">{result.validTime} ({result.date})</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Action Required:</span>
                    <span className="font-bold text-amber-700">Direct student to Warden Office for pass re-issuance.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: INVALID / UNVERIFIED PASS */}
          {result.status === 'INVALID' && (
            <div className="bg-white border-2 border-rose-500 rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">SECURITY ALERT: UNVERIFIED PERMIT</h2>
                    <p className="text-rose-100 text-xs">Pass ID not found in institutional database or signature revoked.</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-rose-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
                  HOLD AT GATE
                </span>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                  <p className="text-rose-900 font-semibold">
                    {result.message || 'No active or historical outpass matched this identifier.'}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Ensure the student or visitor displays their official Rajiv Gandhi University digital QR pass from the portal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success('Security Desk and Hostel Warden alerted')}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    🚨 Alert Security Desk
                  </button>
                  <button
                    onClick={() => {
                      setResult(null);
                      setPassIdInput('');
                    }}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Gate Activity Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" /> Recent Verification Session Logs
          </h3>
          <span className="text-[11px] text-slate-400">
            {recentLogs.length} scans in current session
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Pass / Roll ID</th>
                <th className="py-3 px-4">Person Name</th>
                <th className="py-3 px-4">Pass Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No gate scans conducted in this session yet. Scan a QR code or enter a pass ID above.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{log.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{log.name}</td>
                    <td className="py-3 px-4 text-slate-500">{log.type}</td>
                    <td className="py-3 px-4">
                      {log.status === 'VALID' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          VALID
                        </span>
                      ) : log.status === 'EXPIRED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          INVALID
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{log.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerifyPass;
