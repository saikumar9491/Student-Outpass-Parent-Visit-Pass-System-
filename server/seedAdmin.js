require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database.');

    const adminEmail = 'balisaikumar@gmial.com';
    const adminId = '12322006';
    const adminPassword = '123456';
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      console.log(`Admin user with email '${adminEmail}' already exists. Seeding skipped.`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Admin
    await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      phone: adminId,
      role: 'admin'
    });

    console.log('--------------------------------------------------');
    console.log('SUCCESS: Admin user seeded successfully.');
    console.log(`Email: ${adminEmail}`);
    console.log(`ID: ${adminId}`);
    console.log(`Password: ${adminPassword}`);
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
