import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // ── Onboarding ──────────────────────────────────
    selectedPath:   { type: String, default: null },
    qualification:  { type: String, default: null },
    branch:         { type: String, default: null },
    year:           { type: String, default: null },
    careerInterest: { type: String, default: null },
    skillLevel:     { type: String, default: null },
    duration:       { type: String, default: null },

    // ── Progress pointer ────────────────────────────
    currentDay: { type: Number, default: 1 },

    // ── Auth / OTP ──────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,       // false until OTP verified
    },

    otp: {
      type: String,
      default: null,        // 6-digit OTP, cleared after verify
    },

    otpExpiry: {
      type: Date,
      default: null,        // 5 min window
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);