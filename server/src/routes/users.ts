import express from 'express';
import prisma from '../utils/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, username, bio, avatar } = req.body;

    // Check if user is updating their own profile
    if (req.user?.id !== id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Check if username is already taken (if changing username)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        username,
        bio,
        avatar
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        email: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
