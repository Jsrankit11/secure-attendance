import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, getDatabaseStatus } from '../server/config/db.js';
import { seedDatabase } from '../server/utils/seed.js';

import authRoutes from '../server/routes/authRoutes.js';
import attendanceRoutes from '../server/routes/attendanceRoutes.js';
import studentRoutes from '../server/routes/studentRoutes.js';
import auditRoutes from '../server/routes/auditRoutes.js';
import securityRoutes from '../server/routes/securityRoutes.js';

const app = express();

// Full CORS support for Vercel preview & production domains
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serverless DB Hydration Cache
let initPromise = null;
async function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await seedDatabase(false);
    })();
  }
  return initPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureInit();
    next();
  } catch (err) {
    console.error('Serverless DB Init Error:', err);
    next();
  }
});

// Health Check
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    runtime: 'Vercel Serverless Function',
    timestamp: new Date().toISOString(),
    service: 'CyberShield AI SecureAttendance Production API',
    database: getDatabaseStatus()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes (Mounted with and without /api to handle all rewrite rules)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/attendance', attendanceRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

app.use('/api/audit', auditRoutes);
app.use('/audit', auditRoutes);

app.use('/api/security', securityRoutes);
app.use('/security', securityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Vercel Serverless Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Serverless API Error'
  });
});

export default app;

