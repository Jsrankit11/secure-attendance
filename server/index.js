import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, getDatabaseStatus } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import securityRoutes from './routes/securityRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CyberShield AI SecureAttendance Server',
    database: getDatabaseStatus()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/security', securityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server and Connect DB
async function startServer() {
  await connectDB();
  await seedDatabase(false);

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  SecureAttendance Backend API Running on Port ${PORT}`);
    console.log(`🔐  Encryption: AES-256-GCM | Integrity: HMAC-SHA256`);
    console.log(`🔑  Password Hashing: bcrypt (12 rounds)`);
    console.log(`🚀  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();

export { app };

