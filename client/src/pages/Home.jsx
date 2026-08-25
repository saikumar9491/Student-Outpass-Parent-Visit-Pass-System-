import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Clock, QrCode, ArrowRight, BookOpen, Compass, CheckCircle } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const handlePortalClick = (role) => {
    navigate('/login', { state: { initialTab: role } });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header/Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img src="https://www.rgukt.in/assets/media/logos/rgukt.png" alt="RGUT Logo" className="h-9 w-9 object-contain" />
          <span className="text-md font-bold tracking-wide text-slate-850">Rajiv Gandhi University of Technology Hostels</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-white hover:bg-white border border-slate-200 transition-all active:scale-95"
        >
          Portal Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto text-center overflow-hidden">
          {/* Subtle light blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] mb-6">
            Smart Hostel Outpass & Parent Visit System
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Manage student outings and parent hostel visits securely, quickly and digitally. Replace paper slips with secure QR-verified digital passes.
          </p>

          {/* CTA Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {/* Student Card */}
            <div 
              onClick={() => handlePortalClick('student')}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-blue-500/40 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 text-left relative overflow-hidden"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 mb-2">Student Portal</h3>
              <p className="text-sm text-slate-600 mb-6">Apply for outpass, track approvals, and generate your secure QR code for gate clearance.</p>
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-300">
                Access Student Portal <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Parent Card */}
            <div 
              onClick={() => handlePortalClick('parent')}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-blue-500/40 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 text-left relative overflow-hidden"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 mb-2">Parent / Visitor Portal</h3>
              <p className="text-sm text-slate-600 mb-6">Link with your child and request hostel visit credentials. Verify your check-in dates.</p>
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-300">
                Access Parent Portal <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Admin Card */}
            <div 
              onClick={() => handlePortalClick('admin')}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-blue-500/40 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 text-left relative overflow-hidden"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 mb-2">Hostel Admin Portal</h3>
              <p className="text-sm text-slate-600 mb-6">Review requests, check dashboard analytics, approve/reject passes, and audit users.</p>
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 group-hover:translate-x-1.5 transition-transform duration-300">
                Access Admin Portal <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-slate-50 border-y border-slate-200 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Securing Student & Hostels Outings</h2>
              <p className="text-slate-600 max-w-xl mx-auto">Our modern pass system implements key security checks, auto-expirations, and quick scan modules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-md font-bold text-slate-750 mb-2">Overlap Protection</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Students cannot register multiple overlapping passes, keeping registers tidy and accountability high.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-md font-bold text-slate-750 mb-2">Minimal Opaque QR Payloads</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">QR payload contains no names or sensitive information, only an opaque crypto-hashed reference. Safe from scrapers.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-md font-bold text-slate-750 mb-2">Lazy Pass Expiration</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Passes automatically switch status to expired when duration dates lapse, ensuring logs stay accurate without heavy cron scheduling.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-md font-bold text-slate-750 mb-2">Security Scanning Interface</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Security guards can enter IDs or scan codes directly to fetch status verification in real-time, validation speeds up checks.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Rajiv Gandhi University of Technology Administration. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
