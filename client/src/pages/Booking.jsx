import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import Seo from '../seo.jsx';
import { PageBanner } from '../components/Shared.jsx';
import Icon from '../components/Icon.jsx';
import Social from '../components/Social.jsx';
import CaptchaChallenge from '../components/CaptchaChallenge.jsx';
import { api } from '../api.js';
import { SERVICES } from '../data/services.js';
import {
  RES_ADDONS, RES_FREQ, COM_FREQ, COM_FACILITIES,
  calcResidential, calcCommercial,
} from '../data/pricing.js';

const STEPS = ['Your booking details', 'Your contact details', 'Access & final details'];

const PARKING = [
  'Park in my driveway',
  'I will provide guest parking',
  'Free street parking nearby',
  'Paid parking (we cover the cost)',
  'Other — explained below',
];
const FLEXIBLE = [
  'Yes — day and time',
  'Yes — day only',
  'Yes — time only',
  'No — I need that exact day and time',
];
const ACCESS = [
  'I will be there',
  'I will provide a lockbox code',
  'I will provide an access/alarm code',
  'A building manager will let the crew in',
  'Other — explained below',
];

// Commercial-oriented services use the sq ft path instead of bed/bath
const COMMERCIAL_SLUGS = ['commercial-cleaning', 'janitorial-services', 'government-facility-cleaning', 'post-construction-cleaning', 'disinfection-services'];

