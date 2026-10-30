import crypto from 'node:crypto';

const HMAC_KEY = "CS_K1_PRODUCTION_SECRET_98fbc10";

const studentNames = [
  "Aarav Sharma",
  "Ananya Singh",
  "Rohan Gupta",
  "Aditi Kumari",
  "Arjun Patel",
  "Sneha Sharma",
  "Ayush Verma",
  "Priyanshu Yadav",
  "Khushi Gupta",
  "Shivam Mishra",
  "Riya Pandey",
  "Mohit Chauhan",
  "Ishita Agarwal",
  "Saurabh Kumar",
  "Muskan Jaiswal",
  "Priya Verma",
  "Rahul Yadav",
  "Sneha Mishra",
  "Kunal Pandey",
  "Neha Chauhan",
  "Aditya Tiwari",
  "Pooja Singh",
  "Aman Srivastava",
  "Sakshi Dubey",
  "Abhishek Kumar",
  "Simran Kaur",
  "Deepak Raj",
  "Nisha Patel",
  "Harsh Vardhan",
  "Tanya Saxena"
];

// Diverse avatars for Indian students
const avatarPool = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
];

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

function generateFingerprint(seed) {
  const hash = crypto.createHash('sha256').update(seed).digest('hex').toUpperCase();
  const chunks = hash.match(/.{1,4}/g) || [];
  return chunks.slice(0, 8).join(' : ');
}

const attendance = [];
const accounts = [];

studentNames.forEach((name, i) => {
  const num = String(i + 1).padStart(2, '0');
  const studentId = `STU-IND-${num}`;
  const slug = name.toLowerCase().replace(/\s+/g, '.');
  const email = `${slug}@student.cybershield.edu`;
  const avatar = avatarPool[i % avatarPool.length];
  
  // Realistic statuses: mostly Present, 2 Late, 2 Absent
  let status = 'Present';
  if (i === 7 || i === 21) status = 'Late';
  if (i === 13 || i === 26) status = 'Absent';

  const minute = String(2 + (i % 45)).padStart(2, '0');
  const second = String(10 + (i % 48)).padStart(2, '0');
  const timestamp = `2026-10-30T09:${minute}:${second}Z`;

  const canonicalString = `CS-ATTENDANCE-V1|SESSION:CS-SEC-401-2026-W8|STUDENT:${studentId}|TIME:${timestamp}|STATUS:${status}|INSTRUCTOR:INST-007`;
  const hmacTag = hmac(HMAC_KEY, canonicalString);
  const fingerprint = generateFingerprint(studentId + name);

  attendance.push({
    id: `att-ind-${num}`,
    sessionId: 'CS-SEC-401-2026-W8',
    sessionTitle: 'Advanced Applied Cryptography',
    className: 'CS 401: Cryptographic Engineering',
    studentId,
    studentName: name,
    avatar,
    date: '2026-10-30',
    timestamp,
    status,
    canonicalString,
    hmacTag,
    keyVersion: 'v2.4-prod',
    isTampered: false,
    integrityStatus: 'VERIFIED',
    auditChainBlock: 1100 + i
  });

  accounts.push({
    id: `usr-stu-${num}`,
    studentId,
    name,
    email,
    role: 'Student',
    avatar,
    mfaEnabled: true,
    keyFingerprint: fingerprint,
    joinedDate: 'October 2026',
    passwordHash: 'Argon2id$v=19$m=65536,t=3,p=4$studentSecure2026'
  });
});

console.log(JSON.stringify({ attendance, accounts }, null, 2));
