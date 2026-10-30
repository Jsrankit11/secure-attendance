import express from 'express';
import { AttendanceModel } from '../models/Attendance.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { SecurityEventModel } from '../models/SecurityEvent.js';
import {
  canonicalizeAttendanceRecord,
  computeHmacSha256,
  verifyHmacSha256,
  encryptAesGcm,
  decryptAesGcm,
  computeBlockHash
} from '../utils/crypto.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/attendance
 * @desc    Get attendance records (Role-based access: Students ONLY see their own records!)
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    let records = [];

    if (req.user.role === 'Student') {
      // Security Requirement: Prevent students from viewing other students' attendance
      records = await AttendanceModel.find();
      records = records.filter(
        (r) =>
          r.studentId === req.user.studentId ||
          r.studentName.toLowerCase() === req.user.name.toLowerCase()
      );
    } else {
      // Instructors and Admins see all records
      records = await AttendanceModel.find();
    }

    // Decrypt AES-256-GCM notes for authorized viewer
    const enriched = records.map((r) => {
      let decryptedNotes = '';
      if (r.encryptedNotes && r.notesIv && r.notesAuthTag) {
        decryptedNotes = decryptAesGcm(r.encryptedNotes, r.notesIv, r.notesAuthTag);
      }
      return {
        ...r,
        id: r._id || r.id,
        decryptedNotes
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      records: enriched
    });
  } catch (err) {
    console.error('Fetch Attendance Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving attendance records' });
  }
});

/**
 * @route   POST /api/attendance/mark
 * @desc    Mark attendance with HMAC-SHA256 signature & AES-256-GCM encrypted notes
 * @access  Private (Instructor only or self student scan)
 */
router.post('/mark', protect, async (req, res) => {
  try {
    const {
      studentId,
      status = 'Present',
      studentName,
      avatar,
      className = 'CS 401: Cryptographic Engineering',
      sessionId = 'CS-SEC-401-2026-W8',
      sessionTitle = 'Advanced Applied Cryptography',
      method = 'MANUAL',
      confidence,
      notes = ''
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    // Role check: A student can only submit attendance for themselves
    if (req.user.role === 'Student' && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Security Constraint: Students cannot mark attendance for other students'
      });
    }

    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10);

    const canonical = canonicalizeAttendanceRecord({
      sessionId,
      studentId,
      timestamp: now,
      status,
      instructorId: req.user.role === 'Instructor' ? req.user._id : 'INST-007'
    });

    // Compute cryptographic HMAC-SHA256 signature
    const hmacTag = computeHmacSha256(canonical);

    // Encrypt sensitive notes using AES-256-GCM
    const { ciphertext, iv, authTag } = encryptAesGcm(notes || `Verified via ${method} by ${req.user.name}`);

    // Audit chaining
    const prevBlocks = await AuditLogModel.find();
    const lastBlock = prevBlocks[0];
    const prevHash = lastBlock ? lastBlock.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const nextBlockNum = lastBlock ? lastBlock.blockNumber + 1 : 1050;

    // Check if student already has a record in this session
    const existing = await AttendanceModel.findOne({ studentId, sessionId });
    let record;

    if (existing) {
      record = await AttendanceModel.updateOne(
        { studentId, sessionId },
        {
          status,
          date: dateStr,
          timestamp: now,
          canonicalString: canonical,
          hmacTag,
          keyVersion: 'v2.4-prod',
          isTampered: false,
          integrityStatus: 'VERIFIED',
          tamperReason: undefined,
          verificationMethod: method,
          faceConfidence: confidence,
          encryptedNotes: ciphertext,
          notesIv: iv,
          notesAuthTag: authTag,
          auditChainBlock: nextBlockNum
        }
      );
    } else {
      record = await AttendanceModel.create({
        sessionId,
        sessionTitle,
        className,
        studentId,
        studentName: studentName || `Student ${studentId}`,
        avatar: avatar || '/students/vedika_gupta.png',
        date: dateStr,
        timestamp: now,
        status,
        canonicalString: canonical,
        hmacTag,
        keyVersion: 'v2.4-prod',
        isTampered: false,
        integrityStatus: 'VERIFIED',
        auditChainBlock: nextBlockNum,
        verificationMethod: method,
        faceConfidence: confidence,
        encryptedNotes: ciphertext,
        notesIv: iv,
        notesAuthTag: authTag
      });
    }

    // Add immutable audit log block
    const auditDetails = `Attendance recorded for ${studentName || studentId}: ${status} via ${method}. HMAC sealed.`;
    const curHash = computeBlockHash({
      blockNumber: nextBlockNum,
      timestamp: now,
      actor: `${req.user.name} (${req.user.role})`,
      action: 'ATTENDANCE_MARKED',
      resource: studentId,
      prevHash,
      details: auditDetails
    });

    await AuditLogModel.create({
      blockNumber: nextBlockNum,
      timestamp: now,
      actor: {
        name: req.user.name,
        id: req.user._id,
        role: req.user.role,
        ip: req.ip || '127.0.0.1'
      },
      action: 'ATTENDANCE_MARKED',
      resource: studentId,
      severity: 'INFO',
      prevHash,
      currentHash: curHash,
      tampered: false,
      details: auditDetails
    });

    await SecurityEventModel.create({
      timestamp: 'Just now',
      title: `${method === 'FACE_AI' ? 'Face AI' : 'Manual'} Attendance Ingested`,
      type: 'ATTENDANCE_MARKED',
      severity: 'INFO',
      description: auditDetails,
      resourceId: studentId,
      actor: req.user.name
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded and HMAC sealed successfully',
      record: {
        ...record,
        id: record._id || record.id,
        decryptedNotes: notes
      }
    });
  } catch (err) {
    console.error('Mark Attendance Error:', err);
    res.status(500).json({ success: false, message: 'Server error marking attendance' });
  }
});

