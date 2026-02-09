# Mnada – E-commerce & Social

Monolithic full-stack app (Express API + React) with **Supabase** as the database. E-commerce (products, cart, Paystack checkout) and social features (feed, posts, follows, OTP auth).

## Features

- **E-commerce**: Products, cart, checkout with **Paystack** (KES), orders
- **Social**: Feed, explore, posts, likes, comments, follow, profiles
- **Auth**: OTP (magic link) and optional password; JWT
- **Admin**: Dashboard, products CRUD, orders (admin-only)

## Stack

- **Backend**: Node, Express, Prisma
- **Database**: **Supabase** (PostgreSQL)
- **Frontend**: React, Vite, Tailwind, Zustand, React Router
- **Payments**: Paystack  
- **Storage**: Supabase Storage (bucket)

## Setup

### 1. Supabase database

Create a project at [Supabase](https://supabase.com), run the SQL in **SUPABASE_SETUP.md**, and set `DATABASE_URL` (Session pooler). See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for the full steps.

### 2. Install and env

From the **project root**:

```bash
npm run install:all
```

Copy env and set at least `DATABASE_URL` (and other required vars):

```bash
cp .env.example .env
# Edit .env: DATABASE_URL (Supabase), JWT_SECRET, PAYSTACK_SECRET_KEY, email, etc.
```

You can keep using `server/.env` instead of root `.env` if you run the server from `server/`.

### 3. Database tables and Prisma

In Supabase: run **`server/prisma/supabase-init.sql`** in the SQL Editor (see SUPABASE_SETUP.md). Then from the project root:

```bash
npm run prisma:generate
npm run seed
npm run seed:posts
```

### 4. Run

**Development** (API on :5000, frontend on :5173 with proxy to API):

```bash
npm run dev
```

**Production** (single port – API + static client):

```bash
npm run build
NODE_ENV=production npm start
```

Then open the URL shown (e.g. `http://localhost:5000`). In production the app is monolithic: one server serves both the React app and `/api/*`.

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (password-based)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Passwordless Authentication (OTP)
- `POST /api/otp/request` - Request OTP code (sends email)
- `POST /api/otp/verify` - Verify OTP code and get JWT token
- `POST /api/otp/resend` - Resend OTP code

### Products
- `GET /api/products` - Get all products (with search and filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/pay` - Update order payment status

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/feed` - Get posts from followed users
- `GET /api/posts/explore` - Get latest/popular posts
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id/like` - Like/unlike a post
- `POST /api/posts/:id/comment` - Add comment to post
- `DELETE /api/posts/:id` - Delete post

### Follows
- `PUT /api/follows/:userId` - Follow/unfollow a user
- `GET /api/follows/:userId` - Get user's followers and following

### Upload
- `POST /api/upload` - Upload image to Cloudinary

### Payment (Paystack)
- `POST /api/payment/initialize` - Create order and get Paystack payment link
- `GET /api/payment/verify/:reference` - Verify payment and complete order

## 🎨 Design System

The application uses a dark theme with modern animations and effects:
- Viewport reveal animations
- Border beam effects
- Flashlight hover effects
- Smooth transitions
- Responsive grid layouts

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Input validation
- CORS configuration

## 📝 License

This project is open source and available under the MIT License.

# mnada-webapp
