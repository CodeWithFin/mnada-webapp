# Neon DB Setup Guide

## Overview
This application uses [Neon DB](https://neon.tech) as the PostgreSQL database provider for all data storage, with local file storage for uploaded images.

## Prerequisites
- Neon account (free tier available)
- Node.js 18+ installed

## Setup Steps

### 1. Create Neon Database

1. Visit [https://console.neon.tech](https://console.neon.tech)
2. Sign up or log in to your Neon account
3. Click "Create a project" 
4. Choose:
   - **Project name**: `mnada-webapp` (or your preferred name)
   - **Database name**: `mnada` 
   - **Region**: Choose closest to your users
   - **PostgreSQL version**: Latest (recommended)

### 2. Get Database Connection Details

1. In your Neon dashboard, go to your project
2. Navigate to "Connection Details" or "Settings" 
3. Copy the **Connection string** (should look like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.neon.tech/database_name?sslmode=require
   ```

### 3. Configure Environment Variables

1. Create/update your `server/.env` file:
   ```bash
   # Database (Neon)
   DATABASE_URL="postgresql://neondb_owner:npg_jwbFXYtr26Dl@ep-muddy-brook-aib7vrkz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   
   # File Storage (Local)
   UPLOADS_DIR=uploads
   MAX_FILE_SIZE=10485760
   BASE_URL=http://localhost:5000
   
   # Other required variables (copy from .env.example)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PAYSTACK_SECRET_KEY=sk_test_xxxx
   # ... etc
   ```

### 4. Initialize Database Schema

1. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

2. Push schema to Neon database:
   ```bash
   npm run prisma:push
   ```

3. (Optional) Seed sample data:
   ```bash
   npm run seed
   npm run seed:posts
   ```

### 5. Verify Connection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test database connection by visiting:
   ```
   http://localhost:5000/health
   ```

   You should see: `{"ok":true,"message":"Database connected"}`

## Production Deployment

For production environments:

1. Use the production connection string from Neon
2. Set `NODE_ENV=production` 
3. Use `npm run prisma:migrate dev` for schema changes instead of `prisma:push`

## Neon Features Used

- **Serverless**: Database automatically scales to zero when not in use
- **Branching**: Create database branches for different environments
- **SSL**: All connections use SSL by default
- **Pooling**: Built-in connection pooling for better performance

## File Storage

This application uses local file storage for uploaded images:

- **Storage Location**: `server/uploads/` directory
- **Access URL**: `http://localhost:5000/uploads/filename.jpg`
- **Max File Size**: 10MB (configurable via MAX_FILE_SIZE)
- **Allowed Types**: Image files only

### Production File Storage

For production, consider:
- Using a CDN or cloud storage service
- Setting up proper backup for the uploads directory
- Configuring BASE_URL to your production domain

## Troubleshooting

### Common Issues

1. **"Cannot reach Neon DB"**
   - Check your DATABASE_URL is correct
   - Ensure your Neon project is active (not paused)
   - Verify network connectivity

2. **"Tables missing"**
   - Run `npm run prisma:push` to create tables
   - Check that the database name in your URL is correct

3. **SSL Connection Issues**
   - Ensure your connection string includes `?sslmode=require`
   - Neon requires SSL connections

### Getting Help

- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon Guide](https://neon.tech/docs/guides/prisma)