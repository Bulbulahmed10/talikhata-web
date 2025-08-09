const nodemailer = require('nodemailer');

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Gmail fallback
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  await transporter.sendMail({ from, to, subject, html, text });
}

async function sendPasswordResetCode({ to, code }) {
  const subject = 'Your Talikhata Password Reset Code';
  const text = `Your password reset code is ${code}. It will expire in 10 minutes.`;
  const html = `
  <div style="font-family:Arial,sans-serif; line-height:1.6;">
    <h2>Talikhata Password Reset</h2>
    <p>Your password reset code is:</p>
    <div style="font-size:24px; font-weight:bold; letter-spacing:6px;">${code}</div>
    <p style="margin-top:16px;">This code will expire in 10 minutes.</p>
  </div>`;
  await sendEmail({ to, subject, text, html });
}

module.exports = { sendEmail, sendPasswordResetCode };