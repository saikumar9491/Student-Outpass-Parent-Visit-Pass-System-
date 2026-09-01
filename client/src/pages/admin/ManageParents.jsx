import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { Search, Calendar, Users, Phone, Mail, UserPlus, Trash2, X, HelpCircle, Hash } from 'lucide-react';
import Loading from '../../components/Loading';

const ManageParents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Parent Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    relationship: '',
    studentId: '' // Child Roll ID
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setParents(res.data.parents || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
      toast.error('Failed to load parents list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, relationship, studentId } = formData;
    if (!name || !email || !password || !phone || !relationship || !studentId) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/admin/users/parent', formData);
      toast.success('Parent profile registered successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        relationship: '',
        studentId: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Add parent error:', error);
      toast.error(error.response?.data?.message || 'Failed to register parent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId, parentName) => {
    if (!window.confirm(`Are you sure you want to delete ${parentName}? This will permanently remove their credentials, parent profile, visit pass history, and associated student links.`)) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('Parent deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete parent error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete parent');
    }
  };

  const filteredParents = parents.filter(parent => 
    parent.name.toLowerCase().includes(search.toLowerCase()) ||
    (parent.parentId && parent.parentId.toLowerCase().includes(search.toLowerCase())) ||
    parent.relationship.toLowerCase().includes(search.toLowerCase()) ||
    parent.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading size="lg" />;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1 font-display">Manage Parents</h1>
          <p className="text-slate-600 text-xs font-sans">View, register, or delete parent accounts and unique Parent IDs.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/10 transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Register Parent
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, Parent ID, email..."
          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
        />
      </div>

      {/* Parents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredParents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No parent accounts found.
          </div>
        ) : (
          filteredParents.map(parent => (
            <div key={parent._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg space-y-4 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 text-left">
                  {parent.image ? (
                    <img src={parent.image} alt={parent.name} className="h-10 w-10 object-cover rounded-full border border-slate-200" />
                  ) : (
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 font-bold text-sm">
                      {parent.name ? parent.name.charAt(0) : 'P'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-750 text-sm font-display">{parent.name}</h3>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block mt-0.5">ID: {parent.parentId || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/50 text-emerald-450 px-2 py-0.5 rounded font-semibold">
                    {parent.relationship}
                  </span>
                  {parent.userId?._id && (
                    <button
                      onClick={() => handleDelete(parent.userId._id, parent.name)}
                      className="p-1 text-slate-500 hover:text-red-500 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                      title="Delete Parent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate">{parent.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{parent.phone}</span>
                </div>
              </div>

              {/* Linked Children */}
              <div className="border-t border-slate-200 pt-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2 font-display">Linked Children</span>
                <div className="space-y-1.5">
                  {parent.studentIds && parent.studentIds.length > 0 ? (
                    parent.studentIds.map(child => (
                      <div key={child._id} className="flex justify-between items-center bg-slate-100 border border-slate-200/60 p-2 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-blue-400/80" />
                          <span className="font-semibold text-slate-450">{child.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">{child.studentId}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No linked student records found.</span>
                  )}
                </div>
              </div>

              <div className="text-[9px] text-slate-500 flex justify-between items-center border-t border-slate-200 pt-2.5">
                <span>First-login Change Required: {parent.needsPasswordChange ? 'Yes' : 'No'}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined: {parent.userId?.createdAt ? new Date(parent.userId.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Parent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-400" /> Register Parent Profile
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-600 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              {/* Name */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Robert Doe"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="robert.doe@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543211"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Relationship to Student</label>
                <div className="relative">
                  <HelpCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <select
                    name="relationship"
                    required
                    value={formData.relationship}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-10 pr-3 text-slate-850 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-600">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>

              {/* Child Roll ID */}
              <div>
                <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Child's Roll / Student ID</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    name="studentId"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="e.g. CS202604"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-10 pr-3 text-slate-850 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-800 text-slate-450 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParents;
