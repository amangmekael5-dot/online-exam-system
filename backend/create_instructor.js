require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examapp');
    console.log('Connected to DB');

    const email = 'instructor@test.com';
    const password = 'password123';

    await User.deleteOne({ email }); // Ensure fresh insert

    const user = new User({
      name: 'Test Instructor',
      email,
      password,
      role: 'teacher'
    });

    await user.save();
    console.log('Instructor user created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
