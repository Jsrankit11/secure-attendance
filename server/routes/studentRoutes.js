import express from 'express';
import { UserModel } from '../models/User.js';
import { AttendanceModel } from '../models/Attendance.js';
import { hashPassword } from '../utils/crypto.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/students
 * @desc    Get all registered students
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const users = await UserModel.find({ role: 'Student' });
    const attendanceRecords = await AttendanceModel.find();

    const students = users.map((u) => {
      const rec = attendanceRecords.find((r) => r.studentId === u.studentId);
      return {
        id: u._id || u.id,
        studentId: u.studentId,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        status: rec?.status || 'Present',
        keyFingerprint: u.keyFingerprint,
        joinedDate: u.joinedDate
      };
    });

    res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('Fetch Students Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
});

/**
 * @route   POST /api/students
 * @desc    Add a new student
 * @access  Private (Instructor only)
 */
router.post('/', protect, authorize('Instructor', 'Security Admin'), async (req, res) => {
  try {
    const { name, email, studentId, avatar } = req.body;

    if (!name || !email || !studentId) {
      return res.status(400).json({ success: false, message: 'Name, email, and studentId are required' });
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student with this email already exists' });
    }

    const passwordHash = await hashPassword('CyberStudent@2026!');
    const student = await UserModel.create({
      name,
      email: email.toLowerCase(),
      studentId,
      passwordHash,
      role: 'Student',
      avatar: avatar || '/students/vedika_gupta.png',
      keyFingerprint: 'A1B2 : C3D4 : E5F6 : 7890 : 1122 : 3344 : 5566 : 7788'
    });

    res.status(201).json({ success: true, student });
  } catch (err) {
    console.error('Create Student Error:', err);
    res.status(500).json({ success: false, message: 'Server error creating student' });
  }
});

/**
 * @route   PUT /api/students/:id/photo
 * @desc    Update student photo/avatar
 * @access  Private
 */
router.put('/:id/photo', protect, async (req, res) => {
  try {
    const { photoBase64 } = req.body;
    if (!photoBase64) {
      return res.status(400).json({ success: false, message: 'photoBase64 is required' });
    }

    const student = await UserModel.findById(req.params.id) || await UserModel.findOne({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Role check: Students can only update their own photo
    if (req.user.role === 'Student' && req.user._id !== student._id && req.user.studentId !== student.studentId) {
      return res.status(403).json({ success: false, message: 'Not authorized to change another student photo' });
    }

    await UserModel.updateOne({ _id: student._id || student.id }, { avatar: photoBase64 });
    if (student.studentId) {
      await AttendanceModel.updateOne({ studentId: student.studentId }, { avatar: photoBase64 });
    }

    res.json({ success: true, message: 'Student photo updated successfully', avatar: photoBase64 });
  } catch (err) {
    console.error('Update Photo Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating student photo' });
  }
});

export default router;

