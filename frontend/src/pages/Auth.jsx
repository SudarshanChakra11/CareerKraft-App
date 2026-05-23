import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { setStoredUser } from "@/lib/store";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const resetStore = useAppStore((s) => s.resetStore);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── OTP step state ──────────────────────────────────
  const [otpStep, setOtpStep] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};

    if (!isLogin && !formData.name.trim())
      newErrors.name = "Full name is required";

    if (!formData.mobile.trim())
      newErrors.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(formData.mobile))
      newErrors.mobile = "Mobile must be 10 digits";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password)
      newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Step 1: Submit form ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const data = isLogin
        ? await loginUser(formData)
        : await registerUser(formData);

      // ── VERIFIED USER (login): token returned directly — no OTP needed ──
      if (data.token) {
        resetStore();
        localStorage.removeItem("token");
        localStorage.setItem("token", data.token);
        setStoredUser(data.user);
        setUser(data.user);
        // Redirect to where user left off
        navigate(data.redirectTo || "/dashboard");
        return;
      }

      // ── NEW USER (register) or UNVERIFIED USER (login): show OTP screen ──
      if (!data.userId) {
        alert("Invalid server response");
        return;
      }

      setUserId(data.userId);
      setOtp("");
      setOtpError("");
      setOtpStep(true);
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────
  const handleOtpVerify = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter 6-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");

      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      // Wipe previous user state
      resetStore();
      localStorage.removeItem("token");

      // Set new user
      localStorage.setItem("token", data.token);
      setStoredUser(data.user);
      setUser(data.user);

      // redirectTo from backend:
      // new user       → "/path-selection"
      // mid-onboarding → "/onboarding"
      // completed      → "/dashboard"
      navigate(data.redirectTo || "/path-selection");
    } catch (error) {
      setOtpError(error.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────
  const handleResend = async () => {
    try {
      setOtpError("");
      const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpError("✅ OTP resent to your email and mobile");
    } catch (error) {
      setOtpError(error.message || "Failed to resend OTP");
    }
  };

  const inputClass =
    "w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200";

  // ── OTP Screen ───────────────────────────────────────
  if (otpStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 transition-colors duration-300">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-md rounded-3xl shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-8 text-center"
        >
          <div className="text-5xl mb-4">🔐</div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify OTP
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            6-digit OTP sent to your email &amp; mobile
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ""));
              setOtpError("");
            }}
            placeholder="• • • • • •"
            className="w-full p-4 text-center text-3xl tracking-[1rem] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-3 transition-all duration-200"
          />

          {otpError && (
            <p className={`text-sm mb-3 ${
              otpError.startsWith("✅")
                ? "text-green-500 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}>
              {otpError}
            </p>
          )}

          <button
            onClick={handleOtpVerify}
            disabled={otpLoading || otp.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mb-3"
          >
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            onClick={handleResend}
            className="text-purple-500 dark:text-purple-400 text-sm hover:underline transition-colors"
          >
            Didn't receive? Resend OTP
          </button>

          <button
            onClick={() => {
              setOtpStep(false);
              setOtp("");
              setOtpError("");
            }}
            className="block w-full mt-3 text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ← Back to {isLogin ? "Login" : "Sign Up"}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Auth Form ────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-md rounded-3xl shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-8 overflow-hidden">

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {isLogin ? "Welcome Back 👋" : "Join CareerKraft 🚀"}
        </h2>

        {/* Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setErrors({}); }}
            className={`w-1/2 py-2 rounded-lg font-medium transition-all duration-200 ${
              isLogin
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrors({}); }}
            className={`w-1/2 py-2 rounded-lg font-medium transition-all duration-200 ${
              !isLogin
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Name (signup only) */}
            {!isLogin && (
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
                {errors.name && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Mobile */}
            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.mobile && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">{errors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
            </button>

          </motion.form>
        </AnimatePresence>

      </div>
    </div>
  );
}