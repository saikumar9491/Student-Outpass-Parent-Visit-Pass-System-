import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { toast } from 'react-hot-toast';
import { Calendar, Compass } from 'lucide-react';

const VisitHistory = () => {
  const [visits, setVisits] = useState([]);
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

  const fetchVisits = async () => {
    try {
      const res = await API.get('/visit-passes/my');
      setVisits(res.data || []);
    } catch (error) {
      console.error('Error fetching visit history:', error);
      toast.error('Failed to load visit pass history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // Filtering
  const filteredVisits = filter === 'ALL'
    ? visits
    : visits.filter(v => v.status === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const filterTabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-1 font-display">Parent Visit History</h1>
        <p className="text-slate-600 text-xs font-sans">Track and monitor hostel visit permits requested by your parents/guardians</p>
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
          {filteredVisits.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
              <Compass className="h-10 w-10 text-slate-700" />
              <span>No visit permits found matching the filter "{filter}".</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                  <th className="px-6 py-3.5">Visitor</th>
                  <th className="px-6 py-3.5">Relationship</th>
                  <th className="px-6 py-3.5">Visit Date & Time</th>
                  <th className="px-6 py-3.5">Purpose</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredVisits.map((pass) => (
                  <tr key={pass._id} className="hover:bg-slate-100/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-750 flex items-center gap-2">
                        {pass.parentId?.image ? (
                          <img src={pass.parentId.image} alt="Parent" className="h-6 w-6 object-cover rounded-full" />
                        ) : (
                          <div className="h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-[10px] border border-slate-200">
                            {pass.parentId?.name ? pass.parentId.name.charAt(0) : 'P'}
                          </div>
                        )}
                        <div>
                          <span>{pass.parentId?.name || 'Parent'}</span>
                          <span className="block text-[8px] text-slate-400 font-mono mt-0.5">{pass.parentId?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium capitalize">{pass.parentId?.relationship || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-blue-400" />
                        {formatDate(pass.visitDate)}
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

export default VisitHistory;
