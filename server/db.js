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

  if (!db.quotes) db.quotes = [];
  if (!db.projects) db.projects = [];
  if (!db.customers) db.customers = [];
  if (!db.leads) db.leads = [];

  if (db.customers.length === 0) {
    const cust1Id = newId();
    db.customers.push({
      id: cust1Id,
      companyName: 'Skyline Financial Group',
      contactName: 'David Clark',
      email: 'david@skylinefin.com',
      phone: '650-555-0192',
      address: '100 Pine St, Suite 1400, San Francisco, CA',
      facilityType: 'Commercial Financial Office',
      squareFootage: '4,500 sq.ft.',
      contractValue: 1850,
      billingFrequency: 'Monthly (Net 30)',
      status: 'active',
      tags: ['Commercial', 'WBE RFP', 'High Value'],
      notes: 'Keycard access in lockbox. Daily evening service after 6:00 PM. High-traffic lobby.',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    });

    const cust2Id = newId();
    db.customers.push({
      id: cust2Id,
      companyName: 'Apex Health Clinic',
      contactName: 'Dr. Elena Rostova',
      email: 'elena@apexhealthbay.com',
      phone: '408-555-0344',
      address: '450 Sutter St, San Jose, CA',
      facilityType: 'Medical & Dental Clinic',
      squareFootage: '3,800 sq.ft.',
      contractValue: 2400,
      billingFrequency: 'Monthly (ACH Auto-Pay)',
      status: 'active',
      tags: ['Medical Grade', 'Sanitization', 'EPA Certified'],
      notes: 'Requires EPA registered disinfectant on all exam tables and waiting area surfaces.',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Link existing projects to cust1
    if (db.projects.length > 0 && !db.projects[0].customerId) {
      db.projects[0].customerId = cust1Id;
    }
    saveDb();
  }

  if (db.leads.length === 0) {
    db.leads.push(
      {
        id: newId(),
        companyName: 'Silicon Valley BioTech Labs',
        contactName: 'Sarah Jenkins',
        email: 'sjenkins@svbiotech.io',
        phone: '408-555-7821',
        facilityType: 'Medical / Biotech Lab',
        squareFootage: '6,200 sq.ft.',
        estimatedMonthlyValue: 3200,
        source: 'Google Search (LSA)',
        stage: 'walkthrough',
        priority: 'high',
        notes: 'Needs HEPA filtration & bio-waste cleanrooms. Scheduled on-site walkthrough for next Tuesday.',
        assignedTo: 'Vazu Admin',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: newId(),
        companyName: 'Oakland Logistics Center',
        contactName: 'Marcus Vance',
        email: 'marcus@oaklandlogistics.net',
        phone: '510-555-8930',
        facilityType: 'Warehouse & Logistics Terminal',
        squareFootage: '12,500 sq.ft.',
        estimatedMonthlyValue: 4500,
        source: 'Govt RFP (Cal eProcure)',
        stage: 'proposal_sent',
        priority: 'high',
        notes: 'Submitted formal Service Quote with DIR & WBE certifications. Awaiting Board vote.',
        assignedTo: 'Vazu Admin',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: newId(),
        companyName: 'Palo Alto Software Works',
        contactName: 'Jason Lee',
        email: 'jason@pasoftware.co',
        phone: '650-555-4421',
        facilityType: 'Tech Office / Headquarters',
        squareFootage: '5,000 sq.ft.',
        estimatedMonthlyValue: 2100,
        source: 'Referral',
        stage: 'contacted',
        priority: 'medium',
        notes: 'Requested rate card for 3x/week evening janitorial service.',
        assignedTo: 'Vazu Admin',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
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
