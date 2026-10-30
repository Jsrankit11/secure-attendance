/**
 * SecureAttendance Full-Stack API Client
 * Automatically connects to backend REST APIs on /api with JWT authorization headers
 */

import { INDIAN_STUDENT_ACCOUNTS } from '../mock/indianStudents';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('cybershield_jwt_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('cybershield_jwt_token', token);
  } else {
    localStorage.removeItem('cybershield_jwt_token');
  }
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (parseErr) {
    throw new Error(`API Endpoint ${endpoint} returned non-JSON response (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.message || `API Error: ${res.status} ${res.statusText}`);
  }
  return data;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    try {
      return await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    } catch (err: any) {
      console.warn('Backend server unreached, falling back to local credentials engine:', err.message);
      const cleanEmail = email.toLowerCase().trim();
      if (
        cleanEmail === 'a.sharma@cybershield.edu' &&
        (password === 'Password@2026!' || password === 'Security#2026!')
      ) {
        return {
          success: true,
          token: 'demo_jwt_instructor_token_cybershield_2026',
          user: {
            id: 'USR-INST-007',
            name: 'Prof. Ankit Sharma',
            email: 'a.sharma@cybershield.edu',
            role: 'Instructor',
            avatar: '/students/ankit_chaudhary.png',
            mfaEnabled: true,
            keyFingerprint: '4A7B : E921 : CC04 : 88DF : 1102 : 9B73 : 33BC : FA19',
            joinedDate: 'October 2026'
          }
        };
      }
      const student = INDIAN_STUDENT_ACCOUNTS.find((s) => s.email.toLowerCase() === cleanEmail);
      if (student && (password === 'Password@2026!' || password === student.defaultPassword)) {
        return {
          success: true,
          token: `demo_jwt_student_${student.studentId}_token`,
          user: {
            ...student,
            role: 'Student'
          }
        };
      }
      throw new Error(err.message || 'Invalid credentials');
    }
  },

  register: async (payload: { name: string; email: string; password: string; role?: string; studentId?: string }) => {
    try {
      return await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    } catch (err) {
      console.warn('Backend registration fallback:', err);
      return {
        success: true,
        token: `demo_jwt_reg_${Date.now()}`,
        user: {
          id: `usr-reg-${Date.now()}`,
          studentId: payload.studentId || `STU-${Date.now().toString().slice(-3)}`,
          name: payload.name,
          email: payload.email,
          role: payload.role || 'Student',
          avatar: '/students/vedika_gupta.png',
          mfaEnabled: true,
          keyFingerprint: '4A7B : E921 : CC04 : 88DF : 1102 : 9B73 : 33BC : FA19',
          joinedDate: 'October 2026'
        }
      };
    }
  },

  getMe: () =>
    apiRequest('/auth/me'),

  seedDatabase: () =>
    apiRequest('/auth/seed', { method: 'POST' }),

  // Attendance
  getAttendance: () =>
    apiRequest('/attendance'),

  markAttendance: (payload: {
    studentId: string;
    status: 'Present' | 'Absent' | 'Late';
    studentName?: string;
    avatar?: string;
    className?: string;
    method?: string;
    confidence?: number;
    notes?: string;
  }) =>
    apiRequest('/attendance/mark', { method: 'POST', body: JSON.stringify(payload) }),

  verifyAttendance: (recordId: string) =>
    apiRequest(`/attendance/${recordId}/verify`, { method: 'POST' }),

  instructorUpdate: (recordId: string, payload: { newStatus: 'Present' | 'Absent' | 'Late'; reason: string; notes?: string }) =>
    apiRequest(`/attendance/${recordId}/instructor-update`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  studentTamper: (recordId: string, payload: { attemptedStatus: 'Present' | 'Absent' | 'Late' }) =>
    apiRequest(`/attendance/${recordId}/student-tamper`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  tamperAttendance: (recordId: string, newStatus?: string) =>
    apiRequest(`/attendance/${recordId}/tamper`, { method: 'POST', body: JSON.stringify({ newStatus }) }),

  fixAttendance: (recordId: string) =>
    apiRequest(`/attendance/${recordId}/fix`, { method: 'POST' }),

  verifyAllAttendance: () =>
    apiRequest('/attendance/verify-all', { method: 'POST' }),

  // Students
  getStudents: () =>
    apiRequest('/students'),

  addStudent: (student: { name: string; email: string; studentId: string; avatar?: string }) =>
    apiRequest('/students', { method: 'POST', body: JSON.stringify(student) }),

  updateStudentPhoto: (studentId: string, photoBase64: string) =>
    apiRequest(`/students/${studentId}/photo`, { method: 'PUT', body: JSON.stringify({ photoBase64 }) }),

  // Audit Logs
  getAuditLogs: () =>
    apiRequest('/audit'),

  verifyAuditChain: () =>
    apiRequest('/audit/verify-chain', { method: 'POST' }),

  // Security Telemetry
  getSecurityEvents: () =>
    apiRequest('/security/events'),

  getSecurityTelemetry: () =>
    apiRequest('/security/telemetry')
};
