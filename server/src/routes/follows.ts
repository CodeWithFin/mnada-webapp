import express from 'express';
import prisma from '../utils/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Follow/unfollow user
router.put('/:userId', protect, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user!.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user!.id,
          followingId: userId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      res.json({ following: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: req.user!.id,
          followingId: userId
        }
      });
      res.json({ following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers and following
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [followers, following] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      })
    ]);

    res.json({
      followers: followers.map(f => f.follower),
      following: following.map(f => f.following)
    });
  } catch (error) {
    console.error('Get follows error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



