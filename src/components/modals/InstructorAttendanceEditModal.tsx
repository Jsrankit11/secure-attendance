import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, X, CheckCircle, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export const InstructorAttendanceEditModal: React.FC = () => {
  const {
    instructorEditModalRecord,
    setInstructorEditModalRecord,
    instructorUpdateAttendance,
    currentUser,
    setHistoryModalRecord
  } = useApp();

  const { success, error } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<'Present' | 'Absent' | 'Late'>('Present');
  const [reasonCategory, setReasonCategory] = useState<string>('Medical Certificate Approved');
  const [customReason, setCustomReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!instructorEditModalRecord) return null;

  const currentStatus = instructorEditModalRecord.status;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser.role !== 'Instructor' && currentUser.role !== 'Security Admin') {
      error('Access Denied', 'Only authorized Instructors can modify attendance records.');
      return;
    }

    const finalReason = customReason.trim()
      ? `${reasonCategory}: ${customReason.trim()}`
      : reasonCategory;

    setLoading(true);
    try {
      const ok = await instructorUpdateAttendance(
        instructorEditModalRecord.id,
        selectedStatus,
        finalReason,
        notes
      );

      if (ok) {
        success(
          'Attendance Updated & HMAC Sealed',
          `${instructorEditModalRecord.studentName} marked ${selectedStatus}. Reason: "${finalReason}". Saved to audit chain.`
        );
        // Prompt to inspect the history
        const updatedRecord = { ...instructorEditModalRecord, status: selectedStatus };
        setInstructorEditModalRecord(null);
        setHistoryModalRecord(updatedRecord);
      } else {
        error('Update Failed', 'Could not update attendance record.');
      }
    } catch (err: any) {
      error('Update Error', err.message || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-bg-surface border border-accent-emerald/40 rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(0,245,160,0.15)] text-left"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle/50 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
                  Authorized Attendance Override
                </h3>
                <p className="text-xs text-text-muted">
                  Strictly Instructor-Only • Cryptographically Re-Sealed with HMAC-SHA256
                </p>
              </div>
            </div>
            <button
              onClick={() => setInstructorEditModalRecord(null)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4 font-mono text-xs">
            {/* Student Info Card */}
            <div className="p-3.5 rounded-xl bg-bg-elevated border border-border-subtle/60 flex items-center gap-3.5">
              <img
                src={instructorEditModalRecord.avatar || '/students/vedika_gupta.png'}
                alt={instructorEditModalRecord.studentName}
                className="w-12 h-12 rounded-xl object-cover border border-accent-emerald/40"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-text-primary truncate">
                    {instructorEditModalRecord.studentName}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-bg-base text-accent-cyan border border-border-subtle">
                    {instructorEditModalRecord.studentId}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                  <span>Current Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      currentStatus === 'Present'
                        ? 'bg-accent-emerald/20 text-accent-emerald'
                        : currentStatus === 'Absent'
                        ? 'bg-danger/20 text-danger'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {currentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Select New Status */}
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5 font-bold">
                Select New Status:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Present', 'Absent', 'Late'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedStatus === st
                        ? st === 'Present'
                          ? 'bg-accent-emerald/20 border-accent-emerald text-accent-emerald shadow-[0_0_12px_rgba(0,245,160,0.2)]'
                          : st === 'Absent'
                          ? 'bg-danger/20 border-danger text-danger shadow-[0_0_12px_rgba(255,59,48,0.2)]'
                          : 'bg-warning/20 border-warning text-warning shadow-[0_0_12px_rgba(255,204,0,0.2)]'
                        : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-accent-emerald/40'
                    }`}
                  >
                    {selectedStatus === st && <CheckCircle className="w-3.5 h-3.5" />}
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Mandatory Reason for History / Audit Log */}
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1.5 font-bold">
                Mandatory Authorization Reason (Recorded in Audit Chain):
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-xs focus:border-accent-emerald focus:outline-none mb-2"
              >
                <option value="Medical Certificate Approved">Medical Certificate Approved</option>
                <option value="Official Duty (OD) Sanctioned by HOD">Official Duty (OD) Sanctioned by HOD</option>
                <option value="Late Transit / College Bus Delay">Late Transit / College Bus Delay</option>
                <option value="Manual Roll-Call Correction by Instructor">Manual Roll-Call Correction by Instructor</option>
                <option value="Dean Special Academic Permission">Dean Special Academic Permission</option>
                <option value="Other Authorized Reason">Other Authorized Reason</option>
              </select>

              <input
                type="text"
                placeholder="Additional notes / reference no. (optional)..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-xs focus:border-accent-emerald focus:outline-none"
              />
            </div>

            {/* AES-256-GCM Private Medical Notes */}
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider block mb-1 font-bold flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-accent-cyan" />
                Confidential Note (Encrypted with AES-256-GCM):
              </label>
              <textarea
                rows={2}
                placeholder="Private medical notes or confidential remarks (encrypted at rest)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-xs focus:border-accent-cyan focus:outline-none resize-none"
              />
            </div>

            {/* Cryptographic Assurance Notice */}
            <div className="p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-[11px] text-accent-emerald/90 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Instructor Cryptographic Authority:
              </div>
              <p className="text-text-muted leading-relaxed">
                Changes are signed with HMAC-SHA256 root key under <span className="text-text-primary font-bold">{currentUser.name}</span>. A new block will be appended to the SHA-256 Merkle chain.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInstructorEditModalRecord(null)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="flex-1 text-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirm & Re-Seal with HMAC
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

