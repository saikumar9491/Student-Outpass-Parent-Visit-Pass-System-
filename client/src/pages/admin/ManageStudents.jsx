import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Search, Calendar, BookOpen, Home, Phone, Mail, UserPlus, 
  Trash2, X, Edit, Users, Building, GraduationCap, Eye, Shield, UserCheck
} from 'lucide-react';
import Loading from '../../components/Loading';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedHostel, setSelectedHostel] = useState('ALL');

  // Add / Edit Student Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [admissionYear, setAdmissionYear] = useState(2026);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    studentId: '',
    department: '',
    year: '1st Year',
    hostel: '',
    roomNumber: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentRelationship: 'Mother',
    parentPassword: '',
    studentImage: '',
    parentImage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Parent Modal state
  const [viewingParent, setViewingParent] = useState(null);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const generateStudentId = (year) => {
    const yrSuffix = String(year).slice(-2);
    const prefix = `1${yrSuffix}`; // e.g. "126" for 2026
    const rand = Math.floor(10000 + Math.random() * 90000); // 5 digits
    return `${prefix}${rand}`; // total 8 digits
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingStudentId(null);
    const defaultStudentId = generateStudentId(2026);
    const defaultStudentPassword = String(Math.floor(100000 + Math.random() * 900000));
    const defaultParentPassword = String(Math.floor(100000 + Math.random() * 900000));
    setAdmissionYear(2026);
    setFormData({
      name: '',
      email: '',
      password: defaultStudentPassword,
      phone: '',
      studentId: defaultStudentId,
      department: '',
      year: '1st Year',
      hostel: '',
      roomNumber: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      parentRelationship: 'Mother',
      parentPassword: defaultParentPassword,
      studentImage: '',
      parentImage: ''
    });
    setShowAddModal(true);
  };

  const handleEditClick = (student) => {
    setIsEditMode(true);
    setEditingStudentId(student._id);

    const linkedParent = (student.parents && student.parents[0]) || (student.parentIds && student.parentIds[0]) || {};

    setFormData({
      name: student.name || '',
      email: student.email || '',
      password: 'dummy-password',
      phone: student.phone || '',
      studentId: student.studentId || '',
      department: student.department || '',
      year: student.year || '1st Year',
      hostel: student.hostel || '',
      roomNumber: student.roomNumber || '',
      parentName: linkedParent.name || '',
      parentEmail: linkedParent.email || '',
      parentPhone: linkedParent.phone || '',
      parentRelationship: linkedParent.relationship || 'Mother',
      parentPassword: '',
      studentImage: student.image || '',
      parentImage: linkedParent.image || ''
    });

    const yrPrefix = student.studentId ? student.studentId.substring(1, 3) : '';
    const parsedYr = yrPrefix ? 2000 + Number(yrPrefix) : 2026;
    setAdmissionYear(parsedYr);
    setShowAddModal(true);
  };

  const handleAdmissionYearChange = (e) => {
    const yr = Number(e.target.value) || 2026;
    setAdmissionYear(yr);
    setFormData(prev => ({
      ...prev,
      studentId: generateStudentId(yr)
    }));
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setStudents(res.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students directory');
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
    const { 
      name, email, password, phone, studentId, department, year, hostel, roomNumber,
      parentName, parentEmail, parentPhone, parentRelationship, parentPassword,
      studentImage, parentImage
    } = formData;

    if (isEditMode) {
      if (!name || !email || !phone || !studentId || !department || !year || !hostel || !roomNumber) {
        toast.error('Please fill in all student fields');
        return;
      }
    } else {
      if (!name || !email || !password || !phone || !studentId || !department || !year || !hostel || !roomNumber ||
          !parentName || !parentEmail || !parentPhone || !parentRelationship || !parentPassword) {
        toast.error('Please fill in all student and parent fields');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await API.put(`/admin/users/student/${editingStudentId}`, {
          name,
          email,
          phone,
          studentId,
          department,
          year,
          hostel,
          roomNumber,
          studentImage,
          parentName,
          parentEmail,
          parentPhone,
          parentRelationship,
          parentImage
        });
        toast.success('Student and linked parent updated successfully!');
      } else {
        await API.post('/admin/users/student', formData);
        toast.success('Student & Parent registered successfully!');
      }
      setShowAddModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Save student error:', error);
      toast.error(error.response?.data?.message || 'Failed to save student details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This will permanently remove their credentials, student profile, outpass history, and linked parent associations.`)) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('Student and associated records removed successfully');
      fetchUsers();
    } catch (error) {
      console.error('Delete student error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  // Distinct departments and hostels for filters
  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean)));
  const hostels = Array.from(new Set(students.map(s => s.hostel).filter(Boolean)));

  const filteredStudents = students.filter(student => {
    const parentObj = (student.parents && student.parents[0]) || (student.parentIds && student.parentIds[0]) || {};
    const matchesSearch = 
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      student.hostel?.toLowerCase().includes(search.toLowerCase()) ||
      student.department?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()) ||
      student.phone?.toLowerCase().includes(search.toLowerCase()) ||
      parentObj.name?.toLowerCase().includes(search.toLowerCase()) ||
      parentObj.phone?.toLowerCase().includes(search.toLowerCase()) ||
      parentObj.parentId?.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || student.department === selectedDept;
    const matchesYear = selectedYear === 'ALL' || student.year === selectedYear;
    const matchesHostel = selectedHostel === 'ALL' || student.hostel === selectedHostel;

    return matchesSearch && matchesDept && matchesYear && matchesHostel;
  });

  if (loading) return <Loading size="lg" />;

  return (
    <div className="space-y-6 text-left">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-display">Students & Guardians Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {students.length} Total Enrolled
            </span>
          </div>
          <p className="text-slate-500 text-xs font-sans mt-0.5">
            Manage student academic profiles, hostel wing allocations, and linked parent credentials in one place.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Register Student & Parent
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, roll ID, parent name, parent phone, room..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            {/* Hostel Filter */}
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Hostels</option>
              {hostels.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            {(selectedDept !== 'ALL' || selectedYear !== 'ALL' || selectedHostel !== 'ALL' || search) && (
              <button
                onClick={() => {
                  setSelectedDept('ALL');
                  setSelectedYear('ALL');
                  setSelectedHostel('ALL');
                  setSearch('');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students Data Table (Rows & Columns) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll ID</th>
                <th className="py-3.5 px-4">Department & Year</th>
                <th className="py-3.5 px-4">Hostel & Room</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Linked Parent / Guardian</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No student records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search criteria or register a new student.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const parentObj = (student.parents && student.parents[0]) || (student.parentIds && student.parentIds[0]) || null;
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Index */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {student.image ? (
                            <img 
                              src={student.image} 
                              alt={student.name} 
                              className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0" 
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{student.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Joined: {student.userId?.createdAt ? new Date(student.userId.createdAt).toLocaleDateString() : 'Active'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roll ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-[11px]">
                        {student.studentId}
                      </td>

                      {/* Department & Year */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 text-xs">{student.department || 'General'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {student.year || '1st Year'}
                        </span>
                      </td>

                      {/* Hostel & Room */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 text-xs flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5 text-slate-400" />
                          {student.hostel || 'Main Block'}
                        </p>
                        <span className="inline-block mt-1 text-[11px] font-mono text-slate-500">
                          Room <strong className="text-slate-800 font-semibold">{student.roomNumber || 'N/A'}</strong>
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{student.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{student.phone}</span>
                          </p>
                        </div>
                      </td>

                      {/* Linked Parent / Guardian */}
                      <td className="py-3.5 px-4">
                        {parentObj && parentObj.name ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <UserCheck className="h-3 w-3 text-emerald-600" />
                                {parentObj.relationship || 'Guardian'}: {parentObj.name}
                              </span>
                              <button
                                onClick={() => setViewingParent({ ...parentObj, studentName: student.name, studentId: student.studentId })}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                              >
                                View ID
                              </button>
                            </div>
                            {parentObj.phone && (
                              <p className="text-[10px] text-slate-500 font-mono pl-0.5">📞 {parentObj.phone}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span>No parent linked</span>
                            <button
                              onClick={() => handleEditClick(student)}
                              className="text-blue-600 text-[10px] font-semibold hover:underline cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Student & Parent"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {student.userId?._id && (
                            <button
                              onClick={() => handleDelete(student.userId._id, student.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="h-4 w-4" />
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
            Showing <strong className="text-slate-800 font-semibold">{filteredStudents.length}</strong> of{' '}
            <strong className="text-slate-800 font-semibold">{students.length}</strong> enrolled students
          </span>
          <span className="text-[11px] text-slate-400">
            Parent login credentials & contact numbers are integrated directly in student records.
          </span>
        </div>
      </div>

      {/* View Parent Details Modal */}
      {viewingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" /> Parent / Guardian Account Info
              </h3>
              <button onClick={() => setViewingParent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {viewingParent.image ? (
                <img src={viewingParent.image} alt={viewingParent.name} className="h-14 w-14 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
                  {viewingParent.name ? viewingParent.name.charAt(0) : 'P'}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{viewingParent.name}</h4>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {viewingParent.relationship || 'Parent'}
                </span>
                {viewingParent.parentId && (
                  <p className="text-[11px] text-blue-600 font-mono font-bold mt-1">ID: {viewingParent.parentId}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Child / Student:</span>
                <span className="font-semibold text-slate-800">{viewingParent.studentName} ({viewingParent.studentId})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-medium text-slate-800">{viewingParent.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-medium text-slate-800">{viewingParent.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Login Role:</span>
                <span className="font-semibold text-emerald-600 uppercase text-[10px]">Verified Parent Account</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingParent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student & Parent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" /> {isEditMode ? 'Edit Student & Linked Guardian' : 'Register Student & Parent Account'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              {/* SECTION 1: Student Details */}
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mb-2">1. Student Academic Profile</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Robert Doe"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="robert.doe@hostel.edu"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  {!isEditMode ? (
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Student Password</label>
                      <input
                        type="text"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                      />
                      <span className="text-[8px] text-slate-400 block mt-1 font-normal leading-normal">
                        Student can change this password after logging in.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Student Password</label>
                      <input
                        type="text"
                        disabled
                        value="••••••••"
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-slate-400 focus:outline-none cursor-not-allowed"
                      />
                      <span className="text-[8px] text-slate-400 block mt-1 font-normal leading-normal font-normal">
                        Password can be updated by the student in their settings.
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Student Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'studentImage')}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    {formData.studentImage ? (
                      <img src={formData.studentImage} alt="Student Preview" className="h-10 w-10 object-cover rounded-full border border-slate-200" />
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">No student photo uploaded</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Admission Year</label>
                    <input
                      type="number"
                      value={admissionYear}
                      onChange={handleAdmissionYearChange}
                      min="2020"
                      max="2035"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Generated Roll ID</label>
                    <input
                      type="text"
                      name="studentId"
                      readOnly
                      value={formData.studentId}
                      className="w-full bg-slate-100 border border-slate-200 text-blue-600 font-mono font-bold focus:outline-none rounded-xl py-2 px-3 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Department</label>
                    <input
                      type="text"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3 mb-1">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Year of Study</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Hostel Block</label>
                    <input
                      type="text"
                      name="hostel"
                      required
                      value={formData.hostel}
                      onChange={handleChange}
                      placeholder="e.g. Kaveri Boys"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Room Number</label>
                    <input
                      type="text"
                      name="roomNumber"
                      required
                      value={formData.roomNumber}
                      onChange={handleChange}
                      placeholder="101"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Linked Parent / Guardian Details */}
              <div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-2">2. Linked Parent / Guardian Information</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Parent / Guardian Name</label>
                    <input
                      type="text"
                      name="parentName"
                      required
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Parent Email</label>
                    <input
                      type="email"
                      name="parentEmail"
                      required
                      value={formData.parentEmail}
                      onChange={handleChange}
                      placeholder="jane.doe@email.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Parent Phone Number</label>
                    <input
                      type="text"
                      name="parentPhone"
                      required
                      value={formData.parentPhone}
                      onChange={handleChange}
                      placeholder="9876543211"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Relationship</label>
                    <select
                      name="parentRelationship"
                      value={formData.parentRelationship}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div>
                    {!isEditMode ? (
                      <>
                        <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Parent Password</label>
                        <input
                          type="text"
                          name="parentPassword"
                          required
                          value={formData.parentPassword}
                          onChange={handleChange}
                          placeholder="e.g. 123456"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 focus:outline-none transition-colors"
                        />
                      </>
                    ) : (
                      <>
                        <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Parent Password</label>
                        <input
                          type="text"
                          disabled
                          value="••••••••"
                          className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-slate-400 focus:outline-none cursor-not-allowed"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wider text-[9px] font-bold text-slate-600">Parent Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'parentImage')}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    {formData.parentImage ? (
                      <img src={formData.parentImage} alt="Parent Preview" className="h-10 w-10 object-cover rounded-full border border-slate-200" />
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">No parent photo uploaded</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Registering Student & Parent...') : (isEditMode ? 'Save Changes' : 'Register Student & Parent')}
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
