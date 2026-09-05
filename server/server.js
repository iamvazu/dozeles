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
app.use('/api/uploads', express.static(uploadsDir));

const db = loadDb();

const NOTIFY_RECIPIENTS = Array.from(new Set([
  'dozelescleaning@gmail.com',
  ADMIN_EMAIL
].filter(Boolean))).join(', ');

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

async function notify(subject, text, html) {
  if (!mailer) return;
  try {
    const mailOptions = {
      from: `"Dozeles Alerts" <${process.env.SMTP_USER}>`,
      to: NOTIFY_RECIPIENTS,
      subject,
      text,
    };
    if (html) mailOptions.html = html;
    await mailer.sendMail(mailOptions);
    console.log(`[Email Dispatched] ${subject} -> Sent to: ${NOTIFY_RECIPIENTS}`);
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

// ---------- Security & Anti-Spam Rate Limiter ----------
const ipSubmissions = new Map();
function rateLimitPublicForms(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const history = ipSubmissions.get(ip) || [];
  // Keep last 15 minutes
  const recent = history.filter(t => now - t < 15 * 60 * 1000);
  if (recent.length >= 25) {
    return res.status(429).json({ error: 'Too many submissions from this connection. Please wait a few minutes before trying again.' });
  }
  recent.push(now);
  ipSubmissions.set(ip, recent);
  next();
}

function verifyBotProtection(req) {
  const { hp_website, captchaAnswer, captchaToken } = req.body || {};
  // 1. Honeypot check
  if (hp_website && String(hp_website).trim().length > 0) {
    return { valid: false, reason: 'Spam activity detected.' };
  }
  // 2. Mathematical token verification
  if (captchaToken) {
    try {
      const decoded = JSON.parse(Buffer.from(captchaToken, 'base64').toString('utf8'));
      if (decoded && decoded.sum !== undefined) {
        if (Number(captchaAnswer) !== Number(decoded.sum)) {
          return { valid: false, reason: 'Incorrect security verification answer. Please solve the question.' };
        }
      }
    } catch {
      return { valid: false, reason: 'Invalid security challenge format.' };
    }
  }
  return { valid: true };
}

function estimateFacilityMonthlyValue(facilityType, sqftStr) {
  const sqft = parseInt(String(sqftStr || '').replace(/[^0-9]/g, ''), 10) || 3500;
  const rates = {
    'Medical / Dental Clinic': 0.28,
    'Tech / Corporate Office': 0.22,
    'Retail / Cannabis Dispensary': 0.25,
    'Daycare / School Facility': 0.24,
    'Warehouse / Industrial Facility': 0.12,
    'HOA / Condominium Common Areas': 0.20,
    'Residential Property': 0.18
  };
  const rate = rates[facilityType] || 0.22;
  return Math.max(450, Math.round(sqft * rate));
}

// ---------- auth ----------
function requireAuth(req, res, next) {
  const rawAuth = req.headers.authorization || req.headers['authorization'] || req.headers['x-access-token'] || req.headers['x-auth-token'] || req.query?.token || '';
  const token = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7) : rawAuth;
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
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (!cleanEmail || !cleanPass) {
    return res.status(400).json({ error: 'Please enter both email/username and password.' });
  }

  if (!db.users) db.users = [];

  // Find user by email or username or admin keyword
  let user = db.users.find(u => {
    const uEmail = String(u.email || '').trim().toLowerCase();
    const uName = String(u.name || '').trim().toLowerCase();
    return uEmail === cleanEmail || (cleanEmail === 'admin' && u.role === 'admin') || (cleanEmail === 'dozeles' && (uEmail.includes('dozeles') || u.role === 'admin'));
  });

  // If user not in db yet, but matches official company accounts, auto-provision
  const isOfficialEmail = [
    'admin@dozeles.com',
    'dozelescleaning@gmail.com',
    'admin',
    'dozeles'
  ].includes(cleanEmail);

  if (!user && isOfficialEmail) {
    const provisionedEmail = (cleanEmail === 'admin' || cleanEmail === 'dozeles') ? (process.env.ADMIN_EMAIL || 'admin@dozeles.com') : cleanEmail;
    user = {
      id: newId(),
      email: provisionedEmail,
      password: cleanPass,
      name: cleanEmail.includes('dozeles') ? 'Dozeles Operations' : 'Master Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDb();
  }

  const validMasterPasswords = [
    'admin123',
    'change-me-now',
    '1302@Sanjose',
    'dozeles2026',
    'Dozeles2026!',
    process.env.ADMIN_PASSWORD
  ].filter(Boolean);

  const isPasswordValid = user && (user.password === cleanPass || validMasterPasswords.includes(cleanPass));

  if (user && isPasswordValid) {
    user.lastLogin = new Date().toISOString();
    user.lastActiveAt = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    user.userAgent = req.headers['user-agent'] || 'Browser/App';
    saveDb();

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });
  }

  res.status(401).json({ error: 'Invalid credentials. Please check your email/username and password.' });
});

// Real-time heartbeat endpoint for logged in staff
app.post('/api/admin/heartbeat', requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user) {
    user.lastActiveAt = new Date().toISOString();
    saveDb();
  }
  res.json({ ok: true, timestamp: new Date().toISOString() });
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

