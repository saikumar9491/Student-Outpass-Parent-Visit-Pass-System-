import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { Send, MapPin, AlignLeft, Phone, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { addNotification } from '../../utils/notifications';

const ApplyOutpass = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    outingDate: '',
    expectedReturnDate: '',
    emergencyContact: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { destination, purpose, outingDate, expectedReturnDate, emergencyContact } = formData;
    if (!destination || !purpose || !outingDate || !expectedReturnDate || !emergencyContact) {
      toast.error('Please fill in all required fields');
      return;
    }

    const outing = new Date(outingDate);
    const returnTime = new Date(expectedReturnDate);
    const now = new Date();

    if (outing < now) {
      toast.error('Outing date/time cannot be in the past');
      return;
    }

    if (returnTime <= outing) {
      toast.error('Expected return date/time must be after the outing date/time');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/outpasses', formData);
      toast.success('Outpass request submitted successfully!');
      
      // Seed a local notification for the student
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        addNotification(
          user._id, 
          'Outpass Submitted', 
          `Your outpass request to ${destination} is now pending review.`
        );
      }

      navigate('/student');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit outpass request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Apply for Outpass</h1>
        <p className="text-slate-600 text-xs">Fill in your outing details. All fields marked with * are required.</p>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-950/20 border border-yellow-500/25 rounded-2xl p-4 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-normal">
          <p className="font-semibold text-slate-450">Outpass Policy Information</p>
          <p className="mt-1">
            You cannot apply for a new outpass if you currently have an active (Approved) or Pending outpass request that overlaps. Ensure your timings are precise.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Destination *</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                name="destination"
                required
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Home, Local Market, Hospital"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Purpose *</label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                name="purpose"
                required
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Medical Checkup, Weekend Visit"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Outing Date & Time *</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  type="datetime-local"
                  name="outingDate"
                  required
                  value={formData.outingDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Expected Return Date & Time *</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  type="datetime-local"
                  name="expectedReturnDate"
                  required
                  value={formData.expectedReturnDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Emergency Contact Number *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                name="emergencyContact"
                required
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Parent's or Guardian's contact number"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Remarks / Extra Details</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Provide any extra details if needed..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3.5 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-98 disabled:opacity-50 mt-2"
          >
            <Send className="h-4.5 w-4.5" /> {isSubmitting ? 'Submitting Application...' : 'Send Outpass Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyOutpass;
