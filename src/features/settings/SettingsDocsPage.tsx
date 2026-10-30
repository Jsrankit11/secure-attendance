import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Smartphone,
  Key,
  FileText,
  Trash2,
  Download,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Info,
  Laptop,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CopyButton } from '../../components/ui/CopyButton';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';

export const SettingsDocsPage: React.FC = () => {
  const { currentUser, sessions, revokeSession } = useApp();
  const { success, warning } = useToast();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'sessions' | 'security' | 'keys' | 'privacy' | 'docs'
  >('profile');

  const [mfaSecret] = useState('JBSWY3DPEHPK3PXP');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'sessions', label: 'Active Sessions' },
    { id: 'security', label: 'MFA & Enclave' },
    { id: 'keys', label: 'Key Fingerprints' },
    { id: 'privacy', label: 'Privacy & Retention' },
    { id: 'docs', label: 'Architecture & Threat Model' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <SectionHeader
        number="07"
        title="Settings & System Documentation"
        subtitle="Manage enclave cryptographic keys, active hardware sessions, multi-factor authentication, and inspect formal threat model specifications."
        badgeText="CONFIGURATION & SPECS"
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-accent-emerald text-[#08090B] shadow-[0_0_15px_rgba(0,245,160,0.25)]'
                : 'border border-border-subtle bg-bg-surface text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Instructor Enclave Identity
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Your academic profile and cryptographic signing identities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-bg-base/80 border border-border-subtle">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-accent-emerald/60 shadow-lg"
            />
            <div className="space-y-1">
              <h4 className="text-base font-heading font-bold text-text-primary">
                {currentUser.name}
              </h4>
              <span className="font-mono text-xs text-accent-cyan block">
                {currentUser.email} • ID: {currentUser.id}
              </span>
              <span className="text-xs text-text-muted block">
                Affiliation: Department of Computer Science & Applied Cryptography
              </span>
            </div>
          </div>

          <div className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="micro-label text-text-muted block mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={currentUser.name}
                className="w-full px-3.5 py-2 rounded-xl bg-bg-base border border-border-subtle text-text-primary"
              />
            </div>
            <div>
              <label className="micro-label text-text-muted block mb-1">Academic Email</label>
              <input
                type="email"
                defaultValue={currentUser.email}
                className="w-full px-3.5 py-2 rounded-xl bg-bg-base border border-border-subtle text-text-primary"
              />
            </div>
            <div>
              <label className="micro-label text-text-muted block mb-1">Assigned Role</label>
              <input
                type="text"
                disabled
                defaultValue={currentUser.role}
                className="w-full px-3.5 py-2 rounded-xl bg-bg-elevated border border-border-subtle text-text-muted font-mono"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => success('Profile Saved', 'Enclave metadata updated')}
            >
              Update Profile Details
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Active Enclave Hardware Sessions
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Devices holding authenticated TLS session keys and valid TOTP credentials.
            </p>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-bg-elevated text-accent-cyan border border-border-subtle shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-text-primary text-sm">
                        {sess.device}
                      </span>
                      {sess.isCurrent && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-accent-emerald/20 text-accent-emerald font-bold">
                          CURRENT SESSION
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-text-muted text-[11px] block mt-0.5">
                      {sess.browser} • IP: {sess.ip}
                    </span>
                    <span className="text-[11px] text-text-muted block mt-0.5">
                      Location: {sess.location} • Last active: {sess.lastActive}
                    </span>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      revokeSession(sess.id);
                      warning('Session Terminated', `Revoked token for ${sess.device}`);
                    }}
                    className="text-danger border-danger/30 hover:border-danger hover:bg-danger/10 self-end sm:self-center"
                  >
                    Revoke Access
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & MFA */}
      {activeTab === 'security' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Hardware MFA & Authenticator Setup
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Configure RFC 6238 Time-based One-Time Password (TOTP) hardware tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* QR Code Placeholder with Cyber Aesthetic */}
            <div className="p-6 rounded-2xl bg-bg-base/90 border border-border-subtle flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-2xl bg-white p-4 shadow-xl">
                {/* SVG QR Code Simulation */}
                <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="#08090B" strokeWidth="1.5">
                  <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM14 14h2v2h-2zM14 18h2v3h-2zM18 14h3v2h-3zM18 18h3v3h-3zM10 7h4v2h-4zM7 10h2v4H7zM10 12h4v2h-4z" />
                </svg>
              </div>
              <span className="micro-label text-accent-cyan mt-4 block">
                AUTHENTICATOR SEED QR
              </span>
              <span className="text-xs text-text-muted mt-1 max-w-xs">
                Scan using Google Authenticator, 1Password, or YubiKey Authenticator.
              </span>
            </div>

            {/* Secret key and Backup Codes */}
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-text-muted block text-[10px] uppercase mb-1">
                  MANUAL SETUP SECRET
                </span>
                <div className="p-3 rounded-xl bg-bg-base border border-border-subtle flex items-center justify-between">
                  <span className="text-accent-emerald font-bold tracking-widest">
                    {mfaSecret}
                  </span>
                  <CopyButton value={mfaSecret} />
                </div>
              </div>

              <div>
                <span className="text-text-muted block text-[10px] uppercase mb-1">
                  ONE-TIME EMERGENCY BACKUP CODES
                </span>
                <div className="p-3 rounded-xl bg-bg-base border border-border-subtle grid grid-cols-2 gap-2 text-text-primary">
                  <span>8810-4491</span>
                  <span>9012-3321</span>
                  <span>1049-5582</span>
                  <span>7741-9920</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KEY FINGERPRINTS */}
      {activeTab === 'keys' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Public Key Fingerprints & Rotation Ledger
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Cryptographic keys in current active rotation across CyberShield nodes.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-bg-base border border-accent-emerald/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-accent-emerald font-bold text-sm">
                  Active Root HMAC Key: v2.4-prod
                </span>
                <Badge variant="emerald" size="sm">ACTIVE FOR SIGNING</Badge>
              </div>
              <p className="font-sans text-xs text-text-muted">
                Rotated on 2026-10-30 04:15 UTC. Used for canonical attendance hashing and tamper verification.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-text-muted">
                <span>Key Algorithm: HMAC-SHA-256 (256-bit entropy)</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => success('Key Rotation Initialized', 'New key version v2.5 committed')}
                >
                  Rotate Key
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-bg-base border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-warning font-bold text-sm">
                  Legacy Key: v2.3-legacy
                </span>
                <Badge variant="warning" size="sm">READ-ONLY AUDIT</Badge>
              </div>
              <p className="font-sans text-xs text-text-muted">
                Retired on 2026-10-30 04:15 UTC. Allowed only for reading and historical validation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY & RETENTION */}
      {activeTab === 'privacy' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">
              FERPA / GDPR Privacy & Cryptographic Retention
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Policies governing data minimization, verifiable erasure, and cryptographically anonymized records.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle space-y-2">
              <h4 className="font-heading font-bold text-text-primary text-sm">
                Cryptographic Erasure (Crypto-Shredding)
              </h4>
              <p className="text-text-muted leading-relaxed">
                When a student's record retention period expires, their associated private master keys are discarded 
                from the key management vault. This renders any stored ciphertexts permanently unrecoverable 
                while keeping audit ledger hash linkages mathematically intact.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 flex items-center justify-between gap-4">
              <div>
                <span className="font-heading font-bold text-danger text-sm block">
                  Export or Purge Personal Data
                </span>
                <span className="text-text-muted text-xs block mt-0.5">
                  Compliant with Right-to-be-Forgotten under cryptographic verification protocols.
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => success('Data Export Initiated', 'An encrypted zip bundle is generating')}
              >
                Export All Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ARCHITECTURE & THREAT MODEL DOCS */}
      {activeTab === 'docs' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-2xl p-6 sm:p-8 space-y-8">
          <div>
            <span className="micro-label text-accent-emerald">FORMAL SPECIFICATIONS</span>
            <h3 className="text-xl font-heading font-extrabold text-text-primary mt-1">
              CyberShield AI System Architecture & Threat Model
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Complete architectural documentation for the Build It Secure Hackathon review committee.
            </p>
          </div>

          {/* Section: Threat Model */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-emerald" />
              1. Threat Model & Adversary Assumptions
            </h4>
            <div className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-muted space-y-2 leading-relaxed">
              <p>
                <strong className="text-white">Adversary Profile:</strong> We assume an active attacker with full direct read/write 
                access to the application database (e.g., via compromised SQL credentials, database backups, or malicious DBAs).
              </p>
              <p>
                <strong className="text-white">Security Objective:</strong> Prevent undetectable manipulation of attendance check-in 
                events and guarantee message authenticity without trusting intermediate relay servers.
              </p>
              <p>
                <strong className="text-white">Defense In Depth:</strong> Canonical RFC normalization ensures identical hashing inputs. 
                HMAC-SHA256 ensures database row integrity. SHA-256 Merkle chain prevents row deletion.
              </p>
            </div>
          </div>

          {/* Section: System Limitations */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              2. Known System Limitations & Boundary Conditions
            </h4>
            <div className="p-4 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-muted space-y-2 leading-relaxed">
              <p>
                • <strong>Key Secrecy Dependency:</strong> If the root HMAC secret key is exfiltrated from the secure enclave, an attacker can compute valid HMAC tags for forged records.
              </p>
              <p>
                • <strong>Out-of-Band Fingerprint Verification:</strong> E2E safety numbers require peers to cross-verify fingerprints through an out-of-band communication channel to achieve 100% MITM resistance.
              </p>
            </div>
          </div>

          {/* Section: Local Setup Instructions */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-cyan" />
              3. Local Build & Development Setup
            </h4>
            <CodeBlock
              code={`# 1. Clone repository\ngit clone https://github.com/cybershield/cybershield-ai.git\ncd cybershield-ai\n\n# 2. Install dependencies\nnpm install\n\n# 3. Start local development server\nnpm run dev\n\n# 4. Open in browser at http://localhost:5173`}
              language="bash"
              label="BASH SETUP COMMANDS"
            />
          </div>
        </div>
      )}
    </div>
  );
};
