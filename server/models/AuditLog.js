import mongoose from 'mongoose';
import { dbStore } from './storage.js';

const AuditLogSchema = new mongoose.Schema(
  {
    blockNumber: { type: Number, required: true },
    timestamp: { type: String, required: true },
    actor: {
      name: { type: String, required: true },
      id: { type: String, required: true },
      role: { type: String, required: true },
      ip: { type: String, default: '127.0.0.1' }
    },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    severity: { type: String, enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'INFO' },
    prevHash: { type: String, required: true },
    currentHash: { type: String, required: true },
    tampered: { type: Boolean, default: false },
    details: { type: String, default: '' }
  },
  { timestamps: true }
);

export const MongooseAuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

export const AuditLogModel = {
  find: async (filter = {}) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseAuditLog.find(filter).sort({ blockNumber: -1 }).lean();
      }
    } catch (e) {}
    return dbStore.find('auditLogs', (log) => {
      for (const key in filter) {
        if (log[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  create: async (data) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongooseAuditLog.create(data);
        return doc.toObject();
      }
    } catch (e) {}
    return dbStore.create('auditLogs', data);
  }
};