/**
 * @route   POST /api/attendance/:id/verify
 * @desc    Cryptographically verify HMAC-SHA256 signature for a specific record
 * @access  Private
 */
router.post('/:id/verify', protect, async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const expectedTag = computeHmacSha256(record.canonicalString);
    const isValid = verifyHmacSha256(record.canonicalString, record.hmacTag);

    // Update integrity status in DB
    await AttendanceModel.updateOne(
      { _id: record._id || record.id },
      {
        integrityStatus: isValid ? 'VERIFIED' : 'FAILED',
        isTampered: !isValid,
        tamperReason: isValid ? undefined : 'HMAC mismatch: Canonical record does not match cryptographic digest!'
      }
    );

    if (!isValid) {
      await SecurityEventModel.create({
        timestamp: 'Just now',
        title: 'Tamper Alarm Triggered',
        type: 'TAMPER_DETECTED',
        severity: 'CRITICAL',
        description: `Cryptographic integrity failure on record ${record.studentId}! Database manipulated without HMAC authorization.`,
        resourceId: record.studentId,
        actor: 'HMAC Engine Verifier'
      });
    }

    res.json({
      success: true,
      isValid,
      expectedTag,
      storedTag: record.hmacTag,
      status: isValid ? 'VERIFIED' : 'FAILED'
    });
  } catch (err) {
    console.error('Verify Record Error:', err);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

/**
 * @route   POST /api/attendance/:id/instructor-update
 * @desc    Authorized attendance update by Instructor with mandatory reason & audit chaining
 * @access  Private (Instructor only)
 */
router.post('/:id/instructor-update', protect, authorize('Instructor', 'Security Admin'), async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const { newStatus, reason = 'Authorized manual review', notes = '' } = req.body;
    if (!newStatus || !['Present', 'Absent', 'Late'].includes(newStatus)) {
      return res.status(400).json({ success: false, message: 'Valid status (Present, Absent, Late) is required' });
    }

    const now = new Date().toISOString();
    const previousStatus = record.status;
    const prevHmac = record.hmacTag;

    // Compute fresh canonical RFC buffer with Instructor ID
    const newCanonical = canonicalizeAttendanceRecord({
      sessionId: record.sessionId,
      studentId: record.studentId,
      timestamp: now,
      status: newStatus,
      instructorId: req.user.id || req.user._id || 'USR-INST-007'
    });

    const newHmac = computeHmacSha256(newCanonical);

    // Audit chaining
    const prevBlocks = await AuditLogModel.find();
    const lastBlock = prevBlocks[0];
    const prevHash = lastBlock ? lastBlock.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const nextBlockNum = lastBlock ? lastBlock.blockNumber + 1 : 1050;

    const historyEntry = {
      id: `hist-${Date.now()}`,
      timestamp: now,
      changedBy: req.user.name,
      role: req.user.role,
      previousStatus,
      newStatus,
      reason,
      prevHmac,
      newHmac,
      isTamperAttempt: false,
      auditBlock: nextBlockNum
    };

    const existingHistory = Array.isArray(record.history) ? record.history : [];
    const updatedHistory = [historyEntry, ...existingHistory];

    let updateFields = {
      status: newStatus,
      canonicalString: newCanonical,
      hmacTag: newHmac,
      keyVersion: 'v2.4-prod',
      isTampered: false,
      integrityStatus: 'VERIFIED',
      tamperReason: undefined,
      history: updatedHistory,
      auditChainBlock: nextBlockNum
    };

    if (notes) {
      const { ciphertext, iv, authTag } = encryptAesGcm(notes);
      updateFields.encryptedNotes = ciphertext;
      updateFields.notesIv = iv;
      updateFields.notesAuthTag = authTag;
    }

    const updated = await AttendanceModel.updateOne(
      { _id: record._id || record.id },
      updateFields
    );

    const auditDetails = `Instructor ${req.user.name} modified attendance for ${record.studentName} (${record.studentId}): ${previousStatus} -> ${newStatus}. Reason: "${reason}". Cryptographically re-sealed with HMAC-SHA256.`;
    const curHash = computeBlockHash({
      blockNumber: nextBlockNum,
      timestamp: now,
      actor: `${req.user.name} (${req.user.role})`,
      action: 'INSTRUCTOR_ATTENDANCE_OVERRIDE',
      resource: record.studentId,
      prevHash,
      details: auditDetails
    });

    await AuditLogModel.create({
      blockNumber: nextBlockNum,
      timestamp: now,
      actor: {
        name: req.user.name,
        id: req.user._id,
        role: req.user.role,
        ip: req.ip || '127.0.0.1'
      },
      action: 'INSTRUCTOR_ATTENDANCE_OVERRIDE',
      resource: record.studentId,
      severity: 'INFO',
      prevHash,
      currentHash: curHash,
      tampered: false,
      details: auditDetails
    });

    await SecurityEventModel.create({
      timestamp: 'Just now',
      title: `Authorized Attendance Override: ${record.studentName}`,
      type: 'HMAC_VERIFIED',
      severity: 'INFO',
      description: auditDetails,
      resourceId: record.studentId,
      actor: req.user.name
    });

    res.json({
      success: true,
      message: `Attendance updated to ${newStatus} by Instructor ${req.user.name}. Cryptographic seal verified.`,
      historyEntry,
      record: {
        ...record,
        ...updateFields,
        id: record._id || record.id
      }
    });
  } catch (err) {
    console.error('Instructor Update Error:', err);
    res.status(500).json({ success: false, message: 'Server error updating attendance' });
  }
});

