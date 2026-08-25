import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { Search, Calendar, BookOpen, Home, Phone, Mail, UserPlus, Trash2, X } from 'lucide-react';
import Loading from '../../components/Loading';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Student Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    studentId: '',
    department: '',
    year: '1st Year',
    hostel: '',
    roomNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setStudents(res.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students list');
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
    const { name, email, password, phone, studentId, department, year, hostel, roomNumber } = formData;
    if (!name || !email || !password || !phone || !studentId || !department || !year || !hostel || !roomNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/admin/users/student', formData);
      toast.success('Student registered successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        studentId: '',
        department: '',
        year: '1st Year',
        hostel: '',
        roomNumber: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Add student error:', error);
      toast.error(error.response?.data?.message || 'Failed to register student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This will permanently remove their credentials, student profile, outpass history, and parental links.`)) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('Student deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete student error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.studentId.toLowerCase().includes(search.toLowerCase()) ||
    student.hostel.toLowerCase().includes(search.toLowerCase()) ||
    student.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading size="lg" />;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1 font-display">Manage Students</h1>
          <p className="text-slate-600 text-xs font-sans">View, register, or delete hostel student records and linked associations.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/10 transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Register Student
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, roll, hostel..."
          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
        />
      </div>

      {/* Students Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No student accounts found.
          </div>
        ) : (
          filteredStudents.map(student => (
            <div key={student._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg space-y-4 relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-750 text-sm font-display">{student.name}</h3>
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase block mt-0.5">{student.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-950/40 border border-blue-900/50 text-blue-400 px-2 py-0.5 rounded font-semibold">
                    {student.year}
                  </span>
                  {student.userId?._id && (
                    <button
                      onClick={() => handleDelete(student.userId._id, student.name)}
                      className="p-1 text-slate-500 hover:text-red-500 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                      title="Delete Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-400/80" />
                  <span className="truncate">{student.department}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-blue-400/80" />
                  <span className="truncate">{student.hostel} &bull; Room {student.roomNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{student.phone}</span>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 flex justify-between items-center border-t border-slate-200 pt-2.5">
                <span>Parents Linked: {student.parentIds?.length || 0}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined: {student.userId?.createdAt ? new Date(student.userId.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-400" /> Register Student Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-600 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="robert.doe@hostel.edu"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Student Roll ID */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Student Roll ID / Register No</label>
                  <input
                    type="text"
                    name="studentId"
                    required
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="CS202604"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Department</label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Year of study */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Year of Study</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-slate-100 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {/* Hostel Block */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Hostel Block</label>
                  <input
                    type="text"
                    name="hostel"
                    required
                    value={formData.hostel}
                    onChange={handleChange}
                    placeholder="e.g. Kaveri Boys"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
                  />
                </div>

                {/* Room Number */}
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider text-[10px] font-bold">Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    required
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="101"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-850 focus:outline-none transition-colors"
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
                  {isSubmitting ? 'Registering...' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
