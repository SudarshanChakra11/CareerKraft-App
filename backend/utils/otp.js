import nodemailer from "nodemailer";
import axios from "axios";

// ── Generate 6-digit OTP ─────────────────────────────────
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createEmailTransport = () => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = process.env.EMAIL_SECURE === "true" || port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: true,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    family: 4,
  });
};

// ── Send via Email (Nodemailer + Gmail/SMTP) ─────────────
export const sendEmailOTP = async (email, otp) => {
  const transporter = createEmailTransport();
  await transporter.verify();

  await transporter.sendMail({
    from: `"CareerKraft" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your CareerKraft OTP",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border-radius:12px;border:1px solid #e5e7eb">
        <h2 style="color:#7c3aed;margin-bottom:8px">CareerKraft 🚀</h2>
        <p style="color:#6b7280">Your one-time verification code:</p>
        <h1 style="letter-spacing:12px;color:#7c3aed;font-size:36px;margin:16px 0">${otp}</h1>
        <p style="color:#6b7280;font-size:14px">Valid for <strong>5 minutes</strong>. Do not share this with anyone.</p>
      </div>
    `,
  });
};

// ── Send via SMS (Fast2SMS — India) ──────────────────────
export const sendSmsOTP = async (mobile, otp) => {
  if (!process.env.FAST2SMS_API_KEY) {
    console.warn("FAST2SMS_API_KEY is not configured; skipping SMS OTP.");
    return;
  }

  if (!mobile) {
    console.warn("Mobile number missing; skipping SMS OTP.");
    return;
  }

  await axios.post(
    "https://www.fast2sms.com/dev/bulkV2",
    {
      variables_values: otp,
      route: "otp",
      numbers: mobile,
    },
    {
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
      },
    }
  );
};

// ── Send both (email + SMS) ──────────────────────────────
// allSettled — one failure won't block the other
export const sendOTP = async (email, mobile, otp) => {
  const results = await Promise.allSettled([
    sendEmailOTP(email, otp),
    sendSmsOTP(mobile, otp),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`OTP send failed [${i === 0 ? "email" : "sms"}]:`, r.reason?.message || r.reason);
    }
  });
};