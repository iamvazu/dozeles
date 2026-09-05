# Dozeles — Commercial, Residential & Governmental Cleaning Platform

A high-performance, full-stack enterprise cleaning services platform: **React (Vite) Progressive Web App (PWA)**, **Node.js/Express API**, **2026 Luxury Admin & Operations CRM**, and a **Programmatic SEO (pSEO) Engine generating 1,500+ indexable landing pages**.

Live Production: [https://dozeles.com](https://dozeles.com) | Admin Portal: [https://dozeles.com/admin](https://dozeles.com/admin)

---

## Table of Contents
1. [System Architecture & Capabilities](#system-architecture--capabilities)
2. [Programmatic SEO Engine (1,500+ Pages)](#programmatic-seo-engine-1500-pages)
3. [2026 Luxury Admin Portal & CRM](#2026-luxury-admin-portal--crm)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Complete File Structure](#complete-file-structure)
6. [Hosting, Server & Deployment Guide](#hosting-server--deployment-guide)
7. [Local Development Setup](#local-development-setup)
8. [API Reference](#api-reference)

---

## System Architecture & Capabilities

```
                       ┌──────────────────────────────────────────────┐
                       │            Clients & Public Users            │
                       │    (Responsive Mobile, Tablet & Desktop)     │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │       React (Vite) PWA Client                │
                       │  • Service Worker & Offline Caching          │
                       │  • PWA Add-to-Home Screen Installation       │
                       │  • Programmatic SEO Route Mesh               │
                       │  • 2026 Luxury Admin & Operations CRM        │
                       └──────────────────────┬───────────────────────┘
                                              │  REST API (JWT Bearer)
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │           Node.js / Express API              │
                       │  • Port 4000 (PM2 Managed: dozeles-api)      │
                       │  • Role-Based Access Control (Admin/Janitor) │
                       │  • JSON Data Store with Atomic Disk Writes   │
                       │  • Multi-part File Uploads & PDF Invoicing   │
                       └──────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
     ┌─────────────────────────────┐                     ┌─────────────────────────────┐
     │      Persistent JSON DB     │                     │     Static Media & Uploads  │
     │  (users, leads, customers,  │                     │  (before/after, progress,   │
     │  projects, quotes, bookings)│                     │  attachments, seed data)    │
     └─────────────────────────────┘                     └─────────────────────────────┘
```

- **Frontend**: React 18, Vite, `date-fns`, `lucide-react`, Vanilla CSS 2026 Design Tokens (Deep Navy `#0A192F`, Action Blue `#0E5FD8`, Slate `#F8FAFC`).
- **PWA Capabilities**: Installable directly on iOS Safari, Android Chrome, and Desktop with full offline caching and manifest setup.
- **Backend**: Node.js & Express with JWT authentication, bcrypt password hashing, session analytics, and disk-persisted transactional JSON data store.
- **Production Server**: Ubuntu Linux VPS (`2.25.90.226`) with Nginx reverse proxy, SSL termination, and PM2 process management.

---

## Programmatic SEO Engine (1,500+ Pages)

The platform generates and serves **1,504+ distinct search-optimized landing pages** without database overhead:

| Page Type | URL Pattern | Generated Count |
|---|---|---|
| Core Pages | `/`, `/pricing`, `/locations`, `/booking`, `/contact`, `/about` | 12 |
| Industry Verticals | `/industries/<industry>` (e.g. medical, cannabis, daycare, tech) | 10 |
| Blog & Knowledgebase | `/blog/<slug>` | 13 |
| Service Hubs | `/services/<service>` | 9 |
| City Landing Pages | `/cleaning-services/<city>` | 73 |
| **Service × City Matrix** | `/services/<service>/<city>` | **657** |
| **Industry × City Matrix** | `/industries/<industry>/<city>` | **730** |
| **Total Indexable Sitemap** | `https://dozeles.com/sitemap.xml` | **1,504 URLs** |

### Automated On-Page SEO Features
- **Dynamic Meta Tags**: Unique `<title>`, `<meta name="description">`, canonical links, OpenGraph, and Twitter cards per route.
- **Rich Schema.org JSON-LD**: Injects `LocalBusiness`, `Service`, `BreadcrumbList`, and `FAQPage` rich structured data.
- **Automated Sitemap Generation**: `client/scripts/generate-sitemap.js` runs automatically on `npm run build` and updates `sitemap.xml` and `robots.txt`.

---

## 2026 Luxury Admin Portal & CRM

Accessible at `/admin`, the admin panel uses a cohesive executive design system across every tab:

### 1. Dashboard Overview & Smart Calendar
- High-level KPI cards: *Pending Actions*, *Total Logged Bookings*, *Active Ongoing Sites*, and *Service Proposals*.
- Interactive monthly dispatch calendar with status tags, client names, and time slots.

### 2. Leads & Sales Pipeline (`LeadsView.jsx`)
- Visual lead stages: `New Lead` → `Contacted` → `Site Visit Scheduled` → `Proposal Sent` → `Won (Convert to Customer)` → `Lost`.
- Filter by status, service type, and source. One-click conversion to Customer records or Service Quotes.

### 3. Customers & CRM (`CustomersView.jsx`)
- Full client relationship manager storing contact details, property addresses, billing histories, and service types.
- Connected active projects and linked proposal archives.

### 4. Projects & Photo Operations (`ProjectsView.jsx`)
- Job sites management with status badges (`pending`, `in-progress`, `completed`).
- **Photo Upload Suite**: Upload categorized photos for `Daily Progress`, `Before Clean`, and `After Clean`.
- **GPS Check-in Log**: Field janitors log GPS coordinates and timestamps when arriving at project sites.
- **Interactive Checklists**: Real-time task checklists per room or facility area.

### 5. Service Quotes Engine (`ServiceQuote.jsx`)
- Custom quote builder with residential and commercial line items, tax calculations, discounts, and terms.
- Status tracking (`draft`, `sent`, `approved`, `declined`).
- **Printable PDF Export**: Clean, printable proposal layout for commercial and governmental contracts.

### 6. Bookings & Service Dispatches (`Admin.jsx -> Bookings`)
- Live queue of customer booking submissions from the website.
- Status workflow (`pending`, `quoted`, `scheduled`, `in-progress`, `completed`, `cancelled`).
- File attachments, internal team notes, and automated invoice emailing.

### 7. Inquiries & Customer Messages (`Admin.jsx -> Messages`)
- Real-time inbox for contact form submissions.
- Filter by unread status and direct `Reply via Email` CTA.

### 8. Team & Field Staff Analytics (`UsersAdminView.jsx`)
- User creation and role assignment (`admin` vs `janitor`).
- **Real-Time Login Analytics**: Active login indicators, last login timestamps, session counts, and device/platform tags.

### 9. Automated Pricing Engine (`PricingAdminView.jsx`)
- Configure residential formulas (Base price, Per-bedroom increment, Per-bathroom increment, Minimum price).
- Configure commercial rates ($/sq.ft) across facility types: *Office, Retail, Medical Clinic, Warehouse, School/Government, Restaurant*.
- **Interactive Live Preview Calculator**: Real-time preview testing for residential rooms and commercial square footage.

### 10. Website CMS (`ContentEditorView.jsx`)
- Visual form editor and JSON code editor for website copy, contact information, business hours, social links, Google rating reviews, and map embeds.

### 11. Client Reviews & Testimonials (`Admin.jsx -> ReviewsAdmin`)
- Manage verified customer reviews and 5-star ratings displayed across the website.

### 12. Newsletter Subscribers (`Admin.jsx -> Subscribers`)
- Email subscriber registry with one-click **CSV Export** for email marketing campaigns.

---

## Role-Based Access Control (RBAC)

The system automatically tailors the UI and API permissions based on the authenticated user's JWT role:

| Feature / Tab | Administrator (`admin`) | Field Janitor (`janitor`) |
|---|:---:|:---:|
| Overview Calendar | Full View | Assigned Sites Only |
| Leads & Pipeline | Read / Write | Restricted |
| Customers & CRM | Read / Write | Restricted |
| Service Quotes | Create / Edit / Delete | Restricted |
| Projects & Photos | Full View & Management | View Assigned, Upload Photos, GPS Check-in |
| Bookings & Jobs | Full Management | Assigned Schedule |
| Pricing Engine | Edit & Publish Rates | Restricted |
| Website CMS | Edit & Publish Content | Restricted |
| User Analytics | Add / Edit Staff & Monitor Logins | Restricted |

---

## Complete File Structure

```
dozeles-app/
├── package.json                         # Workspace root
├── README.md                            # Comprehensive system documentation
│
├── client/                              # React + Vite Frontend PWA
│   ├── index.html                       # Entry HTML with meta & favicon
│   ├── package.json                     # Client dependencies
│   ├── vite.config.js                   # Vite configuration & PWA manifest setup
│   ├── scripts/
│   │   └── generate-sitemap.js          # Dynamic sitemap (1,500+ URLs) & robots.txt
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── manifest.webmanifest         # PWA Progressive Web App manifest
│   │   ├── robots.txt                   # Search crawler directives
│   │   ├── sitemap.xml                  # Generated XML sitemap
│   │   └── images/                      # Logos, project galleries & assets
│   └── src/
│       ├── main.jsx                     # Application bootstrap
│       ├── App.jsx                      # Client router & PWA registration
│       ├── index.css                    # 2026 Luxury design system & tokens
│       ├── api.js                       # Axios/fetch API client with JWT bearer handling
│       │
│       ├── admin/                       # 2026 Luxury Admin Dashboard Views
│       │   ├── Admin.jsx                # Main layout, sidebar, Bookings, Messages, Reviews, Subscribers
│       │   ├── CustomersView.jsx        # CRM customer records & linked projects
│       │   ├── LeadsView.jsx            # Sales pipeline & stage tracking
│       │   ├── ProjectsView.jsx         # Field operations, photo suite & GPS logs
│       │   ├── ServiceQuote.jsx         # Proposal generator & PDF export
│       │   ├── UsersAdminView.jsx       # Staff management & real-time login analytics
│       │   ├── PricingAdminView.jsx     # Residential & commercial pricing calculator engine
│       │   └── ContentEditorView.jsx    # Visual CMS & JSON editor for site copy
│       │
│       ├── components/                  # Shared UI components
│       │   ├── Header.jsx               # Navigation bar & mobile menu
│       │   ├── Footer.jsx               # Site footer & newsletter opt-in
│       │   ├── Shared.jsx               # Reusable buttons, badges, trust logos
│       │   └── ScrollToTop.jsx          # Route change scroll reset
│       │
│       ├── data/                        # Programmatic SEO data dictionaries
│       │   ├── cities.js                # 73 California cities data & blurbs
│       │   ├── services.js              # 9 primary cleaning service verticals
│       │   ├── industries.js            # 10 specialized commercial industries
│       │   └── blogPosts.js             # 13 authoritative cleaning articles
│       │
│       └── pages/                       # Public Website Routes
│           ├── Home.jsx                 # Landing page with hero & trust badges
│           ├── About.jsx                # Company background, bonding & insurance
│           ├── Booking.jsx              # Interactive booking flow & calculator
│           ├── Pricing.jsx              # Public rate tiers & pricing psychology
│           ├── Services.jsx             # Service catalog hub
│           ├── ServicePage.jsx          # Individual service overview
│           ├── Locations.jsx            # Service area directory
│           ├── CityPage.jsx             # City-specific landing page (73 cities)
│           ├── ServiceCityPage.jsx      # Service × City landing page (657 pages)
│           ├── IndustryPage.jsx         # Specialized industry landing page
│           ├── IndustryCityPage.jsx     # Industry × City landing page (730 pages)
│           ├── Blog.jsx                 # Article index
│           ├── BlogPost.jsx             # Article detail page with JSON-LD
│           ├── Contact.jsx              # Public inquiry form
│           ├── Faq.jsx                  # Comprehensive FAQ knowledgebase
│           └── NotFound.jsx             # Custom 404 page
│
└── server/                              # Node.js + Express Backend API
    ├── server.js                        # Main Express application & route mount
    ├── package.json                     # Server dependencies
    ├── .env.example                     # Environment template
    ├── data/                            # Persistent JSON Database
    │   ├── data.json                    # Public content, reviews, subscribers
    │   ├── leads.json                   # Sales CRM pipeline records
    │   ├── customers.json               # Customer account profiles
    │   ├── projects.json                # Operations sites, photos & GPS logs
    │   ├── quotes.json                  # Proposals & quotes data
    │   ├── pricing.json                 # Dynamic residential & commercial formulas
    │   ├── users.json                   # User credentials & login session logs
    │   └── seed.json                    # Default database seed
    ├── uploads/                         # Stored job photos & file attachments
    └── routes/                          # API Modular Endpoints
        ├── auth.js                      # Login, token verification, session tracking
        ├── admin.js                     # Admin CRUD endpoints (bookings, messages, CMS)
        ├── crm.js                       # Leads & Customers CRM API
        ├── projects.js                  # Projects, photos, checklists & GPS API
        ├── quotes.js                    # Quotes creation, patch & PDF data API
        ├── pricing.js                   # Pricing engine configuration API
        ├── reviews.js                   # Public & admin reviews API
        └── content.js                   # Public site content API
```

---

## Hosting, Server & Deployment Guide

### Production Server Specifications
- **VPS Host IP**: `2.25.90.226`
- **Operating System**: Ubuntu Linux
- **Web Server / Reverse Proxy**: Nginx with SSL (Let's Encrypt)
- **Node.js Process Manager**: PM2 (`dozeles-api`, ID: `3`, Port: `4000`)
- **Directory Path on Server**: `/var/www/dozeles`

### Git Remote Repositories
- **Primary Source (Origin)**: `https://github.com/iamvazu/dozeles.git`
- **Vercel / Backup Remote**: `https://github.com/iamvazu/dozelesweb.git`

### How to Deploy Updates to the Live VPS

#### Option 1: Automated Push & Deploy via Terminal
```bash
# 1. Commit and push changes to GitHub
git add .
git commit -m "feat: your update message"
git push origin main
git push vercel main

# 2. Deploy to VPS via SSH execution
python -c "import paramiko; c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy()); c.connect('2.25.90.226', username='root', password='YOUR_PASSWORD', timeout=15); stdin, stdout, stderr = c.exec_command('cd /var/www/dozeles && git pull origin main && cd client && PUPPETEER_SKIP_DOWNLOAD=true npm install --ignore-scripts && npm run build && pm2 restart dozeles-api'); print(stdout.read().decode('utf-8')); c.close()"
```

#### Option 2: Manual SSH Deployment
```bash
ssh root@2.25.90.226
cd /var/www/dozeles

# Pull latest code
git pull origin main

# Build the client production bundle
cd client
PUPPETEER_SKIP_DOWNLOAD=true npm install --ignore-scripts
npm run build

# Restart the Node API service
pm2 restart dozeles-api
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm installed
- Git

### 1. Backend Setup
```bash
cd server
cp .env.example .env

# Configure server/.env:
# PORT=4000
# JWT_SECRET=your_jwt_secret_key_here
# ADMIN_EMAIL=admin@dozeles.com
# ADMIN_PASSWORD=admin123

npm install
npm start
# Server runs on http://localhost:4000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Development server runs on http://localhost:5173
```

---

## API Reference

### Public Endpoints
- `GET /api/content` — Fetches current website copy and configurations
- `GET /api/pricing` — Retrieves dynamic pricing formula parameters
- `GET /api/reviews` — Retrieves published client reviews
- `POST /api/bookings` — Submits a new client booking request
- `POST /api/contact` — Submits a general contact inquiry
- `POST /api/subscribe` — Subscribes an email to the newsletter

### Authentication Endpoints
- `POST /api/auth/login` — Authenticates user credentials, logs session analytics, and returns JWT token
- `GET /api/auth/me` — Returns the current authenticated user's profile

### Admin & Operations Endpoints (Requires `Authorization: Bearer <JWT>`)
- `GET /api/admin/leads` | `POST /api/admin/leads` | `PATCH /api/admin/leads/:id` — Sales pipeline
- `GET /api/admin/customers` | `POST /api/admin/customers` — Customer CRM
- `GET /api/admin/projects` | `POST /api/admin/projects` | `PATCH /api/admin/projects/:id` — Operations sites
- `POST /api/admin/projects/:id/photos` — Uploads categorized site photos
- `POST /api/admin/projects/:id/checkin` — Records GPS coordinates and timestamps
- `GET /api/admin/quotes` | `POST /api/admin/quotes` | `PATCH /api/admin/quotes/:id` — Service quotes
- `GET /api/admin/bookings` | `PATCH /api/admin/bookings/:id` — Booking dispatches
- `POST /api/admin/pricing` — Updates residential and commercial pricing rules
- `PUT /api/admin/content/:section` — Updates CMS website copy
- `GET /api/admin/users` | `POST /api/admin/users` — Staff roster and login analytics
- `GET /api/admin/subscribers` — Email subscriber list

---

## License & Intellectual Property
© 2026 Dozeles Professional Cleaning Services. All rights reserved. Commercial, Residential & Governmental Cleaning Services across California.
