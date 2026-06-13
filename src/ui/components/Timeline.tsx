import { socAtMile, type Journey, type Mode } from '../model';
import { fmtHours, fmtMiles, fmtPct } from '../format';
import { STOP_STYLE } from './common';

/**
 * Trip timeline + scrubbing slider (FR-7 full timeline, FR-12 scrub). Moving
 * the slider updates the metrics-at-point (and, via the parent, the map dot).
 */
export function Timeline({
  journey,
  mode,
  avgSpeedMph,
  scrubMile,
  onScrub,
  onSelectStop,
}: {
  journey: Journey;
  mode: Mode;
  avgSpeedMph: number;
  scrubMile: number;
  onScrub: (mile: number) => void;
  onSelectStop: (id: string, kind: string) => void;
}) {
  const total = journey.totalMiles;
  const frac = total ? scrubMile / total : 0;

  // Elapsed driving + dwell at the scrub point.
  const driveH = scrubMile / avgSpeedMph;
  let dwellH = 0;
  if (mode === 'ev6' && journey.chargeMinutesByMile) {
    dwellH = journey.chargeMinutesByMile.filter((c) => c.mile <= scrubMile).reduce((a, c) => a + c.minutes, 0) / 60;
  } else if (mode === 'sportage') {
    dwellH = (journey.stops.filter((s) => s.kind === 'coffee' && s.mileFromStart <= scrubMile).length * 20) / 60;
  }
  const elapsedH = driveH + dwellH;

  const soc = journey.socNodes ? socAtMile(journey.socNodes, scrubMile) : null;
  const next = journey.stops.find((s) => s.mileFromStart > scrubMile + 0.5);
  const passed = journey.stops.filter((s) => s.kind !== 'origin' && s.mileFromStart <= scrubMile + 0.5).length;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-dim)', marginBottom: 8 }}>
          <span>{journey.startLabel}</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
            Mile {Math.round(scrubMile)} / {total} · {Math.round(frac * 100)}%
          </span>
          <span>{journey.endLabel}</span>
        </div>
        <input
          className="scrub"
          type="range"
          min={0}
          max={total}
          step={1}
          value={Math.round(scrubMile)}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="Scrub through the trip"
        />
      </div>

      {/* Metrics at point */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${soc != null ? 4 : 3}, minmax(0,1fr))`,
          gap: 12,
        }}
      >
        <PointStat label="Elapsed" value={fmtMiles(scrubMile)} sub={`${Math.round(frac * 100)}% of leg`} />
        <PointStat label="Time elapsed" value={fmtHours(elapsedH)} sub={`@ ${avgSpeedMph} mph + stops`} />
        {soc != null && (
          <PointStat
            label="Battery"
            value={fmtPct(soc)}
            sub={soc < 20 ? 'below 20% floor' : '20–80% window'}
            accent={soc < 20 ? 'var(--warn)' : 'var(--ok)'}
          />
        )}
        <PointStat
          label="Next"
          value={next ? `${STOP_STYLE[next.kind].glyph} ${Math.round(next.mileFromStart - scrubMile)} mi` : '—'}
          sub={next ? next.name : 'arrived'}
        />
      </div>

      {/* Timeline strip */}
      <div className="scroll-x" style={{ display: 'flex', gap: 10, paddingBottom: 6 }}>
        {journey.stops.map((s, i) => {
          const st = STOP_STYLE[s.kind];
          const isPassed = s.mileFromStart <= scrubMile + 0.5;
          const clickable = s.kind === 'charge' || s.kind === 'coffee' || s.kind === 'hotel';
          return (
            <button
              key={`${s.kind}-${s.id}-${i}`}
              onClick={() => (clickable ? onSelectStop(s.id, s.kind) : onScrub(s.mileFromStart))}
              className="glass"
              style={{
                flex: '0 0 auto',
                minWidth: 150,
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 12,
                border: `1px solid ${isPassed ? st.color + '66' : 'var(--glass-border)'}`,
                opacity: isPassed ? 1 : 0.72,
                background: isPassed ? `linear-gradient(180deg, ${st.color}14, transparent)` : 'var(--glass-bg)',
                cursor: 'pointer',
              }}
              title={clickable ? 'Open details' : 'Jump here'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-dim)' }}>
                <span style={{ color: st.color, fontSize: 14 }}>{st.glyph}</span>
                {fmtMiles(s.mileFromStart)}
              </div>
              <div style={{ fontWeight: 650, fontSize: 13, marginTop: 3, lineHeight: 1.15 }}>{s.name}</div>
              {s.detail && <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 3 }}>{s.detail}</div>}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
        {passed} of {journey.stops.length - 1} stops reached · click ⚡/☕/🛏 cards for details, or any card to jump the slider.
      </div>
    </div>
  );
}

function PointStat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="glass" style={{ padding: '10px 12px', borderRadius: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: accent ?? 'var(--ink)', marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}
