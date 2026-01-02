# How to Get Your M-Pesa Passkey - Step by Step Guide

## Method 1: From Safaricom Developer Portal (Sandbox/Testing)

### Step 1: Log In
1. Go to **https://developer.safaricom.co.ke/**
2. Click **"Log In"** (top right)
3. Enter your credentials

### Step 2: Navigate to Your App
1. Once logged in, click on **"My Apps"** in the top menu
2. Select your app (or create a new one if you don't have one)
3. Click on the app name to open it

### Step 3: Find the Passkey

**Option A: Check API Products Section**
1. In your app dashboard, look for **"API Products"** or **"Products"** tab
2. Click on it
3. Look for **"Lipa Na M-Pesa Online"** or **"M-Pesa Express"**
4. Click on it
5. The passkey should be displayed there (might be labeled as "Lipa Na M-Pesa Online Passkey" or just "Passkey")

**Option B: Check Test Credentials Section**
1. In your app dashboard, look for **"Test Credentials"** or **"Sandbox Credentials"** section
2. The passkey might be listed there along with other test credentials

**Option C: Check App Settings**
1. Look for **"Settings"** or **"Configuration"** tab
2. Navigate through the settings
3. The passkey might be under "STK Push" or "Payment" settings

### Step 4: If You Still Can't Find It

1. **Enable the Product First:**
   - Go to "API Products"
   - Make sure "Lipa Na M-Pesa Online" is enabled/turned on
   - Sometimes the passkey only appears after enabling

2. **Generate/Create Passkey:**
   - Some apps have a "Generate Passkey" or "Create Passkey" button
   - Click it if available
   - The passkey will be generated and displayed

3. **Contact Support:**
   - Email: **support@developer.safaricom.co.ke**
   - Include:
     - Your app name
     - Your Consumer Key
     - Request: "I need my Lipa Na M-Pesa Online passkey for sandbox testing"
   - They usually respond within 24 hours

## Method 2: For Production (After Go Live)

### Step 1: Complete Go Live Process
1. Get a Paybill or Till Number from Safaricom (dial 200)
2. In Developer Portal, go to **"Go Live"** section
3. Fill in all required information
4. Submit your application

### Step 2: Receive Passkey via Email
1. After approval (1-3 business days)
2. Safaricom will send an email to your registered email address
3. The email subject will be something like: "Your M-Pesa API Credentials" or "Lipa Na M-Pesa Online Passkey"
4. The passkey will be in the email body

## Quick Checklist

Before contacting support, make sure you've:
- [ ] Logged into the correct Developer Portal account
- [ ] Selected the correct app
- [ ] Checked the "API Products" section
- [ ] Enabled "Lipa Na M-Pesa Online" product
- [ ] Checked "Test Credentials" section
- [ ] Looked in "Settings" or "Configuration"
- [ ] Checked your email for any credentials sent by Safaricom

## What the Passkey Looks Like

The passkey is typically:
- A long string of characters (usually 30-50+ characters)
- Mix of letters and numbers
- Example format: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- It's unique to your shortcode

## Common Sandbox Passkey (Temporary Testing Only)

**⚠️ WARNING: This is a common test passkey. Use your own if available!**

For sandbox testing, if you can't find your passkey immediately, you can temporarily use:
```
bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
```

**But you should still contact Safaricom to get your own passkey** as this might not work for all accounts.

## Still Stuck?

1. **Screenshot your app dashboard** and check all tabs/sections
2. **Contact Safaricom Developer Support:**
   - Email: support@developer.safaricom.co.ke
   - Phone: Check their support page
   - Include your Consumer Key in the email
3. **Check Safaricom Documentation:**
   - https://developer.safaricom.co.ke/APIs
   - Look for "Lipa Na M-Pesa Online" documentation

## Once You Have It

1. Copy the passkey
2. Add it to your `backend/.env` file:
   ```env
   MPESA_PASSKEY=your_actual_passkey_here
   ```
3. Restart your backend server
4. Try the payment again


