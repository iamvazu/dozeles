// ============================================================
// SERVICE CATALOG — the backbone of the programmatic SEO engine.
// Every service generates: /services/<slug> and /services/<slug>/<city>
// ============================================================

export const SERVICES = [
  {
    slug: 'commercial-cleaning',
    title: 'Commercial Cleaning Services',
    short: 'Commercial Cleaning',
    icon: 'store',
    hero: '/images/commercial_cleaning.png',
    tagline: 'Spotless workplaces that protect your brand and your people.',
    metaTitle: 'Commercial Cleaning Services {city} | Dozeles Janitorial',
    metaDesc:
      'Professional commercial cleaning services in {city}, CA. Licensed, insured, eco-friendly office and building cleaning. Free quote — call 650-290-0280.',
    keywords: [
      'commercial cleaning services',
      'commercial cleaning company',
      'business cleaning services',
      'retail cleaning',
      'building maintenance cleaning',
    ],
    intro:
      'Dozeles delivers commercial cleaning services built around how your business actually operates. We clean retail floors, offices, showrooms, warehouses, medical suites, and mixed-use buildings on schedules that work around your hours — early morning, evenings, overnight, or weekends. Every commercial cleaning contract is backed by documented checklists, supervisor walkthroughs, and a single point of contact who answers the phone.',
    body: [
      'A dirty workplace costs more than most owners realize. Studies of office environments consistently link surface contamination to increased sick days, and customers form an opinion about your business within seconds of walking through the door. Our commercial cleaning program is designed to remove that risk entirely: consistent crews, green-certified products, HEPA filtration on every vacuum, and a quality-control process that catches problems before you ever notice them.',
      'We build every commercial cleaning proposal from a walkthrough, not a template. Square footage, floor types, traffic patterns, restroom count, waste volume, and compliance requirements all shape the scope. That means you pay for the cleaning your building actually needs — no padded line items, no surprise charges when the scope changes.',
    ],
    includes: [
      'Dusting and sanitizing of all work surfaces, desks, and shared equipment',
      'Restroom deep cleaning, disinfection, and consumable restocking',
      'Hard-floor sweeping, mopping, buffing, and finish maintenance',
      'Carpet vacuuming with HEPA filtration and periodic extraction',
      'Break room, kitchen, and appliance cleaning and sanitizing',
      'Trash, recycling, and compost removal with liner replacement',
      'Interior glass, partitions, entry doors, and reception cleaning',
      'High-touch point disinfection — handles, switches, rails, elevators',
      'Entryway matting, lobby detail, and first-impression zones',
      'Supply inventory management and monthly usage reporting',
    ],
    industries: [
      'Corporate offices and coworking spaces',
      'Retail stores and shopping centers',
      'Medical and dental offices',
      'Warehouses and light industrial',
      'Restaurants and food service',
      'Auto dealerships and showrooms',
      'Banks, credit unions, and professional services',
      'Fitness studios and wellness centers',
    ],
    faqs: [
      {
        q: 'How much do commercial cleaning services cost in {city}?',
        a: 'Most commercial cleaning contracts in {city} run between $0.08 and $0.20 per square foot per visit, depending on frequency, floor type, and scope. A 5,000 sq ft office cleaned three nights a week typically lands between $1,200 and $2,400 per month. We provide a fixed written quote after a free on-site walkthrough, so the number you approve is the number you pay.',
      },
      {
        q: 'Do you clean outside of business hours?',
        a: 'Yes. The majority of our {city} commercial accounts are cleaned after hours — evenings, overnight, or early morning — so your team walks into a finished space and never works around a cleaning crew. Weekend and holiday coverage is available at no premium on most contracts.',
      },
      {
        q: 'Are you licensed and insured for commercial work?',
        a: 'Dozeles is fully licensed, bonded, and carries general liability and workers compensation coverage. We provide certificates of insurance naming your business or property manager as additional insured before the first cleaning, and we can meet elevated coverage requirements for larger properties.',
      },
      {
        q: 'Can we change our cleaning schedule as our needs change?',
        a: 'Absolutely. Commercial contracts are month-to-month with no long-term lock-in. Scale frequency up during busy seasons, add square footage when you expand, or pause specific services — just give us reasonable notice and we adjust the scope and the invoice.',
      },
    ],
  },
  {
    slug: 'janitorial-services',
    title: 'Janitorial Services',
    short: 'Janitorial Services',
    icon: 'building',
    hero: '/images/janitorial_services.png',
    tagline: 'Daily janitorial programs that never miss a night.',
    metaTitle: 'Janitorial Services {city} CA | Commercial Janitorial Company',
    metaDesc:
      'Reliable janitorial services in {city}, CA for offices, schools, and public buildings. Nightly, weekly, and custom janitorial contracts. Free quote.',
    keywords: [
      'janitorial services',
      'janitorial company',
      'commercial janitorial services',
      'nightly janitorial',
      'building janitorial contractor',
    ],
    intro:
      'Janitorial service is a reliability business, not a cleaning business. Anyone can clean a building once — the hard part is doing it correctly on the 340th night in a row, when a crew member is out sick and the trash chute is backed up. Dozeles has run recurring janitorial programs across Northern California for two decades, with supervisor-verified checklists, cross-trained backup staff, and same-day response on anything that slips.',
    body: [
      'Our janitorial contracts are built around documented scopes of work. Every task is assigned a frequency — nightly, weekly, monthly, quarterly — and every completed visit is logged. When your facilities manager asks whether the stairwells were detailed this month, we can show them the record instead of guessing.',
      'Staffing is where most janitorial companies fail. We assign consistent crews to each building so your team sees the same faces, and we cross-train backup staff on your specific scope so coverage never depends on one person showing up. Every crew member is background-checked, trained on green-certified products and HEPA equipment, and supervised on a rotating walkthrough schedule.',
    ],
    includes: [
      'Nightly trash removal, recycling, and compost handling',
      'Restroom cleaning, disinfection, and supply restocking',
      'Floor care programs — sweep, mop, buff, strip, wax, and seal',
      'Carpet vacuuming and scheduled hot-water extraction',
      'Common area, lobby, corridor, and stairwell detail',
      'Break room and kitchen sanitizing',
      'High-touch disinfection of shared surfaces',
      'Interior and partition glass cleaning',
      'Supervisor quality inspections with written reports',
      'Consumable inventory tracking and restocking',
    ],
    industries: [
      'Multi-tenant office buildings',
      'Schools and educational campuses',
      'Government and municipal facilities',
      'Churches and community centers',
      'Property management portfolios',
      'Manufacturing and distribution',
      'Medical office buildings',
      'Transit and public works facilities',
    ],
    faqs: [
      {
        q: 'What is the difference between janitorial services and commercial cleaning?',
        a: 'Janitorial services are recurring maintenance — the nightly or weekly work that keeps a building consistently clean, including trash, restrooms, floors, and high-touch surfaces. Commercial cleaning often refers to broader or periodic projects like deep cleans, carpet extraction, and post-event cleanup. Dozeles provides both in {city}, usually bundled into one contract so you have a single vendor and a single invoice.',
      },
      {
        q: 'How often should our building be cleaned?',
        a: 'It depends on foot traffic and building type. Offices with 20 or more staff generally need nightly or three-nights-per-week janitorial service. Smaller professional offices often do well with twice weekly. High-traffic public buildings, schools, and medical facilities almost always require daily service. We recommend a frequency during the walkthrough based on what your building actually generates.',
      },
      {
        q: 'Do you provide the cleaning supplies and equipment?',
        a: 'Yes — all labor, equipment, green-certified chemicals, and HEPA-filtered machines are included in your janitorial contract. We can also manage and restock your consumables (paper, soap, liners) at cost plus handling, which most clients prefer over running their own supply ordering.',
      },
      {
        q: 'What happens if we are not happy with a cleaning?',
        a: 'Call or email us and we will re-clean the area within one business day at no charge. Every Dozeles janitorial contract carries a satisfaction guarantee, and recurring issues trigger a supervisor walkthrough with you to correct the scope or the crew.',
      },
    ],
  },
  {
    slug: 'office-cleaning',
    title: 'Office Cleaning Services',
    short: 'Office Cleaning',
    icon: 'building',
    hero: '/images/office_cleaning.png',
    tagline: 'Healthier offices, fewer sick days, better first impressions.',
    metaTitle: 'Office Cleaning Services {city} | Professional Office Cleaners',
    metaDesc:
      'Professional office cleaning services in {city}, CA. Nightly and weekly office cleaners, eco-friendly products, HEPA filtration. Get a free quote today.',
    keywords: [
      'office cleaning services',
      'office cleaners',
      'office cleaning company',
      'workplace cleaning',
      'corporate office cleaning',
    ],
    intro:
      'Your office says something about your company before anyone speaks. Dozeles office cleaning keeps workstations, conference rooms, restrooms, and break areas consistently clean using green-certified products and HEPA-filtered equipment that captures 99.97% of airborne particles — which matters as much for your team’s health as for how the space looks.',
    body: [
      'Modern offices have changed. Hot-desking, hybrid schedules, and shared equipment mean more people touch the same surfaces than ever before. Our office cleaning scope prioritizes high-touch disinfection — door handles, light switches, shared monitors and keyboards, conference tables, kitchen appliances — alongside the traditional vacuum-and-empty-trash work.',
      'We schedule office cleaning around your team, not the other way around. Most of our {city} office accounts are serviced in the evening after the last person leaves, so employees arrive to a finished space. For offices with 24/7 operations or sensitive areas, we build a phased schedule that avoids disruption entirely.',
    ],
    includes: [
      'Workstation, desk, and shared surface sanitizing',
      'Conference and meeting room reset and detail',
      'Restroom cleaning, disinfection, and restocking',
      'Break room, kitchen, refrigerator, and microwave cleaning',
      'Carpet vacuuming with HEPA filtration',
      'Hard-floor mopping and finish maintenance',
      'Reception and lobby first-impression detail',
      'Interior glass, partitions, and entry doors',
      'Trash, recycling, and compost removal',
      'High-touch disinfection of switches, handles, and rails',
    ],
    industries: [
      'Tech and startup offices',
      'Law and accounting firms',
      'Coworking and flex spaces',
      'Insurance and real estate offices',
      'Nonprofit and association offices',
      'Executive suites',
      'Call centers',
      'Corporate headquarters',
    ],
    faqs: [
      {
        q: 'How much does office cleaning cost in {city}?',
        a: 'Office cleaning in {city} typically runs $0.09 to $0.18 per square foot per visit. A 3,000 sq ft office cleaned twice a week generally falls between $700 and $1,300 per month. Pricing depends on frequency, restroom count, kitchen size, and floor type — all of which we assess during a free walkthrough before quoting a fixed monthly rate.',
      },
      {
        q: 'Do your office cleaners work evenings or weekends?',
        a: 'Yes. Most {city} office cleaning is performed after hours so your staff is never working around a crew. We offer evening, overnight, early-morning, and weekend schedules, and we can split the scope so sensitive areas are cleaned while your team is present if security requires it.',
      },
      {
        q: 'Are your cleaning products safe for employees with allergies?',
        a: 'We use green-certified, low-VOC products and HEPA-filtered vacuums that capture 99.97% of airborne particles, which significantly reduces allergen load compared with conventional cleaning. If specific team members have sensitivities, tell us and we will adjust the product list for your building at no extra cost.',
      },
      {
        q: 'Can you clean our office during a hybrid or partial-occupancy schedule?',
        a: 'Yes, and it is one of the more common requests we get. We can align cleaning frequency to your actual occupancy days — for example, deep service on Tuesday and Thursday nights when the office is full, with lighter maintenance on low-occupancy days. It usually reduces cost without reducing cleanliness.',
      },
    ],
  },
  {
    slug: 'residential-cleaning',
    title: 'Residential House Cleaning',
    short: 'Residential Cleaning',
    icon: 'home',
    hero: '/images/residential_cleaning.png',
    tagline: 'Come home to a house that feels genuinely clean.',
    metaTitle: 'House Cleaning Services {city} CA | Residential Cleaners',
    metaDesc:
      'Trusted residential house cleaning services in {city}, CA. Weekly, biweekly, and monthly home cleaning. Eco-friendly, background-checked cleaners. Free quote.',
    keywords: [
      'house cleaning services',
      'residential cleaning services',
      'home cleaning',
      'maid service',
      'weekly house cleaners',
    ],
    intro:
      'Dozeles residential cleaning gives you your weekends back. Our house cleaners work from a room-by-room checklist covering kitchens, bathrooms, bedrooms, and living areas, using eco-friendly products that are safe around children and pets. Same team every visit, so they learn your home and your preferences.',
    body: [
      'Most cleaning services rush. We schedule realistic time blocks so the work is actually done — baseboards wiped rather than skipped, shower grout scrubbed rather than sprayed, under furniture vacuumed rather than around it. That is why the majority of our {city} residential clients have been with us for years.',
      'Every cleaner is background-checked, insured, and trained on our residential checklist before entering a home. If you want extras like inside-the-oven, inside-the-fridge, interior windows, or laundry, they are available as add-ons — you are never upsold on the doorstep.',
    ],
    includes: [
      'Kitchen — counters, sinks, exterior appliances, cabinet fronts, floors',
      'Bathrooms — tubs, showers, toilets, tile, mirrors, fixtures',
      'Bedrooms — dusting, bed making, floors, mirrors, surfaces',
      'Living areas — dusting, upholstery vacuuming, floors',
      'Baseboards, door frames, light switches, and handles',
      'Interior glass and mirror cleaning',
      'Trash and recycling removal',
      'Hardwood, tile, and laminate floor care',
      'HEPA-filtered vacuuming throughout',
      'Optional add-ons — oven, fridge, windows, laundry, cabinets',
    ],
    industries: [
      'Single-family homes',
      'Condos and apartments',
      'Townhomes',
      'Luxury and estate homes',
      'Vacation and second homes',
      'Senior residences',
      'New-parent households',
      'Busy professional households',
    ],
    faqs: [
      {
        q: 'How much does house cleaning cost in {city}?',
        a: 'A standard recurring house cleaning in {city} typically runs $140 to $260 depending on square footage, number of bathrooms, and frequency. Weekly service is priced lower per visit than monthly because less builds up between cleanings. First-time deep cleans are usually 1.5x a standard visit. We quote a flat rate before we start — no hourly surprises.',
      },
      {
        q: 'Do I need to be home during the cleaning?',
        a: 'No. Most {city} clients give us a key, code, or lockbox access and come home to a finished house. All our cleaners are background-checked, bonded, and insured, and we log every entry and exit. If you prefer to be home, that is completely fine too.',
      },
      {
        q: 'Are your cleaning products safe for kids and pets?',
        a: 'Yes. We use green-certified, non-toxic products throughout your home and HEPA-filtered vacuums that capture 99.97% of airborne particles including pet dander. If you have specific product preferences or your own supplies you would rather we use, we are happy to accommodate.',
      },
      {
        q: 'What is the difference between a deep clean and a standard clean?',
        a: 'A standard recurring clean maintains a home that is already in good shape. A deep clean addresses buildup — inside appliances, grout, baseboards, window tracks, behind and under furniture, light fixtures, and vents. We recommend starting with a deep clean, then maintaining with standard visits, which keeps ongoing costs lower.',
      },
    ],
  },
  {
    slug: 'move-in-move-out-cleaning',
    title: 'Move-In / Move-Out Cleaning',
    short: 'Move In / Move Out',
    icon: 'truck',
    hero: 'https://dozeles.com/wp-content/uploads/2024/01/hero-01.jpg',
    tagline: 'Deposit-back clean, guaranteed.',
    metaTitle: 'Move Out Cleaning Services {city} CA | Move In Cleaners',
    metaDesc:
      'Move-in and move-out cleaning services in {city}, CA. Deep cleaning for tenants, landlords, and property managers. Deposit-back guarantee. Free quote.',
    keywords: [
      'move out cleaning',
      'move in cleaning',
      'end of tenancy cleaning',
      'apartment move out cleaning',
      'rental turnover cleaning',
    ],
    intro:
      'Move-out cleaning is judged by someone with a checklist and a financial incentive to find problems. Our move-in/move-out service is built specifically to pass that inspection: inside every appliance, every cabinet and drawer, window tracks, baseboards, light fixtures, vents, and closets — the places standard cleaning skips and inspectors always check.',
    body: [
      'For tenants, this is about the deposit. We clean to the standard property managers in {city} actually enforce, and we document the finished condition with photos so you have evidence if there is a dispute.',
      'For landlords and property managers, this is about turnover speed. A unit that shows well rents faster and at a higher rate. We coordinate directly with your leasing calendar and can turn most units within 24 to 48 hours of key handoff.',
    ],
    includes: [
      'Inside oven, refrigerator, dishwasher, and microwave',
      'Inside and outside all cabinets, drawers, and closets',
      'Full bathroom detail — grout, tile, fixtures, exhaust fans',
      'Baseboards, door frames, trim, and switch plates',
      'Interior windows, sills, and window tracks',
      'Light fixtures, ceiling fans, and vent covers',
      'Wall spot cleaning and scuff removal',
      'All flooring — vacuum, mop, and edge detail',
      'Garage, patio, and balcony sweep-out',
      'Photo documentation of finished condition',
    ],
    industries: [
      'Apartment renters and tenants',
      'Landlords and property managers',
      'Real estate agents and stagers',
      'Home buyers and sellers',
      'Student housing',
      'Corporate relocation',
      'HOA-managed properties',
      'Short-term rental turnovers',
    ],
    faqs: [
      {
        q: 'How much does move-out cleaning cost in {city}?',
        a: 'Move-out cleaning in {city} generally runs $280 to $650 depending on square footage and condition. A one-bedroom apartment typically lands around $300 to $400; a three-bedroom house is usually $500 to $700. Because move-out work is deep cleaning inside appliances and cabinets, it prices higher than a standard visit. We quote flat rate after a quick walkthrough or a few photos.',
      },
      {
        q: 'Will this cleaning get my security deposit back?',
        a: 'Our move-out scope is built around what property managers in {city} actually inspect, and we back it with a re-clean guarantee: if your landlord flags a cleaning issue within 72 hours of our service, we return and correct it at no charge. We also photograph the finished unit so you have documentation.',
      },
      {
        q: 'How far in advance should I book?',
        a: 'Book 5 to 7 days ahead when possible, especially at month-end when demand spikes across the Bay Area. That said, we hold same-week capacity for urgent turnovers and can often accommodate next-day requests — call us and we will tell you honestly what is available.',
      },
      {
        q: 'Should the unit be empty before you clean?',
        a: 'Ideally yes. An empty unit lets us clean inside closets, behind appliances, and along every baseboard, which is exactly where inspections focus. If furniture must remain, we still clean thoroughly but we will note what could not be accessed so there are no surprises.',
      },
    ],
  },
  {
    slug: 'post-construction-cleaning',
    title: 'Post-Construction Cleaning',
    short: 'Post-Construction',
    icon: 'hardhat',
    hero: 'https://dozeles.com/wp-content/uploads/2024/01/hero-06.jpg',
    tagline: 'From dust-covered jobsite to handover-ready in one pass.',
    metaTitle: 'Post Construction Cleaning {city} CA | Construction Cleanup',
    metaDesc:
      'Post-construction cleaning services in {city}, CA. Rough, final, and touch-up construction cleanup for contractors and builders. Free quote — 650-290-0280.',
    keywords: [
      'post construction cleaning',
      'construction cleanup services',
      'final clean construction',
      'builder cleaning services',
      'renovation cleanup',
    ],
    intro:
      'Construction dust is not normal dust. It is fine, abrasive, and it settles into every track, vent, and seam for weeks after the work stops. Dozeles post-construction cleaning is a systematic top-to-bottom process using HEPA filtration and commercial equipment — the only reliable way to get a newly built or renovated space genuinely handover-ready.',
    body: [
      'We work in the standard three phases contractors expect: rough clean during construction to keep the site safe and workable, final clean after trades are out, and touch-up right before walkthrough or handover. Most {city} general contractors book all three; some book only the final.',
      'Timing matters on construction projects, and we schedule around your punch list rather than our convenience. We can mobilize crews on short notice for delayed handovers, and we coordinate directly with your superintendent so cleaning does not become the thing holding up your certificate of occupancy.',
    ],
    includes: [
      'HEPA vacuuming of all surfaces, ceilings, walls, and floors',
      'Construction dust removal from vents, ducts, and fixtures',
      'Adhesive, paint, caulk, and sticker removal from glass',
      'Window, frame, and track detail cleaning',
      'Inside cabinets, drawers, closets, and fixtures',
      'Fixture, appliance, and hardware polish',
      'Floor scrub, buff, and finish preparation',
      'Debris and packaging material removal',
      'Restroom and kitchen final detail',
      'Pre-walkthrough touch-up service',
    ],
    industries: [
      'General contractors',
      'Home builders and developers',
      'Commercial tenant improvement',
      'Renovation and remodel contractors',
      'Architects and design firms',
      'Property developers',
      'Retail buildout',
      'Restaurant buildout',
    ],
    faqs: [
      {
        q: 'How much does post-construction cleaning cost in {city}?',
        a: 'Post-construction cleaning in {city} typically runs $0.30 to $0.75 per square foot depending on the phase and how much debris and dust remains. Final cleans price higher than rough cleans. A 2,000 sq ft residential remodel final clean usually falls between $700 and $1,400. We quote after seeing the site or reviewing photos.',
      },
      {
        q: 'When should we schedule the final clean?',
        a: 'Schedule the final clean after all trades are finished and before flooring protection comes up — typically 2 to 3 days before your walkthrough. That window leaves room for a touch-up pass if any trade returns. We hold the slot and confirm 48 hours out since construction timelines move.',
      },
      {
        q: 'Do you handle construction debris removal?',
        a: 'We remove packaging, protective materials, and light construction debris as part of the clean. Heavy debris, lumber, drywall scrap, and anything requiring a dumpster or hauling permit is outside our scope, but we coordinate with your hauler so the sequencing works.',
      },
      {
        q: 'Are you insured to work on active construction sites?',
        a: 'Yes. We carry general liability and workers compensation coverage that meets standard GC requirements in {city}, and we provide certificates naming your company as additional insured. Our crews are trained on jobsite safety and follow your site rules and PPE requirements.',
      },
    ],
  },
  {
    slug: 'government-facility-cleaning',
    title: 'Government Facility Cleaning',
    short: 'Government Facilities',
    icon: 'landmark',
    hero: 'https://dozeles.com/wp-content/uploads/2024/01/woman-cleaning-sofa-with-yellow-vacuum-cleaner-co-2021-08-26-20-11-23-utc.jpg',
    tagline: 'Compliant, documented cleaning for public buildings.',
    metaTitle: 'Government Facility Cleaning {city} CA | Public Building Janitorial',
    metaDesc:
      'Certified government facility cleaning in {city}, CA. Women-certified, licensed and insured janitorial for city, county, and federal buildings. Request a bid.',
    keywords: [
      'government facility cleaning',
      'government contract cleaning',
      'public building janitorial',
      'municipal cleaning services',
      'federal building cleaning',
    ],
    intro:
      'Government cleaning contracts have requirements most janitorial companies cannot meet: documented processes, background-checked staff, certificate compliance, insurance thresholds, and reporting that survives an audit. Dozeles is a women-certified business with two decades of experience meeting exactly those standards across Northern California public facilities.',
    body: [
      'We understand how public procurement works. We respond to RFPs and IFBs with complete documentation, we price transparently against the specified scope of work, and we maintain the records that contract administrators need at renewal time — completed task logs, inspection reports, incident documentation, and staff certifications.',
      'Security and discretion are non-negotiable in public buildings. Every crew member assigned to a government facility is background-checked and trained on site-specific access protocols, restricted-area procedures, and the handling of sensitive spaces such as courtrooms, evidence areas, and records rooms.',
    ],
    includes: [
      'Daily janitorial across all public and staff areas',
      'Restroom cleaning, disinfection, and ADA fixture care',
      'Floor care programs — VCT strip and wax, carpet extraction',
      'Public lobby, corridor, and entryway detail',
      'Courtroom, chamber, and meeting room service',
      'Break room and staff area cleaning',
      'High-touch disinfection on public contact surfaces',
      'Documented quality-control inspections and reporting',
      'Background-checked, badge-compliant crews',
      'Emergency and after-hours response availability',
    ],
    industries: [
      'City halls and municipal offices',
      'Courthouses and justice facilities',
      'Public libraries and community centers',
      'Public schools and district buildings',
      'Transit and public works facilities',
      'Federal and state buildings',
      'Police and fire stations',
      'Parks and recreation facilities',
    ],
    faqs: [
      {
        q: 'Are you certified to bid on government cleaning contracts?',
        a: 'Yes. Dozeles is a women-certified business enterprise, fully licensed, bonded, and insured, with the documented processes and reporting that public agencies require. We regularly respond to RFPs and IFBs from municipalities and agencies throughout {city} and the wider Northern California region.',
      },
      {
        q: 'Are your staff background-checked for secure facilities?',
        a: 'Every crew member assigned to a government facility is background-checked before their first shift and trained on site-specific access, badging, and restricted-area protocols. We can accommodate agency-specific clearance requirements and will coordinate with your security office on vetting.',
      },
      {
        q: 'Can you meet our insurance and bonding requirements?',
        a: 'We carry general liability, workers compensation, and bonding at levels that meet standard public-sector requirements, and we can raise coverage limits to match your contract specifications. Certificates naming the agency as additional insured are provided before work begins.',
      },
      {
        q: 'How do you document work for contract compliance?',
        a: 'Every scheduled task is logged with date, crew, and completion status, and supervisors conduct documented inspections on a rotating schedule. You receive periodic written reports suitable for contract administration and audit review, and we retain records for the full contract term.',
      },
    ],
  },
  {
    slug: 'airbnb-cleaning',
    title: 'Airbnb & Vacation Rental Cleaning',
    short: 'Airbnb Cleaning',
    icon: 'key',
    hero: 'https://dozeles.com/wp-content/uploads/2024/01/hero-01.jpg',
    tagline: 'Five-star turnovers, every single guest.',
    metaTitle: 'Airbnb Cleaning Service {city} CA | Vacation Rental Turnover',
    metaDesc:
      'Professional Airbnb and vacation rental cleaning in {city}, CA. Same-day turnovers, linen service, restocking, and photo verification. Free quote.',
    keywords: [
      'airbnb cleaning service',
      'vacation rental cleaning',
      'short term rental turnover',
      'airbnb turnover cleaning',
      'rental property cleaning',
    ],
    intro:
      'One bad cleaning review can cost a short-term rental thousands in future bookings. Dozeles runs turnovers on a hotel-grade checklist with photo verification on every visit, so you know the property is guest-ready without driving over to check.',
    body: [
      'Same-day turnovers are the standard in {city}, and we build our schedules around checkout and check-in windows rather than convenient time blocks. Linen changes, restocking of consumables, staging to match your listing photos, and a damage-and-inventory report all happen in the same pass.',
      'For hosts with multiple properties, we assign a dedicated coordinator and can sync directly with your booking calendar so turnovers are scheduled automatically as reservations come in. Most multi-property hosts stop thinking about cleaning entirely within a month of onboarding.',
    ],
    includes: [
      'Full turnover clean between every guest stay',
      'Linen and towel change with laundry service',
      'Bed making and staging to match listing photos',
      'Restocking of consumables and welcome amenities',
      'Kitchen reset, dishes, and appliance cleaning',
      'Bathroom sanitizing and amenity restock',
      'Damage, wear, and inventory reporting',
      'Photo verification of finished condition',
      'Same-day and back-to-back booking turnovers',
      'Seasonal deep cleans between peak periods',
    ],
    industries: [
      'Airbnb hosts',
      'VRBO and Booking.com hosts',
      'Property management companies',
      'Corporate housing operators',
      'Boutique guesthouses',
      'Multi-property investors',
      'Co-hosting services',
      'Executive rentals',
    ],
    faqs: [
      {
        q: 'How much does Airbnb cleaning cost in {city}?',
        a: 'Turnover cleaning in {city} typically runs $110 to $260 per turnover depending on unit size, linen volume, and whether laundry is on-site. Studios and one-bedrooms are usually $110 to $160; three-bedroom homes run $220 to $320. Most hosts pass this through as a guest cleaning fee, making it revenue-neutral.',
      },
      {
        q: 'Can you handle same-day back-to-back turnovers?',
        a: 'Yes — it is the core of what we do for short-term rentals. Give us your checkout and check-in times and we schedule crews to complete the turnover inside that window. For tight same-day windows we assign additional crew members rather than cutting the checklist.',
      },
      {
        q: 'Do you provide linens and supplies?',
        a: 'We can work with your linen inventory or manage a rotating linen program where we launder and swap sets each turnover. Consumables — paper goods, soap, coffee, welcome items — can be stocked at cost plus handling so you never get a "we ran out" message from a guest.',
      },
      {
        q: 'How do I know the property was actually cleaned properly?',
        a: 'Every turnover ends with photo verification sent to you — kitchen, bathrooms, bedrooms, and living areas as staged. We also flag damage, low inventory, or maintenance issues in the same report, which usually catches problems before a guest ever sees them.',
      },
    ],
  },
  {
    slug: 'disinfection-services',
    title: 'Disinfection & Sanitizing Services',
    short: 'Disinfection',
    icon: 'shield',
    hero: 'https://dozeles.com/wp-content/uploads/2024/04/60-1024x683.jpg',
    tagline: 'Hospital-grade disinfection without hospital-grade disruption.',
    metaTitle: 'Disinfection Services {city} CA | Commercial Sanitizing Company',
    metaDesc:
      'Professional disinfection and sanitizing services in {city}, CA. EPA-registered disinfectants, electrostatic application, HEPA filtration. Free quote.',
    keywords: [
      'disinfection services',
      'commercial sanitizing services',
      'electrostatic disinfection',
      'office disinfection',
      'facility sanitizing',
    ],
    intro:
      'Cleaning removes soil. Disinfection kills pathogens. They are different processes requiring different products, dwell times, and application methods — and most cleaning companies quietly skip the second one. Dozeles disinfection uses EPA-registered products applied with electrostatic sprayers that wrap surfaces evenly, including the sides and backs that wiping misses.',
    body: [
      'We deploy disinfection three ways: as a scheduled add-on to recurring janitorial contracts, as a periodic deep treatment during cold and flu season, and as emergency response after a confirmed exposure in your facility. Emergency response is typically available within 24 hours across {city}.',
      'Dwell time is where disinfection succeeds or fails. Every EPA-registered product requires a specific wet contact period to actually kill pathogens, and we follow those specifications on every application — which is why our crews take longer than the companies that spray and immediately wipe.',
    ],
    includes: [
      'EPA-registered hospital-grade disinfectant application',
      'Electrostatic spray treatment for even coverage',
      'High-touch point disinfection program',
      'Restroom and locker room sanitizing',
      'Break room, kitchen, and shared appliance treatment',
      'HVAC vent and return surface disinfection',
      'Manufacturer-specified dwell time compliance',
      'Post-exposure emergency response service',
      'Seasonal preventive disinfection programs',
      'Written treatment documentation and certificates',
    ],
    industries: [
      'Medical and dental offices',
      'Schools and daycare facilities',
      'Gyms and fitness studios',
      'Restaurants and food service',
      'Offices and coworking spaces',
      'Senior living facilities',
      'Salons and spas',
      'Public and government buildings',
    ],
    faqs: [
      {
        q: 'How much does commercial disinfection cost in {city}?',
        a: 'Standalone disinfection service in {city} typically runs $0.10 to $0.25 per square foot per treatment, with a minimum service charge for small spaces. Added to an existing janitorial contract it is substantially less because crews are already on site. Emergency post-exposure response is quoted per event.',
      },
      {
        q: 'How soon can we reoccupy the space after disinfection?',
        a: 'Most spaces are safe to reoccupy within 30 to 60 minutes of treatment, once surfaces have completed their dwell time and dried. We schedule treatments after hours whenever possible so reoccupancy timing never affects your operations.',
      },
      {
        q: 'What is electrostatic disinfection and why does it matter?',
        a: 'Electrostatic sprayers give disinfectant droplets an electrical charge so they are attracted to surfaces and wrap around objects — coating the sides and undersides that spray-and-wipe methods miss entirely. For complex environments like classrooms, gyms, and offices full of equipment, coverage is dramatically more complete.',
      },
      {
        q: 'Can you respond after a confirmed illness in our facility?',
        a: 'Yes. We maintain emergency response capacity and can typically be on site within 24 hours anywhere in {city} and the surrounding area. We treat all affected and adjacent areas per CDC guidance and provide written documentation of the treatment for your records and any reporting obligations.',
      },
    ],
  },
];

export const getService = (slug) => SERVICES.find((s) => s.slug === slug);
