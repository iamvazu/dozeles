// Generates sitemap.xml + robots.txt for every programmatic SEO route.
// Runs automatically before `vite build` (see package.json prebuild).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = process.env.SITE_URL || 'https://dozeles.com';
const today = new Date().toISOString().slice(0, 10);

// Parse slugs straight out of the data files (no bundler needed)
const read = (f) => fs.readFileSync(path.join(__dirname, '..', 'src', 'data', f), 'utf8');
const slugs = (src) => [...src.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);

const services = slugs(read('services.js'));
const cities = slugs(read('cities.js'));
const industries = slugs(read('industries.js'));
const blogPosts = slugs(read('blog.js'));

const urls = [];
const add = (loc, priority, changefreq = 'weekly') =>
  urls.push({ loc: SITE + loc, priority, changefreq });

// Core pages
add('/', '1.0', 'weekly');
add('/services-offered', '0.9');
add('/pricing', '0.9');
add('/locations', '0.9');
add('/government-contract', '0.8');
add('/about-us', '0.7', 'monthly');
add('/cleaning-process', '0.8');
add('/reviews', '0.7', 'monthly');
add('/before-after', '0.6', 'monthly');
add('/contact-us', '0.7', 'monthly');
add('/book', '0.8', 'monthly');
add('/blog', '0.8', 'weekly');
const coreCount = urls.length;

// Industries pages
industries.forEach((ind) => add(`/industries/${ind}`, '0.8'));

// Blog posts
blogPosts.forEach((b) => add(`/blog/${b}`, '0.7'));

// Service hub pages
services.forEach((s) => add(`/services/${s}`, '0.9'));

// City pages
cities.forEach((c) => add(`/cleaning-services/${c}`, '0.8'));

// Service × City combination pages — the bulk of the PSEO surface
services.forEach((s) => cities.forEach((c) => add(`/services/${s}/${c}`, '0.7')));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE}/sitemap.xml
`;

const pub = path.join(__dirname, '..', 'public');
fs.mkdirSync(pub, { recursive: true });
fs.writeFileSync(path.join(pub, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(pub, 'robots.txt'), robots);

console.log(
  `Sitemap generated: ${urls.length} URLs = ${coreCount} core + ${industries.length} industries + ${blogPosts.length} blog posts + ${services.length} service hubs + ${cities.length} city pages + ${services.length * cities.length} service×city pages`
);
