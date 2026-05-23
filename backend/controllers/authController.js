// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOTP, getOTPExpiry, sendSMSOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../utils/email.js";

// ── Helper: sign JWT ────────────────────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ── Helper: safe user object (no password/otp) ──────────────────────────────
const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  isVerified: user.isVerified,
  careerInterest: user.careerInterest,
  onboardingComplete: user.onboardingComplete,
  selectedPath: user.selectedPath,
});

// ── Helper: send OTP via both channels ─────────────────────────────────────
const dispatchOTP = async (user, otp) => {
  sendSMSOTP(user.mobile, otp).catch(() => {}); // SMS: non-blocking, non-fatal
  await sendOTPEmail(user.email, otp, user.name); // Email: awaited
};

// ── Helper: determine where to redirect user ────────────────────────────────
// Logic:
//   onboardingComplete = true  → "/dashboard"
//   selectedPath set           → "/onboarding" (mid-onboarding)
//   neither                    → "/path-selection"
const getRedirectPath = (user) => {
  if (user.onboardingComplete) return "/dashboard";
  if (user.selectedPath) return "/onboarding";
  return "/path-selection";
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// New user → create account → send OTP → user verifies → goes to path-selection
// ────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        message: "Email already registered. Please login.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Create user (password hashed via pre-save hook)
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      otp,
      otpExpiry,
      isVerified: false,
    });

    // Send OTP
    await dispatchOTP(user, otp);

    res.status(201).json({
      message: "OTP sent to your email and mobile",
      userId: user._id,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
//
// VERIFIED user   → direct JWT token (no OTP needed)
// UNVERIFIED user → send OTP again (they never completed first verification)
// ────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if ((!email && !mobile) || !password) {
      return res.status(400).json({ message: "Email/mobile and password required" });
    }

    // Find user
    const query = email ? { email: email.toLowerCase() } : { mobile };
    const user = await User.findOne(query).select("+password +otp +otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "No account found. Please sign up." });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // ── VERIFIED USER: skip OTP, issue token directly ──────────────────────
    if (user.isVerified) {
      const token = signToken(user._id);
      const redirectTo = getRedirectPath(user);

      return res.status(200).json({
        message: "Login successful",
        token,
        user: safeUser(user),
        redirectTo, // frontend uses this to send user to correct page
      });
    }

    // ── UNVERIFIED USER: send OTP (they never finished registration) ───────
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = getOTPExpiry();
    await user.save({ validateBeforeSave: false });

    await dispatchOTP(user, otp);

    return res.status(200).json({
      message: "Account not verified. OTP sent to your email and mobile.",
      userId: user._id,
      requiresOTP: true, // frontend shows OTP screen
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Verifies OTP → marks isVerified: true in DB → issues JWT
// ────────────────────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and otp required" });
    }

    const user = await User.findById(userId).select("+otp +otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP match
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Check OTP expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // ✅ Mark verified in DB — this is the key flag
    // From now on this user will NEVER need OTP again on login
    user.isVerified = true;
    user.otp = undefined;       // clear OTP
    user.otpExpiry = undefined; // clear expiry
    await user.save({ validateBeforeSave: false });

    // Issue JWT
    const token = signToken(user._id);
    const redirectTo = getRedirectPath(user);

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: safeUser(user),
      redirectTo, // "/path-selection" for new users
    });
  } catch (err) {
    console.error("VerifyOTP error:", err);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// ────────────────────────────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const user = await User.findById(userId).select("+otp +otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Already verified — no need to resend
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified. Please login." });
    }

    // Rate limit: block if OTP generated less than 1 minute ago
    if (user.otpExpiry) {
      const msLeft = user.otpExpiry - new Date();
      const msTotal = 10 * 60 * 1000;
      if (msLeft > msTotal - 60 * 1000) {
        return res.status(429).json({
          message: "Please wait 1 minute before requesting another OTP",
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = getOTPExpiry();
    await user.save({ validateBeforeSave: false });

    await dispatchOTP(user, otp);

    res.status(200).json({ message: "OTP resent to your email and mobile" });
  } catch (err) {
    console.error("ResendOTP error:", err);
    res.status(500).json({ message: "Server error during OTP resend" });
  }
};