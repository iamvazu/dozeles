import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../seo.jsx';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { PageBanner } from '../components/Shared.jsx';
import { FaqSection, CtaStrip } from '../components/Pseo.jsx';

const STEPS = [
  { n: '01', icon: 'phone', title: 'Free walkthrough', text: 'We visit your space, measure what actually matters — square footage, floor types, traffic, restrooms — and build a scope from what we see, not a template.' },
  { n: '02', icon: 'badge', title: 'Fixed written quote', text: 'You get a flat rate in writing, usually within one business day. No hourly billing, no surprise line items, no charge for supplies or equipment.' },
  { n: '03', icon: 'calendar', title: 'Schedule that fits you', text: 'Evenings, overnight, early morning, weekends. We work around your operations so your team never cleans around a crew.' },
  { n: '04', icon: 'spray', title: 'The clean itself', text: 'A consistent, background-checked crew works from your written checklist using green-certified products and HEPA-filtered equipment.' },
  { n: '05', icon: 'sparkles', title: 'Supervisor inspection', text: 'A supervisor verifies the work against the checklist on a rotating schedule and logs it, so you can see what was done rather than take our word for it.' },
  { n: '06', icon: 'shield', title: 'Follow-up & guarantee', text: 'Flag anything within 24 hours and we return to re-clean it free. That guarantee applies to every service line, every visit.' },
];

const ROOMS = [
  {
    key: 'kitchen',
    name: 'Kitchen',
    icon: 'home',
    img: 'https://dozeles.com/wp-content/uploads/2024/01/hero-01.jpg',
    body:
      'The kitchen gets more use than any other room, and that use shows. Cooking, eating, and foot traffic all lead to grease and buildup that ordinary wiping never removes. Our crews work from the top down so nothing settles onto surfaces we have already finished.',
    points: [
      'Dust and wipe countertops, eliminating crumbs and residue',
      'Degrease cooktops, hoods, and backsplash',
      'Clean inside and outside the microwave',
      'Polish exterior of all appliances',
      'Shine faucets, sinks, and cabinet hardware',
      'Sweep, mop, and detail floor edges',
    ],
  },
  {
    key: 'bathroom',
    name: 'Bathroom',
    icon: 'sparkles',
    img: 'https://dozeles.com/wp-content/uploads/2024/04/60-1024x683.jpg',
    body:
      'Bathrooms are judged harder than any other room, by guests and by inspectors. We clean top to bottom, including the corners and fixtures that collect dust and germs quietly between visits.',
    points: [
      'Scrub and rinse sinks, tubs, and showers',
      'Remove built-up soap scum and hard-water scale',
      'Disinfect toilets inside and out',
      'Clean lights, fixtures, mirrors, and exhaust fans',
      'Dust towel racks, holders, blinds, sills, and baseboards',
      'Sanitize high-touch handles and switches',
    ],
  },
  {
    key: 'bedroom',
    name: 'Bedroom',
    icon: 'clock',
    img: 'https://dozeles.com/wp-content/uploads/2024/01/family-cleaning-the-room-e1679898797424.jpg',
    body:
      'Your bedroom is where you recover. Dust builds on nightstands, allergens settle into carpets and curtains, and none of it is visible until it affects how you sleep. Regular bedroom cleaning is not cosmetic — it is air quality.',
    points: [
      'Wipe down corners to remove cobwebs',
      'HEPA vacuum carpets and wash hard floors',
      'Dry wood floors properly to protect the finish',
      'Vacuum furniture and under cushions',
      'Bed making and changing bed linens',
      'Dust nightstands, sills, blinds, and fixtures',
    ],
  },
  {
    key: 'living',
    name: 'Living & Dining',
    icon: 'users',
    img: 'https://dozeles.com/wp-content/uploads/2024/01/woman-cleaning-sofa-with-yellow-vacuum-cleaner-co-2021-08-26-20-11-23-utc.jpg',
    body:
      'These are the rooms where life actually happens — where people gather, eat, and unwind. Our commitment goes past wiping visible surfaces to the places that get skipped: under furniture, behind cushions, along baseboards.',
    points: [
      'Clean under furniture and in hard-to-reach areas',
      'Dust fixtures, baseboards, blinds, and decor',
      'Vacuum upholstery, cushions, and rugs',
      'Detail dining tables, chairs, and shared surfaces',
      'Use environmentally friendly green-certified products',
      'Apply advanced techniques for delicate finishes',
    ],
  },
  {
    key: 'office',
    name: 'Office & Workspace',
    icon: 'building',
    img: 'https://dozeles.com/wp-content/uploads/2024/01/hero-06.jpg',
    body:
      'Commercial spaces have a different problem than homes: more people touching more shared surfaces. Our workplace scope prioritizes high-touch disinfection alongside the traditional floor and waste work.',
    points: [
      'Sanitize workstations, desks, and shared equipment',
      'Reset and detail conference and meeting rooms',
      'Restroom cleaning, disinfection, and restocking',
      'Break room, kitchen, and appliance cleaning',
      'Interior glass, partitions, and reception detail',
      'Disinfect handles, switches, rails, and elevator panels',
    ],
  },
];