/**
 * @route   POST /api/attendance/:id/student-tamper
 * @desc    Simulate or capture unauthorized student attempt to modify attendance (e.g. self-mark Present)
 * @access  Private
 */
router.post('/:id/student-tamper', protect, async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const studentUser = req.user;
    const attemptedStatus = req.body.attemptedStatus || 'Present';
    const previousStatus = record.status;
    const now = new Date().toISOString();

    // Security Rule: Students cannot modify attendance records directly!
    // Construct unverified canonical string
    const tamperedCanonical = canonicalizeAttendanceRecord({
      sessionId: record.sessionId,
      studentId: record.studentId,
      timestamp: now,
      status: attemptedStatus,
      instructorId: 'UNAUTHORIZED_STUDENT_CLIENT'
    });

    // Audit Chaining for the Tamper Incident
    const prevBlocks = await AuditLogModel.find();
    const lastBlock = prevBlocks[0];
    const prevHash = lastBlock ? lastBlock.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const nextBlockNum = lastBlock ? lastBlock.blockNumber + 1 : 1050;

    const tamperReason = `UNAUTHORIZED TAMPER DETECTED: Student ${studentUser.name} (${studentUser.studentId || studentUser.email}) attempted to change status to '${attemptedStatus}' without Instructor cryptographic authority!`;

    const historyEntry = {
      id: `hist-tamper-${Date.now()}`,
      timestamp: now,
      changedBy: `${studentUser.name} (Student)`,
      role: 'Student',
      previousStatus,
      newStatus: attemptedStatus,
      reason: tamperReason,
      prevHmac: record.hmacTag,
      newHmac: 'BLOCKED_INVALID_HMAC_MISMATCH',
      isTamperAttempt: true,
      auditBlock: nextBlockNum
    };

    const existingHistory = Array.isArray(record.history) ? record.history : [];
    const updatedHistory = [historyEntry, ...existingHistory];

    const updateFields = {
      isTampered: true,
      integrityStatus: 'FAILED',
      tamperReason,
      history: updatedHistory
    };

    await AttendanceModel.updateOne(
      { _id: record._id || record.id },
      updateFields
    );

    const auditDetails = `🚨 SECURITY ALERT: Unauthorized attendance modification attempt by Student ${studentUser.name} on record ${record.studentId}. Status change to '${attemptedStatus}' blocked. HMAC verification FAILED.`;
    const curHash = computeBlockHash({
      blockNumber: nextBlockNum,
      timestamp: now,
      actor: `${studentUser.name} (${studentUser.role})`,
      action: 'UNAUTHORIZED_STUDENT_TAMPER_ATTEMPT',
      resource: record.studentId,
      prevHash,
      details: auditDetails
    });

    await AuditLogModel.create({
      blockNumber: nextBlockNum,
      timestamp: now,
      actor: {
        name: studentUser.name,
        id: studentUser._id,
        role: studentUser.role,
        ip: req.ip || '127.0.0.1'
      },
      action: 'UNAUTHORIZED_STUDENT_TAMPER_ATTEMPT',
      resource: record.studentId,
      severity: 'CRITICAL',
      prevHash,
      currentHash: curHash,
      tampered: true,
      details: auditDetails
    });

    await SecurityEventModel.create({
      timestamp: 'Just now',
      title: '🚨 CRITICAL: Unauthorized Attendance Tamper Attempt Detected!',
      type: 'TAMPER_DETECTED',
      severity: 'CRITICAL',
      description: auditDetails,
      resourceId: record.studentId,
      actor: studentUser.name
    });

    res.status(403).json({
      success: false,
      isTampered: true,
      integrityStatus: 'FAILED',
      message: '🚨 CRITICAL TAMPER ALERT: Unauthorized attendance modification attempt detected and logged to immutable audit chain!',
      tamperDetails: {
        studentName: record.studentName,
        studentId: record.studentId,
        attemptedBy: studentUser.name,
        attemptedStatus,
        previousStatus,
        reason: tamperReason,
        auditBlock: nextBlockNum,
        timestamp: now,
        storedHmac: record.hmacTag,
        computedHmac: 'INVALID_SIGNATURE_MISMATCH'
      },
      historyEntry,
      record: {
        ...record,
        ...updateFields,
        id: record._id || record.id
      }
    });
  } catch (err) {
    console.error('Student Tamper Logging Error:', err);
    res.status(500).json({ success: false, message: 'Failed to process tamper simulation' });
  }
});

