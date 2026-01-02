import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { initiateSTKPush, querySTKPushStatus } from '../utils/mpesa';
import prisma from '../utils/prisma';

const router = express.Router();

// Initiate M-Pesa STK Push
router.post('/stk-push', protect, async (req: AuthRequest, res) => {
  try {
    const { phoneNumber, amount, orderId } = req.body;

    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({ message: 'Phone number, amount, and order ID are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user!.id
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Initiate STK push
    const stkResponse = await initiateSTKPush(
      phoneNumber,
      amount,
      `ORDER-${orderId.slice(0, 8)}`,
      `Payment for order ${orderId.slice(0, 8)}`
    );

    // Update order with checkout request ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentIntent: stkResponse.CheckoutRequestID
      }
    });

    res.json({
      checkoutRequestID: stkResponse.CheckoutRequestID,
      responseCode: stkResponse.ResponseCode,
      customerMessage: stkResponse.CustomerMessage
    });
  } catch (error: any) {
    console.error('STK Push route error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    // Provide more detailed error message
    const errorMessage = error.message || 'Failed to initiate payment';
    const statusCode = error.response?.status || 500;
    
    res.status(statusCode).json({ 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.response?.data,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      })
    });
  }
});

// Query STK Push status
router.post('/stk-query', protect, async (req: AuthRequest, res) => {
  try {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
      return res.status(400).json({ message: 'Checkout request ID is required' });
    }

    const queryResponse = await querySTKPushStatus(checkoutRequestID);

    res.json(queryResponse);
  } catch (error: any) {
    console.error('STK Query error:', error);
    res.status(500).json({ message: error.message || 'Failed to query payment status' });
  }
});

// M-Pesa callback handler (no auth required - called by Safaricom)
router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body;

    // Safaricom sends the callback in a specific format
    const body = callbackData.Body || callbackData;
    const stkCallback = body.stkCallback || body;

    if (!stkCallback) {
      return res.status(400).json({ message: 'Invalid callback data' });
    }

    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Find order by checkout request ID
    const order = await prisma.order.findFirst({
      where: {
        paymentIntent: checkoutRequestID
      }
    });

    if (!order) {
      console.error('Order not found for checkout request:', checkoutRequestID);
      return res.status(404).json({ message: 'Order not found' });
    }

    // ResultCode 0 means success
    if (resultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata?.Item || [];

      // Extract M-Pesa receipt number
      let mpesaReceiptNumber = '';
      for (const item of items) {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaReceiptNumber = item.Value;
          break;
        }
      }

      // Update order as paid
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paymentIntent: mpesaReceiptNumber || checkoutRequestID,
          status: 'PROCESSING'
        }
      });

      // Clear cart after successful payment
      await prisma.cartItem.deleteMany({
        where: { userId: order.userId }
      });

      console.log(`Order ${order.id} payment confirmed. Receipt: ${mpesaReceiptNumber}`);
    } else {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed'
        }
      });

      console.log(`Order ${order.id} payment failed. Reason: ${resultDesc}`);
    }

    // Always return success to Safaricom
    res.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });
  } catch (error: any) {
    console.error('Callback processing error:', error);
    // Still return success to Safaricom to prevent retries
    res.json({
      ResultCode: 0,
      ResultDesc: 'Callback received'
    });
  }
});

export default router;



