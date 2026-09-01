require('dotenv').config();
const mongoose = require('mongoose');
const Outpass = require('../models/Outpass');
const Student = require('../models/Student');

const checkPending = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const pending = await Outpass.find({ status: 'PENDING' }).populate('studentId');
    console.log('Pending Outpasses count:', pending.length);
    pending.forEach((p, idx) => {
      console.log(`\nPending #${idx + 1}:`);
      console.log('ID:', p._id);
      console.log('studentId:', p.studentId);
      console.log('outingDate:', p.outingDate);
      console.log('expectedReturnDate:', p.expectedReturnDate);
      console.log('destination:', p.destination);
      console.log('status:', p.status);
      console.log('createdAt:', p.createdAt);
    });

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
};

checkPending();
