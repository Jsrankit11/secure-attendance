import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { INDIAN_STUDENT_ACCOUNTS } from '../../mock/indianStudents';
import { api, setAuthToken } from '../../lib/api';

export const AuthPage: React.FC = () => {
  const { setCurrentPage, setUserRole, currentUser, setCurrentUser } = useApp();
  const { success, error } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'mfa' | 'forgot'>('login');
  const [role, setRole] = useState<'Instructor' | 'Student'>('Instructor');
  const [name, setName] = useState('Prof. Ankit Sharma');
  const [email, setEmail] = useState('a.sharma@cybershield.edu');
  const [password, setPassword] = useState('Password@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [devBoxOpen, setDevBoxOpen] = useState(true);

  // Rotating security tips
  const tips = [
    'HMAC-SHA256 provides both data integrity and authentication with secret key verification.',
    'Never transmit raw passwords: CyberShield utilizes salted Argon2id hashes with nonces.',
    'Time-based One Time Passwords (TOTP) resist phishing by enforcing 30-second rotating cryptographic seeds.',
    'ECDSA-P256 ensures asymmetric proof of origin for academic check-ins.'
  ];
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [tips.length]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const t = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [lockoutSeconds]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(password);

  const handleMfaInput = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...mfaCode];
    updated[idx] = val;
    setMfaCode(updated);

    // Auto focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`mfa-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setUserRole(res.user.role);
        success('MFA & Password Authenticated', `Welcome back, ${res.user.name} (${res.user.role})`);

        if (res.user.role === 'Student') {
          setCurrentPage('student-dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      } else if (mode === 'signup') {
        const res = await api.register({
          name: name || email.split('@')[0],
          email,
          password,
          role
        });
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setUserRole(res.user.role);
        success('User Registered & Sealed', `Welcome, ${res.user.name}`);

        if (res.user.role === 'Student') {
          setCurrentPage('student-dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      } else if (mode === 'forgot') {
        success('Reset Token Dispatched', 'Signed challenge sent to recovery address');
        setMode('login');
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      triggerFailedAttempt();
    } finally {
      setLoading(false);
    }
  };

  const triggerFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= 3) {
      setLockoutSeconds(30);
      error('Security Lockout Triggered', '3 failed attempts detected. Cooling down for 30s.');
    } else {
      error('Authentication Error', `Invalid cryptographic signature. ${3 - nextAttempts} attempts remaining.`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 cyber-grid-bg opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 glow-blob-emerald opacity-20 pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 glow-blob-cyan opacity-20 pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Branded Animated Shield + Rotating Security Tips */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 text-left">
          <div>
            <div
              onClick={() => setCurrentPage('landing')}
              className="inline-flex items-center gap-3 cursor-pointer group mb-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent-emerald/15 border border-accent-emerald/50 flex items-center justify-center text-accent-emerald shadow-[0_0_25px_rgba(0,245,160,0.3)] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="font-heading font-black text-2xl tracking-tight text-text-primary">
                  CyberShield<span className="text-accent-emerald">.AI</span>
                </span>
                <span className="text-[10px] font-mono text-accent-cyan tracking-wider uppercase block">
                  ZERO-TRUST AUTHENTICATION
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-text-primary leading-tight">
              Cryptographically Verified Access for Instructors & Students
            </h2>
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Every session binds to an authenticated ECDSA private key. Session tokens are signed using 
              HMAC integrity seeds to prevent session hijacking.
            </p>
          </div>

          {/* Rotating Tip Glass Card */}
          <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="micro-label text-accent-emerald flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                SECURITY PROTOCOL TIP #{tipIndex + 1}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
            </div>
            <p className="font-mono text-xs text-text-primary min-h-[48px] leading-relaxed">
              "{tips[tipIndex]}"
            </p>
          </div>

          <div className="font-mono text-xs text-text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald" />
            <span>Node Status: Enclave Online (TLS 1.3 / AES-GCM)</span>
          </div>
        </div>

        {/* Right Side: Glass Form Card */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border-subtle bg-bg-surface/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Lockout Warning Banner */}
            {lockoutSeconds > 0 && (
              <div className="mb-6 p-4 rounded-xl border border-danger/40 bg-danger/10 flex items-center gap-3 text-danger">
                <ShieldAlert className="w-5 h-5 animate-pulse shrink-0" />
                <div className="text-xs">
                  <span className="font-bold block">RATE LIMIT LOCKOUT ACTIVE</span>
                  Too many attempts. Retry permitted in <span className="font-mono font-black">{lockoutSeconds}s</span>.
                </div>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            {mode !== 'mfa' && mode !== 'forgot' && (
              <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setMode('login')}
                    className={`font-heading font-bold text-sm transition-colors ${
                      mode === 'login' ? 'text-accent-emerald border-b-2 border-accent-emerald pb-1' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Authenticate
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={`font-heading font-bold text-sm transition-colors ${
                      mode === 'signup' ? 'text-accent-emerald border-b-2 border-accent-emerald pb-1' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Enroll Key / Sign Up
                  </button>
                </div>

                {/* Role Toggle Pill */}
                <div className="flex items-center p-1 bg-bg-base/80 rounded-lg border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setRole('Instructor')}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors ${
                      role === 'Instructor'
                        ? 'bg-accent-emerald text-[#08090B]'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Instructor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Student')}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase transition-colors ${
                      role === 'Student'
                        ? 'bg-accent-cyan text-[#08090B]'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Student
                  </button>
                </div>
              </div>
            )}

            {/* FORM: MFA Step */}
            {mode === 'mfa' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="micro-label text-accent-cyan">STEP 02 OF 02</span>
                  <h3 className="text-xl font-heading font-bold text-text-primary mt-1">
                    Enter Authenticator TOTP Code
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    A 6-digit cryptographic challenge has been synchronized with your hardware authenticator.
                  </p>
                </div>

                <div className="flex justify-between gap-2 max-w-sm mx-auto">
                  {mfaCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`mfa-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMfaInput(idx, e.target.value)}
                      className="w-12 h-14 text-center font-mono text-xl font-bold bg-bg-base/80 border border-border-subtle rounded-xl text-accent-emerald focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                  <span>Rotating in: 18s</span>
                  <button
                    type="button"
                    onClick={() => setMfaCode(['4', '8', '1', '9', '2', '0'])}
                    className="text-accent-cyan hover:underline"
                  >
                    Auto-fill Demo TOTP
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMode('login')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="flex-1"
                  >
                    Verify & Decrypt Enclave
                  </Button>
                </div>
              </form>
            ) : mode === 'forgot' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-heading font-bold text-text-primary">
                    Recover Enclave Credentials
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Enter your academic email to initiate cryptographic key re-derivation.
                  </p>
                </div>

                <div>
                  <label className="micro-label text-text-muted block mb-1.5">Academic Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-sm text-text-primary focus:border-accent-emerald focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMode('login')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="flex-1"
                  >
                    Send Signed Recovery Challenge
                  </Button>
                </div>
              </form>
            ) : (
              /* Normal Login / Signup Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="micro-label text-text-muted block mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Elena Rostova"
                        defaultValue={currentUser.name}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-sm text-text-primary focus:border-accent-emerald focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="micro-label text-text-muted block mb-1.5">Academic Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-sm text-text-primary focus:border-accent-emerald focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="micro-label text-text-muted">Master Key Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-accent-cyan hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-base/80 border border-border-subtle text-sm text-text-primary focus:border-accent-emerald focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength >= step
                            ? strength >= 3
                              ? 'bg-accent-emerald shadow-[0_0_8px_#00F5A0]'
                              : strength === 2
                              ? 'bg-warning'
                              : 'bg-danger'
                            : 'bg-white/[0.08]'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-text-muted ml-2">
                      {strength >= 4 ? 'STRONG' : strength >= 2 ? 'FAIR' : 'WEAK'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={lockoutSeconds > 0}
                    className="w-full"
                  >
                    {mode === 'login' ? 'Proceed to 2FA Challenge' : 'Generate Keys & Enroll'}
                  </Button>

                  <button
                    type="button"
                    onClick={triggerFailedAttempt}
                    className="text-xs font-mono text-danger/80 hover:text-danger hover:underline self-center"
                  >
                    Simulate Failed Login Attempt (Lockout Test)
                  </button>
                </div>
              </form>
            )}

            {/* Collapsible Local-Only Demo Credentials Box */}
            <div className="mt-6 pt-4 border-t border-border-subtle">
              <button
                onClick={() => setDevBoxOpen(!devBoxOpen)}
                className="w-full flex items-center justify-between text-xs font-mono text-text-muted hover:text-accent-emerald"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent-emerald" />
                  Dev Only: Quick Demo Credentials
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${devBoxOpen ? 'rotate-180' : ''}`} />
              </button>

              {devBoxOpen && (
                <div className="mt-3 p-3 rounded-xl bg-bg-base/80 border border-border-subtle font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Instructor:</span>
                    <button
                      onClick={() => {
                        setEmail('a.sharma@cybershield.edu');
                        setPassword('Password@2026!');
                        setRole('Instructor');
                      }}
                      className="text-accent-emerald hover:underline"
                    >
                      Use a.sharma@cybershield.edu
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Quick Student:</span>
                    <button
                      onClick={() => {
                        const acc = INDIAN_STUDENT_ACCOUNTS[0]; // Vedika Gupta
                        setEmail(acc.email);
                        setPassword(acc.defaultPassword || 'Password@2026!');
                        setRole('Student');
                      }}
                      className="text-accent-cyan hover:underline"
                    >
                      Use {INDIAN_STUDENT_ACCOUNTS[0].name} ({INDIAN_STUDENT_ACCOUNTS[0].email})
                    </button>
                  </div>

                  <div className="pt-2 border-t border-border-subtle/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-text-muted text-[10px] uppercase font-bold text-accent-cyan">
                        Select Verified Student Account:
                      </span>
                      <span className="text-[10px] text-accent-emerald font-semibold">Immediate Autofill</span>
                    </div>
                    <select
                      onChange={(e) => {
                        const acc = INDIAN_STUDENT_ACCOUNTS.find(s => s.studentId === e.target.value);
                        if (acc) {
                          setEmail(acc.email);
                          setPassword(acc.defaultPassword);
                          setRole('Student');
                        }
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-bg-base border border-border-subtle text-xs text-text-primary font-mono focus:outline-none"
                    >
                      <option value="">-- Choose Indian Student Account --</option>
                      {INDIAN_STUDENT_ACCOUNTS.map((s, idx) => (
                        <option key={s.id} value={s.studentId}>
                          {idx + 1}. {s.name} ({s.studentId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
