const Outpass = require('../models/Outpass');
const VisitPass = require('../models/VisitPass');

/**
 * Utility to parse time string (e.g., "17:00" or "05:00 PM") and merge it with a date
 */
const parseTimeString = (date, timeStr) => {
  const dateCopy = new Date(date);
  let hours = 0;
  let minutes = 0;

  // Clean time string
  const cleanTime = timeStr.trim().toLowerCase();

  if (cleanTime.includes('am') || cleanTime.includes('pm')) {
    // 12-hour AM/PM format
    const match = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    }
  } else {
    // 24-hour format
    const match = cleanTime.match(/^(\d+):(\d+)$/);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
    }
  }

  dateCopy.setHours(hours, minutes, 0, 0);
  return dateCopy;
};

/**
 * Lazy check for an Outpass
 */
const lazyCheckOutpass = async (outpass) => {
  if (!outpass) return null;
  if (outpass.status === 'APPROVED' && new Date(outpass.expectedReturnDate) < new Date()) {
    outpass.status = 'EXPIRED';
    await outpass.save();
  }
  return outpass;
};

/**
 * Lazy check for a VisitPass
 */
const lazyCheckVisitPass = async (visitPass) => {
  if (!visitPass) return null;
  if (visitPass.status === 'APPROVED') {
    const departureDate = parseTimeString(visitPass.visitDate, visitPass.departureTime);
    if (departureDate < new Date()) {
      visitPass.status = 'EXPIRED';
      await visitPass.save();
    }
  }
  return visitPass;
};

module.exports = {
  lazyCheckOutpass,
  lazyCheckVisitPass,
  parseTimeString
};
