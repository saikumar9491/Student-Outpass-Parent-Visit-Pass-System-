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

    // 1. Search in Outpass by passId or _id
    let outpass = await Outpass.findOne({
      $or: [
        { passId: passId.trim().toUpperCase() },
        { passId: passId.trim() }
      ]
    }).populate({
      path: 'studentId',
      select: 'name studentId department year hostel roomNumber phone'
    });

    // If not found by passId, check if search term is a Student Roll ID
    if (!outpass) {
      const studentRecord = await Student.findOne({ studentId: new RegExp(`^${passId.trim()}$`, 'i') });
      if (studentRecord) {
        outpass = await Outpass.findOne({
          studentId: studentRecord._id,
          status: { $in: ['APPROVED', 'COMPLETED', 'PENDING'] }
        }).sort({ createdAt: -1 }).populate({
          path: 'studentId',
          select: 'name studentId department year hostel roomNumber phone'
        });
      }
    }

    if (outpass) {
      // Lazy check
      outpass = await lazyCheckOutpass(outpass);

      const statusMap = outpass.status === 'APPROVED' ? 'VALID' : outpass.status;

      return res.json({
        _id: outpass._id,
        status: statusMap,
        passType: 'Student Outpass',
        passId: outpass.passId,
        name: outpass.studentId ? outpass.studentId.name : 'Unknown Student',
        studentId: outpass.studentId ? outpass.studentId.studentId : 'N/A',
        department: outpass.studentId ? outpass.studentId.department : 'N/A',
        year: outpass.studentId ? outpass.studentId.year : 'N/A',
        phone: outpass.studentId ? outpass.studentId.phone : 'N/A',
        hostel: outpass.studentId ? outpass.studentId.hostel : 'N/A',
        roomNumber: outpass.studentId ? outpass.studentId.roomNumber : 'N/A',
        date: outpass.outingDate,
        validTime: `${new Date(outpass.outingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(outpass.expectedReturnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        destination: outpass.destination,
        purpose: outpass.purpose,
        emergencyContact: outpass.emergencyContact,
        approvedAt: outpass.approvedAt,
        rawStatus: outpass.status
      });
    }

    // 2. Search in VisitPass
    let visitPass = await VisitPass.findOne({
      $or: [
        { passId: passId.trim().toUpperCase() },
        { passId: passId.trim() }
      ]
    }).populate({
      path: 'studentId',
      select: 'name studentId department year hostel roomNumber phone'
    });

    if (!visitPass) {
      const studentRecord = await Student.findOne({ studentId: new RegExp(`^${passId.trim()}$`, 'i') });
      if (studentRecord) {
        visitPass = await VisitPass.findOne({
          studentId: studentRecord._id,
          status: { $in: ['APPROVED', 'COMPLETED', 'PENDING'] }
        }).sort({ createdAt: -1 }).populate({
          path: 'studentId',
          select: 'name studentId department year hostel roomNumber phone'
        });
      }
    }

    if (visitPass) {
      // Lazy check
      visitPass = await lazyCheckVisitPass(visitPass);

      const statusMap = visitPass.status === 'APPROVED' ? 'VALID' : visitPass.status;

      return res.json({
        _id: visitPass._id,
        status: statusMap,
        passType: 'Parent Visit Pass',
        passId: visitPass.passId,
        name: visitPass.visitorName,
        studentId: visitPass.studentId ? visitPass.studentId.studentId : 'N/A',
        studentName: visitPass.studentId ? visitPass.studentId.name : 'N/A',
        department: visitPass.studentId ? visitPass.studentId.department : 'N/A',
        phone: visitPass.studentId ? visitPass.studentId.phone : 'N/A',
        hostel: visitPass.studentId ? visitPass.studentId.hostel : 'N/A',
        roomNumber: visitPass.studentId ? visitPass.studentId.roomNumber : 'N/A',
        date: visitPass.visitDate,
        validTime: `${visitPass.arrivalTime} - ${visitPass.departureTime}`,
        relationship: visitPass.relationship,
        visitorCount: visitPass.visitorCount,
        visitorNames: visitPass.visitorNames,
        purpose: visitPass.purpose,
        approvedAt: visitPass.approvedAt,
        rawStatus: visitPass.status
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
