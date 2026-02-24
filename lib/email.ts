import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";
const FROM_NAME = process.env.FROM_NAME || "Eguardian Events";

function getTransporter() {
  if (!SMTP_HOST || !EMAIL_USER || !EMAIL_APP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  });
}

export type PassEmailData = {
  to: string;
  firstName: string;
  surname: string;
  eventName: string;
  passUrl: string;
  uniqueCode: string;
  /** Optional PNG buffer to attach as event pass */
  passPngBuffer?: Buffer;
};

function getEmailHtml(data: PassEmailData): string {
  const safeName = data.firstName.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
  const safeEvent = data.eventName.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Event Pass</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: 40px 40px 32px 40px; border-bottom: 1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="https://eguardian-uae.s3.us-east-2.amazonaws.com/EGUARDIAN-Lanka-Pvt-Ltd-Logo-1-1024x288.jpg" alt="Eguardian" width="180" height="51" style="display: block; height: auto; max-height: 51px; width: auto; max-width: 180px;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #18181b; line-height: 1.3;">
                Hello ${safeName},
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #52525b;">
                Thank you for registering. Your event pass for <strong style="color: #18181b;">${safeEvent}</strong> is ready and attached to this email.
              </p>
              <p style="margin: 0; font-size: 13px; color: #71717a;">
                Pass code: <code style="background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, monospace;">${data.uniqueCode}</code>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 32px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                This is an automated message from Eguardian. If you did not register for this event, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #a1a1aa;">
          &copy; Eguardian. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function getEmailText(data: PassEmailData): string {
  return `Hello ${data.firstName},

Thank you for registering. Your event pass for "${data.eventName}" is ready and attached to this email as a PNG image.

Pass code: ${data.uniqueCode}

—
Eguardian
This is an automated message. If you did not register for this event, please ignore this email.`;
}

export async function sendPassEmail(data: PassEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Email not configured: missing SMTP_HOST, EMAIL_USER or EMAIL_APP_PASSWORD");
    return false;
  }
  try {
    const attachments: nodemailer.SendMailOptions["attachments"] = [];
    if (data.passPngBuffer && data.passPngBuffer.length > 0) {
      attachments.push({
        filename: `event-pass-${data.uniqueCode}.png`,
        content: data.passPngBuffer,
      });
    }
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: data.to,
      subject: `Your event pass – ${data.eventName}`,
      text: getEmailText(data),
      html: getEmailHtml(data),
      attachments,
    });
    return true;
  } catch (err) {
    console.error("Send pass email error:", err);
    return false;
  }
}
