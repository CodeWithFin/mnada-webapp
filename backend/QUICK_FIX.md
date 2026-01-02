# Quick Fix: Gmail App Password Issue

## You have 2-Step Verification enabled ✅
Great! Now you just need to generate a fresh App Password.

## Steps to Fix (2 minutes)

### 1. Generate New App Password
1. **Open this link**: https://myaccount.google.com/apppasswords
2. You might need to sign in
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Type: `Mnada Backend`
6. Click **Generate**
7. **IMPORTANT**: Copy the 16-character password shown (it looks like: `abcd efgh ijkl mnop`)

### 2. Update .env File
1. Open `backend/.env`
2. Find the line: `EMAIL_PASSWORD=enhyqydmbhytxlrgd`
3. Replace `enhyqydmbhytxlrgd` with your new 16-character App Password
4. **Remove all spaces** from the password
5. Example: If Gmail shows `abcd efgh ijkl mnop`, use `abcdefghijklmnop`

### 3. Test
Run this command:
```bash
cd backend
node test-email.js
```

You should see: ✅ Email server connection verified!

### 4. Restart Backend
Restart your backend server to pick up the new password.

## Still Not Working?

- Make sure there are **no spaces** in the password in `.env`
- Make sure the password is exactly **16 characters** (no more, no less)
- Try generating a completely new App Password
- Check that you're using the App Password, not your regular Gmail password

