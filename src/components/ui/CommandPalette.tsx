import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, MessageSquare, Terminal, FileText, Settings, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const { cmdKOpen, setCmdKOpen, setCurrentPage, tamperAttendanceRecord, attendanceRecords } = useApp();
  const [query, setQuery] = useState('');

  if (!cmdKOpen) return null;

  const quickNav = [
    { id: 'dashboard', label: '01 Overview & Threat Metrics', page: 'dashboard', icon: <Cpu className="w-4 h-4 text-accent-emerald" /> },
    { id: 'attendance', label: '02 SecureAttendance & HMAC Records', page: 'attendance', icon: <Shield className="w-4 h-4 text-accent-cyan" /> },
    { id: 'messages', label: '03 SecureMessage E2E Directory', page: 'messages', icon: <MessageSquare className="w-4 h-4 text-accent-emerald" /> },
    { id: 'lab', label: '04 Interactive Security Lab (3 Demos)', page: 'lab', icon: <Terminal className="w-4 h-4 text-warning" /> },
    { id: 'audit', label: '05 Cryptographic Audit & Hash Chain', page: 'audit', icon: <FileText className="w-4 h-4 text-accent-cyan" /> },
    { id: 'settings', label: '06 Settings, MFA & System Docs', page: 'settings', icon: <Settings className="w-4 h-4 text-text-muted" /> },
    { id: 'landing', label: 'Home / Landing Page', page: 'landing', icon: <Shield className="w-4 h-4 text-text-muted" /> },
  ];

  const filteredNav = quickNav.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectPage = (page: string) => {
    setCurrentPage(page);
    setCmdKOpen(false);
  };

  const handleSimulateTamper = () => {
    if (attendanceRecords.length > 0) {
      tamperAttendanceRecord(attendanceRecords[0].id, 'Absent');
      setCurrentPage('attendance');
      setCmdKOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setCmdKOpen(false)}
        className="fixed inset-0 bg-[#08090B]/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="relative w-full max-w-xl rounded-2xl border border-border-subtle bg-bg-surface/98 backdrop-blur-2xl shadow-2xl overflow-hidden z-10"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
          <Search className="w-5 h-5 text-accent-emerald shrink-0" />
          <input
            type="text"
            placeholder="Type a command or jump to page... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded border border-border-subtle bg-bg-elevated text-text-muted">
            ESC
          </kbd>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-mono text-text-muted uppercase tracking-wider">
            Navigation Shortcuts
          </div>

          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectPage(item.page)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-white/[0.06] hover:text-accent-emerald transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-heading font-medium">{item.label}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}

          <div className="px-2 pt-3 pb-1.5 text-[10px] font-mono text-danger uppercase tracking-wider">
            Diagnostic & Simulation Actions
          </div>

          <button
            onClick={handleSimulateTamper}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/10 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-heading font-medium">Trigger Live Tamper on Record #001</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-danger/20">TEST LAB</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
