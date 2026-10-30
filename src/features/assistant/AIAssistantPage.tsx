import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  RotateCw,
  Terminal,
  FileCheck,
  Check,
  Cpu
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CopyButton } from '../../components/ui/CopyButton';
import { useToast } from '../../components/ui/Toast';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  classification?: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export const AIAssistantPage: React.FC = () => {
  const { success } = useToast();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'ai-01',
      sender: 'ai',
      text: 'Hello, Professor. I am CyberShield AI Assistant. I provide real-time explanations for cryptographic events, help classify security alerts, and guide your laboratory verification protocols. How can I assist with your cryptographic enclave today?',
      timestamp: '10:00 AM',
      classification: 'INFO'
    }
  ]);

  // Suggested question chips
  const suggestedQuestions = [
    'Why did student STU-9802 trigger a tamper alarm?',
    'What is the difference between HMAC-SHA256 and AES-GCM?',
    'How do I perform an authorized key rotation for next semester?',
    'Explain how the SHA-256 Merkle chain prevents audit deletion.'
  ];

  // Instructor security checklist
  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Rotate root HMAC key every 90 days', done: true },
    { id: 'c2', label: 'Verify out-of-band safety numbers for teaching staff', done: true },
    { id: 'c3', label: 'Resolve outstanding STU-9802 tamper alert', done: false },
    { id: 'c4', label: 'Export weekly cryptographically sealed CSV audit', done: true },
    { id: 'c5', label: 'Enforce TOTP hardware MFA for all administrative roles', done: false }
  ]);

  const completedCount = checklist.filter((c) => c.done).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleSendPrompt = (questionText?: string) => {
    const text = questionText || inputPrompt;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputPrompt('');
    setIsTyping(true);

    // Dynamic AI response simulation based on prompt content
    setTimeout(() => {
      let reply = '';
      let alertClass: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' = 'INFO';

      if (text.toLowerCase().includes('tamper') || text.toLowerCase().includes('stu-9802')) {
        reply = `### Tamper Analysis: Record STU-9802\n\n**Root Cause:** A direct SQL manipulation occurred in the storage row for student Marcus Vance. The database status was altered from \`Absent\` to \`Present\`, but the authoritative HMAC signature was computed over the canonical string \`...|STATUS:Absent|...\`.\n\n**Actionable Remedy:**\n1. If this was an instructor correction, click **Authorize Correction & Re-sign** in the Attendance drawer to recalculate the HMAC tag with current key \`v2.4-prod\`.\n2. If this was unauthorized, maintain the **FAILED** flag and notify security operations.`;
        alertClass = 'HIGH';
      } else if (text.toLowerCase().includes('difference') || text.toLowerCase().includes('hmac') || text.toLowerCase().includes('aes')) {
        reply = `### HMAC-SHA256 vs. AES-GCM-256\n\n* **HMAC-SHA256:** A Keyed-Hash Message Authentication Code. It guarantees **Integrity** and **Authenticity** (proving data wasn't modified and came from someone holding the secret key), but it does not encrypt the data—plaintext remains readable.\n* **AES-GCM-256:** Authenticated Encryption with Associated Data (AEAD). It provides both **Confidentiality** (encrypts data into unreadable ciphertext) and **Integrity** via a Galois authentication tag.\n\nIn CyberShield AI, **SecureAttendance** uses HMAC for public verifiable integrity, while **SecureMessage** uses AES-GCM for peer privacy.`;
        alertClass = 'LOW';
      } else if (text.toLowerCase().includes('rotation') || text.toLowerCase().includes('key')) {
        reply = `### Recommended Key Rotation Workflow\n\n1. Generate a new 256-bit entropy seed in your key vault.\n2. Label the new key as \`v2.5-prod\`.\n3. Keep \`v2.4-prod\` in **Audit Read-Only** mode so older records still evaluate to VERIFIED.\n4. Commit the key rotation event to the SHA-256 audit ledger.`;
        alertClass = 'MEDIUM';
      } else {
        reply = `I have analyzed your query within the local cryptographic enclave. All active mathematical validations are performing nominally with an average verification latency of <1.4ms. Please let me know if you need to run specific tampering simulations or test digital signatures!`;
        alertClass = 'INFO';
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        classification: alertClass
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* 04 Section Header */}
      <SectionHeader
        number="04"
        title="AI Security Assistant & Alert Classifier"
        subtitle="LLM-powered contextual reasoning and threat remediation guidance. Built specifically for cryptographic laboratory management."
        badgeText="INTELLIGENCE LAYER"
      />

      {/* Mandatory Prompt Banner (Required in specification) */}
      <div className="p-3.5 rounded-xl border border-warning/40 bg-warning/10 backdrop-blur-md flex items-center gap-3 text-xs text-warning">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          <strong>Architectural Integrity Banner:</strong> Verification results come from the backend cryptographic engine, not the AI. 
          The AI interprets and explains results but does not make authoritative verification decisions.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chat UI */}
        <div className="lg:col-span-8 rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl shadow-2xl flex flex-col h-[680px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border-subtle bg-bg-elevated/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 border border-accent-cyan/40 text-accent-cyan flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  Cryptographic Copilot Session
                </h3>
                <span className="text-[10px] font-mono text-accent-emerald flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
                  CONTEXT ENCLAVE SYNCHRONIZED
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setMessages([messages[0]]);
                success('History Cleared', 'Session memory reset');
              }}
            >
              Reset Session
            </Button>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';

              return (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAi
                        ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                        : 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-xl space-y-1 ${isAi ? 'text-left' : 'text-right'}`}>
                    {/* Honest "AI-generated explanation" label (Prompt requirement) */}
                    {isAi && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 font-bold">
                          AI-GENERATED EXPLANATION
                        </span>
                        {m.classification && (
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                              m.classification === 'HIGH'
                                ? 'bg-danger/20 text-danger border border-danger/30'
                                : m.classification === 'MEDIUM'
                                ? 'bg-warning/20 text-warning border border-warning/30'
                                : 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
                            }`}
                          >
                            SEVERITY: {m.classification}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-text-muted">{m.timestamp}</span>
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl leading-relaxed ${
                        isAi
                          ? 'bg-bg-elevated/70 border border-border-subtle text-text-primary rounded-tl-sm'
                          : 'bg-accent-emerald/15 border border-accent-emerald/30 text-text-primary rounded-tr-sm font-medium'
                      }`}
                    >
                      <div className="prose prose-invert text-xs space-y-2 whitespace-pre-wrap">
                        {m.text}
                      </div>

                      {isAi && (
                        <div className="mt-3 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
                          <span>Model: Gemini 3.8 Flash High</span>
                          <CopyButton value={m.text} label="Copy Answer" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 text-xs text-text-muted">
                <div className="w-7 h-7 rounded-lg bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-elevated border border-border-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-bounce [animation-delay:0.4s]" />
                  <span className="font-mono text-[10px] text-accent-cyan ml-1">Computing Cryptographic Context...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Question Chips */}
          <div className="p-3 border-t border-border-subtle bg-bg-elevated/20 flex gap-2 overflow-x-auto">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(q)}
                className="shrink-0 px-2.5 py-1 rounded-lg border border-border-subtle bg-bg-base/80 hover:border-accent-cyan/40 hover:text-accent-cyan text-[11px] font-mono text-text-muted transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Prompt Input Box */}
          <div className="p-4 border-t border-border-subtle bg-bg-surface">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Ask about HMAC verification, AES-GCM ciphertexts, or tamper alerts..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-base border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!inputPrompt.trim() || isTyping}
                icon={<Send className="w-4 h-4" />}
              >
                Ask
              </Button>
            </form>
          </div>
        </div>

        {/* Right: Side Panel (Alert Classifier & Instructor Security Checklist) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alert Classifier Color Chips Panel */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl p-5 shadow-xl space-y-4">
            <div>
              <span className="micro-label text-accent-cyan">AUTOMATED TRIAGE</span>
              <h4 className="font-heading font-bold text-sm text-text-primary mt-0.5">
                Cryptographic Alert Classifier
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Security incidents are categorized based on mathematical risk to key security and ledger integrity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald">
                <span className="font-bold block text-[11px]">INFO</span>
                <span className="text-[10px] text-text-muted block mt-0.5">Nominal routine check-ins</span>
              </div>
              <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan">
                <span className="font-bold block text-[11px]">LOW</span>
                <span className="text-[10px] text-text-muted block mt-0.5">MFA device registered</span>
              </div>
              <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/30 text-warning">
                <span className="font-bold block text-[11px]">MEDIUM</span>
                <span className="text-[10px] text-text-muted block mt-0.5">Legacy key version used</span>
              </div>
              <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/30 text-danger">
                <span className="font-bold block text-[11px]">HIGH</span>
                <span className="text-[10px] text-text-muted block mt-0.5">HMAC signature mismatch</span>
              </div>
            </div>
          </div>

          {/* Instructor Security Checklist with Progress Bar */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="micro-label text-accent-emerald">AUDIT COMPLIANCE</span>
                <h4 className="font-heading font-bold text-sm text-text-primary mt-0.5">
                  Instructor Security Checklist
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-accent-emerald">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-accent-emerald shadow-[0_0_10px_#00F5A0] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2.5 pt-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-base/70 border border-border-subtle hover:border-accent-emerald/30 cursor-pointer transition-colors text-xs"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.done
                        ? 'bg-accent-emerald border-accent-emerald text-[#08090B]'
                        : 'border-border-subtle bg-bg-elevated'
                    }`}
                  >
                    {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`leading-relaxed ${
                      item.done ? 'line-through text-text-muted' : 'text-text-primary font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
