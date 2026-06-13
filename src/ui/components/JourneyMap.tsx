import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MAP_W,
  MAP_H,
  ORIGIN,
  DEST,
  project,
  coordsFor,
  buildRouteSpine,
  posAtMileFromJenks,
  spinePath,
} from '../geo';
import { STATE_LINES_PATH, US_LAND_PATH } from '../usStates';
import { chargingStations, route } from '../../data';
import type { Direction, Journey } from '../model';
import { STOP_STYLE } from './common';

const MIN_K = 1;
const MAX_K = 9;
const DRAG_THRESHOLD = 4; // px of motion before a press becomes a pan (vs a click)

interface View {
  k: number;
  tx: number;
  ty: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Keep the scaled map covering the viewBox (no dragging it fully off-screen). */
function clampPan(v: View): View {
  const minTx = MAP_W - v.k * MAP_W;
  const minTy = MAP_H - v.k * MAP_H;
  return { k: v.k, tx: clamp(v.tx, minTx, 0), ty: clamp(v.ty, minTy, 0) };
}

/**
 * Fully interactive, detailed US map (FR-5): real individual state boundaries
 * (us-atlas Census vector data), zoom in/out buttons + mouse-wheel zoom toward
 * the cursor, and click-and-drag panning. The glowing Jenks->Calverton route
 * line, start/destination markers, scrub position (FR-12) and legend stay
 * layered on top of the map. Every charger/coffee/hotel dot is clickable and
 * opens the rich stop modal (FR-9). Map placement is approximate; the
 * authoritative trip facts come from the verified dataset & engines.
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

  // ---- Pan / zoom state ----------------------------------------------------
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [view, setView] = useState<View>({ k: 1, tx: 0, ty: 0 });
  const inv = 1 / view.k; // counter-scale so markers/labels keep constant size

  /** Convert a client point to viewBox coordinates. */
  const toViewBox = useCallback((clientX: number, clientY: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return { vx: 0, vy: 0 };
    return { vx: ((clientX - r.left) / r.width) * MAP_W, vy: ((clientY - r.top) / r.height) * MAP_H };
  }, []);

  /** Zoom by a factor, keeping the anchor viewBox point fixed under the cursor. */
  const zoomAt = useCallback((factor: number, vx: number, vy: number) => {
    setView((prev) => {
      const k = clamp(prev.k * factor, MIN_K, MAX_K);
      const ratio = k / prev.k;
      return clampPan({ k, tx: vx - ratio * (vx - prev.tx), ty: vy - ratio * (vy - prev.ty) });
    });
  }, []);

