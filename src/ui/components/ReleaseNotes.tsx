import { useEffect } from 'react';

// Every OQ default adopted per DECISIONS.md (2026-06-13). Required per PRD § Open Questions.
const OQ_DEFAULTS: { id: string; title: string; decision: string; impact: string }[] = [
  {
    id: 'OQ-1',
    title: 'Travel dates',
    decision: 'Departure date is a user input, defaulting to the current date.',
    impact: 'The weather forecast refreshes when the date changes (FR-11).',
  },
  {
    id: 'OQ-2',
    title: 'Energy prices',
    decision: 'Editable inputs seeded with documented real prices: EA guest $0.56/kWh, Oklahoma home electricity $0.12/kWh, AAA state gas averages as of 2026-06-12.',
    impact: 'All running-cost figures recompute when any price input changes (FR-16). Sources labeled in the ⚙ Inputs panel.',
  },
  {
    id: 'OQ-3',
    title: 'API keys / paid APIs',
    decision: 'Keyless/free integrations only: Google Maps basic embed (no API key) and Open-Meteo weather (free, no key).',
    impact: 'No recurring cost incurred. If a paid key becomes necessary in future, escalation to the CEO is required first.',
  },
  {
    id: 'OQ-4',
    title: 'Overnight hotel stops',
    decision: 'Verified overnight hotels included in both driving modes when the route crosses a sensible daily driving limit (~10–11 h). Two hotels used: Huber Heights, OH (en-route) and Hyatt Place Riverhead, NY (destination).',
    impact: 'Hotels appear as stops on the journey map and in the timeline. Nightly rates shown as estimates (ACC-5).',
  },
  {
    id: 'OQ-5',
    title: 'Rental car at ISP',
    decision: 'Rental car pickup + drive time included for both LGA and ISP in the Southwest timeline.',
    impact: 'LGA adds ~1 h (off-airport shuttle). ISP has on-airport pickup at baggage claim — materially faster (SW-2).',
  },
  {
    id: 'OQ-6',
    title: 'Baseline efficiency figures',
    decision: 'EPA figures for each exact model/trim, adjusted conservatively for 70–75 mph highway driving. EV6 GT-Line AWD: 2.7 mi/kWh (EPA ~2.85, conservative). Sportage Hybrid AWD: 36 MPG (EPA 38, conservative).',
    impact: 'Defaults are documented and editable in ⚙ Inputs (FR-16). Adjusting them reruns the entire cost and stop plan.',
  },
  {
    id: 'OQ-7',
    title: 'Southwest fare data method',
    decision: 'Documented, timestamped last-minute fare snapshot: TUL → LGA and TUL → ISP fares observed as of 2026-06-13, labeled as estimates (SW-1/ACC-5). A written refresh procedure is included in the repository.',
    impact: 'Fares shown with an estimate badge. Companion Pass (SW-4) makes the second ticket free.',
  },
  {
    id: 'OQ-8',
    title: 'Coffee-shop rating source',
    decision: 'Google Maps rating at time of verification, recorded in docs/verification.md (ACC-2). Only shops rated 4.9★ or higher on Google at verification date are shown (DR-2).',
    impact: 'Seven shops verified; none east of Allentown, PA reached 4.9★ so that segment shows no coffee stops (honest gap, ACC-3).',
  },
  {
    id: 'OQ-9',
    title: 'Return-leg planning',
    decision: 'Return leg planned independently under the same CHG rules. Calverton start SoC defaults to 100% because the destination Hyatt Place has verified on-site Level 2 charging.',
    impact: 'Return SoC assumption is editable in ⚙ Inputs. The return charging plan may differ from outbound due to different starting conditions.',
  },
  {
    id: 'OQ-10',
    title: 'Sportage refueling in time/cost math',
    decision: 'Realistic refueling time (~10 min per stop) counts toward the Sportage trip timeline. Fuel cost counts toward running costs. Gas stations are never rendered as stops on the map or timeline (DR-2).',
    impact: 'Refueling frequency and total minutes are shown in the Sportage side panel. The DR-2 constraint is a pass/fail gate.',
  },
];

export function ReleaseNotes({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Release notes">
      <div className="glass glass-strong modal fade-in" onClick={(e) => e.stopPropagation()} style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>📋</span>
          <div style={{ marginRight: 'auto' }}>
            <h2 style={{ fontSize: 17 }}>Release notes</h2>
            <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>Open Question defaults adopted — 2026-06-13</div>
          </div>
          <button onClick={onClose} className="nav-pill" style={{ border: '1px solid var(--glass-border)' }} aria-label="Close">✕</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-dim)', lineHeight: 1.5, marginTop: 0, marginBottom: 16 }}>
          Per PRD § Open Questions: the board authorized proceeding on the PRD's own recommendations for all unresolved open questions.
          All ten OQ decisions are recorded below (required by PRD and DECISIONS.md).
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          {OQ_DEFAULTS.map((oq) => (
            <div key={oq.id} className="glass" style={{ padding: '12px 14px', borderRadius: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 5 }}>
                <span className="badge" style={{ flexShrink: 0 }}>{oq.id}</span>
                <span style={{ fontWeight: 650, fontSize: 14 }}>{oq.title}</span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.45 }}>
                {oq.decision}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--ink-dim)' }}>Effect:</strong> {oq.impact}
              </p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 16, marginBottom: 0, fontSize: 11.5, color: 'var(--ink-faint)' }}>
          All decisions are on file in <code>docs/DECISIONS.md</code> in the project repository.
        </p>
      </div>
    </div>
  );
}
