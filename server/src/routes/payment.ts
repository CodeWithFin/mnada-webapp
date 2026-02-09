import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { initializeTransaction, verifyTransaction } from '../utils/paystack';
import prisma from '../utils/prisma';

const router = express.Router();

// Initialize Paystack payment (create order + get payment link)
router.post('/initialize', protect, async (req: AuthRequest, res) => {
  try {
    const { items, shippingAddress, email } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required for payment' });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems: { productId: string; quantity: number; price: number }[] = [];

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
      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        totalAmount,
        shippingAddress: shippingAddress || {},
        paymentStatus: 'pending',
        status: 'PENDING',
        orderItems: {
          create: orderItems
        }
      },
      include: {
        orderItems: { include: { product: true } }
      }
    });

    // Convert to KSH for Paystack (match frontend: 1 USD = 135 KSH, round to nearest 1000)
    const USD_TO_KSH = 135;
    const totalKSH = Math.round((totalAmount * USD_TO_KSH) / 1000) * 1000;
    const reference = `order_${order.id}`;

    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/verify?reference=${reference}`;

    const paystackData = await initializeTransaction(
      email,
      totalKSH,
      reference,
      callbackUrl,
      { orderId: order.id }
    );

    // Store reference on order for verification
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntent: reference }
    });

    res.json({
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: paystackData.reference,
      orderId: order.id
    });
  } catch (error: any) {
    console.error('Paystack initialize error:', error);
    res.status(500).json({
      message: error.response?.data?.message || error.message || 'Failed to initialize payment'
    });
  }
});

// Verify payment (called by frontend after redirect)
router.get('/verify/:reference', protect, async (req: AuthRequest, res) => {
  try {
    const { reference } = req.params;

    const data = await verifyTransaction(reference);
    if (data.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful', data });
    }

    const orderId = data.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({ message: 'Invalid payment reference' });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        paymentIntent: data.reference,
        status: 'PROCESSING'
      }
    });

    await prisma.cartItem.deleteMany({ where: { userId: req.user!.id } });

    res.json({
      success: true,
      orderId,
      message: 'Payment verified successfully'
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      message: error.message || 'Verification failed'
    });
  }
});

// Webhook for Paystack (optional - for server-to-server confirmation)
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;

    if (payload.event === 'charge.success') {
      const reference = payload.data?.reference;
      if (reference) {
        const data = await verifyTransaction(reference);
        const orderId = data.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'paid', status: 'PROCESSING' }
          });
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // Always 200 so Paystack doesn't retry
  }
});

export default router;
