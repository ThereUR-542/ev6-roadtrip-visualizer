import { useEffect, type ReactNode } from 'react';
import { findChargingStation, findCoffeeShop, findHotel } from '../model';
import type { VerifiedSource } from '../../data';
import { fmtUsd } from '../format';
import { EstBadge } from './common';

/**
 * Glassmorphic stop detail modal (FR-9/FR-10): keyless embedded Google Map
 * (OQ-3), full details, ratings and recommendations — every fact strictly
 * from the verified dataset (ACC-1..ACC-4). No invented reviews or photos:
 * real imagery is reached via the live Google Maps embed/link (ACC-3).
 */
export function StopModal({ id, kind, onClose }: { id: string; kind: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const data = resolve(id, kind);
  if (!data) return null;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(`${data.name}, ${data.address}`)}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.name}, ${data.address}`)}`;

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={data.name}>
      <div className="glass glass-strong modal fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18 }}>{data.glyph}</span>
              <h2 style={{ fontSize: 18 }}>{data.name}</h2>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-dim)', marginTop: 4 }}>{data.address}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.chips.map((c, i) => (
                <span key={i} className={`badge ${c.kind ?? ''}`} title={c.title}>
                  {c.text}
                </span>
              ))}
              <span className="badge" title={`Verified ${data.dateVerified} from ${data.sources.length} independent sources (ACC-1/ACC-2).`}>
                ✓ verified {data.dateVerified}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="nav-pill" style={{ flex: '0 0 auto', height: 36, border: '1px solid var(--glass-border)' }} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Map embed (FR-9, keyless OQ-3) */}
        <div style={{ position: 'relative', background: '#0a0f1c' }}>
          <iframe
            title={`Map of ${data.name}`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ width: '100%', height: 280, border: 0, display: 'block' }}
          />
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'grid', gap: 18 }}>
          {data.facts.length > 0 && (
            <div>
              <H>Details</H>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px' }}>
                {data.facts.map((f) => (
                  <div key={f.label}>
                    <dt style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)' }}>
                      {f.label}
                    </dt>
                    <dd style={{ margin: '3px 0 0', fontSize: 14, color: 'var(--ink)' }}>
                      {f.value} {f.est && <EstBadge note={f.est} />}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {data.rating && (
            <div className="glass" style={{ padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--ok)' }}>{data.rating.score.toFixed(1)}★</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Google rating · {data.rating.count} reviews</div>
                <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 3 }}>{data.rating.evidence}</div>
              </div>
            </div>
          )}

          {data.recommendation && (
            <div>
              <H>Why this stop</H>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-dim)', lineHeight: 1.5 }}>{data.recommendation}</p>
            </div>
          )}

          {/* Photos — real imagery via Google, never fabricated (ACC-3) */}
          <div>
            <H>Photos &amp; Street View</H>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
              To honor the no-fake-data rule (ACC-3), this app shows real imagery from the live map above rather than
              stock photos. Open the location on Google Maps for verified photos and reviews:
            </p>
            <a href={mapsLink} target="_blank" rel="noreferrer" className="badge" style={{ textDecoration: 'none' }}>
              ↗ View photos & reviews on Google Maps
            </a>
          </div>

          {/* Sources (ACC-1/ACC-2) */}
          <div>
            <H>Verification sources ({data.sources.length})</H>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
              {data.sources.map((s, i) => (
                <li key={i} style={{ fontSize: 12.5, color: 'var(--ink-dim)' }}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.org}
                  </a>{' '}
                  — {s.confirms}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function H({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-dim)', marginBottom: 8 }}>
      {children}
    </h3>
  );
}

interface ResolvedStop {
  name: string;
  address: string;
  glyph: string;
  dateVerified: string;
  chips: { text: string; kind?: string; title?: string }[];
  facts: { label: string; value: string; est?: string }[];
  rating?: { score: number; count: number; evidence: string };
  recommendation?: string;
  sources: VerifiedSource[];
}

function resolve(id: string, kind: string): ResolvedStop | null {
  if (kind === 'charge') {
    const c = findChargingStation(id);
    if (!c) return null;
    return {
      name: c.name,
      address: `${c.address}`,
      glyph: '⚡',
      dateVerified: c.dateVerified,
      chips: [
        { text: c.network, title: 'Network (DR-1 priority: Francis Energy / Electrify America)' },
        { text: `${c.maxPowerKw} kW max`, title: 'DR-1: 200–300 kW class delivered to the EV6 (~235 kW peak draw)' },
        { text: `${c.dcFastChargerCount} DC stalls` },
      ],
      facts: [
        { label: 'Highway', value: c.nearHighway },
        { label: 'Route mile (from Jenks)', value: `~${c.approxRouteMilesFromJenks} mi`, est: 'Estimated route miles along the documented routing (ACC-5).' },
        { label: 'City', value: `${c.city}, ${c.state}` },
        { label: 'Serves', value: c.directions },
      ],
      recommendation: c.notes,
      sources: c.sources,
    };
  }
  if (kind === 'coffee') {
    const c = findCoffeeShop(id);
    if (!c) return null;
    return {
      name: c.name,
      address: c.address,
      glyph: '☕',
      dateVerified: c.dateVerified,
      chips: [{ text: `${c.googleRating.toFixed(1)}★ Google`, title: 'DR-2: only ≥4.9★ shops are shown (OQ-8).' }, { text: `${c.reviewCount} reviews` }],
      facts: [
        { label: 'Hours', value: c.hours ?? 'not verified' },
        { label: 'Route area', value: c.approxRouteArea },
        { label: 'City', value: `${c.city}, ${c.state}` },
      ],
      rating: { score: c.googleRating, count: c.reviewCount, evidence: c.ratingEvidence },
      recommendation: c.notes,
      sources: c.sources,
    };
  }
  if (kind === 'hotel') {
    const h = findHotel(id);
    if (!h) return null;
    return {
      name: h.name,
      address: h.address,
      glyph: '🛏',
      dateVerified: h.dateVerified,
      chips: [{ text: h.brand }, { text: h.role }],
      facts: [
        { label: 'Highway', value: h.nearHighway },
        { label: 'EV charging', value: h.evCharging },
        { label: 'Nearby DC fast charger', value: h.nearbyDcFastCharger ?? 'none verified' },
        ...(h.approxNightlyRateUsd
          ? [{ label: 'Nightly rate', value: fmtUsd(h.approxNightlyRateUsd), est: h.rateNote ?? 'Observed booking-site rate (ACC-5).' }]
          : []),
      ],
      recommendation: h.notes,
      sources: h.sources,
    };
  }
  return null;
}
