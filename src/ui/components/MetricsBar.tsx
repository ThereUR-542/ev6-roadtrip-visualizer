import type { ComparisonOption } from '../model';
import { fmtHours, fmtMiles, fmtUsd } from '../format';
import { EstBadge, Stat } from './common';

/** Per-option journey metrics: total mileage, time at the speed limit, running cost (FR-7). */
export function MetricsBar({ option }: { option: ComparisonOption }) {
  const costNote = option.lines.map((l) => `${l.label}: ${fmtUsd(l.amountUsd)} — ${l.note}`).join('\n\n');
  return (
    <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <Stat label="Round-trip distance" value={option.roundTripMiles ? fmtMiles(option.roundTripMiles) : '—'} sub="Jenks ⇄ Calverton" />
      <Stat
        label="Total time"
        value={fmtHours(option.totalHours)}
        sub="at the speed limit + stops"
        accent="var(--accent)"
      />
      <Stat
        label="Running cost"
        value={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {fmtUsd(option.costUsd)}
            <span title={costNote}>
              <EstBadge note="Sum of the labeled cost lines below — hover each for its assumption (ACC-5)." />
            </span>
          </span>
        }
        accent="var(--accent-2)"
      />
      {option.lodgingUsd != null && (
        <Stat
          label="+ en-route lodging"
          value={fmtUsd(option.lodgingUsd)}
          sub="2 nights, est. (OQ-4)"
        />
      )}
    </div>
  );
}
