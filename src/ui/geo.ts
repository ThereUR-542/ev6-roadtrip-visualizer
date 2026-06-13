/**
 * Map geometry for the journey view (FR-5/FR-6).
 *
 * An approximate lower-48 outline plus an equirectangular projection lets the
 * UI draw an accurate-enough US map with the Jenks -> Calverton route line and
 * every stop plotted in its real geographic position. Coordinates are
 * approximate map placements for visualization only — the authoritative trip
 * facts (route miles, SoC, costs) come from the Phase 1 dataset and the Phase 2
 * engines, never from these lat/long values. Labeled accordingly in the UI.
 */

export const MAP_W = 1000;
export const MAP_H = 540;

const LON_MIN = -125;
const LON_SPAN = 59; // to -66
const LAT_MAX = 49.5;
const LAT_SPAN = 25; // to 24.5

/** Equirectangular projection (aspect-corrected via the viewBox) to SVG px. */
export function project(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon - LON_MIN) / LON_SPAN) * MAP_W,
    y: ((LAT_MAX - lat) / LAT_SPAN) * MAP_H,
  };
}

/** Approximate continental-US border, [lon, lat], clockwise from the NW. */
export const US_OUTLINE: ReadonlyArray<[number, number]> = [
  [-124.7, 48.4], [-124.2, 43.0], [-124.4, 40.4], [-122.4, 37.2], [-120.6, 34.5], [-117.1, 32.5],
  [-114.7, 32.7], [-111.0, 31.3], [-108.2, 31.8], [-106.5, 31.8], [-103.0, 29.0], [-101.0, 29.8], [-99.1, 26.4],
  [-97.4, 27.8], [-95.0, 29.2], [-93.8, 29.7], [-91.0, 29.2], [-89.2, 29.3], [-88.0, 30.4], [-85.0, 29.7], [-84.0, 30.1],
  [-82.8, 28.9], [-81.5, 25.8], [-80.1, 25.2], [-80.5, 28.5], [-81.4, 30.7], [-80.9, 32.0], [-78.6, 33.9], [-75.6, 35.2],
  [-76.3, 37.0], [-75.1, 38.5], [-74.0, 40.5], [-71.9, 41.3], [-70.6, 41.7], [-70.0, 42.0], [-70.8, 43.2], [-69.0, 44.0],
  [-67.0, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45.0], [-74.7, 45.0], [-76.5, 44.2], [-79.2, 43.3], [-82.7, 41.7],
  [-83.1, 42.3], [-82.5, 45.0], [-84.8, 45.8], [-88.0, 46.0], [-90.0, 47.3], [-95.0, 49.0], [-104.0, 49.0], [-123.0, 49.0],
  [-124.7, 48.4],
];