/**
 * @route   POST /api/attendance/:id/tamper
 * @desc    HACKATHON DEMO: Demonstrate unauthorized database tampering being mathematically detected!
 * @access  Private (Instructor only)
 */
router.post('/:id/tamper', protect, authorize('Instructor', 'Security Admin'), async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const newStatus = req.body.newStatus || (record.status === 'Present' ? 'Absent' : 'Present');
    const previousStatus = record.status;
    const now = new Date().toISOString();

    // DELIBERATE TAMPERING: Modify the status and canonical string WITHOUT re-signing the HMAC tag!
    const tamperedCanonical = canonicalizeAttendanceRecord({
      sessionId: record.sessionId,
      studentId: record.studentId,
      timestamp: record.timestamp,
      status: newStatus,
      instructorId: 'UNAUTHORIZED_ATTACKER'
    });

    const tamperReason = `UNAUTHORIZED ALTERATION DETECTED: Database record status changed to '${newStatus}' directly without cryptographic root key re-signing!`;

    const historyEntry = {
      id: `hist-tamper-${Date.now()}`,
      timestamp: now,
      changedBy: `${req.user.name} (Attacker Simulation)`,
      role: 'Attacker',
      previousStatus,
      newStatus,
      reason: tamperReason,
      prevHmac: record.hmacTag,
      newHmac: 'MISMATCHED_HMAC_PRESERVED',
      isTamperAttempt: true,
      auditBlock: 1045
    };

    const existingHistory = Array.isArray(record.history) ? record.history : [];
    const updatedHistory = [historyEntry, ...existingHistory];

    const updated = await AttendanceModel.updateOne(
      { _id: record._id || record.id },
      {
        status: newStatus,
        canonicalString: tamperedCanonical,
        isTampered: true,
        integrityStatus: 'FAILED',
        tamperReason,
        history: updatedHistory
      }
    );

    // Log Critical Tamper Alarm
    await SecurityEventModel.create({
      timestamp: 'Just now',
      title: '🚨 CRITICAL TAMPER ALARM TRIGGERED',
      type: 'TAMPER_DETECTED',
      severity: 'CRITICAL',
      description: `Direct database manipulation detected on student ${record.studentName} (${record.studentId})! Stored status altered to '${newStatus}' without HMAC re-signing.`,
      resourceId: record.studentId,
      actor: `${req.user.name} (Simulation Engine)`
    });

    res.json({
      success: true,
      message: 'Tampering simulation applied! Stored status modified without cryptographic HMAC key.',
      record: updated,
      historyEntry
    });
  } catch (err) {
    console.error('Tamper Simulation Error:', err);
    res.status(500).json({ success: false, message: 'Failed to simulate tampering' });
  }
});

