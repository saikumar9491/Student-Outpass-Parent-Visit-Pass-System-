import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { Search, Scan, CheckCircle2, XCircle, AlertCircle, Clock, Calendar, Shield, MapPin, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyPass = () => {
  const [searchParams] = useSearchParams();
  const [passId, setPassId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (idToVerify) => {
    const id = idToVerify || passId;
    if (!id.trim()) {
      toast.error('Please enter a Pass ID');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await API.get(`/verify/pass/${id.trim().toUpperCase()}`);
      setResult(res.data);
    } catch (error) {
      console.error('Verify pass error:', error);
      const msg = error.response?.data?.message || 'Pass ID is invalid or does not exist';
      setErrorMsg(msg);
      setResult({ status: 'NOT FOUND', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Pre-load verification if 'id' parameter is present in URL
  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setPassId(queryId);
      handleVerify(queryId);
    }
  }, [searchParams]);

  const getStatusBanner = (status) => {
    switch (status?.toUpperCase()) {
      case 'VALID':
        return {
          bg: 'bg-emerald-950/20 border-emerald-500/30',
          text: 'text-emerald-400',
          icon: CheckCircle2,
          title: 'Pass Verified: VALID'
        };
      case 'EXPIRED':
        return {
          bg: 'bg-zinc-950/20 border-zinc-500/30',
          text: 'text-zinc-400',
          icon: AlertCircle,
          title: 'Pass Status: EXPIRED'
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-950/20 border-red-500/30',
          text: 'text-red-450',
          icon: XCircle,
          title: 'Pass Status: REJECTED'
        };
      case 'CANCELLED':
        return {
          bg: 'bg-slate-50/20 border-slate-500/30',
          text: 'text-slate-600',
          icon: AlertCircle,
          title: 'Pass Status: CANCELLED'
        };
      default:
        return {
          bg: 'bg-red-950/20 border-red-500/30',
          text: 'text-red-450',
          icon: Shield,
          title: 'Pass Status: NOT FOUND'
        };
    }
  };

  const banner = getStatusBanner(result?.status);
  const StatusIcon = banner.icon;

  return (
    <div className="max-w-xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="no-print">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Verify Digital Permit</h1>
        <p className="text-slate-600 text-xs">Scan or enter the unique 16-character Pass ID to check legitimacy.</p>
      </div>

      {/* Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl no-print">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Scan className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              value={passId}
              onChange={(e) => setPassId(e.target.value)}
              placeholder="Enter unique Pass ID (e.g. E78FA250)"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors uppercase font-mono font-semibold"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="h-4.5 w-4.5" /> Search
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className={`border rounded-2xl overflow-hidden shadow-2xl ${banner.bg}`}>
          {/* Banner Status Header */}
          <div className="px-6 py-4 border-b border-inherit flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${banner.text}`} />
            <h3 className={`text-md font-bold ${banner.text}`}>{banner.title}</h3>
          </div>

          {result.status !== 'NOT FOUND' ? (
            /* Details Body */
            <div className="p-6 bg-slate-50 space-y-6 text-sm">
              {/* Type and ID */}
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Permit Type</span>
                  <span className="text-xs font-bold text-slate-750 uppercase">{result.passType}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Pass ID</span>
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {result.passId}
                  </span>
                </div>
              </div>

              {/* Name Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    {result.passType.includes('Outpass') ? 'Student Name' : 'Visitor Name'}
                  </span>
                  <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5 mt-0.5">
                    <User className="h-4 w-4 text-blue-400" /> {result.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Student Roll ID</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">{result.studentId}</span>
                </div>
              </div>

              {/* Hostel details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Hostel Block</span>
                  <span className="text-xs font-semibold text-slate-450">{result.hostel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Room Number</span>
                  <span className="text-xs font-semibold text-slate-450">{result.roomNumber}</span>
                </div>
              </div>

              {/* Dates & times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Date</span>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                    {new Date(result.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Valid Timings</span>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-blue-400" /> {result.validTime}
                  </span>
                </div>
              </div>

              {/* Destination / Purpose */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                {result.destination && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Destination</span>
                    <span className="text-xs text-slate-700 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-blue-400" /> {result.destination}
                    </span>
                  </div>
                )}
                {result.purpose && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Purpose</span>
                    <span className="text-xs text-slate-700 block mt-0.5">{result.purpose}</span>
                  </div>
                )}
                {result.emergencyContact && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Emergency Contact</span>
                    <span className="text-xs text-slate-700 block mt-0.5">{result.emergencyContact}</span>
                  </div>
                )}
              </div>

              {/* Approved metadata */}
              {result.approvedAt && (
                <div className="border-t border-slate-200 pt-4 flex items-center gap-2 text-[10px] text-slate-500">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>Digitally Authorized by Registrar Office on {new Date(result.approvedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ) : (
            /* Error details */
            <div className="p-6 bg-slate-50 text-center py-10">
              <p className="text-sm text-slate-500 leading-relaxed">
                {result.message}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Double-check characters. Pass IDs are case-insensitive and generated automatically upon admin approvals.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyPass;
