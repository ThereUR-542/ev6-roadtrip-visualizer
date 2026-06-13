# Phase 3 — Core UI (PLE-40)

Premium dark glassmorphic React UI on top of the Phase 1 verified dataset
(`src/data/`) and the Phase 2 engines (`src/engine/`). The UI owns no trip
facts: every number is computed by the engines from the dataset and recomputed
on any input change (`src/ui/model.ts`, memoized in `src/App.tsx`).

## Run / verify

```
npm install --include=dev
npm run dev        # http://localhost:5173 — EV6 view loads by default
npm run build      # tsc --noEmit && vite build — clean
npm test           # 35 Phase 2 unit tests still pass (UI adds no engine logic)
```

## Layout

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Mode/direction/scrub/settings state; memoized `buildTripModel`. |
| `src/ui/model.ts` | Settings → engine outputs → per-direction `Journey` objects, SoC ledger, comparison rows. |
| `src/ui/geo.ts` | Approx US outline + equirectangular projection + route spine (map placement only; trip facts come from the engine). |
| `src/ui/useWeather.ts` | Open-Meteo fetch (keyless) + proactive guidance. |
| `src/ui/components/*` | TopNav, DrivingView, JourneyMap, Timeline, ChargingStrategy, WeatherStrip, StopModal, SettingsPanel, MetricsBar, ComparisonDashboard, SouthwestView, VehicleRender. |
| `src/assets/{ev6,sportage}.png` | 3D-style renders (FR-8). |

## Requirement → implementation map (for QA)

- **FR-1 / FR-4** — `TopNav` three modes; Southwest is a visually distinct comparison mode (amber accent, no map).
- **FR-2** — `App` initial `mode = 'ev6'`.
- **FR-3** — mode switch is pure React state + memo; `.swap` 180 ms transition, no reload.
- **FR-5 / FR-6** — `JourneyMap`: US outline + Jenks→Calverton route line, stops plotted in sequence; outbound/return toggle in `DrivingView`.
- **FR-7** — `MetricsBar` (mileage, time at speed limit, running cost) + `Timeline` (full timeline).
- **FR-8** — `VehicleRender`: Pearl White EV6 GT-Line / Dark Matte Gray Sportage Hybrid renders.
- **FR-9 / FR-10** — `StopModal`: keyless `google.com/maps?...&output=embed` iframe (OQ-3), details/rating/recommendation/sources strictly from the dataset; no invented photos (real imagery linked on Google, ACC-3).
- **FR-11** — `WeatherStrip` + `useWeather`: Open-Meteo (no key), 7 waypoints across the corridor, proactive warnings; departure date input defaults to today (OQ-1).
- **FR-12** — `Timeline` range slider scrubs 0→total; updates the metrics-at-point and the map position dot.
- **FR-13 / FR-14** — `ComparisonDashboard`: bar charts (graphical) + table + per-option drill-in modals, all three options (EV6, Sportage, Southwest LGA + ISP).
- **FR-16** — `SettingsPanel`: editable EV6 mi/kWh, DC power, return SoC, DC/home prices, Sportage MPG, avg speed; wired through `buildTripModel`.
- **CHG-6** — `ChargingStrategy` shows the plain-language 20→80% rule; every stop shows arrival SoC → charge-to SoC (timeline chips + stop modal); slider shows live interpolated SoC.
- **DR-1** — EV6 view renders only the dataset's ≥200 kW Electrify America stations; strategy card states the absolute filter.
- **DR-2** — Sportage view renders only ≥4.9★ coffee shops (+ hotels); no gas/charging stations; OQ-10 refuel time/cost counted in `SportageNotes`/metrics but never drawn as stops.
- **DR-3** — Southwest view is timeline-only, no map.
- **SW-1..SW-6** — `SouthwestView`: both airports (LGA preferred, ISP alt), Companion Pass economics, ordered timeline, SW-5 bulky-samples note, dashboard inclusion.
- **ACC-5** — every estimate carries an `ⓘ est.` badge whose tooltip is the assumption/source from the dataset/engine notes.
- **NFR-1** — React 18 + TypeScript (strict). **NFR-2** — dark glassmorphism only (`src/index.css`). **NFR-3** — transitions, responsive grids (desktop + tablet), instant toggle.

## OQ resolutions surfaced in-app (release-notes flag per DECISIONS.md)

OQ-1 (departure date input, default today) · OQ-2 (editable seeded prices, sources in `ⓘ est.` tooltips) · OQ-3 (keyless Google embed + Open-Meteo) · OQ-4 (overnight + destination hotel stops) · OQ-6 (editable EPA-derived efficiency defaults) · OQ-8 (Google rating shown with evidence) · OQ-9 (editable Calverton return start SoC) · OQ-10 (Sportage refuel time/cost counted, no gas stops).

## Out of scope for this phase (per the PLE-40 acceptance list)

FR-15 (PDF export) and FR-17 (checklist/packing) are Phase 4. FR-18 tolls are
already included in running costs via the Phase 2 engine.
