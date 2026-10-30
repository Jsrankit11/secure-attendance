import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Lock, ArrowRight, XCircle, Database, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export const TamperAlertModal: React.FC = () => {
  const { activeTamperAlert, setActiveTamperAlert, setCurrentPage, setHistoryModalRecord, attendanceRecords } = useApp();

  if (!activeTamperAlert) return null;

  const handleGoToAudit = () => {
    setActiveTamperAlert(null);
    setCurrentPage('audit');
  };

  const handleInspectHistory = () => {
    const rec = attendanceRecords.find(r => r.studentId === activeTamperAlert.studentId);
    if (rec) {
      setHistoryModalRecord(rec);
    }
    setActiveTamperAlert(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-bg-surface border-2 border-danger/80 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(255,59,48,0.25)] overflow-hidden text-left"
        >
          {/* Pulsing warning ambience bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-danger via-warning to-danger animate-pulse" />

          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 rounded-xl bg-danger/20 border border-danger/40 text-danger shrink-0 animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-danger/20 text-danger border border-danger/40">
                  CRITICAL SECURITY EVENT
                </span>
                <span className="text-xs text-text-muted font-mono">
                  {new Date(activeTamperAlert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl font-heading font-black text-text-primary flex items-center gap-2">
                Unauthorized Attendance Tampering Detected!
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Cryptographic HMAC integrity failure: An unauthorized modification attempt was blocked.
              </p>
            </div>
          </div>

          {/* Tamper Incident Breakdown Card */}
          <div className="bg-bg-elevated border border-danger/30 rounded-xl p-4 font-mono text-xs space-y-3 mb-5">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/40">
              <span className="text-text-muted">Target Student:</span>
              <span className="font-bold text-text-primary">
                {activeTamperAlert.studentName} ({activeTamperAlert.studentId})
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/40">
              <span className="text-text-muted">Attempted Status:</span>
              <div className="flex items-center gap-2">
                <span className="text-text-muted line-through">{activeTamperAlert.previousStatus}</span>
                <ArrowRight className="w-3 h-3 text-danger" />
                <span className="px-2 py-0.5 rounded bg-danger/20 text-danger font-bold">
                  {activeTamperAlert.attemptedStatus} (BLOCKED)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/40">
              <span className="text-text-muted">Detected Actor / Origin:</span>
              <span className="text-warning font-semibold">{activeTamperAlert.attemptedBy}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/40">
              <span className="text-text-muted">Enforcement Action:</span>
              <span className="text-danger font-black flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> REJECTED & AUDIT-LOCKED
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-muted">Audit Block Chain:</span>
              <span className="text-accent-cyan font-bold">
                Block #{activeTamperAlert.auditBlock || 1055} (SHA-256 Linked)
              </span>
            </div>
          </div>

          {/* Forensic Narrative Note */}
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-xs text-danger/90 space-y-1 mb-6">
            <div className="font-bold flex items-center gap-1.5 text-danger">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Security Rule Violation:
            </div>
            <p className="leading-relaxed">
              {activeTamperAlert.reason}
            </p>
            <p className="text-[11px] text-text-muted pt-1">
              • Only authenticated Instructors with authorized keys can sign attendance records.
              <br />
              • This incident has been permanently written to the immutable cryptographic audit chain.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleInspectHistory}
              className="flex-1 flex items-center justify-center gap-2 border-border-subtle text-xs"
            >
              <Database className="w-3.5 h-3.5 text-accent-cyan" />
              View Student Change History
            </Button>
            <Button
              variant="primary"
              onClick={handleGoToAudit}
              className="flex-1 flex items-center justify-center gap-2 text-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              Inspect Audit Block Chain
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTamperAlert(null)}
              className="sm:w-auto text-xs"
            >
              Acknowledge Alert
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

