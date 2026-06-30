import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load backend .env explicitly
dotenv.config({ path: './backend/.env' });

const email = process.argv[2];
if (!email) {
  console.error('Usage: node verifyUser.js <email>');
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    console.log('User verified:', email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
