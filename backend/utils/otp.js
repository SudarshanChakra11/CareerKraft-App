// utils/otp.js
import crypto from "crypto";
import axios from "axios";

/**
 * Generate a 6-digit numeric OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * OTP expiry: 10 minutes from now
 */
export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

/**
 * Send OTP via Fast2SMS (India)
 * Free tier: https://www.fast2sms.com/
 * Set FAST2SMS_API_KEY in .env
 */
export const sendSMSOTP = async (mobile, otp) => {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        variables_values: otp,
        route: "otp",
        numbers: mobile,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.return) {
      throw new Error("Fast2SMS failed: " + JSON.stringify(response.data));
    }

    console.log(`✅ SMS OTP sent to ${mobile}`);
    return true;
  } catch (err) {
    // Non-fatal — email OTP still works
    console.error("❌ SMS OTP error:", err.message);
    return false;
  }
};