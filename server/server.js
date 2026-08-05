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
  saveDb();
  notify(`New booking request: ${service}`,
    `Name: ${name}\nPhone: ${phone}\nEmail: ${email || '-'}\nService: ${service}\nDate: ${date} ${time || ''}\nAddress: ${address || '-'}\nNotes: ${notes || '-'}`);
    
  if (email) {
    notifyUser(email, `Your Booking Request: ${service} - Dozeles Cleaning`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0E5FD8;">Thank you for your request, ${name}!</h2>
        <p>We have received your booking request for <strong>${service}</strong>.</p>
        <p>Our team will review your details and contact you shortly to confirm your booking and provide a quote.</p>
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
  
  res.status(201).json({ ok: true, id: booking.id });
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

// ---------- admin API ----------
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

app.post('/api/admin/bookings/:id/invoice', requireAuth, async (req, res) => {
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
          contact@dozeles.com<br>
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
        Thank you for your business! Please remit payment upon receipt.
      </div>
    </div>
  `;
  
  await notifyUser(b.email, `Invoice INV-${b.id.toUpperCase()} from Dozeles Cleaning`, invoiceHtml);
  b.invoiceSentAt = new Date().toISOString();
  saveDb();
  res.json({ ok: true, message: 'Invoice sent successfully', booking: b });
});

app.delete('/api/admin/bookings/:id', requireAuth, (req, res) => {
  db.bookings = db.bookings.filter((x) => x.id !== req.params.id);
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

// Users CRUD
app.get('/api/admin/users', requireAdmin, (req, res) => {
  res.json(db.users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt })));
});
app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  
  const user = { id: newId(), email, password, name, role: role === 'admin' ? 'admin' : 'staff', createdAt: new Date().toISOString() };
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
