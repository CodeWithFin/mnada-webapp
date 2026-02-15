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

export const sendOTPEmail = async (email: string, code: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  console.log('[Email] RESEND_API_KEY set:', !!apiKey, '| Sending to:', email);

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: OTP code is:', code);
      return;
    }
    throw new Error('RESEND_API_KEY is not set. Add it in Render → Environment.');
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: 'Mnada <onboarding@resend.dev>',
    to: [email],
    subject: 'Your Mnada Login Code',
    html: OTP_HTML(code),
    text: OTP_TEXT(code),
  });

  if (error) {
    console.error('[Email] Resend error:', JSON.stringify(error));
    throw new Error(error.message);
  }
  console.log('[Email] Sent. Id:', data?.id);
};
