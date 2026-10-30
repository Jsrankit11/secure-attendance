import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const HMAC_SECRET = process.env.HMAC_SECRET_KEY || 'CS_K1_PRODUCTION_SECRET_98fbc10';
const AES_KEY_HEX = process.env.AES_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Convert 64-char hex key to 32-byte Buffer
const AES_KEY = Buffer.from(AES_KEY_HEX.slice(0, 64), 'hex');

/**
 * Hash password with bcrypt (salt rounds = 12)
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(plainPassword, salt);
}

/**
 * Compare password with bcrypt
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
export const verifyPassword = comparePassword;


/**
 * Format canonical RFC attendance string:
 * CS-ATTENDANCE-V1|SESSION:{sessionId}|STUDENT:{studentId}|TIME:{timestamp}|STATUS:{status}|INSTRUCTOR:{instructorId}
 */
export function canonicalizeAttendanceRecord({ sessionId, studentId, timestamp, status, instructorId = 'INST-007' }) {
  return `CS-ATTENDANCE-V1|SESSION:${sessionId}|STUDENT:${studentId}|TIME:${timestamp}|STATUS:${status}|INSTRUCTOR:${instructorId}`;
}

/**
 * Compute HMAC-SHA256 hex signature
 */
export function computeHmacSha256(canonicalString, secret = HMAC_SECRET) {
  return crypto.createHmac('sha256', secret).update(canonicalString).digest('hex');
}

/**
 * Verify HMAC-SHA256 signature timing-safely
 */
export function verifyHmacSha256(canonicalString, expectedTag, secret = HMAC_SECRET) {
  const calculated = computeHmacSha256(canonicalString, secret);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculated, 'hex'),
      Buffer.from(expectedTag, 'hex')
    );
  } catch (e) {
    return false;
  }
}

/**
 * Encrypt sensitive attendance notes or payload using AES-256-GCM
 * Returns { ciphertext, iv, authTag }
 */
export function encryptAesGcm(plainText) {
  if (!plainText) return { ciphertext: '', iv: '', authTag: '' };

  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag
  };
}

/**
 * Decrypt sensitive attendance notes or payload using AES-256-GCM
 */
export function decryptAesGcm(ciphertext, ivHex, authTagHex) {
  if (!ciphertext || !ivHex || !authTagHex) return '';

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('AES-256-GCM Decryption failed / Auth tag mismatch:', err.message);
    return '[ENCRYPTED DATA CORRUPTED]';
  }
}

/**
 * Calculate SHA-256 hash for immutable audit blocks
 */
export function computeBlockHash(blockData) {
  const payload = JSON.stringify({
    blockNumber: blockData.blockNumber,
    timestamp: blockData.timestamp,
    actor: blockData.actor,
    action: blockData.action,
    resource: blockData.resource,
    prevHash: blockData.prevHash,
    details: blockData.details
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}
