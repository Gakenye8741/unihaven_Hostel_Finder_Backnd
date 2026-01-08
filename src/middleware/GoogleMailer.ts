import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export type EmailType =
  | "welcome" | "verification" | "password-reset" | "alert"
  | "generic" | "suspension" | "unsuspension" | "listing" | "verified";


// Initialize Transporter with Render-optimized settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for 587
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD, 
  },
  tls: {
    // This is crucial for Render to talk to Gmail
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  pool: true,
  connectionTimeout: 10000, // 10 seconds is plenty if it's going to work
});

// --- DEBUG: Verify Connection on Start ---
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailer Connection Error:", error.message);
    console.error("👉 Check: Are your EMAIL_SENDER and EMAIL_PASSWORD (App Password) correct?");
  } else {
    console.log("✅ Mailer is ready to send emails using:", process.env.EMAIL_SENDER);
  }
});

export const sendNotificationEmail = async (
  email: string,
  subject: string,
  name: string | null,
  message: string,
  extraHtml?: string,
  type: EmailType = "generic"
): Promise<string> => {
  console.log(`\n📧 Attempting to send [${type}] email to: ${email}...`);

  try {
    const themes = {
      welcome: { emoji: "🚀", title: "Welcome to Unihaven" },
      verification: { emoji: "🔐", title: "Verify Your Account" },
      "password-reset": { emoji: "🔑", title: "Reset Your Password" },
      alert: { emoji: "⚠️", title: "Security Alert" },
      suspension: { emoji: "🚫", title: "Account Notice" },
      unsuspension: { emoji: "✅", title: "Access Restored" },
      generic: { emoji: "🏠", title: "Unihaven" },
      listing: { emoji: "🏠", title: "New Listing Created" },
      verified: { emoji: "🌟", title: "Hostel Verified!" },
    };

    const theme = themes[type] || themes.generic;

    const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; padding: 20px 0;">
        <tr>
          <td align="center">
            <div style="max-width: 450px; background: #ffffff; border-radius: 16px; border-top: 6px solid #4F46E5; padding: 40px 30px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 10px;">${theme.emoji}</div>
              <h2 style="color: #111827;">${theme.title}</h2>
              <p style="color: #4B5563;">Hello ${name || 'there'},<br>${message}</p>
              ${extraHtml ? `<div style="margin: 30px 0;">${extraHtml}</div>` : ""}
              <hr style="border: none; border-top: 1px solid #F3F4F6;">
              <p style="font-size: 12px; color: #9CA3AF;">&copy; ${new Date().getFullYear()} Unihaven Team</p>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

    const mailOptions = {
      from: `"Unihaven" <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: `${theme.emoji} ${subject}`,
      text: message,
      html: fullHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log success details
    console.log("📨 Email response from Gmail server:");
    console.log("   - Message ID:", info.messageId);
    console.log("   - Response:", info.response);
    console.log("   - Accepted by:", info.accepted);

    return "✅ Email sent";
  } catch (error: any) {
    // Log specific failure details
    console.error("❌ Email Sending Failed:");
    console.error("   - Code:", error.code);
    console.error("   - Command:", error.command);
    console.error("   - Error Message:", error.message);
    
    return `❌ Email error: ${error.message}`;
  }
};