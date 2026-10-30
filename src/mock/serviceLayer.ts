import { AttendanceRecord, ConversationThread, MessageItem, AuditBlock, MetricCardData, SecurityEvent, DeviceSession } from '../types';
import { INDIAN_STUDENTS_ATTENDANCE, INDIAN_STUDENT_ACCOUNTS } from './indianStudents';

export { INDIAN_STUDENTS_ATTENDANCE, INDIAN_STUDENT_ACCOUNTS };

export const HMAC_SECRET_DEMO_KEY = "CS_K1_PRODUCTION_SECRET_98fbc10";

// Verified Attendance Records containing ONLY the 5 Students
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  ...INDIAN_STUDENTS_ATTENDANCE
];

export const INITIAL_METRICS: MetricCardData[] = [
  {
    id: 'm1',
    title: 'Total Attendance Records',
    value: 12480,
    change: '+14% this week',
    isPositive: true,
    status: 'NEUTRAL',
    description: 'Cryptographically hashed attendance events recorded'
  },
  {
    id: 'm2',
    title: 'Verified HMAC Tags',
    value: 12463,
    suffix: '',
    change: '99.86% integrity rate',
    isPositive: true,
    status: 'VERIFIED',
    description: 'Passed strict HMAC-SHA256 mathematical validation'
  },
  {
    id: 'm3',
    title: 'Integrity Failures / Tampers',
    value: 3,
    change: '2 flagged today',
    isPositive: false,
    status: 'FAILED',
    description: 'Database entries modified outside authoritative crypto channel'
  },
  {
    id: 'm4',
    title: 'End-to-End Encrypted Messages',
    value: 48920,
    change: '+32% volume',
    isPositive: true,
    status: 'VERIFIED',
    description: 'AES-GCM-256 encrypted payload transmissions'
  },
  {
    id: 'm5',
    title: 'Invalid Digital Signatures',
    value: 1,
    change: '-2 vs last cycle',
    isPositive: true,
    status: 'WARNING',
    description: 'Transmitted messages with broken ECDSA curve verification'
  },
  {
    id: 'm6',
    title: 'Recorded Security Events',
    value: 184,
    change: 'All audit blocks synced',
    isPositive: true,
    status: 'NEUTRAL',
    description: 'Immutable ledger events chained with SHA-256'
  }
];

export const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conv-01',
    participantId: 'user-02',
    participantName: 'Dr. Sarah Lin (Lead Cryptographer)',
    participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    participantRole: 'Security Administrator',
    online: true,
    keyFingerprint: '9F4B : 12C3 : 882E : 09A1 : E4D5 : 7701 : 33BC : FA19',
    fingerprintVerified: true,
    keyStatus: 'active',
    lastMessageSnippet: 'The key rotation scheduled for 02:00 UTC has been committed to the hash chain.',
    lastMessageTime: '10:14 AM',
    unreadCount: 0
  },
  {
    id: 'conv-02',
    participantId: 'user-03',
    participantName: 'Alex Mercer (Teaching Assistant)',
    participantAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    participantRole: 'Instructor Staff',
    online: true,
    keyFingerprint: '55E1 : FA90 : 210B : CD82 : 4410 : 88EA : 1102 : 9B73',
    fingerprintVerified: true,
    keyStatus: 'active',
    lastMessageSnippet: 'Can you verify student Marcus Vance record? The tamper alert was triggered.',
    lastMessageTime: '09:48 AM',
    unreadCount: 2
  },
  {
    id: 'conv-03',
    participantId: 'user-04',
    participantName: 'Kavita Rao (Audit Officer)',
    participantAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    participantRole: 'Compliance Auditor',
    online: false,
    keyFingerprint: 'AA30 : 9912 : EE41 : 77B0 : C219 : 5531 : 0942 : 1100',
    fingerprintVerified: false,
    keyStatus: 'rotated',
    lastMessageSnippet: 'Quarterly compliance report exported with SHA-256 verification hash.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0
  },
  {
    id: 'conv-04',
    participantId: 'user-05',
    participantName: 'David K. (Former TA)',
    participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    participantRole: 'Revoked Access',
    online: false,
    keyFingerprint: 'DEAD : BEEF : 0000 : 9999 : 1234 : 5678 : ABCD : EF01',
    fingerprintVerified: false,
    keyStatus: 'revoked',
    lastMessageSnippet: 'REVOKED: This user private signing key was compromised and revoked.',
    lastMessageTime: '3 days ago',
    unreadCount: 0
  }
];

