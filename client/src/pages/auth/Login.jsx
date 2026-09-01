import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Compass, Users, Shield, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs: 'student' | 'parent' | 'admin'
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'student') navigate('/student');
      else if (user.role === 'parent') navigate('/parent');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter login credentials and password');
      return;
    }

    setIsSubmitting(true);
    const isAdmin = activeTab === 'admin';
    const result = await login(email, password, isAdmin);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Logged in successfully!');
      // Redirection is handled by the useEffect above
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex items-center justify-center px-6 py-12 relative font-sans">
      {/* Light Blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl -z-10"></div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-xs text-slate-600 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="https://www.rgukt.in/assets/media/logos/rgukt.png" alt="RGUT Logo" className="h-12 w-12 object-contain mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign In to Hostel Portal</h2>
          <p className="text-slate-600 text-xs mt-2">Manage outpasses and parent visit permits</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'student'
                ? 'bg-[#3b82f6] hover:bg-[#1d4ed8] text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" /> Student
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'parent'
                ? 'bg-[#3b82f6] hover:bg-[#1d4ed8] text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Parent
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-[#3b82f6] hover:bg-[#1d4ed8] text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              {activeTab === 'parent' 
                ? 'Parent ID or Email Address' 
                : activeTab === 'student'
                  ? 'Roll ID or Email Address'
                  : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  activeTab === 'parent' 
                    ? 'PAR-XXXXXX or parent@example.com' 
                    : activeTab === 'student'
                      ? 'e.g. 12622006 or student@example.edu'
                      : 'email@example.edu'
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#3b82f6] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-98 disabled:opacity-50"
          >
            <LogIn className="h-4.5 w-4.5" /> {isSubmitting ? 'Logging in...' : 'Sign In'}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
