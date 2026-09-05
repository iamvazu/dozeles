# Dozeles — Commercial, Residential & Governmental Cleaning Platform

A high-performance, full-stack enterprise cleaning services and operations platform: **React (Vite) Progressive Web App (PWA)**, **Node.js/Express API**, **AI-Powered Walkthrough Cleanliness Audit Suite**, **2026 Luxury Admin & Operations CRM**, and a **Programmatic SEO (pSEO) Engine generating 1,516+ indexable landing pages**.

- **Live Production URL**: [https://dozeles.com](https://dozeles.com)
- **Admin Operations Portal**: [https://dozeles.com/admin](https://dozeles.com/admin)

---

## Table of Contents
1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Complete Project Folder Structure](#complete-project-folder-structure)
3. [Key New Features & Updates](#key-new-features--updates)
   - [AI Walkthrough Audit & Cleanliness Score Generator](#1-ai-walkthrough-audit--cleanliness-score-generator)
   - [2026 Admin Portal Redesign & Compact KPI Cards](#2-2026-admin-portal-redesign--compact-kpi-cards)
   - [Updated Real-Time Pricing Engine & Calculator](#3-updated-real-time-pricing-engine--calculator)
   - [Hero Homepage 3-Set Image Slider](#4-hero-homepage-3-set-image-slider)
   - [Enterprise Lead Routing & 2-Hour Auto-Responder](#5-enterprise-lead-routing--2-hour-auto-responder)
4. [Programmatic SEO Engine (1,516+ Pages)](#programmatic-seo-engine-1516-pages)
5. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
6. [Hosting, Server & Deployment Guide](#hosting-server--deployment-guide)
7. [Local Development Setup](#local-development-setup)
8. [API Reference](#api-reference)
9. [Automated GTM & Marketing Automation (50 Skills)](#automated-gtm--marketing-automation-50-skills)

---

## Tech Stack & Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │            Clients & Public Users            │
                       │    (Responsive Mobile, Tablet & Desktop)     │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │       React (Vite) PWA Client                │
                       │  • React 18 + Vite 5 Build Engine            │
                       │  • Progressive Web App (PWA & Service Worker)│
                       │  • Vanilla CSS 2026 Design Tokens (Navy/Blue)│
                       │  • Lucide React Icons + html2pdf.js / jsPDF  │
                       │  • AI Walkthrough Audit & Dynamic Calculators│
                       └──────────────────────┬───────────────────────┘
                                              │  REST API (JWT Bearer)
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │           Node.js / Express API              │
                       │  • Port 4000 (PM2 Managed: dozeles-api)      │
                       │  • Nodemailer SMTP (Multi-Recipient Routing) │
                       │  • Role-Based Access Control (Admin/Janitor) │
                       │  • Transactional JSON Data Store (Atomic IO) │
                       │  • Multi-Part File Uploads & PDF Invoicing   │
                       └──────────────────────┬───────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
     ┌─────────────────────────────┐                     ┌─────────────────────────────┐
     │      Persistent JSON DB     │                     │     Static Media & Uploads  │
     │  (users, leads, customers,  │                     │  (inspection photos, hero   │
     │  projects, quotes, bookings)│                     │  galleries, PDF downloads)  │
     └─────────────────────────────┘                     └─────────────────────────────┘
```

### Core Technologies
- **Frontend Framework**: React 18.3.1 with Vite 5.4 bundling
- **Routing**: `react-router-dom` v6
- **Styling**: Vanilla CSS Design Tokens (Navy `#0A192F`, Action Blue `#0E5FD8`, Bright Cyan `#6FB1FF`, Slate `#F8FAFC`) with zero bulky CSS framework overhead
- **Icons**: `lucide-react`
- **PDF Generation**: `html2pdf.js` & `jspdf` for on-the-fly client proposal & audit report generation
- **PWA / Offline**: `vite-plugin-pwa` with Workbox runtime caching
- **Backend**: Node.js v18+ with Express 4 (ES Modules)
- **Security & Auth**: `jsonwebtoken` (JWT), `bcryptjs`, CORS middleware
- **Email Delivery**: `nodemailer` with automated HTML receipt & lead notification templates
- **Process Manager**: PM2 (Cluster/Fork modes)
- **Production Server**: Ubuntu Linux VPS (`2.25.90.226`) with Nginx reverse proxy and Let's Encrypt SSL

---

## Complete Project Folder Structure

```
dozeles-app/
├── package.json                         # Workspace root package config
├── README.md                            # Comprehensive system documentation
├── .agents/                             # Agent marketing skills & positioning context
│   ├── product-marketing.md             # Master product positioning & ICP dossier
│   └── skills/                          # 50 Automated marketing & growth skills
│
├── client/                              # React + Vite Frontend PWA
│   ├── index.html                       # Base HTML with SEO meta & PWA manifest link
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.js                   # Vite configuration & PWA manifest setup
│   ├── scripts/
│   │   └── generate-sitemap.js          # Dynamic sitemap (1,516 URLs) & robots.txt generator
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── manifest.webmanifest         # PWA Progressive Web App manifest
│   │   ├── robots.txt                   # Search crawler directives
│   │   ├── sitemap.xml                  # Dynamic XML sitemap
│   │   └── images/                      # Optimized image assets & hero slides
│   │       ├── hero_residential.png
│   │       ├── hero_commercial.png
│   │       ├── cannabis_store_cleaning.png
│   │       ├── corporate_lobby_cleaning.png
│   │       ├── hero_kitchen_slide.png   # Luxury kitchen hero slide
│   │       └── hero_bathroom_slide.png  # Commercial restroom hero slide
│   └── src/
│       ├── main.jsx                     # Application bootstrap & PWA registration
│       ├── App.jsx                      # Client router, error boundaries & toast notifications
│       ├── index.css                    # 2026 Design system tokens, utilities & layouts
│       ├── api.js                       # Axios/Fetch API client with JWT bearer handling
│       │
│       ├── admin/                       # 2026 Luxury Admin Dashboard Views
│       │   ├── Admin.jsx                # Main layout, sidebar, dispatches & messages inbox
│       │   ├── WalkthroughAuditView.jsx # AI-Powered Walkthrough Audit & Score Generator
│       │   ├── LeadsView.jsx            # Sales pipeline & stage tracking CRM
│       │   ├── CustomersView.jsx        # Customer CRM accounts & linked projects
│       │   ├── ProjectsView.jsx         # Field operations, photo station & GPS logs
│       │   ├── ServiceQuote.jsx         # Proposal generator & PDF export (DOZ-YYYY-XXXX)
│       │   ├── PricingAdminView.jsx     # Pricing engine rules & formula configuration
│       │   ├── UsersAdminView.jsx       # Staff roster & real-time login session analytics
│       │   └── ContentEditorView.jsx    # Visual CMS & JSON editor for site copy
│       │
│       ├── components/                  # Shared UI components
│       │   ├── Header.jsx               # Navigation bar & mobile menu
│       │   ├── Footer.jsx               # Site footer & newsletter opt-in
│       │   ├── Icon.jsx                 # Dynamic SVG icon renderer
│       │   ├── PriceCalculator.jsx      # Interactive residential & commercial calculator
│       │   ├── CleanlinessAuditModal.jsx# Free Walkthrough & Cleanliness Score customer modal
│       │   ├── CleanlinessAuditSection.jsx# Homepage interactive audit banner
│       │   ├── Shared.jsx               # Reusable buttons, badges, trust logos
│       │   └── ScrollToTop.jsx          # Route change scroll reset
│       │
│       ├── data/                        # Programmatic SEO data dictionaries & pricing engine
│       │   ├── pricing.js               # Single source of truth for pricing calculations
│       │   ├── cities.js                # 73 California cities data & blurbs
│       │   ├── services.js              # 9 primary cleaning service verticals
│       │   ├── industries.js            # 10 specialized commercial industries
│       │   └── blog.js                  # 25 authoritative cleaning knowledgebase articles
│       │
│       └── pages/                       # Public Website Routes
│           ├── Home.jsx                 # Homepage with 3-set hero slider & calculators
│           ├── About.jsx                # Company background, bonding & insurance
│           ├── Booking.jsx              # Interactive multi-step booking flow
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
├── server/                              # Node.js + Express Backend API
│   ├── server.js                        # Main Express application, auth & email dispatcher
│   ├── db.js                            # Transactional JSON database engine with atomic IO
│   ├── package.json                     # Server dependencies
│   ├── .env.example                     # Environment template
│   ├── data/                            # Persistent JSON Database
│   │   ├── db.json                      # Master database file
│   │   └── seed.json                    # Default database seed
│   └── uploads/                         # Stored job photos & inspection attachments
│
├── docs/                                # Documentation & guides
│   └── MARKETING_AUTOMATION_GUIDE.md    # 50-skill marketing engine playbook
└── scratch/                             # Deployment & diagnostic helper scripts
```

---

## Key New Features & Updates

### 1. AI Walkthrough Audit & Cleanliness Score Generator
- **Admin Tab**: Integrated directly under `/admin` as **Walkthrough Audit** (`WalkthroughAuditView.jsx`).
- **Customer Modal**: Accessible across the site via `CleanlinessAuditModal.jsx` ("Get a Free Site Walkthrough & Cleanliness Score").
- **On-Site Inspector Tool**: Field inspectors take and upload live site photos across 5 key audit zones:
  1. *Restrooms & Sanitary Facilities*
  2. *Kitchens & Breakrooms*
  3. *High-Touch Points (Door handles, switches, railings)*
  4. *Flooring, Carpets & Baseboards*
  5. *Windows, Glass & Entryways*
- **Algorithmic Cleanliness Score (0–100)**: Calculates an objective sanitary rating, grading tier (A+ to F), pathogen risk rating, and priority remediation action items.
- **Executive PDF Report Card**: Exports a branded, client-ready PDF inspection report complete with embedded photos, zone-by-zone grade breakdown, and an immediate customized service estimate.

### 2. 2026 Admin Portal Redesign & Compact KPI Cards
- **Modernized Compact KPI Cards**: Redesigned KPI cards across all views (`Overview`, `Leads`, `Customers`, `Service Quotes`, `Users & Staff`, `Pricing Engine`, `Bookings`, `Messages`, `Walkthrough Audit`) to follow a clean horizontal format with badge highlights and subtle sparkline accents.
- **Unified Navigation**: Sleek dark navy navigation sidebar with active indicators, live notification badges, and real-time session indicators.
- **Error Boundaries**: Hardened component loading and restored Lucide icon imports to ensure zero blank-screen crashes.

### 3. Updated Real-Time Pricing Engine & Calculator
The pricing engine (`client/src/data/pricing.js`) is the single source of truth shared across the public calculators, the booking flow, and the backend quote generator.

#### Updated Residential Add-On Prices:
| Residential Add-On Item | Updated Rate |
| :--- | :---: |
| **Inside empty refrigerator** | **$50** |
| **Inside occupied refrigerator** | **$60** |
| **Inside oven** | **$50** |
| **Inside kitchen cabinets** | **$50** |
| **Interior windows, tracks & sills** | **$30** ($25–$30/window) |
| **Laundry & folding** | **$50/load** |
| **Dish washing** | **$35** |
| **Garage sweep-out** | **$50** |
| **Heavy pet hair treatment** | **$50** |

### 4. Hero Homepage 3-Set Image Slider
The homepage hero section cycles through 3 high-resolution visual sets with 1-second cross-fade transitions on a 4.5-second timer:
- **Set 1**: Residential Living Room (`hero_residential.png`) + Commercial Floor Buffer (`hero_commercial.png`)
- **Set 2**: Retail Cannabis Dispensary (`cannabis_store_cleaning.png`) + Corporate High-Rise Lobby (`corporate_lobby_cleaning.png`)
- **Set 3**: Luxury Gourmet Modern Kitchen (`hero_kitchen_slide.png`) + Commercial Restroom / Luxury Bathroom (`hero_bathroom_slide.png`)

### 5. Enterprise Lead Routing & 2-Hour Auto-Responder
- **Clean Lead Delivery**: Removed obsolete/bouncing email addresses (`admin@dozeles.com`, `leticiamaia@hotmail.com`).
- **Active Admin Recipients**: All leads from website booking, contact, quote, and audit forms route directly to:
  - `maialeticia@hotmail.com`
  - `iamvazu@gmail.com`
- **Customer Auto-Reply SLA**: Automated branded confirmation email sent to every customer confirming receipt with a commitment: *"An Operations Manager will contact you within 2 hours."*

---

## Programmatic SEO Engine (1,516+ Pages)

The platform generates and serves **1,516 distinct search-optimized landing pages** without database overhead:

| Page Type | URL Pattern | Generated Count |
|---|---|---|
| Core Pages | `/`, `/pricing`, `/locations`, `/book`, `/contact`, `/about` | 12 |
| Industry Verticals | `/industries/<industry>` (e.g. medical, cannabis, daycare, tech) | 10 |
| Blog & Knowledgebase | `/blog/<slug>` | 25 |
| Service Hubs | `/services/<service>` | 9 |
| City Landing Pages | `/cleaning-services/<city>` | 73 |
| **Service × City Matrix** | `/services/<service>/<city>` | **657** |
| **Industry × City Matrix** | `/industries/<industry>/<city>` | **730** |
| **Total Indexable Sitemap** | `https://dozeles.com/sitemap.xml` | **1,516 URLs** |

---

## Role-Based Access Control (RBAC)

The system automatically tailors UI visibility and API permissions based on the authenticated user's JWT role:

| Feature / Tab | Administrator (`admin`) | Field Janitor / Inspector (`janitor`) |
|---|:---:|:---:|
| Dashboard Overview | Full View | Assigned Sites Only |
| Walkthrough Audit Suite | Full Access & Report Export | Create Audits & Upload Photos |
| Leads & Pipeline CRM | Read / Write | Restricted |
| Customers CRM | Read / Write | Restricted |
| Service Quotes (DOZ-YYYY-XXXX) | Create / Edit / Delete | Restricted |
| Operations Projects & Photos | Full Management | View Assigned, Upload Photos, GPS Check-in |
| Bookings & Dispatches | Full Management | Assigned Schedule |
| Pricing Engine Configuration | Edit & Publish Rates | Restricted |
| Website CMS Editor | Edit & Publish Content | Restricted |
| Staff Management & Sessions | Full Access | Restricted |

---

## Hosting, Server & Deployment Guide

### Production Server Specifications
- **VPS Host IP**: `2.25.90.226`
- **Operating System**: Ubuntu Linux
- **Web Server / Reverse Proxy**: Nginx with Let's Encrypt SSL
- **Node.js Process Manager**: PM2 (`dozeles-api`, ID: `3`, Port: `4000`)
- **Directory Path on Server**: `/var/www/dozeles`

### Git Remote Repositories
- **Primary Source (Origin)**: `https://github.com/iamvazu/dozeles.git`
- **Vercel / Backup Remote**: `https://github.com/iamvazu/dozelesweb.git`

### How to Deploy Updates to the Live VPS

#### Fast Automated Deployment (via SSH execution)
```bash
# 1. Commit and push changes
git add .
git commit -m "feat: updates"
git push origin main
git push vercel main

# 2. Sync to VPS and rebuild
python -c "import paramiko; c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy()); c.connect('2.25.90.226', username='root', password='YOUR_PASSWORD', timeout=15); stdin, stdout, stderr = c.exec_command('cd /var/www/dozeles && git fetch origin && git reset --hard origin/main && cd client && npm run build && pm2 restart all && systemctl reload nginx'); print(stdout.read().decode('utf-8', errors='replace')); c.close()"
```

#### Manual SSH Deployment
```bash
ssh root@2.25.90.226
cd /var/www/dozeles
git fetch origin && git reset --hard origin/main
cd client
npm run build
pm2 restart all
systemctl reload nginx
```

---

## Local Development Setup

### 1. Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm start
# Server runs on http://localhost:4000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# Vite dev server runs on http://localhost:5173
```

---

## API Reference

### Public Endpoints
- `GET /api/content` — Fetches website copy and CMS configuration
- `GET /api/pricing` — Retrieves dynamic pricing formula parameters
- `GET /api/reviews` — Retrieves published client reviews
- `POST /api/bookings` — Submits a client booking request & triggers email notifications
- `POST /api/contact` — Submits a general contact inquiry
- `POST /api/subscribe` — Subscribes an email to the newsletter

### Authentication Endpoints
- `POST /api/auth/login` — Authenticates credentials, logs session analytics, and returns JWT token
- `GET /api/auth/me` — Returns the current authenticated user profile

### Admin Endpoints (Requires `Authorization: Bearer <JWT>`)
- `GET /api/admin/leads` | `POST /api/admin/leads` | `PATCH /api/admin/leads/:id` — Sales CRM pipeline
- `GET /api/admin/customers` | `POST /api/admin/customers` — Customer CRM records
- `GET /api/admin/projects` | `POST /api/admin/projects` | `PATCH /api/admin/projects/:id` — Operations sites
- `POST /api/admin/projects/:id/photos` — Uploads categorized site photos (progress, before, after)
- `POST /api/admin/projects/:id/checkin` — Records GPS coordinates and arrival timestamps
- `GET /api/admin/quotes` | `POST /api/admin/quotes` | `PATCH /api/admin/quotes/:id` — Service quotes generator
- `GET /api/admin/bookings` | `PATCH /api/admin/bookings/:id` — Booking dispatch queue
- `POST /api/admin/pricing` — Updates residential and commercial pricing rules
- `PUT /api/admin/content/:section` — Updates CMS website copy
- `GET /api/admin/users` | `POST /api/admin/users` — Staff roster and login analytics

---

## Automated GTM & Marketing Automation (50 Skills)

The platform is supercharged with **50 specialized marketing, growth engineering, CRO, and sales automation skills** located in `.agents/skills/` (anchored by `.agents/product-marketing.md`).

- **Master Positioning Document**: [`.agents/product-marketing.md`](file:///c:/Users/dell/Downloads/cleaning-services-2026-04-23-10-47-55-utc/themeforest-clanyeco/dozeles-app/.agents/product-marketing.md)
- **Operations & Automation Guide**: [`docs/MARKETING_AUTOMATION_GUIDE.md`](file:///c:/Users/dell/Downloads/cleaning-services-2026-04-23-10-47-55-utc/themeforest-clanyeco/dozeles-app/docs/MARKETING_AUTOMATION_GUIDE.md)

### Key Automated Workflows
1. **B2B Cold Outreach (`cold-email`, `prospecting`)**: Multi-touch sequences targeting Bay Area facility managers, tech startups, medical clinics, and commercial property owners.
2. **Conversion Rate Optimization (`cro`, `copywriting`, `ab-testing`)**: Continuous optimization of pricing calculators, booking steps, and mobile CTAs.
3. **AI Answer Engine & Search Optimization (`ai-seo`, `seo-audit`, `schema`)**: Maximizing visibility across Perplexity, ChatGPT Search, Gemini, and Google Local Pack.
4. **Client Review & Referral Engine (`emails`, `referrals`, `churn-prevention`)**: Automated post-clean 5-star Google review triggers and B2B vendor referral credits.

---

## License & Intellectual Property
© 2026 Dozeles Professional Cleaning Services. All rights reserved. Commercial, Residential & Governmental Cleaning Services across California.
