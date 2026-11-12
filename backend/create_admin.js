require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examapp');
    console.log('Connected to DB');

    const email = 'admin@test.com';
    const password = 'password123';

    await User.deleteOne({ email }); // Ensure fresh insert

    const user = new User({
      name: 'System Admin',
      email,
      password,
      role: 'admin'
    });

    await user.save();
    console.log('Admin user created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
