import { hashPassword, computeHmacSha256, canonicalizeAttendanceRecord, encryptAesGcm, computeBlockHash } from './crypto.js';
import { UserModel } from '../models/User.js';
import { AttendanceModel } from '../models/Attendance.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { SecurityEventModel } from '../models/SecurityEvent.js';
import { dbStore } from '../models/storage.js';

export async function seedDatabase(force = false) {
  const existingUsers = await UserModel.find();
  if (existingUsers.length > 0 && !force) {
    console.log(`ℹ️ [Seed] Database already contains ${existingUsers.length} users. Skipping seed.`);
    return;
  }

  console.log(`🌱 [Seed] Seeding production demo data with bcrypt hashes, AES-256-GCM ciphertext & HMAC-SHA256 tags...`);

  const passwordHashInstructor = await hashPassword('Password@2026!');
  const passwordHashStudent = await hashPassword('CyberStudent@2026!');

  const users = [
    {
      _id: 'usr-inst-007',
      name: 'Prof. Ankit Sharma',
      email: 'a.sharma@cybershield.edu',
      passwordHash: passwordHashInstructor,
      role: 'Instructor',
      avatar: '/students/ankit_chaudhary.png',
      keyFingerprint: '4A7B : E921 : CC04 : 88DF : 1102 : 9B73 : 33BC : FA19',
      mfaEnabled: true,
      joinedDate: 'October 2026'
    },
    {
      _id: 'usr-stu-001',
      studentId: 'STU-001',
      name: 'Vedika Gupta',
      email: 'vedika.gupta@cybershield.edu',
      passwordHash: passwordHashStudent,
      role: 'Student',
      avatar: '/students/vedika_gupta.png',
      keyFingerprint: 'A1B2 : C3D4 : E5F6 : 7890 : 1122 : 3344 : 5566 : 7788',
      mfaEnabled: true,
      joinedDate: 'October 2026'
    },
    {
      _id: 'usr-stu-002',
      studentId: 'STU-002',
      name: 'Shashwat Srivastava',
      email: 'shashwat.srivastava@cybershield.edu',
      passwordHash: passwordHashStudent,
      role: 'Student',
      avatar: '/students/shashwat_srivastava.png',
      keyFingerprint: 'B2C3 : D4E5 : F6A1 : 8901 : 2233 : 4455 : 6677 : 8899',
      mfaEnabled: true,
      joinedDate: 'October 2026'
    },
    {
      _id: 'usr-stu-003',
      studentId: 'STU-003',
      name: 'Ankit Chaudhary',
      email: 'ankit.chaudhary@cybershield.edu',
      passwordHash: passwordHashStudent,
      role: 'Student',
      avatar: '/students/ankit_chaudhary.png',
      keyFingerprint: 'C3D4 : E5F6 : A1B2 : 9012 : 3344 : 5566 : 7788 : 9900',
      mfaEnabled: true,
      joinedDate: 'October 2026'
    },
    {
      _id: 'usr-stu-004',
      studentId: 'STU-004',
      name: 'Vaishnavi Tiwari',
      email: 'vaishnavi.tiwari@cybershield.edu',
      passwordHash: passwordHashStudent,
      role: 'Student',
      avatar: '/students/vaishnavi_tiwari.png',
      keyFingerprint: 'D4E5 : F6A1 : B2C3 : 0123 : 4455 : 6677 : 8899 : 0011',
      mfaEnabled: true,
      joinedDate: 'October 2026'
    },
    {
      _id: 'usr-stu-005',
      studentId: 'STU-005',
      name: 'Harshit Dwivedi',
      email: 'harshit.dwivedi@cybershield.edu',
      passwordHash: passwordHashStudent,
      role: 'Student',
      avatar: '/students/harshit_dwivedi.png',
      keyFingerprint: 'E5F6 : A1B2 : C3D4 : 1234 : 5566 : 7788 : 9900 : 1122',
      mfaEnabled: true,
      joinedDate: 'October 2026'
    }
  ];

  // Seed Attendance Records with AES-256-GCM encryption & HMAC-SHA256 signatures
  const students = [
    { id: 'STU-001', name: 'Vedika Gupta', avatar: '/students/vedika_gupta.png', status: 'Present', time: '2026-10-30T09:00:00Z', notes: 'Verified via Face Recognition AI' },
    { id: 'STU-002', name: 'Shashwat Srivastava', avatar: '/students/shashwat_srivastava.png', status: 'Present', time: '2026-10-30T09:02:00Z', notes: 'Verified via Face Recognition AI' },
    { id: 'STU-003', name: 'Ankit Chaudhary', avatar: '/students/ankit_chaudhary.png', status: 'Present', time: '2026-10-30T09:04:00Z', notes: 'Verified via Face Recognition AI' },
    { id: 'STU-004', name: 'Vaishnavi Tiwari', avatar: '/students/vaishnavi_tiwari.png', status: 'Present', time: '2026-10-30T09:06:00Z', notes: 'Verified via Face Recognition AI' },
    { id: 'STU-005', name: 'Harshit Dwivedi', avatar: '/students/harshit_dwivedi.png', status: 'Absent', time: '2026-10-30T09:08:00Z', notes: 'Unexcused absence / Not present in lab' }
  ];

  const attendance = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const canonical = canonicalizeAttendanceRecord({
      sessionId: 'CS-SEC-401-2026-W8',
      studentId: s.id,
      timestamp: s.time,
      status: s.status,
      instructorId: 'INST-007'
    });

    const hmacTag = computeHmacSha256(canonical);
    const { ciphertext, iv, authTag } = encryptAesGcm(s.notes);

    attendance.push({
      _id: `att-00${i + 1}`,
      sessionId: 'CS-SEC-401-2026-W8',
      sessionTitle: 'Advanced Applied Cryptography',
      className: 'CS 401: Cryptographic Engineering',
      studentId: s.id,
      studentName: s.name,
      avatar: s.avatar,
      date: '2026-10-30',
      timestamp: s.time,
      status: s.status,
      canonicalString: canonical,
      hmacTag,
      keyVersion: 'v2.4-prod',
      isTampered: false,
      integrityStatus: 'VERIFIED',
      auditChainBlock: 1040 + i,
      verificationMethod: s.status === 'Present' ? 'FACE_AI' : 'MANUAL',
      faceConfidence: s.status === 'Present' ? 98.7 : undefined,
      encryptedNotes: ciphertext,
      notesIv: iv,
      notesAuthTag: authTag
    });
  }

  // Seed Immutable Hash-Chained Audit Blocks
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const auditLogs = [];

  const rawAuditActions = [
    { action: 'GENESIS_BLOCK_INITIALIZED', resource: 'SYSTEM_ROOT', severity: 'INFO', details: 'Root cryptographic ledger initialized with HMAC-SHA256 & AES-256-GCM vaults' },
    { action: 'INSTRUCTOR_MFA_AUTHENTICATED', resource: 'AUTH_SERVICE', severity: 'INFO', details: 'Prof. Ankit Sharma logged in via ECDSA-P256 hardware token' },
    { action: 'ATTENDANCE_SESSION_SEALED', resource: 'CS-SEC-401-2026-W8', severity: 'INFO', details: 'Session CS-SEC-401 signed with Key v2.4-prod' },
    { action: 'BIOMETRIC_FACE_MATCH', resource: 'STU-001', severity: 'INFO', details: 'Vedika Gupta face verified (98.6% match, Liveness: PASS)' },
    { action: 'HMAC_AUDIT_VERIFIED', resource: 'STU-001', severity: 'INFO', details: 'Cryptographic HMAC signature confirmed on canonical record' }
  ];

  for (let i = 0; i < rawAuditActions.length; i++) {
    const act = rawAuditActions[i];
    const blockNum = 1040 + i;
    const time = `2026-10-30T09:0${i}:00Z`;
    const curHash = computeBlockHash({
      blockNumber: blockNum,
      timestamp: time,
      actor: 'Prof. Ankit Sharma (INST-007)',
      action: act.action,
      resource: act.resource,
      prevHash,
      details: act.details
    });

    auditLogs.push({
      _id: `blk-${blockNum}`,
      blockNumber: blockNum,
      timestamp: time,
      actor: {
        name: 'Prof. Ankit Sharma',
        id: 'USR-INST-007',
        role: 'Instructor',
        ip: '192.168.1.104'
      },
      action: act.action,
      resource: act.resource,
      severity: act.severity,
      prevHash,
      currentHash: curHash,
      tampered: false,
      details: act.details
    });

    prevHash = curHash;
  }

  // Seed Security Events Telemetry
  const securityEvents = [
    {
      _id: 'evt-001',
      timestamp: 'Just now',
      title: 'Biometric Face Ingestion Verified',
      type: 'HMAC_VERIFIED',
      severity: 'INFO',
      description: 'Vedika Gupta (STU-001) verified via MobileNet facial recognition & HMAC signed',
      resourceId: 'STU-001'
    },
    {
      _id: 'evt-002',
      timestamp: '5 mins ago',
      title: 'Cryptographic Integrity Check Passed',
      type: 'HMAC_VERIFIED',
      severity: 'INFO',
      description: 'Authoritative check on active ledger: 5/5 HMAC digests mathematically intact',
      resourceId: 'LEDGER-01'
    },
    {
      _id: 'evt-003',
      timestamp: '15 mins ago',
      title: 'AES-256-GCM Vault Active',
      type: 'KEY_ROTATION',
      severity: 'INFO',
      description: 'Sensitive student payload encrypted with authenticated 96-bit IV',
      resourceId: 'VAULT-01'
    }
  ];

  // Store seeded data
  dbStore.reset({
    users,
    attendance,
    auditLogs,
    securityEvents
  });

  console.log(`✅ [Seed] Successfully seeded 6 users, 5 attendance records, and 5 audit chain blocks.`);
}

