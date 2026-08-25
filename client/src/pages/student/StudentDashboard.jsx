import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { 
  Plus, Users, CheckCircle, XCircle, AlertCircle, Calendar, 
  ArrowRight, BookOpen, Lock, FileText, Award, Shield, Megaphone, Bell, QrCode, GraduationCap, History 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loading from '../../components/Loading';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'timetable' | 'exams'
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [visitRequests, setVisitRequests] = useState([]);

  const fetchData = async () => {
    try {
      const [profileRes, outpassesRes, visitsRes] = await Promise.all([
        API.get('/students/profile'),
        API.get('/outpasses/my'),
        API.get('/visit-passes/my').catch(() => ({ data: [] })) // Fallback if no endpoint
      ]);
      setProfile(profileRes.data);
      setOutpasses(outpassesRes.data);
      setVisitRequests(visitsRes.data || []);
    } catch (error) {
      console.error('Error fetching student dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to sidebar route parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['attendance', 'timetable', 'exams', 'notices', 'profile', 'active-outpass', 'visit-history'].includes(tab)) {
      if (['attendance', 'timetable', 'exams'].includes(tab)) {
        setActiveTab(tab);
      }
    }
    
    const changePassword = params.get('changePassword');
    if (changePassword === 'true') {
      setShowPasswordModal(true);
    }
  }, [location]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('All fields are required');
      return;
    }
    setIsChangingPassword(true);
    try {
      await API.put('/students/change-password', passwordData);
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
      navigate('/student'); // clear query param
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) return <Loading size="lg" />;

  // Calculate Metrics
  const totalRequests = outpasses.length;
  const pendingCount = outpasses.filter((o) => o.status === 'PENDING').length;
  const approvedCount = outpasses.filter((o) => o.status === 'APPROVED').length;
  const rejectedCount = outpasses.filter((o) => o.status === 'REJECTED').length;

  // Active outpass (APPROVED and expectedReturnDate in the future)
  const activeOutpass = outpasses.find(
    (o) => o.status === 'APPROVED' && new Date(o.expectedReturnDate) > new Date()
  );

  const recentOutpassesList = outpasses
    .map(o => ({
      _id: o._id,
      title: o.reason || 'Outing Permit',
      dateRange: `${new Date(o.outingDate).toLocaleDateString()} - ${new Date(o.expectedReturnDate).toLocaleDateString()}`,
      destination: o.destination || 'N/A',
      status: o.status
    }))
    .slice(0, 5);

  return (
    <div className="space-y-6 text-left">
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 font-display">Welcome back, {profile?.name || 'sai'} 👋</h1>
          <p className="text-slate-500 text-xs font-sans">Stay focused and make the most of your campus life.</p>
        </div>
        
        {/* Profile Card Header link */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-1.5 shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="Student Avatar" 
            className="h-7 w-7 rounded-full object-cover border border-slate-250"
          />
          <div className="text-left leading-tight">
            <span className="text-[10px] font-extrabold text-slate-800 block">{profile?.name} ({profile?.studentId || 'CSE123'})</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">1st Year, CSE</span>
          </div>
        </div>
      </div>

      {/* Metrics Row (5 columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Outpass */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[95px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Outpass Requests</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center"><FileText className="h-4 w-4" /></div>
          </div>
          <div className="mt-2">
            <h4 className="text-lg font-bold text-slate-805 leading-none">{totalRequests}</h4>
            <span className="text-[8px] text-slate-500 font-bold block mt-1">This Semester</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[95px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Pending Requests</span>
            <div className="h-7 w-7 rounded-lg bg-yellow-500/10 text-yellow-550 flex items-center justify-center"><Calendar className="h-4 w-4" /></div>
          </div>
          <div className="mt-2">
            <h4 className="text-lg font-bold text-yellow-550 leading-none">{pendingCount}</h4>
            <span className="text-[8px] text-yellow-605 font-bold block mt-1">Awaiting Approval</span>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[95px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Approved</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle className="h-4 w-4" /></div>
          </div>
          <div className="mt-2">
            <h4 className="text-lg font-bold text-emerald-500 leading-none">{approvedCount}</h4>
            <span className="text-[8px] text-emerald-500 font-bold block mt-1">This Semester</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[95px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Rejected</span>
            <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center"><XCircle className="h-4 w-4" /></div>
          </div>
          <div className="mt-2">
            <h4 className="text-lg font-bold text-red-500 leading-none">{rejectedCount}</h4>
            <span className="text-[8px] text-red-505 font-bold block mt-1">This Semester</span>
          </div>
        </div>

        {/* Active Outpass */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[95px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Outpass</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-650 flex items-center justify-center"><Shield className="h-4 w-4" /></div>
          </div>
          <div className="mt-2">
            <h4 className="text-lg font-bold text-purple-650 leading-none">{activeOutpass ? 1 : 0}</h4>
            <span className="text-[8px] text-slate-550 font-bold block mt-1">Currently Active</span>
          </div>
        </div>
      </div>

      {/* Middle Grid (Profile Info Card + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Left Column: Student Details Card (span 6) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80" 
            alt="Student Details Photo" 
            className="h-28 w-28 rounded-2xl object-cover border border-slate-200 shadow"
          />
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-base font-extrabold text-slate-800 font-display">{profile?.name || 'sai'}</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-lg font-mono uppercase tracking-wider inline-block">
                {profile?.studentId || 'CSE123'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-[10px] text-slate-500 font-bold leading-none">
              <p>Roll Number: <span className="text-slate-800 font-mono">{profile?.studentId || 'CSE123'}</span></p>
              <p>Branch: <span className="text-slate-800">{profile?.department || 'Computer Science Engineering'}</span></p>
              <p>Year: <span className="text-slate-800">{profile?.year || '1st Year'}</span></p>
              <p>Hostel & Room: <span className="text-slate-800">{profile?.hostel} - Room {profile?.roomNumber}</span></p>
              <p className="sm:col-span-2 truncate">Email: <span className="text-slate-800 font-medium font-mono">{profile?.email || 'sai.cse123@rgut.ac.in'}</span></p>
              <p className="sm:col-span-2">Mobile: <span className="text-slate-800 font-mono">{profile?.phone || '7981234567'}</span></p>
            </div>
          </div>
          
          {/* Subtle background SVG graphics */}
          <div className="absolute right-0 bottom-0 opacity-10 select-none pointer-events-none">
            <GraduationCap className="h-32 w-32 translate-x-4 translate-y-4 text-slate-400" />
          </div>
        </div>

        {/* Right Column: Quick Actions Grid (span 4) */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-3">
          {/* Action 1: Apply Outpass */}
          <div 
            onClick={() => navigate('/student/apply')}
            className="bg-white border border-slate-200 rounded-2xl p-4 text-center flex flex-col justify-between items-center hover:border-blue-500 hover:shadow transition-all cursor-pointer group h-full"
          >
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div className="my-2">
              <h4 className="text-[10px] font-extrabold text-slate-850 leading-none">Apply Outpass</h4>
              <p className="text-[8px] text-slate-450 font-bold mt-1 leading-normal font-sans">Request a new outing permit.</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-blue-650 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Action 2: My Outpasses */}
          <div 
            onClick={() => navigate('/student/history')}
            className="bg-white border border-slate-200 rounded-2xl p-4 text-center flex flex-col justify-between items-center hover:border-emerald-500 hover:shadow transition-all cursor-pointer group h-full"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div className="my-2">
              <h4 className="text-[10px] font-extrabold text-slate-850 leading-none">My Outpasses</h4>
              <p className="text-[8px] text-slate-450 font-bold mt-1 leading-normal font-sans">View all outing history logs.</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Action 3: Active Outpass */}
          <div 
            onClick={() => {
              if (activeOutpass) navigate(`/student/outpass/${activeOutpass._id}`);
              else toast.error('No active outpass available');
            }}
            className="bg-white border border-slate-200 rounded-2xl p-4 text-center flex flex-col justify-between items-center hover:border-purple-500 hover:shadow transition-all cursor-pointer group h-full"
          >
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-650 flex items-center justify-center">
              <QrCode className="h-4.5 w-4.5" />
            </div>
            <div className="my-2">
              <h4 className="text-[10px] font-extrabold text-slate-850 leading-none">Active Outpass</h4>
              <p className="text-[8px] text-slate-455 font-bold mt-1 leading-normal font-sans">View active permit details.</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-purple-650 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Row 3 Layout Widgets (Academic Overview, Recent requests list, Active Outpass/Notices) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Academic Overview card (span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5"><BookOpen className="h-4.5 w-4.5 text-blue-600" /> Academic Overview</h3>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-[10px] font-bold">
            {['attendance', 'timetable', 'exams'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-2.5 px-0.5 capitalize transition-colors relative cursor-pointer ${
                  activeTab === t ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Attendance tab content */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                {/* Circle Ring */}
                <div className="relative h-24 w-24 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" stroke="#e2e8f0" strokeWidth="6.5" fill="transparent" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="38" 
                      stroke="#10b981" 
                      strokeWidth="6.5" 
                      fill="transparent" 
                      strokeDasharray={238}
                      strokeDashoffset={238 - (238 * 87.5) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-extrabold text-slate-800 leading-none">87.5%</span>
                    <span className="text-[7.5px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Attendance</span>
                  </div>
                </div>

                {/* Legends */}
                <div className="flex-1 space-y-1.5 text-[9px] font-bold text-slate-500 w-full">
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Present</span> <span className="text-slate-800">87.5%</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Absent</span> <span className="text-slate-800">8.5%</span></div>
                  <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span> Leave</span> <span className="text-slate-800">4.0%</span></div>
                </div>
              </div>

              {/* Sub Metrics list */}
              <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                <div>
                  <span className="block text-slate-400 font-sans uppercase">Total Classes</span>
                  <span className="text-slate-800 font-mono block mt-0.5">104</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-sans uppercase">Attended</span>
                  <span className="text-slate-850 font-mono block mt-0.5">91</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-sans uppercase">Missed</span>
                  <span className="text-red-500 font-mono block mt-0.5">9</span>
                </div>
              </div>

              <button className="w-full py-2 bg-slate-50 border border-slate-200 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-0.5 cursor-pointer">
                View Detailed Attendance <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Timetable Tab content */}
          {activeTab === 'timetable' && (
            <div className="space-y-2 text-[9px] font-bold text-slate-650">
              {[
                { time: '09:00 AM - 10:00 AM', subject: 'Data Structures', room: 'B-204' },
                { time: '10:15 AM - 11:15 AM', subject: 'Mathematics', room: 'B-102' },
                { time: '11:30 AM - 12:30 PM', subject: 'Physics', room: 'B-301' }
              ].map((slot, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-xl">
                  <span>{slot.time}</span>
                  <span className="text-slate-850 font-bold">{slot.subject}</span>
                  <span className="text-[8px] bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm font-mono">{slot.room}</span>
                </div>
              ))}
            </div>
          )}

          {/* Exams Tab content */}
          {activeTab === 'exams' && (
            <div className="space-y-2 text-[9px] font-bold text-slate-650">
              {[
                { name: 'Midterm Assessment 1', score: '85/100', grade: 'A' },
                { name: 'Midterm Assessment 2', score: '88/100', grade: 'A' }
              ].map((exam, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="text-slate-800">{exam.name}</span>
                  <span className="font-mono">{exam.score}</span>
                  <span className="text-emerald-500 font-extrabold">{exam.grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Outpass Requests (span 4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5"><History className="h-4.5 w-4.5 text-blue-600" /> Recent Outpass Requests</h3>
            <span onClick={() => navigate('/student/history')} className="text-[9px] text-blue-600 font-bold hover:underline cursor-pointer">View All</span>
          </div>

          <div className="space-y-3 text-left">
            {recentOutpassesList.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">No outing requests logged.</p>
            ) : (
              recentOutpassesList.map((item, idx) => (
                <div 
                  key={item._id} 
                  onClick={() => navigate(`/student/outpass/${item._id}`)}
                  className="flex justify-between items-center border-b border-slate-50 pb-2.5 last:border-0 last:pb-0 hover:bg-slate-50/55 p-1 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="text-[10px] space-y-0.5 leading-normal truncate max-w-[170px]">
                    <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                    <p className="text-slate-500 font-sans">{item.dateRange}</p>
                    <span className="text-[8px] text-slate-400 font-bold block pt-0.5">{item.destination}</span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Outpass + Notices widgets (span 3) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Active Outpass Widget */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 text-center">
            <h3 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5 text-left border-b border-slate-100 pb-2">
              <Shield className="h-4.5 w-4.5 text-blue-600" /> Active Outpass
            </h3>
            
            {activeOutpass ? (
              <div className="space-y-3 text-left">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[10px] font-bold text-slate-700">
                  <p>Destination: <span className="text-slate-850 font-extrabold">{activeOutpass.destination}</span></p>
                  <p>Return by: <span className="text-slate-850 font-extrabold font-mono">{new Date(activeOutpass.expectedReturnDate).toLocaleDateString()}</span></p>
                </div>
                <button 
                  onClick={() => navigate(`/student/outpass/${activeOutpass._id}`)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl text-[10px] font-bold shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1"
                >
                  View Digital Pass <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 py-2">
                <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-[9px] text-slate-500 leading-normal font-sans">You don't have any active outpass. Apply for a new outpass to get started.</p>
                <button 
                  onClick={() => navigate('/student/apply')}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                >
                  Apply Outpass
                </button>
              </div>
            )}
          </div>

          {/* Notices Widget */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5">
                <Megaphone className="h-4.5 w-4.5 text-blue-600" /> Notices
              </h3>
              <span className="text-[9px] text-blue-600 font-bold cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-3 text-left">
              {[
                { title: 'College Annual Day on 15th May 2024', time: '2 hours ago' },
                { title: 'Hostel maintenance on 18th May', time: '5 hours ago' },
                { title: 'New mess timings from next week', time: '1 day ago' }
              ].map((ann, idx) => (
                <div key={idx} className="flex gap-2.5 items-start border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                  <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-605 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[9px] space-y-0.5 leading-normal">
                    <h4 className="font-bold text-slate-800">{ann.title}</h4>
                    <span className="text-[8px] text-slate-400 font-bold block">{ann.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" /> Update Password
            </h3>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              To secure your student account, please change your temporary password to a strong personal password.
            </p>
            <form onSubmit={handlePasswordChange} className="space-y-4 font-semibold text-slate-500 text-xs">
              <div>
                <label className="text-[9px] font-bold uppercase block mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase block mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 border border-slate-250 focus:border-blue-500 rounded-xl py-2 px-3 text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    navigate('/student'); // clear query param
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-650 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
