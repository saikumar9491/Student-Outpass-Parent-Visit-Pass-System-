import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';
import { Trash2, Eye, Compass, Calendar, AlertCircle } from 'lucide-react';
import { addNotification } from '../../utils/notifications';

const MyOutpasses = () => {
  const [outpasses, setOutpasses] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'N/A';
    }
  };

  const fetchOutpasses = async () => {
    try {
      const res = await API.get('/outpasses/my');
      setOutpasses(res.data);
    } catch (error) {
      console.error('Error fetching outpasses:', error);
      toast.error('Failed to load outpass history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const handleCancel = async (id, destination) => {
    if (!window.confirm('Are you sure you want to cancel this pending outpass request?')) {
      return;
    }

    try {
      await API.delete(`/outpasses/${id}`);
      toast.success('Outpass request cancelled successfully');
      
      // Update notifications
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        addNotification(
          user._id,
          'Outpass Cancelled',
          `Your outpass request to ${destination} was cancelled.`
        );
      }
      
      fetchOutpasses(); // Refresh list
    } catch (error) {
      console.error('Error cancelling outpass:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel outpass');
    }
  };

  // Filtering
  const filteredOutpasses = filter === 'ALL'
    ? outpasses
    : outpasses.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const filterTabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">My Outpass History</h1>
        <p className="text-slate-600 text-xs">Track and manage all your hostel outpass applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white/60 p-1.5 rounded-xl border border-slate-200 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === tab
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-750'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History Grid/List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {filteredOutpasses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
              <Compass className="h-10 w-10 text-slate-700" />
              <span>No outpass requests found matching the filter "{filter}".</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                  <th className="px-6 py-3.5">Destination</th>
                  <th className="px-6 py-3.5">Timings (Out / Return)</th>
                  <th className="px-6 py-3.5">Purpose</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredOutpasses.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-100/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-750">{pass.destination}</td>
                    <td className="px-6 py-4 space-y-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        {formatDate(pass.outingDate)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <AlertCircle className="h-3.5 w-3.5 text-blue-500/60" />
                        {formatDate(pass.expectedReturnDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-450">{pass.purpose}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pass.status} />
                      {pass.status === 'REJECTED' && pass.rejectionReason && (
                        <p className="text-[10px] text-red-400 mt-1 max-w-[180px] leading-relaxed">
                          Reason: {pass.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          to={`/student/outpass/${pass._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-blue-650 border border-slate-200 text-slate-700 hover:text-white rounded-lg font-semibold transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Link>
                        
                        {pass.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(pass._id, pass.destination)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-red-950/60 border border-slate-200 hover:border-red-900/60 text-slate-700 hover:text-red-400 rounded-lg font-semibold transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOutpasses;
