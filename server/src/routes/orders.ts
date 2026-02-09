import express from 'express';
import prisma from '../utils/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user orders
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide order items' });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.inStock || product.stockCount < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order with pending payment status (will be updated after M-Pesa payment)
    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        totalAmount,
        shippingAddress,
        paymentStatus: 'pending',
        status: 'PENDING',
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Don't clear cart yet - wait for payment confirmation

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order payment status
router.put('/:id/pay', protect, async (req: AuthRequest, res) => {
  try {
    const { paymentIntent, paymentStatus } = req.body;

    const order = await prisma.order.update({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      data: {
        paymentIntent,
        paymentStatus: paymentStatus || 'paid'
      }
    });

    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



