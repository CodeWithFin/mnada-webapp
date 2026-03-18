import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey || apiKey === 're_123') {
  console.warn("RESEND_API_KEY is missing or using default placeholder 're_123'");
} else {
  console.log("Resend service initialized with API key starting with:", apiKey.substring(0, 7));
}

export const resend = new Resend(apiKey || 're_123');
