import express from 'express';
import prisma from '../utils/prisma';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all products with search and filters
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (inStock === 'true') {
      where.inStock = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin only - simplified for now)
router.post('/', protect, async (req: AuthRequest, res) => {
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
router.put('/:id', protect, async (req: AuthRequest, res) => {
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
        inStock
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



