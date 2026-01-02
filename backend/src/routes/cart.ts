import express from 'express';
import prisma from '../utils/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get cart items
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: true
      }
    });

    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to cart
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Please provide productId' });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId
        }
      }
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
        include: { product: true }
      });
      res.json(updated);
    } else {
      const newItem = await prisma.cartItem.create({
        data: {
          userId: req.user!.id,
          productId,
          quantity: quantity || 1
        },
        include: { product: true }
      });
      res.status(201).json(newItem);
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item
router.put('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: req.params.id }
    });

    if (!cartItem || cartItem.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
      res.json({ message: 'Item removed from cart' });
    } else {
      const updated = await prisma.cartItem.update({
        where: { id: req.params.id },
        data: { quantity },
        include: { product: true }
      });
      res.json(updated);
    }
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from cart
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: req.params.id }
    });

    if (!cartItem || cartItem.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



