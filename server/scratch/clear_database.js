require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const Outpass = require('../models/Outpass');
const VisitPass = require('../models/VisitPass');
const bcrypt = require('bcryptjs');

async function clearDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in server/.env');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    // 1. Delete all Outpasses & Visit Passes
    const deletedOutpasses = await Outpass.deleteMany({});
    const deletedVisits = await VisitPass.deleteMany({});
    console.log(`Deleted ${deletedOutpasses.deletedCount} outpass requests.`);
    console.log(`Deleted ${deletedVisits.deletedCount} visit pass requests.`);

    // 2. Delete all Students & Parents
    const deletedStudents = await Student.deleteMany({});
    const deletedParents = await Parent.deleteMany({});
    console.log(`Deleted ${deletedStudents.deletedCount} student profiles.`);
    console.log(`Deleted ${deletedParents.deletedCount} parent profiles.`);

    // 3. Delete ALL Users
    const deletedUsers = await User.deleteMany({});
    console.log(`Deleted ${deletedUsers.deletedCount} user accounts.`);

    // 4. Create one pristine Super Administrator account
    const hashedPassword = await bcrypt.hash('123456', 10);
    const admin = await User.create({
      name: 'System Administrator',
      email: 'balisaikumar9491@gmail.com',
      phone: '12322006',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    console.log('==============================================');
    console.log('DATABASE RESET COMPLETED SUCCESSFULLY!');
    console.log('Super Admin Credentials:');
    console.log('Email: balisaikumar9491@gmail.com');
    console.log('Admin ID / Phone: 12322006');
    console.log('Password: 123456');
    console.log('Role: admin');
    console.log('==============================================');
    process.exit(0);
  } catch (err) {
    console.error('Error during database cleanup:', err);
    process.exit(1);
  }
}

clearDatabase();
