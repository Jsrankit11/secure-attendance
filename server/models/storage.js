import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/store.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory state synchronized to disk
let state = {
  users: [],
  attendance: [],
  auditLogs: [],
  securityEvents: []
};

// Load existing data if file exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    state = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse store.json:', e);
  }
}

function persist() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist store.json:', e);
  }
}

export const dbStore = {
  get: (collection) => state[collection] || [],

  find: (collection, filterFn = () => true) => {
    return (state[collection] || []).filter(filterFn);
  },

  findOne: (collection, filterFn) => {
    return (state[collection] || []).find(filterFn) || null;
  },

  create: (collection, item) => {
    const doc = {
      _id: item._id || `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    if (!state[collection]) state[collection] = [];
    state[collection].unshift(doc);
    persist();
    return doc;
  },

  update: (collection, filterFn, updates) => {
    const items = state[collection] || [];
    const index = items.findIndex(filterFn);
    if (index >= 0) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      persist();
      return items[index];
    }
    return null;
  },

  delete: (collection, filterFn) => {
    const prevLen = (state[collection] || []).length;
    state[collection] = (state[collection] || []).filter((item) => !filterFn(item));
    persist();
    return prevLen !== state[collection].length;
  },

  reset: (initialData) => {
    state = initialData;
    persist();
  }
};

