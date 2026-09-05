import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { loadDb, saveDb, newId } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dozeles.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

const db = loadDb();

// ---------- email (optional) ----------
let mailer = null;
if (process.env.SMTP_HOST) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}
async function notify(subject, text) {
  if (!mailer) return;
  try {
    await mailer.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL || ADMIN_EMAIL,
      subject,
      text,
    });
  } catch (e) {
    console.error('Email notification failed:', e.message);
  }
}

async function notifyUser(to, subject, html) {
  if (!mailer || !to) return;
  try {
    await mailer.sendMail({
      from: `"Dozeles Professional Cleaning" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.error('User email notification failed:', e.message);
  }
}

// ---------- auth ----------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// ---------- public content API ----------
app.get('/api/content', (req, res) => {
  const { bookings, messages, subscribers, users, ...content } = db;
  res.json(content);
});

app.get('/api/pricing', (req, res) => res.json(db.pricing || {}));
app.post('/api/pricing', requireAdmin, (req, res) => {
  db.pricing = req.body;
  saveDb();
  res.json({ success: true });
});
app.get('/api/reviews', (req, res) => res.json(db.reviews));

// ---------- Quote & Project helpers ----------
function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `DOZ-${year}-${randomNum}`;
}

function buildDefaultQuote({ booking = null, custom = {} }) {
  const today = new Date();
  const validDate = new Date();
  validDate.setDate(today.getDate() + 30);

  const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const clientName = custom.clientName || (booking ? booking.name : 'Client / Company Name');
  const contactName = custom.contactName || (booking ? booking.name : 'Contact Name');
  const email = custom.email || (booking ? booking.email : '');
  const phone = custom.phone || (booking ? booking.phone : '');
  const siteAddress = custom.siteAddress || (booking ? booking.address : 'Street Address, City, State ZIP');
  const serviceName = custom.serviceName || (booking ? booking.service : 'Commercial & Office Cleaning');
  const facilityType = custom.facilityType || (booking?.notes?.toLowerCase().includes('office') ? 'Commercial Office' : 'Commercial Facility');
  const squareFootage = custom.squareFootage || (booking?.notes?.match(/\d+[\d,]*\s*(sq|sqft|sq\.?\s*ft)/i)?.[0] || '3,500 sq. ft.');
  const estimatedPrice = Number(booking?.price) > 0 ? Number(booking.price) : 450;

  return {
    id: newId(),
    quoteNumber: generateQuoteNumber(),
    bookingId: booking ? booking.id : null,
    date: formatDate(today),
    validUntil: formatDate(validDate),
    status: 'draft',
    preparedFor: {
      clientName,
      contactName,
      email,
      phone,
      siteAddress,
      facilityType,
      squareFootage,
    },
    serviceProvider: {
      companyName: 'Dozeles Professional Cleaning',
      specialization: 'Commercial & Janitorial Facility Cleaning',
      email: 'dozelescleaning@gmail.com',
      phone: '650-290-0280',
      website: 'www.dozeles.com',
    },
    programTitle: `${serviceName.toUpperCase()} SCOPE`,
    items: [
      {
        id: '1',
        serviceName: `${serviceName} - Core Service`,
        details: 'Complete sanitization, trash disposal, restroom care, breakrooms, and high-frequency surface detailing.',
        frequency: 'Regular / Scheduled',
        amount: estimatedPrice
      },
      {
        id: '2',
        serviceName: 'HEPA Floor & Surface Care',
        details: 'Commercial vacuuming, microfiber damp mopping, entrance mat detailing.',
        frequency: 'Every Service',
        amount: 150
      },
      {
        id: '3',
        serviceName: 'Touchpoint Disinfection',
        details: 'Hospital-grade EPA registered disinfectant on all doors, handles, switches, and shared spaces.',
        frequency: 'Every Service',
        amount: 80
      },
      {
        id: '4',
        serviceName: 'Glass & Partition Detailing',
        details: 'Interior glass partitions, front entry doors spotless and streak-free.',
        frequency: 'Weekly',
        amount: 60
      }
    ],
    lineItems: [
      { label: 'Core Service Program', amount: estimatedPrice },
      { label: 'Eco-Friendly Supplies & Equipment Included', amount: 0 }
    ],
    totalLabel: 'Total Investment',
    totalAmount: estimatedPrice,
    optionalProgram: {
      title: 'Quarterly Deep Carpet Extraction & Machine Buffing',
      tag: 'OPTIONAL / SCHEDULED',
      tasks: [
        'Commercial hot-water extraction on all carpeted high-traffic corridors.',
        'High-dusting of exposed HVAC ducts, ceiling fixtures, and diffusers.',
        'Machine scrubbing and protective polish of vinyl/hard flooring.'
      ],
      rate: '$350.00 – $650.00 / session'
    },
    terms: {
      siteAccess: 'Client to provide keycard/lockbox codes or designate on-site contact for entry.',
      equipmentSupplies: 'Dozeles provides all commercial HEPA equipment, microfiber color-coded cloths, and green-seal certified chemicals.',
      serviceHours: 'Agreed shifts (after-hours 6:00 PM or custom day schedule).',
      billing: 'Net 30 billing terms. Invoices issued monthly.',
      pricingAdjustment: 'Rates subject to review if facility square footage or service scope changes.'
    },
    certifications: {
      smallBusinessCert: '2041212',
      dirReg: 'JS-LR-1001274287',
      wbe: true,
      licensedBondedInsured: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ---------- bookings ----------
app.post('/api/bookings', async (req, res) => {
  const { name, email, phone, service, date, time, address, notes } = req.body || {};
  if (!name || !phone || !service || !date) {
    return res.status(400).json({ error: 'name, phone, service and date are required' });
  }
  const booking = {
    id: newId(),
    name, email: email || '', phone, service, date, time: time || '',
    address: address || '', notes: notes || '',
    status: 'pending',
    price: 0,
    internalNotes: [],
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);

  // Automatically create a Service Quote template for this booking!
  const autoQuote = buildDefaultQuote({ booking });
  if (!db.quotes) db.quotes = [];
  db.quotes.push(autoQuote);
  booking.quoteId = autoQuote.id;

  saveDb();
  notify(`New booking request: ${service}`,
    `Name: ${name}\nPhone: ${phone}\nEmail: ${email || '-'}\nService: ${service}\nDate: ${date} ${time || ''}\nAddress: ${address || '-'}\nNotes: ${notes || '-'}`);
    
  if (email) {
    notifyUser(email, `Your Booking Request: ${service} - Dozeles Cleaning`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0E5FD8;">Thank you for your request, ${name}!</h2>
        <p>We have received your booking request for <strong>${service}</strong>.</p>
        <p>Our team will review your details and contact you shortly to confirm your booking and provide a formal service quote (Quote #${autoQuote.quoteNumber}).</p>
        <div style="background: #F3F5F2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Summary</h3>
          <p style="margin: 5px 0;"><strong>Service:</strong> ${service}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date} ${time || ''}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${address || 'N/A'}</p>
        </div>
        <p>Best regards,<br><strong>Dozeles Professional Cleaning</strong></p>
      </div>
    `);
  }
  
  res.status(201).json({ ok: true, id: booking.id, quoteId: autoQuote.id });
});

