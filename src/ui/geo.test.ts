import { describe, it, expect } from 'vitest';
import { STREET_VIEW_COORDS, streetViewCoordFor, streetViewEmbedUrl } from './geo';
import { chargingStations, coffeeShops, hotels } from '../data';
import { dayOffsetForMile, DRIVE_HOURS_PER_DAY, WEATHER_WAYPOINTS } from './useWeather';

describe('Street View coordinates (FR-9)', () => {
  const allStops = [...chargingStations, ...coffeeShops, ...hotels];

  it('has a precise coordinate for every clickable stop', () => {
    // Every charge/coffee/hotel modal embeds Street View, so each id must resolve.
    const missing = allStops.filter((s) => !streetViewCoordFor(s.id)).map((s) => s.id);
    expect(missing).toEqual([]);
  });

  it('coordinates are real lat/lng in the continental US', () => {
    for (const [id, c] of Object.entries(STREET_VIEW_COORDS)) {
      expect(c.lat, id).toBeGreaterThan(24);
      expect(c.lat, id).toBeLessThan(50);
      expect(c.lng, id).toBeGreaterThan(-125);
      expect(c.lng, id).toBeLessThan(-66);
    }
  });

  it('builds a keyless svembed Street View URL (no API key, OQ-3)', () => {
    const url = streetViewEmbedUrl(40.0, -75.0);
    expect(url).toContain('output=svembed');
    expect(url).toContain('cbll=40,-75');
    expect(url).not.toContain('key=');
  });
});

describe('per-driving-day weather mapping (FR-11 / FIX-3)', () => {
  it('keeps the departure day for the origin', () => {
    expect(dayOffsetForMile(0, 65)).toBe(0);
  });

  it('advances the forecast day for downstream waypoints', () => {
    // At 65 mph and ~10.5 h/day, a waypoint ~2 days out must not be day 0.
    const far = WEATHER_WAYPOINTS[WEATHER_WAYPOINTS.length - 1];
    expect(dayOffsetForMile(far.mile, 65)).toBeGreaterThanOrEqual(1);
  });

  it('is monotonic in distance', () => {
    const offsets = WEATHER_WAYPOINTS.map((w) => dayOffsetForMile(w.mile, 65));
    for (let i = 1; i < offsets.length; i++) expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1]);
  });

  it('a full driving day of miles rolls to the next day', () => {
    const milesPerDay = 65 * DRIVE_HOURS_PER_DAY;
    expect(dayOffsetForMile(milesPerDay + 1, 65)).toBe(1);
  });
});
