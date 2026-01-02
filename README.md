# Mnada - Full-Stack E-commerce & Social Media Platform

A modern full-stack application combining e-commerce functionality with social media features, built with TypeScript, React, Node.js, Express, and MongoDB.

## 🚀 Features

### E-commerce
- Product catalog with search and filtering
- Shopping cart with persistent storage
- Secure checkout with Stripe integration
- Order management
- Product detail pages with image zoom

### Social Media
- User profiles with follow/unfollow system
- Activity feed showing posts from followed users
- Explore page with latest and popular posts
- Post creation with image upload
- Like and comment functionality
- Locket-style full-screen image posts

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Payment**: Stripe
- **Language**: TypeScript

### Frontend
- **Framework**: React with Hooks
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios
- **Language**: TypeScript

## 📦 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/mnada
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
FRONTEND_URL=http://localhost:5173

# Email Configuration (for OTP/passwordless auth)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
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

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional, for Stripe):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

4. Start the development server:
```bash
npm run dev
```

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

### Payment
- `POST /api/payment/create-intent` - Create Stripe payment intent

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
