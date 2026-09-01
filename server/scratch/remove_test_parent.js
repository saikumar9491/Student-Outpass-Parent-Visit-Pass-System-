require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Parent = require('../models/Parent');
const Student = require('../models/Student');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find parent by name
    const parent = await Parent.findOne({ name: 'Admin Test Parent' });
    if (!parent) {
      console.log('No parent named "Admin Test Parent" found in the database.');
      process.exit(0);
    }

    console.log(`Found parent: ${parent.name} (Parent ID: ${parent.parentId}, User ID: ${parent.userId})`);

    // Remove from students' parentIds list
    const studentUpdateResult = await Student.updateMany(
      { parentIds: parent.userId },
      { $pull: { parentIds: parent.userId } }
    );
    console.log(`Removed parent links from student profiles:`, studentUpdateResult);

    // Delete Parent document
    await Parent.deleteOne({ _id: parent._id });
    console.log('Parent profile document deleted successfully.');

    // Delete User document
    if (parent.userId) {
      await User.deleteOne({ _id: parent.userId });
      console.log('Parent user credentials document deleted successfully.');
    }

    console.log('Cleanup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up parent:', error);
    process.exit(1);
  }
}

run();
