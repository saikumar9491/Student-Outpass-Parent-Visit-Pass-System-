import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';
import { Check, X, Search, Filter, Eye, Calendar, Clock, BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addNotification } from '../../utils/notifications';

const ManageOutpasses = () => {
  const [outpasses, setOutpasses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal states for rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchOutpasses = async () => {
    setLoading(true);
    try {
      let url = '/admin/outpasses';
      // Append status if not ALL
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (search.trim()) {
        params.search = search;
      }
      
      const res = await API.get(url, { params });
      setOutpasses(res.data);
    } catch (error) {
      console.error('Error fetching outpasses:', error);
      toast.error('Failed to load outpasses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutpasses();
  }, [statusFilter, search]);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this student outpass?')) return;

    try {
      const res = await API.put(`/admin/outpasses/${id}/approve`);
      toast.success('Outpass approved successfully!');
      
      // Notify student
      const passData = res.data.outpass;
      if (passData && passData.studentId) {
        addNotification(
          passData.studentId,
          'Outpass Approved',
          `Your outpass request to ${passData.destination} has been APPROVED! Pass ID: ${passData.passId}`
        );
      }

      fetchOutpasses();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve outpass');
    }
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await API.put(`/admin/outpasses/${rejectId}/reject`, { rejectionReason });
      toast.success('Outpass rejected successfully');
      
      // Notify student
      const passData = res.data.outpass;
      if (passData && passData.studentId) {
        addNotification(
          passData.studentId,
          'Outpass Rejected',
          `Your outpass request to ${passData.destination} has been REJECTED. Reason: ${rejectionReason}`
        );
      }

      setShowRejectModal(false);
      fetchOutpasses();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject outpass');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const filterTabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Manage Student Outpasses</h1>
        <p className="text-slate-600 text-xs">Search, audit and manage student hostel outing permits</p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-white/60 p-1.5 rounded-xl border border-slate-200">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-750'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or roll..."
            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Outpasses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {outpasses.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">No outpasses found matching query.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                    <th className="px-6 py-3.5">Student Info</th>
                    <th className="px-6 py-3.5">Hostel Detail</th>
                    <th className="px-6 py-3.5">Outing Timings</th>
                    <th className="px-6 py-3.5">Destination / Purpose</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {outpasses.map((pass) => (
                    <tr key={pass._id} className="hover:bg-slate-100/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-750 block">{pass.studentId?.name || 'Unknown Student'}</span>
                        <span className="text-[10px] text-slate-500 block">ID: {pass.studentId?.studentId || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-450">
                        {pass.studentId?.hostel ? (
                          <>
                            <span className="block">{pass.studentId.hostel}</span>
                            <span className="text-[10px] text-slate-500">Room: {pass.studentId.roomNumber}</span>
                          </>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-blue-400" />
                          {new Date(pass.outingDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-blue-500/50" />
                          {new Date(pass.outingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(pass.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-250 block">{pass.destination}</span>
                        <span className="text-[10px] text-slate-500 block leading-normal">{pass.purpose}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={pass.status} />
                        {pass.status === 'REJECTED' && pass.rejectionReason && (
                          <p className="text-[9px] text-red-400 mt-1 max-w-[150px] leading-relaxed">
                            Reason: {pass.rejectionReason}
                          </p>
                        )}
                        {pass.status === 'APPROVED' && pass.passId && (
                          <span className="text-[9px] font-mono text-blue-400 block mt-1 font-bold">
                            ID: {pass.passId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Link
                            to={`/student/outpass/${pass._id}`}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-800 text-slate-600 hover:text-white border border-slate-200 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          {pass.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(pass._id)}
                                title="Approve"
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-400 border border-slate-200 hover:border-emerald-800/40 transition-colors cursor-pointer"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openRejectModal(pass._id)}
                                title="Reject"
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-900/30 text-slate-500 hover:text-red-400 border border-slate-200 hover:border-red-800/40 transition-colors cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-md font-bold text-slate-900">Reject Outpass Application</h3>
            <p className="text-xs text-slate-600">
              Please enter the reason for rejecting this student outpass request.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason (e.g. Schedule conflicts, late return hour)..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-850 placeholder-slate-450 focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-800 text-slate-450 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAction ? 'Rejecting...' : 'Reject Permit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOutpasses;
