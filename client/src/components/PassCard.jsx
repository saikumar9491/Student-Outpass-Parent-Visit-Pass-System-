import React, { useRef } from 'react';
import { Printer, User, Calendar, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

const PassCard = ({ pass, type }) => {
  if (!pass) return null;

  const isOutpass = type === 'outpass';

  // Extract info safely
  const student = pass.studentId || {};
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Action buttons */}
      <div className="flex gap-4 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-250 shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Printer className="h-4 w-4" /> Print / Save Pass
        </button>
      </div>

      {/* Pass Design Container */}
      <div 
        className="print-area w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

        {/* College Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-blue-500/30">
              HQ
            </div>
            <div className="text-left">
              <h2 className="text-sm font-bold tracking-wider text-slate-850 uppercase">Rajiv Gandhi University of Technology</h2>
              <p className="text-[10px] text-slate-500">Hostel Administration Portal</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-widest text-blue-400 font-bold block mb-1">
              {isOutpass ? 'Student Outpass' : 'Parent Visit Pass'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {pass.passId || 'PENDING'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Pass Status</span>
              <StatusBadge status={pass.status} />
            </div>

            {isOutpass ? (
              // Student Outpass Fields
              <>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Student Name</span>
                  <span className="text-sm font-bold text-slate-850 flex items-center gap-1.5 mt-0.5">
                    <User className="h-4 w-4 text-blue-400" /> {student.name || pass.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Roll Number</span>
                    <span className="text-xs font-semibold text-slate-700">{student.studentId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Hostel Room</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {student.hostel ? `${student.hostel} - Rm ${student.roomNumber}` : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Outing Date/Time</span>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" /> 
                      {pass.outingDate ? new Date(pass.outingDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-600 block ml-4.5">
                      {pass.outingDate ? new Date(pass.outingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Expected Return</span>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      {pass.expectedReturnDate ? new Date(pass.expectedReturnDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-600 block ml-4.5">
                      {pass.expectedReturnDate ? new Date(pass.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Destination</span>
                  <span className="text-xs text-slate-700 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-400" /> {pass.destination}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Emergency Contact</span>
                  <span className="text-xs text-slate-700 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-blue-400" /> {pass.emergencyContact}
                  </span>
                </div>
              </>
            ) : (
              // Parent Visit Pass Fields
              <>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Primary Visitor</span>
                  <span className="text-sm font-bold text-slate-850 flex items-center gap-1.5 mt-0.5">
                    <User className="h-4 w-4 text-blue-400" /> {pass.visitorName} ({pass.relationship})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Hostel Student (Child)</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {student.name || pass.studentName} ({student.studentId || pass.studentId})
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    Room: {student.hostel} - Rm {student.roomNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Visit Date</span>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-400" />
                      {pass.visitDate ? new Date(pass.visitDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Timings</span>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-blue-400" /> {pass.arrivalTime} - {pass.departureTime}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Visitors Count</span>
                    <span className="text-xs font-semibold text-slate-700">{pass.visitorCount} Person(s)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ID Proof</span>
                    <span className="text-xs font-semibold text-slate-700">{pass.idProofType} ({pass.idProofNumber})</span>
                  </div>
                </div>
                {pass.visitorNames && pass.visitorNames.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Other Visitors</span>
                    <span className="text-xs text-slate-600">{pass.visitorNames.join(', ')}</span>
                  </div>
                )}
              </>
            )}
            
            {pass.purpose && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Purpose</span>
                <span className="text-xs text-slate-700 leading-relaxed block">{pass.purpose}</span>
              </div>
            )}
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-between md:border-l md:border-slate-200 md:pl-4 py-2 min-h-[220px]">
            {pass.qrCode ? (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-md">
                  <img src={pass.qrCode} alt="Verification QR" className="h-28 w-28 block" />
                </div>
                <span className="text-[8px] text-center text-slate-500 tracking-wider font-semibold">
                  SCAN FOR VERIFICATION
                </span>
              </div>
            ) : (
              <div className="h-28 w-28 bg-slate-800 rounded-xl flex items-center justify-center border border-dashed border-slate-700 p-2">
                <span className="text-[9px] text-center text-slate-500 leading-snug">QR Code will appear upon approval</span>
              </div>
            )}

            {pass.approvedAt && (
              <div className="w-full text-center mt-4 border-t border-slate-200/60 pt-3">
                <span className="text-[8px] text-slate-500 uppercase block">Approved Digitally By</span>
                <span className="text-[9px] font-bold text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Admin Office
                </span>
                <span className="text-[8px] text-slate-500 block mt-0.5">
                  {new Date(pass.approvedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-200 mt-6 pt-3 text-center">
          <p className="text-[8px] text-slate-500 leading-relaxed">
            This digital pass is generated by the Hostel Pass System and is protected by cryptographic verification. Any alteration invalidates this document.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PassCard;
