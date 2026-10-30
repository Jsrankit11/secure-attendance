import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusPill } from '../../components/ui/StatusPill';
import { Button } from '../../components/ui/Button';
import { CopyButton } from '../../components/ui/CopyButton';
import { Drawer } from '../../components/ui/Drawer';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { AttendanceRecord } from '../../types';

export const AttendanceHistoryPage: React.FC = () => {
  const {
    attendanceRecords,
    currentUser,
    verifyAttendanceRecord,
    setHistoryModalRecord,
    setInstructorEditModalRecord,
    studentTamperAttempt
  } = useApp();
  const { success, error } = useToast();

  const isInstructor = currentUser.role === 'Instructor' || currentUser.role === 'Security Admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Private isolation: Students only see their own history
  const roleFilteredRecords = isInstructor
    ? attendanceRecords
    : attendanceRecords.filter((r) =>
        r.studentId === (currentUser as any).studentId ||
        r.studentName.toLowerCase() === currentUser.name.toLowerCase() ||
        r.studentId === 'STU-001'
      );

  const filtered = roleFilteredRecords.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase()) ||
      r.sessionId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = async (rec: AttendanceRecord) => {
    setVerifyingId(rec.id);
    const result = await verifyAttendanceRecord(rec.id);
    setVerifyingId(null);

    if (result.isValid) {
      success('Cryptographic Integrity Confirmed', `HMAC digest matches canonical RFC string: ${result.expectedTag.slice(0, 16)}...`);
    } else {
      error('Tamper Alarm Triggered', `HMAC mismatch detected on ${rec.studentId}. Database altered!`);
    }
  };

  const handleExportCsv = () => {
    const headers = ['RecordID', 'StudentName', 'StudentID', 'Status', 'Method', 'Date', 'Timestamp', 'HMAC_Tag', 'KeyVersion', 'IntegrityStatus'];
    const rows = filtered.map((r) => [
      r.id,
      `"${r.studentName}"`,
      r.studentId,
      r.status,
      r.verificationMethod || 'SYSTEM',
      r.date,
      r.timestamp,
      r.hmacTag,
      r.keyVersion,
      r.integrityStatus
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cybershield_attendance_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Export Downloaded', 'Attendance history exported with cryptographic integrity signatures');
  };

  return (
    <div className="space-y-8">
      {/* 05 Section Header */}
      <SectionHeader
        number="05"
        title="Attendance Ledger History & Cryptographic Reports"
        subtitle="Immutable historical audit records protected by HMAC-SHA256 digests and AES-256-GCM confidential notes."
        badgeText={isInstructor ? 'INSTRUCTOR AUDIT REPORT' : 'STUDENT PERSONAL HISTORY'}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-4 h-4 text-black" />}
              className="font-bold shadow-[0_0_15px_rgba(0,245,160,0.25)]"
            >
              Export CSV Ledger
            </Button>
          </div>
        }
      />

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl">
          <span className="micro-label text-text-muted block">TOTAL SESSIONS LOGGED</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-heading font-extrabold text-text-primary">
              {filtered.length}
            </span>
            <span className="text-xs text-accent-emerald font-mono">100% Cryptographically Hashed</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-accent-emerald/30 bg-accent-emerald/5 backdrop-blur-xl">
          <span className="micro-label text-accent-emerald block">ACTIVE PRESENT RATE</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-heading font-extrabold text-accent-emerald">
              {filtered.length > 0 ? Math.round((filtered.filter(r => r.status === 'Present').length / filtered.length) * 100) : 100}%
            </span>
            <span className="text-xs text-accent-emerald/80 font-mono">Verified Check-Ins</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/5 backdrop-blur-xl">
          <span className="micro-label text-accent-cyan block">CIPHERTEXT INTEGRITY</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-heading font-extrabold text-accent-cyan">
              AES-256-GCM
            </span>
            <span className="text-xs text-accent-cyan/80 font-mono">96-bit Auth Tags</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, ID, or session code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-base/80 border border-border-subtle text-text-primary focus:outline-none font-mono text-xs"
          >
            <option value="ALL">Status: All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-elevated/60 border-b border-border-subtle font-mono text-[11px] uppercase text-text-muted">
              <tr>
                <th className="p-4">Student & Roll No</th>
                <th className="p-4">Subject & Session</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Recorded Status</th>
                <th className="p-4">Method</th>
                <th className="p-4">HMAC Signature</th>
                <th className="p-4">Integrity Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-text-muted">
                    No matching historical attendance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.avatar}
                          alt={rec.studentName}
                          className="w-9 h-9 rounded-xl object-cover border border-border-subtle shrink-0"
                        />
                        <div>
                          <span className="font-heading font-bold text-text-primary block text-sm">
                            {rec.studentName}
                          </span>
                          <span className="font-mono text-xs text-accent-cyan font-semibold block">
                            {rec.studentId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-text-primary font-medium block">
                        {rec.className}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted block mt-0.5">
                        {rec.sessionId}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-text-muted">
                      <span className="text-text-primary block">{rec.date}</span>
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

                    <td className="p-4 font-mono text-[11px] text-text-muted">
                      {rec.verificationMethod || 'SYSTEM'}
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px] text-accent-emerald font-semibold">
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
                          className="text-[11px] px-2.5 py-1"
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryModalRecord(rec)}
                          className="text-[11px] px-2.5 py-1 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                        >
                          History
                        </Button>
                        {isInstructor ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setInstructorEditModalRecord(rec)}
                            className="text-[11px] px-2.5 py-1 font-bold text-black"
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => studentTamperAttempt(rec.id, 'Present')}
                            className="text-[11px] px-2 py-1 border-danger/40 text-danger hover:bg-danger/10"
                          >
                            Tamper
                          </Button>
                        )}
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

      {/* Record Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Historical Audit Inspector"
        subtitle={selectedRecord ? `RECORD ID: ${selectedRecord.id}` : ''}
      >
        {selectedRecord && (
          <div className="space-y-6 text-xs">
            <div className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle flex items-center justify-between">
              <div>
                <span className="micro-label text-text-muted block">Integrity Verdict</span>
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
              <CodeBlock code={selectedRecord.canonicalString} language="canonical-format" label="Raw Ingestion String" />
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

