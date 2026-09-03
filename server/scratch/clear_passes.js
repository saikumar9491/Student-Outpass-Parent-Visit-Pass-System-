require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Outpass = require('../models/Outpass');
const VisitPass = require('../models/VisitPass');

async function clearPasses() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in server/.env');
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    const deletedOutpasses = await Outpass.deleteMany({});
    const deletedVisits = await VisitPass.deleteMany({});

    console.log(`Deleted ${deletedOutpasses.deletedCount} Outpasses.`);
    console.log(`Deleted ${deletedVisits.deletedCount} Visit Passes.`);
    console.log('==============================================');
    console.log('ALL OUTPASSES, VISIT PASSES & ACTIVE PASSES PURGED!');
    console.log('==============================================');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing passes:', err);
    process.exit(1);
  }
}

clearPasses();
