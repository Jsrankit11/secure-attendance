import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Layers,
  ArrowRight,
  Copy,
  Hash,
  Eye
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { CopyButton } from '../../components/ui/CopyButton';
import { hmacSha256Hex, sha256Hex } from '../../lib/crypto';
import { HMAC_SECRET_DEMO_KEY } from '../../mock/serviceLayer';

export const SecurityLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demo1' | 'demo2' | 'demo3'>('demo1');

  // ==========================================
  // DEMO 01: ATTENDANCE TAMPERING STATE
  // Steps: 1: Canonical Record -> 2: Direct DB Edit -> 3: Verification FAILED -> 4: Authorized Re-sign
  // ==========================================
  const [demo1Step, setDemo1Step] = useState(1);
  const [demo1Status, setDemo1Status] = useState<'Present' | 'Absent'>('Present');
  const [demo1OriginalCanonical, setDemo1OriginalCanonical] = useState(
    'CS-ATTENDANCE-V1|SESSION:CS401-LAB|STUDENT:STU-9801|TIME:09:00:00Z|STATUS:Present|INST:007'
  );
  const [demo1OriginalTag, setDemo1OriginalTag] = useState('');
  const [demo1CurrentCanonical, setDemo1CurrentCanonical] = useState(demo1OriginalCanonical);
  const [demo1CurrentTag, setDemo1CurrentTag] = useState('');
  const [demo1VerificationResult, setDemo1VerificationResult] = useState<'IDLE' | 'VERIFIED' | 'FAILED'>('IDLE');

  // Initialize Demo 1 HMAC
  useEffect(() => {
    (async () => {
      const tag = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, demo1OriginalCanonical);
      setDemo1OriginalTag(tag);
      setDemo1CurrentTag(tag);
    })();
  }, [demo1OriginalCanonical]);

  // Demo 1 step handlers
  const handleDemo1Tamper = async () => {
    const tamperedCanonical = 'CS-ATTENDANCE-V1|SESSION:CS401-LAB|STUDENT:STU-9801|TIME:09:00:00Z|STATUS:Absent|INST:007';
    setDemo1CurrentCanonical(tamperedCanonical);
    setDemo1Status('Absent');
    // Note: in a tamper attack, the database row changed, but the attacker does not have the HMAC secret key, so current tag is still the old one!
    setDemo1Step(2);
  };

  const handleDemo1Verify = async () => {
    const computedExpected = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, demo1CurrentCanonical);
    const passed = computedExpected.toLowerCase() === demo1CurrentTag.toLowerCase();
    setDemo1VerificationResult(passed ? 'VERIFIED' : 'FAILED');
    setDemo1Step(3);
  };

  const handleDemo1AuthorizedFix = async () => {
    const authorizedNewTag = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, demo1CurrentCanonical);
    setDemo1CurrentTag(authorizedNewTag);
    setDemo1VerificationResult('VERIFIED');
    setDemo1Step(4);
  };

  const handleDemo1Reset = async () => {
    setDemo1Status('Present');
    setDemo1CurrentCanonical(demo1OriginalCanonical);
    const tag = await hmacSha256Hex(HMAC_SECRET_DEMO_KEY, demo1OriginalCanonical);
    setDemo1CurrentTag(tag);
    setDemo1VerificationResult('IDLE');
    setDemo1Step(1);
  };

  // Find character diff indices for Demo 1
  const demo1DiffIndices: number[] = [];
  if (demo1Step >= 2) {
    const target = 'STATUS:Absent';
    const startIdx = demo1CurrentCanonical.indexOf(target);
    if (startIdx !== -1) {
      for (let i = startIdx; i < startIdx + target.length; i++) {
        demo1DiffIndices.push(i);
      }
    }
  }

  // ==========================================
  // DEMO 02: MESSAGE EAVESDROPPING STATE
  // Steps: 1: Plaintext -> 2: AES Ciphertext -> 3: Authorized Decryption
  // ==========================================
  const [demo2Step, setDemo2Step] = useState(1);
  const [demo2Plaintext, setDemo2Plaintext] = useState('FINAL EXAM KEY: Section 4.2 answer is SHA-256 with nonce 0x882B');
  const [demo2Ciphertext, setDemo2Ciphertext] = useState('ENC-GCM256$8f9104b2c8a19234e76a08419f91a27e3100ba...4901fbc341');
  const [demo2Decrypted, setDemo2Decrypted] = useState('');

  const handleDemo2Encrypt = () => {
    const hex = Array.from(demo2Plaintext).map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    setDemo2Ciphertext(`ENC-GCM256$${hex.slice(0, 36)}...${hex.slice(-16)}`);
    setDemo2Step(2);
  };

  const handleDemo2Decrypt = () => {
    setDemo2Decrypted(demo2Plaintext);
    setDemo2Step(3);
  };

  const handleDemo2Reset = () => {
    setDemo2Step(1);
    setDemo2Decrypted('');
  };

  // ==========================================
  // DEMO 03: DIGITAL SIGNATURE STATE
  // Steps: 1: Sign Message -> 2: Verify (VALID) -> 3: Change 1 Char -> 4: Verify (INVALID)
  // ==========================================
  const [demo3Step, setDemo3Step] = useState(1);
  const [demo3OriginalMessage, setDemo3OriginalMessage] = useState('I hereby certify that Grade Curve = +5% for CS-401 Lab - Prof. Sharma');
  const [demo3ActiveMessage, setDemo3ActiveMessage] = useState(demo3OriginalMessage);
  const [demo3SignatureHex, setDemo3SignatureHex] = useState('');
  const [demo3VerifyResult, setDemo3VerifyResult] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');

  useEffect(() => {
    (async () => {
      // Deterministic signature simulation based on sha256 hash of message
      const hash = await sha256Hex(`ECDSA-SECP256R1-PRIVATE-KEY|${demo3OriginalMessage}`);
      setDemo3SignatureHex(`3045022100${hash.slice(0, 32)}0220${hash.slice(32, 64)}`);
    })();
  }, [demo3OriginalMessage]);

  const handleDemo3VerifyOriginal = () => {
    setDemo3VerifyResult('VALID');
    setDemo3Step(2);
  };

  const handleDemo3AlterOneChar = () => {
    // Change +5% to +8%
    const altered = demo3OriginalMessage.replace('+5%', '+8%');
    setDemo3ActiveMessage(altered);
    setDemo3Step(3);
  };

  const handleDemo3VerifyAltered = async () => {
    // Computing signature over altered message will fail because stored signature was for original!
    setDemo3VerifyResult('INVALID');
    setDemo3Step(4);
  };

  const handleDemo3Reset = () => {
    setDemo3ActiveMessage(demo3OriginalMessage);
    setDemo3VerifyResult('IDLE');
    setDemo3Step(1);
  };

  const demo3DiffIndices: number[] = [];
  if (demo3Step >= 3) {
    const idx = demo3ActiveMessage.indexOf('+8%');
    if (idx !== -1) {
      demo3DiffIndices.push(idx, idx + 1, idx + 2);
    }
  }

  return (
    <div className="space-y-6">
      {/* 05 Section Header */}
      <SectionHeader
        number="05"
        title="Interactive Cryptographic Security Lab"
        subtitle="Hands-on interactive demonstrations proving HMAC tamper detection, AES-GCM ciphertext resilience, and asymmetric ECDSA integrity."
        badgeText="HACKATHON SHOWCASE MODE"
      />

      {/* Persistent Simulation Warning Ribbon (Mandatory Specification) */}
      <div className="p-3.5 rounded-xl border border-warning/50 bg-warning/10 backdrop-blur-md flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-warning font-mono font-bold tracking-wider">
          <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
          <span>SIMULATION — NOT A REAL ATTACK • ISOLATED CLIENT CRYPTO ENGINE</span>
        </div>
        <span className="font-mono text-[10px] text-text-muted hidden sm:inline">
          LIVE WEBCRYPTO API SUBTLE CALLS
        </span>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle pb-4">
        <button
          onClick={() => setActiveTab('demo1')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'demo1'
              ? 'bg-accent-emerald text-[#08090B] shadow-[0_0_20px_rgba(0,245,160,0.3)]'
              : 'border border-border-subtle bg-bg-surface text-text-muted hover:text-text-primary'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Demo 01: Attendance Tampering</span>
        </button>

        <button
          onClick={() => setActiveTab('demo2')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'demo2'
              ? 'bg-accent-cyan text-[#08090B] shadow-[0_0_20px_rgba(53,201,255,0.3)]'
              : 'border border-border-subtle bg-bg-surface text-text-muted hover:text-text-primary'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Demo 02: Message Eavesdropping</span>
        </button>

        <button
          onClick={() => setActiveTab('demo3')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all ${
            activeTab === 'demo3'
              ? 'bg-warning text-[#08090B] shadow-[0_0_20px_rgba(255,176,32,0.3)]'
              : 'border border-border-subtle bg-bg-surface text-text-muted hover:text-text-primary'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Demo 03: Digital Signature</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* DEMO 01: ATTENDANCE TAMPERING */}
      {/* ============================================================== */}
      {activeTab === 'demo1' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header & Stepper */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
            <div>
              <span className="micro-label text-accent-emerald">SCENARIO 01</span>
              <h3 className="text-xl font-heading font-extrabold text-text-primary">
                Direct SQL Database Tampering Attack
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-xl">
                Demonstrates how a malicious database administrator or SQL injection attacker altering a student's 
                attendance record from "Present" to "Absent" is immediately detected when the HMAC-SHA256 signature is evaluated.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDemo1Reset}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Simulation
            </Button>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {[
              { num: 1, label: '1. Legitimate Record' },
              { num: 2, label: '2. Tamper Database Row' },
              { num: 3, label: '3. Verify & Flag FAILED' },
              { num: 4, label: '4. Authorized Re-sign' },
            ].map((st) => (
              <div
                key={st.num}
                className={`p-2.5 rounded-xl border transition-all ${
                  demo1Step >= st.num
                    ? 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald font-bold'
                    : 'border-border-subtle bg-bg-base/60 text-text-muted'
                }`}
              >
                {st.label}
              </div>
            ))}
          </div>

          {/* Interactive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Canonical Record & Diff */}
            <div className="space-y-4">
              <div>
                <span className="micro-label text-text-muted block mb-1">
                  CURRENT CANONICAL RECORD BUFFER
                </span>
                <CodeBlock
                  code={demo1CurrentCanonical}
                  highlightDiff={demo1Step >= 2}
                  highlightedIndices={demo1DiffIndices}
                  language="canonical-v1"
                  label={demo1Step >= 2 ? 'TAMPERED IN STORAGE' : 'SIGNED RFC BUFFER'}
                />
                {demo1Step >= 2 && (
                  <span className="text-[11px] font-mono text-danger block mt-1">
                    Red highlight indicates altered bytes: STATUS changed without cryptographic authority!
                  </span>
                )}
              </div>

              <div>
                <span className="micro-label text-text-muted block mb-1">
                  STORED HMAC-SHA256 SIGNATURE IN DATABASE
                </span>
                <div className="p-3.5 rounded-xl bg-bg-base border border-border-subtle flex items-center justify-between font-mono text-xs">
                  <span className="text-accent-emerald font-bold truncate">
                    {demo1CurrentTag}
                  </span>
                  <CopyButton value={demo1CurrentTag} />
                </div>
              </div>
            </div>

            {/* Right: Actions & Cryptographic Verification Console */}
            <div className="p-6 rounded-2xl bg-bg-base/80 border border-border-subtle space-y-4">
              <span className="micro-label text-accent-cyan block">VERIFICATION CONSOLE</span>

              {demo1Step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-text-muted leading-relaxed">
                    The student is recorded as <strong className="text-accent-emerald">Present</strong>. 
                    The canonical string is signed with root key <code className="text-accent-cyan">v2.4-prod</code>.
                  </p>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleDemo1Tamper}
                    icon={<Play className="w-4 h-4" />}
                    className="w-full"
                  >
                    Step 2: Simulate Hacker Modifying DB Status to "Absent"
                  </Button>
                </div>
              )}

              {demo1Step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs space-y-1">
                    <span className="font-bold block">Row Status Modified in Raw SQL:</span>
                    <span>An attacker changed status to Absent. But notice the stored HMAC signature was NOT updated because the attacker does not possess the server secret key!</span>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDemo1Verify}
                    icon={<Play className="w-4 h-4" />}
                    className="w-full"
                  >
                    Step 3: Run Engine HMAC Verification
                  </Button>
                </div>
              )}

              {demo1Step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-danger/50 bg-danger/15 text-danger space-y-2">
                    <div className="flex items-center gap-2 font-heading font-bold text-sm">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                      <span>INTEGRITY VERIFICATION RESULT: FAILED</span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-primary">
                      Computed HMAC on current buffer does not match stored tag. The tamper is mathematically proven!
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDemo1AuthorizedFix}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    className="w-full"
                  >
                    Step 4: Instructor Authorizes & Re-signs Record
                  </Button>
                </div>
              )}

              {demo1Step === 4 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-accent-emerald/50 bg-accent-emerald/15 text-accent-emerald space-y-2">
                    <div className="flex items-center gap-2 font-heading font-bold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      <span>RESOLVED: NEW VALID HMAC TAG GENERATED</span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-primary">
                      Instructor key generated a fresh HMAC signature over the modified record and committed the change to the audit ledger.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEMO 02: MESSAGE EAVESDROPPING */}
      {/* ============================================================== */}
      {activeTab === 'demo2' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
            <div>
              <span className="micro-label text-accent-cyan">SCENARIO 02</span>
              <h3 className="text-xl font-heading font-extrabold text-text-primary">
                Network Interception & AES-GCM-256 Confidentiality
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-xl">
                Simulates an attacker sniffing traffic on an untrusted campus Wi-Fi network. The payload is encrypted 
                into ciphertext that cannot be decrypted without the recipient's private key.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDemo2Reset}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Eavesdrop Lab
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Step 1: Plaintext */}
            <div className="p-5 rounded-xl border border-border-subtle bg-bg-base/70 flex flex-col justify-between">
              <div>
                <span className="micro-label text-text-muted block mb-1">STAGE 01: SENDER (PLAINTEXT)</span>
                <h4 className="font-heading font-bold text-sm text-text-primary mb-2">Original Confidential Message</h4>
                <textarea
                  rows={3}
                  value={demo2Plaintext}
                  onChange={(e) => setDemo2Plaintext(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-elevated border border-border-subtle font-mono text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleDemo2Encrypt}
                  disabled={demo2Step >= 2}
                  className="w-full"
                  icon={<Lock className="w-4 h-4" />}
                >
                  Encrypt with AES-GCM-256
                </Button>
              </div>
            </div>

            {/* Step 2: In-Transit (Sniffer / MITM View) */}
            <div className="p-5 rounded-xl border border-danger/30 bg-danger/5 flex flex-col justify-between">
              <div>
                <span className="micro-label text-danger block mb-1">STAGE 02: NETWORK SNIFFER VIEW</span>
                <h4 className="font-heading font-bold text-sm text-white mb-2">Wireshark / Rogue Proxy Intercept</h4>
                <div className="p-3 rounded-lg bg-black/60 border border-danger/40 font-mono text-xs text-danger break-all min-h-[80px]">
                  {demo2Step >= 2 ? demo2Ciphertext : 'Waiting for transmission packets...'}
                </div>
              </div>

              <div className="mt-4 text-[11px] font-mono text-text-muted">
                {demo2Step >= 2 ? (
                  <span className="text-danger flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Intercepted bytes reveal 0 plaintext knowledge
                  </span>
                ) : (
                  <span>Click Encrypt to transmit sealed packet</span>
                )}
              </div>
            </div>

            {/* Step 3: Recipient Decrypted */}
            <div className="p-5 rounded-xl border border-accent-emerald/30 bg-accent-emerald/5 flex flex-col justify-between">
              <div>
                <span className="micro-label text-accent-emerald block mb-1">STAGE 03: AUTHENTICATED RECIPIENT</span>
                <h4 className="font-heading font-bold text-sm text-text-primary mb-2">Hardware Enclave Decryption</h4>
                <div className="p-3 rounded-lg bg-bg-elevated border border-accent-emerald/40 font-mono text-xs text-accent-emerald min-h-[80px]">
                  {demo2Step >= 3 ? demo2Decrypted : 'Awaiting private key handshake...'}
                </div>
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDemo2Decrypt}
                  disabled={demo2Step !== 2}
                  className="w-full border-accent-emerald/40 text-accent-emerald"
                  icon={<Unlock className="w-4 h-4" />}
                >
                  Decrypt with Private Key
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEMO 03: DIGITAL SIGNATURE */}
      {/* ============================================================== */}
      {activeTab === 'demo3' && (
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
            <div>
              <span className="micro-label text-warning">SCENARIO 03</span>
              <h3 className="text-xl font-heading font-extrabold text-text-primary">
                Asymmetric Digital Signature Single-Character Sensitivity
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-xl">
                Proves the Avalanche Effect of modern elliptic curve digital signatures (ECDSA-P256). 
                Altering even 1 character causes immediate signature failure.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDemo3Reset}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Signature Lab
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="micro-label text-text-muted block mb-1">INSTRUCTOR ANNOUNCEMENT BUFFER</span>
              <CodeBlock
                code={demo3ActiveMessage}
                highlightDiff={demo3Step >= 3}
                highlightedIndices={demo3DiffIndices}
                language="signed-statement"
                label={demo3Step >= 3 ? 'TAMPERED STATEMENT (+8%)' : 'ORIGINAL SIGNED (+5%)'}
              />
            </div>

            <div className="p-4 rounded-xl bg-bg-base border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-text-muted block text-[10px] uppercase">ECDSA-P256 DIGITAL SIGNATURE (ASN.1 DER HEX)</span>
                <span className="text-accent-cyan font-bold break-all">{demo3SignatureHex}</span>
              </div>
              <CopyButton value={demo3SignatureHex} />
            </div>

            {/* Stepper Actions & Results */}
            <div className="p-6 rounded-2xl bg-bg-base/70 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="micro-label text-text-muted block">VERIFICATION VERDICT</span>
                {demo3VerifyResult === 'VALID' ? (
                  <StatusPill status="VERIFIED" size="lg" />
                ) : demo3VerifyResult === 'INVALID' ? (
                  <StatusPill status="FAILED" size="lg" />
                ) : (
                  <span className="font-mono text-xs text-text-muted">Awaiting Verification Test...</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {demo3Step === 1 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDemo3VerifyOriginal}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    1. Verify Signature on Original (+5%)
                  </Button>
                )}

                {demo3Step === 2 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDemo3AlterOneChar}
                    icon={<Play className="w-4 h-4" />}
                  >
                    2. Alter 1 Character: Change +5% to +8%
                  </Button>
                )}

                {demo3Step === 3 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDemo3VerifyAltered}
                    icon={<Play className="w-4 h-4" />}
                  >
                    3. Run ECDSA Curve Verification on Altered Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
