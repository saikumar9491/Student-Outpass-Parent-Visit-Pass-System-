import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Phone, Hash, BookOpen, Calendar, Home, CheckCircle2, ArrowLeft } from 'lucide-react';

const StudentRegister = () => {
  const { registerStudent, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    studentId: '',
    department: '',
    year: '',
    hostel: '',
    roomNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'student') navigate('/student');
      else if (user.role === 'parent') navigate('/parent');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check all fields
    const { name, email, password, phone, studentId, department, year, hostel, roomNumber } = formData;
    if (!name || !email || !password || !phone || !studentId || !department || !year || !hostel || !roomNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    const result = await registerStudent(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Registered student profile successfully!');
      navigate('/student');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex items-center justify-center px-6 py-12 relative font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl -z-10"></div>

      {/* Back to Login Link */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 text-xs text-slate-600 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>

      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="https://www.rgukt.in/assets/media/logos/rgukt.png" alt="RGUT Logo" className="h-12 w-12 object-contain mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Create Student Profile</h2>
          <p className="text-slate-600 text-xs mt-2 font-sans">Register as a hosteler to apply for outpasses digitally</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@rgut.ac.in"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Roll / Student ID</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. CS202604"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Department</label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 focus:outline-none transition-colors appearance-none"
                >
                  <option value="" disabled className="text-slate-600">Select Department</option>
                  <option value="Computer Science">Computer Science & Eng</option>
                  <option value="Electronics & Comm">Electronics & Comm Eng</option>
                  <option value="Mechanical Eng">Mechanical Eng</option>
                  <option value="Information Tech">Information Tech</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="BioTech">BioTechnology</option>
                </select>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Year of Study</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <select
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 focus:outline-none transition-colors appearance-none"
                >
                  <option value="" disabled className="text-slate-600">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            {/* Hostel */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Hostel Block</label>
              <div className="relative">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <select
                  name="hostel"
                  required
                  value={formData.hostel}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 focus:outline-none transition-colors appearance-none"
                >
                  <option value="" disabled className="text-slate-600">Select Hostel Block</option>
                  <option value="Kaveri Boys Hostel">Kaveri Boys Hostel</option>
                  <option value="Ganga Boys Hostel">Ganga Boys Hostel</option>
                  <option value="Yamuna Girls Hostel">Yamuna Girls Hostel</option>
                  <option value="Saraswati Girls Hostel">Saraswati Girls Hostel</option>
                </select>
              </div>
            </div>

            {/* Room Number */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Room Number</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  name="roomNumber"
                  required
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g. 302-A"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-98 disabled:opacity-50 mt-4"
          >
            <CheckCircle2 className="h-4.5 w-4.5" /> {isSubmitting ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-200">
          <span className="text-xs text-slate-500">Already registered?</span>
          <Link
            to="/login"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 ml-1.5 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
