import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import setupSocket from './socket.js';

// Routes
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exam.js';
import submissionRoutes from './routes/submission.js';
import proctorRoutes from './routes/proctor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Allowed origins — covers localhost + any *.vercel.app + custom domain
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/,          // any *.vercel.app domain
  process.env.CLIENT_URL,    // set your custom domain here in Vercel env vars
].filter(Boolean);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Permissions-Policy', 'clipboard-read=(), clipboard-write=()');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Core middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Lazy DB connection — runs before every request in serverless environments
// In local mode, connectDB() is called once in start() before the server opens
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/submission', submissionRoutes);
app.use('/api/proctor', proctorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Setup Socket.io handlers
setupSocket(io);

// ─── Deployment ───────────────────────────────────────────────────────────────

// Export httpServer so Vercel's @vercel/node runtime can handle requests
export default httpServer;

// Only bind to a port when running locally (Vercel sets process.env.VERCEL=1)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  dbConnected = true; // mark as connected (start() handles it)
  connectDB().then(() => {
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 ExamGuard server running on port ${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  });
}
