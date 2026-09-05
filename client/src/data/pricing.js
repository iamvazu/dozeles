// ============================================================
// PRICING ENGINE
// Single source of truth for the calculator AND the published
// ranges quoted in FAQs, so the two can never contradict.
// All figures are Bay Area / Northern California market rates.
// ============================================================

/* ---------------- RESIDENTIAL ---------------- */
// price = (BASE + beds*PER_BED + baths*PER_BATH) * serviceMultiplier
//         then frequency discount, then flat add-ons
export let RES = {
  BASE: 89,
  PER_BED: 28,
  PER_BATH: 32,
  MIN: 129,
};

export const RES_SERVICES = [
  { id: 'standard', label: 'Standard clean', mult: 1.0, note: 'Recurring maintenance for a home in good shape' },
  { id: 'deep', label: 'Deep clean', mult: 1.55, note: 'Inside appliances, grout, baseboards, vents' },
  { id: 'move', label: 'Move in / out', mult: 1.75, note: 'Deposit-back scope with photo documentation' },
];

export const RES_FREQ = [
  { id: 'weekly', label: 'Weekly', discount: 0.2, visitsPerMonth: 4.3, badge: 'Best value' },
  { id: 'biweekly', label: 'Every 2 weeks', discount: 0.15, visitsPerMonth: 2.2, badge: 'Most popular' },
  { id: 'triweekly', label: 'Every 3 weeks', discount: 0.1, visitsPerMonth: 1.4 },
  { id: 'monthly', label: 'Monthly', discount: 0, visitsPerMonth: 1 },
  { id: 'once', label: 'One time', discount: 0, visitsPerMonth: 0 },
];

export const RES_ADDONS = [
  { id: 'fridge-empty', label: 'Inside empty refrigerator', price: 50, icon: 'home' },
  { id: 'fridge-full', label: 'Inside occupied refrigerator', price: 60, icon: 'home' },
  { id: 'oven', label: 'Inside oven', price: 50, icon: 'spray' },
  { id: 'cabinets', label: 'Inside kitchen cabinets', price: 50, icon: 'store' },
  { id: 'windows', label: 'Interior windows, tracks & sills ($25–$30/window)', price: 30, icon: 'image' },
  { id: 'laundry', label: 'Laundry & folding ($50/load)', price: 50, icon: 'users' },
  { id: 'dishes', label: 'Dish washing', price: 35, icon: 'sparkles' },
  { id: 'garage', label: 'Garage sweep-out', price: 50, icon: 'truck' },
  { id: 'pets', label: 'Heavy pet hair treatment', price: 50, icon: 'smile' },
];

/* ---------------- COMMERCIAL ---------------- */
// Commercial janitorial is contracted MONTHLY in this industry.
// monthly = sqft * ratePerSqFtMonth(facility) * frequencyMultiplier
export let COM_FACILITIES = [
  { id: 'office', label: 'Office', rate: 0.22, icon: 'building' },
  { id: 'retail', label: 'Retail / showroom', rate: 0.2, icon: 'store' },
  { id: 'medical', label: 'Medical / dental', rate: 0.29, icon: 'shield' },
  { id: 'warehouse', label: 'Warehouse / industrial', rate: 0.12, icon: 'truck' },
  { id: 'government', label: 'School / government', rate: 0.24, icon: 'landmark' },
  { id: 'restaurant', label: 'Restaurant / food service', rate: 0.31, icon: 'spray' },
];

export const COM_FREQ = [
  { id: '5x', label: '5 nights / week', mult: 1.9, visitsPerMonth: 21.7, badge: 'Full service' },
  { id: '3x', label: '3 nights / week', mult: 1.32, visitsPerMonth: 13, badge: 'Most popular' },
  { id: '2x', label: '2 nights / week', mult: 1.0, visitsPerMonth: 8.7 },
  { id: '1x', label: 'Weekly', mult: 0.58, visitsPerMonth: 4.3 },
  { id: 'bimonthly', label: 'Twice monthly', mult: 0.32, visitsPerMonth: 2 },
];

