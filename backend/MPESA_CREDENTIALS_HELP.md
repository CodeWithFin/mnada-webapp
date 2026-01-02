# How to Get M-Pesa Passkey and Shortcode

## Quick Guide for Sandbox (Testing)

If you're just testing and need credentials quickly:

### Step 1: Access Your App in Developer Portal

1. Go to https://developer.safaricom.co.ke/
2. Log in to your account
3. Navigate to "My Apps"
4. Select your app (or create a new one)

### Step 2: Find Your Credentials

**Consumer Key & Consumer Secret:**
- These are visible in your app dashboard
- Copy them directly

**Shortcode (Sandbox):**
- Use: `174379` (standard test shortcode)
- This is the same for all sandbox apps

**Passkey (Sandbox):**
- Go to "API Products" in your app
- Look for "Lipa Na M-Pesa Online" or "M-Pesa Express"
- The passkey should be listed there
- If not visible, try these steps:
  1. Click on "Lipa Na M-Pesa Online" product
  2. Check the "Credentials" or "Settings" tab
  3. Look for "Passkey" or "Lipa Na M-Pesa Online Passkey"

### Step 3: If Passkey is Still Not Visible

1. **Enable the Product:**
   - Make sure "Lipa Na M-Pesa Online" is enabled for your app
   - If not, enable it from the API Products section

2. **Check Test Credentials Section:**
   - Some apps have a dedicated "Test Credentials" section
   - The passkey might be listed there

3. **Contact Support:**
   - Email: support@developer.safaricom.co.ke
   - Include your app name and Consumer Key
   - Ask for your sandbox passkey

## For Production (Go Live)

### Step 1: Get a Paybill/Till Number

1. Contact Safaricom Business Support: Dial **200**
2. Request a Paybill or Till Number for M-Pesa payments
3. Complete the registration process
4. You'll receive your shortcode (usually 5-6 digits)

### Step 2: Go Live Process

1. In Developer Portal, go to "Go Live" section
2. Fill in:
   - Organization details
   - Your Paybill/Till Number (shortcode)
   - Business information
3. Submit for approval

### Step 3: Receive Passkey

- After approval (1-3 business days)
- Safaricom will email your **Lipa Na M-Pesa Online Passkey**
- Check your registered email address
- The passkey is unique to your shortcode

## Common Issues

### "I can't find the passkey in my dashboard"

**Solution:**
1. Make sure you're looking at the correct app
2. Check if "Lipa Na M-Pesa Online" product is enabled
3. Try refreshing the page
4. Contact Safaricom support with your Consumer Key

### "I'm using Daraja API 2.0 and it's different"

**Solution:**
- Daraja API 2.0 might have a different interface
- Look for "M-Pesa Express" instead of "Lipa Na M-Pesa Online"
- The passkey generation might be automatic
- Check the API documentation for your specific version

### "I need to test but don't have credentials yet"

**Temporary Solution:**
- Use sandbox mode with test credentials
- Shortcode: `174379`
- Contact support to get your sandbox passkey
- You can still develop and test the integration flow

## Support Contacts

- **Developer Support Email**: support@developer.safaricom.co.ke
- **M-Pesa Business Support**: Dial 200
- **Developer Portal**: https://developer.safaricom.co.ke/support

## Example .env Configuration

Once you have all credentials:

```env
# Sandbox Configuration
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CONSUMER_KEY=your_consumer_key_from_dashboard
MPESA_CONSUMER_SECRET=your_consumer_secret_from_dashboard
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_from_dashboard_or_email
MPESA_CALLBACK_URL=http://localhost:5000/api/payment/callback

# Production Configuration (after go live)
# MPESA_BASE_URL=https://api.safaricom.co.ke
# MPESA_SHORTCODE=your_paybill_or_till_number
# MPESA_PASSKEY=your_production_passkey_from_email
# MPESA_CALLBACK_URL=https://yourdomain.com/api/payment/callback
```

## Next Steps

Once you have your credentials:
1. Add them to `backend/.env`
2. Restart your backend server
3. Test with a sandbox phone number
4. Check the console for any authentication errors

