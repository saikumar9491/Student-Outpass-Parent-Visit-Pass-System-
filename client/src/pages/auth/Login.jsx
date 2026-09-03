import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Compass, Users, Shield, Mail, Lock, LogIn, ArrowLeft, GraduationCap, Hash, KeyRound } from 'lucide-react';

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

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter login credentials and password');
      return;
    }

    if (activeTab === 'student' && email.includes('@')) {
      toast.error('Please enter your Assigned Student Roll ID (e.g. 12612345), not your email address.');
      return;
    }

    if (activeTab === 'parent' && email.includes('@')) {
      toast.error('Please enter your Assigned Parent ID (e.g. PAR-123456), not your email address.');
      return;
    }

    setIsSubmitting(true);
    const isAdmin = activeTab === 'admin';
    const result = await login(email, password, isAdmin);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Logged in successfully!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex items-center justify-center px-6 py-12 relative font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl -z-10"></div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="https://www.rgukt.in/assets/media/logos/rgukt.png" alt="RGUT Logo" className="h-12 w-12 object-contain mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign In to Hostel Portal</h2>
          <p className="text-slate-500 text-xs mt-2">Manage outpasses and parent visit permits</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-6">
          <button
            onClick={() => handleTabSwitch('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" /> Student
          </button>
          <button
            onClick={() => handleTabSwitch('parent')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'parent'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Parent
          </button>
          <button
            onClick={() => handleTabSwitch('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {activeTab === 'student' 
                  ? 'Assigned Student / Roll ID' 
                  : activeTab === 'parent'
                    ? 'Assigned Parent ID'
                    : 'Admin Email or ID'}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeTab === 'student' 
                  ? '8-Digit Roll No' 
                  : activeTab === 'parent'
                    ? 'PAR-XXXXXX'
                    : 'admin ID'}
              </span>
            </div>
            
            <div className="relative">
              {activeTab === 'student' ? (
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-blue-500" />
              ) : activeTab === 'parent' ? (
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-emerald-500" />
              ) : (
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-purple-500" />
              )}
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  activeTab === 'student'
                    ? 'e.g. 12612345'
                    : activeTab === 'parent'
                      ? 'e.g. PAR-123456'
                      : 'balisaikumar9491@gmail.com or 12322006'
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {activeTab === 'student' && 'Enter your unique University Roll ID provided by the administration.'}
              {activeTab === 'parent' && 'Enter your assigned Parent ID (starts with PAR-) given upon registration.'}
              {activeTab === 'admin' && 'Enter your registered administrator email address or numeric admin ID.'}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-md active:scale-98 disabled:opacity-50 cursor-pointer ${
              activeTab === 'student'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : activeTab === 'parent'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
            }`}
          >
            <LogIn className="h-4.5 w-4.5" /> {isSubmitting ? 'Verifying...' : `Sign In as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
