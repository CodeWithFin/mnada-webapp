// Quick test script to verify email configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***' : 'NOT SET');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email server connection verified!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from Mnada',
      text: 'This is a test email to verify your email configuration is working.',
      html: '<p>This is a test email to verify your email configuration is working.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.error('\nCommon issues:');
    console.error('1. Gmail App Password not set correctly or expired');
    console.error('2. App Password has spaces - remove them in .env file');
    console.error('3. Wrong App Password copied (should be 16 characters)');
    console.error('4. Check spam folder');
    console.error('\nTo generate a new App Password:');
    console.error('1. Visit: https://myaccount.google.com/apppasswords');
    console.error('2. Select "Mail" and "Other (Custom name)"');
    console.error('3. Enter "Mnada Backend" as the name');
    console.error('4. Click Generate');
    console.error('5. Copy the 16-character password (remove spaces)');
    console.error('6. Update EMAIL_PASSWORD in .env file');
  }
}

testEmail();

