import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  ShieldAlert,
  Menu,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Camera,
  AlertTriangle,
  Trash2,
  CheckCheck,
  ArrowRight,
  Database,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TopHeaderProps {
  onMobileMenuToggle?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMobileMenuToggle }) => {
  const {
    theme,
    toggleTheme,
    setCmdKOpen,
    currentUser,
    setCurrentPage,
    attendanceRecords,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setActiveTamperAlert,
    setHistoryModalRecord,
    reComputeAndFixRecord
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'tamper'>('all');

  const tamperedRecords = attendanceRecords.filter((r) => r.isTampered);
  const tamperedCount = tamperedRecords.length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'tamper') return n.type === 'tamper' || n.severity === 'CRITICAL';
    return true;
  });

  const handleInspectTamper = (n: any) => {
    const studentId = n.studentId;
    const targetRecord = attendanceRecords.find((r) => r.studentId === studentId || r.id === n.recordId);
    if (targetRecord) {
      setActiveTamperAlert({
        studentName: targetRecord.studentName,
        studentId: targetRecord.studentId,
        attemptedBy: 'Unauthorized Tamper Script / Direct Mutation',
        attemptedStatus: targetRecord.status,
        previousStatus: targetRecord.status === 'Present' ? 'Absent' : 'Present',
        reason: targetRecord.tamperReason || 'Cryptographic HMAC signature mismatch detected.',
        auditBlock: targetRecord.auditChainBlock,
        timestamp: targetRecord.timestamp || new Date().toISOString(),
        storedHmac: targetRecord.hmacTag,
        computedHmac: 'MISMATCH_UNSIGNED'
      });
    }
    markNotificationAsRead(n.id);
    setShowNotifications(false);
  };

  const handleQuickFix = async (recordId?: string, notifId?: string) => {
    if (recordId) {
      await reComputeAndFixRecord(recordId);
    }
    if (notifId) {
      markNotificationAsRead(notifId);
    }
  };

  return (
    <header className="h-16 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
      {/* Left: Mobile hamburger & Global Search Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Toggle mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Cmd+K Search trigger */}
        <button
          onClick={() => setCmdKOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-border-subtle bg-bg-base/70 hover:border-accent-emerald/40 text-text-muted hover:text-text-primary transition-all text-xs"
        >
          <Search className="w-4 h-4 text-accent-emerald" />
          <span className="hidden sm:inline">Search verification, hash records, keys...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated border border-border-subtle text-text-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Center: Live Cryptographic Verification Status Pill */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-bg-base/80 border border-border-subtle text-xs font-mono">
        {tamperedCount > 0 ? (
          <div
            onClick={() => setCurrentPage('attendance')}
            className="flex items-center gap-1.5 text-danger font-semibold cursor-pointer hover:underline"
            title="Click to view tampered attendance records"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse text-danger" />
            <span>{tamperedCount} RECORD TAMPER DETECTED (HMAC MISMATCH)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-accent-emerald font-semibold">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
            <span>CRYPTOGRAPHIC ENGINE: ALL RECORDS SEALED</span>
          </div>
        )}
      </div>

      {/* Right: Actions (Face Attendance, Security Lab, Theme Toggle, Notifications, User) */}
      <div className="flex items-center gap-2.5">
        {/* Quick Face Attendance Shortcut button */}
        <button
          onClick={() => setCurrentPage('attendance')}
          data-cursor="CAMERA"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-heading text-xs font-bold text-accent-emerald bg-accent-emerald/15 border border-accent-emerald/40 hover:bg-accent-emerald/25 transition-all shadow-[0_0_12px_rgba(0,245,160,0.15)]"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Face Attendance</span>
        </button>

        {/* Interactive Lab Shortcut button */}
        <button
          onClick={() => setCurrentPage('lab')}
          data-cursor="TEST"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold text-warning bg-warning/10 border border-warning/30 hover:bg-warning/20 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SECURITY LAB</span>
        </button>

        {/* Theme Toggle Button (Light & Dark with High Contrast) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-accent-cyan" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white font-mono text-[10px] font-black flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.5)]">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-[420px] rounded-2xl border border-border-subtle bg-bg-surface/98 backdrop-blur-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">
                    Security Alerts & Tamper Center
                  </span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-danger/20 text-danger border border-danger/30">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllNotificationsAsRead}
                    title="Mark all as read"
                    className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors text-[11px] flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-accent-emerald" />
                    <span className="hidden sm:inline">Read all</span>
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    title="Clear notifications"
                    className="p-1 rounded text-text-muted hover:text-danger hover:bg-bg-elevated transition-colors text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 mb-3 p-1 rounded-xl bg-bg-elevated border border-border-subtle text-xs">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`flex-1 py-1 px-2.5 rounded-lg font-heading font-semibold transition-all text-center ${
                    notifFilter === 'all'
                      ? 'bg-bg-surface text-text-primary shadow-sm font-bold border border-border-subtle'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('tamper')}
                  className={`flex-1 py-1 px-2.5 rounded-lg font-heading font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                    notifFilter === 'tamper'
                      ? 'bg-danger/20 text-danger font-bold border border-danger/40'
                      : 'text-text-muted hover:text-danger'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Tamper Alerts ({notifications.filter((n) => n.type === 'tamper' || n.severity === 'CRITICAL').length})</span>
                </button>
              </div>

              {/* Notification List */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-text-muted space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-accent-emerald mx-auto opacity-70" />
                    <p className="text-xs">No active alerts. All cryptographic signatures intact!</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    const isTamper = n.type === 'tamper' || n.severity === 'CRITICAL';
                    return (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-3 rounded-xl border transition-all text-xs relative ${
                          isTamper
                            ? 'bg-danger/10 border-danger/40 hover:border-danger'
                            : 'bg-bg-elevated/70 border-border-subtle hover:border-accent-emerald/40'
                        } ${!n.read ? 'ring-1 ring-accent-cyan/30' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {isTamper ? (
                              <ShieldAlert className="w-4 h-4 text-danger shrink-0 animate-pulse" />
                            ) : n.type === 'attendance' ? (
                              <Camera className="w-4 h-4 text-accent-emerald shrink-0" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-accent-cyan shrink-0" />
                            )}
                            <span className={`font-heading font-bold ${isTamper ? 'text-danger' : 'text-text-primary'}`}>
                              {n.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-accent-cyan shrink-0" />
                            )}
                            <span className="text-[10px] font-mono text-text-muted shrink-0">
                              {n.timestamp}
                            </span>
                          </div>
                        </div>

                        <p className="text-text-muted text-[11px] leading-relaxed mb-2 pl-6">
                          {n.message}
                        </p>

                        {/* Interactive Tamper Action Buttons */}
                        {isTamper && (
                          <div className="flex items-center gap-2 pl-6 pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInspectTamper(n);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-danger/20 hover:bg-danger/30 text-danger border border-danger/40 text-[10px] font-heading font-bold flex items-center gap-1 transition-colors"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>Inspect Tamper</span>
                            </button>

                            {n.recordId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickFix(n.recordId, n.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-accent-emerald/20 hover:bg-accent-emerald/30 text-accent-emerald border border-accent-emerald/40 text-[10px] font-heading font-bold flex items-center gap-1 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Re-Seal HMAC</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar */}
        <div
          onClick={() => setCurrentPage('settings')}
          className="flex items-center gap-2 pl-2 cursor-pointer group"
          title="Profile & Settings"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-accent-emerald/50 group-hover:ring-2 group-hover:ring-accent-emerald/40 transition-all"
          />
        </div>
      </div>
    </header>
  );
};
