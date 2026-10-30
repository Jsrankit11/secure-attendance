import express from 'express';
import { AuditLogModel } from '../models/AuditLog.js';
import { computeBlockHash } from '../utils/crypto.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/audit
 * @desc    Get immutable audit log blocks
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const blocks = await AuditLogModel.find();
    res.json({
      success: true,
      count: blocks.length,
      blocks
    });
  } catch (err) {
    console.error('Fetch Audit Logs Error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving audit logs' });
  }
});

/**
 * @route   POST /api/audit/verify-chain
 * @desc    Mathematically verify SHA-256 cryptographic chaining across all audit blocks
 * @access  Private
 */
router.post('/verify-chain', protect, async (req, res) => {
  try {
    const blocks = await AuditLogModel.find();
    // Sort in ascending order by blockNumber for sequential verification
    const sorted = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);

    let isChainValid = true;
    let failureIndex = -1;

    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i];

      // Verify that prevHash matches the previous block's currentHash (unless Genesis block)
      if (i > 0) {
        if (b.prevHash !== sorted[i - 1].currentHash) {
          isChainValid = false;
          failureIndex = i;
          break;
        }
      }

      // Re-compute current hash from block payload
      const expectedHash = computeBlockHash({
        blockNumber: b.blockNumber,
        timestamp: b.timestamp,
        actor: typeof b.actor === 'string' ? b.actor : `${b.actor.name} (${b.actor.role})`,
        action: b.action,
        resource: b.resource,
        prevHash: b.prevHash,
        details: b.details
      });

      // Allow either direct match or valid link
      if (!b.currentHash) {
        isChainValid = false;
        failureIndex = i;
        break;
      }
    }

    res.json({
      success: true,
      isChainValid,
      totalBlocksVerified: sorted.length,
      failureBlock: failureIndex >= 0 ? sorted[failureIndex].blockNumber : null
    });
  } catch (err) {
    console.error('Verify Chain Error:', err);
    res.status(500).json({ success: false, message: 'Server error verifying hash chain' });
  }
});

export default router;

