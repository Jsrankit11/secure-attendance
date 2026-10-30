import express from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { SecurityEventModel } from '../models/SecurityEvent.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { hashPassword, comparePassword, computeBlockHash } from '../utils/crypto.js';
import { protect } from '../middleware/auth.js';
import { seedDatabase } from '../utils/seed.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_hackathon_2026_cybershield_ai';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Instructor or Student)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Student', studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const passwordHash = await hashPassword(password);
    const assignedStudentId = role === 'Student' ? (studentId || `STU-00${Date.now().toString().slice(-3)}`) : undefined;

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      studentId: assignedStudentId,
      avatar: `/students/${role === 'Student' ? 'vedika_gupta.png' : 'ankit_chaudhary.png'}`
    });

    const token = generateToken(user._id, user.role);

    await SecurityEventModel.create({
      timestamp: 'Just now',
      title: 'New Account Created',
      type: 'LOGIN_SUCCESS',
      severity: 'INFO',
      description: `New user account created: ${user.name} (${user.role}) with bcrypt salted hash`,
      resourceId: user._id,
      actor: user.name
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        avatar: user.avatar,
        keyFingerprint: user.keyFingerprint
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await SecurityEventModel.create({
        timestamp: 'Just now',
        title: 'Failed Authentication Attempt',
        type: 'AUTH_FAILURE',
        severity: 'MEDIUM',
        description: `Failed login attempt for ${email} - Invalid password hash comparison`,
        resourceId: email,
        actor: 'Unknown Client'
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    await SecurityEventModel.create({
      timestamp: 'Just now',
      title: 'MFA User Login Succeeded',
      type: 'LOGIN_SUCCESS',
      severity: 'INFO',
      description: `${user.name} (${user.role}) authenticated successfully. Signed JWT token issued.`,
      resourceId: user._id,
      actor: user.name
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        avatar: user.avatar,
        keyFingerprint: user.keyFingerprint,
        mfaEnabled: user.mfaEnabled,
        joinedDate: user.joinedDate
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      studentId: req.user.studentId,
      avatar: req.user.avatar,
      keyFingerprint: req.user.keyFingerprint,
      mfaEnabled: req.user.mfaEnabled,
      joinedDate: req.user.joinedDate
    }
  });
});

/**
 * @route   POST /api/auth/seed
 * @desc    Reset and re-seed database with initial demo data
 * @access  Public
 */
router.post('/seed', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ success: true, message: 'Database reset and seeded with 5 students and 1 instructor' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to seed database' });
  }
});

export default router;

