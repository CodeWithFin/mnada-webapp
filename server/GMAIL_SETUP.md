# Gmail App Password Setup Guide

## The Problem
Gmail is rejecting your credentials with error: "Username and Password not accepted"

## Solution: Generate a New Gmail App Password

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", find **2-Step Verification**
4. If it's not enabled, click it and follow the setup process
5. You'll need to verify your phone number

### Step 2: Generate App Password
1. Go back to **Security** settings
2. Under "How you sign in to Google", find **2-Step Verification** (should show "On")
3. Click on **2-Step Verification**
4. Scroll down and find **App passwords**
5. Click **App passwords**
6. You may need to sign in again
7. Select **Mail** as the app
8. Select **Other (Custom name)** as the device
9. Type "Mnada Backend" or any name you prefer
10. Click **Generate**
11. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
12. **Remove the spaces** when adding to your .env file

### Step 3: Update .env File
Update your `EMAIL_PASSWORD` in the `.env` file:

```env
EMAIL_PASSWORD=abcdefghijklmnop
```

(Use the 16-character password without spaces)

### Step 4: Test Again
Run the test script:
```bash
cd server
node test-email.js
```

Or restart your server and try requesting an OTP again.

## Important Notes

- **App Passwords are different from your regular Gmail password**
- You cannot use your regular Gmail password for SMTP
- App Passwords are 16 characters (no spaces in .env file)
- Each App Password can only be viewed once when generated
- You can generate multiple App Passwords for different apps

## Alternative: Use a Different Email Service

If you continue having issues with Gmail, consider:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap, requires AWS account)
- **Resend** (modern, developer-friendly)

