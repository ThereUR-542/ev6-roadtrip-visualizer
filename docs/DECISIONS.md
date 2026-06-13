# Build Decisions — Pearl White EV6 Road Trip Visualizer

Authoritative decisions made by the CEO for the build of `docs/PRD.md` (canonical PRD also at issue document `/PLE/issues/PLE-37#document-ev6-to-sq4d`). The board asked us to proceed with minimal questions, so all PRD Open Questions are resolved by adopting the PRD's own recommendations. **Every adopted OQ default must be flagged in release notes** (PRD § Open Questions).

## Open Question resolutions (all = PRD recommendation, adopted 2026-06-13)

- **OQ-1 Travel dates:** departure date is a user input, defaulting to the current date.
- **OQ-2 Energy prices:** editable inputs seeded with documented real prices (charger-network published rates; regional gas averages); sources noted in UI per ACC-5.
- **OQ-3 API keys / paid APIs:** prefer keyless/free integrations — Google Maps embed iframe (no key required for basic embeds) and Open-Meteo for weather (free, no key). If any paid key becomes unavoidable, STOP and escalate to the CEO before adopting; do not create recurring costs.
- **OQ-4 Hotels:** include verified overnight hotel stop(s) in both driving modes when the timeline crosses a sensible daily driving limit (~10–11 h driving/day). Hotels fall under ACC-1..ACC-3 like all locations.
- **OQ-5 Rental at ISP:** include rental car pickup + drive time for both LGA and ISP.
- **OQ-6 Baseline efficiency:** EPA figures for the exact model/trim (2023 EV6 GT-Line AWD; 2023 Sportage Hybrid), adjusted conservatively for highway speeds; defaults documented and editable (FR-16).
- **OQ-7 Southwest fares:** documented, timestamped fare snapshot for last-minute booking, with a written refresh procedure in the repo, labeled as estimate per ACC-5.
- **OQ-8 Coffee rating source:** Google Maps rating at time of verification, recorded in `docs/verification.md` (ACC-2).
- **OQ-9 Return leg:** planned independently under the same CHG rules; starting SoC at Calverton is an editable assumption (default 100% if overnight charging is available at/near the Calverton hotel, else document the assumption).
- **OQ-10 Sportage refueling:** realistic refueling time counts toward the Sportage timeline and fuel cost toward running costs, but gas stations are never rendered as stops (DR-2).

## Technical baseline

- React 18+ / TypeScript / Vite. Dark glassmorphism only (NFR-2); no light mode.
- Verified dataset lives as typed data (e.g. `src/data/*.ts` or JSON + types) generated in Phase 1; `docs/verification.md` is the ACC-2 artifact.
- Charging math engine (Phase 2) is pure, unit-tested TypeScript — no UI dependencies — so QA can verify CHG-1..CHG-6 leg-by-leg.
- GitHub repo + Vercel auto-deploy land in Phase 5 (NFR-5/6).

## Model assignments (set in Paperclip, all Claude Local)

- CEO — Fable 5 (board-approved; token-frugal coordination, no polling).
- Backend Developer — **Fable 5**: Phase 1 multi-source verification (anti-hallucination critical) and Phase 2 charging math.
- Frontend Developer — **Fable 5** for Phase 3 (creative glassmorphic UI); switched to **Sonnet 4.6** for Phase 4 (pattern-following feature work) via CEO checkpoint.
- QA Engineer — **Opus 4.8**: systematic pass/fail audit of every numbered requirement.
- DevOps Engineer — **Sonnet 4.6**: procedural GitHub/Vercel setup.
- Engineering Lead — in `error` state; deliberately bypassed, CEO coordinates phases directly.

## Hard rules (non-negotiable, from board + PRD)

- CHG-1..CHG-6 charging discipline and DR-1/DR-2/DR-3 display filters are pass/fail gates.
- ACC-1..ACC-5: every physical location verified from ≥2 independent sources and documented; zero fake/placeholder data.
- Strict phase order 1→2→3→4→5; phases are chained with first-class blockers in Paperclip.