export const INITIAL_MESSAGES: Record<string, MessageItem[]> = {
  'conv-01': [
    {
      id: 'msg-101',
      conversationId: 'conv-01',
      senderId: 'user-02',
      senderName: 'Dr. Sarah Lin',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
      recipientId: 'me',
      timestamp: '10:08 AM',
      plaintext: 'Good morning. We are auditing today\'s CS401 laboratory session.',
      ciphertext: 'ENC-GCM256$8f9104b2c8a19234e7...4901fbc341',
      status: 'verified',
      signatureBadge: 'Valid',
      signatureHex: '3045022100e49f2819cd83...02207198ba12',
      keyFingerprint: '9F4B : 12C3 : 882E : 09A1',
      isSimulatedEncrypted: true
    },
    {
      id: 'msg-102',
      conversationId: 'conv-01',
      senderId: 'me',
      senderName: 'You (Instructor)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      recipientId: 'user-02',
      timestamp: '10:10 AM',
      plaintext: 'Confirmed. All student check-ins are generating HMAC-SHA256 canonical digests on ingestion.',
      ciphertext: 'ENC-GCM256$a39b9401f802ea129...5f0a8819d4',
      status: 'verified',
      signatureBadge: 'Valid',
      signatureHex: '3045022100b7218ef9213...022066d9102c',
      keyFingerprint: '33AA : 9812 : CC41 : 00FE',
      isSimulatedEncrypted: true
    },
    {
      id: 'msg-103',
      conversationId: 'conv-01',
      senderId: 'user-02',
      senderName: 'Dr. Sarah Lin',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
      recipientId: 'me',
      timestamp: '10:14 AM',
      plaintext: 'The key rotation scheduled for 02:00 UTC has been committed to the hash chain.',
      ciphertext: 'ENC-GCM256$ff234a9b910128ac8...7894bc0214',
      status: 'verified',
      signatureBadge: 'Valid',
      signatureHex: '3046022100af381204d8...022100874312',
      keyFingerprint: '9F4B : 12C3 : 882E : 09A1',
      isSimulatedEncrypted: true
    }
  ],
  'conv-02': [
    {
      id: 'msg-201',
      conversationId: 'conv-02',
      senderId: 'user-03',
      senderName: 'Alex Mercer',
      senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      recipientId: 'me',
      timestamp: '09:48 AM',
      plaintext: 'Can you verify student Marcus Vance record? The tamper alert was triggered.',
      ciphertext: 'ENC-GCM256$5190a1f9e8a881e1941d3b07...8a356bfb94',
      status: 'verified',
      signatureBadge: 'Valid',
      signatureHex: '30450221009184ba201...0220c399f921',
      keyFingerprint: '55E1 : FA90 : 210B : CD82',
      isSimulatedEncrypted: true
    }
  ],
  'conv-04': [
    {
      id: 'msg-401',
      conversationId: 'conv-04',
      senderId: 'user-05',
      senderName: 'David K. (Former TA)',
      senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      recipientId: 'me',
      timestamp: '3 days ago',
      plaintext: 'Attempted to transmit exam keys with old token.',
      ciphertext: 'ENC-GCM256$deadbeef001122...33445566',
      status: 'delivered',
      signatureBadge: 'Key Revoked',
      signatureHex: '3045022100deadbeef...022000000000',
      keyFingerprint: 'DEAD : BEEF : 0000 : 9999',
      isSimulatedEncrypted: true
    }
  ]
};