// ---------- contact + newsletter ----------
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }
  const msg = { id: newId(), name, email, phone: phone || '', message, read: false, createdAt: new Date().toISOString() };
  db.messages.push(msg);
  saveDb();
  notify(`New contact message from ${name}`, `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\n\n${message}`);
  
  if (email) {
    notifyUser(email, `We received your message - Dozeles Cleaning`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0E5FD8;">Hello ${name},</h2>
        <p>Thank you for reaching out to Dozeles Professional Cleaning.</p>
        <p>We have successfully received your message and our team will get back to you as soon as possible.</p>
        <div style="background: #F3F5F2; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic;">
          "${message}"
        </div>
        <p>Best regards,<br><strong>Dozeles Professional Cleaning</strong></p>
      </div>
    `);
  }

  res.status(201).json({ ok: true });
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: 'Valid email required' });
  if (!db.subscribers.find((s) => s.email === email)) {
    db.subscribers.push({ email, createdAt: new Date().toISOString() });
    saveDb();
  }
  res.status(201).json({ ok: true });
});

// ---------- admin / staff API ----------
app.get('/api/admin/bookings', requireAuth, (req, res) => res.json([...db.bookings].reverse()));
app.patch('/api/admin/bookings/:id', requireAuth, (req, res) => {
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (req.body.status) b.status = req.body.status;
  if (req.body.price !== undefined) b.price = Number(req.body.price);
  
  if (req.body.addNote) {
    if (!b.internalNotes) b.internalNotes = [];
    b.internalNotes.push({
      id: newId(),
      text: req.body.addNote,
      author: req.user.name,
      createdAt: new Date().toISOString()
    });
  }
  
  saveDb();
  res.json(b);
});

app.post('/api/admin/bookings/:id/upload', requireAuth, upload.single('file'), (req, res) => {
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  
  if (!b.attachments) b.attachments = [];
  b.attachments.push({
    id: newId(),
    url: '/uploads/' + req.file.filename,
    originalName: req.file.originalname,
    author: req.user.name,
    createdAt: new Date().toISOString()
  });
  
  saveDb();
  res.json(b);
});

app.post('/api/admin/bookings/:id/invoice', requireAdmin, async (req, res) => {
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (!b.email) return res.status(400).json({ error: 'Customer has no email address' });
  
  const taxRate = 0.0825;
  const subtotal = b.price || 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const dueDateStr = new Date().toLocaleDateString();

  const invoiceHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0E5FD8; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #0E5FD8; margin: 0;">INVOICE</h1>
        <div style="text-align: right;">
          <strong>Dozeles Professional Cleaning</strong><br>
          dozelescleaning@gmail.com<br>
          (650) 290-0280
        </div>
      </div>
      <div style="margin-bottom: 30px;">
        <p><strong>Billed To:</strong><br>
        ${b.name}<br>
        ${b.address || ''}</p>
        <p><strong>Invoice Number:</strong> INV-${b.id.toUpperCase()}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
        <strong>Due Date:</strong> ${dueDateStr} (Due upon receipt)</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #F3F5F2; text-align: left;">
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Description</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${b.service}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div style="text-align: right; margin-bottom: 30px;">
        <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Tax (8.25%):</strong> $${tax.toFixed(2)}</p>
        <p style="margin: 5px 0; font-size: 1.2em;"><strong>Total Due:</strong> <span style="color: #0E5FD8;">$${total.toFixed(2)}</span></p>
      </div>
      <div style="text-align: center; margin-top: 40px; color: #777; font-size: 0.9em;">
        Thank you for your business!
      </div>
    </div>
  `;
  
  await notifyUser(b.email, `Invoice INV-${b.id.toUpperCase()} from Dozeles Cleaning`, invoiceHtml);
  b.invoiceSentAt = new Date().toISOString();
  saveDb();
  res.json({ ok: true, message: 'Invoice sent successfully', booking: b });
});

