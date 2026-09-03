import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'warden') navigate('/admin');
      else if (user.role === 'student') navigate('/student');
      else if (user.role === 'parent') navigate('/parent');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password) {
      toast.error('Please enter your User ID and password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginId.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Logged in successfully!');
      // Route based on authenticated role
      if (result.role === 'admin' || result.role === 'warden') {
        navigate('/admin');
      } else if (result.role === 'student') {
        navigate('/student');
      } else if (result.role === 'parent') {
        navigate('/parent');
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center px-6 py-12 relative font-sans">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        {/* University Header */}
        <div className="text-center space-y-1">
          <img 
            src="https://www.rgukt.in/assets/media/logos/rgukt.png" 
            alt="RGUT Logo" 
            className="h-14 w-14 object-contain mx-auto mb-3" 
          />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Sign In
          </h2>
          <p className="text-slate-500 text-xs font-medium">
            rajiv-gandhi-university
          </p>
        </div>

        {/* Unified Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[10px]">
              User ID
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your User ID"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[10px]">
              Password
            </label>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
          >
            <LogIn className="h-4.5 w-4.5" /> {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Security / Help Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Role & dashboard are automatically identified upon login.</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
