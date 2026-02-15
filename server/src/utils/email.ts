import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const OTP_HTML = (code: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #fff;">
    <h1 style="color: #FF8C00; margin-bottom: 20px;">Your Login Code</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Use this code to complete your login:
    </p>
    <div style="background-color: #0A0A0A; border: 2px solid #FF8C00; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
      <h2 style="color: #FF8C00; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
        ${code}
      </h2>
    </div>
    <p style="font-size: 14px; color: #999; margin-top: 20px;">
      This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
    </p>
    <p style="font-size: 14px; color: #999; margin-top: 10px;">
      Best regards,<br>
      The Mnada Team
    </p>
  </div>
`;

const OTP_TEXT = (code: string) =>
  `Your Mnada login code is: ${code}\n\nThis code will expire in 5 minutes.`;

// Resend: works reliably from Render/cloud (no SMTP blocking)
const sendViaResend = async (email: string, code: string): Promise<boolean> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const resend = new Resend(apiKey);
  // Resend free tier: must use onboarding@resend.dev unless you verify a domain
  const { data, error } = await resend.emails.send({
    from: 'Mnada <onboarding@resend.dev>',
    to: email,
    subject: 'Your Mnada Login Code',
    html: OTP_HTML(code),
    text: OTP_TEXT(code),
  });
  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message);
  }
  console.log('OTP email sent via Resend. Message ID:', data?.id);
  return true;
};

// Nodemailer (Gmail/SMTP) - often blocked from cloud hosts
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendViaNodemailer = async (email: string, code: string): Promise<boolean> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return false;
  const transporter = createTransporter();
  await transporter.verify();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Your Mnada Login Code',
    html: OTP_HTML(code),
    text: OTP_TEXT(code),
  });
  console.log('OTP email sent via SMTP. Message ID:', info.messageId);
  return true;
};

export const sendOTPEmail = async (email: string, code: string) => {
  try {
    // 1) Prefer Resend in production (works from Render; Gmail often blocks cloud IPs)
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(email, code);
      return;
    }
    // 2) Fallback: Gmail/SMTP
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await sendViaNodemailer(email, code);
      return;
    }
    // 3) No config
    console.warn('No email config (RESEND_API_KEY or EMAIL_USER/PASSWORD). Skipping send.');
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: OTP code is:', code);
      return;
    }
    throw new Error('Email configuration not set. Add RESEND_API_KEY or Gmail SMTP env vars.');
  } catch (error: any) {
    console.error('Error sending OTP email:', error.message);
    console.error('Error code:', error.code);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

