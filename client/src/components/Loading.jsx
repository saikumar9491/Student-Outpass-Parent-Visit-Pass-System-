import React from 'react';

const Loading = ({ size = 'md', fullScreen = false }) => {
  const spinnerSize = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <div className={`animate-spin rounded-full border-blue-500 border-t-transparent ${spinnerSize[size] || spinnerSize.md}`}></div>
        {fullScreen && <span className="text-xs font-semibold tracking-wider text-slate-500 font-sans">Loading resources...</span>}
      </div>
    </div>
  );
};

export default Loading;
