import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'APPROVED':
      case 'VALID':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'CANCELLED':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      case 'EXPIRED':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getStyles()}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
