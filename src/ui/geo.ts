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
 * Precise display coordinates for the in-modal Google Street View embed (FR-9).
 *
 * These are NOT the approximate map-placement values in STOP_COORDS above; each
 * was geocoded from the location's already-verified street address (OpenStreetMap
 * / Nominatim, 2026-06-13) and is precise enough that the keyless Street View
 * embed (`maps.google.com/...&output=svembed`) snaps to a real panorama of the
 * actual location — never a placeholder (ACC-3). They are a display aid derived
 * from verified addresses, so they are labeled an estimate (ACC-5) in docs, not
 * a new ≥2-source fact. Two entries are intentionally snapped a few metres to the
 * site's access road because the rooftop centroid of a large building has no
 * Street View panorama within Google's snap radius (it would fall back to a blank
 * "No Street View available" frame). Every id here was verified to render a live,
 * draggable panorama. See docs/verification.md §Street View coordinates.
 */
export const STREET_VIEW_COORDS: Record<string, { lat: number; lng: number }> = {
  'ea-walmart-mount-vernon-mo': { lat: 37.094447, lng: -93.822614 }, // road-snapped (no pano at rooftop centroid)
  'ea-caseys-lebanon-mo': { lat: 37.674784, lng: -92.659823 },
  'ea-walmart-sullivan-mo': { lat: 38.220807, lng: -91.154915 },
  'ea-walmart-collinsville-il': { lat: 38.674732, lng: -90.017379 },
  'ea-firefly-grill-effingham-il': { lat: 39.139298, lng: -88.565152 }, // road-snapped (no pano at rooftop centroid)
  'ea-walmart-terre-haute-in': { lat: 39.399622, lng: -87.405889 },
  'ea-walmart-indianapolis-emerson-in': { lat: 39.749194, lng: -86.082823 },
  'ea-walmart-huber-heights-oh': { lat: 39.863295, lng: -84.098294 },
  'ea-walmart-columbus-westpointe-oh': { lat: 39.983368, lng: -83.145034 },
  'ea-walmart-cambridge-oh': { lat: 39.989419, lng: -81.576689 },
  'ea-sheetz-belle-vernon-pa': { lat: 40.185499, lng: -79.814462 },
  'ea-sheetz-bedford-pa': { lat: 40.05279, lng: -78.510285 },
  'ea-sheetz-carlisle-pa': { lat: 40.212515, lng: -77.178607 },
  'ea-brixmor-village-west-allentown-pa': { lat: 40.596887, lng: -75.524639 },
  'ea-brixmor-parkway-plaza-carle-place-ny': { lat: 40.748216, lng: -73.61772 },
  'ea-manorville-square-manorville-ny': { lat: 40.82521, lng: -72.807803 },
  'black-wall-street-liquid-lounge': { lat: 36.177314, lng: -95.986251 },
  'el-cafecito-springfield-mo': { lat: 37.169738, lng: -93.295331 },
  'e61-cafe-st-louis': { lat: 38.64821, lng: -90.278395 },
  'loose-goose-terre-haute-in': { lat: 39.433509, lng: -87.406708 },
  'claypot-coffee-house-indianapolis': { lat: 39.642418, lng: -86.130569 },
  'tiger-eye-coffee-harrisburg-pa': { lat: 40.259825, lng: -76.843859 },
  'nowhere-coffee-roastery-allentown-pa': { lat: 40.600693, lng: -75.475013 },
  'hampton-inn-dayton-huber-heights': { lat: 39.866782, lng: -84.135918 },
  'holiday-inn-express-dayton-huber-heights': { lat: 39.866673, lng: -84.134881 },
  'hyatt-place-long-island-east-end': { lat: 40.918463, lng: -72.655991 },
  'residence-inn-long-island-east-end': { lat: 40.923552, lng: -72.715355 },
};

export function streetViewCoordFor(id: string): { lat: number; lng: number } | undefined {
  return STREET_VIEW_COORDS[id];
}

/**
 * Keyless Google Street View embed URL (OQ-3) for a verified lat/lng. Uses the
 * no-key `output=svembed` panorama endpoint; the camera snaps to the nearest
 * real panorama and is fully draggable. `cbp` only sets the initial framing.
 */
export function streetViewEmbedUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&cbp=12,20,0,0,0&output=svembed`;
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