export default function Booking() {
  const { site } = useContent();
  const [params] = useSearchParams();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [captchaData, setCaptchaData] = useState({ answer: '', expected: 0, token: '', hp_website: '' });
  const [captchaError, setCaptchaError] = useState('');

  const [f, setF] = useState({
    // step 1
    service: params.get('service') || 'Residential House Cleaning',
    beds: 3, baths: 2, sqft: 5000, facility: 'office',
    frequency: params.get('mode') === 'commercial' ? '3x' : 'biweekly',
    addons: [], date: '', time: '09:00',
    // step 2
    name: '', phone: '', email: '', address: '', city: '', state: 'CA', zip: '',
    // step 3
    parking: '', flexible: '', access: '', pets: '', notes: '',
  });

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setV = (k, v) => setF({ ...f, [k]: v });

  const svc = SERVICES.find((s) => s.title === f.service);
  const isCommercial = svc ? COMMERCIAL_SLUGS.includes(svc.slug) : false;

  const est = useMemo(() => {
    if (isCommercial) {
      const c = calcCommercial({ sqft: Number(f.sqft) || 1000, facility: f.facility, frequency: COM_FREQ.some((x) => x.id === f.frequency) ? f.frequency : '3x', addons: [] });
      return { headline: c.monthly, unit: '/ month', sub: `≈ $${c.perVisit.toLocaleString()} per visit · ${c.visitsPerMonth} visits/mo` };
    }
    const service = svc?.slug === 'deep-cleaning' ? 'deep' : svc?.slug === 'move-in-move-out-cleaning' ? 'move' : 'standard';
    const r = calcResidential({
      beds: Number(f.beds), baths: Number(f.baths), service,
      frequency: RES_FREQ.some((x) => x.id === f.frequency) ? f.frequency : 'biweekly',
      addons: f.addons,
    });
    return { headline: r.perVisit, unit: '/ visit', sub: r.monthly ? `≈ $${r.monthly.toLocaleString()} per month` : 'One-time service' };
  }, [f, isCommercial, svc]);

  // when switching between res/com, reset frequency to a valid option
  function changeService(e) {
    const title = e.target.value;
    const s = SERVICES.find((x) => x.title === title);
    const com = s ? COMMERCIAL_SLUGS.includes(s.slug) : false;
    setF({ ...f, service: title, frequency: com ? '3x' : 'biweekly', addons: com ? [] : f.addons });
  }

  const toggleAddon = (id) =>
    setF({ ...f, addons: f.addons.includes(id) ? f.addons.filter((x) => x !== id) : [...f.addons, id] });

  function validate(s) {
    if (s === 0) {
      if (!f.service) return 'Please choose a service.';
      if (!f.date) return 'Please choose a preferred date.';
    }
    if (s === 1) {
      if (!f.name.trim()) return 'Please enter your name.';
      if (!f.phone.trim()) return 'Please enter a phone number.';
      if (!/.+@.+\..+/.test(f.email)) return 'Please enter a valid email address.';
      if (!f.address.trim()) return 'Please enter the service address.';
      if (!f.city.trim()) return 'Please enter the city.';
    }
    return '';
  }

  function next() {
    const v = validate(step);
    if (v) { setErr(v); return; }
    setErr('');
    setStep((s) => Math.min(2, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function back() {
    setErr('');
    setCaptchaError('');
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate(1);
    if (v) { setErr(v); setStep(1); return; }
    
    // Validate Captcha
    if (!captchaData.answer || parseInt(captchaData.answer, 10) !== captchaData.expected) {
      setCaptchaError('Please solve the security verification question correctly.');
      return;
    }

    setSending(true);
    setErr('');
    setCaptchaError('');

    const detail = isCommercial
      ? `${Number(f.sqft).toLocaleString()} sq ft · ${COM_FACILITIES.find((x) => x.id === f.facility)?.label} · ${COM_FREQ.find((x) => x.id === f.frequency)?.label}`
      : `${f.beds} bed / ${f.baths} bath · ${RES_FREQ.find((x) => x.id === f.frequency)?.label}${f.addons.length ? ` · Add-ons: ${f.addons.map((a) => RES_ADDONS.find((x) => x.id === a)?.label).join(', ')}` : ''}`;

    try {
      await api.post('/api/bookings', {
        name: f.name,
        email: f.email,
        phone: f.phone,
        service: f.service,
        date: f.date,
        time: f.time,
        address: `${f.address}, ${f.city}, ${f.state} ${f.zip}`.trim(),
        notes: [
          detail,
          `Estimate: $${est.headline.toLocaleString()} ${est.unit.replace('/ ', 'per ')}`,
          f.parking && `Parking: ${f.parking}`,
          f.flexible && `Flexible: ${f.flexible}`,
          f.access && `Access: ${f.access}`,
          f.pets && `Pets: ${f.pets}`,
          f.notes && `Notes: ${f.notes}`,
        ].filter(Boolean).join('\n'),
        captchaAnswer: captchaData.answer,
        captchaToken: captchaData.token,
        hp_website: captchaData.hp_website
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setSending(false);
    }
  }

  /* ---------------- confirmation ---------------- */
  if (done) {
    return (
      <>
        <Seo
          title="Booking Request Received | Dozeles Professional Cleaning"
          description="Your cleaning estimate and booking request has been submitted to Dozeles Professional Cleaning."
          path="/book"
          noindex={true}
        />
        <PageBanner title="Request Received" crumb="Book Now" />
        <section>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="wiz-done">
              <span className="wiz-check"><Icon name="shield" size={40} /></span>
              <h2 className="h2">Thank you, {f.name.split(' ')[0]}!</h2>
              <p className="lead">
                We've received your request and will confirm your booking within one business day —
                usually much sooner. Your estimate was{' '}
                <strong>${est.headline.toLocaleString()} {est.unit.replace('/ ', 'per ')}</strong>,
                which we'll confirm in writing after a free walkthrough.
              </p>
              <div className="wiz-done-actions">
                <a href={`tel:${site.phoneRaw}`} className="btn btn-blue">Call {site.phone}</a>
                <Link to="/" className="btn btn-outline">Back to home</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Book Cleaning Service & Get Free Estimate | Dozeles Professional Cleaning"
        description="Book your commercial janitorial, office, or residential cleaning service online with Dozeles Professional Cleaning. Instant estimates and fast response across the Bay Area."
        keywords={[
          'book cleaning service',
          'cleaning estimate online',
          'hire commercial cleaners bay area',
          'residential cleaning appointment',
          'janitorial service booking'
        ]}
        path="/book"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Book Now', path: '/book' }
        ]}
      />
      <PageBanner title="Get Your Estimate & Book Now" crumb="Book Now" />

      <section>
        <div className="container">
          <div className="wiz">
            {/* ---------------- form column ---------------- */}
            <div className="wiz-main">
              <h2 className="h2" style={{ fontSize: '2rem' }}>Get your estimate &amp; book now</h2>

              {/* stepper */}
              <div className="wiz-steps">
                {STEPS.map((label, i) => (
                  <div className={`wiz-step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} key={label}>
                    <span className="wiz-dot">{i < step ? '✓' : i + 1}</span>
                    {i < STEPS.length - 1 && <span className="wiz-line" />}
                  </div>
                ))}
              </div>

              <div className="wiz-title">{STEPS[step]}</div>

              <form onSubmit={submit} className="form">
                {/* ================= STEP 1 ================= */}
                {step === 0 && (
                  <>
                    <div className="wiz-field">
                      <label>Service</label>
                      <select value={f.service} onChange={changeService} required>
                        {SERVICES.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
                      </select>
                    </div>

                    {isCommercial ? (
                      <div className="form-row">
                        <div className="wiz-field">
                          <label>Facility type</label>
                          <select value={f.facility} onChange={set('facility')}>
                            {COM_FACILITIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                        </div>
                        <div className="wiz-field">
                          <label>Approximate square footage</label>
                          <input type="number" min="200" step="100" value={f.sqft} onChange={set('sqft')} placeholder="5000" />
                        </div>
                      </div>
                    ) : (
                      <div className="form-row">
                        <div className="wiz-field">
                          <label>Bedrooms</label>
                          <select value={f.beds} onChange={set('beds')}>
                            {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n === 0 ? 'Studio' : n}</option>)}
                          </select>
                        </div>
                        <div className="wiz-field">
                          <label>Bathrooms</label>
                          <select value={f.baths} onChange={set('baths')}>
                            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="wiz-field">
                      <label>Frequency</label>
                      <select value={f.frequency} onChange={set('frequency')}>
                        {(isCommercial ? COM_FREQ : RES_FREQ).map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.label}{x.discount ? ` — save ${Math.round(x.discount * 100)}%` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!isCommercial && (
                      <div className="wiz-field">
                        <label>Extras <small>optional</small></label>
                        <div className="wiz-addons">
                          {RES_ADDONS.map((a) => (
                            <button
                              type="button"
                              key={a.id}
                              className={`wiz-addon ${f.addons.includes(a.id) ? 'on' : ''}`}
                              onClick={() => toggleAddon(a.id)}
                            >
                              {a.label} <em>+${a.price}</em>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="wiz-field">
                        <label>Preferred date</label>
                        <input type="date" value={f.date} onChange={set('date')} required />
                      </div>
                      <div className="wiz-field">
                        <label>Preferred time</label>
                        <input type="time" value={f.time} onChange={set('time')} />
                      </div>
                    </div>
                  </>
                )}

                {/* ================= STEP 2 ================= */}
                {step === 1 && (
                  <>
                    <div className="form-row">
                      <div className="wiz-field">
                        <label>Your name</label>
                        <input value={f.name} onChange={set('name')} placeholder="e.g. Maria Alvarez" required />
                      </div>
                      <div className="wiz-field">
                        <label>Phone number</label>
                        <input value={f.phone} onChange={set('phone')} placeholder="e.g. (650) 290-0280" required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="wiz-field">
                        <label>Email address</label>
                        <input type="email" value={f.email} onChange={set('email')} placeholder="e.g. you@email.com" required />
                      </div>
                      <div className="wiz-field">
                        <label>Street address</label>
                        <input value={f.address} onChange={set('address')} placeholder="e.g. 1200 Serramonte Blvd" required />
                      </div>
                    </div>
                    <div className="form-row wiz-row3">
                      <div className="wiz-field">
                        <label>City</label>
                        <input value={f.city} onChange={set('city')} placeholder="e.g. Daly City" required />
                      </div>
                      <div className="wiz-field">
                        <label>State</label>
                        <select value={f.state} onChange={set('state')}>
                          <option value="CA">California</option>
                          <option value="NV">Nevada</option>
                          <option value="OR">Oregon</option>
                        </select>
                      </div>
                      <div className="wiz-field">
                        <label>ZIP code</label>
                        <input value={f.zip} onChange={set('zip')} placeholder="e.g. 94015" />
                      </div>
                    </div>
                  </>
                )}

                {/* ================= STEP 3 ================= */}
                {step === 2 && (
                  <>
                    <div className="form-row">
                      <div className="wiz-field">
                        <label>Where can our crew park?</label>
                        <select value={f.parking} onChange={set('parking')}>
                          <option value="">Select</option>
                          {PARKING.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="wiz-field">
                        <label>Is your day/time flexible?</label>
                        <select value={f.flexible} onChange={set('flexible')}>
                          <option value="">Select</option>
                          {FLEXIBLE.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="wiz-field">
                        <label>How will our crew get inside?</label>
                        <select value={f.access} onChange={set('access')}>
                          <option value="">Select</option>
                          {ACCESS.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="wiz-field">
                        <label>Any pets on site?</label>
                        <input value={f.pets} onChange={set('pets')} placeholder="e.g. two cats, friendly dog" />
                      </div>
                    </div>
                    <div className="wiz-field">
                      <label>Additional information</label>
                      <textarea value={f.notes} onChange={set('notes')} placeholder="Anything else we should know — access codes, problem areas, restricted rooms…" />
                    </div>

                    <CaptchaChallenge 
                      onVerify={(data) => {
                        setCaptchaData(data);
                        setCaptchaError('');
                      }} 
                      error={captchaError} 
                    />
                  </>
                )}

                {err && <div className="form-note err">{err}</div>}

                <div className="wiz-actions">
                  {step > 0 && (
                    <button type="button" className="btn btn-outline" onClick={back}>Back</button>
                  )}
                  {step < 2 ? (
                    <button type="button" className="btn-quote" onClick={next}>
                      Continue <Icon name="arrow" size={15} />
                    </button>
                  ) : (
                    <button type="submit" className="btn-quote" disabled={sending}>
                      {sending ? 'Sending…' : 'Complete booking'} <Icon name="arrow" size={15} />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ---------------- live estimate sidebar ---------------- */}
            <aside className="wiz-side">
              <div className="wiz-est">
                <div className="calc-est-label">Your live estimate</div>
                <div className="calc-price">
                  ${est.headline.toLocaleString()}<small>{est.unit}</small>
                </div>
                <div className="calc-sub">{est.sub}</div>

                <div className="calc-lines">
                  <div><span>Service</span><span>{svc?.short || f.service}</span></div>
                  <div>
                    <span>{isCommercial ? 'Size' : 'Home'}</span>
                    <span>{isCommercial ? `${Number(f.sqft).toLocaleString()} ft²` : `${f.beds} bd / ${f.baths} ba`}</span>
                  </div>
                  <div>
                    <span>Frequency</span>
                    <span>{(isCommercial ? COM_FREQ : RES_FREQ).find((x) => x.id === f.frequency)?.label || '—'}</span>
                  </div>
                  {!isCommercial && f.addons.length > 0 && (
                    <div><span>Extras</span><span>{f.addons.length} selected</span></div>
                  )}
                  {f.date && <div><span>Date</span><span>{f.date} {f.time}</span></div>}
                </div>

                <ul className="calc-assure">
                  <li>Free on-site walkthrough</li>
                  <li>Fixed written price</li>
                  <li>No contract, cancel anytime</li>
                </ul>

                <div className="wiz-trust">
                  {(site.certifications || []).map((c) => (
                    <span key={c.id}>
                      <Icon name={c.icon} size={15} /> {c.label}
                      {c.number && <em>{c.numberLabel} {c.number}</em>}
                    </span>
                  ))}
                </div>

                <div className="wiz-google">
                  <Social name="google" size={17} />
                  <span>
                    <strong>{site.googleRating || '5.0'}</strong> on Google
                    <small>{site.googleReviewCount || '40'} reviews</small>
                  </span>
                </div>

                <p className="calc-disclaimer">
                  Estimate only. Your final quote is confirmed in writing after a free walkthrough.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
