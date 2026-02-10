import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import postRoutes from './routes/posts';
import followRoutes from './routes/follows';
import uploadRoutes from './routes/upload';
import paymentRoutes from './routes/payment';
import cartRoutes from './routes/cart';
import userRoutes from './routes/users';
import otpRoutes from './routes/otp';
import adminRoutes from './routes/admin';

// Load .env: try root, then server/, then cwd (so server/.env is always used when present)
const rootEnv = path.join(process.cwd(), '.env');
const serverEnv = path.join(process.cwd(), 'server', '.env');
const parentEnv = path.join(process.cwd(), '..', '.env');
const localEnv = path.join(process.cwd(), '.env');
if (fs.existsSync(parentEnv)) dotenv.config({ path: parentEnv });
if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
if (fs.existsSync(serverEnv)) dotenv.config({ path: serverEnv });
dotenv.config({ path: localEnv });

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || (isProduction ? undefined : 'http://localhost:5173'),
  credentials: true
}));

// Security headers - Allow Google Fonts and external resources
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: http:; " +
    "connect-src 'self' https:; " +
    "frame-src 'self'; " +
    "object-src 'none';"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mnada API is running' });
});

// Database check (helps debug 503 on register/login)
app.get('/api/health/db', async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ ok: false, message: 'DATABASE_URL is not set in .env' });
    }
    const prisma = (await import('./utils/prisma')).default;
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: 'Database connected' });
  } catch (e: any) {
    const msg = e?.message || '';
    res.status(503).json({
      ok: false,
      message: msg.includes('reach database') || msg.includes('P1001')
        ? 'Cannot reach Neon DB. Check your DATABASE_URL and ensure your Neon database is active.'
        : msg.includes('does not exist') || msg.includes('P2021')
          ? 'Tables missing. Run `npm run prisma:push` to create tables in your Neon database.'
          : msg || 'Database error'
    });
  }
});

// Monolithic: serve React build and SPA fallback (support run from root or backend/)
if (isProduction) {
  const clientDistCandidates = [
    path.join(process.cwd(), 'client', 'dist'),
    path.join(process.cwd(), '..', 'client', 'dist')
  ];
  const clientDist = clientDistCandidates.find((p) => fs.existsSync(p));
  if (clientDist) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Mnada running on port ${PORT}${isProduction ? ' (monolithic)' : ''}`);
});

export default app;

