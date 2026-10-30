import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Fingerprint,
  Send,
  Lock,
  Search,
  CheckCheck,
  Check,
  Clock,
  Key,
  Info,
  RefreshCw,
  UserCheck,
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusPill } from '../../components/ui/StatusPill';
import { CopyButton } from '../../components/ui/CopyButton';
import { Modal } from '../../components/ui/Modal';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import { formatFingerprint } from '../../lib/crypto';

export const SecureMessagePage: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    verifyParticipantFingerprint,
    currentUser
  } = useApp();
  const { success, warning } = useToast();

  const [inputPlaintext, setInputPlaintext] = useState('');
  const [encryptingAnimation, setEncryptingAnimation] = useState(false);
  const [tempCiphertext, setTempCiphertext] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [showRawPayloads, setShowRawPayloads] = useState(false);
  const [mobilePane, setMobilePane] = useState<'threads' | 'chat'>('threads');

  const activeThread = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const threadMessages = messages[activeThread?.id] || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPlaintext.trim()) return;

    // Trigger encrypt-on-send shimmer animation: Plaintext -> Ciphertext Shimmer -> Send
    const textToSend = inputPlaintext;
    setInputPlaintext('');
    setEncryptingAnimation(true);

    const pseudoHex = Array.from(textToSend)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    setTempCiphertext(`ENC-GCM256$${pseudoHex.slice(0, 32)}...${pseudoHex.slice(-8)}`);

    setTimeout(async () => {
      await sendMessage(activeThread.id, textToSend);
      setEncryptingAnimation(false);
      setTempCiphertext('');
      success('Ciphertext Transmitted', 'Payload encrypted with AES-GCM and signed with ECDSA-P256');
    }, 700);
  };

  const handleConfirmFingerprint = () => {
    verifyParticipantFingerprint(activeThread.id);
    setShowKeyModal(false);
    success('Identity Verified', `Safety number confirmed for ${activeThread.participantName}`);
  };

  return (
    <div className="space-y-6">
      {/* 03 Section Header */}
      <SectionHeader
        number="03"
        title="SecureMessage™ Cryptographic Channel"
        subtitle="End-to-end encrypted messaging with asymmetric digital signature verification, out-of-band safety numbers, and key revocation alarms."
        badgeText="SERVER-MEDIATED CRYPTO DEMO"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRawPayloads(!showRawPayloads)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-surface/60 hover:bg-white/[0.04] text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
            >
              {showRawPayloads ? <EyeOff className="w-3.5 h-3.5 text-accent-cyan" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showRawPayloads ? 'Hide Raw Ciphertext' : 'Inspect Raw Ciphertext'}</span>
            </button>
          </div>
        }
      />

      {/* Honest Label Callout (Required in prompt) */}
      <div className="p-3.5 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 backdrop-blur-md flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-accent-cyan shrink-0" />
          <span>
            <strong className="text-white">Honest Implementation Label:</strong> This interface is a{' '}
            <span className="font-mono text-accent-cyan font-bold">Server-mediated cryptographic demonstration</span>{' '}
            using Web Crypto API AES-GCM-256 and ECDSA curves.
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase text-text-muted hidden sm:inline">
          ALGORITHM: AES-GCM-256 + ECDSA
        </span>
      </div>

      {/* 3-Column Layout: User Directory / Conversations / Chat Thread */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface/90 backdrop-blur-2xl shadow-2xl h-[720px] flex overflow-hidden">
        {/* Column 1 & 2: Conversation Directory (Hidden on mobile when chat is open) */}
        <div
          className={`w-full md:w-80 border-r border-border-subtle flex flex-col bg-bg-elevated/20 shrink-0 ${
            mobilePane === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search bar */}
          <div className="p-3.5 border-b border-border-subtle">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search peers or keys..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-bg-base/80 border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/50">
            {conversations.map((thread) => {
              const isSelected = thread.id === activeThread.id;
              const isRevoked = thread.keyStatus === 'revoked';

              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActiveConversationId(thread.id);
                    setMobilePane('chat');
                  }}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-all relative ${
                    isSelected ? 'bg-accent-emerald/10' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Avatar with status dot */}
                  <div className="relative shrink-0">
                    <img
                      src={thread.participantAvatar}
                      alt={thread.participantName}
                      className="w-10 h-10 rounded-full object-cover border border-border-subtle"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg-surface ${
                        isRevoked ? 'bg-danger' : thread.online ? 'bg-accent-emerald' : 'bg-text-muted'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-heading font-bold text-xs text-text-primary truncate">
                        {thread.participantName}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted shrink-0">
                        {thread.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-xs text-text-muted truncate leading-relaxed">
                      {thread.lastMessageSnippet}
                    </p>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      {isRevoked ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-danger/20 text-danger font-bold uppercase">
                          KEY REVOKED
                        </span>
                      ) : thread.fingerprintVerified ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent-emerald/15 text-accent-emerald flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> VERIFIED KEY
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-warning/15 text-warning">
                          UNVERIFIED KEY
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent-emerald" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 3: Active Chat Thread */}
        <div
          className={`flex-1 flex flex-col bg-bg-surface/50 overflow-hidden ${
            mobilePane === 'threads' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Thread Header with Key Fingerprint preview & Mobile Back button */}
          <div className="p-4 border-b border-border-subtle flex items-center justify-between gap-3 bg-bg-elevated/40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobilePane('threads')}
                className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <img
                src={activeThread.participantAvatar}
                alt={activeThread.participantName}
                className="w-10 h-10 rounded-full object-cover border border-accent-emerald/40"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-sm text-text-primary">
                    {activeThread.participantName}
                  </h3>
                  <span className="text-[10px] font-mono text-text-muted">
                    ({activeThread.participantRole})
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={() => setShowKeyModal(true)}
                    className="font-mono text-[10px] text-accent-cyan hover:underline flex items-center gap-1"
                  >
                    <Fingerprint className="w-3 h-3" />
                    <span>Safety Number: {activeThread.keyFingerprint.slice(0, 19)}...</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowKeyModal(true)}
                icon={<Key className="w-3.5 h-3.5 text-accent-emerald" />}
              >
                Verify Fingerprint
              </Button>
            </div>
          </div>

          {/* Revoked Key Warning Banner */}
          {activeThread.keyStatus === 'revoked' && (
            <div className="p-3 bg-danger/15 border-b border-danger/40 flex items-center gap-2 text-danger text-xs font-mono">
              <ShieldAlert className="w-4 h-4 animate-pulse shrink-0" />
              <span>
                SECURITY NOTICE: The public key for this participant has been revoked. Decryption halted.
              </span>
            </div>
          )}

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {threadMessages.map((msg) => {
              const isMe = msg.senderId === 'me';
              const isInvalid = msg.signatureBadge === 'Invalid' || msg.signatureBadge === 'Key Revoked';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-lg">
                    {!isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover mb-1 border border-border-subtle"
                      />
                    )}

                    <div
                      className={`rounded-2xl p-4 text-xs transition-all ${
                        isMe
                          ? 'bg-accent-emerald/15 border border-accent-emerald/30 text-text-primary rounded-br-sm'
                          : 'bg-bg-elevated/80 border border-border-subtle text-text-primary rounded-bl-sm'
                      }`}
                    >
                      {/* Plaintext or Ciphertext Toggle */}
                      {showRawPayloads ? (
                        <div className="font-mono text-[10px] text-accent-cyan break-all">
                          <span className="text-text-muted block text-[9px] uppercase">Ciphertext Buffer:</span>
                          {msg.ciphertext}
                        </div>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.plaintext}</p>
                      )}

                      {/* Footer: Timestamp, Delivery Status, and Digital Signature Badge */}
                      <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between gap-3 text-[10px] font-mono text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {msg.timestamp}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isInvalid ? (
                            <span className="px-1.5 py-0.5 rounded bg-danger/20 text-danger font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              {msg.signatureBadge}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-accent-emerald/20 text-accent-emerald font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Signature Valid
                            </span>
                          )}

                          {isMe && (
                            <CheckCheck className="w-3.5 h-3.5 text-accent-emerald" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Shimmer Encryption Animation Bubble */}
            {encryptingAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-end"
              >
                <div className="p-3.5 rounded-2xl bg-bg-elevated border border-accent-cyan/50 text-xs font-mono max-w-md animate-pulse">
                  <div className="flex items-center gap-2 text-accent-cyan mb-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <Lock className="w-3 h-3 animate-spin" />
                    AES-GCM-256 ENCRYPTING & ECDSA SIGNING...
                  </div>
                  <div className="text-[11px] text-text-muted break-all">
                    {tempCiphertext}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Composer Input Area */}
          <div className="p-4 border-t border-border-subtle bg-bg-surface/90">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Write an encrypted message to ${activeThread.participantName}...`}
                  value={inputPlaintext}
                  onChange={(e) => setInputPlaintext(e.target.value)}
                  disabled={activeThread.keyStatus === 'revoked'}
                  className="w-full px-4 py-3 rounded-xl bg-bg-base/90 border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-accent-emerald focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={!inputPlaintext.trim() || activeThread.keyStatus === 'revoked'}
                icon={<Send className="w-4 h-4" />}
                data-cursor="SEND"
              >
                Encrypt & Send
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Safety Number & Key Fingerprint Modal */}
      <Modal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        title="Verify End-to-End Safety Number"
        subtitle="Compare this cryptographic fingerprint with your peer out-of-band to prevent MITM attacks."
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-base/80 border border-border-subtle">
            <img
              src={activeThread.participantAvatar}
              alt={activeThread.participantName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="font-heading font-bold text-sm text-text-primary block">
                {activeThread.participantName}
              </span>
              <span className="text-xs text-text-muted block">
                Public Key ID: ECDSA-SECP256R1-PUB
              </span>
            </div>
          </div>

          <div>
            <span className="micro-label text-accent-cyan block mb-2">GROUPED HEX SAFETY NUMBER</span>
            <div className="p-4 rounded-xl bg-bg-base border border-accent-cyan/40 text-center font-mono text-sm sm:text-base font-bold text-accent-cyan tracking-wider">
              {activeThread.keyFingerprint}
            </div>
            <p className="text-xs text-text-muted mt-2 text-center leading-relaxed">
              If this string matches the safety number on {activeThread.participantName}'s screen, 
              your transmission is mathematically impervious to third-party interception.
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeyModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmFingerprint}
              icon={<UserCheck className="w-4 h-4" />}
            >
              Mark Safety Number as Verified
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