export const US_OUTLINE_PATH = US_OUTLINE.map(([lon, lat], i) => {
  const { x, y } = project(lon, lat);
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ') + ' Z';

/** Trip endpoints. */
export const ORIGIN = { id: 'origin', name: 'Jenks, OK', lon: -96.02, lat: 36.02 };
export const DEST = { id: 'dest', name: 'SQ4D HQ — Calverton, NY', lon: -72.76, lat: 40.92 };

/**
 * Approximate geographic placement of every dataset location, keyed by its
 * dataset id (charging stations, coffee shops, hotels). Visualization only.
 */
export const STOP_COORDS: Record<string, { lon: number; lat: number }> = {
  // Charging stations (corridor spine)
  'ea-walmart-mount-vernon-mo': { lon: -93.82, lat: 37.1 },
  'ea-caseys-lebanon-mo': { lon: -92.66, lat: 37.68 },
  'ea-walmart-sullivan-mo': { lon: -91.16, lat: 38.21 },
  'ea-walmart-collinsville-il': { lon: -89.98, lat: 38.67 },
  'ea-firefly-grill-effingham-il': { lon: -88.55, lat: 39.12 },
  'ea-walmart-terre-haute-in': { lon: -87.39, lat: 39.47 },
  'ea-walmart-indianapolis-emerson-in': { lon: -86.1, lat: 39.7 },
  'ea-walmart-huber-heights-oh': { lon: -84.12, lat: 39.84 },
  'ea-walmart-columbus-westpointe-oh': { lon: -83.13, lat: 39.96 },
  'ea-walmart-cambridge-oh': { lon: -81.59, lat: 40.03 },
  'ea-sheetz-belle-vernon-pa': { lon: -79.87, lat: 40.13 },
  'ea-sheetz-bedford-pa': { lon: -78.5, lat: 40.02 },
  'ea-sheetz-carlisle-pa': { lon: -77.19, lat: 40.2 },
  'ea-brixmor-village-west-allentown-pa': { lon: -75.49, lat: 40.6 },
  'ea-brixmor-parkway-plaza-carle-place-ny': { lon: -73.61, lat: 40.75 },
  'ea-manorville-square-manorville-ny': { lon: -72.8, lat: 40.86 },
  // Coffee shops
  'black-wall-street-liquid-lounge': { lon: -95.99, lat: 36.16 },
  'el-cafecito-springfield-mo': { lon: -93.29, lat: 37.18 },
  'e61-cafe-st-louis': { lon: -90.27, lat: 38.65 },
  'loose-goose-terre-haute-in': { lon: -87.39, lat: 39.43 },
  'claypot-coffee-house-indianapolis': { lon: -86.13, lat: 39.66 },
  'tiger-eye-coffee-harrisburg-pa': { lon: -76.83, lat: 40.25 },
  'nowhere-coffee-roastery-allentown-pa': { lon: -75.47, lat: 40.6 },
  // Hotels
  'hampton-inn-dayton-huber-heights': { lon: -84.1, lat: 39.85 },
  'holiday-inn-express-dayton-huber-heights': { lon: -84.1, lat: 39.85 },
  'hyatt-place-long-island-east-end': { lon: -72.66, lat: 40.92 },
  'residence-inn-long-island-east-end': { lon: -72.7, lat: 40.93 },
};

export function coordsFor(id: string): { lon: number; lat: number } | undefined {
  return STOP_COORDS[id];
}

/**
 * Route spine: ordered geographic waypoints (origin -> corridor charging
 * stations by route mile -> destination) tagged with their route mile from
 * Jenks. The corridor is monotonic west->east, so this traces the real roads
 * (I-44 / I-70 / PA Turnpike / I-78 / LIE) closely. Mode-independent — the
 * physical road is the same for both vehicles.
 */
export interface SpinePoint {
  mileFromJenks: number;
  x: number;
  y: number;
}

export function buildRouteSpine(
  stations: { id: string; approxRouteMilesFromJenks: number }[],
  totalMiles: number,
): SpinePoint[] {
  const o = project(ORIGIN.lon, ORIGIN.lat);
  const d = project(DEST.lon, DEST.lat);
  const mid = stations
    .filter((s) => STOP_COORDS[s.id])
    .map((s) => {
      const c = STOP_COORDS[s.id];
      const { x, y } = project(c.lon, c.lat);
      return { mileFromJenks: s.approxRouteMilesFromJenks, x, y };
    })
    .sort((a, b) => a.mileFromJenks - b.mileFromJenks);
  return [{ mileFromJenks: 0, x: o.x, y: o.y }, ...mid, { mileFromJenks: totalMiles, x: d.x, y: d.y }];
}

/** Interpolate an (x,y) position along the spine at a given mile from Jenks. */
export function posAtMileFromJenks(spine: SpinePoint[], mile: number): { x: number; y: number } {
  if (mile <= spine[0].mileFromJenks) return { x: spine[0].x, y: spine[0].y };
  const last = spine[spine.length - 1];
  if (mile >= last.mileFromJenks) return { x: last.x, y: last.y };
  for (let i = 1; i < spine.length; i++) {
    const a = spine[i - 1];
    const b = spine[i];
    if (mile <= b.mileFromJenks) {
      const t = (mile - a.mileFromJenks) / (b.mileFromJenks - a.mileFromJenks || 1);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  return { x: last.x, y: last.y };
}

export function spinePath(spine: SpinePoint[]): string {
  return spine.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}
