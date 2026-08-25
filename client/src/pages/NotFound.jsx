import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col items-center justify-center font-sans p-6 text-center">
      <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
        <ShieldAlert className="h-8 w-8 animate-bounce" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-slate-600 text-sm max-w-sm mb-8 leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors duration-200 shadow-lg shadow-blue-600/10"
      >
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
