import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Lock,
  Key,
  Hash,
  Fingerprint,
  ArrowRight,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Database,
  Server,
  Layers,
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusPill } from '../../components/ui/StatusPill';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setCurrentPage, theme, toggleTheme } = useApp();
  const [copiedHmac, setCopiedHmac] = useState(false);

  const stats = [
    { label: 'HMAC Validations', value: '12,480+', badge: 'DEMO DATA' },
    { label: 'Verification Latency', value: '< 1.4ms', badge: 'SUBTLE CRYPTO' },
    { label: 'Audit Chain Blocks', value: '1,046', badge: 'SHA-256' },
    { label: 'Zero-Tamper Guarantee', value: '100%', badge: 'MATHEMATICAL' },
  ];

  const handleCopyTag = () => {
    navigator.clipboard.writeText('3fa81b8976c96e9527e029f635064db95d7f1917f2dfd08c5c24e650d032fa9c');
    setCopiedHmac(true);
    setTimeout(() => setCopiedHmac(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary selection:bg-accent-emerald/20 selection:text-accent-emerald relative overflow-x-hidden">
      {/* Background Grid & Radial Glows */}
      <div className="fixed inset-0 cyber-grid-bg opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 glow-blob-emerald opacity-25 pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 glow-blob-cyan opacity-25 pointer-events-none" />

      {/* Sticky Glass Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border-subtle bg-bg-base/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 border border-accent-emerald/50 flex items-center justify-center text-accent-emerald shadow-[0_0_20px_rgba(0,245,160,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary leading-none block">
                CyberShield<span className="text-accent-emerald">.AI</span>
              </span>
              <span className="text-[10px] font-mono text-accent-cyan tracking-wider uppercase block mt-1">
                Trust Every Record. Secure Every Message.
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-heading font-medium text-text-muted">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#architecture" className="hover:text-text-primary transition-colors">Architecture</a>
            <a href="#defense" className="hover:text-text-primary transition-colors">Threat Model</a>
            <button
              onClick={() => setCurrentPage('lab')}
              className="text-warning hover:text-warning/80 flex items-center gap-1.5 font-mono text-xs uppercase"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Security Lab</span>
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className="hover:text-text-primary transition-colors"
            >
              Docs
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/[0.06] border border-border-subtle transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-accent-primary" />}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('auth')}
              className="hidden sm:inline-flex"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentPage('dashboard')}
              data-cursor="ENTER"
            >
              Launch Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating Glass Icon Badges with subtle floating animation */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-16 left-12 p-3.5 rounded-2xl glass-panel border border-border-subtle text-accent-emerald shadow-xl flex items-center gap-2"
          >
            <Shield className="w-5 h-5" />
            <span className="font-mono text-xs font-bold">HMAC-SHA256</span>
          </motion.div>

          <motion.div
            animate={{ y: [12, -12, 12] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-28 right-16 p-3.5 rounded-2xl glass-panel border border-border-subtle text-accent-cyan shadow-xl flex items-center gap-2"
          >
            <Key className="w-5 h-5" />
            <span className="font-mono text-xs font-bold">ECDSA-P256</span>
          </motion.div>

          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 left-20 p-3.5 rounded-2xl glass-panel border border-border-subtle text-warning shadow-xl flex items-center gap-2"
          >
            <Hash className="w-5 h-5" />
            <span className="font-mono text-xs font-bold">SHA-256 Chain</span>
          </motion.div>

          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-28 right-24 p-3.5 rounded-2xl glass-panel border border-border-subtle text-accent-emerald shadow-xl flex items-center gap-2"
          >
            <Fingerprint className="w-5 h-5" />
            <span className="font-mono text-xs font-bold">Safety Fingerprint</span>
          </motion.div>
        </div>

        {/* Small Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-ping" />
          <span className="font-mono text-xs font-bold tracking-wider uppercase">
            Build It Secure Hackathon • SecureAttendance + SecureMessage
          </span>
        </div>

        {/* H1 Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-text-primary max-w-5xl mx-auto leading-[1.08]">
          Security Is Not a Feature.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald via-accent-cyan to-white">
            It's the Foundation.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base sm:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
          Cryptographically guaranteed attendance records protected by canonical HMAC tags, alongside 
          end-to-end verified messaging with live tamper detection and zero-trust audit chains.
        </p>

        {/* Two CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setCurrentPage('dashboard')}
            icon={<ArrowRight className="w-5 h-5" />}
            data-cursor="EXPLORE"
          >
            Explore Security Dashboard
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setCurrentPage('lab')}
            icon={<Terminal className="w-5 h-5 text-warning" />}
            data-cursor="TEST LAB"
          >
            Launch Interactive Security Lab
          </Button>
        </div>

        {/* Layered Overlapping Dashboard Preview Mockups in HTML/CSS */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          {/* Pulsing Animated SVG Shield behind panels */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none opacity-30">
            <svg width="420" height="420" viewBox="0 0 200 200" className="animate-spin-slow">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" className="text-accent-emerald" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-cyan/60" />
            </svg>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Layer 1: Left Preview Panel (Attendance Verification) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-5 rounded-2xl glass-panel p-5 border border-border-subtle shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent-emerald" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider">
                    Roster Check-In #1042
                  </span>
                </div>
                <StatusPill status="VERIFIED" size="sm" />
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-text-muted block text-[10px] uppercase">Student</span>
                  <span className="text-text-primary font-bold">Elena Rostova (STU-9801)</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase">Canonical String</span>
                  <div className="p-2 rounded-lg bg-bg-base/80 border border-border-subtle text-[10px] text-accent-cyan break-all">
                    CS-ATTENDANCE-V1|SESSION:401|STATUS:Present
                  </div>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase">HMAC-SHA256 Signature</span>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-bg-base/80 border border-border-subtle text-[10px] text-accent-emerald">
                    <span className="truncate">3fa81b8976c96e9527e029...</span>
                    <button onClick={handleCopyTag} className="ml-2 hover:text-white">
                      {copiedHmac ? <Check className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Layer 2: Center Hero Preview Panel (Live Security Status) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="md:col-span-7 rounded-2xl glass-panel p-6 border border-accent-emerald/40 shadow-[0_0_50px_rgba(0,245,160,0.12)] text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-emerald/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-ping" />
                  <span className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
                    Live Cryptographic Defense Node
                  </span>
                </div>
                <Badge variant="demo" size="sm">ACTIVE</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-bg-base/80 border border-border-subtle">
                  <span className="micro-label text-text-muted block mb-1">Audit Block</span>
                  <span className="text-xl font-mono font-bold text-accent-cyan">#1045</span>
                  <span className="text-[10px] text-text-muted block mt-0.5">SHA-256 Chained</span>
                </div>
                <div className="p-3 rounded-xl bg-bg-base/80 border border-border-subtle">
                  <span className="micro-label text-text-muted block mb-1">Key Version</span>
                  <span className="text-xl font-mono font-bold text-accent-emerald">v2.4-prod</span>
                  <span className="text-[10px] text-accent-emerald block mt-0.5">Active Ingestion</span>
                </div>
              </div>

              {/* Simulated Real-Time Audit Stream */}
              <div className="p-3 rounded-xl bg-bg-base/90 border border-border-subtle font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-accent-emerald flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> STU-9801: HMAC tag verified
                  </span>
                  <span className="text-text-muted text-[10px]">09:02:14</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-danger flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> STU-9802: Tamper detected
                  </span>
                  <span className="text-danger text-[10px]">09:04:40</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-accent-cyan flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> MSG-E2E: AES-256 payload sealed
                  </span>
                  <span className="text-text-muted text-[10px]">10:14:02</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-border-subtle bg-bg-surface/60 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <Badge variant="demo" size="sm" className="mb-2">{s.badge}</Badge>
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary">
                {s.value}
              </span>
              <span className="text-xs text-text-muted mt-1 font-mono uppercase tracking-wider">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Section 1: SecureAttendance */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-subtle">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-emerald" />
              <span className="micro-label text-accent-emerald">FEATURE 01 • TAMPER-PROOF ATTENDANCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary">
              Mathematical Trust for Every Check-In
            </h2>
            <p className="mt-4 text-text-muted text-base leading-relaxed">
              Traditional databases allow rogue administrators or database compromised attackers to quietly 
              change attendance status without anyone knowing. CyberShield binds every record to a canonical 
              cryptographic digest sealed with an HMAC-SHA256 signature.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">Canonical RFC Normalization</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Records are normalized into deterministic byte sequences before signing, eliminating spacing and encoding loopholes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">Automated Key Versioning</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Key rotation ensures forward secrecy. Legacy keys verify historical records in read-only audit mode.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-danger/10 text-danger border border-danger/30 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">Zero-Tolerance Tamper Alarms</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Modifying even a single character in the student status instantly invalidates the HMAC signature.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="primary"
                onClick={() => setCurrentPage('attendance')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Inspect Attendance Roster
              </Button>
            </div>
          </div>

          {/* Interactive Visual Preview */}
          <div className="rounded-2xl glass-panel p-6 border border-border-subtle shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
              <span className="font-mono text-xs uppercase font-bold text-text-muted">
                LIVE HMAC-SHA256 PIPELINE
              </span>
              <StatusPill status="VERIFIED" size="sm" />
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-bg-base/90 border border-border-subtle">
                <span className="text-[10px] text-text-muted block uppercase mb-1">Step 1: Canonical Representation</span>
                <span className="text-accent-cyan break-all">
                  CS-ATTENDANCE-V1|SESSION:CS-SEC-401|STUDENT:STU-9801|TIME:09:02Z|STATUS:Present
                </span>
              </div>

              <div className="text-center font-mono text-xs text-accent-emerald flex items-center justify-center gap-2">
                <span>↓ Key: HMAC_V2_4_SECRET ↓</span>
              </div>

              <div className="p-3 rounded-xl bg-bg-base/90 border border-accent-emerald/40 shadow-[0_0_20px_rgba(0,245,160,0.15)]">
                <span className="text-[10px] text-text-muted block uppercase mb-1">Step 2: Cryptographic Tag Generated</span>
                <span className="text-accent-emerald font-bold break-all">
                  3fa81b8976c96e9527e029f635064db95d7f1917f2dfd08c5c24e650d032fa9c
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: SecureMessage */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-subtle">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Left */}
          <div className="order-2 lg:order-1 rounded-2xl glass-panel p-6 border border-border-subtle shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-accent-cyan" />
                <span className="font-heading font-bold text-xs uppercase">
                  Safety Fingerprint Match
                </span>
              </div>
              <Badge variant="cyan" size="sm">E2E VERIFIED</Badge>
            </div>

            <div className="p-4 rounded-xl bg-bg-base/90 border border-border-subtle space-y-3 font-mono text-xs">
              <div>
                <span className="text-text-muted text-[10px] uppercase block">Identity Fingerprint (Dr. Sarah Lin)</span>
                <span className="text-accent-cyan font-bold tracking-wider block mt-1">
                  9F4B : 12C3 : 882E : 09A1 : E4D5 : 7701 : 33BC : FA19
                </span>
              </div>

              <div className="pt-2 border-t border-border-subtle">
                <span className="text-text-muted text-[10px] uppercase block">Sealed Ciphertext Transmission</span>
                <div className="mt-1 p-2 rounded bg-black/40 text-[10px] text-text-muted truncate">
                  ENC-GCM256$8f9104b2c8a19234e76a08419f91a2...4901fbc341
                </div>
              </div>
            </div>
          </div>

          {/* Details Right */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-cyan" />
              <span className="micro-label text-accent-cyan">FEATURE 02 • END-TO-END SIGNED CHAT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary">
              Authenticated Channels. No Impersonation.
            </h2>
            <p className="mt-4 text-text-muted text-base leading-relaxed">
              Every message transmitted across CyberShield is signed using the sender's private key and encrypted 
              via AES-GCM-256. Intermediary servers cannot alter message contents, forge instructor announcements, 
              or eavesdrop on sensitive academic exchanges.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">Grouped Hex Safety Numbers</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Compare out-of-band safety numbers with instructors to protect against Man-in-the-Middle (MITM) attacks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">Instant Key Revocation</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Compromised devices can be revoked immediately, displaying prominent red warnings on subsequent messages.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage('messages')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Open Encrypted Messenger
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Flow Diagram */}
      <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-subtle text-center">
        <span className="micro-label text-accent-emerald block mb-2">END-TO-END CRYPTOGRAPHIC TOPOLOGY</span>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary max-w-2xl mx-auto">
          How Data Moves Securely Through CyberShield
        </h2>
        <p className="mt-3 text-text-muted max-w-xl mx-auto text-sm">
          A multi-tiered cryptographic barrier ensuring integrity at the edge, in transit, and at rest.
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="p-5 rounded-2xl glass-panel border border-border-subtle text-left">
            <span className="micro-label text-accent-cyan block mb-2">NODE 01</span>
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/15 text-accent-cyan flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-text-primary">Client App</h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Collects raw attendance or chat payload, signs canonical buffer.
            </p>
          </div>

          <div className="hidden md:flex justify-center text-accent-emerald">
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-accent-emerald/40 shadow-[0_0_30px_rgba(0,245,160,0.15)] text-left">
            <span className="micro-label text-accent-emerald block mb-2">NODE 02</span>
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-text-primary">Crypto Engine</h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Validates HMAC-SHA256 signature against authoritative vault keys.
            </p>
          </div>

          <div className="hidden md:flex justify-center text-accent-emerald">
            <ArrowRight className="w-6 h-6 animate-pulse" />
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-border-subtle text-left">
            <span className="micro-label text-warning block mb-2">NODE 03</span>
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-sm text-text-primary">Audit Hash Chain</h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Appends transaction block linked with SHA-256 prev-hash.
            </p>
          </div>
        </div>
      </section>

      {/* Threat vs Defense Comparison Table */}
      <section id="defense" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-subtle">
        <div className="text-center mb-12">
          <span className="micro-label text-danger block mb-2">SECURITY ASSURANCE</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-text-primary">
            Threat vs. Cryptographic Defense
          </h2>
          <p className="mt-3 text-text-muted max-w-xl mx-auto text-sm">
            Comparing standard legacy LMS systems with CyberShield AI mathematical safeguards.
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle overflow-hidden glass-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-elevated/50 border-b border-border-subtle font-mono text-xs uppercase text-text-muted">
                <tr>
                  <th className="p-4 sm:p-5">Attack Vector</th>
                  <th className="p-4 sm:p-5 text-danger">Legacy LMS Risk</th>
                  <th className="p-4 sm:p-5 text-accent-emerald">CyberShield AI Defense</th>
                  <th className="p-4 sm:p-5">Cryptographic Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-sans">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-text-primary">Direct Database Tampering</td>
                  <td className="p-4 sm:p-5 text-danger/90">SQL UPDATE alters attendance silently</td>
                  <td className="p-4 sm:p-5 text-accent-emerald font-semibold">Flagged instantly on read</td>
                  <td className="p-4 sm:p-5 font-mono text-xs text-text-muted">HMAC-SHA256 signature verification</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-text-primary">Man-in-the-Middle Eavesdropping</td>
                  <td className="p-4 sm:p-5 text-danger/90">Plaintext chat messages intercepted</td>
                  <td className="p-4 sm:p-5 text-accent-emerald font-semibold">Ciphertext unreadable by proxies</td>
                  <td className="p-4 sm:p-5 font-mono text-xs text-text-muted">AES-GCM-256 payload encryption</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-text-primary">Instructor Impersonation</td>
                  <td className="p-4 sm:p-5 text-danger/90">Forged announcement notices</td>
                  <td className="p-4 sm:p-5 text-accent-emerald font-semibold">ECDSA signature check fails</td>
                  <td className="p-4 sm:p-5 font-mono text-xs text-text-muted">Asymmetric digital signature</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-text-primary">Audit Log Truncation / Deletion</td>
                  <td className="p-4 sm:p-5 text-danger/90">Logs deleted to hide malicious activity</td>
                  <td className="p-4 sm:p-5 text-accent-emerald font-semibold">Breaks previous hash linkage</td>
                  <td className="p-4 sm:p-5 font-mono text-xs text-text-muted">SHA-256 Merkle hash chain</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-bg-surface/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-accent-emerald" />
            <span className="font-heading font-extrabold text-base tracking-tight text-text-primary">
              CyberShield<span className="text-accent-emerald">.AI</span>
            </span>
            <span className="text-xs text-text-muted">
              • Build It Secure Hackathon
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-text-muted font-heading">
            <button onClick={() => setCurrentPage('settings')} className="hover:text-text-primary">Architecture Docs</button>
            <button onClick={() => setCurrentPage('settings')} className="hover:text-text-primary">Threat Model</button>
            <button onClick={() => setCurrentPage('settings')} className="hover:text-text-primary">Privacy Policy</button>
            <span className="font-mono text-[10px] text-accent-cyan">VERIFIED CRYPTO V2.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