const BENEFITS = [
  { icon: 'leaf', title: 'Healthier indoor air', text: 'HEPA filtration captures 99.97% of airborne particles, meaningfully reducing dust, dander, and allergen load in the spaces you spend the most time in.' },
  { icon: 'clock', title: 'Time back in your week', text: 'The average household spends six-plus hours a week on cleaning. That is a full working day returned to you, every single week.' },
  { icon: 'shield', title: 'Fewer sick days', text: 'Consistent disinfection of shared surfaces measurably reduces transmission in offices, schools, and any high-traffic building.' },
  { icon: 'badge', title: 'Protected surfaces', text: 'Correct products and methods extend the life of floors, counters, and fixtures. Wrong ones quietly destroy them over years.' },
  { icon: 'smile', title: 'Lower daily stress', text: 'Clutter and grime carry a real cognitive load. Walking into a finished space is a measurable mood difference, not a marketing line.' },
  { icon: 'star', title: 'A better impression', text: 'Clients, guests, and staff form an opinion within seconds of entering. Cleanliness is the fastest signal you control.' },
];

const TIPS = [
  'Keep your dining table set or clear — it discourages using the surface as a landing zone for keys, mail, and paperwork.',
  'Use mats or rugs in high-traffic entryways. Most of the dirt in a building walks in on shoes.',
  'Create designated homes for items. Filing trays, hooks, and baskets prevent the slow creep of clutter onto every surface.',
  'Disperse cleaning supplies around the space instead of one central closet. Small tasks get done when supplies are within reach.',
  'Pick one room and one small task per day — wipe the bathroom mirror, sweep the kitchen. Five minutes daily beats four hours on Saturday.',
];

const PROCESS_FAQS = [
  { q: 'How long does a typical cleaning take?', a: 'A standard recurring home cleaning runs 2 to 4 hours depending on size. A first-time deep clean takes 4 to 8 hours. Commercial janitorial visits vary with square footage but are scoped so the crew finishes within your access window. We give you a realistic time estimate with your quote and do not cut the checklist short to hit it.' },
  { q: 'Do I need to prepare anything before you arrive?', a: 'Not much. Picking up loose clutter and personal items helps us spend our time cleaning rather than moving things, but it is not required. For commercial spaces, tell us about restricted areas, alarm codes, and access procedures during the walkthrough and we handle the rest.' },
  { q: 'Will I get the same cleaners every visit?', a: 'Yes, wherever possible. Consistent crews are the single biggest factor in whether a cleaning contract holds up over years — they learn your space and your preferences. We cross-train backup staff on your specific scope so coverage never depends on one person.' },
  { q: 'What products do you use?', a: 'Green-certified, low-VOC products throughout, paired with HEPA-filtered vacuums. They are safe around children, pets, and staff with sensitivities. If you have specific products you would rather we use, or ones we should avoid, tell us and we will adjust at no cost.' },
  { q: 'What if something is missed?', a: 'Tell us within 24 hours and we return to re-clean that area free of charge. No arguments and no invoice. That guarantee applies to every service line and every visit, residential and commercial.' },
];

