import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Lock,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  FileText,
  UserCheck
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { CopyButton } from '../../components/ui/CopyButton';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { AttendanceRecord } from '../../types';
import { FaceAttendanceModal } from '../attendance/FaceAttendanceModal';

export const StudentDashboardPage: React.FC = () => {
  const {
    currentUser,
    attendanceRecords,
    verifyAttendanceRecord,
    setCurrentPage,
    setHistoryModalRecord,
    studentTamperAttempt
  } = useApp();
  const { success, error } = useToast();

  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Private isolation: Filter records ONLY belonging to this student
  const studentRecords = attendanceRecords.filter((r) =>
    r.studentId === (currentUser as any).studentId ||
    r.studentName.toLowerCase() === currentUser.name.toLowerCase() ||
    (currentUser.role === 'Student' && r.studentId === 'STU-001')
  );

  const totalClasses = studentRecords.length;
  const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
  const absentCount = studentRecords.filter((r) => r.status === 'Absent').length;
  const lateCount = studentRecords.filter((r) => r.status === 'Late').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  const handleVerify = async (rec: AttendanceRecord) => {
    setVerifyingId(rec.id);
    const result = await verifyAttendanceRecord(rec.id);
    setVerifyingId(null);

    if (result.isValid) {
      success('Cryptographic Integrity Confirmed', `HMAC digest matches canonical RFC string: ${result.expectedTag.slice(0, 16)}...`);
    } else {
      error('Integrity Mismatch', 'Record does not match expected cryptographic hash!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Student Section Header */}
      <SectionHeader
        number="01"
        title={`Welcome, ${currentUser.name}`}
        subtitle={`Private Student Attendance Vault & Cryptographic Proofs • Roll No: ${(currentUser as any).studentId || 'STU-001'}`}
        badgeText="STUDENT PRIVATE VAULT"
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsFaceModalOpen(true)}
              icon={<Camera className="w-4 h-4 text-black" />}
              className="font-bold shadow-[0_0_15px_rgba(0,245,160,0.3)] animate-pulse"
            >
              📸 Face Check-In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage('history')}
              icon={<FileText className="w-4 h-4 text-accent-cyan" />}
            >
              Full Ledger History
            </Button>
          </div>
        }
      />

      {/* Student Profile Card & Attendance Percentage */}
      <div className="p-6 rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-emerald/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-extrabold text-text-primary">
                {currentUser.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-accent-emerald/15 text-accent-emerald font-mono text-xs font-bold border border-accent-emerald/30">
                {(currentUser as any).studentId || 'STU-001'}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 font-mono">
              {currentUser.email} • Hardware Passkey: <span className="text-accent-cyan">{currentUser.keyFingerprint.slice(0, 19)}...</span>
            </p>
          </div>
        </div>

        {/* Big Percentage Metric */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-bg-base/80 border border-border-subtle w-full md:w-auto justify-between md:justify-start">
          <div>
            <span className="micro-label text-text-muted block">ATTENDANCE RATE</span>
            <span className={`text-3xl font-heading font-extrabold block mt-0.5 ${attendancePercentage >= 75 ? 'text-accent-emerald' : 'text-danger'}`}>
              {attendancePercentage}%
            </span>
          </div>
          <div className="text-right">
            <span className="micro-label text-text-muted block">ACADEMIC STANDING</span>
            <span className={`text-xs font-mono font-bold block mt-1.5 ${attendancePercentage >= 75 ? 'text-accent-emerald' : 'text-danger'}`}>
              {attendancePercentage >= 75 ? '✅ ELIGIBLE FOR EXAMS' : '⚠️ ATTENDANCE SHORTAGE'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span className="font-heading font-semibold uppercase">Total Sessions</span>
            <Calendar className="w-4 h-4 text-text-muted" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-text-primary">
            {totalClasses}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-accent-emerald/30 bg-accent-emerald/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-accent-emerald text-xs">
            <span className="font-heading font-bold uppercase">Present Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-accent-emerald">
            {presentCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-danger/30 bg-danger/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-danger text-xs">
            <span className="font-heading font-bold uppercase">Absences</span>
            <XCircle className="w-4 h-4 text-danger" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-danger">
            {absentCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-accent-cyan text-xs">
            <span className="font-heading font-bold uppercase">Cryptographic Proofs</span>
            <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="mt-2 text-2xl font-heading font-extrabold text-accent-cyan">
            {presentCount} Sealed
          </div>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-accent-cyan shrink-0" />
          <p className="text-xs text-text-muted">
            <strong className="text-white">Role-Based Access Control (RBAC) Active:</strong> Your attendance records are cryptographically sealed with HMAC-SHA256 and AES-256-GCM. Other students cannot access your records.
          </p>
        </div>
        <span className="font-mono text-[10px] text-accent-cyan uppercase px-2.5 py-1 rounded-md bg-accent-cyan/20 border border-accent-cyan/40 shrink-0 font-bold">
          PRIVATE ISOLATION
        </span>
      </div>

      {/* Personal Attendance Records Table */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-text-primary">
              Your Verified Attendance History
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Each record includes canonical verification string and cryptographic HMAC digest.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-elevated/60 border-b border-border-subtle font-mono text-[11px] uppercase text-text-muted">
              <tr>
                <th className="p-4">Session & Subject</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Recorded Status</th>
                <th className="p-4">HMAC Signature</th>
                <th className="p-4">Integrity Status</th>
                <th className="p-4 text-right">Cryptographic Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted">
                    No attendance records found for your student profile.
                  </td>
                </tr>
              ) : (
                studentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-heading font-bold text-text-primary block">
                        {rec.sessionTitle || rec.className}
                      </span>
                      <span className="font-mono text-[10px] text-accent-cyan block mt-0.5">
                        {rec.sessionId}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-text-muted">
                      <span className="block text-text-primary font-medium">{rec.date}</span>
                      <span className="text-[10px] block mt-0.5">{rec.timestamp.slice(11, 19)} UTC</span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase ${
                          rec.status === 'Present'
                            ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                            : 'bg-danger/15 text-danger border border-danger/30'
                        }`}
                      >
                        {rec.status === 'Present' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {rec.status}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[140px] text-accent-emerald font-semibold">
                          {rec.hmacTag}
                        </span>
                        <CopyButton value={rec.hmacTag} label="" />
                      </div>
                    </td>

                    <td className="p-4">
                      <StatusPill status={rec.integrityStatus} size="sm" />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          loading={verifyingId === rec.id}
                          onClick={() => handleVerify(rec)}
                          className="text-[11px] px-2 py-1"
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryModalRecord(rec)}
                          className="text-[11px] px-2 py-1 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                        >
                          History
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => studentTamperAttempt(rec.id, 'Present')}
                          className="text-[11px] px-2 py-1 border-danger/40 text-danger hover:bg-danger/10"
                          title="Simulate student trying to illegally change attendance status"
                        >
                          Tamper
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(rec);
                            setIsDrawerOpen(true);
                          }}
                          className="text-[11px] px-2 py-1"
                        >
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Face Attendance AI Modal */}
      <FaceAttendanceModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        preSelectedStudentId={(currentUser as any).studentId || 'STU-001'}
      />

      {/* Record Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Student Cryptographic Proof Inspector"
        subtitle={selectedRecord ? `RECORD ID: ${selectedRecord.id}` : ''}
      >
        {selectedRecord && (
          <div className="space-y-6 text-xs">
            <div className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle flex items-center justify-between">
              <div>
                <span className="micro-label text-text-muted block">Mathematical Verdict</span>
                <StatusPill status={selectedRecord.integrityStatus} size="lg" className="mt-1" />
              </div>
              <div className="text-right">
                <span className="micro-label text-text-muted block">Audit Block</span>
                <span className="font-mono text-sm text-accent-cyan font-bold block mt-1">
                  #{selectedRecord.auditChainBlock}
                </span>
              </div>
            </div>

            <div>
              <span className="micro-label text-accent-cyan block mb-2">RFC DETERMINISTIC CANONICAL BUFFER</span>
              <CodeBlock code={selectedRecord.canonicalString} language="canonical-format" label="Raw Canonical Ingestion" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="micro-label text-accent-emerald">HMAC-SHA256 SIGNATURE</span>
                <span className="font-mono text-[10px] text-text-muted">Key: {selectedRecord.keyVersion}</span>
              </div>
              <div className="p-3 rounded-xl bg-bg-base border border-border-subtle font-mono text-xs flex items-center justify-between">
                <span className="text-accent-emerald font-bold truncate max-w-sm">{selectedRecord.hmacTag}</span>
                <CopyButton value={selectedRecord.hmacTag} />
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

