import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-hot-toast';
import { Send, User, Calendar, Clock, AlignLeft, ShieldAlert, Users } from 'lucide-react';
import { addNotification } from '../../utils/notifications';

const RequestVisit = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    studentId: '',
    visitorName: '',
    relationship: '',
    phone: '',
    visitDate: '',
    arrivalTime: '',
    departureTime: '',
    purpose: '',
    visitorCount: 1,
    otherVisitors: '', // comma separated string for input
    idProofType: '',
    idProofNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await API.get('/parents/profile');
        setChildren(res.data.studentIds || []);
        // Pre-select first child if available
        if (res.data.studentIds && res.data.studentIds.length > 0) {
          setFormData(prev => ({ ...prev, studentId: res.data.studentIds[0]._id }));
        }
      } catch (error) {
        console.error('Error loading parent profile children:', error);
        toast.error('Failed to load linked children profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      studentId,
      visitorName,
      relationship,
      phone,
      visitDate,
      arrivalTime,
      departureTime,
      purpose,
      visitorCount,
      otherVisitors,
      idProofType,
      idProofNumber
    } = formData;

    if (!studentId || !visitorName || !relationship || !phone || !visitDate || !arrivalTime || !departureTime || !purpose || !idProofType || !idProofNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedVisitDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedVisitDate < today) {
      toast.error('Visit date cannot be in the past');
      return;
    }

    // Split other visitors string by comma
    const visitorNames = otherVisitors
      ? otherVisitors.split(',').map(name => name.trim()).filter(name => name !== '')
      : [];

    const payload = {
      studentId,
      visitorName,
      relationship,
      phone,
      visitDate,
      arrivalTime,
      departureTime,
      purpose,
      visitorCount: Number(visitorCount),
      visitorNames,
      idProofType,
      idProofNumber
    };

    setIsSubmitting(true);
    try {
      await API.post('/visit-passes', payload);
      toast.success('Visit pass request submitted successfully!');
      
      // Seed a local notification for parent
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        addNotification(
          user._id,
          'Visit Pass Submitted',
          `Your visit pass request to visit child is pending admin approval.`
        );
      }

      navigate('/parent');
    } catch (error) {
      console.error('Submit visit pass error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit visit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Request Hostel Visit Pass</h1>
        <p className="text-slate-600 text-xs">Register your check-in details. All fields marked with * are required.</p>
      </div>

      {/* Warning Policy Box */}
      <div className="bg-yellow-950/20 border border-yellow-500/25 rounded-2xl p-4 flex gap-3 items-start">
        <ShieldAlert className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-normal text-left">
          <p className="font-semibold text-slate-450">Duplicate Visit Prevention Policy</p>
          <p className="mt-1">
            You cannot submit a duplicate visit request for the same student on the same calendar day. Please check student status before scheduling another entry.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-left">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Child Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5 font-sans">Select Child to Visit *</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <select
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 focus:outline-none transition-colors appearance-none font-semibold"
              >
                {children.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.name} ({child.studentId}) &bull; {child.hostel} Room {child.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Primary Visitor Name */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Primary Visitor Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  name="visitorName"
                  required
                  value={formData.visitorName}
                  onChange={handleChange}
                  placeholder="Visitor's Full Name"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Relationship to Student *</label>
              <select
                name="relationship"
                required
                value={formData.relationship}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-150 focus:outline-none transition-colors appearance-none"
              >
                <option value="" disabled>Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Visitor Contact Number *</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Mobile number"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>

            {/* Visit Date */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Visit Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  name="visitDate"
                  required
                  value={formData.visitDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Timings */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Arrival Time *</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  name="arrivalTime"
                  required
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  placeholder="e.g. 10:00 AM or 14:30"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Departure Time *</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  name="departureTime"
                  required
                  value={formData.departureTime}
                  onChange={handleChange}
                  placeholder="e.g. 05:00 PM or 18:00"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Total Visitors Count */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Total Visitors Count *</label>
              <input
                type="number"
                name="visitorCount"
                required
                min="1"
                value={formData.visitorCount}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-850 focus:outline-none transition-colors"
              />
            </div>

            {/* Other Visitors Names */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Other Visitors Names (if any)</label>
              <input
                type="text"
                name="otherVisitors"
                value={formData.otherVisitors}
                onChange={handleChange}
                placeholder="Comma separated e.g. Mary, Rose"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* ID Proof Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">ID Proof Type *</label>
              <select
                name="idProofType"
                required
                value={formData.idProofType}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-150 focus:outline-none transition-colors appearance-none font-semibold"
              >
                <option value="" disabled>Select Document</option>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">ID Proof Number *</label>
              <input
                type="text"
                name="idProofNumber"
                required
                value={formData.idProofNumber}
                onChange={handleChange}
                placeholder="Enter document number"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 px-4 text-sm text-slate-850 placeholder-slate-450 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Purpose of Visit *</label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                name="purpose"
                required
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Handing over winter clothes, Parent-Teacher Meet"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-850 placeholder-slate-655 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" /> {isSubmitting ? 'Sending Request...' : 'Submit Visit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestVisit;
