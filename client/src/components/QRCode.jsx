import React from 'react';

const QRCode = ({ value, className = '' }) => {
  if (!value) {
    return (
      <div className="h-40 w-40 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-500 font-medium">
        No QR Code Available
      </div>
    );
  }

  return (
    <div className={`bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-lg ${className}`}>
      <img src={value} alt="Verification QR Code" className="h-36 w-36 select-none pointer-events-none" />
    </div>
  );
};

export default QRCode;
