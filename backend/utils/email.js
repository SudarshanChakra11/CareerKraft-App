// utils/email.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve .env from backend root — works regardless of where file is called from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log("📧 Email config:", user, pass ? "pass_loaded" : "❌ pass_missing");

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

/**
 * Send OTP email
 * @param {string} toEmail
 * @param {string} otp
 * @param {string} userName
 */
export const sendOTPEmail = async (toEmail, otp, userName = "there") => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `CareerKraft <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔐 Your CareerKraft OTP Code",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:32px;text-align:center;">
                      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                        CareerKraft 🚀
                      </h1>
                      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">
                        Your career journey starts here
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 36px;">
                      <p style="color:#374151;font-size:16px;margin:0 0 8px;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      <p style="color:#6b7280;font-size:15px;margin:0 0 32px;line-height:1.6;">
                        Use the OTP below to verify your identity.
                        It expires in <strong>10 minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <div style="background:#faf5ff;border:2px dashed #7c3aed;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
                        <p style="color:#7c3aed;font-size:13px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">
                          Your OTP Code
                        </p>
                        <p style="color:#1f2937;font-size:48px;font-weight:800;letter-spacing:12px;margin:0;font-family:'Courier New',monospace;">
                          ${otp}
                        </p>
                      </div>

                      <p style="color:#9ca3af;font-size:13px;margin:0;line-height:1.6;text-align:center;">
                        If you didn't request this, you can safely ignore this email.<br/>
                        Never share this OTP with anyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:20px 36px;text-align:center;border-top:1px solid #e5e7eb;">
                      <p style="color:#9ca3af;font-size:12px;margin:0;">
                        © ${new Date().getFullYear()} CareerKraft. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ OTP email sent to ${toEmail}`);
};