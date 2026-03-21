const { Resend } = require('resend');
const path = require('path');

// No need for dotenv if running with node --env-file=.env
// Or manually check if process.env.RESEND_API_KEY is set

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey || apiKey === 're_123') {
  console.error("Invalid or missing RESEND_API_KEY in .env");
  process.exit(1);
}

const resend = new Resend(apiKey);

async function testEmail() {
  console.log("Testing Resend with API Key:", apiKey.substring(0, 10) + "...");
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mnada <orders@mnada.shop>',
      to: ['finley.mwachia12@gmail.com'], // Using the email from git log
      subject: 'Test Email from Mnada',
      html: '<p>This is a test email to verify Resend integration.</p>'
    });

    if (error) {
      console.error("Resend API Error:", JSON.stringify(error, null, 2));
    } else {
      console.log("Resend API Success:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Script Error:", err);
  }
}

testEmail();
