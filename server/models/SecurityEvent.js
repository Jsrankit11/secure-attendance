import mongoose from 'mongoose';
import { dbStore } from './storage.js';

const SecurityEventSchema = new mongoose.Schema(
  {
    timestamp: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['TAMPER_DETECTED', 'HMAC_VERIFIED', 'KEY_ROTATION', 'AUTH_FAILURE', 'SIG_INVALID', 'LOGIN_SUCCESS', 'ATTENDANCE_MARKED'],
      required: true
    },
    severity: { type: String, enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'INFO' },
    description: { type: String, required: true },
    resourceId: { type: String, default: '' },
    actor: { type: String, default: 'System Security Engine' }
  },
  { timestamps: true }
);

export const MongooseSecurityEvent = mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', SecurityEventSchema);

export const SecurityEventModel = {
  find: async (filter = {}) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseSecurityEvent.find(filter).sort({ createdAt: -1 }).lean();
      }
    } catch (e) {}
    return dbStore.find('securityEvents', (ev) => {
      for (const key in filter) {
        if (ev[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  create: async (data) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongooseSecurityEvent.create(data);
        return doc.toObject();
      }
    } catch (e) {}
    return dbStore.create('securityEvents', data);
  }
};

