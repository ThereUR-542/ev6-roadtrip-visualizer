import type { WeatherState } from '../useWeather';
import { fmtDateLong } from '../format';
import { SectionTitle } from './common';

/** Weather along the route + proactive guidance (FR-11). Open-Meteo, no key (OQ-3). */
export function WeatherStrip({
  weather,
  departureDate,
  onDateChange,
}: {
  weather: WeatherState;
  departureDate: string;
  onDateChange: (d: string) => void;
}) {
  const warnings = weather.points.filter((p) => p.severity > 0).sort((a, b) => b.severity - a.severity);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SectionTitle
        hint={
          <span className="badge est" title="Open-Meteo forecast (free, no API key, OQ-3). Forecasts are estimates (ACC-5).">
            ⓘ Open-Meteo · estimate
          </span>
        }
      >
        Weather along the route
      </SectionTitle>

      <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, color: 'var(--ink-dim)' }}>Departure date (OQ-1)</label>
        <input
          type="date"
          value={departureDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={{ width: 'auto' }}
        />
        <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{fmtDateLong(departureDate)}</span>
      </div>

      {/* Proactive guidance */}
      {weather.loading ? (
        <div style={{ fontSize: 13, color: 'var(--ink-dim)' }}>Loading forecast…</div>
      ) : weather.error ? (
        <div className="badge warn">Weather unavailable ({weather.error}). Drive plan unaffected.</div>
      ) : weather.outOfRange ? (
        <div className="badge est">
          No forecast for this date — Open-Meteo covers ~16 days ahead. Pick a nearer date for guidance.
        </div>
      ) : warnings.length === 0 ? (
        <div className="glass" style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13, color: 'var(--ok)' }}>
          ✓ Clear conditions expected along the corridor on {fmtDateLong(departureDate)}. No adverse-weather legs.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {warnings.map((w) => (
            <div
              key={w.label}
              className="glass"
              style={{
                padding: '9px 13px',
                borderRadius: 12,
                fontSize: 13,
                color: w.severity === 2 ? 'var(--warn)' : 'var(--warn-2)',
                borderLeft: `3px solid ${w.severity === 2 ? 'var(--warn)' : 'var(--warn-2)'}`,
              }}
            >
              {w.guidance}
            </div>
          ))}
        </div>
      )}

      {/* Waypoint forecasts */}
      {!weather.loading && !weather.error && !weather.outOfRange && weather.points.length > 0 && (
        <div className="scroll-x" style={{ display: 'flex', gap: 10 }}>
          {weather.points.map((p) => (
            <div key={p.label} className="glass" style={{ flex: '0 0 auto', minWidth: 132, padding: 12, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>
                {p.label}, {p.state}
              </div>
              <div style={{ fontSize: 26, marginTop: 2 }}>{p.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.condition}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 3 }}>
                {p.tMaxF}° / {p.tMinF}°F
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
                💧 {Math.round(p.precipProbPct)}% · 💨 {Math.round(p.windMaxMph)} mph
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
