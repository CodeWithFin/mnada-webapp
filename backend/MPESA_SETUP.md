# M-Pesa STK Push Setup Guide

This guide will help you set up M-Pesa STK Push payment integration for the Mnada platform.

## Prerequisites

1. Safaricom Developer Account - Sign up at https://developer.safaricom.co.ke/
2. M-Pesa Business Account
3. App credentials from Safaricom Developer Portal

## Step 1: Get M-Pesa API Credentials

### For Sandbox/Testing (Development):

1. **Log in to Safaricom Developer Portal**: https://developer.safaricom.co.ke/
2. **Create a new app**:
   - Go to "My Apps" section
   - Click "Create App"
   - Fill in app details and submit
3. **Get Sandbox Credentials**:
   - **Consumer Key** and **Consumer Secret**: Found in your app details
   - **Shortcode**: Use the test shortcode `174379` (for sandbox)
   - **Passkey**: For sandbox, you can use a test passkey. Check the "Test Credentials" section in your app dashboard
   
   **Note**: In sandbox mode, Safaricom provides test credentials. If you don't see a passkey:
   - Check the "API Products" section in your app
   - Look for "Lipa Na M-Pesa Online" product
   - The passkey might be listed there or you may need to generate it

### For Production (Go Live):

1. **Apply for Paybill/Till Number**:
   - Contact Safaricom Business Support (dial 200)
   - Or apply through your M-Pesa Business account
   - You'll receive a Paybill or Till Number (this is your shortcode)

2. **Complete Go Live Process**:
   - Log in to Developer Portal
   - Navigate to "Go Live" section
   - Fill in your organization details
   - Submit your Paybill/Till Number
   - Complete all required forms

3. **Receive Production Credentials**:
   - After approval, Safaricom will send your **Lipa Na M-Pesa Online Passkey** to your registered email
   - This can take 1-3 business days
   - The passkey is unique to your shortcode

### Alternative: Using Daraja API 2.0

If you're using the new Daraja API 2.0, the process might be slightly different:
- Check the "API Products" section for "M-Pesa Express (STK Push)"
- The passkey generation might be automated
- Contact Safaricom Developer Support if you don't see it: support@developer.safaricom.co.ke

## Step 2: Configure Environment Variables

Add the following variables to your `backend/.env` file:

```env
# M-Pesa Configuration
MPESA_BASE_URL=https://sandbox.safaricom.co.ke  # Use https://api.safaricom.co.ke for production
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_SHORTCODE=your_shortcode_here
MPESA_CALLBACK_URL=http://your-domain.com/api/payment/callback
```

### For Development (Sandbox):
- Use the sandbox URL: `https://sandbox.safaricom.co.ke`
- Get test credentials from the developer portal
- **Test Shortcode**: `174379` (standard sandbox shortcode)
- **Test Passkey**: Check your app's "API Products" → "Lipa Na M-Pesa Online" section
- If passkey is not visible, try using: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919` (this is a common sandbox test passkey, but use your own if available)

**Important**: The sandbox passkey might be:
- Listed in your app dashboard under "Test Credentials"
- Found in the "API Products" section
- Generated automatically when you enable "Lipa Na M-Pesa Online" product
- If still not found, contact Safaricom Developer Support

### For Production:
- Use the production URL: `https://api.safaricom.co.ke`
- Use your actual business credentials
- Use your registered Paybill or Till Number
- Set up a valid HTTPS callback URL (Safaricom requires HTTPS for production)

## Step 3: Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the STK Push:
   - Use a test phone number (provided by Safaricom in sandbox)
   - Make a test purchase
   - Enter the test phone number at checkout
   - You should receive an STK push prompt on the test phone

## Step 4: Production Deployment

Before going live:

1. **Update Environment Variables:**
   - Change `MPESA_BASE_URL` to production URL
   - Use production credentials
   - Update `MPESA_CALLBACK_URL` to your production domain

2. **Callback URL Requirements:**
   - Must be HTTPS
   - Must be publicly accessible
   - Should handle POST requests at `/api/payment/callback`

3. **Security:**
   - Never commit `.env` file to version control
   - Use environment variables in your hosting platform
   - Consider using a secrets management service

## Troubleshooting

### Common Issues:

1. **"Invalid Access Token"**
   - Check your Consumer Key and Consumer Secret
   - Ensure credentials are correct for the environment (sandbox vs production)

2. **"Request timeout"**
   - Check your internet connection
   - Verify the M-Pesa API is accessible
   - Check if you're using the correct base URL

3. **"Callback not received"**
   - Ensure callback URL is publicly accessible
   - Check if your server is running and accessible
   - Verify the callback URL is correctly configured in `.env`

4. **"STK Push not received"**
   - Verify phone number format (should be 254XXXXXXXXX)
   - Check if the phone number is registered with M-Pesa
   - Ensure you're using a test number in sandbox mode

## Support

For M-Pesa API issues, contact:
- Safaricom Developer Support: https://developer.safaricom.co.ke/support
- M-Pesa Business Support: 200

## Additional Resources

- [Safaricom Developer Documentation](https://developer.safaricom.co.ke/)
- [M-Pesa API Reference](https://developer.safaricom.co.ke/APIs)
- [STK Push Documentation](https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate)

