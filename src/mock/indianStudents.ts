import { AttendanceRecord, UserProfile } from '../types';

export interface StudentAccount extends UserProfile {
  studentId: string;
  defaultPassword: string;
  status: 'Present' | 'Absent' | 'Late';
  canonicalString: string;
  hmacTag: string;
}

export const INITIAL_5_STUDENTS: StudentAccount[] = [
  {
    id: 'usr-stu-001',
    studentId: 'STU-001',
    name: 'Vedika Gupta',
    email: 'vedika.gupta@cybershield.edu',
    role: 'Student',
    avatar: '/students/vedika_gupta.png',
    mfaEnabled: true,
    keyFingerprint: 'A1B2 : C3D4 : E5F6 : 7890 : 1122 : 3344 : 5566 : 7788',
    joinedDate: 'October 2026',
    defaultPassword: 'CyberStudent@2026!',
    status: 'Present',
    canonicalString: 'CS-ATTENDANCE-V1|SESSION:CS-SEC-401-2026-W8|STUDENT:STU-001|TIME:2026-10-30T09:00:00Z|STATUS:Present|INSTRUCTOR:INST-007',
    hmacTag: 'a3fbb584513161567afb8c56203643adc6c3a04b691b68fcff9cd80d6b831869'
  },
  {
    id: 'usr-stu-002',
    studentId: 'STU-002',
    name: 'Shashwat Srivastava',
    email: 'shashwat.srivastava@cybershield.edu',
    role: 'Student',
    avatar: '/students/shashwat_srivastava.png',
    mfaEnabled: true,
    keyFingerprint: 'B2C3 : D4E5 : F6A1 : 8901 : 2233 : 4455 : 6677 : 8899',
    joinedDate: 'October 2026',
    defaultPassword: 'CyberStudent@2026!',
    status: 'Present',
    canonicalString: 'CS-ATTENDANCE-V1|SESSION:CS-SEC-401-2026-W8|STUDENT:STU-002|TIME:2026-10-30T09:02:00Z|STATUS:Present|INSTRUCTOR:INST-007',
    hmacTag: 'd73636d4dac5a735b5a8ecdbdd631f6d4d1be5e16b5db51d50c3cecff3776071'
  },
  {
    id: 'usr-stu-003',
    studentId: 'STU-003',
    name: 'Ankit Chaudhary',
    email: 'ankit.chaudhary@cybershield.edu',
    role: 'Student',
    avatar: '/students/ankit_chaudhary.png',
    mfaEnabled: true,
    keyFingerprint: 'C3D4 : E5F6 : A1B2 : 9012 : 3344 : 5566 : 7788 : 9900',
    joinedDate: 'October 2026',
    defaultPassword: 'CyberStudent@2026!',
    status: 'Present',
    canonicalString: 'CS-ATTENDANCE-V1|SESSION:CS-SEC-401-2026-W8|STUDENT:STU-003|TIME:2026-10-30T09:04:00Z|STATUS:Present|INSTRUCTOR:INST-007',
    hmacTag: '5e8e08001dcf26ef113c2f83470f58eba9c388e79592676e7bdd89c49b00aae4'
  },
  {
    id: 'usr-stu-004',
    studentId: 'STU-004',
    name: 'Vaishnavi Tiwari',
    email: 'vaishnavi.tiwari@cybershield.edu',
    role: 'Student',
    avatar: '/students/vaishnavi_tiwari.png',
    mfaEnabled: true,
    keyFingerprint: 'D4E5 : F6A1 : B2C3 : 0123 : 4455 : 6677 : 8899 : 0011',
    joinedDate: 'October 2026',
    defaultPassword: 'CyberStudent@2026!',
    status: 'Present',
    canonicalString: 'CS-ATTENDANCE-V1|SESSION:CS-SEC-401-2026-W8|STUDENT:STU-004|TIME:2026-10-30T09:06:00Z|STATUS:Present|INSTRUCTOR:INST-007',
    hmacTag: 'af3b4a5f7cf4e8578f52824d40bdec5a147f8b5efeea51a42ec7a4c608eb202a'
  },
  {
    id: 'usr-stu-005',
    studentId: 'STU-005',
    name: 'Harshit Dwivedi',
    email: 'harshit.dwivedi@cybershield.edu',
    role: 'Student',
    avatar: '/students/harshit_dwivedi.png',
    mfaEnabled: true,
    keyFingerprint: 'E5F6 : A1B2 : C3D4 : 1234 : 5566 : 7788 : 9900 : 1122',
    joinedDate: 'October 2026',
    defaultPassword: 'CyberStudent@2026!',
    status: 'Absent',
    canonicalString: 'CS-ATTENDANCE-V1|SESSION:CS-SEC-401-2026-W8|STUDENT:STU-005|TIME:2026-10-30T09:08:00Z|STATUS:Absent|INSTRUCTOR:INST-007',
    hmacTag: '46b02358e7ec0d46204c4d9690af724df3ae81c6ed24c265d8a33984c7003c92'
  }
];

export const INDIAN_STUDENT_ACCOUNTS: StudentAccount[] = INITIAL_5_STUDENTS;

export const INDIAN_STUDENTS_ATTENDANCE: AttendanceRecord[] = INITIAL_5_STUDENTS.map((s, idx) => ({
  id: `att-00${idx + 1}`,
  sessionId: 'CS-SEC-401-2026-W8',
  sessionTitle: 'Advanced Applied Cryptography',
  className: 'CS 401: Cryptographic Engineering',
  studentId: s.studentId,
  studentName: s.name,
  avatar: s.avatar,
  date: '2026-10-30',
  timestamp: `2026-10-30T09:0${idx * 2}:00Z`,
  status: s.status,
  canonicalString: s.canonicalString,
  hmacTag: s.hmacTag,
  keyVersion: 'v2.4-prod',
  isTampered: false,
  integrityStatus: 'VERIFIED',
  auditChainBlock: 1040 + idx,
  verificationMethod: s.status === 'Present' ? 'FACE_AI' : 'MANUAL',
  faceConfidence: s.status === 'Present' ? 98.6 : undefined
}));
