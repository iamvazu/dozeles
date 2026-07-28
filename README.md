# Dozeles — React PWA + Node.js + Programmatic SEO Engine

A full rebuild of [dozeles.com](https://dozeles.com) off WordPress: React (Vite) progressive web app, Node.js/Express backend, and a programmatic SEO engine generating **749 indexable pages**.

---

## The SEO engine (the core of this build)

| Page type | URL pattern | Count |
|---|---|---|
| Core pages | `/`, `/pricing`, `/locations`, … | 10 |
| Service hubs | `/services/<service>` | 9 |
| City pages | `/cleaning-services/<city>` | 73 |
| **Service × City** | `/services/<service>/<city>` | **657** |
| **Total** | | **749** |

**9 services** — commercial cleaning, janitorial services, office cleaning, residential house cleaning, move-in/move-out, post-construction, government facility, Airbnb/vacation rental, disinfection.

**73 cities** across the Bay Area, East Bay, North Bay, Sacramento Valley, and Central Valley.

Every generated page has:

- Unique `<title>`, meta description, and keyword set built from service × city tokens
- Unique on-page copy — each city carries its own `blurb`, neighborhoods, county, region, and population, so pages are not thin duplicates
- Canonical URL, Open Graph, and Twitter Card tags
- **JSON-LD schema**: LocalBusiness, Service, BreadcrumbList, and FAQPage (rich-result eligible)
- City-specific FAQs with real pricing ranges — the answers Google surfaces directly
- An internal link mesh (service→city, city→service, neighbor cities) so crawlers reach every page

`sitemap.xml` and `robots.txt` regenerate automatically on every build via `client/scripts/generate-sitemap.js`.

**Adding a city takes one line** in `client/src/data/cities.js` — that instantly generates 10 new pages (1 city page + 9 service×city pages) and adds them to the sitemap.

---

## Design system

Extracted directly from the ThemeForest **clanyeco** theme files in this folder:

- **Bebas Neue** condensed uppercase display headings + **Inter** body — the theme's exact typographic pairing
- Ink black `#191919` text, off-white `#F3F5F2` surfaces, warm cream `#F3EDE3`, hairline `#DEDEDE` borders — the theme's real palette values, pulled from `elementor-global-defaults.json`
- Flat, bold, full-bleed section rhythm matching the theme's layout language

**The accent is blue only.** The theme ships a red/yellow accent; that has been replaced throughout with a blue scale (`#0E5FD8` action blue, `#0A2540` deep navy, `#EAF1FB` tint). No green anywhere in the build.

---

## Pricing psychology

The `/pricing` page applies six deliberate techniques:

1. **Anchoring** — the $279 Signature tier makes $189 Complete read as reasonable
2. **Center-stage effect** — the target plan sits in the middle, enlarged, badged "Most Popular"
3. **Decoy framing** — greyed-out missing features on the entry tier push buyers up
4. **Charm pricing** — $149 / $189 / $279, never round numbers
5. **Loss aversion** — struck-through "was" pricing on every residential tier
6. **Risk reversal** — the guarantee block sits immediately below the cards, where hesitation peaks

Residential and commercial tiers are tabbed so buyers never see more than three options at once.

---

## Run it

```bash
# Backend
cd server
cp .env.example .env      # set ADMIN_PASSWORD and JWT_SECRET
npm install
npm start                 # http://localhost:4000

# Frontend (dev)
cd client
npm install
npm run dev               # http://localhost:5173
```

**Production:** `cd client && npm run build` (regenerates the sitemap, then builds), then `cd ../server && npm start` — the Node server serves the built PWA at `localhost:4000` with SPA routing. A production build is already included in `client/dist`.

Deploy the `dozeles-app` folder to any Node host (Render, Railway, Fly.io, a VPS). HTTPS is required for PWA install prompts.

---

## Backend

Express API with a JSON data store (no database server needed):

- `GET /api/content`, `GET /api/reviews` — public content
- `POST /api/bookings`, `/api/contact`, `/api/subscribe` — public forms
- `POST /api/auth/login` — JWT admin auth
- `/api/admin/*` — manage bookings, messages, reviews, subscribers, and edit every content section
- Optional SMTP notifications; without SMTP, submissions still save and appear in the admin

**Admin panel** at `/admin` — log in with the credentials in `server/.env` (defaults `admin@dozeles.com` / `admin123`, change them).

---

## Ranking checklist (do these after launch)

1. **Google Business Profile** — claim and fully complete it; add every service and service area. Local pack rankings depend on this more than the website.
2. **Submit the sitemap** in Google Search Console: `https://dozeles.com/sitemap.xml`
3. **Reviews** — Google reviews are the strongest local ranking factor. Ask every satisfied client; aim for 50+.
4. **NAP consistency** — identical name, address, phone across Yelp, BBB, Angi, Thumbtack, Nextdoor, and Apple Maps.
5. **Download the images** from the WordPress uploads into `client/public/images/` and update URLs in `server/data/seed.json` before retiring WordPress. All image URLs live in content data — no code changes needed.
6. **301 redirect** old WordPress URLs to the new equivalents so existing rankings carry over.

Note: the PSEO pages are client-rendered. Google renders JavaScript and will index them, but for maximum crawl efficiency consider adding prerendering (`vite-plugin-prerender`) or moving to Next.js SSR later — the data layer in `src/data/` ports over unchanged.

---

## Verified

- Production build passes; 749 URLs in sitemap
- 8 representative routes render-tested (home, service hub, service×city, city, pricing, locations, services index) — all with unique H1s, unique titles, canonicals, and 1–3 JSON-LD blocks each
- ~9,000–10,000 characters of unique content per PSEO page (not thin content)
- API endpoints tested: bookings, validation, admin auth, content editing, contact, subscribe
