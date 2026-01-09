import { Resend } from 'resend';
import dotenv from "dotenv";
dotenv.config();

export type EmailType =
  | "welcome" | "verification" | "password-reset" | "alert"
  | "generic" | "suspension" | "unsuspension" | "listing" | "verified";

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Simple status check (Resend doesn't use .verify(), so we just log the key presence) ---
if (!process.env.RESEND_API_KEY) {
  console.error("❌ Resend Error: RESEND_API_KEY is missing in environment variables.");
} else {
  console.log("✅ Resend is configured and ready.");
}

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

    // Send using Resend SDK
    const { data, error } = await resend.emails.send({
      from: 'Unihaven <onboarding@resend.dev>', // Use onboarding@resend.dev for testing
      to: [email],
      subject: `${theme.emoji} ${subject}`,
      html: fullHtml,
    });

    if (error) {
      console.error("❌ Resend Sending Failed:", error);
      return `❌ Email error: ${error.message}`;
    }

    console.log("📨 Email sent successfully via Resend:");
    console.log("   - ID:", data?.id);

    return "✅ Email sent";
  } catch (error: any) {
    console.error("❌ Email Sending Failed:");
    console.error("   - Error Message:", error.message);
    
    return `❌ Email error: ${error.message}`;
  }
};