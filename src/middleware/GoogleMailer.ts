import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export type EmailType =
  | "welcome" | "verification" | "password-reset" | "alert"
  | "generic" | "suspension" | "unsuspension" | "listing" | "verified";

// --- TRANSPORTER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD, 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// --- CONNECTION VERIFICATION ---
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mailer Connection Error:", error.message);
    console.error("👉 Action Required: Ensure your App Password is correct and 2FA is enabled.");
  } else {
    console.log("✅ Mailer Status: Ready to send emails via", process.env.EMAIL_SENDER);
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
  console.log(`\n---------------------------------------------------------`);
  console.log(`📧 [PREPARING] Type: ${type} | Recipient: ${email}`);

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

    // Attempting to send
    const info = await transporter.sendMail(mailOptions);
    
    // --- DETAILED CONSOLE LOGS ---
    console.log("✅ [SUCCESS] Email delivered to Gmail server");
    console.log("   ➤ Message ID:", info.messageId);
    console.log("   ➤ Server Response:", info.response);
    console.log("   ➤ Accepted Recipients:", info.accepted.join(', '));
    console.log(`---------------------------------------------------------\n`);

    return "✅ Email sent successfully";
  } catch (error: any) {
    // --- DETAILED ERROR LOGS ---
    console.error("❌ [FAILURE] Email failed to send");
    console.error("   ➤ Error Message:", error.message);
    if (error.code) console.error("   ➤ Error Code:", error.code);
    console.log(`---------------------------------------------------------\n`);
    
    return `❌ Email error: ${error.message}`;
  }
};