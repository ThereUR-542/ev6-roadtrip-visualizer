import { useEffect, useState, type CSSProperties } from 'react';
import type { ComparisonOption } from '../model';
import { fmtHours, fmtMiles, fmtUsd } from '../format';
import { EstBadge, SectionTitle } from './common';

const COLOR: Record<ComparisonOption['key'], string> = {
  ev6: '#9fc0ff',
  sportage: '#b9c0cc',
  'southwest-lga': '#ffd479',
  'southwest-isp': '#e8b27a',
};

/** Comparison dashboard: graphical + table + drill-in modals, all three options (FR-13/FR-14). */
export function ComparisonDashboard({ options }: { options: ComparisonOption[] }) {
  const [drill, setDrill] = useState<ComparisonOption | null>(null);
  const maxHours = Math.max(...options.map((o) => o.totalHours));
  const maxCost = Math.max(...options.map((o) => o.costUsd));

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Graphical (FR-14) */}
      <div className="glass" style={{ padding: 18 }}>
        <SectionTitle hint="click any bar or row to drill in">Total time & cost — all options</SectionTitle>
        <div className="grid-bars">
          <BarGroup title="Door-to-door time" options={options} value={(o) => o.totalHours} max={maxHours} fmt={fmtHours} onPick={setDrill} />
          <BarGroup
            title="Running cost (round trip)"
            options={options}
            value={(o) => o.costUsd}
            max={maxCost}
            fmt={fmtUsd}
            onPick={setDrill}
            rangeFmt={(o) => (o.costRangeUsd ? `${fmtUsd(o.costRangeUsd[0])}–${fmtUsd(o.costRangeUsd[1])}` : undefined)}
          />
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 14, marginBottom: 0 }}>
          Running cost = energy/fuel + tolls (driving) or airfare after Companion Pass (air). En-route lodging, rental
          and bag fees are itemized in each drill-in. All figures are estimates (ACC-5).
        </p>
      </div>

      {/* Table (FR-14) */}
      <div className="glass" style={{ padding: 18 }}>
        <SectionTitle>Comparison table</SectionTitle>
        <div className="scroll-x">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 620 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--ink-faint)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={th}>Option</th>
                <th style={th}>Distance</th>
                <th style={th}>Total time</th>
                <th style={th}>Running cost</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {options.map((o) => (
                <tr key={o.key} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: COLOR[o.key] }} />
                      <div>
                        <div style={{ fontWeight: 650 }}>{o.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{o.sublabel}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>{o.roundTripMiles ? fmtMiles(o.roundTripMiles) : '— (air)'}</td>
                  <td style={td}>{fmtHours(o.totalHours)}</td>
                  <td style={td}>
                    {o.costRangeUsd ? `${fmtUsd(o.costRangeUsd[0])}–${fmtUsd(o.costRangeUsd[1])}` : fmtUsd(o.costUsd)} <EstBadge note="Estimate (ACC-5) — see drill-in for assumptions." />
                  </td>
                  <td style={td}>
                    <button className="badge" onClick={() => setDrill(o)} style={{ cursor: 'pointer' }}>
                      drill in ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {drill && <OptionModal option={drill} onClose={() => setDrill(null)} />}
    </div>
  );
}

function BarGroup({
  title,
  options,
  value,
  max,
  fmt,
  onPick,
  rangeFmt,
}: {
  title: string;
  options: ComparisonOption[];
  value: (o: ComparisonOption) => number;
  max: number;
  fmt: (n: number) => string;
  onPick: (o: ComparisonOption) => void;
  rangeFmt?: (o: ComparisonOption) => string | undefined;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'grid', gap: 12 }}>
        {options.map((o) => {
          const v = value(o);
          const pct = max ? (v / max) * 100 : 0;
          const range = rangeFmt?.(o);
          return (
            <button
              key={o.key}
              onClick={() => onPick(o)}
              style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
              title="Drill in"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--ink-dim)' }}>{o.label}</span>
                <span style={{ fontWeight: 650 }}>{range ?? fmt(v)}</span>
              </div>
              <div className="bar-track" style={{ height: 12 }}>
                <div className="bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COLOR[o.key]}, ${COLOR[o.key]}aa)` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionModal({ option, onClose }: { option: ComparisonOption; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const subtotal = option.costUsd + (option.lodgingUsd ?? 0);

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={option.label}>
      <div className="glass glass-strong modal fade-in" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: COLOR[option.key] }} />
          <h2 style={{ fontSize: 18, marginRight: 'auto' }}>{option.label}</h2>
          <button onClick={onClose} className="nav-pill" style={{ border: '1px solid var(--glass-border)' }} aria-label="Close">
            ✕
          </button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-dim)', marginBottom: 16 }}>
          {option.sublabel} · {fmtHours(option.totalHours)} door-to-door
          {option.roundTripMiles ? ` · ${fmtMiles(option.roundTripMiles)} round trip` : ''}
        </div>

        <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-dim)', marginBottom: 8 }}>
          Cost breakdown
        </h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {option.lines.map((l, i) => (
            <div key={i} className="glass" style={{ padding: '10px 12px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{l.label}</span>
                <span style={{ fontWeight: 700 }}>{fmtUsd(l.amountUsd)}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 4, lineHeight: 1.45 }}>{l.note}</div>
            </div>
          ))}
          {option.lodgingUsd != null && (
            <div className="glass" style={{ padding: '10px 12px', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>En-route lodging (2 nights)</span>
                <span style={{ fontWeight: 700 }}>{fmtUsd(option.lodgingUsd)}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 4 }}>
                Verified overnight hotels, one each way (OQ-4); estimate from booking-site rates (ACC-5).
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--glass-border)', fontWeight: 750 }}>
          <span>Estimated total{option.lodgingUsd != null ? ' (with lodging)' : ''}</span>
          <span style={{ color: 'var(--accent-2)' }}>
            {option.costRangeUsd ? `${fmtUsd(option.costRangeUsd[0])}–${fmtUsd(option.costRangeUsd[1])}` : fmtUsd(subtotal)}
          </span>
        </div>

        <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-dim)', margin: '16px 0 8px' }}>
          Notes
        </h3>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
          {option.notes.map((n, i) => (
            <li key={i} style={{ fontSize: 12.5, color: 'var(--ink-dim)', lineHeight: 1.45 }}>
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const th: CSSProperties = { padding: '8px 10px' };
const td: CSSProperties = { padding: '12px 10px', verticalAlign: 'top' };
