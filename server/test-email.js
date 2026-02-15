// Quick test script to verify Resend email configuration
require('dotenv').config();
const { Resend } = require('resend');

async function testEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set in .env');
    process.exit(1);
  }
  try {
    console.log('Testing Resend...');
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: 'Mnada <onboarding@resend.dev>',
      to: process.env.EMAIL_USER || 'you@example.com',
      subject: 'Test Email from Mnada',
      text: 'This is a test email. Resend is configured correctly.',
    });
    if (error) throw new Error(error.message);
    console.log('Test email sent. Message ID:', data?.id);
  } catch (err) {
    console.error('Email test failed:', err.message);
    process.exit(1);
  }
}

testEmail();
