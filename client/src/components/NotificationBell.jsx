import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllAsRead, clearNotifications } from '../utils/notifications';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = () => {
    if (user) {
      setNotifications(getNotifications(user._id));
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = (e) => {
      if (e.detail === user?._id) {
        fetchNotifications();
      }
    };

    window.addEventListener('notifications_updated', handleUpdate);
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('notifications_updated', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (e) => {
    e.stopPropagation();
    if (user) {
      markAllAsRead(user._id);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (user) {
      clearNotifications(user._id);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none transition-colors"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-slate-900 ring-2 ring-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-lg bg-white border border-slate-200 shadow-xl ring-1 ring-black/5 focus:outline-none">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-750">Notifications</span>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleMarkRead}
                  title="Mark all as read"
                  className="rounded p-1 text-slate-600 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClear}
                  title="Clear all"
                  className="rounded p-1 text-slate-600 hover:bg-slate-800 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`border-b border-slate-200 px-4 py-3 hover:bg-slate-800/50 transition-colors ${
                    !notif.read ? 'bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-semibold ${!notif.read ? 'text-blue-400' : 'text-slate-700'}`}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
