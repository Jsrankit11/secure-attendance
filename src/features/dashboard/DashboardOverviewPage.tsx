import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Hash,
  Activity,
  Terminal,
  ArrowRight,
  Database,
  RefreshCw,
  TrendingUp,
  FileText,
  Camera,
  UserCheck
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { TamperBanner } from '../../components/ui/TamperBanner';
import { useApp } from '../../context/AppContext';
import { IntegrityStatus } from '../../types';

export const DashboardOverviewPage: React.FC = () => {
  const { metrics, securityEvents, attendanceRecords, setCurrentPage, tamperAttendanceRecord, reComputeAndFixRecord } = useApp();

  const tamperedRecords = attendanceRecords.filter((r) => r.isTampered);
  const warningRecords = attendanceRecords.filter((r) => r.integrityStatus === 'WARNING');
  const verifiedRecords = attendanceRecords.filter((r) => r.integrityStatus === 'VERIFIED');

  // Overall system security status computed strictly from active record integrity
  let systemStatus: IntegrityStatus = 'VERIFIED';
  if (tamperedRecords.length > 0) {
    systemStatus = 'FAILED';
  } else if (warningRecords.length > 0) {
    systemStatus = 'WARNING';
  }

  const [filterPeriod, setFilterPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  // Area chart coordinate points for mock activity
  const eventPoints = [
    { time: '00:00', count: 12 },
    { time: '04:00', count: 18 },
    { time: '08:00', count: 64 },
    { time: '12:00', count: 92 },
    { time: '16:00', count: 48 },
    { time: '20:00', count: 31 },
    { time: 'Now', count: 75 },
  ];

  return (
    <div className="space-y-8">
      {/* 01 Section Header */}
      <SectionHeader
        number="01"
        title="Security & Verification Overview"
        subtitle="Real-time telemetry on HMAC-SHA256 attendance validations, E2E encrypted transmissions, and cryptographic integrity health."
        badgeText="PRODUCTION VAULT V2.4"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentPage('attendance')}
              icon={<Camera className="w-4 h-4 text-black" />}
              className="font-bold shadow-[0_0_15px_rgba(0,245,160,0.3)] animate-pulse"
            >
              📸 Face Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage('lab')}
              icon={<Terminal className="w-4 h-4 text-warning" />}
            >
              Security Lab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage('attendance')}
              icon={<ShieldCheck className="w-4 h-4 text-accent-emerald" />}
            >
              Roster & Records
            </Button>
          </div>
        }
      />

      {/* Security Status Panel (Page 03 Specification: Three Clear Visual States) */}
      <div className="relative">
        {systemStatus === 'FAILED' ? (
          <div className="rounded-2xl border border-danger/60 bg-danger/10 backdrop-blur-2xl p-6 shadow-[0_0_40px_rgba(255,77,106,0.22)] animate-[shake_0.5s_ease-in-out]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-danger/20 border border-danger/50 text-danger flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="micro-label text-danger font-bold">STATE: FAILED CRYPTOGRAPHIC AUDIT</span>
                    <StatusPill status="FAILED" size="sm" />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white mt-1">
                    {tamperedRecords.length} Unauthorized Database Alteration Detected
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">
                    Stored database records for student <span className="font-mono text-danger font-bold">{tamperedRecords[0]?.studentName} ({tamperedRecords[0]?.studentId})</span> fail 
                    HMAC-SHA256 mathematical equivalence. Immediate re-verification or authorized key-signing required.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage('attendance')}
                >
                  Inspect Violations
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => reComputeAndFixRecord(tamperedRecords[0]?.id)}
                >
                  Authorized Re-sign
                </Button>
              </div>
            </div>
          </div>
        ) : systemStatus === 'WARNING' ? (
          <div className="rounded-2xl border border-warning/60 bg-warning/10 backdrop-blur-2xl p-6 shadow-[0_0_30px_rgba(255,176,32,0.18)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 border border-warning/50 text-warning flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="micro-label text-warning font-bold">STATE: COMPLIANCE WARNING</span>
                    <StatusPill status="WARNING" size="sm" />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white mt-1">
                    Legacy Key Version in Rotation
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">
                    1 record was signed using deprecated key version <span className="font-mono text-warning font-bold">v2.3-legacy</span>. 
                    Cryptographic integrity is intact, but migration to v2.4-prod is advised.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage('attendance')}
              >
                View Legacy Records
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-accent-emerald/40 bg-accent-emerald/10 backdrop-blur-2xl p-6 shadow-[0_0_35px_rgba(0,245,160,0.15)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-emerald/20 border border-accent-emerald/50 text-accent-emerald flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,245,160,0.3)]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="micro-label text-accent-emerald font-bold">STATE: 100% CRYPTOGRAPHICALLY VERIFIED</span>
                    <StatusPill status="VERIFIED" size="sm" pulsing={true} />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white mt-1">
                    All Active Attendance & Messaging Records Validated
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-2xl">
                    Zero tampering detected. HMAC canonical digests match database payload bytes. SHA-256 audit chain 
                    hashes are contiguous through block #{metrics[5]?.value}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => tamperAttendanceRecord(attendanceRecords[0]?.id, 'Absent')}
                  className="text-xs text-danger border-danger/30 hover:border-danger hover:bg-danger/10"
                >
                  Simulate Tamper Attack
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6 Animated MetricCards with DEMO DATA badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((m) => (
          <MetricCard
            key={m.id}
            title={m.title}
            value={m.value}
            suffix={m.suffix}
            change={m.change}
            isPositive={m.isPositive}
            status={m.status}
            description={m.description}
            icon={<Hash className="w-4 h-4" />}
          />
        ))}
      </div>

      {/* Charts & Cryptographic Visualizers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Area/Line Chart of Security Events Over Time */}
        <GlassCard className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle mb-6">
              <div>
                <span className="micro-label text-accent-emerald">TELEMETRY</span>
                <h3 className="text-lg font-heading font-bold text-text-primary">
                  HMAC Ingestion & Verification Volume
                </h3>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-bg-base/70 border border-border-subtle text-xs font-mono">
                {(['24h', '7d', '30d'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setFilterPeriod(period)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      filterPeriod === period
                        ? 'bg-accent-emerald text-[#08090B] font-bold'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Area Line Chart */}
            <div className="h-64 w-full relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00F5A0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                {/* Shaded Area */}
                <path
                  d="M 0,170 Q 100,160 200,80 T 400,30 T 600,60 L 600,200 L 0,200 Z"
                  fill="url(#chartGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 0,170 Q 100,160 200,80 T 400,30 T 600,60"
                  fill="none"
                  stroke="#00F5A0"
                  strokeWidth="3"
                  className="filter drop-shadow-[0_0_8px_rgba(0,245,160,0.5)]"
                />

                {/* Data Points */}
                <circle cx="200" cy="80" r="4" fill="#00F5A0" />
                <circle cx="400" cy="30" r="4" fill="#00F5A0" />
                <circle cx="600" cy="60" r="4" fill="#00F5A0" />
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between text-[10px] font-mono text-text-muted mt-2 pt-2 border-t border-border-subtle">
                {eventPoints.map((pt, i) => (
                  <span key={i}>{pt.time}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted font-mono">
            <span className="flex items-center gap-1.5 text-accent-emerald">
              <TrendingUp className="w-3.5 h-3.5" /> +24% validation throughput vs previous window
            </span>
            <span>Avg Latency: 1.2ms</span>
          </div>
        </GlassCard>

        {/* Right: Donut Chart of VERIFIED / WARNING / FAILED Distribution */}
        <GlassCard className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-border-subtle mb-6">
              <span className="micro-label text-accent-cyan">AUDIT BREAKDOWN</span>
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Record Status Distribution
              </h3>
            </div>

            {/* SVG Donut */}
            <div className="flex items-center justify-center relative py-4">
              <svg width="180" height="180" viewBox="0 0 42 42" className="rotate-[-90deg]">
                {/* Background Ring */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                
                {/* Emerald Slice (Verified 85%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#00F5A0"
                  strokeWidth="4"
                  strokeDasharray="85 15"
                  strokeDashoffset="0"
                  className="filter drop-shadow-[0_0_8px_rgba(0,245,160,0.3)]"
                />

                {/* Warning Slice (10%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#FFB020"
                  strokeWidth="4"
                  strokeDasharray="10 90"
                  strokeDashoffset="-85"
                />

                {/* Danger Slice (5%) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#FF4D6A"
                  strokeWidth="4"
                  strokeDasharray="5 95"
                  strokeDashoffset="-95"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-heading font-black text-white">99.8%</span>
                <span className="text-[10px] font-mono text-accent-emerald uppercase">Valid</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 font-mono text-xs pt-4">
              <div className="flex items-center justify-between p-2 rounded-lg bg-bg-base/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald" />
                  <span className="text-text-primary font-bold">VERIFIED</span>
                </div>
                <span className="text-accent-emerald font-semibold">{verifiedRecords.length} records</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-bg-base/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <span className="text-text-primary font-bold">WARNING</span>
                </div>
                <span className="text-warning font-semibold">{warningRecords.length} records</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-bg-base/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                  <span className="text-text-primary font-bold">FAILED</span>
                </div>
                <span className="text-danger font-semibold">{tamperedRecords.length} records</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage('audit')}
              className="w-full justify-between"
              icon={<FileText className="w-4 h-4 text-accent-cyan" />}
            >
              <span>Explore Merkle Audit Chain</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Recent Security Events & Activity Timeline */}
      <GlassCard>
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
          <div>
            <span className="micro-label text-accent-cyan">AUDIT TRAIL</span>
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Recent Cryptographic Security Events
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('audit')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Full Ledger
          </Button>
        </div>

        <div className="space-y-3">
          {securityEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-xl bg-bg-base/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    evt.severity === 'HIGH'
                      ? 'bg-danger/15 text-danger border border-danger/40'
                      : evt.severity === 'MEDIUM'
                      ? 'bg-warning/15 text-warning border border-warning/40'
                      : 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/40'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-text-primary text-sm">
                      {evt.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        evt.severity === 'HIGH'
                          ? 'bg-danger/20 text-danger'
                          : evt.severity === 'MEDIUM'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-accent-emerald/20 text-accent-emerald'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>

              <div className="font-mono text-[11px] text-text-muted shrink-0 self-end sm:self-center">
                {evt.timestamp}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
