import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, Menu, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="no-print bg-slate-50 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Menu Toggle / Hamburger + Optional Admin Search */}
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 bg-white border border-slate-200 rounded-full text-slate-700 shadow-sm hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer">
          <Menu className="h-4.5 w-4.5" />
        </button>

        {user.role === 'admin' && (
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students, parents, passes..." 
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-450 focus:outline-none transition-colors shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* Vertical Divider */}
        <span className="h-6 w-[1px] bg-slate-250"></span>

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-extrabold text-slate-800 leading-tight font-display">{user.name}</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">{user.role === 'admin' ? 'Super Admin' : user.role}</span>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="User Avatar"
            className="h-8 w-8 rounded-full object-cover border border-slate-250 shadow-sm"
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
