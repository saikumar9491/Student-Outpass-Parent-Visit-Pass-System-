import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';
import { Eye, Users, Calendar, Clock, Compass } from 'lucide-react';

const MyVisitRequests = () => {
  const [visitRequests, setVisitRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    try {
      const res = await API.get('/visit-passes/my');
      setVisitRequests(res.data);
    } catch (error) {
      console.error('Error fetching visit requests:', error);
      toast.error('Failed to load visit permit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // Filter visit requests
  const filteredRequests = filter === 'ALL'
    ? visitRequests
    : visitRequests.filter(v => v.status === filter);

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
        <h1 className="text-xl font-bold text-slate-900 mb-1">Hostel Visit Permits History</h1>
        <p className="text-slate-600 text-xs">Track and view all your requested hostel visit permits</p>
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

      {/* Permits History Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
              <Compass className="h-10 w-10 text-slate-700" />
              <span>No visit pass requests found matching the filter "{filter}".</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                  <th className="px-6 py-3.5">Visitor Name</th>
                  <th className="px-6 py-3.5">Hostel Child (Student)</th>
                  <th className="px-6 py-3.5">Visit Schedule</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredRequests.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-100/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-750">{pass.visitorName}</td>
                    <td className="px-6 py-4 text-slate-450">{pass.studentId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 space-y-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        {new Date(pass.visitDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-blue-500/60" />
                        {pass.arrivalTime} - {pass.departureTime}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pass.status} />
                      {pass.status === 'REJECTED' && pass.rejectionReason && (
                        <p className="text-[10px] text-red-400 mt-1 max-w-[180px] leading-relaxed">
                          Reason: {pass.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/parent/visit/${pass._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-blue-655 border border-slate-200 text-slate-700 hover:text-white rounded-lg font-semibold transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Link>
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

export default MyVisitRequests;
