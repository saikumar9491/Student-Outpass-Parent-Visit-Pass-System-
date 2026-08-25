const Outpass = require('../models/Outpass');
const VisitPass = require('../models/VisitPass');
const Student = require('../models/Student');
const { lazyCheckOutpass, lazyCheckVisitPass } = require('../utils/lazyCheck');

// @desc    Verify a pass by Pass ID (scanned QR code)
// @route   GET /api/verify/pass/:passId
// @access  Public (for security/scanner use)
const verifyPass = async (req, res) => {
  try {
    const { passId } = req.params;

    if (!passId) {
      return res.status(400).json({ status: 'NOT FOUND', message: 'Pass ID is required' });
    }

    // 1. Search in Outpass
    let outpass = await Outpass.findOne({ passId: passId.trim().toUpperCase() }).populate({
      path: 'studentId',
      select: 'name studentId department year hostel roomNumber'
    });

    if (outpass) {
      // Lazy check
      outpass = await lazyCheckOutpass(outpass);

      const statusMap = outpass.status === 'APPROVED' ? 'VALID' : outpass.status;

      return res.json({
        status: statusMap,
        passType: 'Student Outpass',
        passId: outpass.passId,
        name: outpass.studentId ? outpass.studentId.name : 'Unknown Student',
        studentId: outpass.studentId ? outpass.studentId.studentId : 'N/A',
        hostel: outpass.studentId ? outpass.studentId.hostel : 'N/A',
        roomNumber: outpass.studentId ? outpass.studentId.roomNumber : 'N/A',
        date: outpass.outingDate,
        validTime: `${new Date(outpass.outingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(outpass.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        destination: outpass.destination,
        purpose: outpass.purpose,
        emergencyContact: outpass.emergencyContact,
        approvedAt: outpass.approvedAt
      });
    }

    // 2. Search in VisitPass
    let visitPass = await VisitPass.findOne({ passId: passId.trim().toUpperCase() }).populate({
      path: 'studentId',
      select: 'name studentId department year hostel roomNumber'
    });

    if (visitPass) {
      // Lazy check
      visitPass = await lazyCheckVisitPass(visitPass);

      const statusMap = visitPass.status === 'APPROVED' ? 'VALID' : visitPass.status;

      return res.json({
        status: statusMap,
        passType: 'Parent Visit Pass',
        passId: visitPass.passId,
        name: visitPass.visitorName,
        studentId: visitPass.studentId ? visitPass.studentId.studentId : 'N/A',
        studentName: visitPass.studentId ? visitPass.studentId.name : 'N/A',
        hostel: visitPass.studentId ? visitPass.studentId.hostel : 'N/A',
        roomNumber: visitPass.studentId ? visitPass.studentId.roomNumber : 'N/A',
        date: visitPass.visitDate,
        validTime: `${visitPass.arrivalTime} - ${visitPass.departureTime}`,
        relationship: visitPass.relationship,
        visitorCount: visitPass.visitorCount,
        visitorNames: visitPass.visitorNames,
        purpose: visitPass.purpose,
        approvedAt: visitPass.approvedAt
      });
    }

    // 3. Not found in either
    return res.status(404).json({
      status: 'NOT FOUND',
      message: `Pass ID: ${passId} is invalid or not found in our database.`
    });
  } catch (error) {
    console.error('Verify pass error:', error);
    res.status(500).json({ status: 'NOT FOUND', message: 'Server error during pass verification' });
  }
};

module.exports = {
  verifyPass
};