  // Native non-passive wheel listener so we can preventDefault the page scroll.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { vx, vy } = toViewBox(e.clientX, e.clientY);
      zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, vx, vy);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [toViewBox, zoomAt]);

  // Drag-to-pan. A press only becomes a pan after DRAG_THRESHOLD px of motion,
  // so taps on a marker still register as clicks (and open the modal).
  const drag = useRef<{ id: number; lastX: number; lastY: number; moved: boolean } | null>(null);
  const [panning, setPanning] = useState(false);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, lastX: e.clientX, lastY: e.clientY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.lastX;
    const dy = e.clientY - d.lastY;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      setPanning(true);
      svgRef.current?.setPointerCapture(e.pointerId);
    }
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const vdx = (dx / r.width) * MAP_W;
    const vdy = (dy / r.height) * MAP_H;
    setView((prev) => clampPan({ k: prev.k, tx: prev.tx + vdx, ty: prev.ty + vdy }));
  };
  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drag.current?.id === e.pointerId) {
      if (drag.current.moved) svgRef.current?.releasePointerCapture?.(e.pointerId);
      drag.current = null;
      setPanning(false);
    }
  };

  // Button zooms anchor on the current viewBox center.
  const zoomBtn = (factor: number) => zoomAt(factor, MAP_W / 2, MAP_H / 2);
  const reset = () => setView({ k: 1, tx: 0, ty: 0 });

  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    lineHeight: 1,
    cursor: 'pointer',
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          touchAction: 'none',
          cursor: panning ? 'grabbing' : 'grab',
          background: 'radial-gradient(120% 120% at 40% 10%, rgba(20,30,60,0.6), rgba(6,12,28,0.85))',
          borderRadius: 14,
        }}
        role="img"
        aria-label="US route map"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
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

        {/* Everything inside this group pans + zooms together. */}
        <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
          {/* Land + individual state boundaries (FR-5) */}
          <path d={US_LAND_PATH} fill="url(#landGrad)" stroke="none" fillRule="evenodd" />
          <path
            d={STATE_LINES_PATH}
            fill="none"
            stroke="rgba(150,175,235,0.45)"
            strokeWidth={0.8}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Route line (stays on top of the map) */}
          <path
            d={dPath}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth={3.5}
            strokeLinecap="round"
            filter="url(#glow)"
            opacity={0.95}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={dPath}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1}
            strokeDasharray="2 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Markers — counter-scaled to keep a constant on-screen size */}
          {markers.map((m) => {
            const st = STOP_STYLE[m.kind];
            const clickable = m.kind === 'charge' || m.kind === 'coffee' || m.kind === 'hotel';
            const r = m.kind === 'origin' || m.kind === 'dest' ? 8 : 6;
            return (
              <g
                key={`${m.kind}-${m.id}-${m.mileFromStart}`}
                className={clickable ? 'marker' : undefined}
                transform={`translate(${m.x},${m.y}) scale(${inv})`}
                onClick={clickable ? () => onSelectStop(m.id, m.kind) : undefined}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
              >
                <title>
                  {m.name}
                  {m.detail ? ` — ${m.detail}` : ''}
                </title>
                <circle r={r + 4} fill={st.color} opacity={0.16} />
                <circle r={r} fill={st.color} stroke="#06101f" strokeWidth={1.5} />
                <text y={3.6} textAnchor="middle" fontSize={m.kind === 'origin' || m.kind === 'dest' ? 9 : 7} fill="#06101f">
                  {st.glyph}
                </text>
              </g>
            );
          })}

          {/* Endpoint labels */}
          {start && (
            <g transform={`translate(${start.x},${start.y}) scale(${inv})`}>
              <text y={22} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={600}>
                {direction === 'outbound' ? 'Jenks, OK' : 'Calverton, NY'}
              </text>
            </g>
          )}
          {end && (
            <g transform={`translate(${end.x},${end.y}) scale(${inv})`}>
              <text y={-16} textAnchor="middle" fontSize={11} fill="var(--ink)" fontWeight={600}>
                {direction === 'outbound' ? 'Calverton, NY' : 'Jenks, OK'}
              </text>
            </g>
          )}

          {/* Scrub position (FR-12) */}
          <g transform={`translate(${car.x},${car.y}) scale(${inv})`} filter="url(#glow)">
            <circle r={11} fill="rgba(255,255,255,0.18)">
              <animate attributeName="r" values="9;14;9" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r={6} fill="#ffffff" stroke="#6ea8ff" strokeWidth={2} />
          </g>
        </g>
      </svg>

      {/* Zoom controls (FR-5) */}
      <div
        className="glass"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
        }}
      >
        <button type="button" aria-label="Zoom in" title="Zoom in" style={btnStyle} onClick={() => zoomBtn(1.4)}>
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          style={{ ...btnStyle, borderTop: '1px solid var(--glass-border)' }}
          onClick={() => zoomBtn(1 / 1.4)}
        >
          &minus;
        </button>
        <button
          type="button"
          aria-label="Reset view"
          title="Reset view"
          style={{ ...btnStyle, borderTop: '1px solid var(--glass-border)', fontSize: 13 }}
          onClick={reset}
        >
          ↺
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 11, color: 'var(--ink-faint)' }}>
        {(['origin', journey.stops.some((s) => s.kind === 'charge') ? 'charge' : 'coffee', 'hotel', 'dest'] as const).map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: STOP_STYLE[k].color }}>{STOP_STYLE[k].glyph}</span>
            {STOP_STYLE[k].label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto' }}>Scroll to zoom · drag to pan · click a stop for details. Placement approximate; trip facts come from the verified dataset & engine.</span>
      </div>
    </div>
  );
}
