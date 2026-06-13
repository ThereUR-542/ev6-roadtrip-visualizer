import { useEffect } from 'react';
import { SETTING_NOTES, type Settings } from '../model';
import { EstBadge } from './common';

type NumKey = keyof Omit<Settings, 'departureDate'>;

const FIELDS: { key: NumKey; label: string; unit: string; step: number; min: number; max: number; group: string }[] = [
  { key: 'ev6MiPerKwh', label: 'EV6 efficiency', unit: 'mi/kWh', step: 0.1, min: 1.5, max: 4.5, group: 'EV6' },
  { key: 'ev6AvgDcKw', label: 'EV6 avg DC power', unit: 'kW', step: 5, min: 50, max: 250, group: 'EV6' },
  { key: 'ev6ReturnStartSoc', label: 'Return start SoC (Calverton)', unit: '%', step: 5, min: 30, max: 100, group: 'EV6' },
  { key: 'dcRatePerKwh', label: 'DC fast price', unit: '$/kWh', step: 0.01, min: 0.1, max: 1.2, group: 'Prices' },
  { key: 'homeRatePerKwh', label: 'Home/L2 price', unit: '$/kWh', step: 0.01, min: 0.05, max: 0.6, group: 'Prices' },
  { key: 'sportageMpg', label: 'Sportage fuel economy', unit: 'MPG', step: 1, min: 15, max: 55, group: 'Sportage' },
  { key: 'avgSpeedMph', label: 'Interstate average', unit: 'mph', step: 1, min: 45, max: 80, group: 'Shared' },
];

/** Editable efficiency/price inputs wired to the engines (FR-16, OQ-2). Estimates labeled (ACC-5). */
export function SettingsPanel({
  settings,
  onChange,
  onReset,
  onClose,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)));

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Trip inputs" style={{ justifyItems: 'end', padding: 0 }}>
      <div
        className="glass glass-strong fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(440px, 100vw)', height: '100vh', overflow: 'auto', borderRadius: 0, padding: 22 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h2 style={{ fontSize: 18, marginRight: 'auto' }}>⚙ Trip inputs</h2>
          <button onClick={onClose} className="nav-pill" style={{ border: '1px solid var(--glass-border)' }} aria-label="Close">
            ✕
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', lineHeight: 1.5, marginTop: 0 }}>
          Adjust efficiency and energy prices — the charging plan, costs and times recompute instantly (FR-16). Every
          default is a documented estimate (OQ-2/OQ-6); hover <EstBadge note="Each input ships with its assumption/source (ACC-5)." /> for the assumption.
        </p>

        {groups.map((g) => (
          <div key={g} style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-dim)', marginBottom: 8 }}>
              {g}
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {FIELDS.filter((f) => f.group === g).map((f) => (
                <div key={f.key} className="field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-dim)', marginBottom: 5 }}>
                    {f.label} <span style={{ color: 'var(--ink-faint)' }}>({f.unit})</span>
                    <EstBadge note={SETTING_NOTES[f.key]} />
                  </label>
                  <input
                    type="number"
                    value={settings[f.key]}
                    step={f.step}
                    min={f.min}
                    max={f.max}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (Number.isFinite(v)) onChange({ [f.key]: v } as Partial<Settings>);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={onReset}
          className="nav-pill"
          style={{ marginTop: 22, width: '100%', border: '1px solid var(--glass-border)', padding: '10px' }}
        >
          ↺ Reset to documented defaults
        </button>
      </div>
    </div>
  );
}
