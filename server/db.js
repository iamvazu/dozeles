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
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
  }
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  return db;
}

export function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
