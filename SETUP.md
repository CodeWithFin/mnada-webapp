# Mnada Setup Guide

This guide will help you set up and run the Mnada project locally.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Cloudinary account (for image uploads)
- Stripe account (for payments)

## Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/mnada
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
FRONTEND_URL=http://localhost:5173
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

The API will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional, for Stripe):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## Features

### E-commerce
- Product catalog with search and filtering
- Shopping cart with persistent storage
- Secure checkout with Stripe integration
- Order management
- Product detail pages

### Social Media
- User profiles with follow/unfollow system
- Activity feed showing posts from followed users
- Explore page with latest and popular posts
- Post creation with image upload
- Like and comment functionality
- Full-screen post viewing

## Design System

The application uses a dark theme with neon green accents:
- Background: Black (#000)
- Accent: Neon Green (#C0FF00)
- Fonts: Inter (sans), Space Grotesk (display), JetBrains Mono (mono)
- Smooth scroll animations
- Custom scrollbar styling

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with search and filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

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

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/posts` - Get user's posts

### Upload
- `POST /api/upload` - Upload image to Cloudinary

### Payment
- `POST /api/payment/create-intent` - Create Stripe payment intent

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your DATABASE_URL in the `.env` file
- Run `npm run prisma:generate` and `npm run prisma:migrate`

### Image Upload Issues
- Verify your Cloudinary credentials in the `.env` file
- Check that the image file size is under 10MB

### Payment Issues
- Ensure Stripe keys are correctly set in both server and client `.env` files
- Use test keys for development

## License

MIT License

