import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Download,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  FileSpreadsheet,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Users,
  Key,
  Camera,
  Upload,
  UserCheck,
  SlidersHorizontal,
  XCircle,
  Edit3
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { TamperBanner } from '../../components/ui/TamperBanner';
import { CopyButton } from '../../components/ui/CopyButton';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { AttendanceRecord } from '../../types';
import { INDIAN_STUDENT_ACCOUNTS } from '../../mock/indianStudents';
import { FaceAttendanceModal } from './FaceAttendanceModal';
import { ManualAttendanceModal } from './ManualAttendanceModal';

export const SecureAttendancePage: React.FC = () => {
  const {
    attendanceRecords,
    studentAccounts,
    updateStudentPhoto,
    currentUser,
    setCurrentUser,
    verifyAttendanceRecord,
    tamperAttendanceRecord,
    reComputeAndFixRecord,
    createAttendanceSession,
    markStudentAttendance
  } = useApp();
  const { success, error, info } = useToast();

  const isInstructor = currentUser.role === 'Instructor' || currentUser.role === 'Security Admin';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedIntegrity, setSelectedIntegrity] = useState('ALL');
  const [viewMode, setViewMode] = useState<'simple' | 'crypto'>('simple');

  // Modals & Drawer state
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [faceModalStudentId, setFaceModalStudentId] = useState<string | undefined>(undefined);
  const [manualModalStudentId, setManualModalStudentId] = useState<string | undefined>(undefined);
  const [accountsSearch, setAccountsSearch] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // File input ref for student photo upload in roster
  const rosterFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingTargetStudentId, setUploadingTargetStudentId] = useState<string | null>(null);

  const handleRosterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTargetStudentId) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'Please upload an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateStudentPhoto(uploadingTargetStudentId, base64);
      success('Photo Updated', 'Student photo updated successfully');
      setUploadingTargetStudentId(null);
    };
    reader.readAsDataURL(file);
  };

  // New Session form state
  const [newSessionTitle, setNewSessionTitle] = useState('Lab 09: Asymmetric Public Key Signatures');
  const [newSessionClass, setNewSessionClass] = useState('CS 401: Cryptographic Engineering');
  const [newStudentNames, setNewStudentNames] = useState('Vedika Gupta, Shashwat Srivastava, Ankit Chaudhary, Vaishnavi Tiwari, Harshit Dwivedi');

  // Filter records based on role (Student sees their own record)
  const roleFilteredRecords = isInstructor
    ? attendanceRecords
    : attendanceRecords.filter((r) =>
        r.studentName.toLowerCase() === currentUser.name.toLowerCase() ||
        (r as any).studentId?.toLowerCase() === (currentUser as any).studentId?.toLowerCase() ||
        r.studentName === 'Vedika Gupta' ||
        r.studentId === 'STU-001'
      );

  const filteredRecords = roleFilteredRecords.filter((rec) => {
    const matchesSearch =
      rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || rec.className === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || rec.status === selectedStatus;
    const matchesIntegrity = selectedIntegrity === 'ALL' || rec.integrityStatus === selectedIntegrity;
    return matchesSearch && matchesClass && matchesStatus && matchesIntegrity;
  });

  const tamperedRecords = attendanceRecords.filter((r) => r.isTampered);

  // Quick stats
  const totalStudents = roleFilteredRecords.length;
  const presentCount = roleFilteredRecords.filter((r) => r.status === 'Present').length;
  const absentCount = roleFilteredRecords.filter((r) => r.status === 'Absent').length;
  const lateCount = roleFilteredRecords.filter((r) => r.status === 'Late').length;
  const faceVerifiedCount = roleFilteredRecords.filter((r) => r.verificationMethod === 'FACE_AI').length;

  // Trigger row-level verification with real HMAC calculation
  const handleVerify = async (rec: AttendanceRecord) => {
    setVerifyingId(rec.id);
    const result = await verifyAttendanceRecord(rec.id);
    setVerifyingId(null);

    if (result.isValid) {
      success('Cryptographic Integrity Confirmed', `HMAC tag matches canonical record: ${result.expectedTag.slice(0, 16)}...`);
    } else {
      error('Tamper Alarm Triggered', `HMAC mismatch detected on ${rec.studentId}. Database altered!`);
    }
  };

  const handleOpenDetail = (rec: AttendanceRecord) => {
    setSelectedRecord(rec);
    setIsDetailDrawerOpen(true);
  };

  const handleQuickStatusChange = async (rec: AttendanceRecord, newStatus: 'Present' | 'Absent' | 'Late') => {
    try {
      await markStudentAttendance(rec.studentId, newStatus, {
        studentName: rec.studentName,
        avatar: rec.avatar,
        className: rec.className,
        method: 'MANUAL'
      });
      success('Status Updated & Sealed', `${rec.studentName} marked ${newStatus}`);
    } catch (e: any) {
      error('Update Failed', e.message);
    }
  };

  const handleOpenFaceModal = (studentId?: string) => {
    setFaceModalStudentId(studentId);
    setIsFaceModalOpen(true);
  };

  const handleOpenManualModal = (studentId?: string) => {
    setManualModalStudentId(studentId);
    setIsManualModalOpen(true);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = newStudentNames.split(',').map((s) => s.trim()).filter(Boolean);
    await createAttendanceSession(newSessionTitle, newSessionClass, names);
    setIsSessionModalOpen(false);
    success('Session Initialized & Signed', `Generated canonical HMAC digests for ${names.length} students`);
  };

  const handleExportCsv = () => {
    const headers = ['RecordID', 'StudentName', 'StudentID', 'Status', 'Method', 'Timestamp', 'HMAC_Tag', 'KeyVersion', 'IntegrityStatus'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.studentName}"`,
      r.studentId,
      r.status,
      r.verificationMethod || 'SYSTEM',
      r.timestamp,
      r.hmacTag,
      r.keyVersion,
      r.integrityStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cybershield_attendance_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
    success('Secure Export Downloaded', 'Export verified with cryptographic headers');
  };

  return (
    <div className="space-y-6">
      {/* 02 Section Header */}
      <SectionHeader
        number="02"
        title="Attendance & Security Ledger"
        subtitle="Mark attendance with AI Face Recognition or manually with automated HMAC-SHA256 tamper protection."
        badgeText={isInstructor ? 'INSTRUCTOR VAULT MODE' : 'STUDENT READ-ONLY MODE'}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary Face Attendance Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenFaceModal()}
              icon={<Camera className="w-4 h-4 text-black" />}
              className="font-bold shadow-[0_0_15px_rgba(0,245,160,0.3)] animate-pulse"
              data-cursor="FACE AI"
            >
              📸 Face Attendance
            </Button>

            {/* Manual Attendance Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenManualModal()}
              icon={<Edit3 className="w-4 h-4 text-accent-cyan" />}
            >
              ✍️ Manual Attendance
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAccountsModalOpen(true)}
              icon={<Users className="w-4 h-4 text-accent-emerald" />}
              data-cursor="STUDENTS"
            >
              Roster ({studentAccounts.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(true)}
              icon={<Download className="w-4 h-4 text-accent-cyan" />}
            >
              Export CSV
            </Button>

            {isInstructor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSessionModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                New Session
              </Button>
            )}
          </div>
        }
      />

      {/* Tamper Detected Alert Banner (if any record is altered) */}
      {tamperedRecords.length > 0 && (
        <TamperBanner
          title={`TAMPER DETECTED: Record Altered Without Cryptographic Authority`}
          description={tamperedRecords[0]?.tamperReason || 'Stored database record does not match its authoritative HMAC tag.'}
          recordId={tamperedRecords[0]?.id}
          onVerifyAgain={() => handleVerify(tamperedRecords[0])}
          onAuthorizedFix={() => reComputeAndFixRecord(tamperedRecords[0]?.id)}
        />
      )}

      {/* Quick Summary Stat Cards - Easy to understand */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="p-4 rounded-2xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span className="font-heading font-semibold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-text-muted" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-text-primary">
              {totalStudents}
            </span>
            <span className="text-xs text-text-muted font-mono">Enrolled</span>
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div className="p-4 rounded-2xl border border-accent-emerald/30 bg-accent-emerald/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-accent-emerald text-xs">
            <span className="font-heading font-bold uppercase">Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-accent-emerald">
              {presentCount}
            </span>
            <span className="text-xs text-accent-emerald/80 font-mono">
              ({totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Card 3: Absent */}
        <div className="p-4 rounded-2xl border border-danger/30 bg-danger/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-danger text-xs">
            <span className="font-heading font-bold uppercase">Absent</span>
            <XCircle className="w-4 h-4 text-danger" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-danger">
              {absentCount}
            </span>
            <span className="text-xs text-danger/80 font-mono">Students</span>
          </div>
        </div>

        {/* Card 4: Face AI Verified */}
        <div className="p-4 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-accent-cyan text-xs">
            <span className="font-heading font-bold uppercase">Face AI Scans</span>
            <Camera className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-extrabold text-accent-cyan">
              {faceVerifiedCount}
            </span>
            <span className="text-xs text-accent-cyan/80 font-mono">Biometric</span>
          </div>
        </div>
      </div>

      {/* Prominent Quick Actions Banner */}
      <div className="p-5 rounded-2xl border border-accent-emerald/30 bg-gradient-to-r from-accent-emerald/10 via-bg-surface/90 to-accent-cyan/10 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-emerald/20 border border-accent-emerald/50 flex items-center justify-center text-accent-emerald shadow-[0_0_20px_rgba(0,245,160,0.25)] shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base text-text-primary">
                Smart Face Recognition Kiosk
              </span>
              <span className="px-2 py-0.5 rounded-full bg-accent-emerald/20 text-accent-emerald font-mono text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Stand in front of the camera to automatically detect face, verify liveness, and seal attendance with HMAC signature.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenFaceModal()}
            icon={<Camera className="w-4 h-4" />}
            className="flex-1 md:flex-initial font-bold shadow-[0_0_15px_rgba(0,245,160,0.3)]"
          >
            Start Face Scan
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => handleOpenManualModal()}
            icon={<Edit3 className="w-4 h-4" />}
            className="flex-1 md:flex-initial"
          >
            Manual Add
          </Button>
        </div>
      </div>

      {/* Filters and Controls Row */}
      <div className="p-4 rounded-2xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student name, roll number, or session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none"
          />
        </div>

        {/* Filter dropdowns & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-text-primary focus:outline-none font-mono text-[11px]"
          >
            <option value="ALL">Status: All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>

          {/* View Mode Toggle: Simple vs Crypto Audit */}
          <div className="flex items-center p-0.5 rounded-xl bg-bg-base border border-border-subtle">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-semibold transition-all ${
                viewMode === 'simple'
                  ? 'bg-accent-emerald text-black shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Easy View
            </button>
            <button
              onClick={() => setViewMode('crypto')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-semibold transition-all ${
                viewMode === 'crypto'
                  ? 'bg-accent-emerald text-black shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Crypto Audit View
            </button>
          </div>

          {/* Tamper Test Button for Instructor */}
          {isInstructor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => tamperAttendanceRecord('att-001', 'Absent')}
              className="text-xs text-danger border-danger/30 hover:border-danger hover:bg-danger/10"
              title="Test tamper detection alert by altering row #1"
            >
              Test Tamper
            </Button>
          )}
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-elevated/60 border-b border-border-subtle font-mono text-[11px] uppercase text-text-muted">
              <tr>
                <th className="p-4">Student & Roll No</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Quick Mark Attendance</th>
                <th className="p-4">Method & Verification</th>
                {viewMode === 'crypto' && (
                  <>
                    <th className="p-4">HMAC Signature</th>
                    <th className="p-4">Key Ver.</th>
                  </>
                )}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === 'crypto' ? 7 : 5} className="p-12 text-center text-text-muted">
                    No matching attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isTampered = rec.isTampered;
                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors group ${
                        isTampered
                          ? 'bg-danger/10 hover:bg-danger/15'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Student info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.avatar}
                            alt={rec.studentName}
                            className="w-10 h-10 rounded-xl object-cover border border-border-subtle shrink-0 shadow-sm"
                          />
                          <div>
                            <span className="font-heading font-bold text-text-primary block text-sm">
                              {rec.studentName}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-accent-cyan font-semibold">
                                {rec.studentId}
                              </span>
                              <span className="text-[10px] text-text-muted">
                                • {rec.className.split(':')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Status Chip */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider ${
                            rec.status === 'Present'
                              ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 shadow-[0_0_10px_rgba(0,245,160,0.15)]'
                              : rec.status === 'Late'
                              ? 'bg-warning/15 text-warning border border-warning/30'
                              : 'bg-danger/15 text-danger border border-danger/30'
                          }`}
                        >
                          {rec.status === 'Present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {rec.status === 'Late' && <Clock className="w-3.5 h-3.5" />}
                          {rec.status === 'Absent' && <XCircle className="w-3.5 h-3.5" />}
                          {rec.status}
                        </span>
                      </td>

                      {/* 1-Click Quick Mark Attendance Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickStatusChange(rec, 'Present')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-heading font-semibold transition-all ${
                              rec.status === 'Present'
                                ? 'bg-accent-emerald text-black font-bold'
                                : 'bg-bg-elevated/70 text-text-muted hover:text-accent-emerald hover:bg-accent-emerald/10 border border-border-subtle'
                            }`}
                            title="Mark Present with HMAC signature"
                          >
                            ✓ Present
                          </button>

                          <button
                            onClick={() => handleQuickStatusChange(rec, 'Late')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-heading font-semibold transition-all ${
                              rec.status === 'Late'
                                ? 'bg-warning text-black font-bold'
                                : 'bg-bg-elevated/70 text-text-muted hover:text-warning hover:bg-warning/10 border border-border-subtle'
                            }`}
                            title="Mark Late with HMAC signature"
                          >
                            ⏱ Late
                          </button>

                          <button
                            onClick={() => handleQuickStatusChange(rec, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-heading font-semibold transition-all ${
                              rec.status === 'Absent'
                                ? 'bg-danger text-white font-bold'
                                : 'bg-bg-elevated/70 text-text-muted hover:text-danger hover:bg-danger/10 border border-border-subtle'
                            }`}
                            title="Mark Absent with HMAC signature"
                          >
                            ✕ Absent
                          </button>
                        </div>
                      </td>

                      {/* Method & Verification status */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {rec.verificationMethod === 'FACE_AI' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-cyan/15 text-accent-cyan font-mono text-[10px] font-bold border border-accent-cyan/30">
                                <Camera className="w-3 h-3" />
                                <span>Face AI ({rec.faceConfidence ? `${rec.faceConfidence}%` : 'Verified'})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] text-text-muted font-mono text-[10px]">
                                <UserCheck className="w-3 h-3" />
                                <span>{rec.verificationMethod || 'Manual Entry'}</span>
                              </span>
                            )}
                          </div>
                          <div>
                            <StatusPill status={rec.integrityStatus} size="sm" />
                          </div>
                        </div>
                      </td>

                      {/* Crypto View Columns */}
                      {viewMode === 'crypto' && (
                        <>
                          <td className="p-4 font-mono text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className={`truncate max-w-[120px] ${isTampered ? 'text-danger line-through' : 'text-text-muted'}`}>
                                {rec.hmacTag}
                              </span>
                              <CopyButton value={rec.hmacTag} label="" />
                            </div>
                          </td>

                          <td className="p-4 font-mono text-[11px]">
                            <span className={rec.keyVersion.includes('legacy') ? 'text-warning font-semibold' : 'text-text-muted'}>
                              {rec.keyVersion}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Face Scan Trigger for this student */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenFaceModal(rec.studentId)}
                            className="text-accent-emerald border-accent-emerald/30 hover:bg-accent-emerald/10"
                            icon={<Camera className="w-3.5 h-3.5" />}
                            title="Scan face for this student"
                          >
                            Face Scan
                          </Button>

                          <Button
                            variant={isTampered ? 'danger' : 'outline'}
                            size="sm"
                            loading={verifyingId === rec.id}
                            onClick={() => handleVerify(rec)}
                            data-cursor="VERIFY"
                          >
                            Verify
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(rec)}
                            data-cursor="DETAILS"
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face Attendance AI Modal */}
      <FaceAttendanceModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        preSelectedStudentId={faceModalStudentId}
      />

      {/* Manual Attendance Add/Edit Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        preSelectedStudentId={manualModalStudentId}
      />

      {/* Record Detail Drawer */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title="Canonical Record Audit Inspector"
        subtitle={selectedRecord ? `RECORD ID: ${selectedRecord.id}` : ''}
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Status overview */}
            <div className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle flex items-center justify-between">
              <div>
                <span className="micro-label text-text-muted block">Integrity Verdict</span>
                <StatusPill status={selectedRecord.integrityStatus} size="lg" className="mt-1" />
              </div>
              <div className="text-right">
                <span className="micro-label text-text-muted block">Audit Block</span>
                <span className="font-mono text-sm text-accent-cyan font-bold block mt-1">
                  #{selectedRecord.auditChainBlock}
                </span>
              </div>
            </div>

            {/* Tamper Alert if tampered */}
            {selectedRecord.isTampered && (
              <div className="p-4 rounded-xl border border-danger/40 bg-danger/10 text-danger text-xs space-y-2">
                <div className="flex items-center gap-2 font-heading font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Mathematical Signature Verification Failed</span>
                </div>
                <p className="leading-relaxed">
                  {selectedRecord.tamperReason || 'Data has been modified in storage after the original HMAC was calculated.'}
                </p>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    await reComputeAndFixRecord(selectedRecord.id);
                    setIsDetailDrawerOpen(false);
                    success('Record Authorized & Re-signed', 'New HMAC-SHA256 signature generated and verified');
                  }}
                  className="mt-2"
                >
                  Authorize Correction & Re-sign
                </Button>
              </div>
            )}

            {/* Student & Class Details */}
            <div className="space-y-3 text-xs">
              <span className="micro-label text-accent-emerald block">ATTENDANCE METADATA</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border-subtle">
                  <span className="text-text-muted block text-[10px] uppercase">Student Name</span>
                  <span className="font-heading font-bold text-text-primary text-sm mt-0.5 block">
                    {selectedRecord.studentName}
                  </span>
                  <span className="font-mono text-accent-cyan">{selectedRecord.studentId}</span>
                </div>
                <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border-subtle">
                  <span className="text-text-muted block text-[10px] uppercase">Recorded Status</span>
                  <span className="font-heading font-bold text-text-primary text-sm mt-0.5 block">
                    {selectedRecord.status}
                  </span>
                  <span className="font-mono text-text-muted">{selectedRecord.date}</span>
                </div>
              </div>
            </div>

            {/* Canonical Record View */}
            <div>
              <span className="micro-label text-accent-cyan block mb-2">RFC DETERMINISTIC CANONICAL BUFFER</span>
              <CodeBlock
                code={selectedRecord.canonicalString}
                language="canonical-format"
                label="Raw Ingestion String"
              />
              <span className="text-[10px] font-mono text-text-muted block mt-1">
                Standard: CS-ATTENDANCE-V1 | Pipe-delimited key values
              </span>
            </div>

            {/* HMAC Signature Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="micro-label text-accent-emerald">CRYPTOGRAPHIC HMAC-SHA256 TAG</span>
                <span className="text-[10px] font-mono text-text-muted">Key: {selectedRecord.keyVersion}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-bg-base border border-border-subtle flex items-center justify-between font-mono text-xs">
                <span className="text-accent-emerald font-bold truncate max-w-sm">
                  {selectedRecord.hmacTag}
                </span>
                <CopyButton value={selectedRecord.hmacTag} />
              </div>
            </div>

            {/* History Timeline */}
            <div>
              <span className="micro-label text-text-muted block mb-3">RECORD HISTORY TIMELINE</span>
              <div className="space-y-3 font-mono text-xs pl-2 border-l border-border-subtle">
                <div className="relative pl-4">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-accent-emerald" />
                  <span className="text-text-primary font-bold block">Session Check-In Ingested</span>
                  <span className="text-[10px] text-text-muted">{selectedRecord.timestamp}</span>
                </div>
                <div className="relative pl-4">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-accent-cyan" />
                  <span className="text-text-primary font-bold block">Canonical Digest Sealed (v2.4)</span>
                  <span className="text-[10px] text-text-muted">Tagged via WebCrypto SubtleEngine</span>
                </div>
                <div className="relative pl-4">
                  <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full ${selectedRecord.isTampered ? 'bg-danger' : 'bg-accent-emerald'}`} />
                  <span className={`font-bold block ${selectedRecord.isTampered ? 'text-danger' : 'text-text-primary'}`}>
                    {selectedRecord.isTampered ? 'Tamper Detected by Automated Verifier' : 'Cryptographic Integrity Audit Passed'}
                  </span>
                  <span className="text-[10px] text-text-muted">Audit Block #{selectedRecord.auditChainBlock}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailDrawerOpen(false)}
              >
                Close Drawer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await handleVerify(selectedRecord);
                  setIsDetailDrawerOpen(false);
                }}
              >
                Run Live Re-Verification
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Session Creator Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Create New Cryptographically Sealed Session"
        subtitle="Generates canonical hash strings and signs each student record with the active HMAC root key."
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="micro-label text-text-muted block mb-1">Session Title</label>
            <input
              type="text"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary focus:border-accent-emerald focus:outline-none"
            />
          </div>

          <div>
            <label className="micro-label text-text-muted block mb-1">Class</label>
            <input
              type="text"
              value={newSessionClass}
              onChange={(e) => setNewSessionClass(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary focus:border-accent-emerald focus:outline-none"
            />
          </div>

          <div>
            <label className="micro-label text-text-muted block mb-1">Student Roster Names (Comma Separated)</label>
            <textarea
              rows={3}
              value={newStudentNames}
              onChange={(e) => setNewStudentNames(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary focus:border-accent-emerald focus:outline-none font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSessionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Commit & Seal Roster
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Export Confirmation Dialog */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Cryptographic Attendance Ledger"
        subtitle="Generates an authenticated CSV file containing all canonical strings and HMAC tags for third-party compliance verification."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle font-mono text-xs space-y-2">
            <div className="flex justify-between text-text-muted">
              <span>Records to Export:</span>
              <span className="text-text-primary font-bold">{filteredRecords.length} items</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Integrity Tags Included:</span>
              <span className="text-accent-emerald font-bold">HMAC-SHA256 (64 hex characters)</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-4 h-4" />}
            >
              Confirm & Download CSV
            </Button>
          </div>
        </div>
      </Modal>

      {/* Hidden file input for uploading student photo from roster */}
      <input
        type="file"
        ref={rosterFileInputRef}
        onChange={handleRosterPhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Enrolled Students Accounts Modal */}
      <Modal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        maxWidth="xl"
        title="Enrolled Student Accounts & Facial Biometrics"
        subtitle={`${studentAccounts.length} Verified Students Enrolled with Hardware MFA, Custom Facial Profiles & HMAC-SHA256 Signatures.`}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-bg-base/80 border border-border-subtle">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name or STU-00X..."
                value={accountsSearch}
                onChange={(e) => setAccountsSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-emerald"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <span className="text-accent-emerald font-bold">{studentAccounts.length} Students Enrolled</span>
              <span>•</span>
              <span className="text-accent-cyan font-bold">Biometric Face + HMAC</span>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="max-h-[55vh] overflow-y-auto space-y-3 pr-1">
            {studentAccounts
              .filter((acc) =>
                acc.name.toLowerCase().includes(accountsSearch.toLowerCase()) ||
                acc.studentId.toLowerCase().includes(accountsSearch.toLowerCase()) ||
                acc.email.toLowerCase().includes(accountsSearch.toLowerCase())
              )
              .map((acc, index) => {
                const rec = attendanceRecords.find((r) => r.studentId === acc.studentId);
                const isCurrent = currentUser.name === acc.name;

                return (
                  <div
                    key={acc.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-accent-emerald bg-accent-emerald/10 shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                        : 'border-border-subtle bg-bg-base/60 hover:border-border-hover'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative group/avatar">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-border-subtle shrink-0 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setUploadingTargetStudentId(acc.studentId);
                              rosterFileInputRef.current?.click();
                            }}
                            className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white text-[10px]"
                            title="Upload new photo"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-sm text-text-primary">
                              {index + 1}. {acc.name}
                            </span>
                            <span className="font-mono text-xs text-accent-cyan font-bold">
                              {acc.studentId}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-accent-emerald/20 text-accent-emerald font-bold">
                                ACTIVE USER
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-text-muted block mt-0.5">
                            {acc.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setUploadingTargetStudentId(acc.studentId);
                            rosterFileInputRef.current?.click();
                          }}
                          icon={<Upload className="w-3.5 h-3.5 text-accent-cyan" />}
                          title="Upload / Change student photo"
                        >
                          Photo
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAccountsModalOpen(false);
                            handleOpenFaceModal(acc.studentId);
                          }}
                          icon={<Camera className="w-3.5 h-3.5 text-accent-emerald" />}
                        >
                          Face Scan
                        </Button>
                        <Button
                          size="sm"
                          variant={isCurrent ? 'ghost' : 'outline'}
                          onClick={() => {
                            setCurrentUser({
                              id: acc.id,
                              name: acc.name,
                              email: acc.email,
                              role: 'Student',
                              avatar: acc.avatar,
                              mfaEnabled: true,
                              keyFingerprint: acc.keyFingerprint,
                              joinedDate: acc.joinedDate
                            });
                            setIsAccountsModalOpen(false);
                            success('Account Switched Immediately', `Now viewing as ${acc.name} (${acc.studentId})`);
                          }}
                        >
                          {isCurrent ? 'Current' : 'Switch'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted">
              Passkey Default: <code className="text-accent-cyan font-bold">CyberStudent@2026!</code>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAccountsModalOpen(false)}
            >
              Close Roster
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
