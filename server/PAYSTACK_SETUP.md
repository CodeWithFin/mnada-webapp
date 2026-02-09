# Paystack Payment Setup

Checkout uses [Paystack](https://paystack.com/) for payments (card, mobile money, etc.). Payments are in **KES** (Kenyan Shillings).

## 1. Get API keys

1. Sign up at [Paystack](https://dashboard.paystack.com/#/signup).
2. In the Dashboard go to **Settings → API Keys & Webhooks**.
3. Copy your **Secret Key** (use Test key for development, Live key for production).

## 2. Backend environment

In `server/.env` (or root `.env`) add:

```env
# Paystack (required for checkout)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Used as redirect URL after payment (required for Paystack callback)
FRONTEND_URL=http://localhost:5173
```

- **PAYSTACK_SECRET_KEY**: Your Paystack Secret Key (starts with `sk_test_` or `sk_live_`).
- **FRONTEND_URL**: Base URL of your frontend. After payment, users are sent to `{FRONTEND_URL}/payment/verify?reference=...`. In production set this to your real domain (e.g. `https://mnada.example.com`).

## 3. Flow

1. User fills shipping + email on Checkout and clicks **Pay with Paystack**.
2. Backend creates the order and calls Paystack **Initialize Transaction** (amount in KES).
3. User is redirected to Paystack to complete payment.
4. Paystack redirects back to `{FRONTEND_URL}/payment/verify?reference=...`.
5. Frontend calls `GET /api/payment/verify/:reference`; backend verifies with Paystack, marks order as paid, clears cart, and returns order id.
6. User is redirected to the order confirmation page.

## 4. Webhook (optional)

For extra reliability you can configure a Paystack webhook:

1. In Paystack Dashboard: **Settings → API Keys & Webhooks** → Webhook URL.
2. Set URL to: `https://your-api-domain.com/api/payment/webhook`.
3. Paystack will send `charge.success` to this URL; the backend will verify and update the order.

## 5. Testing

- Use **Test** keys and Paystack test cards (see [Paystack test cards](https://paystack.com/docs/payments/test-payments)).
- Ensure `FRONTEND_URL` is reachable by your browser (e.g. `http://localhost:5173` for local dev).

## 6. Troubleshooting

- **"Paystack secret key is required"**  
  Set `PAYSTACK_SECRET_KEY` in `server/.env` and restart the server.

- **Redirect goes to wrong URL**  
  Set `FRONTEND_URL` in `server/.env` to the exact base URL (no trailing slash) where the frontend runs.

- **Verification fails after payment**  
  Ensure the user is logged in when landing on `/payment/verify` (the verify API requires auth). If the session is lost on redirect, consider storing a short-lived token in the callback URL or using a different flow.
