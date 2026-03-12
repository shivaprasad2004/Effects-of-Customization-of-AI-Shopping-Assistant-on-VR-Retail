/**
 * VR Retail Backend - Main Server Entry Point
 * Initializes Express app, Socket.io, DB connections, and all routes.
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectMongo = require('./config/mongoose');
const connectPostgres = require('./config/postgres');
const connectRedis = require('./config/redis');
const { initSocketHandlers } = require('./socket/socketHandlers');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// ── Route imports ─────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const emotionRoutes = require('./routes/emotionRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const crmRoutes = require('./routes/crmRoutes');
const displayRoutes = require('./routes/displayRoutes');

const app = express();
const server = http.createServer(app);

// ── Socket.io Setup ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available to routes via req.io
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use('/api', rateLimiter);

// ── Static Files (uploaded assets) ───────────────────────────
app.use('/uploads', express.static('uploads'));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/display', displayRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'vr-retail-backend' });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectMongo();
    if (process.env.DISABLE_POSTGRES !== 'true') {
      await connectPostgres();
    }
    if (process.env.DISABLE_REDIS !== 'true') {
      await connectRedis();
    }

    // Register Socket.io event handlers
    initSocketHandlers(io);

    server.listen(PORT, () => {
      logger.info(`🚀 VR Retail Backend running on port ${PORT}`);
      logger.info(`🌐 Client URL: ${process.env.CLIENT_URL}`);
      logger.info(`🔌 Socket.io ready`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

module.exports = { app, server, io };
