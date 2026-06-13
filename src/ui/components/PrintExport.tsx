/**
 * FR-15: PDF export — browser print with a dedicated print-only DOM section.
 * The printed page unambiguously states the selected vehicle/mode at the top
 * and includes all stops and data for that option.
 *
 * Implementation: window.print() with @media print CSS (no external library
 * needed; user saves as PDF from the system print dialog).
 */
import type { TripModel, Mode, Journey } from '../model';
import { fmtUsd, fmtHours, fmtMiles, fmtPct } from '../format';
import { tollTotals } from '../../data';

const MODE_HEADERS: Record<Mode, { title: string; subtitle: string; icon: string }> = {
  ev6: {
    title: '2023 Kia EV6 GT-Line — Pearl White',
    subtitle: 'Electric vehicle — charging plan with 20–80% discipline (CHG-1..CHG-5)',
    icon: '⚡',
  },
  sportage: {
    title: '2023 Kia Sportage Hybrid — Dark Matte Gray',
    subtitle: 'Non-plug-in hybrid — coffee stops only (4.9★+); gas stations not shown (DR-2/OQ-10)',
    icon: '🛢',
  },
  southwest: {
    title: 'Southwest Airlines — TUL departure',
    subtitle: 'No map route — timeline-based door-to-door comparison (DR-3)',
    icon: '✈',
  },
};

const STOP_GLYPHS: Record<string, string> = {
  origin: '◉',
  charge: '⚡',
  coffee: '☕',
  hotel: '🛏',
  dest: '⚑',
};

