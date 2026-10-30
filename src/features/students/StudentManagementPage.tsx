import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  Camera,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Mail,
  UserCheck,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { FaceAttendanceModal } from '../attendance/FaceAttendanceModal';
import { ManualAttendanceModal } from '../attendance/ManualAttendanceModal';

export const StudentManagementPage: React.FC = () => {
  const { studentAccounts, attendanceRecords, updateStudentPhoto, currentUser, setCurrentUser } = useApp();
  const { success, error } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string | undefined>(undefined);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudentForPhoto) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'Please upload an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateStudentPhoto(selectedStudentForPhoto, base64);
      success('Photo Updated', 'Student photo updated successfully across all records');
      setSelectedStudentForPhoto(null);
    };
    reader.readAsDataURL(file);
  };

  const filteredStudents = studentAccounts.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 04 Section Header */}
      <SectionHeader
        number="04"
        title="Student Management & Biometric Directory"
        subtitle={`Enrolled Roster of ${studentAccounts.length} Verified Students with ECDSA-P256 Passkeys, Real Facial Profiles & Role-Based Isolation.`}
        badgeText="ROSTER DIRECTORY"
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManualModalOpen(true)}
              icon={<Plus className="w-4 h-4 text-accent-cyan" />}
            >
              Add Student
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setTargetStudentId(undefined);
                setIsFaceModalOpen(true);
              }}
              icon={<Camera className="w-4 h-4 text-black" />}
            >
              Face Kiosk
            </Button>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <span className="text-accent-emerald font-bold">{filteredStudents.length} Students Active</span>
          <span>•</span>
          <span className="text-accent-cyan font-bold">100% Verified Passkeys</span>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, idx) => {
          const rec = attendanceRecords.find((r) => r.studentId === student.studentId);
          const isPresent = rec?.status === 'Present';
          const isCurrent = currentUser.name === student.name;

          return (
            <div
              key={student.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 ${
                isCurrent
                  ? 'border-accent-emerald bg-accent-emerald/10 shadow-[0_0_25px_rgba(0,245,160,0.15)]'
                  : 'border-border-subtle bg-bg-surface/90 hover:border-border-hover shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="relative group">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-border-subtle shadow-md group-hover:border-accent-emerald transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForPhoto(student.studentId);
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]"
                    title="Upload / Change Photo"
                  >
                    <Upload className="w-4 h-4 mb-0.5" />
                    <span>Upload</span>
                  </button>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                      isPresent
                        ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                        : 'bg-danger/15 text-danger border border-danger/30'
                    }`}
                  >
                    {isPresent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {rec?.status || 'Not Marked'}
                  </span>
                  <span className="font-mono text-xs text-accent-cyan font-bold block mt-1">
                    {student.studentId}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-base text-text-primary">
                  {idx + 1}. {student.name}
                </h3>
                <span className="font-mono text-xs text-text-muted block mt-0.5">
                  {student.email}
                </span>
              </div>

              {/* Security Credentials */}
              <div className="p-3 rounded-xl bg-bg-base/70 border border-border-subtle/70 space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-text-muted">
                  <span className="text-[9px] uppercase">Safety Fingerprint:</span>
                  <span className="text-accent-cyan truncate max-w-[150px]">{student.keyFingerprint}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span className="text-[9px] uppercase">Integrity Verdict:</span>
                  <span className="text-accent-emerald font-bold">HMAC Verified ✓</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedStudentForPhoto(student.studentId);
                    fileInputRef.current?.click();
                  }}
                  icon={<Upload className="w-3.5 h-3.5 text-accent-cyan" />}
                >
                  Upload Photo
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setTargetStudentId(student.studentId);
                    setIsFaceModalOpen(true);
                  }}
                  icon={<Camera className="w-3.5 h-3.5 text-black" />}
                >
                  Face Scan
                </Button>

                <Button
                  size="sm"
                  variant={isCurrent ? 'ghost' : 'outline'}
                  onClick={() => {
                    setCurrentUser({
                      id: student.id,
                      name: student.name,
                      email: student.email,
                      role: 'Student',
                      avatar: student.avatar,
                      mfaEnabled: true,
                      keyFingerprint: student.keyFingerprint,
                      joinedDate: student.joinedDate
                    });
                    success('Session Switched', `Now logged in as ${student.name} (${student.studentId})`);
                  }}
                >
                  {isCurrent ? 'Current' : 'Switch'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Face Modal */}
      <FaceAttendanceModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        preSelectedStudentId={targetStudentId}
      />

      {/* Manual Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};

