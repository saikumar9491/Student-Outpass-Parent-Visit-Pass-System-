require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const Outpass = require('../models/Outpass');
const VisitPass = require('../models/VisitPass');

const { lazyCheckOutpass, lazyCheckVisitPass } = require('../utils/lazyCheck');

const testDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // 1. Stats
    const totalStudents = await Student.countDocuments();
    const totalParents = await Parent.countDocuments();

    const pendingOutpasses = await Outpass.countDocuments({ status: 'PENDING' });
    const approvedOutpassesCount = await Outpass.countDocuments({ status: 'APPROVED' });
    const rejectedOutpasses = await Outpass.countDocuments({ status: 'REJECTED' });

    const pendingVisits = await VisitPass.countDocuments({ status: 'PENDING' });
    const approvedVisitsCount = await VisitPass.countDocuments({ status: 'APPROVED' });
    const rejectedVisits = await VisitPass.countDocuments({ status: 'REJECTED' });

    const activeOutpasses = await Outpass.countDocuments({ status: 'APPROVED' });
    const activeVisits = await VisitPass.countDocuments({ status: 'APPROVED' });
    const totalActivePasses = activeOutpasses + activeVisits;

    console.log({
      totalStudents,
      totalParents,
      pendingOutpasses,
      approvedOutpassesCount,
      rejectedOutpasses,
      pendingVisits,
      approvedVisitsCount,
      rejectedVisits,
      totalActivePasses
    });

    // 2. Outpass chart raw
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const outpassChartRaw = await Outpass.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log('Outpass chart raw count:', outpassChartRaw.length);

    console.log('Success! No errors querying dashboard data.');
    process.exit(0);
  } catch (error) {
    console.error('Test dashboard failed:', error);
    process.exit(1);
  }
};

testDashboard();
