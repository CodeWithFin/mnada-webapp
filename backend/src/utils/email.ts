import nodemailer from 'nodemailer';

// Create transporter - configure based on your email service
const createTransporter = () => {
  // For development, you can use Gmail or other SMTP services
  // For production, consider using SendGrid, AWS SES, or similar
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }

  // Generic SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendOTPEmail = async (email: string, code: string) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email configuration missing. Skipping email send.');
      if (process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: OTP code is:', code);
        return true; // Return success in dev mode even without email config
      }
      throw new Error('Email configuration not set');
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Your Mnada Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #fff;">
          <h1 style="color: #C0FF00; margin-bottom: 20px;">Your Login Code</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5;">
            Use this code to complete your login:
          </p>
          <div style="background-color: #0A0A0A; border: 2px solid #C0FF00; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h2 style="color: #C0FF00; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
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
      `,
      text: `Your Mnada login code is: ${code}\n\nThis code will expire in 5 minutes.`,
    };

    // Verify connection first
    await transporter.verify();
    console.log('Email server connection verified');

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('To:', email);
    return true;
  } catch (error: any) {
    console.error('Error sending OTP email:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    console.error('Full error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

