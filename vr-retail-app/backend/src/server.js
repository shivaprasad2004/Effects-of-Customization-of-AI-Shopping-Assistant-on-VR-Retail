const express = require('express');
const http = require('http');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const Redis = require('ioredis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', service: 'vr-retail-backend', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-retail');

  if (process.env.ENABLE_POSTGRES === 'true') {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URI });
    await pool.query('SELECT 1');
  }

  if (process.env.ENABLE_REDIS === 'true') {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    await redis.ping();
  }

  io.on('connection', () => {});

  server.listen(PORT, () => {
    console.log(`backend:${PORT}`);
  });
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
