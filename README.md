# Pearl White EV6 Road Trip Visualizer

Interactive road-trip planner comparing three travel modes (2023 EV6 GT-Line AWD, 2023 Sportage Hybrid, Southwest Airlines) for the Jenks OK → Calverton NY route.

## Live App

**Production URL:** https://ev6-roadtrip-visualizer.vercel.app

**Repository:** https://github.com/ThereUR-542/ev6-roadtrip-visualizer

## Features

- Three-way comparison: EV6 / Sportage Hybrid / Southwest flight
- Real-time charging stop planning with CHAdeMO/CCS network data
- Cost breakdown: energy, tolls, hotels, food
- Weather and traffic overlays
- Dark glassmorphism UI

## Development

```bash
npm install
npm run dev      # localhost:5173
npm run build    # production build → dist/
npm run test     # unit tests
```

## Tech Stack

- React 18 + TypeScript + Vite
- Vitest for unit testing
- Vercel for hosting (auto-deploy on push to `main`)

## Data Sources

All location and cost data is verified from ≥2 independent sources. See `docs/verification.md` for the full ACC-2 artifact.

Energy prices: Open-Meteo (weather, free/keyless), charger-network published rates, regional gas averages.
Southwest fares: timestamped snapshot — see `docs/verification.md` for refresh procedure.
