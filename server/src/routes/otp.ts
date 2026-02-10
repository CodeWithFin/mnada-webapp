import express from 'express';
import prisma from '../utils/prisma';
import { sendOTPEmail } from '../utils/email';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP
router.post('/request', async (req, res) => {
  try {
    const { email, isSignup } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // For login: user must exist
    if (!isSignup && !user) {
      return res.status(404).json({ 
        message: 'Account not found. Please sign up first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // For signup: create user if doesn't exist
    if (isSignup && !user) {
      // Generate a username from email
      const usernameBase = email.split('@')[0];
      let username = usernameBase;
      let counter = 1;

      // Ensure unique username
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${usernameBase}${counter}`;
        counter++;
      }

      // Create user without password (passwordless)
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: null // No password for passwordless auth
        }
      });
    }

    // Delete any existing unused OTPs for this email
    await prisma.otp.deleteMany({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save OTP to database
    await prisma.otp.create({
      data: {
        email,
        code,
        expiresAt
      }
    });

    // Send OTP via email (optional - won't fail if email is not configured)
    let emailSent = false;
    try {
      console.log(`Attempting to send OTP ${code} to ${email}...`);
      await sendOTPEmail(email, code);
      emailSent = true;
      console.log('✅ Email sent successfully!');
    } catch (emailError: any) {
      console.error('❌ Email sending failed:', emailError.message);
      console.error('Email error details:', {
        code: emailError.code,
        command: emailError.command,
        response: emailError.response
      });
      // In development, always log the OTP
      console.log('📧 DEV MODE: OTP code is:', code);
      // Continue even if email fails
    }

    res.json({
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (email not configured)',
      // In development, always include the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: code })
    });
  } catch (error: any) {
    console.error('Request OTP error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error message in development
    const errorMessage = error.message || 'Server error';
    const errorDetails: any = { 
      message: errorMessage
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorDetails.name = error.name;
      errorDetails.code = error.code;
      errorDetails.meta = error.meta;
      if (error.stack) {
        errorDetails.stack = error.stack.split('\n').slice(0, 5).join('\n'); // First 5 lines of stack
      }
    }
    
    res.status(500).json(errorDetails);
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, code, username, firstName, lastName } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // Find valid OTP
    const otp = await prisma.otp.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otp.id },
      data: { used: true }
    });

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    const isNewUser = !user;

    if (!user) {
      // Generate username if not provided
      let finalUsername = username;
      if (!finalUsername) {
        const usernameBase = email.split('@')[0];
        finalUsername = usernameBase;
        let counter = 1;

        while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
          finalUsername = `${usernameBase}${counter}`;
          counter++;
        }
      } else {
        // Check if provided username is available
        const existingUser = await prisma.user.findUnique({
          where: { username: finalUsername }
        });
        if (existingUser) {
          return res.status(400).json({ message: 'Username already taken' });
        }
      }

      user = await prisma.user.create({
        data: {
          email,
          username: finalUsername,
          password: null,
          firstName: firstName || null,
          lastName: lastName || null
        }
      });
    } else if (username || firstName || lastName) {
      // Update existing user with provided info (if any)
      const updateData: any = {};
      if (username) {
        const existingUser = await prisma.user.findUnique({
          where: { username }
        });
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: 'Username already taken' });
        }
        updateData.username = username;
      }
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRE || '7d') as string }
    );

    const userWithAdmin = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isAdmin: true
      }
    });

    res.json({
      token,
      isNewUser,
      user: userWithAdmin
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Delete existing unused OTPs
    await prisma.otp.deleteMany({
      where: {
        email,
        used: false
      }
    });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({
      data: {
        email,
        code,
        expiresAt
      }
    });

    try {
      await sendOTPEmail(email, code);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      if (process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: OTP code is:', code);
      }
    }

    res.json({
      message: 'OTP resent to your email',
      ...(process.env.NODE_ENV === 'development' && { devOTP: code })
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

