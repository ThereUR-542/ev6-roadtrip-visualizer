/**
 * Weather along the route via Open-Meteo (FR-11, OQ-3: free, no API key).
 * Forecasts are sampled at representative waypoints across the whole corridor
 * (not just endpoints) for the chosen departure date, then turned into
 * proactive guidance. All weather is an estimate and labeled as such (ACC-5).
 */
import { useEffect, useState } from 'react';

export interface RouteWaypoint {
  label: string;
  state: string;
  lat: number;
  lon: number;
  /** Approx route mile from Jenks — orders the points west->east. */
  mile: number;
}

/** Representative points spanning the route (FR-11: along the route). */
export const WEATHER_WAYPOINTS: RouteWaypoint[] = [
  { label: 'Tulsa / Jenks', state: 'OK', lat: 36.0, lon: -96.0, mile: 0 },
  { label: 'Springfield', state: 'MO', lat: 37.18, lon: -93.29, mile: 188 },
  { label: 'St. Louis', state: 'MO', lat: 38.63, lon: -90.2, mile: 404 },
  { label: 'Indianapolis', state: 'IN', lat: 39.77, lon: -86.15, mile: 630 },
  { label: 'Columbus', state: 'OH', lat: 39.96, lon: -83.0, mile: 800 },
  { label: 'Harrisburg / Carlisle', state: 'PA', lat: 40.25, lon: -77.0, mile: 1190 },
  { label: 'NYC crossing → Calverton', state: 'NY', lat: 40.8, lon: -73.4, mile: 1450 },
];

export interface WaypointForecast extends RouteWaypoint {
  weatherCode: number;
  condition: string;
  emoji: string;
  tMaxF: number;
  tMinF: number;
  precipProbPct: number;
  windMaxMph: number;
  /** Severity for proactive guidance: 0 none, 1 advisory, 2 warning. */
  severity: 0 | 1 | 2;
  guidance?: string;
}

export interface WeatherState {
  loading: boolean;
  error: string | null;
  /** True when the chosen date is outside Open-Meteo's ~16-day forecast window. */
  outOfRange: boolean;
  points: WaypointForecast[];
  asOf: string;
}

function describeCode(code: number): { condition: string; emoji: string } {
  if (code === 0) return { condition: 'Clear', emoji: '☀️' };
  if (code <= 2) return { condition: 'Partly cloudy', emoji: '🌤️' };
  if (code === 3) return { condition: 'Overcast', emoji: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Fog', emoji: '🌫️' };
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', emoji: '🌦️' };
  if (code >= 61 && code <= 67) return { condition: 'Rain', emoji: '🌧️' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', emoji: '❄️' };
  if (code >= 80 && code <= 82) return { condition: 'Rain showers', emoji: '🌧️' };
  if (code >= 85 && code <= 86) return { condition: 'Snow showers', emoji: '🌨️' };
  if (code >= 95) return { condition: 'Thunderstorms', emoji: '⛈️' };
  return { condition: 'Mixed', emoji: '🌥️' };
}

function deriveGuidance(p: Omit<WaypointForecast, 'severity' | 'guidance'>): { severity: 0 | 1 | 2; guidance?: string } {
  const where = `${p.label}, ${p.state}`;
  if (p.weatherCode >= 95) return { severity: 2, guidance: `⛈️ Thunderstorms forecast near ${where} — consider shifting your timing on this leg.` };
  if ((p.weatherCode >= 71 && p.weatherCode <= 77) || (p.weatherCode >= 85 && p.weatherCode <= 86))
    return { severity: 2, guidance: `❄️ Snow near ${where} — winter driving conditions; allow extra time and range buffer.` };
  if (p.windMaxMph >= 30) return { severity: 2, guidance: `💨 High winds (~${Math.round(p.windMaxMph)} mph) near ${where} — expect reduced range and crosswind handling.` };
  if (p.tMaxF <= 32) return { severity: 2, guidance: `🥶 Freezing temps near ${where} — battery range drops in the cold; precondition before departure.` };
  if (p.precipProbPct >= 60 || (p.weatherCode >= 61 && p.weatherCode <= 67) || (p.weatherCode >= 80 && p.weatherCode <= 82))
    return { severity: 1, guidance: `🌧️ Rain likely (${Math.round(p.precipProbPct)}%) near ${where} — wet roads on this stretch.` };
  if (p.tMaxF >= 95) return { severity: 1, guidance: `🥵 Extreme heat near ${where} — heavy AC load on the battery; hydrate.` };
  if (p.windMaxMph >= 20) return { severity: 1, guidance: `🌬️ Breezy (~${Math.round(p.windMaxMph)} mph) near ${where}.` };
  return { severity: 0 };
}

export function useWeather(departureDate: string): WeatherState {
  const [state, setState] = useState<WeatherState>({
    loading: true,
    error: null,
    outOfRange: false,
    points: [],
    asOf: departureDate,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    const lats = WEATHER_WAYPOINTS.map((w) => w.lat).join(',');
    const lons = WEATHER_WAYPOINTS.map((w) => w.lon).join(',');
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto` +
      `&start_date=${departureDate}&end_date=${departureDate}`;

    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Open-Meteo ${r.status}`);
        return r.json();
      })
      .then((data: unknown) => {
        const arr = Array.isArray(data) ? data : [data];
        const points: WaypointForecast[] = [];
        let anyData = false;
        WEATHER_WAYPOINTS.forEach((wp, i) => {
          const d = (arr[i] as { daily?: Record<string, unknown[]> } | undefined)?.daily;
          const code = d?.weather_code?.[0];
          if (code === undefined || code === null) return;
          anyData = true;
          const { condition, emoji } = describeCode(Number(code));
          const base = {
            ...wp,
            weatherCode: Number(code),
            condition,
            emoji,
            tMaxF: Math.round(Number(d?.temperature_2m_max?.[0] ?? NaN)),
            tMinF: Math.round(Number(d?.temperature_2m_min?.[0] ?? NaN)),
            precipProbPct: Number(d?.precipitation_probability_max?.[0] ?? 0),
            windMaxMph: Number(d?.wind_speed_10m_max?.[0] ?? 0),
          };
          const g = deriveGuidance(base);
          points.push({ ...base, ...g });
        });
        setState({
          loading: false,
          error: null,
          outOfRange: !anyData,
          points,
          asOf: departureDate,
        });
      })
      .catch((e: unknown) => {
        if ((e as Error)?.name === 'AbortError') return;
        setState({
          loading: false,
          error: (e as Error)?.message ?? 'weather unavailable',
          outOfRange: false,
          points: [],
          asOf: departureDate,
        });
      });

    return () => ctrl.abort();
  }, [departureDate]);

  return state;
}