export const COM_ADDONS = [
  { id: 'floor-wax', label: 'Strip, wax & seal floors', price: 0.28, unit: 'sqft', per: 'quarterly', icon: 'sparkles' },
  { id: 'carpet', label: 'Carpet hot-water extraction', price: 0.25, unit: 'sqft', per: 'quarterly', icon: 'spray' },
  { id: 'disinfect', label: 'Electrostatic disinfection', price: 0.14, unit: 'sqft', per: 'monthly', icon: 'shield' },
  { id: 'windows', label: 'Interior window cleaning', price: 0.06, unit: 'sqft', per: 'monthly', icon: 'image' },
  { id: 'supplies', label: 'Consumable supply management', price: 0.03, unit: 'sqft', per: 'monthly', icon: 'store' },
  { id: 'daytime', label: 'Daytime porter (4 hrs/day)', price: 1450, unit: 'flat', per: 'monthly', icon: 'users' },
];

export let COM_MIN_MONTHLY = 380;

export function updatePricingConfig(config) {
  if (!config) return;
  if (config.RES) RES = config.RES;
  if (config.COM_FACILITIES) COM_FACILITIES = config.COM_FACILITIES;
  if (config.COM_MIN_MONTHLY !== undefined) COM_MIN_MONTHLY = config.COM_MIN_MONTHLY;
}

/* ---------------- CALCULATORS ---------------- */
export function calcResidential({ beds = 2, baths = 2, service = 'standard', frequency = 'biweekly', addons = [] }) {
  const svc = RES_SERVICES.find((s) => s.id === service) || RES_SERVICES[0];
  const freq = RES_FREQ.find((f) => f.id === frequency) || RES_FREQ[1];

  const rooms = RES.BASE + beds * RES.PER_BED + baths * RES.PER_BATH;
  const beforeDiscount = Math.max(RES.MIN, Math.round(rooms * svc.mult));
  const discountAmt = Math.round(beforeDiscount * freq.discount);
  const addonTotal = addons.reduce((sum, id) => sum + (RES_ADDONS.find((a) => a.id === id)?.price || 0), 0);
  const perVisit = beforeDiscount - discountAmt + addonTotal;

  return {
    perVisit,
    beforeDiscount,
    discountAmt,
    discountPct: Math.round(freq.discount * 100),
    addonTotal,
    monthly: freq.visitsPerMonth ? Math.round(perVisit * freq.visitsPerMonth) : 0,
    visitsPerMonth: freq.visitsPerMonth,
    serviceLabel: svc.label,
    freqLabel: freq.label,
  };
}

export function calcCommercial({ sqft = 5000, facility = 'office', frequency = '3x', addons = [] }) {
  const fac = COM_FACILITIES.find((f) => f.id === facility) || COM_FACILITIES[0];
  const freq = COM_FREQ.find((f) => f.id === frequency) || COM_FREQ[1];

  const baseMonthly = Math.max(COM_MIN_MONTHLY, Math.round(sqft * fac.rate * freq.mult));

  let addonMonthly = 0;
  addons.forEach((id) => {
    const a = COM_ADDONS.find((x) => x.id === id);
    if (!a) return;
    if (a.unit === 'flat') addonMonthly += a.price;
    else addonMonthly += a.per === 'quarterly' ? (sqft * a.price) / 3 : sqft * a.price;
  });
  addonMonthly = Math.round(addonMonthly);

  const monthly = baseMonthly + addonMonthly;
  return {
    monthly,
    baseMonthly,
    addonMonthly,
    perVisit: Math.round(monthly / freq.visitsPerMonth),
    visitsPerMonth: freq.visitsPerMonth,
    perSqFt: (monthly / sqft).toFixed(3),
    facilityLabel: fac.label,
    freqLabel: freq.label,
  };
}

/* ---------------- PUBLISHED RANGES ----------------
   Quoted in FAQs across the site. Derived from the model above
   so marketing copy and the calculator always agree. */
export const PUBLISHED = {
  resStandardFrom: 149,   // 1 bed / 1 bath weekly-ish entry point
  resTypicalLow: 149,
  resTypicalHigh: 320,
  deepFrom: 289,
  moveLow: 280,
  moveHigh: 650,
  comPerSqFtMonthLow: '0.10',
  comPerSqFtMonthHigh: '0.45',
  comExample3k: 660,      // 3,000 sqft office, 2 nights/week
  comExample5k: 1450,     // 5,000 sqft office, 3 nights/week
  airbnbLow: 110,
  airbnbHigh: 260,
};
