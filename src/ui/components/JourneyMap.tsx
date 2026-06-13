import { useMemo } from 'react';
import {
  MAP_W,
  MAP_H,
  US_OUTLINE_PATH,
  ORIGIN,
  DEST,
  project,
  coordsFor,
  buildRouteSpine,
  posAtMileFromJenks,
  spinePath,
} from '../geo';
import { chargingStations, route } from '../../data';
import type { Direction, Journey } from '../model';
import { STOP_STYLE } from './common';

/**
 * Horizontal left-to-right journey view over an accurate US map (FR-5/FR-6):
 * the Jenks->Calverton route line with every active-mode stop plotted in
 * sequence, plus the scrub position driven by the timeline slider (FR-12).
 */
export function JourneyMap({
  journey,
  direction,
  scrubMile,
  onSelectStop,
}: {
  journey: Journey;
  direction: Direction;
  scrubMile: number;
  onSelectStop: (id: string, kind: string) => void;
}) {
  const total = route.oneWayMiles;
  const spine = useMemo(() => buildRouteSpine(chargingStations, total), [total]);
  const dPath = useMemo(() => spinePath(spine), [spine]);

  const geoMile = direction === 'outbound' ? scrubMile : total - scrubMile;
  const car = posAtMileFromJenks(spine, geoMile);

  const markers = journey.stops
    .map((s) => {
      const c =
        s.kind === 'origin'
          ? direction === 'outbound'
            ? { lon: ORIGIN.lon, lat: ORIGIN.lat }
            : { lon: DEST.lon, lat: DEST.lat }
          : s.kind === 'dest'
          ? direction === 'outbound'
            ? { lon: DEST.lon, lat: DEST.lat }
            : { lon: ORIGIN.lon, lat: ORIGIN.lat }
          : coordsFor(s.id);
      if (!c) return null;
      const p = project(c.lon, c.lat);
      return { ...s, x: p.x, y: p.y };
    })
    .filter(Boolean) as (Journey['stops'][number] & { x: number; y: number })[];

  const start = markers.find((m) => m.kind === 'origin');
  const end = markers.find((m) => m.kind === 'dest');

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="US route map">
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6ea8ff" />
            <stop offset="100%" stopColor="#57e6c3" />
          </linearGradient>
          <radialGradient id="landGrad" cx="40%" cy="20%" r="90%">
            <stop offset="0%" stopColor="rgba(40,58,104,0.55)" />
            <stop offset="100%" stopColor="rgba(16,24,46,0.35)" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Land */}
        <path d={US_OUTLINE_PATH} fill="url(#landGrad)" stroke="rgba(150,175,235,0.35)" strokeWidth={1.2} />

        {/* Route line */}
        <path d={dPath} fill="none" stroke="url(#routeGrad)" strokeWidth={3.5} strokeLinecap="round" filter="url(#glow)" opacity={0.95} />
        <path d={dPath} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} strokeDasharray="2 7" strokeLinecap="round" />

        {/* Markers */}
        {markers.map((m) => {
          const st = STOP_STYLE[m.kind];
          const clickable = m.kind === 'charge' || m.kind === 'coffee' || m.kind === 'hotel';
          const r = m.kind === 'origin' || m.kind === 'dest' ? 8 : 6;
          return (
            <g
              key={`${m.kind}-${m.id}-${m.mileFromStart}`}
              className={clickable ? 'marker' : undefined}
              transform={`translate(${m.x},${m.y})`}
              onClick={clickable ? () => onSelectStop(m.id, m.kind) : undefined}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              <title>{m.name}{m.detail ? ` — ${m.detail}` : ''}</title>
              <circle r={r + 4} fill={st.color} opacity={0.16} />
              <circle r={r} fill={st.color} stroke="#06101f" strokeWidth={1.5} />
              <text y={3.6} textAnchor="middle" fontSize={m.kind === 'origin' || m.kind === 'dest' ? 9 : 7} fill="#06101f">
                {st.glyph}
              </text>
            </g>
          );
        })}

        {/* Endpoints labels */}
        {start && (
          <text x={start.x} y={start.y + 22} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={600}>
            {direction === 'outbound' ? 'Jenks, OK' : 'Calverton, NY'}
          </text>
        )}
        {end && (
          <text x={end.x} y={end.y - 16} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={600}>
            {direction === 'outbound' ? 'Calverton, NY' : 'Jenks, OK'}
          </text>
        )}

        {/* Scrub position (FR-12) */}
        <g transform={`translate(${car.x},${car.y})`} filter="url(#glow)">
          <circle r={11} fill="rgba(255,255,255,0.18)">
            <animate attributeName="r" values="9;14;9" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r={6} fill="#ffffff" stroke="#6ea8ff" strokeWidth={2} />
        </g>
      </svg>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 11, color: 'var(--ink-faint)' }}>
        {(['origin', journey.stops.some((s) => s.kind === 'charge') ? 'charge' : 'coffee', 'hotel', 'dest'] as const).map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: STOP_STYLE[k].color }}>{STOP_STYLE[k].glyph}</span>
            {STOP_STYLE[k].label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto' }}>Map placement approximate; trip facts come from the verified dataset & engine.</span>
      </div>
    </div>
  );
}