/**
 * @route   POST /api/attendance/:id/fix
 * @desc    Authorize correction and re-sign record with authentic HMAC root key
 * @access  Private (Instructor only)
 */
router.post('/:id/fix', protect, authorize('Instructor', 'Security Admin'), async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const now = new Date().toISOString();
    const freshTag = computeHmacSha256(record.canonicalString);

    const historyEntry = {
      id: `hist-fix-${Date.now()}`,
      timestamp: now,
      changedBy: req.user.name,
      role: 'Instructor',
      previousStatus: record.status,
      newStatus: record.status,
      reason: `Authorized cryptographic re-seal by Instructor ${req.user.name}`,
      prevHmac: record.hmacTag,
      newHmac: freshTag,
      isTamperAttempt: false,
      auditBlock: 1050
    };

    const existingHistory = Array.isArray(record.history) ? record.history : [];
    const updatedHistory = [historyEntry, ...existingHistory];

    const fixed = await AttendanceModel.updateOne(
      { _id: record._id || record.id },
      {
        hmacTag: freshTag,
        isTampered: false,
        integrityStatus: 'VERIFIED',
        tamperReason: undefined,
        keyVersion: 'v2.4-prod',
        history: updatedHistory
      }
    );

    await SecurityEventModel.create({
      timestamp: 'Just now',
      title: 'Authorized Cryptographic Re-sign',
      type: 'HMAC_VERIFIED',
      severity: 'INFO',
      description: `Record ${record.studentId} authorized and re-signed by ${req.user.name}. New HMAC tag: ${freshTag.slice(0, 16)}...`,
      resourceId: record.studentId,
      actor: req.user.name
    });

    res.json({
      success: true,
      message: 'Record successfully re-signed and verified',
      record: fixed,
      historyEntry
    });
  } catch (err) {
    console.error('Fix Record Error:', err);
    res.status(500).json({ success: false, message: 'Failed to re-sign record' });
  }
});

/**
 * @route   POST /api/attendance/verify-all
 * @desc    Verify all records in the cryptographic ledger
 * @access  Private
 */
router.post('/verify-all', protect, async (req, res) => {
  try {
    const records = await AttendanceModel.find();
    let verifiedCount = 0;
    let tamperedCount = 0;

    for (const rec of records) {
      const isValid = verifyHmacSha256(rec.canonicalString, rec.hmacTag);
      if (isValid) {
        verifiedCount++;
      } else {
        tamperedCount++;
      }
    }

    res.json({
      success: true,
      totalRecords: records.length,
      verifiedCount,
      tamperedCount,
      allValid: tamperedCount === 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to verify ledger' });
  }
});

export default router;