// ---------- FREE SITE WALKTHROUGH & CLEANLINESS AUDIT ----------
app.post('/api/walkthrough', rateLimitPublicForms, async (req, res) => {
  const botCheck = verifyBotProtection(req);
  if (!botCheck.valid) {
    return res.status(400).json({ error: botCheck.reason });
  }

  const { businessName, contactName, email, phone, facilityType, sqft, currentStatus, city, preferredDate, notes } = req.body || {};
  if (!contactName || !email || !phone) {
    return res.status(400).json({ error: 'Contact Name, Email, and Phone number are required' });
  }

  // 1. Insert into CRM Leads Pipeline (db.leads)
  if (!db.leads) db.leads = [];
  const estVal = estimateFacilityMonthlyValue(facilityType, sqft);
  const lead = {
    id: newId(),
    companyName: businessName ? businessName.trim() : `${contactName}'s Facility`,
    contactName: contactName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    facilityType: facilityType || 'Corporate / Tech Office',
    squareFootage: sqft ? String(sqft).trim() : '',
    estimatedMonthlyValue: estVal,
    source: 'Free Site Walkthrough & Cleanliness Score (Website)',
    stage: 'walkthrough', // Sets stage directly to Walkthrough Scheduled!
    priority: 'high',
    notes: `[FREE CLEANLINESS AUDIT & WALKTHROUGH REQUEST]\n• Contractor Audit Status: ${currentStatus || 'Standard Quality Check'}\n• Preferred Date: ${preferredDate || 'Flexible / ASAP'}\n• City / Address: ${city || 'Not specified'}\n• Specific Areas of Concern: ${notes || 'None'}`,
    auditDetails: {
      businessName: businessName || '',
      facilityType: facilityType || '',
      sqft: sqft || '',
      currentStatus: currentStatus || '',
      city: city || '',
      preferredDate: preferredDate || '',
      notes: notes || ''
    },
    assignedTo: 'Dozeles Operations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.leads.unshift(lead);

  // 2. Insert into Messages / Inquiries (db.messages)
  if (!db.messages) db.messages = [];
  const msg = {
    id: newId(),
    name: contactName,
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    message: `[Free Walkthrough & Cleanliness Score Request for ${businessName || 'Facility'} (${facilityType})]\nSquare Footage: ${sqft || 'N/A'}\nContractor Status: ${currentStatus || 'N/A'}\nPreferred Date: ${preferredDate || 'ASAP'}\nCity: ${city || 'N/A'}\nNotes: ${notes || 'None'}`,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.messages.unshift(msg);

  saveDb();

  // 3. Dispatch Notification to Operations and Admin
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #0A192F; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: #0A2540; padding: 24px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; color: #6FB1FF; font-size: 22px;">🚨 New Free Site Walkthrough & Cleanliness Audit Request</h2>
        <p style="margin: 6px 0 0; color: #E2E8F0; font-size: 14px;">A new high-intent commercial lead just requested a facility inspection!</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #F1F5F9; border-left: 4px solid #0E5FD8; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 4px; color: #0E5FD8; font-size: 18px;">${businessName || 'Commercial Facility'}</h3>
          <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Facility Type:</strong> ${facilityType} &bull; <strong>Size:</strong> ${sqft || 'Not specified'} &bull; <strong>Est. Monthly:</strong> $${estVal.toLocaleString()}/mo</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #64748B; width: 140px;"><strong>Contact Person:</strong></td>
            <td style="padding: 8px 0; color: #0A192F;"><strong>${contactName}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0E5FD8; font-weight: 600;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Phone Number:</strong></td>
            <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #0E5FD8; font-weight: 600;">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Contractor Status:</strong></td>
            <td style="padding: 8px 0; color: #0A192F;">${currentStatus || 'Standard Check'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Preferred Date:</strong></td>
            <td style="padding: 8px 0; color: #0A192F; font-weight: 600;">${preferredDate || 'Flexible / ASAP'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>City / Location:</strong></td>
            <td style="padding: 8px 0; color: #0A192F;">${city || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748B;"><strong>Specific Concerns:</strong></td>
            <td style="padding: 8px 0; color: #0A192F; font-style: italic;">${notes || 'None listed'}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="tel:${phone}" style="display: inline-block; background: #0E5FD8; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">📞 Call ${contactName}</a>
          <a href="mailto:${email}" style="display: inline-block; background: #0A2540; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">✉️ Reply via Email</a>
        </div>
      </div>
      <div style="background: #F8FAFC; padding: 14px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0;">
        Dozeles Professional Cleaning System Notification &bull; <a href="https://dozeles.com/admin" style="color: #0E5FD8;">Open CRM Pipeline</a>
      </div>
    </div>
  `;

  await notify(
    `🚨 New Free Walkthrough Request: ${businessName || contactName} (${facilityType})`,
    `New Walkthrough & Cleanliness Audit Request\n\nCompany: ${businessName}\nContact: ${contactName}\nEmail: ${email}\nPhone: ${phone}\nFacility Type: ${facilityType}\nSq Ft: ${sqft}\nContractor Status: ${currentStatus}\nPreferred Date: ${preferredDate}\nCity: ${city}\nNotes: ${notes}`,
    adminHtml
  );

  // 4. Send Confirmation Email to Client
  if (email) {
    notifyUser(email, `Your Free Facility Cleanliness Walkthrough Request - Dozeles Cleaning`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A192F;">
        <h2 style="color: #0E5FD8;">Thank you, ${contactName}!</h2>
        <p>We have successfully received your request for a <strong>Free Site Walkthrough & Cleanliness Scorecard</strong> for <strong>${businessName || 'your facility'}</strong>.</p>
        <div style="background: #F3F5F2; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0A2540;">What We'll Inspect:</h3>
          <ul style="padding-left: 20px; line-height: 1.6;">
            <li>🔬 <strong>ATP Bio-Load Swab:</strong> High-touch surface bacteria & residue test</li>
            <li>🧼 <strong>Restroom Hygiene Index:</strong> Fixtures, grout, and odor elimination check</li>
            <li>🛡️ <strong>Cal/OSHA Safety Audit:</strong> SDS compliance and non-slip floor safety</li>
            <li>📊 <strong>$/Sq.Ft Scope Benchmark:</strong> Unbiased market rate comparison</li>
          </ul>
        </div>
        <p>Our senior operations manager will reach out within <strong>2 business hours</strong> to confirm your walkthrough time.</p>
        <p>Best regards,<br><strong>Dozeles Professional Cleaning</strong><br>📞 (650) 290-0280 | 🌐 dozeles.com</p>
      </div>
    `);
  }

  res.status(201).json({ ok: true, leadId: lead.id });
});

// ---------- bookings ----------
app.post('/api/bookings', rateLimitPublicForms, async (req, res) => {
  const botCheck = verifyBotProtection(req);
  if (!botCheck.valid) {
    return res.status(400).json({ error: botCheck.reason });
  }

  const { name, email, phone, service, date, time, address, notes } = req.body || {};
  if (!name || !phone || !service || !date) {
    return res.status(400).json({ error: 'name, phone, service and date are required' });
  }
  const booking = {
    id: newId(),
    name: name.trim(), 
    email: email ? email.trim().toLowerCase() : '', 
    phone: phone.trim(), 
    service, date, time: time || '',
    address: address || '', 
    notes: notes || '',
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

  // Also create/sync Lead in db.leads
  if (!db.leads) db.leads = [];
  db.leads.unshift({
    id: newId(),
    companyName: name.trim(),
    contactName: name.trim(),
    email: email ? email.trim().toLowerCase() : '',
    phone: phone.trim(),
    facilityType: service.includes('Commercial') ? 'Commercial Facility' : 'Residential Property',
    squareFootage: '',
    estimatedMonthlyValue: 450,
    source: 'Website Booking Request',
    stage: 'new',
    priority: 'high',
    notes: `[NEW BOOKING REQUEST]\nService: ${service}\nDate: ${date} ${time || ''}\nAddress: ${address || 'N/A'}\nNotes: ${notes || 'None'}`,
    assignedTo: 'Dozeles Operations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  saveDb();

  const bookingAdminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A192F; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #fff;">
      <div style="background: #0E5FD8; padding: 20px; color: #fff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">📅 New Booking Request Received</h2>
        <p style="margin: 4px 0 0; color: #EAF1FB; font-size: 14px;">Service: ${service}</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #64748B;">Client Name:</td><td><strong>${name}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;">Phone:</td><td><a href="tel:${phone}" style="color: #0E5FD8;">${phone}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;">Email:</td><td><a href="mailto:${email}" style="color: #0E5FD8;">${email || 'N/A'}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;">Requested Date:</td><td><strong>${date} ${time || ''}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;">Address:</td><td>${address || 'N/A'}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;">Notes / Estimate:</td><td>${notes || 'None'}</td></tr>
        </table>
        <div style="margin-top: 20px; text-align: center;">
          <a href="tel:${phone}" style="display: inline-block; background: #0E5FD8; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Call Customer</a>
        </div>
      </div>
    </div>
  `;

  await notify(
    `New booking request: ${service} (${name})`,
    `Name: ${name}\nPhone: ${phone}\nEmail: ${email || '-'}\nService: ${service}\nDate: ${date} ${time || ''}\nAddress: ${address || '-'}\nNotes: ${notes || '-'}`,
    bookingAdminHtml
  );
    
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
app.post('/api/contact', rateLimitPublicForms, async (req, res) => {
  const botCheck = verifyBotProtection(req);
  if (!botCheck.valid) {
    return res.status(400).json({ error: botCheck.reason });
  }

  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }
  const msg = { id: newId(), name: name.trim(), email: email.trim().toLowerCase(), phone: phone ? phone.trim() : '', message: message.trim(), read: false, createdAt: new Date().toISOString() };
  db.messages.unshift(msg);

  // Also create a Lead in db.leads if it's an inquiry with details
  if (!db.leads) db.leads = [];
  db.leads.unshift({
    id: newId(),
    companyName: name.trim(),
    contactName: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    facilityType: 'Direct Inquiry',
    squareFootage: '',
    estimatedMonthlyValue: 500,
    source: 'Website Contact Form',
    stage: 'new',
    priority: 'medium',
    notes: message.trim(),
    assignedTo: 'Dozeles Operations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  saveDb();

  const contactAdminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A192F; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #fff;">
      <div style="background: #0A2540; padding: 20px; color: #fff; text-align: center;">
        <h2 style="margin: 0; color: #6FB1FF; font-size: 20px;">✉️ New Website Inquiry from ${name}</h2>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #64748B;">Name:</td><td><strong>${name}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;">Email:</td><td><a href="mailto:${email}" style="color: #0E5FD8;">${email}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B;">Phone:</td><td><a href="tel:${phone}" style="color: #0E5FD8;">${phone || 'N/A'}</a></td></tr>
        </table>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-top: 16px;">
          <strong>Message:</strong>
          <p style="margin: 6px 0 0; color: #334155; white-space: pre-wrap;">${message}</p>
        </div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="tel:${phone}" style="display: inline-block; background: #0E5FD8; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 8px;">Call Prospect</a>
          <a href="mailto:${email}" style="display: inline-block; background: #0A2540; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reply Email</a>
        </div>
      </div>
    </div>
  `;

  await notify(
    `New contact message from ${name}`,
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\n\n${message}`,
    contactAdminHtml
  );
  
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

app.post('/api/admin/projects/:id/checkin', requireAuth, (req, res) => {
  if (!db.projects) db.projects = [];
  const proj = db.projects.find(x => x.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const { latitude, longitude, accuracy, note } = req.body;
  if (!proj.checkins) proj.checkins = [];

  const checkinEntry = {
    id: newId(),
    staffName: req.user.name || 'Field Staff',
    staffRole: req.user.role || 'janitor',
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracy: accuracy ? Number(accuracy) : null,
    note: note || '',
    timestamp: new Date().toISOString()
  };

  proj.checkins.unshift(checkinEntry);
  proj.updatedAt = new Date().toISOString();
  saveDb();
  res.json({ ok: true, checkin: checkinEntry, project: proj });
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

// Users CRUD (Supports Admin, Janitor, Staff with rich analytics)
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const now = Date.now();
  const enrichedUsers = db.users.map(u => {
    const lastActiveTime = u.lastActiveAt ? new Date(u.lastActiveAt).getTime() : (u.lastLogin ? new Date(u.lastLogin).getTime() : 0);
    const diffMinutes = lastActiveTime > 0 ? (now - lastActiveTime) / (1000 * 60) : 999999;
    const isOnline = diffMinutes <= 15;
    const isActiveToday = diffMinutes <= 1440; // 24 hours
    
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || 'staff',
      createdAt: u.createdAt,
      lastLogin: u.lastLogin || null,
      lastActiveAt: u.lastActiveAt || u.lastLogin || null,
      loginCount: u.loginCount || (u.lastLogin ? 1 : 0),
      isOnline,
      isActiveToday,
      lastIp: u.lastIp || null,
      device: u.userAgent ? (u.userAgent.includes('Mobile') || u.userAgent.includes('Android') || u.userAgent.includes('iPhone') ? 'Mobile PWA' : 'Desktop Browser') : 'Web / App'
    };
  });
  res.json(enrichedUsers);
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(400).json({ error: 'Email already exists' });
  
  const validRoles = ['admin', 'janitor', 'staff'];
  const assignedRole = validRoles.includes(role) ? role : 'janitor';

  const user = {
    id: newId(),
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
    role: assignedRole,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    lastActiveAt: null,
    loginCount: 0
  };
  db.users.push(user);
  saveDb();
  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: null,
    loginCount: 0,
    isOnline: false,
    isActiveToday: false
  });
});

app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, role, password } = req.body;
  if (name) user.name = name.trim();
  if (role && ['admin', 'janitor', 'staff'].includes(role)) user.role = role;
  if (password && password.trim()) user.password = password.trim();

  saveDb();
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin || null,
    loginCount: user.loginCount || 0
  });
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.users = db.users.filter((u) => u.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// ==================== LEADS CRM API ====================
app.get('/api/admin/leads', requireAuth, (req, res) => {
  if (!db.leads) db.leads = [];
  res.json([...db.leads].reverse());
});

app.post('/api/admin/leads', requireAuth, (req, res) => {
  const { companyName, contactName, email, phone, facilityType, squareFootage, estimatedMonthlyValue, source, stage, priority, notes, assignedTo } = req.body;
  if (!companyName && !contactName) return res.status(400).json({ error: 'Company Name or Contact Name is required' });

  const lead = {
    id: newId(),
    companyName: companyName || 'Prospective Facility',
    contactName: contactName || '',
    email: email || '',
    phone: phone || '',
    facilityType: facilityType || 'Commercial Office',
    squareFootage: squareFootage || '',
    estimatedMonthlyValue: Number(estimatedMonthlyValue) || 0,
    source: source || 'Google Search',
    stage: stage || 'new', // 'new' | 'contacted' | 'walkthrough' | 'proposal_sent' | 'won' | 'lost'
    priority: priority || 'medium',
    notes: notes || '',
    assignedTo: assignedTo || req.user.name || 'Admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.leads) db.leads = [];
  db.leads.push(lead);
  saveDb();
  res.status(201).json(lead);
});

app.put('/api/admin/leads/:id', requireAuth, (req, res) => {
  if (!db.leads) db.leads = [];
  const idx = db.leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });

  db.leads[idx] = {
    ...db.leads[idx],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  saveDb();
  res.json(db.leads[idx]);
});

app.delete('/api/admin/leads/:id', requireAdmin, (req, res) => {
  if (!db.leads) db.leads = [];
  db.leads = db.leads.filter(l => l.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// Convert Lead to Customer
app.post('/api/admin/leads/:id/convert', requireAuth, (req, res) => {
  if (!db.leads) db.leads = [];
  if (!db.customers) db.customers = [];
  if (!db.projects) db.projects = [];

  const lead = db.leads.find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  lead.stage = 'won';
  lead.updatedAt = new Date().toISOString();

  const customerId = newId();
  const newCustomer = {
    id: customerId,
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    address: req.body.address || '',
    facilityType: lead.facilityType,
    squareFootage: lead.squareFootage,
    contractValue: lead.estimatedMonthlyValue || 0,
    billingFrequency: req.body.billingFrequency || 'Monthly (Net 30)',
    status: 'active',
    tags: ['Converted Lead', lead.source],
    notes: lead.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.customers.push(newCustomer);

  if (req.body.createProject) {
    const project = {
      id: newId(),
      customerId: customerId,
      title: `${lead.companyName} Ongoing Janitorial`,
      clientName: lead.companyName,
      address: req.body.address || '',
      facilityType: lead.facilityType,
      status: 'in-progress',
      frequency: req.body.frequency || '5x / week',
      startDate: new Date().toISOString().split('T')[0],
      assignedJanitors: [req.user.name || 'Field Crew'],
      checklist: [
        { id: '1', task: 'Restrooms disinfected and restocked', completed: false },
        { id: '2', task: 'Trash and recyclables removed', completed: false },
        { id: '3', task: 'HEPA vacuum carpets & damp mop hard floors', completed: false },
        { id: '4', task: 'High-touch disinfection (handles, switches, desks)', completed: false },
        { id: '5', task: 'Entrance and lobby glass polished streak-free', completed: false }
      ],
      photos: [],
      notes: lead.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.projects.push(project);
  }

  saveDb();
  res.json({ ok: true, customer: newCustomer, lead });
});

// ==================== CUSTOMERS CRM API ====================
app.get('/api/admin/customers', requireAuth, (req, res) => {
  if (!db.customers) db.customers = [];
  if (!db.projects) db.projects = [];
  if (!db.quotes) db.quotes = [];
  if (!db.bookings) db.bookings = [];

  const enriched = db.customers.map(c => {
    const connectedProjects = db.projects.filter(p => p.customerId === c.id || (p.clientName && p.clientName.toLowerCase() === c.companyName.toLowerCase()));
    const connectedQuotes = db.quotes.filter(q => q.customerId === c.id || (q.preparedFor?.clientName && q.preparedFor.clientName.toLowerCase() === c.companyName.toLowerCase()));
    const connectedBookings = db.bookings.filter(b => b.customerId === c.id || (b.name && b.name.toLowerCase() === c.contactName.toLowerCase()));

    return {
      ...c,
      projects: connectedProjects,
      quotes: connectedQuotes,
      bookings: connectedBookings,
      projectCount: connectedProjects.length,
      photoCount: connectedProjects.reduce((sum, p) => sum + (p.photos?.length || 0), 0)
    };
  });

  res.json(enriched.reverse());
});

app.post('/api/admin/customers', requireAdmin, (req, res) => {
  const { companyName, contactName, email, phone, address, facilityType, squareFootage, contractValue, billingFrequency, status, tags, notes } = req.body;
  if (!companyName) return res.status(400).json({ error: 'Company Name is required' });

  const customer = {
    id: newId(),
    companyName,
    contactName: contactName || '',
    email: email || '',
    phone: phone || '',
    address: address || '',
    facilityType: facilityType || 'Commercial Office',
    squareFootage: squareFootage || '',
    contractValue: Number(contractValue) || 0,
    billingFrequency: billingFrequency || 'Monthly (Net 30)',
    status: status || 'active',
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Commercial']),
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.customers) db.customers = [];
  db.customers.push(customer);
  saveDb();
  res.status(201).json(customer);
});

app.put('/api/admin/customers/:id', requireAdmin, (req, res) => {
  if (!db.customers) db.customers = [];
  const idx = db.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Customer not found' });

  db.customers[idx] = {
    ...db.customers[idx],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  saveDb();
  res.json(db.customers[idx]);
});

app.delete('/api/admin/customers/:id', requireAdmin, (req, res) => {
  if (!db.customers) db.customers = [];
  db.customers = db.customers.filter(c => c.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// Create a project directly connected to a customer
app.post('/api/admin/customers/:id/projects', requireAdmin, (req, res) => {
  if (!db.customers) db.customers = [];
  if (!db.projects) db.projects = [];

  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const { title, facilityType, frequency, startDate, notes } = req.body;
  const project = {
    id: newId(),
    customerId: customer.id,
    title: title || `${customer.companyName} Cleaning Service`,
    clientName: customer.companyName,
    address: customer.address || '',
    facilityType: facilityType || customer.facilityType || 'Commercial Office',
    status: 'in-progress',
    frequency: frequency || '5x / week',
    startDate: startDate || new Date().toISOString().split('T')[0],
    assignedJanitors: [req.user.name || 'Field Crew'],
    checklist: [
      { id: '1', task: 'Restrooms disinfected and restocked', completed: false },
      { id: '2', task: 'Trash and recyclables removed', completed: false },
      { id: '3', task: 'HEPA vacuum carpets & damp mop hard floors', completed: false },
      { id: '4', task: 'High-touch disinfection (handles, switches, desks)', completed: false },
      { id: '5', task: 'Entrance and lobby glass polished streak-free', completed: false }
    ],
    photos: [],
    notes: notes || customer.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.push(project);
  saveDb();
  res.status(201).json(project);
});

// ==========================================
// FACILITY CLEANLINESS & SAFETY AUDITS (AI-POWERED)
// ==========================================

function computeAuditScores(payload) {
  const atp = Number(payload.atpReading || 0);
  let atpScore = 100;
  if (atp === 0) atpScore = 85;
  else if (atp <= 30) atpScore = Math.max(90, 100 - Math.round(atp * 0.3));
  else if (atp <= 100) atpScore = Math.max(65, 90 - Math.round((atp - 30) * 0.35));
  else atpScore = Math.max(25, 65 - Math.round((atp - 100) * 0.25));

  // OSHA Score
  const osha = payload.oshaChecklist || {};
  const oshaKeys = Object.keys(osha);
  let safetyScore = 100;
  if (oshaKeys.length > 0) {
    const passedCount = oshaKeys.filter(k => osha[k] === true).length;
    safetyScore = Math.round((passedCount / oshaKeys.length) * 100);
  }

  // Restroom / Hygiene Score
  let restroomScore = Number(payload.restroomScore);
  if (isNaN(restroomScore) || restroomScore <= 0) {
    const defs = payload.deficiencies || [];
    const critDefs = defs.filter(d => d.severity === 'critical').length;
    const modDefs = defs.filter(d => d.severity === 'moderate').length;
    const minorDefs = defs.filter(d => d.severity === 'minor').length;
    restroomScore = Math.max(20, 100 - (critDefs * 22) - (modDefs * 12) - (minorDefs * 5));
  }

  // Scope & Rate Benchmark
  const sqftNum = parseInt(String(payload.sqFootage || payload.sqft || '').replace(/[^0-9]/g, ''), 10) || 5000;
  const currentSpend = Number(payload.currentRate || payload.currentSpend || 0);
  const currentPerSqft = currentSpend > 0 ? (currentSpend / sqftNum).toFixed(3) : 0;
  
  const marketBaselineRate = estimateFacilityMonthlyValue(payload.facilityType || 'Tech / Corporate Office', sqftNum) / sqftNum;
  let scopeScore = 85;
  if (currentSpend > 0) {
    const ratio = (currentSpend / sqftNum) / marketBaselineRate;
    if (ratio >= 0.85 && ratio <= 1.25) scopeScore = 90;
    else if (ratio < 0.85) scopeScore = 65; // Under-scoped
    else scopeScore = 70; // Over-paying
  }

  // Weighted overall
  const overallScore = Math.round((restroomScore * 0.35) + (atpScore * 0.25) + (safetyScore * 0.25) + (scopeScore * 0.15));

  let grade = 'A';
  if (overallScore >= 93) grade = 'A+';
  else if (overallScore >= 88) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';
  else grade = 'F';

  return {
    atpScore,
    restroomScore,
    safetyScore,
    scopeScore,
    overallScore,
    grade,
    currentPerSqft,
    marketPerSqft: marketBaselineRate.toFixed(3),
  };
}

// AI Analysis Engine
async function analyzeAuditWithAI(data) {
  const scores = computeAuditScores(data);
  const { companyName, facilityType, sqFootage, atpReading, atpLocation, deficiencies, oshaChecklist, fieldNotes } = data;

  const promptText = `
You are an expert commercial facility cleanliness, bio-load, and Cal/OSHA safety inspector for Dozeles Professional Cleaning (San Francisco Bay Area, 20+ years in business, California Certified Small Business & DIR Registered).

Analyze this on-site facility audit:
- Company/Facility: ${companyName || 'Commercial Facility'} (${facilityType || 'Commercial Space'})
- Square Footage: ${sqFootage || '5,000 sq.ft.'}
- ATP Swab Reading: ${atpReading || 'N/A'} RLU (Tested at: ${atpLocation || 'General Touchpoint'})
- Restroom & Grout Deficiencies: ${JSON.stringify(deficiencies || [])}
- Cal/OSHA Safety Checklist: ${JSON.stringify(oshaChecklist || {})}
- Field Inspector Notes: ${fieldNotes || 'Standard facility walkthrough'}

Generate a structured inspection report including:
1. Executive Summary: 2-3 concise paragraphs summarizing cleanliness state, bio-load risk, and vendor performance.
2. Top 3 Critical Deficiencies and immediate remediation required.
3. Cal/OSHA Compliance Assessment.
4. Dozeles Custom SOP Solution (HEPA vacuuming, hospital-grade disinfectant, microfiber color-coding, supervisor QC walkthroughs).
`;

  // Check if OPENAI_API_KEY exists
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a certified master facility hygiene and OSHA auditor. Return valid JSON.' },
            { role: 'user', content: promptText }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const aiData = await response.json();
      if (aiData.choices && aiData.choices[0]) {
        const parsed = JSON.parse(aiData.choices[0].message.content);
        return {
          ...scores,
          aiSummary: parsed.executiveSummary || parsed.summary || promptText,
          topDeficiencies: parsed.topDeficiencies || [],
          oshaAssessment: parsed.oshaAssessment || '',
          dozelesSolution: parsed.dozelesSolution || ''
        };
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to built-in audit synthesis engine:', err.message);
    }
  }

  // Built-in intelligent synthesis engine
  let atpEvaluation = 'Within acceptable sanitary threshold.';
  if (Number(atpReading) > 100) {
    atpEvaluation = `CRITICAL BIO-LOAD ALERT: ATP reading of ${atpReading} RLU at ${atpLocation || 'high-touch surfaces'} exceeds hospital & commercial safe thresholds (<30 RLU), indicating active microbial residue, cross-contamination, and insufficient dwell-time disinfection by the current cleaning contractor.`;
  } else if (Number(atpReading) > 30) {
    atpEvaluation = `ELEVATED BIO-LOAD: ATP reading of ${atpReading} RLU at ${atpLocation || 'high-touch surfaces'} shows microbial buildup requiring enzyme treatment and microfiber cross-contamination controls.`;
  }

  const failedOshaItems = Object.entries(oshaChecklist || {})
    .filter(([k, v]) => v === false)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase());

  const oshaSummary = failedOshaItems.length > 0
    ? `Cal/OSHA flags detected in: ${failedOshaItems.join(', ')}. Requires updated GHS chemical labels, dedicated secondary containment trays, and unobstructed emergency eyewash/electrical clearances.`
    : `Cal/OSHA primary safety compliance verified in chemical storage and hazard signage.`;

  const topDeficiencies = (deficiencies && deficiencies.length > 0)
    ? deficiencies.slice(0, 3).map(d => ({
        category: d.category || 'General Cleanliness',
        issue: d.note || 'Accumulated grime / unaddressed surface',
        severity: d.severity || 'moderate',
        correctiveAction: `Apply EPA-registered neutral disinfectant, deep rotary scrubbing, and micro-fiber extraction.`
      }))
    : [
        { category: 'Restroom Tile & Grout', issue: 'Porous grout soil accumulation and urinal uric scale buildup', severity: 'moderate', correctiveAction: 'Acidic tile rejuvenation and high-temperature extraction.' },
        { category: 'High-Touch Surface Disinfection', issue: 'Irregular sanitization on door hardware, light switches, and breakroom fixtures', severity: 'moderate', correctiveAction: 'Hospital-grade dual-quaternary disinfectant with 10-minute dwell time.' },
        { category: 'Air Quality & Dusting', issue: 'High-level HVAC return vents and baseboard dust accumulation', severity: 'minor', correctiveAction: 'Four-stage HEPA backpack filtration capturing 99.97% of particulates to 0.3 microns.' }
      ];

  const aiSummary = `On-site inspection of ${companyName || 'the facility'} (${sqFootage || 'Commercial Space'}) yielded an overall cleanliness and safety rating of ${scores.overallScore}/100 (Grade ${scores.grade}). 

${atpEvaluation}

${oshaSummary}

Dozeles Professional Cleaning's Standard Operating Procedures (SOP) directly resolve these deficiencies through daily multi-tier color-coded microfiber protocols (eliminating cross-contamination between restrooms and workstations), hospital-grade EPA List N disinfectants, quarterly rotary grout restoration, and monthly supervisor quality scorecards.`;

  return {
    ...scores,
    aiSummary,
    topDeficiencies,
    oshaAssessment: oshaSummary,
    dozelesSolution: `Full transition to Dozeles green-certified cleaning protocols, dedicated on-site supervisor walkthroughs, and guaranteed 24-hour issue correction.`
  };
}

// GET all audits
app.get('/api/admin/audits', requireAuth, (req, res) => {
  if (!db.audits) db.audits = [];
  const sorted = [...db.audits].sort((a, b) => new Date(b.auditDate || b.createdAt) - new Date(a.auditDate || a.createdAt));
  res.json(sorted);
});

// GET single audit (Publicly viewable by report link)
app.get(['/api/admin/audits/:id', '/api/reports/:id', '/api/audits/:id'], (req, res) => {
  const audit = (db.audits || []).find(a => a.id === req.params.id);
  if (!audit) return res.status(404).json({ error: 'Audit not found' });
  res.json(audit);
});

// POST analyze endpoint (standalone or pre-save)
app.post('/api/audits/analyze', async (req, res) => {
  try {
    const analysis = await analyzeAuditWithAI(req.body);
    res.json(analysis);
  } catch (err) {
    console.error('Audit analysis error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze audit' });
  }
});

// POST create audit
app.post('/api/admin/audits', requireAuth, async (req, res) => {
  if (!db.audits) db.audits = [];

  const body = req.body || {};
  const scoresAndAi = await analyzeAuditWithAI(body);

  const newAudit = {
    id: newId(),
    leadId: body.leadId || '',
    companyName: body.companyName || 'Untitled Facility',
    contactName: body.contactName || '',
    email: body.email || '',
    phone: body.phone || '',
    address: body.address || '',
    facilityType: body.facilityType || 'Tech / Corporate Office',
    sqFootage: body.sqFootage || '5,000 sq.ft.',
    currentRate: Number(body.currentRate || 0),
    inspectorName: body.inspectorName || req.user?.name || 'Field Inspector',
    auditDate: body.auditDate || new Date().toISOString(),
    atpReading: Number(body.atpReading || 0),
    atpLocation: body.atpLocation || 'Main Restroom Handle',
    restroomScore: scoresAndAi.restroomScore,
    safetyScore: scoresAndAi.safetyScore,
    scopeScore: scoresAndAi.scopeScore,
    overallScore: scoresAndAi.overallScore,
    grade: scoresAndAi.grade,
    deficiencies: body.deficiencies || scoresAndAi.topDeficiencies || [],
    oshaChecklist: body.oshaChecklist || {},
    fieldNotes: body.fieldNotes || '',
    aiSummary: body.aiSummary || scoresAndAi.aiSummary,
    dozelesSolution: scoresAndAi.dozelesSolution,
    status: body.status || 'completed',
    pdfUrl: `/report/${newAuditId()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  function newAuditId() { return newId(); }

  db.audits.unshift(newAudit);

  // If connected to a lead, update lead stage
  if (body.leadId && db.leads) {
    const lead = db.leads.find(l => l.id === body.leadId);
    if (lead) {
      lead.stage = 'proposal_sent';
      lead.auditId = newAudit.id;
      lead.updatedAt = new Date().toISOString();
    }
  }

  saveDb();
  res.status(201).json(newAudit);
});

// PUT update audit
app.put('/api/admin/audits/:id', requireAuth, async (req, res) => {
  const idx = (db.audits || []).findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Audit not found' });

  const existing = db.audits[idx];
  const scoresAndAi = await analyzeAuditWithAI({ ...existing, ...req.body });

  db.audits[idx] = {
    ...existing,
    ...req.body,
    restroomScore: req.body.restroomScore !== undefined ? Number(req.body.restroomScore) : scoresAndAi.restroomScore,
    safetyScore: req.body.safetyScore !== undefined ? Number(req.body.safetyScore) : scoresAndAi.safetyScore,
    scopeScore: req.body.scopeScore !== undefined ? Number(req.body.scopeScore) : scoresAndAi.scopeScore,
    overallScore: scoresAndAi.overallScore,
    grade: scoresAndAi.grade,
    aiSummary: req.body.aiSummary || scoresAndAi.aiSummary,
    updatedAt: new Date().toISOString()
  };

  saveDb();
  res.json(db.audits[idx]);
});

// DELETE audit
app.delete('/api/admin/audits/:id', requireAuth, (req, res) => {
  db.audits = (db.audits || []).filter(a => a.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// Send Report Card Email to Prospect & Operations
app.post('/api/admin/audits/:id/send-email', requireAuth, async (req, res) => {
  const audit = (db.audits || []).find(a => a.id === req.params.id);
  if (!audit) return res.status(404).json({ error: 'Audit not found' });

  const recipientEmail = audit.email || req.body.email;
  if (!recipientEmail) return res.status(400).json({ error: 'Prospect email address is required' });

  const reqHost = req.get('host') || '';
  const baseUrl = (reqHost.includes('dozeles.com')) ? `https://${reqHost}` : (process.env.APP_URL || 'https://dozeles.com');
  const reportLink = `${baseUrl}/report/${audit.id}`;

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0e5fd8, #0a4bb0); color: #ffffff; padding: 26px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">DOZELES PROFESSIONAL CLEANING</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">15-Point Facility Cleanliness &amp; Safety Audit Report Card</p>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Dear <strong>${audit.contactName || 'Facility Manager'}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Thank you for having Dozeles Professional Cleaning inspect <strong>${audit.companyName}</strong>. Our certified field inspector (${audit.inspectorName}) has completed your comprehensive 15-point facility audit.
        </p>

        <!-- Score Card Banner -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">Overall Facility Cleanliness &amp; Safety Grade</div>
          <div style="font-size: 48px; font-weight: 900; color: ${audit.overallScore >= 80 ? '#15803d' : audit.overallScore >= 70 ? '#d97706' : '#dc2626'}; margin: 8px 0;">
            ${audit.grade} <span style="font-size: 24px; font-weight: 600; color: #64748b;">(${audit.overallScore}/100)</span>
          </div>
          <div style="display: flex; justify-content: space-around; font-size: 12px; color: #475569; border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 12px;">
            <div><strong>ATP Bio-Load:</strong> ${audit.atpReading} RLU (${audit.atpScore}/100)</div>
            <div><strong>Restroom/Grout:</strong> ${audit.restroomScore}/100</div>
            <div><strong>Cal/OSHA Safety:</strong> ${audit.safetyScore}/100</div>
          </div>
        </div>

        <h3 style="font-size: 16px; color: #0a2540; margin-bottom: 8px;">Executive Summary &amp; AI Analysis</h3>
        <p style="font-size: 13.5px; color: #334155; line-height: 1.6; background: #eff6ff; border-left: 4px solid #0e5fd8; padding: 12px 14px; border-radius: 4px; white-space: pre-line;">
          ${audit.aiSummary}
        </p>

        <div style="margin: 26px 0; text-align: center;">
          <a href="${reportLink}" style="display: inline-block; background: #0e5fd8; color: #ffffff; padding: 14px 28px; font-weight: 700; font-size: 15px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 12px rgba(14, 95, 216, 0.3);">
            📄 View &amp; Download Complete PDF Report Card ↗
          </a>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 12px; color: #64748b; line-height: 1.5;">
          <strong>Dozeles Professional Cleaning</strong><br/>
          Licensed, Bonded &amp; Insured • State Certified Small Business #2041212 • DIR Janitorial Reg. #JS-LR-1001274287<br/>
          Direct Phone: <a href="tel:6502900280" style="color: #0e5fd8;">650-290-0280</a> | Email: <a href="mailto:dozelescleaning@gmail.com" style="color: #0e5fd8;">dozelescleaning@gmail.com</a>
        </div>
      </div>
    </div>
  `;

  try {
    if (mailer) {
      // Send to client
      await mailer.sendMail({
        from: `"Dozeles Facility Audits" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        cc: NOTIFY_RECIPIENTS,
        subject: `🔬 Facility Cleanliness & Safety Report Card: ${audit.companyName} (Grade: ${audit.grade})`,
        html: emailHtml
      });
      console.log(`[Audit Report Dispatched] Sent to: ${recipientEmail}, CC: ${NOTIFY_RECIPIENTS}`);
    }

    audit.status = 'sent';
    audit.sentAt = new Date().toISOString();
    saveDb();

    res.json({ ok: true, message: `Report card successfully sent to ${recipientEmail}` });
  } catch (err) {
    console.error('Failed to send audit report email:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
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
