import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { 
  Plus, Users, CheckCircle, XCircle, AlertCircle, Calendar, 
  ArrowRight, UserCheck, BookOpen, Lock, FileText, Award, FilePlus, History 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [visitRequests, setVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Child data states
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);
  const [loadingChild, setLoadingChild] = useState(false);
  const [activeChildTab, setActiveChildTab] = useState('attendance'); // 'attendance' | 'timetable' | 'exams' | 'notices'

  const fetchData = async () => {
    try {
      const [profileRes, visitsRes] = await Promise.all([
        API.get('/parents/profile'),
        API.get('/visit-passes/my')
      ]);
      setProfile(profileRes.data);
      setVisitRequests(visitsRes.data);
      
      const childrenList = profileRes.data.studentIds || [];
      if (childrenList.length > 0 && !selectedChild) {
        setSelectedChild(childrenList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching parent dashboard data:', error);
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
    if (tab && ['attendance', 'timetable', 'exams', 'notices'].includes(tab)) {
      setActiveChildTab(tab);
    }
    
    const changePassword = params.get('changePassword');
    if (changePassword === 'true') {
      setShowPasswordModal(true);
    }
  }, [location]);

  // Fetch child college data when selectedChild changes
  useEffect(() => {
    const fetchChildData = async () => {
      if (!selectedChild) return;
      setLoadingChild(true);
      try {
        const res = await API.get(`/parents/child-data/${selectedChild}`);
        setChildData(res.data);
      } catch (err) {
        console.error('Error fetching child college records:', err);
        toast.error('Failed to load child college records');
      } finally {
        setLoadingChild(false);
      }
    };
    fetchChildData();
  }, [selectedChild]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('All fields are required');
      return;
    }
    setIsChangingPassword(true);
    try {
      await API.put('/parents/change-password', passwordData);
      toast.success('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
      fetchData(); // reload profile to clear flag
      navigate('/parent'); // clear query param
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // Metrics
  const totalRequests = visitRequests.length;
  const pendingCount = visitRequests.filter(v => v.status === 'PENDING').length;
  const approvedCount = visitRequests.filter(v => v.status === 'APPROVED').length;

  const children = profile?.studentIds || [];
  const activeChild = children.find(c => c._id === selectedChild) || children[0] || {};

  return (
    <div className="space-y-6 text-left">
      {/* Password Reset Alert Banner */}
      {profile?.needsPasswordChange && (
        <div className="bg-yellow-950/10 border border-yellow-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-yellow-550 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-800">Temporary Password Alert</p>
              <p className="mt-0.5 font-sans">This is your first login. For security purposes, please update your temporary password immediately.</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Change Password
          </button>
        </div>
      )}

      {/* Welcome Greeting Banner (Violet Purple Gradient) */}
      <div className="bg-gradient-to-r from-[#4d3efb] to-[#7f00ff] rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white shadow-xl">
        <div className="space-y-1">
          <span className="text-sm font-semibold opacity-90">Welcome back,</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">{profile?.name || 'bali saikumar'} 👋</h1>
          <p className="text-xs opacity-80 font-sans">Stay updated with your child's campus life.</p>
        </div>

        {/* Parent ID Card */}
        <div className="bg-slate-950/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[200px] flex items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">Parent ID</span>
            <p className="text-sm font-bold font-mono tracking-wide">{profile?.parentId || 'PAR-983413'}</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-350 text-[9px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Verified Parent
          </span>
        </div>
      </div>

      {/* Metrics Cards Grid (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Overall Attendance</span>
            <h4 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">87.5%</h4>
            <span className="text-[9px] text-emerald-500 font-bold mt-0.5 block font-sans">This Month ↑ 5.2%</span>
          </div>
        </div>

        {/* Classes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Classes Attended</span>
            <h4 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">91</h4>
            <span className="text-[9px] text-slate-450 font-bold mt-0.5 block font-sans">Out of 104</span>
          </div>
        </div>

        {/* Visits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-550 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Visit Requests</span>
            <h4 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{totalRequests}</h4>
            <span className="text-[9px] text-yellow-600 font-bold mt-0.5 block font-sans">{pendingCount} Pending</span>
          </div>
        </div>

        {/* Exams */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-650 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Exams Average</span>
            <h4 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">82.4%</h4>
            <span className="text-[9px] text-emerald-500 font-bold mt-0.5 block font-sans">Good Performance</span>
          </div>
        </div>
      </div>

      {/* Middle Layout Row (Student profile + two quick actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Student Profile Card (span 2) */}
        {children.length > 0 && (
          <div className="lg:col-span-2 bg-gradient-to-br from-[#0e0c33] to-[#1a154d] text-white border border-slate-900 rounded-3xl p-5 flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80" 
                alt="Student Profile" 
                className="h-16 w-16 rounded-2xl object-cover border-2 border-blue-500 shadow-lg"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-wide font-display">{activeChild.name || 'sai'}</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 text-[8px] font-bold rounded uppercase tracking-wider">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-400 font-medium">
                  <p>Roll: <span className="text-slate-200 font-bold font-mono">{activeChild.studentId || 'cse123'}</span></p>
                  <p>Room: <span className="text-slate-200 font-bold">{activeChild.roomNumber ? `Rm ${activeChild.roomNumber}` : 'b6 - Rm 103'}</span></p>
                  <p>Branch: <span className="text-slate-200 font-bold">{activeChild.department || 'CSE'}</span></p>
                  <p>Year: <span className="text-slate-200 font-bold">{activeChild.year || '1st Year'}</span></p>
                  <p className="col-span-2 truncate">Hostel: <span className="text-slate-200 font-bold">{activeChild.hostel || 'Block B'}</span></p>
                  <p className="col-span-2">Mobile: <span className="text-slate-200 font-bold">{activeChild.phone || '7981234567'}</span></p>
                </div>
              </div>
            </div>
            
            {/* Chevron Right indicator */}
            <div className="h-8 w-8 rounded-full bg-slate-800/40 border border-slate-800 flex items-center justify-center text-slate-400">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Quick Action 1: Request Visit Pass */}
        <div className="bg-gradient-to-br from-[#1070ff] to-[#10a5ff] text-white rounded-3xl p-5 flex flex-col justify-between shadow-lg h-44 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-white/10 rounded-full blur-xl translate-x-2 -translate-y-2"></div>
          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
            <FilePlus className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm font-display leading-tight">Request Visit Pass</h3>
            <p className="text-[10px] opacity-80 mt-1 leading-normal font-sans">Request a new visit pass to meet your child.</p>
          </div>
          <button 
            onClick={() => navigate('/parent/request')}
            className="w-full bg-white text-blue-650 hover:bg-slate-100 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 shadow transition-all duration-200 cursor-pointer"
          >
            Request Now <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Quick Action 2: Track Requests */}
        <div className="bg-gradient-to-br from-[#7f00ff] to-[#bd00ff] text-white rounded-3xl p-5 flex flex-col justify-between shadow-lg h-44 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-white/10 rounded-full blur-xl translate-x-2 -translate-y-2"></div>
          <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
            <History className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm font-display leading-tight">Track Requests</h3>
            <p className="text-[10px] opacity-80 mt-1 leading-normal font-sans">View all your visit pass requests and status.</p>
          </div>
          <button 
            onClick={() => navigate('/parent/history')}
            className="w-full bg-white text-purple-650 hover:bg-slate-100 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 shadow transition-all duration-200 cursor-pointer"
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Large Bottom Row Section (Tabs Academic Panel + Right Sidebar schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Academic Records Tabs Panel (span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Child's Academic Records
              </h2>
              <p className="text-slate-500 text-[10px] mt-0.5 font-sans">Track your child's academic performance and campus activities.</p>
            </div>
            
            {/* Child Selector dropdown */}
            <select
              value={selectedChild || ''}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="bg-slate-50 border border-slate-250 text-xs text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 font-bold cursor-pointer"
            >
              {children.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.studentId})</option>
              ))}
            </select>
          </div>

          {loadingChild ? (
            <div className="py-24 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : childData ? (
            <div className="space-y-6 flex-1">
              {/* Internal Tab Headers */}
              <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
                {[
                  { id: 'attendance', name: 'Attendance' },
                  { id: 'timetable', name: 'Timetable' },
                  { id: 'exams', name: 'Exams' },
                  { id: 'notices', name: 'Notices' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChildTab(tab.id)}
                    className={`pb-3 px-0.5 transition-colors relative cursor-pointer ${
                      activeChildTab === tab.id 
                        ? 'text-blue-600 border-b-2 border-blue-600 font-extrabold' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Attendance Tab Contents */}
              {activeChildTab === 'attendance' && (
                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ring Chart Widget */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center items-center text-center space-y-4">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Overall Attendance</span>
                      {/* SVG Circular Ring */}
                      <div className="relative h-28 w-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="45" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="45" 
                            stroke="#4d3efb" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={282}
                            strokeDashoffset={282 - (282 * 87.5) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-lg font-extrabold text-slate-800 leading-none">87.5%</span>
                          <span className="text-[8px] text-emerald-500 font-bold mt-1 uppercase tracking-wider">Good</span>
                        </div>
                      </div>
                      
                      {/* Statistics Legend */}
                      <div className="w-full grid grid-cols-3 gap-2 text-[9px] font-bold text-slate-500 border-t border-slate-200/60 pt-3">
                        <div>
                          <div className="flex items-center gap-1 justify-center"><span className="h-1.5 w-1.5 rounded-full bg-[#4d3efb]"></span> Present</div>
                          <span className="text-slate-800 font-mono mt-0.5 block">91 (87.5%)</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 justify-center"><span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Absent</div>
                          <span className="text-slate-800 font-mono mt-0.5 block">11 (10.6%)</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 justify-center"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span> Leaves</div>
                          <span className="text-slate-800 font-mono mt-0.5 block">2 (1.9%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Trend Line Chart (Center) */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2 text-center">Attendance Trend</span>
                      <div className="relative h-28 flex items-end justify-between px-1">
                        {/* Simulated Trend SVG */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 80" preserveAspectRatio="none">
                          <path 
                            d="M 5,60 Q 30,30 60,35 T 120,25 T 155,15" 
                            fill="none" 
                            stroke="#4d3efb" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                          />
                          <path 
                            d="M 5,60 Q 30,30 60,35 T 120,25 T 155,15 L 155,80 L 5,80 Z" 
                            fill="url(#trendGrad)" 
                            opacity="0.1"
                          />
                          <defs>
                            <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#4d3efb" />
                              <stop offset="100%" stopColor="#ffffff" />
                            </linearGradient>
                          </defs>
                          <circle cx="155" cy="15" r="3" fill="#4d3efb" />
                        </svg>
                        
                        {/* Y-axis badge overlay */}
                        <div className="absolute right-2 top-1.5 bg-[#4d3efb] text-white text-[7px] font-bold px-1 py-0.5 rounded leading-none">87.5%</div>
                      </div>
                      
                      {/* Months bottom line */}
                      <div className="w-full flex justify-between text-[8px] font-extrabold text-slate-400 pt-2 border-t border-slate-200/60 font-sans uppercase">
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span>Oct</span>
                        <span>Nov</span>
                        <span>Dec</span>
                      </div>
                    </div>

                    {/* Subject-Wise Attendance list */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-center space-y-3.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block text-center mb-1">Subject Wise Attendance</span>
                      <div className="space-y-2.5 text-[9px] font-bold text-slate-650">
                        {[
                          { name: 'Data Structures', percent: 92, color: 'bg-emerald-500' },
                          { name: 'Mathematics', percent: 85, color: 'bg-blue-500' },
                          { name: 'Physics', percent: 88, color: 'bg-indigo-500' },
                          { name: 'English', percent: 83, color: 'bg-yellow-500' },
                          { name: 'Environmental Science', percent: 89, color: 'bg-teal-500' }
                        ].map((sub, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center leading-none">
                              <span className="truncate pr-2">{sub.name}</span>
                              <span className="text-slate-800 font-bold font-mono">{sub.percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.percent}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveChildTab('timetable')}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    View Detailed Attendance <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Timetable Tab Contents */}
              {activeChildTab === 'timetable' && (
                <div className="space-y-3">
                  {childData.collegeData?.timetable?.map((daySlot, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <span className="text-xs font-bold text-slate-800 w-24">{daySlot.day}</span>
                      <div className="flex flex-wrap gap-1.5 flex-1 justify-end">
                        {daySlot.subjects.map((sub, sIdx) => (
                          <span key={sIdx} className="px-3 py-1 bg-white border border-slate-200 text-[10px] text-slate-600 font-bold rounded-lg shadow-sm">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Exams Tab Contents */}
              {activeChildTab === 'exams' && (
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                        <th className="px-5 py-3">Assessment Title</th>
                        <th className="px-5 py-3">Result Scores</th>
                        <th className="px-5 py-3 text-right">Grade Scale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {childData.collegeData?.examResults?.map((resItem, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 text-slate-650">
                          <td className="px-5 py-3.5 font-bold text-slate-800">{resItem.examName}</td>
                          <td className="px-5 py-3.5 font-mono font-bold">{resItem.marks}</td>
                          <td className="px-5 py-3.5 text-right text-emerald-500 font-bold">{resItem.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Notices Tab Contents */}
              {activeChildTab === 'notices' && (
                <div className="space-y-3.5">
                  {childData.collegeData?.notices?.map((notice, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-xs font-bold text-slate-800">{notice.title}</h4>
                        <span className="text-[9px] text-slate-500 font-bold flex-shrink-0">{new Date(notice.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed font-sans">{notice.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-16 text-center">No child details loaded.</p>
          )}

          {/* Footer Branding Info */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
              © {new Date().getFullYear()} Rajiv Gandhi University of Technology Hostel Pass System. All rights reserved.
            </span>
          </div>
        </div>

        {/* Right Side Column (Notifications + Quick schedule list) */}
        <div className="space-y-6">
          {/* Recent Notifications Widget */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 font-display">Recent Notifications</h3>
              <span className="text-[9px] text-blue-600 font-bold cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-4 text-left">
              {[
                { title: 'Visit pass approved for 12 May 2024', desc: 'Your visit request has been approved.', time: '2 hours ago', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
                { title: 'Internal assessment marks updated', desc: 'Mathematics - IA1 marks published.', time: '1 day ago', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
                { title: 'College notice', desc: 'Holiday on 15th May on account of...', time: '2 days ago', icon: AlertCircle, color: 'text-yellow-550 bg-yellow-500/10' }
              ].map((note, idx) => {
                const Icon = note.icon;
                return (
                  <div key={idx} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${note.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-[10px] space-y-0.5 leading-normal">
                      <h4 className="font-bold text-slate-800">{note.title}</h4>
                      <p className="text-slate-500 font-sans">{note.desc}</p>
                      <span className="text-[8px] text-slate-400 font-bold block pt-0.5">{note.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Timetable Schedule list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-800 font-display">Upcoming Timetable</h3>
              <span 
                onClick={() => setActiveChildTab('timetable')}
                className="text-[9px] text-blue-600 font-bold cursor-pointer hover:underline"
              >
                View Full
              </span>
            </div>

            <div className="space-y-3.5 text-left text-slate-650 font-bold text-[10px]">
              {[
                { subject: 'Data Structures', time: '9:00 AM - 10:00 AM', room: 'B-204', color: 'text-blue-500 bg-blue-500/10' },
                { subject: 'Mathematics', time: '10:15 AM - 11:15 AM', room: 'B-102', color: 'text-indigo-500 bg-indigo-500/10' },
                { subject: 'Physics', time: '11:30 AM - 12:30 PM', room: 'B-301', color: 'text-purple-550 bg-purple-500/10' }
              ].map((slot, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <div className="flex gap-2.5 items-center truncate">
                    <div className={`h-7.5 w-7.5 rounded-lg flex items-center justify-center flex-shrink-0 ${slot.color}`}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-slate-850 block font-bold leading-none">{slot.subject}</span>
                      <span className="text-[8px] text-slate-500 font-bold mt-1 block font-sans">{slot.time}</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-white border border-slate-200 text-slate-650 font-extrabold px-2 py-0.5 rounded-lg shadow-sm font-mono flex-shrink-0">
                    {slot.room}
                  </span>
                </div>
              ))}
              <span className="text-[8px] text-slate-400 font-bold text-center block pt-1 font-sans uppercase">Today, 10 May 2024</span>
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
              To secure your parent account, please change your temporary password to a strong personal password.
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
                {!profile?.needsPasswordChange && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      navigate('/parent'); // clear query param
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-650 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
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

export default ParentDashboard;
