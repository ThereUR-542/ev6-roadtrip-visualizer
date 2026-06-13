import type { SouthwestOption } from '../../engine';
import type { ComparisonOption } from '../model';
import { fmtHours, fmtUsd } from '../format';
import { Card, EstBadge, SectionTitle } from './common';
import { ComparisonDashboard } from './ComparisonDashboard';

/**
 * Southwest Airlines mode (FR-4 comparison mode, DR-3 timeline only — no map).
 * Both airports (SW-3: LGA preferred, ISP alt), Companion Pass economics
 * (SW-4), the bulky-samples limitation (SW-5), plus the three-option dashboard.
 */
export function SouthwestView({
  options,
  comparison,
}: {
  options: { lga: SouthwestOption; isp: SouthwestOption };
  comparison: ComparisonOption[];
}) {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Card strong style={{ borderLeft: '3px solid var(--air)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 26 }}>✈️</span>
          <div style={{ marginRight: 'auto' }}>
            <h2 style={{ fontSize: 18 }}>Southwest Airlines — comparison mode</h2>
            <div style={{ fontSize: 12.5, color: 'var(--ink-dim)' }}>
              No map route — a clear door-to-door timeline only (DR-3). Two travelers, Companion Pass applied (SW-4).
            </div>
          </div>
        </div>
        <div
          className="glass"
          style={{ marginTop: 14, padding: '11px 14px', borderRadius: 12, borderLeft: '3px solid var(--warn)', fontSize: 13, color: 'var(--warn)' }}
        >
          ⚠ SW-5: bulky material samples cannot be transported home as luggage when flying — a stated reason the drive
          may win despite the time saving.
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <AirportTimeline opt={options.lga} />
        <AirportTimeline opt={options.isp} />
      </div>

      <ComparisonDashboard options={comparison} />
    </div>
  );
}

function AirportTimeline({ opt }: { opt: SouthwestOption }) {
  return (
    <Card style={opt.preferred ? { borderColor: 'rgba(255,212,121,0.4)' } : undefined}>
      <SectionTitle hint={opt.preferred ? 'preferred (SW-3)' : 'alternative'}>
        TUL → {opt.airport}
      </SectionTitle>
      <div style={{ display: 'flex', gap: 18, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '0.07em' }}>Door-to-door (one way)</div>
          <div style={{ fontSize: 24, fontWeight: 750, color: 'var(--air)' }}>{fmtHours(opt.oneWayHours)}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>round trip {fmtHours(opt.roundTripHours)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '0.07em' }}>
            Airfare (RT, 2 pax) <EstBadge note={opt.cost.note} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 750 }}>
            {fmtUsd(opt.cost.lowUsd)}–{fmtUsd(opt.cost.highUsd)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
            {opt.cost.companionPassApplied ? 'Companion Pass: 2nd ticket free (SW-4)' : `${opt.cost.payingTravelers} paying`}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 0 }}>
        {opt.segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: s.containedInBuffer ? 0.7 : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.containedInBuffer ? 'var(--ink-faint)' : 'var(--air)', marginTop: 5 }} />
              {i < opt.segments.length - 1 && <span style={{ width: 2, flex: 1, background: 'var(--glass-border)' }} />}
            </div>
            <div style={{ paddingBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                {s.label}{' '}
                <span style={{ fontWeight: 500, color: 'var(--ink-dim)' }}>
                  · {s.containedInBuffer ? 'within buffer' : fmtHours(s.hours)}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 2, lineHeight: 1.4 }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
