import { useEffect } from 'react';
import type { Mode } from '../model';

// FR-17: per-vehicle pre-trip checklist and packing list.
// EV6 list includes charging cables/adapters as required.
const LISTS: Record<Mode, { category: string; items: string[] }[]> = {
  ev6: [
    {
      category: 'Charging equipment',
      items: [
        'EV6 portable EVSE (J1772 adapter + 120 V plug) — check the front trunk',
        'CCS1 Combined Charging System cable — confirm in trunk before departure',
        'Electrify America app — payment method on file, account in good standing',
        'PlugShare or ABRP — real-time charger status along the route',
        'Depart Jenks at 100% SoC (CHG-1) — set Kia Connect departure timer the night before',
      ],
    },
    {
      category: 'Vehicle checks',
      items: [
        'Tire pressure: 39 PSI cold (higher than stock improves highway efficiency)',
        'Windshield washer fluid full — route spans 8 states',
        'Regen paddles: confirm + / − response before highway driving',
        'Climate pre-conditioning via Kia Connect — start 20 min before departure to reduce cabin-heat battery draw',
      ],
    },
    {
      category: 'Payments & documents',
      items: [
        "Driver's license, vehicle registration, proof of insurance in glovebox",
        'Toll transponder (PikePass for OK, E-ZPass or compatible for PA/NY) — mount and verify balance',
        'Kia Roadside Assistance: 1-800-333-4542',
        'Backup charging apps: ChargePoint, Blink, or EVgo in case primary network is down',
      ],
    },
    {
      category: 'Comfort & packing',
      items: [
        'Cold-weather layers and a blanket — cabin heat reduces range noticeably',
        'Snacks and water bottle — charging stops average 25–35 min each',
        'Offline maps: download OK, MO, IL, IN, OH, PA, NJ, NY tiles in Google Maps',
        'Portable USB-A/C hub — EV6 has two USB-C ports (15 W each) but fills quickly with multiple devices',
      ],
    },
  ],
  sportage: [
    {
      category: 'Pre-departure',
      items: [
        'Fill the tank in Jenks before leaving — 80 % state of fuel is a comfortable start',
        'Tire pressure (cold): 36 PSI for the 2023 Sportage Hybrid AWD',
        'Engine oil level — hybrid systems cycle the ICE less; check the dipstick before a long trip',
        '12 V auxiliary battery — hybrids rely on it for the HV relay; confirm charge level is normal',
        'Windshield washer fluid full',
      ],
    },
    {
      category: 'Payments & documents',
      items: [
        "Driver's license, vehicle registration, proof of insurance in glovebox",
        'Toll transponder (PikePass for OK, E-ZPass or compatible for PA/NY) — mount and verify balance',
        'Gas credit card or $30–50 cash backup in case transponder fails',
        'Kia Roadside Assistance: 1-800-333-4542',
      ],
    },
    {
      category: 'Route reminders',
      items: [
        'Only 4.9★ Google-verified coffee shops appear as planned stops (DR-2)',
        'Gas stations are invisible on the route map — refuel at any exit when convenient; cost/time still counted (OQ-10)',
        'Overnight stop outbound: Huber Heights, OH (same hotel return leg)',
      ],
    },
    {
      category: 'Packing',
      items: [
        'Offline maps: download all 8 route states before departure',
        'GasBuddy or Gas Guru — real-time fuel prices at your next exit',
        'Blanket and road snacks — it is a 2-day drive each way',
      ],
    },
  ],
  southwest: [
    {
      category: 'Booking & boarding',
      items: [
        'Check in exactly 24 hours before departure — Southwest open seating, boarding position matters',
        'Companion Pass: verify companion name is registered on southwest.com before purchasing tickets (SW-4)',
        'Download the Southwest app — mobile boarding pass is the fastest option at TUL',
        'TSA PreCheck or CLEAR reduces security from ~30 to ~10 min at Tulsa International',
      ],
    },
    {
      category: '⚠ Luggage — read before packing',
      items: [
        'SW-5 CRITICAL: bulky material samples CANNOT be transported as luggage — ship separately or drive',
        'Southwest includes 2 free checked bags per person (no bag fee)',
        'Laptop and valuables in carry-on',
        'Label all checked bags: name + 400 David Ct, Calverton NY 11933',
      ],
    },
    {
      category: 'Airport & car rental',
      items: [
        'Arrive at TUL 2 hours before departure (SW-2)',
        'LGA rental: off-airport in East Elmhurst via shuttle — add ~1 h vs on-airport pickup (OQ-5)',
        'ISP rental: on-airport at baggage claim — materially faster (OQ-5)',
        'Confirm reservation; EV or hybrid rental reduces the drive-to-HQ fuel cost',
      ],
    },
    {
      category: 'Return leg',
      items: [
        'Book return flight before leaving home — TUL is the departure, LGA or ISP the origin',
        'Return rental: drop off at the same counter as pickup',
        'Confirm sample transport plan before returning — bulky items must ship ahead if needed',
      ],
    },
  ],
};

const MODE_LABEL: Record<Mode, string> = {
  ev6: '2023 Kia EV6 GT-Line (Pearl White)',
  sportage: '2023 Kia Sportage Hybrid (Dark Matte Gray)',
  southwest: 'Southwest Airlines',
};

export function Checklist({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const list = LISTS[mode];

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Pre-trip checklist">
      <div className="glass glass-strong modal fade-in" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>📋</span>
          <div style={{ marginRight: 'auto' }}>
            <h2 style={{ fontSize: 17 }}>Pre-trip checklist &amp; packing list</h2>
            <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{MODE_LABEL[mode]}</div>
          </div>
          <button onClick={onClose} className="nav-pill" style={{ border: '1px solid var(--glass-border)' }} aria-label="Close">✕</button>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          {list.map((section) => (
            <div key={section.category}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-faint)', marginBottom: 7, fontWeight: 650 }}>
                {section.category}
              </div>
              <div className="glass" style={{ padding: '10px 14px', borderRadius: 12 }}>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 7 }}>
                  {section.items.map((item, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.45 }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p style={{ margin: '14px 0 0', fontSize: 11.5, color: 'var(--ink-faint)' }}>
          FR-17 — checklist contents differ per vehicle; EV6 list includes charging cables and adapters.
        </p>
      </div>
    </div>
  );
}
