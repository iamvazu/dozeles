import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

// Read source data to generate URLs
const read = (f) => fs.readFileSync(path.join(__dirname, '..', 'src', 'data', f), 'utf8');
const slugs = (src) => [...src.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);

const services = slugs(read('services.js'));
const cities = slugs(read('cities.js'));
const industries = slugs(read('industries.js'));
const blogPosts = slugs(read('blog.js'));

const urls = [
  '/', '/services-offered', '/pricing', '/locations', '/government-contract', 
  '/about-us', '/cleaning-process', '/reviews', '/before-after', '/contact-us', '/book', '/blog'
];

industries.forEach((ind) => urls.push(`/industries/${ind}`));
blogPosts.forEach((b) => urls.push(`/blog/${b}`));
services.forEach((s) => urls.push(`/services/${s}`));
cities.forEach((c) => urls.push(`/cleaning-services/${c}`));
services.forEach((s) => cities.forEach((c) => urls.push(`/services/${s}/${c}`)));
industries.forEach((ind) => cities.forEach((c) => urls.push(`/industries/${ind}/${c}`)));

async function prerender() {
  const app = express();
  
  // Keep original index in memory so we always serve a clean SPA shell to Puppeteer
  const rawIndexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
  
  // Serve static files but disable automatic index.html serving
  app.use(express.static(distPath, { index: false }));
  
  // SPA fallback
  app.use((req, res) => {
    res.send(rawIndexHtml);
  });

  const server = app.listen(3000, async () => {
    console.log(`Starting prerender for ${urls.length} pages...`);
    
    // Use headless: true instead of new for standard operation
    const browser = await puppeteer.launch({ headless: true });
    
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(batch.map(async (url) => {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000);
        
        try {
          await page.setRequestInterception(true);
          page.on('request', req => {
            const type = req.resourceType();
            if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
              req.abort();
            } else {
              req.continue();
            }
          });

          await page.goto(`http://localhost:3000${url}`, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction('document.getElementById("root") && document.getElementById("root").hasChildNodes()', { timeout: 60000 });
          await new Promise(r => setTimeout(r, 50));

          let html = await page.content();
          let outputPath = path.join(distPath, url);
          if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
          }
          fs.writeFileSync(path.join(outputPath, 'index.html'), html);
        } catch (e) {
          console.error(`Error prerendering ${url}:`, e.message);
        } finally {
          await page.close();
        }
      }));
      console.log(`Prerendered ${Math.min(i + batchSize, urls.length)} / ${urls.length}`);
    }

    await browser.close();
    server.close();
    console.log('Prerendering complete!');
  });
}

prerender().catch(err => {
  console.error(err);
  process.exit(1);
});
