import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const createTransporter = () => {
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
    auth: {
      user,
      pass,
    },
    requireTLS: true,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    family: 4, // Force IPv4 to avoid IPv6 ENETUNREACH issues on Render
  });
};

export const sendOTPEmail = async (
  toEmail,
  otp,
  userName = "there"
) => {
  try {
    const transporter = createTransporter();

    // Verify SMTP connection before sending
    await transporter.verify();
    console.log("✅ SMTP connection verified.");

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        `CareerKraft <${process.env.EMAIL_USER}>`,
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

<tr>
<td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:32px;text-align:center;">
<h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">
CareerKraft 🚀
</h1>

<p style="color:rgba(255,255,255,.8);margin-top:8px;">
Your career journey starts here
</p>
</td>
</tr>

<tr>
<td style="padding:40px 36px;">

<p>
Hi <strong>${userName}</strong>,
</p>

<p style="line-height:1.6;color:#6b7280;">
Use the OTP below to verify your identity.
It expires in <strong>10 minutes</strong>.
</p>

<div style="background:#faf5ff;border:2px dashed #7c3aed;border-radius:12px;padding:28px;text-align:center;margin:30px 0;">

<p style="color:#7c3aed;font-size:13px;font-weight:600;">
YOUR OTP
</p>

<p style="font-size:48px;font-weight:800;letter-spacing:12px;font-family:Courier New;">
${otp}
</p>

</div>

<p style="color:#9ca3af;font-size:13px;text-align:center;">
If you didn't request this email, you can safely ignore it.<br>
Never share your OTP with anyone.
</p>

</td>
</tr>

<tr>
<td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb;">
© ${new Date().getFullYear()} CareerKraft
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

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP email sent successfully.");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Failed to send OTP email");
    console.error("Error Code:", error.code);
    console.error("Response Code:", error.responseCode);
    console.error("Response:", error.response);
    console.error(error);

    throw error;
  }
};