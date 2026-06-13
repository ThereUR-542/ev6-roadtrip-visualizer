import { useState } from 'react';
import { tollSegments, tollTotals } from '../../data';
import { fmtUsd } from '../format';
import { EstBadge, SectionTitle } from './common';

type PaymentMethod = 'transponder' | 'plate';

/**
 * FR-18: toll cost estimator surfaced in running costs.
 * Shows per-segment breakdown and round-trip totals, togglable between
 * transponder (PikePass + E-ZPass) and plate/mail billing.
 */
export function TollEstimator() {
  const [method, setMethod] = useState<PaymentMethod>('transponder');

  const totalEB = method === 'transponder' ? tollTotals.eastboundTransponderUsd : tollTotals.eastboundPlateBillingUsd;
  const totalWB = method === 'transponder' ? tollTotals.westboundTransponderUsd : tollTotals.westboundPlateBillingUsd;
  const roundTrip = totalEB + totalWB;

  const paidSegments = tollSegments.filter((s) => s.carTollUsd > 0);
  const isGwb = (name: string) => name.includes('George Washington');

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SectionTitle hint="FR-18 · 2026 rates">Toll estimator</SectionTitle>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>Payment method:</span>
        <div className="toggle glass" style={{ padding: 3 }}>
          {(['transponder', 'plate'] as PaymentMethod[]).map((m) => (
            <button key={m} className={method === m ? 'on' : ''} onClick={() => setMethod(m)}>
              {m === 'transponder' ? '⚡ Transponder' : '📸 Plate billing'}
            </button>
          ))}
        </div>
        <EstBadge note="Transponder = PikePass (OK) + E-ZPass (PA/NY), GWB off-peak. Plate/mail rates are estimates; PA Turnpike and Throgs Neck mail figures are approximate (ACC-5)." />
      </div>

      {/* Per-segment breakdown (transponder rates; applies to both modes since route is identical) */}
      <div className="glass" style={{ borderRadius: 12, overflow: 'hidden' }}>
        {paidSegments.map((s, i) => (
          <div
            key={i}
            style={{
              padding: '10px 14px',
              borderBottom: i < paidSegments.length - 1 ? '1px solid var(--glass-border)' : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{s.road}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                  {fmtUsd(s.carTollUsd)}{isGwb(s.name) ? ' (EB only)' : ' each way'}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>transponder rate</div>
              </div>
            </div>
            {method === 'plate' && (
              <div style={{ marginTop: 5, fontSize: 11.5, color: 'var(--warn-2)' }}>
                Plate/mail rate: see source — {s.method}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Round-trip summary */}
      <div className="glass" style={{ padding: '12px 14px', borderRadius: 12 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-faint)', marginBottom: 10 }}>
          Round-trip totals — {method === 'transponder' ? 'PikePass + E-ZPass' : 'plate billing (estimate)'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Fact label="Eastbound" value={fmtUsd(totalEB)} sub="Jenks → NY" />
          <Fact label="Westbound" value={fmtUsd(totalWB)} sub="NY → Jenks" />
          <Fact label="Round trip" value={fmtUsd(roundTrip)} accent="var(--accent-2)" />
        </div>
        {method === 'plate' && (
          <p style={{ margin: '10px 0 0', fontSize: 11.5, color: 'var(--warn-2)', lineHeight: 1.4 }}>
            ⓘ Plate billing estimated; PA Turnpike and Throgs Neck mail rates are approximate.
          </p>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 11.5, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
        GWB is tolled eastbound only; westbound is free. PikePass / E-ZPass are interoperable.
        Same toll route for both driving modes — toll total is identical for EV6 and Sportage.
      </p>
    </div>
  );
}

function Fact({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-faint)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 750, color: accent ?? 'var(--ink)', marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
