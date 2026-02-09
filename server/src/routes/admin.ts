import express from 'express';
import prisma from '../utils/prisma';
import { protect, AuthRequest } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Get all products (admin view with more details)
router.get('/products', async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true
          }
        }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
router.post('/products', async (req: AuthRequest, res) => {
  try {
    const { name, description, price, images, category, stockCount } = req.body;

    if (!name || !description || !price || !images || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        images: Array.isArray(images) ? images : [images],
        category,
        stockCount: stockCount || 0,
        inStock: (stockCount || 0) > 0
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/products/:id', async (req: AuthRequest, res) => {
  try {
    const { name, description, price, images, category, stockCount, inStock } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        images: images ? (Array.isArray(images) ? images : [images]) : undefined,
        category,
        stockCount,
        inStock: inStock !== undefined ? inStock : (stockCount || 0) > 0
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
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

// Get dashboard stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          paymentStatus: 'paid'
        }
      })
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.totalAmount || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make user admin
router.put('/users/:id/make-admin', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