function PrintJourney({ journey }: { journey: Journey }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>
        {journey.startLabel} → {journey.endLabel} · {fmtMiles(journey.totalMiles)}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '3px 6px', width: 24 }} />
            <th style={{ padding: '3px 6px' }}>Stop</th>
            <th style={{ padding: '3px 6px' }}>Mile</th>
            <th style={{ padding: '3px 6px' }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {journey.stops.map((s, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '4px 6px', fontSize: 14 }}>{STOP_GLYPHS[s.kind] ?? '·'}</td>
              <td style={{ padding: '4px 6px', fontWeight: s.kind === 'origin' || s.kind === 'dest' ? 700 : 400 }}>
                {s.name}
                {s.city ? ` — ${s.city}, ${s.state}` : ''}
                {s.network ? ` [${s.network}]` : ''}
              </td>
              <td style={{ padding: '4px 6px', whiteSpace: 'nowrap' }}>{Math.round(s.mileFromStart)} mi</td>
              <td style={{ padding: '4px 6px', color: '#555' }}>{s.detail ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #000', paddingBottom: 4, marginBottom: 10 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function PrintEv6({ model }: { model: TripModel }) {
  const { plan, cost, time } = model.ev6;
  const tolls = tollTotals;

  return (
    <>
      <PrintSection title="Summary">
        <table style={{ fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Round-trip distance</td><td>{fmtMiles(model.totalMiles * 2)}</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Total time (drive + charge)</td><td>{fmtHours(time.totalHours)}</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Driving time</td><td>{fmtHours(time.driveHours)}</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Charging time</td><td>{fmtHours(time.chargeHours)}</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Total running cost</td><td>{fmtUsd(cost.totalUsd)} (estimate)</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>DC fast energy</td><td>{cost.dcFastEnergyKwh} kWh</td></tr>
          </tbody>
        </table>
      </PrintSection>

      <PrintSection title="Charging strategy (CHG-1..CHG-5)">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12 }}>
          <li>Depart Jenks at 100% SoC (CHG-1)</li>
          <li>Drive each leg to ~20% SoC, then charge 20% → 80% (CHG-2/CHG-3)</li>
          <li>Never plan charging above 80% (CHG-3)</li>
          <li>Arriving at 20–35% SoC is acceptable when station spacing requires it (CHG-4)</li>
          <li>All legs after the first follow the 20→80% pattern (CHG-5)</li>
        </ul>
      </PrintSection>

      <PrintSection title="Outbound journey: Jenks → Calverton">
        <PrintJourney journey={model.ev6.journeys.outbound} />
        <div style={{ fontSize: 11, color: '#555' }}>
          Charging stops: {plan.outbound.totals.stopCount} · DC energy added: {plan.outbound.totals.dcEnergyAddedKwh.toFixed(0)} kWh ·
          Final arrival SoC: {fmtPct(plan.outbound.finalLeg.arrivalSocPct)}
        </div>
      </PrintSection>

      <PrintSection title="Return journey: Calverton → Jenks">
        <PrintJourney journey={model.ev6.journeys.return} />
        <div style={{ fontSize: 11, color: '#555' }}>
          Charging stops: {plan.returnTrip.totals.stopCount} · DC energy added: {plan.returnTrip.totals.dcEnergyAddedKwh.toFixed(0)} kWh ·
          Final arrival SoC: {fmtPct(plan.returnTrip.finalLeg.arrivalSocPct)}
        </div>
      </PrintSection>

      <PrintSection title="Cost breakdown (estimates — ACC-5)">
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            {cost.lines.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 6px', fontWeight: 600 }}>{l.label}</td>
                <td style={{ padding: '4px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtUsd(l.amountUsd)}</td>
                <td style={{ padding: '4px 6px', color: '#555', fontSize: 11 }}>{l.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #000', fontWeight: 700 }}>
              <td style={{ padding: '6px 6px' }}>Total running cost</td>
              <td style={{ padding: '6px 6px', textAlign: 'right' }}>{fmtUsd(cost.totalUsd)}</td>
              <td style={{ padding: '6px 6px', fontSize: 11, color: '#555' }}>Excludes en-route lodging</td>
            </tr>
          </tfoot>
        </table>
      </PrintSection>

      <PrintSection title="Toll summary (FR-18)">
        <div style={{ fontSize: 12 }}>
          Eastbound (Jenks→NY): {fmtUsd(tolls.eastboundTransponderUsd)} · Westbound: {fmtUsd(tolls.westboundTransponderUsd)} · Round trip: {fmtUsd(tolls.eastboundTransponderUsd + tolls.westboundTransponderUsd)}.
          Rates: PikePass + E-ZPass 2026, GWB off-peak. Plate billing round trip: ~{fmtUsd(tolls.eastboundPlateBillingUsd + tolls.westboundPlateBillingUsd)} (estimate).
        </div>
      </PrintSection>
    </>
  );
}

function PrintSportage({ model }: { model: TripModel }) {
  const { plan } = model.sportage;

  return (
    <>
      <PrintSection title="Summary">
        <table style={{ fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Round-trip distance</td><td>{fmtMiles(plan.roundTripMiles)}</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Total time (drive + refuel + coffee)</td><td>{fmtHours(plan.time.totalHours)}</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Total running cost</td><td>{fmtUsd(plan.totalCostUsd)} (estimate)</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Fuel (round trip)</td><td>{plan.fuel.gallonsRoundTrip} gal @ {fmtUsd(plan.fuel.pricePerGallonUsd)}/gal</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Refueling stops</td><td>{plan.refueling.stopsRoundTrip} total ({plan.refueling.stopsPerDirection} each way) — not shown on map (OQ-10/DR-2)</td></tr>
            <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Coffee stops (one way)</td><td>{plan.timeline.outbound.length} — all 4.9★+ Google-verified (DR-2)</td></tr>
          </tbody>
        </table>
      </PrintSection>

      <PrintSection title="Outbound journey: Jenks → Calverton">
        <PrintJourney journey={model.sportage.journeys.outbound} />
      </PrintSection>

      <PrintSection title="Return journey: Calverton → Jenks">
        <PrintJourney journey={model.sportage.journeys.return} />
      </PrintSection>

      <PrintSection title="Cost breakdown (estimates — ACC-5)">
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            {plan.costLines.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 6px', fontWeight: 600 }}>{l.label}</td>
                <td style={{ padding: '4px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtUsd(l.amountUsd)}</td>
                <td style={{ padding: '4px 6px', color: '#555', fontSize: 11 }}>{l.note}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #000', fontWeight: 700 }}>
              <td style={{ padding: '6px 6px' }}>Total running cost</td>
              <td style={{ padding: '6px 6px', textAlign: 'right' }}>{fmtUsd(plan.totalCostUsd)}</td>
              <td style={{ padding: '6px 6px', fontSize: 11, color: '#555' }}>Excludes en-route lodging</td>
            </tr>
          </tfoot>
        </table>
      </PrintSection>

      <PrintSection title="Toll summary (FR-18)">
        <div style={{ fontSize: 12 }}>
          Eastbound: {fmtUsd(tollTotals.eastboundTransponderUsd)} · Westbound: {fmtUsd(tollTotals.westboundTransponderUsd)} · Round trip: {fmtUsd(tollTotals.eastboundTransponderUsd + tollTotals.westboundTransponderUsd)}.
          PikePass + E-ZPass 2026. Plate billing round trip: ~{fmtUsd(tollTotals.eastboundPlateBillingUsd + tollTotals.westboundPlateBillingUsd)} (estimate).
        </div>
      </PrintSection>
    </>
  );
}

function PrintSouthwest({ model }: { model: TripModel }) {
  const { lga, isp } = model.southwest;

  return (
    <>
      <PrintSection title="SW-5 — bulky material sample limitation">
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>
          ⚠ Bulky material samples cannot be transported home as checked or carry-on luggage when flying. This is a stated reason driving may win despite the time saving. Ship samples separately or drive.
        </p>
      </PrintSection>

      {[lga, isp].map((opt) => (
        <PrintSection key={opt.airport} title={`TUL → ${opt.airport}${opt.preferred ? ' (preferred — SW-3)' : ' (alternative)'}`}>
          <table style={{ fontSize: 12, borderCollapse: 'collapse', marginBottom: 10 }}>
            <tbody>
              <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Door-to-door (one way)</td><td>{fmtHours(opt.oneWayHours)}</td></tr>
              <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Round trip</td><td>{fmtHours(opt.roundTripHours)}</td></tr>
              <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Airfare (RT, 2 pax, Companion Pass)</td><td>{fmtUsd(opt.cost.lowUsd)}–{fmtUsd(opt.cost.highUsd)} (estimate, SW-1/OQ-7)</td></tr>
              <tr><td style={{ padding: '2px 16px 2px 0', fontWeight: 600 }}>Companion Pass (SW-4)</td><td>Applied — second ticket free</td></tr>
            </tbody>
          </table>
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>Door-to-door timeline (SW-2):</div>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <tbody>
              {opt.segments.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee', opacity: s.containedInBuffer ? 0.6 : 1 }}>
                  <td style={{ padding: '3px 6px', fontWeight: 500 }}>{s.label}</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {s.containedInBuffer ? 'within buffer' : fmtHours(s.hours)}
                  </td>
                  <td style={{ padding: '3px 6px', color: '#555', fontSize: 11 }}>{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>{opt.cost.note}</div>
        </PrintSection>
      ))}
    </>
  );
}

export function PrintContent({ mode, model }: { mode: Mode; model: TripModel }) {
  const header = MODE_HEADERS[mode];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    // Hidden in browser; shown only in @media print via CSS
    <div className="print-only" aria-hidden="true">
      <div style={{ fontFamily: 'Georgia, serif', color: '#000', background: '#fff', maxWidth: 900, margin: '0 auto', padding: 32 }}>
        {/* Unambiguous mode header (FR-15 requirement) */}
        <div style={{ borderBottom: '3px solid #000', paddingBottom: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Pearl White EV6 Road Trip Visualizer — Jenks, OK ⇄ SQ4D HQ, Calverton, NY 11933
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            {header.icon} {header.title}
          </h1>
          <div style={{ fontSize: 13, marginTop: 6, color: '#333' }}>{header.subtitle}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>Generated {dateStr} · All estimates labeled (ACC-5)</div>
        </div>

        {mode === 'ev6' && <PrintEv6 model={model} />}
        {mode === 'sportage' && <PrintSportage model={model} />}
        {mode === 'southwest' && <PrintSouthwest model={model} />}

        <div style={{ marginTop: 32, paddingTop: 12, borderTop: '1px solid #ccc', fontSize: 10, color: '#888' }}>
          Pearl White EV6 Road Trip Visualizer · Phase 4 · docs/PRD.md · docs/DECISIONS.md · docs/verification.md
        </div>
      </div>
    </div>
  );
}

export function triggerPrint() {
  window.print();
}
