export type IntegrityStatus = 'VERIFIED' | 'WARNING' | 'FAILED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Instructor' | 'Student' | 'Security Admin';
  avatar: string;
  mfaEnabled: boolean;
  keyFingerprint: string;
  joinedDate: string;
}

export interface AttendanceHistoryEntry {
  id: string;
  timestamp: string;
  changedBy: string;
  role: 'Instructor' | 'Student' | 'System';
  previousStatus: 'Present' | 'Absent' | 'Late';
  newStatus: 'Present' | 'Absent' | 'Late';
  reason: string;
  prevHmac: string;
  newHmac: string;
  isTamperAttempt: boolean;
  auditBlock?: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionTitle: string;
  className: string;
  studentId: string;
  studentName: string;
  avatar: string;
  date: string;
  timestamp: string;
  status: 'Present' | 'Absent' | 'Late';
  canonicalString: string;
  hmacTag: string;
  keyVersion: string;
  isTampered: boolean;
  tamperReason?: string;
  integrityStatus: IntegrityStatus;
  auditChainBlock: number;
  verificationMethod?: 'FACE_AI' | 'MANUAL' | 'SYSTEM';
  faceConfidence?: number;
  history?: AttendanceHistoryEntry[];
  decryptedNotes?: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  timestamp: string;
  plaintext: string;
  ciphertext: string;
  status: 'sent' | 'delivered' | 'verified';
  signatureBadge: 'Valid' | 'Invalid' | 'Key Revoked';
  signatureHex: string;
  keyFingerprint: string;
  isSimulatedEncrypted: boolean;
}

export interface ConversationThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  online: boolean;
  keyFingerprint: string;
  fingerprintVerified: boolean;
  keyStatus: 'active' | 'rotated' | 'revoked';
  lastMessageSnippet: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface AuditBlock {
  id: string;
  blockNumber: number;
  timestamp: string;
  actor: {
    name: string;
    id: string;
    role: string;
    ip: string;
  };
  action: string;
  resource: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  prevHash: string;
  currentHash: string;
  tampered: boolean;
  details: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: number;
  suffix?: string;
  change: string;
  isPositive: boolean;
  status: IntegrityStatus | 'NEUTRAL';
  description: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  title: string;
  type: 'TAMPER_DETECTED' | 'HMAC_VERIFIED' | 'KEY_ROTATION' | 'AUTH_FAILURE' | 'SIG_INVALID';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  resourceId: string;
}

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'tamper' | 'security' | 'attendance' | 'info';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  read: boolean;
  studentName?: string;
  studentId?: string;
  recordId?: string;
  actionType?: 'VIEW_TAMPER' | 'VIEW_RECORD' | 'VIEW_AUDIT';
}
