import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  X,
  ArrowRight,
  Clock,
  User,
  Key,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';

export const AttendanceHistoryDetailsModal: React.FC = () => {
  const {
    historyModalRecord,
    setHistoryModalRecord,
    currentUser,
    setInstructorEditModalRecord,
    studentTamperAttempt
  } = useApp();

  if (!historyModalRecord) return null;

  const history = historyModalRecord.history || [];

  const handleOpenInstructorEdit = () => {
    const rec = historyModalRecord;
    setHistoryModalRecord(null);
    setInstructorEditModalRecord(rec);
  };

  const handleSimulateStudentTamper = async () => {
    const targetStatus = historyModalRecord.status === 'Present' ? 'Absent' : 'Present';
    await studentTamperAttempt(historyModalRecord.id, targetStatus);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-left flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle/50 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-2">
                  Attendance Change History & Cryptographic Trail
                </h3>
                <p className="text-xs text-text-muted">
                  Immutable record audit: Every modification, reason & tamper attempt permanently preserved.
                </p>
              </div>
            </div>
            <button
              onClick={() => setHistoryModalRecord(null)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-5 pr-1 font-mono text-xs flex-1">
            {/* Record Overview Banner */}
            <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={historyModalRecord.avatar || '/students/vedika_gupta.png'}
                  alt={historyModalRecord.studentName}
                  className="w-12 h-12 rounded-xl object-cover border border-border-subtle"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    {historyModalRecord.studentName}
                  </h4>
                  <div className="text-[11px] text-text-muted flex items-center gap-2 mt-0.5">
                    <span>{historyModalRecord.studentId}</span>
                    <span>•</span>
                    <span>{historyModalRecord.className}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-text-muted uppercase">Active Status</div>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                      historyModalRecord.status === 'Present'
                        ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
                        : historyModalRecord.status === 'Absent'
                        ? 'bg-danger/20 text-danger border border-danger/30'
                        : 'bg-warning/20 text-warning border border-warning/30'
                    }`}
                  >
                    {historyModalRecord.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-text-muted uppercase">Integrity</div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1 ${
                      historyModalRecord.integrityStatus === 'VERIFIED'
                        ? 'bg-accent-emerald/20 text-accent-emerald'
                        : 'bg-danger/20 text-danger animate-pulse'
                    }`}
                  >
                    {historyModalRecord.integrityStatus === 'VERIFIED' ? '✓ SEALED' : '⚠ TAMPERED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current HMAC & Canonical Representation */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-border-subtle/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                  <Key className="w-3 h-3 text-accent-cyan" /> Current Canonical String:
                </span>
                <CopyButton value={historyModalRecord.canonicalString} />
              </div>
              <p className="text-[11px] text-accent-cyan/90 break-all select-all font-mono bg-bg-base/80 p-2 rounded-lg border border-border-subtle/40">
                {historyModalRecord.canonicalString}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-accent-emerald" /> Stored HMAC-SHA256 Signature:
                </span>
                <CopyButton value={historyModalRecord.hmacTag} />
              </div>
              <p className="text-[11px] text-accent-emerald break-all select-all font-mono bg-bg-base/80 p-2 rounded-lg border border-border-subtle/40">
                {historyModalRecord.hmacTag}
              </p>
            </div>

            {/* AES-256-GCM Confidential Note if present */}
            {historyModalRecord.decryptedNotes && (
              <div className="p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-[11px] space-y-1">
                <div className="font-bold text-accent-cyan flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Decrypted Private Note (AES-256-GCM Authenticated):
                </div>
                <p className="text-text-primary">
                  {historyModalRecord.decryptedNotes}
                </p>
              </div>
            )}

            {/* Tamper Warning Banner if tampered */}
            {historyModalRecord.isTampered && (
              <div className="p-3.5 rounded-xl bg-danger/15 border border-danger/40 text-danger text-xs space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                  CRITICAL TAMPER WARNING ACTIVE
                </div>
                <p className="text-[11px] text-danger/90">
                  {historyModalRecord.tamperReason || 'Stored database content does not match cryptographic HMAC seal!'}
                </p>
              </div>
            )}

            {/* Change History Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-heading font-bold text-xs uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-accent-emerald" />
                  Chronological Modification & Tamper Audit Log ({history.length + 1} Events)
                </h5>
                <span className="text-[10px] text-accent-cyan">Strict Access Control Active</span>
              </div>

              <div className="space-y-3">
                {/* Dynamically recorded modifications */}
                {history.map((h, idx) => (
                  <div
                    key={h.id || idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      h.isTamperAttempt
                        ? 'bg-danger/10 border-danger/40 text-danger'
                        : 'bg-bg-elevated border-accent-emerald/30 text-text-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {h.isTamperAttempt ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger/20 text-danger border border-danger/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> TAMPER ATTEMPT BLOCKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> INSTRUCTOR OVERRIDE
                          </span>
                        )}
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <User className="w-3 h-3" /> {h.changedBy} ({h.role})
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(h.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-text-muted">Status Transition:</span>
                      <span className="text-text-muted line-through">{h.previousStatus}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-accent-cyan" />
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          h.newStatus === 'Present'
                            ? 'bg-accent-emerald/20 text-accent-emerald'
                            : 'bg-danger/20 text-danger'
                        }`}
                      >
                        {h.newStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-text-primary/90 bg-bg-base/60 p-2 rounded-lg border border-border-subtle/30">
                      <span className="text-text-muted font-bold">Reason / Forensic Detail: </span>
                      {h.reason}
                    </div>

                    <div className="text-[10px] text-text-muted flex items-center justify-between pt-1 border-t border-border-subtle/20">
                      <span>Cryptographic Seal: {h.newHmac.slice(0, 24)}...</span>
                      {h.auditBlock && <span>Audit Block #{h.auditBlock}</span>}
                    </div>
                  </div>
                ))}

                {/* Initial Creation Block */}
                <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border-subtle/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bg-base text-text-muted border border-border-subtle">
                      ORIGINAL CHECK-IN CREATED
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {historyModalRecord.date} {historyModalRecord.timestamp.slice(11, 19)} UTC
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Ingested via <span className="text-text-primary font-bold">{historyModalRecord.verificationMethod || 'FACE_AI'}</span>. Initial HMAC-SHA256 signature generated and verified at Genesis Block #{historyModalRecord.auditChainBlock}.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle/50 mt-4 shrink-0">
            {currentUser.role === 'Instructor' || currentUser.role === 'Security Admin' ? (
              <Button
                variant="primary"
                onClick={handleOpenInstructorEdit}
                className="w-full sm:w-auto text-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Authorized Instructor Edit / Override
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleSimulateStudentTamper}
                className="w-full sm:w-auto text-xs border-danger/40 text-danger hover:bg-danger/10 flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Simulate Student Tamper (Self-Mark {historyModalRecord.status === 'Present' ? 'Absent' : 'Present'})
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => setHistoryModalRecord(null)}
              className="w-full sm:w-auto text-xs"
            >
              Close History View
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
