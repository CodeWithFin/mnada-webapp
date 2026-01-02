import express from 'express';
import prisma from '../utils/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create post
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { image, caption } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Please provide an image' });
    }

    const post = await prisma.post.create({
      data: {
        userId: req.user!.id,
        image,
        caption
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feed (posts from followed users)
router.get('/feed', protect, async (req: AuthRequest, res) => {
  try {
    const follows = await prisma.follow.findMany({
      where: { followerId: req.user!.id },
      select: { followingId: true }
    });

    const followingIds = follows.map(f => f.followingId);
    followingIds.push(req.user!.id); // Include own posts

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: followingIds }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get explore (latest and popular posts)
router.get('/explore', async (req, res) => {
  try {
    const { type = 'latest' } = req.query;

    let orderBy: any = { createdAt: 'desc' };
    if (type === 'popular') {
      // Order by number of likes
      orderBy = { likes: { _count: 'desc' } };
    }

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy,
      take: 50
    });

    res.json(posts);
  } catch (error) {
    console.error('Get explore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike post
router.put('/:id/like', protect, async (req: AuthRequest, res) => {
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: req.params.id,
          userId: req.user!.id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      res.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId: req.params.id,
          userId: req.user!.id
        }
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', protect, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Please provide comment content' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: req.params.id,
        userId: req.user!.id,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.post.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



