import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP, sendOTP } from "../utils/otp.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};


const getRedirectTo = (user) => {
  if (!user.selectedPath)   return "path-selection";
  if (!user.careerInterest) return "onboarding";
  return "dashboard";
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ message: "User already exists. Please login." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp            = generateOTP();
    const otpExpiry      = new Date(Date.now() + 5 * 60 * 1000);

    // Upsert — handles re-registration of unverified accounts
    const user = await User.findOneAndUpdate(
      { email },
      { name, mobile, password: hashedPassword, otp, otpExpiry, isVerified: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOTP(email, mobile, otp);

    res.status(200).json({
      message: "OTP sent to your email and mobile",
      userId: user._id,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user       = await User.findOne({ email });
    const invalidMsg = "Invalid email or password";

    if (!user)  return res.status(400).json({ message: invalidMsg });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: invalidMsg });

    if (user.isVerified) {
      return res.status(200).json({
        requiresOtp: false,
        token:       generateToken(user._id),
        user:        sanitizeUser(user),
        redirectTo:  getRedirectTo(user), // frontend routes here
      });
    }

    const otp      = generateOTP();
    user.otp       = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTP(email, user.mobile, otp);

    return res.status(200).json({
      requiresOtp: true,
      message:     "Account not verified. OTP sent.",
      userId:      user._id,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp)
      return res.status(400).json({ message: "userId and otp required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired. Request a new one." });


    user.otp        = null;
    user.otpExpiry  = null;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      requiresOtp: false,
      token:       generateToken(user._id),
      user:        sanitizeUser(user),
      redirectTo:  getRedirectTo(user),
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Already verified. Please login normally." });

    const otp      = generateOTP();
    user.otp       = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTP(user.email, user.mobile, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};