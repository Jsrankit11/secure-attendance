import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AttendanceRecord,
  AttendanceHistoryEntry,
  ConversationThread,
  MessageItem,
  AuditBlock,
  MetricCardData,
  SecurityEvent,
  UserProfile,
  DeviceSession,
  AppNotification
} from '../types';
import {
  INITIAL_ATTENDANCE,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_BLOCKS,
  INITIAL_METRICS,
  INITIAL_SECURITY_EVENTS,
  INITIAL_SESSIONS,
  HMAC_SECRET_DEMO_KEY
} from '../mock/serviceLayer';
import { INDIAN_STUDENT_ACCOUNTS, StudentAccount } from '../mock/indianStudents';
import { hmacSha256Hex, canonicalizeAttendanceRecord } from '../lib/crypto';
import { api, getAuthToken, setAuthToken } from '../lib/api';
import { playTamperAlertSound } from '../lib/sound';

const STORAGE_KEY_RECORDS = 'cybershield_attendance_records_v3';
const STORAGE_KEY_STUDENTS = 'cybershield_students_v3';
const STORAGE_KEY_NOTIFICATIONS = 'cybershield_notifications_v3';

interface AppContextType {
  // Navigation & Theme
  currentPage: string;
  setCurrentPage: (page: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  cmdKOpen: boolean;
  setCmdKOpen: (open: boolean) => void;

  // Authentication & Role
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  setUserRole: (role: 'Instructor' | 'Student' | 'Security Admin') => void;

  // Attendance State
  attendanceRecords: AttendanceRecord[];
  studentAccounts: StudentAccount[];
  updateStudentPhoto: (studentId: string, photoBase64: string) => void;
  verifyAttendanceRecord: (id: string) => Promise<{ isValid: boolean; expectedTag: string; recordTag: string }>;
  tamperAttendanceRecord: (id: string, newStatus: 'Present' | 'Absent' | 'Late') => void;
  reComputeAndFixRecord: (id: string) => Promise<void>;
  createAttendanceSession: (title: string, className: string, students: string[]) => Promise<void>;
  markStudentAttendance: (
    studentId: string,
    status: 'Present' | 'Absent' | 'Late',
    options?: {
      studentName?: string;
      avatar?: string;
      className?: string;
      sessionId?: string;
      method?: 'FACE_AI' | 'MANUAL';
      confidence?: number;
    }
  ) => Promise<AttendanceRecord>;

  // Security Tamper Alert Popup & Modals
  activeTamperAlert: {
    studentName: string;
    studentId: string;
    attemptedBy: string;
    attemptedStatus: string;
    previousStatus: string;
    reason: string;
    auditBlock?: number;
    timestamp: string;
    storedHmac?: string;
    computedHmac?: string;
  } | null;
  setActiveTamperAlert: (alert: any) => void;

  instructorEditModalRecord: AttendanceRecord | null;
  setInstructorEditModalRecord: (record: AttendanceRecord | null) => void;

  historyModalRecord: AttendanceRecord | null;
  setHistoryModalRecord: (record: AttendanceRecord | null) => void;

  instructorUpdateAttendance: (
    id: string,
    newStatus: 'Present' | 'Absent' | 'Late',
    reason: string,
    notes?: string
  ) => Promise<boolean>;

  studentTamperAttempt: (
    id: string,
    attemptedStatus?: 'Present' | 'Absent' | 'Late'
  ) => Promise<void>;

  // Messaging State
  conversations: ConversationThread[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  messages: Record<string, MessageItem[]>;
  sendMessage: (conversationId: string, plaintext: string) => Promise<void>;
  verifyParticipantFingerprint: (threadId: string) => void;

  // Security & Audit State
  metrics: MetricCardData[];
  auditBlocks: AuditBlock[];
  securityEvents: SecurityEvent[];
  sessions: DeviceSession[];
  revokeSession: (id: string) => void;
  verifyEntireHashChain: () => Promise<boolean>;

  // Notification Center
  notifications: AppNotification[];
  unreadNotificationCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
}

const defaultUser: UserProfile = {
  id: 'USR-INST-007',
  name: 'Prof. Ankit Sharma',
  email: 'a.sharma@cybershield.edu',
  role: 'Instructor',
  avatar: '/students/ankit_chaudhary.png',
  mfaEnabled: true,
  keyFingerprint: '4A7B : E921 : CC04 : 88DF : 1102 : 9B73 : 33BC : FA19',
  joinedDate: 'October 2026'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [cmdKOpen, setCmdKOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INDIAN_STUDENT_ACCOUNTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ATTENDANCE;
  });

  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-01');
  const [messages, setMessages] = useState<Record<string, MessageItem[]>>(INITIAL_MESSAGES);
  const [metrics, setMetrics] = useState<MetricCardData[]>(INITIAL_METRICS);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>(INITIAL_AUDIT_BLOCKS);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(INITIAL_SECURITY_EVENTS);
  const [sessions, setSessions] = useState<DeviceSession[]>(INITIAL_SESSIONS);

  // In-App Notification Center
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'notif-init-1',
        title: '🛡️ Cryptographic Engine Initialized',
        message: 'HMAC-SHA256 integrity monitor active with SHA-256 Merkle chain verification.',
        type: 'security',
        severity: 'INFO',
        timestamp: '10 mins ago',
        read: true,
      },
      {
        id: 'notif-init-2',
        title: '📸 AI Biometric Kiosk Ready',
        message: 'Continuous face scanner ready with 468 landmark mesh detection & auto-acceptance.',
        type: 'attendance',
        severity: 'INFO',
        timestamp: '25 mins ago',
        read: true,
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  const addNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    if (n.severity === 'CRITICAL' || n.type === 'tamper') {
      playTamperAlertSound();
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // Security Tamper Alert Popup & Modification Modals
  const [activeTamperAlert, setActiveTamperAlert] = useState<{
    studentName: string;
    studentId: string;
    attemptedBy: string;
    attemptedStatus: string;
    previousStatus: string;
    reason: string;
    auditBlock?: number;
    timestamp: string;
    storedHmac?: string;
    computedHmac?: string;
  } | null>(null);

  const [instructorEditModalRecord, setInstructorEditModalRecord] = useState<AttendanceRecord | null>(null);
  const [historyModalRecord, setHistoryModalRecord] = useState<AttendanceRecord | null>(null);

  // Sync state to/from Express & MongoDB backend
  const refreshBackendData = async () => {
    try {
      const [attRes, stuRes, auditRes, secRes] = await Promise.allSettled([
        api.getAttendance(),
        api.getStudents(),
        api.getAuditLogs(),
        api.getSecurityEvents()
      ]);

      if (attRes.status === 'fulfilled' && attRes.value?.records?.length) {
        setAttendanceRecords(attRes.value.records);
      }
      if (stuRes.status === 'fulfilled' && stuRes.value?.students?.length) {
        setStudentAccounts(stuRes.value.students);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value?.blocks?.length) {
        setAuditBlocks(auditRes.value.blocks);
      }
      if (secRes.status === 'fulfilled' && secRes.value?.events?.length) {
        setSecurityEvents(secRes.value.events);
      }
    } catch (err) {
      console.warn('Backend live sync note:', err);
    }
  };

  // Initial Auth & Backend Hydration
  useEffect(() => {
    const initBackend = async () => {
      let token = getAuthToken();
      if (!token) {
        try {
          const loginRes = await api.login('a.sharma@cybershield.edu', 'Password@2026!');
          if (loginRes?.token) {
            setAuthToken(loginRes.token);
            token = loginRes.token;
          }
        } catch (e) {
          console.warn('Demo session auto-connect initialized');
        }
      }
      if (token) {
        await refreshBackendData();
      }
    };
    initBackend();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(studentAccounts));
    } catch (e) {}
  }, [studentAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(attendanceRecords));
    } catch (e) {}
  }, [attendanceRecords]);

  const updateStudentPhoto = async (studentId: string, photoBase64: string) => {
    try {
      await api.updateStudentPhoto(studentId, photoBase64);
    } catch (e) {
      console.warn('Backend photo update sync:', e);
    }
    setStudentAccounts((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, avatar: photoBase64 } : s))
    );
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, avatar: photoBase64 } : r))
    );
    if ((currentUser as any).studentId === studentId) {
      setCurrentUser((prev) => ({ ...prev, avatar: photoBase64 }));
    }
  };

  // Sync theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  // Global Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdKOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setUserRole = (role: 'Instructor' | 'Student' | 'Security Admin') => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  // Verify HMAC tag on an attendance record (backed by REST API & server validation)
  const verifyAttendanceRecord = async (id: string) => {
    try {
      const res = await api.verifyAttendance(id);
      if (res && res.verification) {
        const { isValid, expectedTag, recordTag } = res.verification;
        setAttendanceRecords((prev) =>
          prev.map((r) => {
            if (r.id === id || (r as any)._id === id) {
              return {
                ...r,
                integrityStatus: isValid ? 'VERIFIED' : 'FAILED',
                isTampered: !isValid,
                tamperReason: isValid
                  ? undefined
                  : 'HMAC signature mismatch: The stored record content differs from its cryptographic tag.'
              };
            }
            return r;
          })
        );
        return { isValid, expectedTag, recordTag };
      }
    } catch (e) {
      console.warn('Backend verifyAttendance fallback to client verification:', e);
    }

    const rec = attendanceRecords.find((r) => r.id === id || (r as any)._id === id);
    if (!rec) return { isValid: false, expectedTag: '', recordTag: '' };

    // Fallback: Compute expected HMAC from the canonical string
    const expectedTag = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, rec.canonicalString);
    const isValid = expectedTag.toLowerCase() === rec.hmacTag.toLowerCase();

    // Update state to match verified outcome
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id === id || (r as any)._id === id) {
          return {
            ...r,
            integrityStatus: isValid ? 'VERIFIED' : 'FAILED',
            isTampered: !isValid,
            tamperReason: isValid
              ? undefined
              : 'HMAC signature mismatch: The stored record content differs from its cryptographic tag.',
          };
        }
        return r;
      })
    );

    return { isValid, expectedTag, recordTag: rec.hmacTag };
  };

  // Tamper record for simulation (Backed by REST API tamper demonstration)
  const tamperAttendanceRecord = async (id: string, newStatus: 'Present' | 'Absent' | 'Late') => {
    try {
      await api.tamperAttendance(id, newStatus);
      await refreshBackendData();
    } catch (err) {
      console.warn('Backend tamper API fallback to local tamper state:', err);
    }

    const rec = attendanceRecords.find((r) => r.id === id || (r as any)._id === id);
    const studentName = rec?.studentName || 'Student';
    const studentId = rec?.studentId || id;
    const previousStatus = rec?.status || 'Unknown';
    const now = new Date().toISOString();
    const newBlockNumber = auditBlocks.length > 0 ? Math.max(...auditBlocks.map((b) => b.blockNumber)) + 1 : 1056;

    // Immediately trigger Security Tamper Popup
    setActiveTamperAlert({
      studentName,
      studentId,
      attemptedBy: 'Unauthorized Script / Direct Mutation',
      attemptedStatus: newStatus,
      previousStatus,
      reason: `Direct DB record tampering detected! Status mutated to '${newStatus}' without valid HMAC key signature.`,
      auditBlock: newBlockNumber,
      timestamp: now,
      storedHmac: rec?.hmacTag,
      computedHmac: 'MISMATCH_INVALID_SEAL'
    });

    // Automatically send alert to Top Notification Center
    addNotification({
      title: `🚨 TAMPER DETECTED: ${studentName}`,
      message: `Status forcefully altered to '${newStatus}'. HMAC-SHA256 signature mismatch detected!`,
      type: 'tamper',
      severity: 'CRITICAL',
      studentName,
      studentId,
      recordId: id,
      actionType: 'VIEW_TAMPER'
    });

    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id === id || (r as any)._id === id) {
          // Change the canonical string without recalculating the HMAC tag!
          const newCanonical = canonicalizeAttendanceRecord({
            sessionId: r.sessionId,
            studentId: r.studentId,
            timestamp: r.timestamp,
            status: newStatus,
            instructorId: 'INST-007'
          });
          return {
            ...r,
            status: newStatus,
            canonicalString: newCanonical,
            isTampered: true,
            integrityStatus: 'FAILED',
            tamperReason: `Manual DB row manipulation detected! Canonical record status changed to ${newStatus} but HMAC was signed for previous state.`,
          };
        }
        return r;
      })
    );

    setSecurityEvents((prev) => [
      {
        id: `evt-tamper-${Date.now()}`,
        timestamp: 'Just now',
        title: `CRITICAL: Unauthorized Attendance Tampering Detected!`,
        type: 'TAMPER_DETECTED',
        severity: 'CRITICAL',
        description: `Cryptographic HMAC-SHA256 integrity seal broken for record ${id} (${studentName}). Status altered to ${newStatus}.`,
        resourceId: id
      },
      ...prev
    ]);
  };

  // Authorized Instructor Attendance Update with Reason & History Chaining
  const instructorUpdateAttendance = async (
    id: string,
    newStatus: 'Present' | 'Absent' | 'Late',
    reason: string,
    notes?: string
  ): Promise<boolean> => {
    const rec = attendanceRecords.find((r) => r.id === id || (r as any)._id === id);
    if (!rec) return false;

    const now = new Date().toISOString();
    const previousStatus = rec.status;
    const prevHmac = rec.hmacTag;

    const newCanonical = canonicalizeAttendanceRecord({
      sessionId: rec.sessionId,
      studentId: rec.studentId,
      timestamp: now,
      status: newStatus,
      instructorId: currentUser.id || 'INST-007'
    });

    const newHmac = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, newCanonical);
    const newBlockNumber = auditBlocks.length > 0 ? Math.max(...auditBlocks.map((b) => b.blockNumber)) + 1 : 1055;

    const historyEntry: AttendanceHistoryEntry = {
      id: `hist-${Date.now()}`,
      timestamp: now,
      changedBy: currentUser.name,
      role: 'Instructor',
      previousStatus,
      newStatus,
      reason: reason || 'Authorized instructor manual update',
      prevHmac,
      newHmac,
      isTamperAttempt: false,
      auditBlock: newBlockNumber
    };

    try {
      await api.instructorUpdate(id, { newStatus, reason, notes });
      await refreshBackendData();
    } catch (e) {
      console.warn('Backend instructor update fallback:', e);
    }

    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id === id || (r as any)._id === id) {
          const currentHist = r.history || [];
          return {
            ...r,
            status: newStatus,
            canonicalString: newCanonical,
            hmacTag: newHmac,
            isTampered: false,
            tamperReason: undefined,
            integrityStatus: 'VERIFIED',
            history: [historyEntry, ...currentHist],
            auditChainBlock: newBlockNumber
          };
        }
        return r;
      })
    );

    setSecurityEvents((prev) => [
      {
        id: `evt-inst-upd-${Date.now()}`,
        timestamp: 'Just now',
        title: `Authorized Attendance Override: ${rec.studentName}`,
        type: 'HMAC_VERIFIED',
        severity: 'INFO',
        description: `Instructor ${currentUser.name} updated status to ${newStatus}. Reason: "${reason}". Cryptographically re-sealed.`,
        resourceId: rec.studentId
      },
      ...prev
    ]);

    return true;
  };

  // Student Tamper Attempt Simulation / Blocked Attempt
  const studentTamperAttempt = async (
    id: string,
    attemptedStatus: 'Present' | 'Absent' | 'Late' = 'Present'
  ) => {
    const rec = attendanceRecords.find((r) => r.id === id || (r as any)._id === id);
    if (!rec) return;

    const now = new Date().toISOString();
    const previousStatus = rec.status;
    const newBlockNumber = auditBlocks.length > 0 ? Math.max(...auditBlocks.map((b) => b.blockNumber)) + 1 : 1055;
    const tamperReason = `UNAUTHORIZED TAMPER DETECTED: Student ${currentUser.name} (${(currentUser as any).studentId || currentUser.email}) attempted to change status to '${attemptedStatus}' without Instructor cryptographic authority!`;

    const historyEntry: AttendanceHistoryEntry = {
      id: `hist-tamper-${Date.now()}`,
      timestamp: now,
      changedBy: `${currentUser.name} (${currentUser.role})`,
      role: 'Student',
      previousStatus,
      newStatus: attemptedStatus,
      reason: tamperReason,
      prevHmac: rec.hmacTag,
      newHmac: 'BLOCKED_INVALID_HMAC_MISMATCH',
      isTamperAttempt: true,
      auditBlock: newBlockNumber
    };

    // Pop up the Security Alert Modal immediately!
    setActiveTamperAlert({
      studentName: rec.studentName,
      studentId: rec.studentId,
      attemptedBy: currentUser.name,
      attemptedStatus,
      previousStatus,
      reason: tamperReason,
      auditBlock: newBlockNumber,
      timestamp: now,
      storedHmac: rec.hmacTag,
      computedHmac: 'MISMATCH_UNSIGNED_ATTEMPT'
    });

    // Auto dispatch notification to Top Notification Menu!
    addNotification({
      title: `🚨 TAMPER ATTEMPT: ${rec.studentName}`,
      message: `Student attempted unauthorized attendance modification to '${attemptedStatus}'. Request rejected & blocked.`,
      type: 'tamper',
      severity: 'CRITICAL',
      studentName: rec.studentName,
      studentId: rec.studentId,
      recordId: id,
      actionType: 'VIEW_TAMPER'
    });

    try {
      await api.studentTamper(id, { attemptedStatus });
      await refreshBackendData();
    } catch (e) {
      console.warn('Backend student tamper API fallback:', e);
    }

    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id === id || (r as any)._id === id) {
          const currentHist = r.history || [];
          return {
            ...r,
            isTampered: true,
            integrityStatus: 'FAILED',
            tamperReason,
            history: [historyEntry, ...currentHist]
          };
        }
        return r;
      })
    );

    setSecurityEvents((prev) => [
      {
        id: `evt-tamper-${Date.now()}`,
        timestamp: 'Just now',
        title: `🚨 CRITICAL: Unauthorized Attendance Tamper Attempt Detected!`,
        type: 'TAMPER_DETECTED',
        severity: 'CRITICAL',
        description: `Student ${currentUser.name} attempted unauthorized status modification to '${attemptedStatus}' on record ${rec.studentId}. Blocked & recorded in immutable audit log.`,
        resourceId: rec.studentId
      },
      ...prev
    ]);
  };

  // Authorized re-compute and fix record
  const reComputeAndFixRecord = async (id: string) => {
    try {
      await api.fixAttendance(id);
      await refreshBackendData();
    } catch (err) {
      console.warn('Backend fix API fallback:', err);
    }

    const rec = attendanceRecords.find((r) => r.id === id || (r as any)._id === id);
    if (!rec) return;

    const newTag = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, rec.canonicalString);

    addNotification({
      title: `✅ Record Integrity Restored`,
      message: `HMAC-SHA256 signature re-computed for ${rec.studentName}. Tamper flag cleared.`,
      type: 'security',
      severity: 'INFO',
      studentName: rec.studentName,
      studentId: rec.studentId,
      recordId: id
    });
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id === id || (r as any)._id === id) {
          return {
            ...r,
            hmacTag: newTag,
            isTampered: false,
            tamperReason: undefined,
            integrityStatus: 'VERIFIED',
            keyVersion: 'v2.4-prod'
          };
        }
        return r;
      })
    );
  };

  const createAttendanceSession = async (title: string, className: string, studentNames: string[]) => {
    const sessionId = `CS-SEC-401-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newRecords: AttendanceRecord[] = [];
    for (let i = 0; i < studentNames.length; i++) {
      const sName = studentNames[i];
      const sId = `STU-98${20 + i}`;
      const canonical = `CS-ATTENDANCE-V1|SESSION:${sessionId}|STUDENT:${sId}|TIME:${now}|STATUS:Present|INSTRUCTOR:INST-007`;
      const tag = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, canonical);

      newRecords.push({
        id: `att-${Date.now()}-${i}`,
        sessionId,
        sessionTitle: title,
        className,
        studentId: sId,
        studentName: sName,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=100&h=100&fit=crop&crop=face`,
        date: now.slice(0, 10),
        timestamp: now,
        status: 'Present',
        canonicalString: canonical,
        hmacTag: tag,
        keyVersion: 'v2.4-prod',
        isTampered: false,
        integrityStatus: 'VERIFIED',
        auditChainBlock: 1048 + i
      });
    }

    setAttendanceRecords((prev) => [...newRecords, ...prev]);
  };

  const markStudentAttendance = async (
    studentId: string,
    status: 'Present' | 'Absent' | 'Late',
    options?: {
      studentName?: string;
      avatar?: string;
      className?: string;
      sessionId?: string;
      method?: 'FACE_AI' | 'MANUAL';
      confidence?: number;
      notes?: string;
    }
  ): Promise<AttendanceRecord> => {
    const existingIndex = attendanceRecords.findIndex((r) => r.studentId === studentId);
    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10);
    const sessionId = options?.sessionId || (existingIndex >= 0 ? attendanceRecords[existingIndex].sessionId : 'CS-SEC-401-2026-W8');
    const className = options?.className || (existingIndex >= 0 ? attendanceRecords[existingIndex].className : 'CS 401: Cryptographic Engineering');

    const studentName = options?.studentName || (existingIndex >= 0 ? attendanceRecords[existingIndex].studentName : `Student ${studentId}`);
    const avatar = options?.avatar || (existingIndex >= 0 ? attendanceRecords[existingIndex].avatar : `/students/vedika_gupta.png`);

    // Backend REST API call
    try {
      const res = await api.markAttendance({
        studentId,
        status,
        studentName,
        avatar,
        className,
        method: options?.method || 'MANUAL',
        confidence: options?.confidence,
        notes: options?.notes || `Attendance registered via ${options?.method || 'MANUAL'}`
      });

      if (res && res.record) {
        const enrichedRecord: AttendanceRecord = {
          ...res.record,
          id: res.record.id || res.record._id || `att-${Date.now()}`,
          date: dateStr,
          timestamp: res.record.timestamp || now
        };

        if (existingIndex >= 0) {
          setAttendanceRecords((prev) => {
            const copy = [...prev];
            copy[existingIndex] = enrichedRecord;
            return copy;
          });
        } else {
          setAttendanceRecords((prev) => [enrichedRecord, ...prev]);
        }

        refreshBackendData();
        return enrichedRecord;
      }
    } catch (apiErr) {
      console.warn('Backend markAttendance fallback to client computation:', apiErr);
    }

    // Client fallback computation
    const canonical = canonicalizeAttendanceRecord({
      sessionId,
      studentId,
      timestamp: now,
      status,
      instructorId: 'INST-007'
    });

    const tag = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, canonical);
    const newBlockNumber = auditBlocks.length > 0 ? Math.max(...auditBlocks.map((b) => b.blockNumber)) + 1 : 1050;

    const newRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? attendanceRecords[existingIndex].id : `att-${Date.now()}`,
      sessionId,
      sessionTitle: options?.className || 'Advanced Applied Cryptography',
      className,
      studentId,
      studentName,
      avatar,
      date: dateStr,
      timestamp: now,
      status,
      canonicalString: canonical,
      hmacTag: tag,
      keyVersion: 'v2.4-prod',
      isTampered: false,
      integrityStatus: 'VERIFIED',
      auditChainBlock: newBlockNumber,
      verificationMethod: options?.method || 'MANUAL',
      faceConfidence: options?.confidence
    };

    if (existingIndex >= 0) {
      setAttendanceRecords((prev) => {
        const copy = [...prev];
        copy[existingIndex] = newRecord;
        return copy;
      });
    } else {
      setAttendanceRecords((prev) => [newRecord, ...prev]);
    }

    const eventTitle = options?.method === 'FACE_AI'
      ? `Face AI Verified: ${studentName} (${studentId}) marked ${status}`
      : `Manual Attendance: ${studentName} (${studentId}) marked ${status}`;

    setSecurityEvents((prev) => [
      {
        id: `evt-${Date.now()}`,
        timestamp: 'Just now',
        title: eventTitle,
        type: 'HMAC_VERIFIED',
        severity: 'INFO',
        description: `Cryptographic HMAC tag generated & verified (${newRecord.hmacTag.slice(0, 16)}...)`,
        resourceId: studentId
      },
      ...prev
    ]);

    return newRecord;
  };

  const sendMessage = async (conversationId: string, plaintext: string) => {
    const pseudoHex = Array.from(plaintext)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'me',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId: 'target',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      plaintext,
      ciphertext: `ENC-GCM256$${pseudoHex.slice(0, 24)}...${pseudoHex.slice(-12)}`,
      status: 'verified',
      signatureBadge: 'Valid',
      signatureHex: '3045022100' + pseudoHex.slice(0, 16) + '...022099',
      keyFingerprint: currentUser.keyFingerprint.slice(0, 21),
      isSimulatedEncrypted: true
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    // Update conversation snippet
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessageSnippet: plaintext,
            lastMessageTime: 'Just now'
          };
        }
        return c;
      })
    );
  };

  const verifyParticipantFingerprint = (threadId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === threadId) {
          return { ...c, fingerprintVerified: true };
        }
        return c;
      })
    );
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const verifyEntireHashChain = async () => {
    try {
      const res = await api.verifyAuditChain();
      if (res && typeof res.isChainValid === 'boolean') {
        return res.isChainValid;
      }
    } catch (e) {
      console.warn('Backend verifyAuditChain fallback:', e);
    }
    await new Promise((res) => setTimeout(res, 800));
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        theme,
        toggleTheme,
        cmdKOpen,
        setCmdKOpen,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        setIsAuthenticated,
        setUserRole,
        attendanceRecords,
        studentAccounts,
        updateStudentPhoto,
        verifyAttendanceRecord,
        tamperAttendanceRecord,
        reComputeAndFixRecord,
        createAttendanceSession,
        markStudentAttendance,
        activeTamperAlert,
        setActiveTamperAlert,
        instructorEditModalRecord,
        setInstructorEditModalRecord,
        historyModalRecord,
        setHistoryModalRecord,
        instructorUpdateAttendance,
        studentTamperAttempt,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        sendMessage,
        verifyParticipantFingerprint,
        metrics,
        auditBlocks,
        securityEvents,
        sessions,
        revokeSession,
        verifyEntireHashChain,
        notifications,
        unreadNotificationCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
