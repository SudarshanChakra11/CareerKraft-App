import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-fill email if passed from signup
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= VERIFY OTP =================
  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp }
      );

      setMessage(res.data.message);
      setError("");

      // Redirect after success
      setTimeout(() => {
        navigate("/auth");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResend = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/resend-otp",
        { email }
      );

      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
      setMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Verify Your Email
      </h2>

      {/* Email Field */}
      <input
        type="email"
        value={email}
        disabled={!!location.state?.email} // lock if auto-filled
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-3 w-full mb-3 rounded-lg bg-gray-100"
      />

      {/* OTP Field */}
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-3 w-full mb-3 rounded-lg"
      />

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 w-full rounded-lg mb-2 transition disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {/* Resend Button */}
      <button
        onClick={handleResend}
        className="bg-green-600 hover:bg-green-700 text-white p-3 w-full rounded-lg transition"
      >
        Resend OTP
      </button>

      {/* Messages */}
      {message && (
        <p className="text-green-600 mt-3 text-center">{message}</p>
      )}
      {error && (
        <p className="text-red-600 mt-3 text-center">{error}</p>
      )}
    </div>
  );
};

export default VerifyEmail;