app.delete('/api/admin/bookings/:id', requireAdmin, (req, res) => {
  db.bookings = db.bookings.filter((x) => x.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// ---------- Quotes API ----------
app.get('/api/admin/quotes', requireAuth, (req, res) => {
  if (!db.quotes) db.quotes = [];
  res.json([...db.quotes].reverse());
});

app.get('/api/admin/quotes/:id', requireAuth, (req, res) => {
  if (!db.quotes) db.quotes = [];
  const q = db.quotes.find(x => x.id === req.params.id);
  if (!q) return res.status(404).json({ error: 'Quote not found' });
  res.json(q);
});

app.post('/api/admin/quotes', requireAdmin, (req, res) => {
  const quote = buildDefaultQuote({ custom: req.body });
  if (req.body.items) quote.items = req.body.items;
  if (req.body.totalAmount) quote.totalAmount = req.body.totalAmount;
  if (req.body.preparedFor) quote.preparedFor = { ...quote.preparedFor, ...req.body.preparedFor };
  if (req.body.terms) quote.terms = { ...quote.terms, ...req.body.terms };
  if (req.body.optionalProgram) quote.optionalProgram = { ...quote.optionalProgram, ...req.body.optionalProgram };
  if (req.body.programTitle) quote.programTitle = req.body.programTitle;

  if (!db.quotes) db.quotes = [];
  db.quotes.push(quote);
  saveDb();
  res.status(201).json(quote);
});

app.post('/api/admin/quotes/from-booking/:bookingId', requireAdmin, (req, res) => {
  const b = db.bookings.find(x => x.id === req.params.bookingId);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  
  const quote = buildDefaultQuote({ booking: b, custom: req.body });
  if (!db.quotes) db.quotes = [];
  db.quotes.push(quote);
  b.quoteId = quote.id;
  saveDb();
  res.status(201).json(quote);
});

app.put('/api/admin/quotes/:id', requireAdmin, (req, res) => {
  if (!db.quotes) db.quotes = [];
  const idx = db.quotes.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Quote not found' });
  
  db.quotes[idx] = {
    ...db.quotes[idx],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  saveDb();
  res.json(db.quotes[idx]);
});

app.delete('/api/admin/quotes/:id', requireAdmin, (req, res) => {
  if (!db.quotes) db.quotes = [];
  db.quotes = db.quotes.filter(x => x.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// ---------- Projects API (For Admins & Field Janitors) ----------
app.get('/api/admin/projects', requireAuth, (req, res) => {
  if (!db.projects) db.projects = [];
  // If Janitor, they can view all projects or their assigned projects
  res.json([...db.projects].reverse());
});

app.post('/api/admin/projects', requireAdmin, (req, res) => {
  const { title, clientName, address, facilityType, frequency, startDate, assignedJanitors, notes } = req.body;
  if (!title || !clientName) return res.status(400).json({ error: 'Title and Client Name are required' });
  
  const project = {
    id: newId(),
    title,
    clientName,
    address: address || '',
    facilityType: facilityType || 'Commercial Office',
    status: 'in-progress',
    frequency: frequency || '5x / week',
    startDate: startDate || new Date().toISOString().split('T')[0],
    assignedJanitors: Array.isArray(assignedJanitors) ? assignedJanitors : (assignedJanitors ? [assignedJanitors] : []),
    checklist: [
      { id: '1', task: 'Restrooms disinfected and restocked', completed: false },
      { id: '2', task: 'Trash and recyclables removed', completed: false },
      { id: '3', task: 'HEPA vacuum carpets & damp mop hard floors', completed: false },
      { id: '4', task: 'High-touch disinfection (handles, switches, desks)', completed: false },
      { id: '5', task: 'Entrance and lobby glass polished streak-free', completed: false }
    ],
    photos: [],
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.projects) db.projects = [];
  db.projects.push(project);
  saveDb();
  res.status(201).json(project);
});

app.put('/api/admin/projects/:id', requireAuth, (req, res) => {
  if (!db.projects) db.projects = [];
  const idx = db.projects.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found' });
  
  db.projects[idx] = {
    ...db.projects[idx],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  saveDb();
  res.json(db.projects[idx]);
});

// Photo upload for projects (Admin and Janitor)
app.post('/api/admin/projects/:id/photos', requireAuth, upload.single('photo'), (req, res) => {
  if (!db.projects) db.projects = [];
  const proj = db.projects.find(x => x.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  if (!req.file) return res.status(400).json({ error: 'No photo file provided' });

  const { caption, type } = req.body;
  if (!proj.photos) proj.photos = [];

  const photoEntry = {
    id: newId(),
    url: '/uploads/' + req.file.filename,
    caption: caption || '',
    type: type || 'progress', // 'before' | 'after' | 'progress'
    author: req.user.name || 'Staff',
    authorRole: req.user.role || 'janitor',
    uploadedAt: new Date().toISOString()
  };

  proj.photos.push(photoEntry);
  proj.updatedAt = new Date().toISOString();
  saveDb();
  res.status(201).json({ ok: true, photo: photoEntry, project: proj });
});

app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
  if (!db.projects) db.projects = [];
  db.projects = db.projects.filter(x => x.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

app.get('/api/admin/messages', requireAuth, (req, res) => res.json([...db.messages].reverse()));
app.patch('/api/admin/messages/:id', requireAuth, (req, res) => {
  const m = db.messages.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  if (typeof req.body.read === 'boolean') m.read = req.body.read;
  saveDb();
  res.json(m);
});

app.get('/api/admin/subscribers', requireAdmin, (req, res) => res.json(db.subscribers));

// Users CRUD (Supports Admin, Janitor, Staff)
app.get('/api/admin/users', requireAdmin, (req, res) => {
  res.json(db.users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role || 'staff', createdAt: u.createdAt })));
});
app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  
  const validRoles = ['admin', 'janitor', 'staff'];
  const assignedRole = validRoles.includes(role) ? role : 'janitor';

  const user = { id: newId(), email, password, name, role: assignedRole, createdAt: new Date().toISOString() };
  db.users.push(user);
  saveDb();
  res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt });
});
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.users = db.users.filter((u) => u.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// Content editing: replace a whole section (site, home, about, services, government, faqs, ...)
const EDITABLE = ['site', 'home', 'whyUs', 'services', 'servicesPage', 'about', 'stats', 'government', 'faqs', 'beforeAfter', 'gallery'];
app.put('/api/admin/content/:section', requireAdmin, (req, res) => {
  const { section } = req.params;
  if (!EDITABLE.includes(section)) return res.status(400).json({ error: `Section must be one of: ${EDITABLE.join(', ')}` });
  db[section] = req.body;
  saveDb();
  res.json({ ok: true, section });
});

app.put('/api/admin/pricing', requireAdmin, (req, res) => {
  db.pricing = { ...db.pricing, ...req.body };
  saveDb();
  res.json({ ok: true, pricing: db.pricing });
});

// Reviews CRUD
app.post('/api/admin/reviews', requireAdmin, (req, res) => {
  const { name, text, rating, image } = req.body || {};
  if (!name || !text) return res.status(400).json({ error: 'name and text required' });
  const review = { id: newId(), name, text, rating: rating || 5, image: image || '' };
  db.reviews.push(review);
  saveDb();
  res.status(201).json(review);
});
app.put('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const i = db.reviews.findIndex((r) => r.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found' });
  db.reviews[i] = { ...db.reviews[i], ...req.body, id: req.params.id };
  saveDb();
  res.json(db.reviews[i]);
});
app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  db.reviews = db.reviews.filter((r) => r.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// ---------- serve built frontend (production) ----------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => console.log(`Dozeles server running on http://localhost:${PORT}`));
