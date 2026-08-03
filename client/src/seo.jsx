import { useEffect } from 'react';

export const SITE_URL = 'https://dozeles.com';

function upsert(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  const el = upsert(`meta[${attr}="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, name);
    return m;
  });
  el.setAttribute('content', content);
}

function setJsonLd(id, data) {
  let el = document.head.querySelector(`script[data-seo="${id}"]`);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-seo', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Per-route SEO: title, description, keywords, canonical, Open Graph,
 * Twitter cards, breadcrumb schema, FAQ schema, and Service schema.
 */
export default function Seo({
  title,
  description,
  keywords,
  path = '/',
  image = '/images/hero_main.png',
  faqs,
  breadcrumbs,
  serviceName,
  areaServed,
  noindex = false,
}) {
  const url = SITE_URL + path;

  useEffect(() => {
    if (title) document.title = title;
    setMeta('description', description);
    if (keywords?.length) setMeta('keywords', keywords.join(', '));
    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');

    const canonical = upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.rel = 'canonical';
      return l;
    });
    canonical.href = url;

    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', 'Dozeles Professional Cleaning', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    setJsonLd(
      'breadcrumb',
      breadcrumbs?.length
        ? {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((b, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: b.name,
              item: SITE_URL + b.path,
            })),
          }
        : null
    );

    setJsonLd(
      'faq',
      faqs?.length
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }
        : null
    );

    setJsonLd(
      'service',
      serviceName
        ? {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: serviceName,
            provider: {
              '@type': 'LocalBusiness',
              name: 'Dozeles Professional Cleaning',
              telephone: '+1-650-290-0280',
              email: 'dozelescleaning@gmail.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Daly City',
                addressRegion: 'CA',
                addressCountry: 'US',
              },
              priceRange: '$$',
              aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '6' },
            },
            areaServed: areaServed
              ? { '@type': 'City', name: areaServed }
              : ['San Francisco Bay Area', 'Northern California'],
            url,
          }
        : null
    );

    window.scrollTo(0, 0);
  }, [title, description, url, noindex]);

  return null;
}
