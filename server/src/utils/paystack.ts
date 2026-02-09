import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initialize a transaction - returns authorization_url for redirect
export async function initializeTransaction(
  email: string,
  amount: number, // amount in KES (we'll convert to cents in the function)
  reference: string,
  callbackUrl: string,
  metadata?: Record<string, unknown>
) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is required. Set PAYSTACK_SECRET_KEY in .env');
  }

  // Paystack expects amount in currency subunits. For KES: 1 KES = 100 cents, so amount in KES * 100
  const amountInCents = Math.round(amount * 100);

  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amountInCents,
      currency: 'KES',
      reference,
      callback_url: callbackUrl,
      metadata: metadata || {}
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.data.status) {
    throw new Error(response.data.message || 'Failed to initialize payment');
  }

  return response.data.data;
}

// Verify a transaction by reference
export async function verifyTransaction(reference: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is required');
  }

  const response = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }
  );

  if (!response.data.status) {
    throw new Error(response.data.message || 'Verification failed');
  }

  return response.data.data;
}
