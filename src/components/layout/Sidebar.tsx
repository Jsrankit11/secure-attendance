import React, { useState } from 'react';
import {
  Cpu,
  Shield,
  MessageSquare,
  Terminal,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Users,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, currentUser, setUserRole } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const isStudent = currentUser.role === 'Student';

  const navItems = isStudent
    ? [
        { id: 'student-dashboard', num: '01', label: 'Student Vault', icon: <UserCheck className="w-5 h-5 text-accent-emerald" /> },
        { id: 'history', num: '02', label: 'My Attendance', icon: <FileSpreadsheet className="w-5 h-5 text-accent-cyan" /> },
        { id: 'attendance', num: '03', label: 'Face Check-In', icon: <Shield className="w-5 h-5 text-accent-emerald" /> },
        { id: 'audit', num: '04', label: 'Audit Proofs', icon: <FileText className="w-5 h-5" /> },
        { id: 'settings', num: '05', label: 'Profile & Keys', icon: <Settings className="w-5 h-5" /> },
      ]
    : [
        { id: 'dashboard', num: '01', label: 'Instructor Dashboard', icon: <Cpu className="w-5 h-5" /> },
        { id: 'attendance', num: '02', label: 'Face Attendance', icon: <Shield className="w-5 h-5 text-accent-emerald" /> },
        { id: 'students', num: '03', label: 'Student Management', icon: <Users className="w-5 h-5 text-accent-cyan" /> },
        { id: 'history', num: '04', label: 'Attendance Ledger', icon: <FileSpreadsheet className="w-5 h-5 text-warning" /> },
        { id: 'student-dashboard', num: '05', label: 'Student Preview', icon: <UserCheck className="w-5 h-5" /> },
        { id: 'lab', num: '06', label: 'Security & Tamper Lab', icon: <Terminal className="w-5 h-5 text-danger" /> },
        { id: 'audit', num: '07', label: 'Audit Logs', icon: <FileText className="w-5 h-5" /> },
        { id: 'settings', num: '08', label: 'Profile & Settings', icon: <Settings className="w-5 h-5" /> },
      ];

  return (
    <aside
      className={`relative z-30 flex flex-col justify-between border-r border-border-subtle bg-bg-surface/90 backdrop-blur-2xl transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border-subtle">
          <div
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-accent-emerald/15 border border-accent-emerald/50 flex items-center justify-center text-accent-emerald shadow-[0_0_15px_rgba(0,245,160,0.25)] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-heading font-extrabold text-base tracking-tight text-text-primary block leading-none">
                  CyberShield<span className="text-accent-emerald">.AI</span>
                </span>
                <span className="text-[10px] font-mono text-accent-cyan tracking-wider uppercase block mt-1">
                  CRYPTO SUITE
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5">
          <div className={`px-3 py-1.5 micro-label text-text-muted ${collapsed ? 'text-center text-[9px]' : ''}`}>
            {collapsed ? 'MENU' : 'AUTHENTICATED MODULES'}
          </div>

          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                data-cursor="OPEN"
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-heading font-semibold text-sm transition-all text-left relative group ${
                  isActive
                    ? 'bg-accent-emerald/12 text-accent-emerald border border-accent-emerald/30 shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
                }`}
              >
                <div className={`shrink-0 ${isActive ? 'text-accent-emerald' : 'text-text-muted group-hover:text-text-primary'}`}>
                  {item.icon}
                </div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    <span className="font-mono text-[11px] text-text-muted/60 tracking-wider">
                      {item.num}
                    </span>
                  </div>
                )}

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-accent-emerald shadow-[0_0_8px_#00F5A0]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Card & Role Switcher */}
      <div className="p-3 border-t border-border-subtle bg-bg-elevated/30">
        {!collapsed ? (
          <div className="space-y-3">
            {/* Role switch toggle */}
            <div className="flex items-center justify-between p-1 bg-bg-base/70 rounded-lg border border-border-subtle text-xs">
              <button
                onClick={() => setUserRole('Instructor')}
                className={`flex-1 py-1 px-1.5 rounded-md font-mono text-[10px] uppercase font-bold transition-colors ${
                  currentUser.role === 'Instructor'
                    ? 'bg-accent-emerald text-[#08090B]'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Instructor
              </button>
              <button
                onClick={() => setUserRole('Student')}
                className={`flex-1 py-1 px-1.5 rounded-md font-mono text-[10px] uppercase font-bold transition-colors ${
                  currentUser.role === 'Student'
                    ? 'bg-accent-cyan text-[#08090B]'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Student
              </button>
            </div>

            {/* User profile info */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-border-subtle/50">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-accent-emerald/40"
              />
              <div className="flex-1 min-w-0">
                <span className="font-heading font-bold text-xs text-text-primary block truncate">
                  {currentUser.name}
                </span>
                <span className="font-mono text-[10px] text-accent-emerald block truncate">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={() => setCurrentPage('landing')}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-accent-emerald/40"
            />
            <button
              onClick={() => setCurrentPage('landing')}
              className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