export default function CleaningProcess() {
  const [tab, setTab] = useState('kitchen');
  const room = ROOMS.find((r) => r.key === tab);

  return (
    <>
      <Seo
        title="Our Cleaning Process | Room-by-Room Checklist — Dozeles Cleaning"
        description="See exactly how Dozeles cleans: our 6-step process, a room-by-room checklist for kitchens, bathrooms, bedrooms, living areas and offices, plus tips to keep your space in top shape. Bay Area & Northern California."
        keywords={[
          'cleaning process',
          'house cleaning checklist',
          'what does a cleaning service include',
          'room by room cleaning',
          'professional cleaning steps',
          'office cleaning checklist',
          'deep cleaning process',
        ]}
        path="/cleaning-process"
        faqs={PROCESS_FAQS}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about-us' },
          { name: 'Cleaning Process', path: '/cleaning-process' },
        ]}
      />
      <PageBanner title="Our Cleaning Process" crumb="Cleaning Process" />

      {/* intro */}
      <section>
        <div className="container" style={{ maxWidth: 860 }}>
          <Reveal className="center">
            <div className="eyebrow">Cleaning Process</div>
            <h2 className="h2">Exactly How We Work</h2>
            <p className="lead">
              When you are balancing a busy family, long hours, and everything else in a week,
              finding time to keep a space in order is genuinely hard. Coming home — or walking into
              your office — should never feel like another chore waiting for you. Here is precisely
              what we do, so there are no surprises on either side.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 6 step process */}
      <section className="section-alt" style={{ paddingTop: 0 }}>
        <div className="container" style={{ paddingTop: 84 }}>
          <Reveal className="center" style={{ marginBottom: 48 }}>
            <div className="eyebrow">Step by Step</div>
            <h2 className="h2">From First Call to Finished Space</h2>
          </Reveal>
          <div className="grid grid-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={(i % 3) * 110}>
                <div className="proc-card">
                  <span className="proc-n">{s.n}</span>
                  <div className="icon"><Icon name={s.icon} /></div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* room by room tabs */}
      <section>
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 40 }}>
            <div className="eyebrow">Room by Room Cleaning Process</div>
            <h2 className="h2">Full Service Cleaning</h2>
            <p className="lead">
              Every room has its own checklist. Select one to see exactly what our crews do.
            </p>
          </Reveal>

          <div className="room-tabs" role="tablist">
            {ROOMS.map((r) => (
              <button
                key={r.key}
                role="tab"
                aria-selected={tab === r.key}
                className={`room-tab ${tab === r.key ? 'on' : ''}`}
                onClick={() => setTab(r.key)}
              >
                <Icon name={r.icon} size={17} /> {r.name}
              </button>
            ))}
          </div>

          <div className="room-panel" key={room.key}>
            <div className="split" style={{ gap: 44 }}>
              <div className="prose">
                <h3 className="h3">{room.name} Cleaning</h3>
                <p>{room.body}</p>
                <ul className="checklist">
                  {room.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                <Link to="/book" className="btn btn-blue" style={{ marginTop: 24 }}>
                  Get a Free Quote
                </Link>
              </div>
              <img src={room.img} alt={`${room.name} cleaning by Dozeles`} loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* benefits */}
      <section className="why-band">
        <span className="why-blob b1" aria-hidden="true" />
        <span className="why-blob b2" aria-hidden="true" />
        <Icon name="sparkles" size={40} className="why-spark s1" />
        <div className="container">
          <Reveal className="center" style={{ marginBottom: 48 }}>
            <div className="eyebrow">How We Help</div>
            <h2 className="h2">How a Clean Space Impacts Your Life</h2>
            <p className="lead">
              Hiring professional cleaners frees up time for the things that actually matter — but
              the benefits go well past a tidy room at the end of a long day.
            </p>
          </Reveal>
          <div className="grid grid-3">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={(i % 3) * 110}>
                <div className="why-card">
                  <div className="icon"><Icon name={b.icon} /></div>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="center" style={{ marginTop: 46 }}>
            <Link to="/contact-us" className="btn btn-white">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* tips */}
      <section>
        <div className="container split" style={{ gap: 52 }}>
          <Reveal variant="left">
            <div className="eyebrow">Tips</div>
            <h2 className="h2">Tips to Keep Your Space in Top Shape</h2>
            <p className="lead" style={{ marginBottom: 18 }}>
              Dozeles recommends weekly service for most homes and nightly janitorial for offices
              over twenty staff. Between visits, these five habits do most of the work.
            </p>
            <Link to="/book" className="btn btn-blue">Get a Free Quote</Link>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <ol className="tip-list">
              {TIPS.map((t, i) => (
                <li key={t}><span className="tip-n">{i + 1}</span>{t}</li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <FaqSection faqs={PROCESS_FAQS} heading="Process FAQs" />
      <CtaStrip />
    </>
  );
}
