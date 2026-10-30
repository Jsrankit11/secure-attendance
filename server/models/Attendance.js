import mongoose from 'mongoose';
import { dbStore } from './storage.js';

const AttendanceSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    sessionTitle: { type: String, required: true },
    className: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    avatar: { type: String, default: '/students/vedika_gupta.png' },
    date: { type: String, required: true },
    timestamp: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
    canonicalString: { type: String, required: true },
    hmacTag: { type: String, required: true },
    keyVersion: { type: String, default: 'v2.4-prod' },
    isTampered: { type: Boolean, default: false },
    tamperReason: { type: String },
    integrityStatus: { type: String, enum: ['VERIFIED', 'WARNING', 'FAILED'], default: 'VERIFIED' },
    auditChainBlock: { type: Number, default: 1040 },
    verificationMethod: { type: String, enum: ['FACE_AI', 'MANUAL', 'SYSTEM'], default: 'MANUAL' },
    faceConfidence: { type: Number },
    // Sensitive private student notes protected via AES-256-GCM
    encryptedNotes: { type: String, default: '' },
    notesIv: { type: String, default: '' },
    notesAuthTag: { type: String, default: '' },
    // Complete audit history of modifications & tamper attempts
    history: { type: Array, default: [] }
  },
  { timestamps: true }
);

export const MongooseAttendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

export const AttendanceModel = {
  find: async (filter = {}) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseAttendance.find(filter).sort({ createdAt: -1 }).lean();
      }
    } catch (e) {}
    return dbStore.find('attendance', (rec) => {
      for (const key in filter) {
        if (rec[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  findOne: async (filter = {}) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseAttendance.findOne(filter).lean();
      }
    } catch (e) {}
    return dbStore.findOne('attendance', (rec) => {
      for (const key in filter) {
        if (rec[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  findById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseAttendance.findById(id).lean();
      }
    } catch (e) {}
    return dbStore.findOne('attendance', (rec) => rec._id === id || rec.id === id);
  },

  create: async (data) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongooseAttendance.create(data);
        return doc.toObject();
      }
    } catch (e) {}
    return dbStore.create('attendance', data);
  },

  updateOne: async (filter, updates) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseAttendance.findOneAndUpdate(filter, updates, { new: true }).lean();
      }
    } catch (e) {}
    return dbStore.update('attendance', (rec) => {
      for (const key in filter) {
        if (rec[key] !== filter[key]) return false;
      }
      return true;
    }, updates);
  },

  deleteOne: async (filter) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseAttendance.deleteOne(filter);
      }
    } catch (e) {}
    return dbStore.delete('attendance', (rec) => {
      for (const key in filter) {
        if (rec[key] !== filter[key]) return false;
      }
      return true;
    });
  }
};

