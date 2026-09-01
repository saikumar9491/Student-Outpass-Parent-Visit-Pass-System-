import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut, Menu, Search, Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        const res = await updateProfileImage(base64String);
        setUploading(false);

        if (res.success) {
          toast.success('Profile picture updated successfully!', { id: toastId });
        } else {
          toast.error(res.message || 'Failed to update photo', { id: toastId });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setUploading(false);
      toast.error('Failed to read image file', { id: toastId });
    }
  };

  if (!user) return null;

  const avatarUrl = user.image || user.profile?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Admin')}&background=4f46e5&color=fff&bold=true&size=128`;

  return (
    <header className="no-print bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs transition-all">
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

        {/* Profile Card & Avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-extrabold text-slate-800 leading-tight font-display">{user.name}</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">{user.role === 'admin' ? 'Super Admin' : user.role}</span>
          </div>

          {/* Hidden File Input for Avatar Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div 
            onClick={handleAvatarClick}
            title="Click to upload profile photo"
            className="relative group cursor-pointer"
          >
            <img 
              src={avatarUrl}
              alt={user.name || 'User Avatar'}
              className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500/20 group-hover:border-indigo-600 transition-all shadow-sm"
            />
            {uploading ? (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Camera className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
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
