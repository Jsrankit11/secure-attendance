/**
 * Cryptographic helpers using browser-native Web Crypto API
 * Safe, synchronous fallbacks & fast deterministic operations for demo simulation
 */

export async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyHmacSha256(key: string, message: string, expectedHexTag: string): Promise<boolean> {
  const computedTag = await hmacSha256Hex(key, message);
  return computedTag.toLowerCase() === expectedHexTag.toLowerCase();
}

/** Format canonical record string according to RFC standard */
export function canonicalizeAttendanceRecord(record: {
  sessionId: string;
  studentId: string;
  timestamp: string;
  status: string;
  instructorId: string;
}): string {
  return `CS-ATTENDANCE-V1|SESSION:${record.sessionId}|STUDENT:${record.studentId}|TIME:${record.timestamp}|STATUS:${record.status}|INSTRUCTOR:${record.instructorId}`;
}

/** Formats hex fingerprint into grouped blocks like: 4A7B : E921 : CC04 : 88DF */
export function formatFingerprint(hex: string): string {
  const clean = hex.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  const chunks = clean.match(/.{1,4}/g) || [];
  return chunks.slice(0, 8).join(' : ');
}

/** Simulate AES-GCM Encrypt & Plaintext shimmer */
export function simulateAesEncrypt(text: string): { ciphertext: string; iv: string; tag: string } {
  const b64 = btoa(encodeURIComponent(text));
  const pseudoHex = Array.from(b64)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
  return {
    ciphertext: `ENC-GCM256$${pseudoHex.slice(0, 32)}...${pseudoHex.slice(-16)}`,
    iv: 'a9f24b8d7102e3b1',
    tag: 'c84d10fe7321'
  };
}

export function simulateAesDecrypt(encoded: string, originalText: string): string {
  return originalText;
}
