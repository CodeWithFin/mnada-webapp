# Mnada Project Summary

## Overview

Mnada is a full-stack e-commerce and social media platform that combines shopping functionality with social networking features. The project uses the modern dark theme design system provided, featuring neon green accents and smooth animations.

## Project Structure

```
mnada/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT authentication middleware
│   │   ├── models/              # (Prisma handles models)
│   │   ├── routes/
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   ├── products.ts      # Product CRUD routes
│   │   │   ├── cart.ts          # Shopping cart routes
│   │   │   ├── orders.ts        # Order management routes
│   │   │   ├── posts.ts         # Social media posts routes
│   │   │   ├── follows.ts       # Follow/unfollow routes
│   │   │   ├── users.ts         # User profile routes
│   │   │   ├── upload.ts        # Image upload to Cloudinary
│   │   │   └── payment.ts       # Stripe payment integration
│   │   ├── utils/
│   │   │   └── prisma.ts        # Prisma client instance
│   │   └── index.ts            # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Navigation bar
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── CreatePost.tsx   # Post creation component
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Landing page
│   │   │   ├── Products.tsx     # Product listing
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx     # Stripe checkout
│   │   │   ├── Orders.tsx
│   │   │   ├── Feed.tsx         # Social feed
│   │   │   ├── Explore.tsx      # Explore posts
│   │   │   ├── Profile.tsx       # User profile
│   │   │   ├── PostDetail.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts     # Zustand auth state
│   │   │   └── cartStore.ts     # Zustand cart state
│   │   ├── utils/
│   │   │   └── api.ts           # Axios instance with interceptors
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript type definitions
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # React entry point
│   │   └── index.css            # Global styles with design system
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js       # Tailwind with custom design tokens
│   └── vite.config.ts
│
├── README.md                     # Original project description
├── SETUP.md                      # Setup instructions
└── .gitignore
```

## Design System Implementation

The design system from the provided HTML has been fully implemented:

### Colors
- **Neon Green**: `#C0FF00` - Primary accent color
- **Dark Background**: `#000000` - Main background
- **Panel Background**: `#0A0A0A` - Secondary background
- **Zinc shades**: Used for borders and text variations

### Typography
- **Sans**: Inter (body text)
- **Display**: Space Grotesk (headings)
- **Mono**: JetBrains Mono (code/technical text)

### Features
- Smooth scroll animations with Intersection Observer
- Custom scrollbar styling
- Neon glow effects
- Reveal-on-scroll animations
- Responsive design

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **File Storage**: Cloudinary
- **Payment**: Stripe
- **Language**: TypeScript

### Frontend
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Payment**: Stripe React components
- **Icons**: Lucide Icons
- **Language**: TypeScript
- **Build Tool**: Vite

## Key Features Implemented

### E-commerce
✅ Product catalog with search and filtering
✅ Shopping cart with persistent storage
✅ Secure checkout with Stripe integration
✅ Order management and history
✅ Product detail pages with image gallery

### Social Media
✅ User authentication (register/login)
✅ User profiles with follow/unfollow
✅ Activity feed (posts from followed users)
✅ Explore page (latest and popular posts)
✅ Post creation with image upload
✅ Like and comment functionality
✅ Full-screen post viewing

### Additional
✅ Image upload to Cloudinary
✅ JWT-based authentication
✅ Protected routes
✅ Responsive design
✅ Dark theme with neon accents
✅ Smooth animations

## Database Schema

The Prisma schema includes:
- Users (with authentication)
- Products (with images, pricing, stock)
- Cart Items
- Orders and Order Items
- Posts (social media)
- Comments
- Likes
- Follows (user relationships)

## Next Steps

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Set up Cloudinary account
5. Set up Stripe account (test mode)
6. Install dependencies and run both servers

See `SETUP.md` for detailed instructions.

