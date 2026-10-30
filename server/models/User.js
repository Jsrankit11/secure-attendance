import mongoose from 'mongoose';
import { dbStore } from './storage.js';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Instructor', 'Student', 'Security Admin'], default: 'Student' },
    studentId: { type: String, sparse: true },
    avatar: { type: String, default: '/students/vedika_gupta.png' },
    keyFingerprint: { type: String, default: '4A7B : E921 : CC04 : 88DF : 1102 : 9B73 : 33BC : FA19' },
    mfaEnabled: { type: Boolean, default: true },
    joinedDate: { type: String, default: () => new Date().toISOString().slice(0, 10) }
  },
  { timestamps: true }
);

export const MongooseUser = mongoose.models.User || mongoose.model('User', UserSchema);

export const UserModel = {
  find: async (filter = {}) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseUser.find(filter).lean();
      }
    } catch (e) {}
    return dbStore.find('users', (u) => {
      for (const key in filter) {
        if (u[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  findOne: async (filter = {}) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseUser.findOne(filter).lean();
      }
    } catch (e) {}
    return dbStore.findOne('users', (u) => {
      for (const key in filter) {
        if (u[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  findById: async (id) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseUser.findById(id).lean();
      }
    } catch (e) {}
    return dbStore.findOne('users', (u) => u._id === id || u.id === id);
  },

  create: async (userData) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const doc = await MongooseUser.create(userData);
        return doc.toObject();
      }
    } catch (e) {}
    return dbStore.create('users', userData);
  },

  updateOne: async (filter, updates) => {
    try {
      if (mongoose.connection.readyState === 1) {
        return await MongooseUser.findOneAndUpdate(filter, updates, { new: true }).lean();
      }
    } catch (e) {}
    return dbStore.update('users', (u) => {
      for (const key in filter) {
        if (u[key] !== filter[key]) return false;
      }
      return true;
    }, updates);
  }
};

