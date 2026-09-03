import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, ClipboardList, Scan, Users, 
  Send, History, FilePlus, BookOpen, Calendar, Award, Bell, 
  User, Lock, HelpCircle, GraduationCap, Shield, Settings, Activity, Megaphone, Building 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const renderAdminLinks = () => {
    return (
      <div className="space-y-5">
        {/* Main */}
        <div className="space-y-1">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Main</span>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive && !location.search
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/outpasses"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <FileText className="h-4 w-4" />
            <span>Outpass Requests</span>
          </NavLink>

          <NavLink
            to="/admin/visit-passes"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <ClipboardList className="h-4 w-4" />
            <span>Visit Pass Requests</span>
          </NavLink>

          <NavLink
            to="/admin/active-passes"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <Shield className="h-4 w-4" />
            <span>Active Passes</span>
          </NavLink>

          <NavLink
            to="/verify-pass"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <Scan className="h-4 w-4" />
            <span>Pass Verification</span>
          </NavLink>
        </div>

        {/* Management */}
        <div className="space-y-1">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Management</span>
          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <Users className="h-4 w-4" />
            <span>Students</span>
          </NavLink>

          <NavLink
            to="/admin/hostel-blocks"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive || location.search.includes('tab=hostel-blocks')
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <Building className="h-4 w-4" />
            <span>Hostel Blocks</span>
          </NavLink>

          <NavLink
            to="/admin/users-roles"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive || location.search.includes('tab=users-roles')
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <Shield className="h-4 w-4" />
            <span>Users & Roles</span>
          </NavLink>
        </div>

        {/* Academics */}
        <div className="space-y-1">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Academics</span>
          {[
            { id: 'attendance', name: 'Attendance', icon: BookOpen },
            { id: 'timetable', name: 'Timetable', icon: Calendar },
            { id: 'exams-results', name: 'Exams & Results', icon: Award }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.search.includes(`tab=${item.id}`);
            return (
              <NavLink
                key={item.id}
                to={`/admin?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Communication */}
        <div className="space-y-1">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Communication</span>
          <NavLink
            to="/admin?tab=notices"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              location.search.includes('tab=notices')
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Notices</span>
          </NavLink>
          <NavLink
            to="/admin?tab=notifications"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              location.search.includes('tab=notifications')
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </NavLink>
        </div>

        {/* System */}
        <div className="space-y-1">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">System</span>
          <NavLink
            to="/admin?tab=settings"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              location.search.includes('tab=settings')
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
          <NavLink
            to="/admin?tab=activity-logs"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              location.search.includes('tab=activity-logs')
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Activity Logs</span>
          </NavLink>
        </div>
      </div>
    );
  };

  const renderStudentLinks = () => {
    return (
      <div className="space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive && !location.search
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/student/apply"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <Send className="h-4.5 w-4.5" />
            <span>Apply Outpass</span>
          </NavLink>

          <NavLink
            to="/student/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <History className="h-4.5 w-4.5" />
            <span>My Outpasses</span>
          </NavLink>


          <NavLink
            to="/student/visit-history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span>Visit Pass History</span>
          </NavLink>
        </div>

        {/* Academic */}
        <div className="space-y-1.5">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Academic</span>
          {[
            { id: 'attendance', name: 'Attendance', icon: BookOpen },
            { id: 'timetable', name: 'Timetable', icon: Calendar },
            { id: 'exams', name: 'Exams & Results', icon: Award },
            { id: 'notices', name: 'Notices', icon: Bell }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.search.includes(`tab=${item.id}`);
            return (
              <NavLink
                key={item.id}
                to={`/student?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Account */}
        <div className="space-y-1.5">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Account</span>
          {[
            { id: 'profile', name: 'Profile', icon: User },
            { id: 'change-password', name: 'Change Password', icon: Lock, path: '/student?changePassword=true' }
          ].map((item) => {
            const Icon = item.icon;
            const targetPath = item.path || `/student?tab=${item.id}`;
            const isActive = location.search.includes(`tab=${item.id}`) || (item.id === 'change-password' && location.search.includes('changePassword=true'));
            return (
              <NavLink
                key={item.id}
                to={targetPath}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  const renderParentLinks = () => {
    return (
      <div className="space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          <NavLink
            to="/parent"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive && !location.search
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/parent/request"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <FilePlus className="h-4.5 w-4.5" />
            <span>Request Visit Pass</span>
          </NavLink>

          <NavLink
            to="/parent/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <History className="h-4.5 w-4.5" />
            <span>Visit Requests</span>
          </NavLink>
        </div>

        {/* Academic Records */}
        <div className="space-y-1.5">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Academic Records</span>
          {[
            { id: 'attendance', name: 'Attendance', icon: BookOpen },
            { id: 'timetable', name: 'Timetable', icon: Calendar },
            { id: 'exams', name: 'Exams & Grades', icon: Award },
            { id: 'notices', name: 'Notices', icon: Bell }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.search.includes(`tab=${item.id}`);
            return (
              <NavLink
                key={item.id}
                to={`/parent?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Other */}
        <div className="space-y-1.5">
          <span className="px-4 text-[9px] font-bold text-slate-550 uppercase tracking-wider block">Other</span>
          {[
            { id: 'profile', name: 'Profile', icon: User },
            { id: 'children', name: 'Linked Children', icon: Users },
            { id: 'change-password', name: 'Change Password', icon: Lock, path: '/parent?changePassword=true' },
            { id: 'support', name: 'Support', icon: HelpCircle }
          ].map((item) => {
            const Icon = item.icon;
            const targetPath = item.path || `/parent?tab=${item.id}`;
            const isActive = location.search.includes(`tab=${item.id}`) || (item.id === 'change-password' && location.search.includes('changePassword=true'));
            return (
              <NavLink
                key={item.id}
                to={targetPath}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  const links = {
    student: [
      { path: '/student', name: 'Dashboard', icon: LayoutDashboard },
      { path: '/student/apply', name: 'Apply Outpass', icon: Send },
      { path: '/student/history', name: 'My Outpasses', icon: History }
    ]
  };

  const currentLinks = links[user.role] || [];

  return (
    <aside className="no-print w-64 bg-[#110e2c] border-r border-slate-900 flex flex-col h-screen sticky top-0 flex-shrink-0 text-slate-300 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-850">
        <img 
          src="https://www.rgukt.in/assets/media/logos/rgukt.png" 
          alt="RGUT Logo" 
          className="h-8 w-8 object-contain" 
        />
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-extrabold text-white tracking-tight leading-tight font-display uppercase">Rajiv Gandhi University of Technology</span>
          <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Hostel Pass System</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto text-left">
        {user.role === 'parent' ? (
          renderParentLinks()
        ) : user.role === 'admin' ? (
          renderAdminLinks()
        ) : user.role === 'student' ? (
          renderStudentLinks()
        ) : (
          <div className="space-y-1">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/admin' || link.path === '/student'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/15'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Vector Illustration Card Footer */}
      <div className="p-4 border-t border-slate-850">
        {user.role === 'student' ? (
          <div className="bg-[#1b173e] p-4 rounded-2xl relative overflow-hidden text-center space-y-2 border border-slate-800">
            <div className="h-10 flex items-center justify-center text-blue-405">
              <HelpCircle className="h-8 w-8 opacity-80" />
            </div>
            <h4 className="text-[10px] font-bold text-white leading-normal font-display">Need Help?</h4>
            <p className="text-[8px] text-slate-400 font-sans leading-normal">Contact hostel warden or admin for assistance.</p>
            <button className="w-full mt-1.5 py-1 bg-white text-[#110e2c] rounded-lg text-[9px] font-bold hover:bg-slate-100 transition-colors shadow cursor-pointer">
              Contact Support
            </button>
          </div>
        ) : (
          <div className="bg-[#1b173e] p-4 rounded-2xl relative overflow-hidden text-center space-y-2 border border-slate-800">
            <div className="h-12 flex items-center justify-center text-indigo-400">
              <GraduationCap className="h-10 w-10 opacity-80" />
            </div>
            <h4 className="text-[10px] font-bold text-white leading-normal font-display">
              {user.role === 'admin' ? 'Secure Campus,\nSmart Management 💜' : 'Building Futures,\nTogether ❤️'}
            </h4>
            <span className="text-[8px] text-slate-500 font-bold block">Rajiv Gandhi University of Technology Hostels v1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