export const INITIAL_AUDIT_BLOCKS: AuditBlock[] = [
  {
    id: 'blk-1045',
    blockNumber: 1045,
    timestamp: '2026-10-30 04:32:19 UTC',
    actor: { name: 'Automated Verifier', id: 'SRV-CRYPTO-01', role: 'System', ip: '10.240.0.12' },
    action: 'RECORD_TAMPER_FLAGGED',
    resource: 'ATTENDANCE_RECORD:att-002',
    severity: 'HIGH',
    prevHash: '7a89b01234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    currentHash: 'b49c018274fbc0932e1851239aa827103948e104928174fba0123475821094ab',
    tampered: false,
    details: 'HMAC verification failure detected on STU-9802. Stored status changed from Absent to Present.'
  },
  {
    id: 'blk-1044',
    blockNumber: 1044,
    timestamp: '2026-10-30 04:15:00 UTC',
    actor: { name: 'Dr. Sarah Lin', id: 'USR-8821', role: 'Security Admin', ip: '192.168.1.45' },
    action: 'KEY_VERSION_ROTATION',
    resource: 'CRYPTO_KEYS:HMAC_V2_4',
    severity: 'MEDIUM',
    prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    currentHash: '7a89b01234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    tampered: false,
    details: 'Rotated active HMAC ingestion key from v2.3-legacy to v2.4-prod. Grace period 72 hours.'
  },
  {
    id: 'blk-1043',
    blockNumber: 1043,
    timestamp: '2026-10-30 03:30:22 UTC',
    actor: { name: 'Prof. Ankit Sharma', id: 'INST-007', role: 'Instructor', ip: '172.16.8.9' },
    action: 'SESSION_ROSTER_COMMIT',
    resource: 'ATTENDANCE_SESSION:CS-SEC-401-2026-W8',
    severity: 'INFO',
    prevHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    currentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    tampered: false,
    details: 'Batch ingested 38 attendance check-ins. Canonical hash tree generated and signed.'
  },
  {
    id: 'blk-1042',
    blockNumber: 1042,
    timestamp: '2026-10-30 02:00:10 UTC',
    actor: { name: 'MFA Security Service', id: 'SRV-AUTH-09', role: 'Security', ip: '10.240.4.88' },
    action: 'SECURITY_KEY_REVOCATION',
    resource: 'USER_PUBKEY:user-05',
    severity: 'CRITICAL',
    prevHash: '1184e118301057d018e24e365e52480003730018b20b54341fb619f76b2e99b4',
    currentHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    tampered: false,
    details: 'Revoked signing key for David K. following suspicious remote login pattern from unapproved ASN.'
  }
];

export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'ev-1',
    timestamp: '10:04 AM',
    title: 'Tamper Alarm: Attendance Mismatch',
    type: 'TAMPER_DETECTED',
    severity: 'HIGH',
    description: 'Student STU-9802 record payload does not match stored HMAC signature.',
    resourceId: 'att-002'
  },
  {
    id: 'ev-2',
    timestamp: '09:15 AM',
    title: 'Bulk Session Verified',
    type: 'HMAC_VERIFIED',
    severity: 'INFO',
    description: '37 student check-in records passed HMAC-SHA256 signature test.',
    resourceId: 'CS-SEC-401'
  },
  {
    id: 'ev-3',
    timestamp: '04:15 AM',
    title: 'Cryptographic Key Rotated',
    type: 'KEY_ROTATION',
    severity: 'MEDIUM',
    description: 'HMAC root key advanced to version v2.4-prod. Older keys placed in read-only audit mode.',
    resourceId: 'HMAC_V2_4'
  },
  {
    id: 'ev-4',
    timestamp: '02:00 AM',
    title: 'Signing Key Revocation',
    type: 'SIG_INVALID',
    severity: 'HIGH',
    description: 'User-05 signing certificate permanently revoked across node cluster.',
    resourceId: 'user-05'
  }
];

export const INITIAL_SESSIONS: DeviceSession[] = [
  {
    id: 'sess-1',
    device: 'MacBook Pro 16" (M3 Max)',
    browser: 'Chrome 131.0.0 (Encrypted Enclave)',
    ip: '192.168.1.45 (Local Trusted)',
    location: 'Bangalore, Karnataka, IN',
    lastActive: 'Just now',
    isCurrent: true
  },
  {
    id: 'sess-2',
    device: 'Linux Workstation (Ubuntu 24.04)',
    browser: 'Firefox Developer Edition',
    ip: '10.240.12.8 (VPN Dedicated)',
    location: 'Campus Engineering Lab B4',
    lastActive: '34 minutes ago',
    isCurrent: false
  },
  {
    id: 'sess-3',
    device: 'iPhone 15 Pro',
    browser: 'Mobile Safari 18.1',
    ip: '49.37.194.120 (Cellular)',
    location: 'Bangalore, IN',
    lastActive: 'Yesterday at 18:20',
    isCurrent: false
  }
];
