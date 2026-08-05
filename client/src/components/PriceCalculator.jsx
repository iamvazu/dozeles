import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import {
  RES_SERVICES, RES_FREQ, RES_ADDONS, COM_FACILITIES, COM_FREQ, COM_ADDONS,
  calcResidential, calcCommercial, updatePricingConfig
} from '../data/pricing.js';
import { api } from '../api.js';

/* animated number that eases to its new value */
function Money({ value, prefix = '$' }) {
  const [shown, setShown] = useState(value);
  const raf = useRef();
  const from = useRef(value);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    const b = value;
    const dur = 480;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(a + (b - a) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <>{prefix}{shown.toLocaleString()}</>;
}

function Stepper({ label, value, set, min, max, suffix }) {
  return (
    <div className="calc-step">
      <span className="calc-step-label">{label}</span>
      <div className="calc-stepper">
        <button type="button" onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>−</button>
        <span className="calc-step-val">{value}{value >= max ? '+' : ''}{suffix ? ` ${suffix}` : ''}</span>
        <button type="button" onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}

export default function PriceCalculator({ defaultTab = 'residential' }) {
  const [tab, setTab] = useState(defaultTab);
  const navigate = useNavigate();
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [dummyVal, setDummyVal] = useState(0); // For re-render after config load

  useEffect(() => {
    api.get('/api/pricing')
      .then(config => {
        updatePricingConfig(config);
        setLoadingConfig(false);
        setDummyVal(v => v + 1); // trigger re-render
      })
      .catch(e => {
        console.error('Failed to load dynamic pricing', e);
        setLoadingConfig(false);
      });
  }, []);

  // residential state
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);
  const [service, setService] = useState('standard');
  const [freq, setFreq] = useState('biweekly');
  const [rAddons, setRAddons] = useState([]);

  // commercial state
  const [sqft, setSqft] = useState(5000);
  const [facility, setFacility] = useState('office');
  const [cFreq, setCFreq] = useState('3x');
  const [cAddons, setCAddons] = useState([]);

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const res = calcResidential({ beds, baths, service, frequency: freq, addons: rAddons });
  const com = calcCommercial({ sqft, facility, frequency: cFreq, addons: cAddons });
  const isRes = tab === 'residential';

  function book() {
    const params = isRes
      ? new URLSearchParams({
          service: service === 'deep' ? 'Deep Cleaning Services' : service === 'move' ? 'Move-In / Move-Out Cleaning' : 'Residential House Cleaning',
          est: String(res.perVisit),
          summary: `${beds} bed / ${baths} bath · ${res.serviceLabel} · ${res.freqLabel}${rAddons.length ? ` · ${rAddons.length} add-on(s)` : ''} · Estimated $${res.perVisit}/visit`,
        })
      : new URLSearchParams({
          service: 'Commercial & Office Cleaning Services',
          est: String(com.monthly),
          summary: `${sqft.toLocaleString()} sq ft ${com.facilityLabel} · ${com.freqLabel}${cAddons.length ? ` · ${cAddons.length} add-on(s)` : ''} · Estimated $${com.monthly.toLocaleString()}/month`,
        });
    navigate(`/book?${params.toString()}`);
  }

  if (loadingConfig) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading live estimate engine...</div>;
  }

  return (
    <div className="calc">
      {/* tab switch */}
      <div className="calc-tabs">
        <button className={isRes ? 'on' : ''} onClick={() => setTab('residential')}>
          <Icon name="home" size={18} /> Residential
        </button>
        <button className={!isRes ? 'on' : ''} onClick={() => setTab('commercial')}>
          <Icon name="building" size={18} /> Commercial
        </button>
      </div>

      <div className="calc-body">
        {/* ---------------- inputs ---------------- */}
        <div className="calc-inputs">
          {isRes ? (
            <>
              <div className="calc-row2">
                <Stepper label="Bedrooms" value={beds} set={setBeds} min={0} max={6} />
                <Stepper label="Bathrooms" value={baths} set={setBaths} min={1} max={5} />
              </div>

              <div className="calc-group">
                <span className="calc-label">Type of clean</span>
                <div className="calc-opts">
                  {RES_SERVICES.map((s) => (
                    <button
                      key={s.id}
                      className={`calc-opt ${service === s.id ? 'on' : ''}`}
                      onClick={() => setService(s.id)}
                    >
                      <strong>{s.label}</strong>
                      <small>{s.note}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="calc-group">
                <span className="calc-label">How often</span>
                <div className="calc-chips">
                  {RES_FREQ.map((f) => (
                    <button
                      key={f.id}
                      className={`calc-chip ${freq === f.id ? 'on' : ''}`}
                      onClick={() => setFreq(f.id)}
                    >
                      {f.label}
                      {f.discount > 0 && <em>−{Math.round(f.discount * 100)}%</em>}
                      {f.badge && <span className="calc-badge">{f.badge}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="calc-group">
                <span className="calc-label">Add-ons <small>optional</small></span>
                <div className="calc-addons">
                  {RES_ADDONS.map((a) => (
                    <button
                      key={a.id}
                      className={`calc-addon ${rAddons.includes(a.id) ? 'on' : ''}`}
                      onClick={() => toggle(rAddons, setRAddons, a.id)}
                    >
                      <span className="ai"><Icon name={a.icon} size={17} /></span>
                      <span className="al">{a.label}</span>
                      <span className="ap">+${a.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="calc-group">
                <span className="calc-label">
                  Square footage <strong className="calc-sqft">{sqft.toLocaleString()} sq ft</strong>
                </span>
                <input
                  className="calc-range"
                  type="range"
                  min="500"
                  max="60000"
                  step="500"
                  value={sqft}
                  onChange={(e) => setSqft(Number(e.target.value))}
                />
                <div className="calc-range-ends"><span>500</span><span>60,000+</span></div>
              </div>

              <div className="calc-group">
                <span className="calc-label">Facility type</span>
                <div className="calc-opts calc-opts-3">
                  {COM_FACILITIES.map((f) => (
                    <button
                      key={f.id}
                      className={`calc-opt tight ${facility === f.id ? 'on' : ''}`}
                      onClick={() => setFacility(f.id)}
                    >
                      <Icon name={f.icon} size={20} />
                      <strong>{f.label}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="calc-group">
                <span className="calc-label">Cleaning frequency</span>
                <div className="calc-chips">
                  {COM_FREQ.map((f) => (
                    <button
                      key={f.id}
                      className={`calc-chip ${cFreq === f.id ? 'on' : ''}`}
                      onClick={() => setCFreq(f.id)}
                    >
                      {f.label}
                      {f.badge && <span className="calc-badge">{f.badge}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="calc-group">
                <span className="calc-label">Add-on programs <small>optional</small></span>
                <div className="calc-addons">
                  {COM_ADDONS.map((a) => (
                    <button
                      key={a.id}
                      className={`calc-addon ${cAddons.includes(a.id) ? 'on' : ''}`}
                      onClick={() => toggle(cAddons, setCAddons, a.id)}
                    >
                      <span className="ai"><Icon name={a.icon} size={17} /></span>
                      <span className="al">{a.label}</span>
                      <span className="ap">{a.unit === 'flat' ? `+$${a.price}/mo` : `+$${a.price}/ft²`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ---------------- live result ---------------- */}
        <div className="calc-result">
          <div className="calc-result-inner">
            <div className="calc-est-label">Your estimate</div>

            {isRes ? (
              <>
                <div className="calc-price">
                  <Money value={res.perVisit} />
                  <small>/ visit</small>
                </div>
                {res.monthly > 0 && (
                  <div className="calc-sub">≈ <Money value={res.monthly} /> per month</div>
                )}

                <div className="calc-lines">
                  <div><span>{beds} bed · {baths} bath · {res.serviceLabel}</span><span><Money value={res.beforeDiscount} /></span></div>
                  {res.discountAmt > 0 && (
                    <div className="save"><span>{res.freqLabel} discount ({res.discountPct}%)</span><span>−<Money value={res.discountAmt} /></span></div>
                  )}
                  {res.addonTotal > 0 && (
                    <div><span>{rAddons.length} add-on{rAddons.length > 1 ? 's' : ''}</span><span>+<Money value={res.addonTotal} /></span></div>
                  )}
                  <div className="total"><span>Estimated total</span><span><Money value={res.perVisit} /></span></div>
                </div>
              </>
            ) : (
              <>
                <div className="calc-price">
                  <Money value={com.monthly} />
                  <small>/ month</small>
                </div>
                <div className="calc-sub">
                  ≈ <Money value={com.perVisit} /> per visit · {com.visitsPerMonth} visits/mo
                </div>

                <div className="calc-lines">
                  <div><span>{sqft.toLocaleString()} ft² {com.facilityLabel}</span><span><Money value={com.baseMonthly} /></span></div>
                  <div><span>{com.freqLabel}</span><span>included</span></div>
                  {com.addonMonthly > 0 && (
                    <div><span>{cAddons.length} add-on program{cAddons.length > 1 ? 's' : ''}</span><span>+<Money value={com.addonMonthly} /></span></div>
                  )}
                  <div className="total"><span>Estimated monthly</span><span><Money value={com.monthly} /></span></div>
                </div>
                <div className="calc-note">${com.perSqFt} per sq ft / month</div>
              </>
            )}

            <button className="btn-quote calc-cta" onClick={book}>
              Lock in this quote <Icon name="arrow" size={15} />
            </button>

            <ul className="calc-assure">
              <li>Free on-site walkthrough</li>
              <li>Fixed written price — no hourly billing</li>
              <li>No contract, cancel anytime</li>
            </ul>

            <p className="calc-disclaimer">
              Estimate only. Your final quote is confirmed in writing after a free walkthrough and
              may differ based on condition, access, and scope.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
