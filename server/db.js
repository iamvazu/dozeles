// Simple JSON-file data store. Zero native dependencies, works everywhere.
// For higher traffic later, swap this for PostgreSQL/MongoDB without changing routes much.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');

let db = null;

export function loadDb() {
  if (db) return db;
  if (!fs.existsSync(DB_FILE)) {
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    seed.bookings = [];
    seed.messages = [];
    seed.subscribers = [];
    seed.users = [];
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
  }
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  
  if (!db.users) db.users = [];
  if (db.users.length === 0) {
    db.users.push({
      id: newId(),
      email: process.env.ADMIN_EMAIL || 'admin@dozeles.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Master Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    saveDb();
  }

  if (!db.pricing) {
    db.pricing = {
      RES: { BASE: 89, PER_BED: 28, PER_BATH: 32, MIN: 129 },
      COM_FACILITIES: [
        { id: 'office', label: 'Office', rate: 0.22, icon: 'building' },
        { id: 'retail', label: 'Retail / showroom', rate: 0.2, icon: 'store' },
        { id: 'medical', label: 'Medical / dental', rate: 0.29, icon: 'shield' },
        { id: 'warehouse', label: 'Warehouse / industrial', rate: 0.12, icon: 'truck' },
        { id: 'government', label: 'School / government', rate: 0.24, icon: 'landmark' },
        { id: 'restaurant', label: 'Restaurant / food service', rate: 0.31, icon: 'spray' },
      ],
      COM_MIN_MONTHLY: 380,
    };
    saveDb();
  }

  
  return db;
}

export function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
