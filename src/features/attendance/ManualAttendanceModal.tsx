import React, { useState, useRef } from 'react';
import {
  UserCheck,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Calendar,
  Layers,
  Sparkles,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useApp } from '../../context/AppContext';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudentId?: string;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  isOpen,
  onClose,
  preSelectedStudentId,
}) => {
  const { markStudentAttendance, attendanceRecords, studentAccounts, updateStudentPhoto } = useApp();
  const { success, error } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<'roster' | 'custom'>('roster');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preSelectedStudentId || studentAccounts[0]?.studentId || 'STU-001'
  );
  const [customName, setCustomName] = useState('');
  const [customId, setCustomId] = useState('');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<'Present' | 'Absent' | 'Late'>('Present');
  const [className, setClassName] = useState('CS 401: Cryptographic Engineering');
  const [remarks, setRemarks] = useState('');
  const [searchRoster, setSearchRoster] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAccount = studentAccounts.find((s) => s.studentId === selectedStudentId);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('File Too Large', 'Please upload a photo under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomPhoto(base64);
      if (mode === 'roster' && selectedAccount) {
        updateStudentPhoto(selectedAccount.studentId, base64);
        success('Student Photo Updated', `Photo updated for ${selectedAccount.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'roster') {
        if (!selectedAccount) throw new Error('Please select a student');
        const photo = customPhoto || selectedAccount.avatar;
        await markStudentAttendance(selectedAccount.studentId, status, {
          studentName: selectedAccount.name,
          avatar: photo,
          className,
          method: 'MANUAL'
        });

        success(
          'Attendance Saved & Cryptographically Sealed! ✅',
          `${selectedAccount.name} (${selectedAccount.studentId}) marked as ${status}.`
        );
      } else {
        if (!customName.trim() || !customId.trim()) {
          throw new Error('Please enter student name and ID');
        }
        const photo = customPhoto || `/students/ankit_chaudhary.png`;
        await markStudentAttendance(customId.trim(), status, {
          studentName: customName.trim(),
          avatar: photo,
          className,
          method: 'MANUAL'
        });

        success(
          'New Student Added & Attendance Sealed! ✅',
          `${customName} (${customId}) added to ledger with status: ${status}.`
        );
      }

      onClose();
    } catch (err: any) {
      error('Failed to Record Attendance', err.message || 'Please check your inputs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRoster = studentAccounts.filter(
    (s) =>
      s.name.toLowerCase().includes(searchRoster.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchRoster.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="✍️ Manual Attendance / Upload Photo"
      subtitle="Mark attendance or upload student photo with automated HMAC-SHA256 signature sealing."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Mode Toggle: Existing Roster vs Add Custom */}
        <div className="flex p-1 rounded-xl bg-bg-base/80 border border-border-subtle">
          <button
            type="button"
            onClick={() => setMode('roster')}
            className={`flex-1 py-2 text-xs font-heading font-semibold rounded-lg transition-all ${
              mode === 'roster'
                ? 'bg-accent-emerald text-black shadow-md font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Select Enrolled Student ({studentAccounts.length})
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 text-xs font-heading font-semibold rounded-lg transition-all ${
              mode === 'custom'
                ? 'bg-accent-emerald text-black shadow-md font-bold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            + Add New / Custom Student
          </button>
        </div>

        {mode === 'roster' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="micro-label text-text-muted">Choose Student</label>
              <span className="text-[10px] font-mono text-accent-cyan font-bold">{studentAccounts.length} Verified Students</span>
            </div>

            {/* Select Dropdown */}
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setCustomPhoto(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary focus:border-accent-emerald focus:outline-none font-medium"
            >
              {filteredRoster.map((acc, index) => {
                const existing = attendanceRecords.find((r) => r.studentId === acc.studentId);
                return (
                  <option key={acc.id} value={acc.studentId}>
                    {index + 1}. {acc.name} ({acc.studentId}) — [Current: {existing?.status || 'None'}]
                  </option>
                );
              })}
            </select>

            {/* Selected preview card with photo upload button */}
            {selectedAccount && (
              <div className="p-3.5 rounded-xl bg-bg-base/60 border border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={customPhoto || selectedAccount.avatar}
                    alt={selectedAccount.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-accent-emerald/40 shadow-sm"
                  />
                  <div className="overflow-hidden">
                    <span className="font-heading font-bold text-xs text-text-primary block">
                      {selectedAccount.name}
                    </span>
                    <span className="font-mono text-[10px] text-accent-cyan font-bold block">
                      {selectedAccount.studentId} • {selectedAccount.email}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-3.5 h-3.5 text-accent-cyan" />}
                >
                  Upload Photo
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="micro-label text-text-muted block mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sen"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required={mode === 'custom'}
                className="w-full px-3.5 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary focus:border-accent-emerald focus:outline-none"
              />
            </div>

            <div>
              <label className="micro-label text-text-muted block mb-1">Student ID / Roll No</label>
              <input
                type="text"
                placeholder="e.g. STU-006"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                required={mode === 'custom'}
                className="w-full px-3.5 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary focus:border-accent-emerald focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="micro-label text-text-muted block mb-1">Student Photo</label>
              <div className="flex items-center gap-3">
                {customPhoto && (
                  <img
                    src={customPhoto}
                    alt="Custom preview"
                    className="w-12 h-12 rounded-xl object-cover border border-accent-emerald"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-3.5 h-3.5 text-accent-cyan" />}
                >
                  {customPhoto ? 'Change Photo' : 'Upload Student Photo'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Selection: Present / Absent / Late */}
        <div>
          <label className="micro-label text-text-muted block mb-2">Attendance Status</label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setStatus('Present')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                status === 'Present'
                  ? 'border-accent-emerald bg-accent-emerald/15 text-accent-emerald font-bold shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                  : 'border-border-subtle bg-bg-base/60 text-text-muted hover:border-border-hover'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
              <span className="text-xs font-heading font-bold">Present</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('Late')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                status === 'Late'
                  ? 'border-warning bg-warning/15 text-warning font-bold shadow-[0_0_15px_rgba(245,166,35,0.15)]'
                  : 'border-border-subtle bg-bg-base/60 text-text-muted hover:border-border-hover'
              }`}
            >
              <Clock className="w-5 h-5 text-warning" />
              <span className="text-xs font-heading font-bold">Late</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('Absent')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                status === 'Absent'
                  ? 'border-danger bg-danger/15 text-danger font-bold shadow-[0_0_15px_rgba(255,75,75,0.15)]'
                  : 'border-border-subtle bg-bg-base/60 text-text-muted hover:border-border-hover'
              }`}
            >
              <XCircle className="w-5 h-5 text-danger" />
              <span className="text-xs font-heading font-bold">Absent</span>
            </button>
          </div>
        </div>

        {/* Class Selection */}
        <div>
          <label className="micro-label text-text-muted block mb-1">Class / Lab Subject</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary focus:border-accent-emerald focus:outline-none"
          />
        </div>

        {/* Cryptographic notice */}
        <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 font-mono text-[11px] text-text-muted flex items-center justify-between">
          <span className="text-accent-cyan font-bold">🔐 Real-time HMAC-SHA256:</span>
          <span>Automatic canonical hash generated</span>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isSubmitting}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Save Attendance
          </Button>
        </div>
      </form>
    </Modal>
  );
};
