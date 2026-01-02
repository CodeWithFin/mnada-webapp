# Passwordless Authentication (OTP) Setup Guide

## Overview

The application now supports passwordless authentication using a 6-digit OTP (One-Time Password) sent via email.

## Flow

1. User enters their email on the login page
2. System checks if user exists (creates one if not)
3. A 6-digit OTP is generated and saved with a 5-minute expiry
4. OTP is sent to the user's email
5. User is redirected to verification page to enter the 6-digit code
6. Upon successful verification, a JWT token is issued

## Backend Setup

### 1. Database Migration

Run the Prisma migration to add the OTP table:

```bash
cd backend
npm run prisma:migrate
```

This will create the `Otp` model in your database.

### 2. Environment Variables

Add the following email configuration to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail  # or 'smtp' for custom SMTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # For Gmail, use App Password
EMAIL_FROM=your-email@gmail.com

# SMTP Configuration (if not using Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 3. Gmail Setup (Recommended for Development)

1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 4. Alternative Email Services

For production, consider using:
- **SendGrid**: Professional email service
- **AWS SES**: Scalable email service
- **Mailgun**: Developer-friendly email API
- **Resend**: Modern email API

Update the `src/utils/email.ts` file to use your preferred service.

## Frontend

The frontend is already configured. Users will:
1. Visit `/login` to enter their email
2. Be redirected to `/verify-otp` to enter the 6-digit code
3. Optionally use `/login-password` for traditional password login

## API Endpoints

### Request OTP
```
POST /api/otp/request
Body: { "email": "user@example.com" }
Response: { "message": "OTP sent to your email" }
```

### Verify OTP
```
POST /api/otp/verify
Body: { "email": "user@example.com", "code": "123456" }
Response: { "token": "jwt-token", "user": {...} }
```

### Resend OTP
```
POST /api/otp/resend
Body: { "email": "user@example.com" }
Response: { "message": "OTP resent to your email" }
```

## Development Mode

In development (`NODE_ENV=development`), the OTP code is logged to the console and returned in the API response for testing purposes.

## Security Features

- OTPs expire after 5 minutes
- OTPs can only be used once
- Old unused OTPs are automatically deleted when a new one is requested
- Rate limiting should be implemented in production

## Testing

1. Start the backend server
2. Visit the frontend login page
3. Enter your email
4. Check your email for the 6-digit code (or check console in dev mode)
5. Enter the code on the verification page
6. You'll be logged in automatically

