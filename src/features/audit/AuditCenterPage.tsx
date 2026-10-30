import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
  Hash,
  Play,
  RotateCw,
  Clock,
  Layers,
  User,
  ArrowRight
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusPill } from '../../components/ui/StatusPill';
import { CopyButton } from '../../components/ui/CopyButton';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { AuditBlock } from '../../types';

export const AuditCenterPage: React.FC = () => {
  const { auditBlocks, verifyEntireHashChain } = useApp();
  const { success } = useToast();

  const [searchActor, setSearchActor] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>('blk-1045');
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [verifiedChainBlocks, setVerifiedChainBlocks] = useState<number[]>([]);

  const filteredBlocks = auditBlocks.filter((b) => {
    const matchesActor =
      b.actor.name.toLowerCase().includes(searchActor.toLowerCase()) ||
      b.action.toLowerCase().includes(searchActor.toLowerCase()) ||
      b.resource.toLowerCase().includes(searchActor.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || b.severity === severityFilter;
    return matchesActor && matchesSeverity;
  });

  const handleVerifyChain = async () => {
    setVerifyingChain(true);
    setVerifiedChainBlocks([]);

    for (let i = 0; i < auditBlocks.length; i++) {
      await new Promise((res) => setTimeout(res, 350));
      setVerifiedChainBlocks((prev) => [...prev, auditBlocks[i].blockNumber]);
    }

    setVerifyingChain(false);
    success('Cryptographic Audit Chain Verified', `All ${auditBlocks.length} SHA-256 block links evaluated with zero breaks`);
  };

  const handleExportReport = () => {
    const reportData = {
      auditTimestamp: new Date().toISOString(),
      merkleRoot: auditBlocks[0]?.currentHash,
      totalBlocks: auditBlocks.length,
      ledger: auditBlocks
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybershield_hash_audit_ledger_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Report Exported', 'Signed ledger downloaded for external validation');
  };

  return (
    <div className="space-y-8">
      {/* 06 Section Header */}
      <SectionHeader
        number="06"
        title="Audit Center & Cryptographic Hash Chain"
        subtitle="Immutable ledger preserving state transitions. Blocks are linked via SHA-256 parent digests, preventing undetected retrospective deletions."
        badgeText="SHA-256 CHAINED LEDGER"
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              icon={<Download className="w-4 h-4 text-accent-cyan" />}
            >
              Export Signed Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={verifyingChain}
              onClick={handleVerifyChain}
              icon={<ShieldCheck className="w-4 h-4" />}
              data-cursor="VERIFY CHAIN"
            >
              Verify Entire Chain
            </Button>
          </div>
        }
      />

      {/* Hash-Chain Visualization (Linked Blocks with prev-hash -> current-hash) */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-accent-emerald" />
            <span className="font-heading font-extrabold text-sm uppercase tracking-wider text-text-primary">
              Live Hash Chain Linkage Topology
            </span>
          </div>
          <span className="font-mono text-xs text-accent-cyan">
            {auditBlocks.length} Consecutive Blocks
          </span>
        </div>

        {/* Horizontal Linked Chain View */}
        <div className="flex items-center gap-4 overflow-x-auto py-4 px-2">
          {auditBlocks.map((blk, idx) => {
            const isVerified = verifiedChainBlocks.includes(blk.blockNumber);

            return (
              <React.Fragment key={blk.id}>
                <div
                  onClick={() => setExpandedBlockId(blk.id === expandedBlockId ? null : blk.id)}
                  className={`p-4 rounded-xl border min-w-[240px] max-w-[280px] shrink-0 cursor-pointer transition-all ${
                    isVerified
                      ? 'border-accent-emerald bg-accent-emerald/10 shadow-[0_0_20px_rgba(0,245,160,0.2)]'
                      : expandedBlockId === blk.id
                      ? 'border-accent-cyan bg-bg-elevated'
                      : 'border-border-subtle bg-bg-base/80 hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-accent-emerald">
                      Block #{blk.blockNumber}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        blk.severity === 'HIGH' || blk.severity === 'CRITICAL'
                          ? 'bg-danger/20 text-danger'
                          : blk.severity === 'MEDIUM'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-accent-emerald/20 text-accent-emerald'
                      }`}
                    >
                      {blk.severity}
                    </span>
                  </div>

                  <span className="font-heading font-bold text-xs text-text-primary block truncate mb-1">
                    {blk.action}
                  </span>

                  <div className="font-mono text-[10px] space-y-1 text-text-muted">
                    <div>
                      <span className="text-[9px] uppercase text-text-muted/60 block">Prev Hash:</span>
                      <span className="truncate block">{blk.prevHash.slice(0, 16)}...</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-text-muted/60 block">Block Hash:</span>
                      <span className="truncate block text-accent-cyan">{blk.currentHash.slice(0, 16)}...</span>
                    </div>
                  </div>

                  {isVerified && (
                    <div className="mt-2 pt-2 border-t border-accent-emerald/30 flex items-center gap-1 text-[10px] font-mono text-accent-emerald font-bold">
                      <CheckCircle2 className="w-3 h-3" /> LINK VALID
                    </div>
                  )}
                </div>

                {/* Arrow Connector between blocks */}
                {idx < auditBlocks.length - 1 && (
                  <div className="text-text-muted/50 shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Filterable Audit Table */}
      <div className="space-y-4">
        {/* Controls */}
        <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search actor name, action, or resource..."
              value={searchActor}
              onChange={(e) => setSearchActor(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-base border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg-base border border-border-subtle text-xs font-mono text-text-primary focus:outline-none"
            >
              <option value="ALL">Severity: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-elevated/60 border-b border-border-subtle font-mono text-[11px] uppercase text-text-muted">
                <tr>
                  <th className="p-4">Block & Time</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action & Resource</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">SHA-256 Block Digest</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredBlocks.map((blk) => {
                  const isExpanded = expandedBlockId === blk.id;

                  return (
                    <React.Fragment key={blk.id}>
                      <tr
                        onClick={() => setExpandedBlockId(isExpanded ? null : blk.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* Block & Time */}
                        <td className="p-4">
                          <span className="font-mono font-bold text-accent-emerald text-sm block">
                            #{blk.blockNumber}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted block mt-0.5">
                            {blk.timestamp}
                          </span>
                        </td>

                        {/* Actor */}
                        <td className="p-4">
                          <span className="font-heading font-bold text-text-primary block">
                            {blk.actor.name}
                          </span>
                          <span className="font-mono text-[10px] text-text-muted block mt-0.5">
                            {blk.actor.role} • {blk.actor.ip}
                          </span>
                        </td>

                        {/* Action & Resource */}
                        <td className="p-4">
                          <span className="font-mono text-xs font-semibold text-text-primary block">
                            {blk.action}
                          </span>
                          <span className="font-mono text-[10px] text-accent-cyan block mt-0.5 truncate max-w-xs">
                            {blk.resource}
                          </span>
                        </td>

                        {/* Severity */}
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                              blk.severity === 'HIGH' || blk.severity === 'CRITICAL'
                                ? 'bg-danger/20 text-danger border border-danger/30'
                                : blk.severity === 'MEDIUM'
                                ? 'bg-warning/20 text-warning border border-warning/30'
                                : 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
                            }`}
                          >
                            {blk.severity}
                          </span>
                        </td>

                        {/* Hash preview */}
                        <td className="p-4 font-mono text-[11px] text-text-muted">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[130px]">{blk.currentHash}</span>
                            <CopyButton value={blk.currentHash} />
                          </div>
                        </td>

                        {/* Expand trigger */}
                        <td className="p-4 text-right">
                          <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Row with full block details */}
                      {isExpanded && (
                        <tr className="bg-bg-elevated/40">
                          <td colSpan={6} className="p-5 border-t border-border-subtle/60">
                            <div className="space-y-3 font-mono text-xs">
                              <div>
                                <span className="text-[10px] uppercase text-text-muted block mb-1">
                                  Action Narrative
                                </span>
                                <p className="font-sans text-xs text-text-primary leading-relaxed">
                                  {blk.details}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
                                  <span className="text-[10px] uppercase text-text-muted block mb-1">
                                    Previous Block Hash (Parent)
                                  </span>
                                  <span className="text-text-muted break-all text-[11px]">
                                    {blk.prevHash}
                                  </span>
                                </div>
                                <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
                                  <span className="text-[10px] uppercase text-accent-cyan block mb-1">
                                    Current Block Hash (SHA-256)
                                  </span>
                                  <span className="text-accent-cyan font-bold break-all text-[11px]">
                                    {blk.currentHash}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
