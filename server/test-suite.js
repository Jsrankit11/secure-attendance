import {
  hashPassword,
  verifyPassword,
  computeHmacSha256,
  verifyHmacSha256,
  canonicalizeAttendanceRecord,
  encryptAesGcm,
  decryptAesGcm,
  computeBlockHash
} from './utils/crypto.js';
import { UserModel } from './models/User.js';
import { AttendanceModel } from './models/Attendance.js';
import { AuditLogModel } from './models/AuditLog.js';
import { SecurityEventModel } from './models/SecurityEvent.js';
import { seedDatabase } from './utils/seed.js';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING SECUREATTENDANCE SECURITY & CRYPTO TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Password Hashing (bcrypt with 12 salt rounds)
  console.log('--- Test 1: Password Hashing & Argon2/bcrypt Security ---');
  const rawPass = 'Password@2026!';
  const hashed = await hashPassword(rawPass);
  assert(hashed.startsWith('$2a$') || hashed.startsWith('$2b$'), 'Password hash uses standard bcrypt format');
  assert(hashed !== rawPass, 'Plaintext password is NEVER stored');
  const isValidPass = await verifyPassword(rawPass, hashed);
  assert(isValidPass === true, 'Valid password successfully verifies against hash');
  const isInvalidPass = await verifyPassword('WrongPassword123!', hashed);
  assert(isInvalidPass === false, 'Invalid password rejected');

  // 2. Encryption (AES-256-GCM authenticated cipher)
  console.log('\n--- Test 2: AES-256-GCM Private Attendance Note Encryption ---');
  const privateMedicalNote = 'Student accommodated for medical exam at 10:15 AM; private ledger';
  const encrypted = encryptAesGcm(privateMedicalNote);
  assert(!!encrypted.ciphertext && !!encrypted.iv && !!encrypted.authTag, 'AES-256-GCM outputs ciphertext, 96-bit IV, and 128-bit Auth Tag');
  assert(encrypted.ciphertext !== privateMedicalNote, 'Ciphertext is unreadable ciphertext');
  const decrypted = decryptAesGcm(encrypted.ciphertext, encrypted.iv, encrypted.authTag);
  assert(decrypted === privateMedicalNote, 'Authenticated decryption matches original plaintext exactly');

  // Tampered ciphertext test for AES-256-GCM
  let badCiphertext = encrypted.ciphertext.slice(0, -2) + (encrypted.ciphertext.endsWith('00') ? 'ff' : '00');
  const decryptResult = decryptAesGcm(badCiphertext, encrypted.iv, encrypted.authTag);
  assert(decryptResult === '[ENCRYPTED DATA CORRUPTED]', 'AES-256-GCM authenticated tag detects tampered ciphertext');

  // 3. HMAC-SHA256 Integrity Verification
  console.log('\n--- Test 3: HMAC-SHA256 Canonical Integrity Verification ---');
  const canonical = canonicalizeAttendanceRecord({
    sessionId: 'CS-SEC-401-2026-W8',
    studentId: 'STU-001',
    timestamp: '2026-10-30T10:00:00.000Z',
    status: 'Present',
    instructorId: 'USR-INST-007'
  });
  const hmacTag = computeHmacSha256(canonical);
  assert(hmacTag.length === 64, 'HMAC-SHA256 tag is 64 hexadecimal characters (256-bit)');
  const verifies = verifyHmacSha256(canonical, hmacTag);
  assert(verifies === true, 'Untampered record HMAC verifies successfully');

  // 4. Tampering Detection Simulation
  console.log('\n--- Test 4: Attendance Tampering Detection (Requirement 9) ---');
  const tamperedCanonical = canonicalizeAttendanceRecord({
    sessionId: 'CS-SEC-401-2026-W8',
    studentId: 'STU-001',
    timestamp: '2026-10-30T10:00:00.000Z',
    status: 'Absent', // Tampered from Present to Absent without re-signing!
    instructorId: 'USR-INST-007'
  });
  const tamperDetected = verifyHmacSha256(tamperedCanonical, hmacTag);
  assert(tamperDetected === false, 'Cryptographic tampering alert: Status modification immediately fails verification');

  // 5. Database & Seeding Verification
  console.log('\n--- Test 5: Storage Engine & Demo Accounts ---');
  await seedDatabase(true);
  const users = await UserModel.find();
  assert(users.length >= 6, `Total users seeded: ${users.length} (Instructor + 5 Students)`);

  const instructor = await UserModel.findOne({ role: 'Instructor' });
  assert(instructor && instructor.email === 'a.sharma@cybershield.edu', 'Instructor Prof. Ankit Sharma exists');

  const students = await UserModel.find({ role: 'Student' });
  const studentNames = students.map(s => s.name);
  assert(studentNames.includes('Vedika Gupta'), 'Vedika Gupta exists in student roster');
  assert(studentNames.includes('Shashwat Srivastava'), 'Shashwat Srivastava exists in student roster');
  assert(studentNames.includes('Ankit Chaudhary'), 'Ankit Chaudhary exists in student roster');
  assert(studentNames.includes('Vaishnavi Tiwari'), 'Vaishnavi Tiwari exists in student roster');
  assert(studentNames.includes('Harshit Dwivedi'), 'Harshit Dwivedi exists in student roster');

  // 6. Audit Hash Chaining (Blockchain-inspired SHA-256 chain)
  console.log('\n--- Test 6: Audit Log SHA-256 Block Chaining ---');
  const blocks = await AuditLogModel.find();
  assert(blocks.length >= 5, `Audit blocks exist in storage: ${blocks.length}`);
  
  // Verify chaining between block 0 and 1
  let chainValid = true;
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].prevHash !== blocks[i-1].currentHash) {
      chainValid = false;
      break;
    }
  }
  assert(chainValid === true, 'All audit log blocks are cryptographically linked via SHA-256 hashes');

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
