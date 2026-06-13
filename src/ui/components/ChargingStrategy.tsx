import type { RoundTripPlan } from '../../engine';
import type { Direction } from '../model';
import { SectionTitle } from './common';

/** Plain-language charging strategy + per-leg SoC summary (CHG-6) and the DR-1 filter notice. */
export function ChargingStrategy({
  strategy,
  plan,
  direction,
}: {
  strategy: readonly string[];
  plan: RoundTripPlan;
  direction: Direction;
}) {
  const dirPlan = direction === 'outbound' ? plan.outbound : plan.returnTrip;
  const arrivals = dirPlan.stops.map((s) => s.arrivalSocPct);
  const lowest = arrivals.length ? Math.min(...arrivals) : dirPlan.finalLeg.arrivalSocPct;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div>
        <SectionTitle hint="CHG-1 … CHG-5">Charging strategy — the 20→80% rule</SectionTitle>
        <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 7 }}>
          {strategy.map((line, i) => (
            <li key={i} style={{ fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.4 }}>
              {line}
            </li>
          ))}
        </ol>
      </div>

      <div
        className="glass"
        style={{ padding: 12, borderRadius: 12, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13 }}
      >
        <Fact label="Stops this leg" value={`${dirPlan.totals.stopCount}`} />
        <Fact label="Start SoC" value={`${Math.round(dirPlan.startSocPct)}%`} />
        <Fact label="Lowest charger arrival" value={`${Math.round(lowest)}%`} accent={lowest < 20 ? 'var(--warn)' : 'var(--ok)'} />
        <Fact
          label="Arrival at end"
          value={`${Math.round(dirPlan.finalLeg.arrivalSocPct)}%`}
          accent={dirPlan.finalLeg.belowPreferredFloor ? 'var(--warn)' : 'var(--ok)'}
        />
      </div>

      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--accent)' }}>DR-1 filter (absolute):</strong> only ≥200 kW DC fast
        chargers appear here (200–300 kW delivered to the EV6, whose ~235 kW peak caps the 350 kW-class hardware),
        prioritizing Francis Energy & Electrify America — no slower stations are shown even
        as backups. Every stop charges to exactly 80% (CHG-3) and is planned to arrive at ≥20% (CHG-4); stops above
        the ~35% tolerance are spacing-forced (the next station was unreachable without dropping below 20%).
        {dirPlan.finalLeg.belowPreferredFloor && (
          <>
            {' '}
            <span style={{ color: 'var(--warn)' }}>
              Note: the final leg home arrives at {Math.round(dirPlan.finalLeg.arrivalSocPct)}% — below the
              preferred 20%. The closest verified ≥200 kW charger to Jenks is 140 mi out and charging past 80% is
              forbidden (CHG-3), so no compliant alternative exists. Applies only to the home endpoint, never a
              charger.
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: accent ?? 'var(--ink)' }}>{value}</div>
    </div>
  );
}
