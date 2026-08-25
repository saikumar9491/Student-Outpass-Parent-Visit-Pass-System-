import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';
import { Check, X, Search, Eye, Calendar, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addNotification } from '../../utils/notifications';

const ManageVisitPasses = () => {
  const [visitPasses, setVisitPasses] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal states for rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchVisitPasses = async () => {
    setLoading(true);
    try {
      let url = '/admin/visit-passes';
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (search.trim()) {
        params.search = search;
      }

      const res = await API.get(url, { params });
      setVisitPasses(res.data);
    } catch (error) {
      console.error('Error fetching visit passes:', error);
      toast.error('Failed to load visit permits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitPasses();
  }, [statusFilter, search]);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this hostel visit permit?')) return;

    try {
      const res = await API.put(`/admin/visit-passes/${id}/approve`);
      toast.success('Visit pass approved successfully!');
      
      // Notify parent
      const passData = res.data.visitPass;
      if (passData && passData.parentId) {
        addNotification(
          passData.parentId,
          'Visit Pass Approved',
          `Your visit pass to visit child has been APPROVED! Pass ID: ${passData.passId}`
        );
      }

      fetchVisitPasses();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve visit pass');
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
      const res = await API.put(`/admin/visit-passes/${rejectId}/reject`, { rejectionReason });
      toast.success('Visit pass request rejected successfully');
      
      // Notify parent
      const passData = res.data.visitPass;
      if (passData && passData.parentId) {
        addNotification(
          passData.parentId,
          'Visit Pass Rejected',
          `Your visit pass request has been REJECTED. Reason: ${rejectionReason}`
        );
      }

      setShowRejectModal(false);
      fetchVisitPasses();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject visit pass');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const filterTabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Manage Parent Visit Passes</h1>
        <p className="text-slate-600 text-xs">Search, approve, or reject hostel visit requests by parents</p>
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
            placeholder="Search by visitor, student name..."
            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {visitPasses.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">No visit requests found matching query.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                    <th className="px-6 py-3.5">Visitor (Relationship)</th>
                    <th className="px-6 py-3.5">Student Child</th>
                    <th className="px-6 py-3.5">Visit Date / Time</th>
                    <th className="px-6 py-3.5">Visitors</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {visitPasses.map((pass) => (
                    <tr key={pass._id} className="hover:bg-slate-100/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-750 block">{pass.visitorName}</span>
                        <span className="text-[10px] text-slate-500 block">Rel: {pass.relationship} &bull; Ph: {pass.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-450">
                        {pass.studentId ? (
                          <>
                            <span className="block font-semibold text-slate-750">{pass.studentId.name}</span>
                            <span className="text-[10px] text-slate-500">Roll: {pass.studentId.studentId} &bull; Rm: {pass.studentId.roomNumber}</span>
                          </>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-blue-400" />
                          {new Date(pass.visitDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-blue-500/50" />
                          {pass.arrivalTime} - {pass.departureTime}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Users className="h-4.5 w-4.5 text-slate-500" /> {pass.visitorCount} Person(s)
                        </span>
                        {pass.visitorNames && pass.visitorNames.length > 0 && (
                          <span className="text-[9px] text-slate-500 block max-w-[120px] leading-tight">
                            ({pass.visitorNames.join(', ')})
                          </span>
                        )}
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
                            to={`/parent/visit/${pass._id}`}
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
            <h3 className="text-md font-bold text-slate-900">Reject Visit Pass Application</h3>
            <p className="text-xs text-slate-600">
              Please enter the reason for rejecting this parent visit pass request.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason (e.g. Renovation in progress, security alert)..."
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

export default ManageVisitPasses;
