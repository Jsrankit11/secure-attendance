import express from 'express';
import { SecurityEventModel } from '../models/SecurityEvent.js';
import { AttendanceModel } from '../models/Attendance.js';
import { getDatabaseStatus } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/security/events
 * @desc    Get real-time security events & alarms
 * @access  Private
 */
router.get('/events', protect, async (req, res) => {
  try {
    const events = await SecurityEventModel.find();
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    console.error('Fetch Security Events Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving security events' });
  }
});

/**
 * @route   GET /api/security/telemetry
 * @desc    Get cryptographic health telemetry, active tamper alerts, and key specs
 * @access  Private
 */
router.get('/telemetry', protect, async (req, res) => {
  try {
    const records = await AttendanceModel.find();
    const tampered = records.filter((r) => r.isTampered);
    const verified = records.filter((r) => r.integrityStatus === 'VERIFIED');
    const dbStatus = getDatabaseStatus();

    res.json({
      success: true,
      telemetry: {
        totalRecords: records.length,
        verifiedCount: verified.length,
        tamperedCount: tampered.length,
        systemHealth: tampered.length > 0 ? 'CRITICAL_TAMPER_ALERT' : 'SECURE_ALL_HASHES_VERIFIED',
        activeHmacKey: 'v2.4-prod (HMAC-SHA256)',
        encryptionStandard: 'AES-256-GCM (96-bit authenticated IV)',
        passwordHashing: 'bcrypt (12 rounds salt)',
        database: dbStatus
      }
    });
  } catch (err) {
    console.error('Fetch Telemetry Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving telemetry' });
  }
});

export default router;

