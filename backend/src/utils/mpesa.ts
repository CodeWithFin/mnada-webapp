import axios from 'axios';
import crypto from 'crypto';

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';

// Get M-Pesa access token
export async function getMpesaAccessToken(): Promise<string> {
  try {
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error('M-Pesa Consumer Key and Consumer Secret are required. Please check your .env file.');
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    if (!response.data.access_token) {
      throw new Error('No access token received from M-Pesa API');
    }

    return response.data.access_token;
  } catch (error: any) {
    console.error('M-Pesa access token error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Invalid M-Pesa Consumer Key or Consumer Secret. Please check your credentials.');
    }
    throw new Error(`Failed to get M-Pesa access token: ${error.response?.data?.error_description || error.message}`);
  }
}

// Generate password for STK push
function generatePassword(): string {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
  return password;
}

// Generate timestamp
function generateTimestamp(): string {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}

// Initiate STK Push
export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<any> {
  try {
    // Validate required credentials
    if (!SHORTCODE || SHORTCODE === '') {
      throw new Error('M-Pesa Shortcode is required. Please set MPESA_SHORTCODE in your .env file.');
    }
    if (!PASSKEY || PASSKEY === '' || PASSKEY === 'placeholder_will_fail_but_code_will_run') {
      throw new Error('M-Pesa Passkey is required. Please set MPESA_PASSKEY in your .env file. Get it from your Safaricom Developer Portal.');
    }
    if (!CALLBACK_URL || CALLBACK_URL === '') {
      throw new Error('M-Pesa Callback URL is required. Please set MPESA_CALLBACK_URL in your .env file.');
    }

    const accessToken = await getMpesaAccessToken();
    
    // Format phone number (remove leading 0, add 254)
    const formattedPhone = phoneNumber.startsWith('0')
      ? `254${phoneNumber.slice(1)}`
      : phoneNumber.startsWith('254')
      ? phoneNumber
      : `254${phoneNumber}`;

    const timestamp = generateTimestamp();
    const password = generatePassword();

    const requestBody = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // Amount in KSH
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    console.log('Initiating STK Push with:', {
      BusinessShortCode: SHORTCODE,
      Amount: Math.round(amount),
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL
    });

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('STK Push error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.errorMessage || error.response?.data?.error_description || 'Invalid request to M-Pesa API';
      throw new Error(`M-Pesa API Error: ${errorMsg}`);
    }
    if (error.response?.status === 401) {
      throw new Error('M-Pesa authentication failed. Please check your credentials.');
    }
    throw new Error(error.message || error.response?.data?.errorMessage || 'Failed to initiate STK push');
  }
}

// Verify STK push result
export async function querySTKPushStatus(checkoutRequestID: string): Promise<any> {
  try {
    const accessToken = await getMpesaAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword();

    const requestBody = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('STK Query error:', error.response?.data || error.message);
    throw new Error('Failed to query STK push status');
  }
}

