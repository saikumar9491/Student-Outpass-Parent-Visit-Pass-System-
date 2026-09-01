require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const setAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const email = 'balisaikumar9491@gmail.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.password = hashedPassword;
      user.role = 'admin';
      user.name = 'bali saikumar';
      user.phone = '7997696717';
      await user.save();
      console.log('Admin user updated successfully.');
    } else {
      user = new User({
        name: 'bali saikumar',
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: '7997696717',
        role: 'admin'
      });
      await user.save();
      console.log('Admin user created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error setting admin:', error);
    process.exit(1);
  }
};

setAdmin();
