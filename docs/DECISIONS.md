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

## PRD-42 — post-review defect fixes (2026-06-13)

Client reviewed the live build (PRD-41) and confirmed the 5 previously-questioned areas
(comparison table, return trip, Southwest, weather model, timeline slider) are fine — left
unchanged. The agreed fixes:

- **FIX 1 — Stop modals embed real Google Street View (priority).** The "Photos & Street
  View" section now renders a live, draggable, keyless Street View panorama
  (`output=svembed`, OQ-3, no key) of the exact location, with an "Open in Google Maps"
  link below it for the full gallery. The existing interactive map embed is retained above
  it. Precise coordinates added in `src/ui/geo.ts` (`STREET_VIEW_COORDS`), geocoded from the
  verified addresses and each validated to render a real panorama; provenance in
  `docs/verification.md §Street View coordinates`. Holds ACC-3 (real imagery, no placeholders).
- **FIX 2 — Francis Energy callout.** Added a UI note to the EV6 charging-strategy panel
  explaining Francis Energy was prioritized (DR-1) but has no qualifying ≥200 kW station on
  the corridor. Surfaces the existing verified `verification.md §Excluded` conclusion; no
  data changed.
- **FIX 3 — Weather per driving-day.** Each weather waypoint is now forecast for the day the
  traveler reaches it (cumulative driving time vs the ~10–11 h/day overnight cadence) instead
  of the departure day. Single Open-Meteo range request; estimate labeled (ACC-5); FR-11
  guidance preserved.
- **Optional (inline review snippets) — DECLINED, documented.** The PRD says "reviews," and
  the client flagged quoting 1–2 Google review snippets as "for your call, if low-cost." The
  verified dataset records only aggregate Google rating + review count (no quotable, verifiably-
  sourced individual snippets). Inventing or scraping snippets would violate ACC-3, so modals
  keep the aggregate star + count and the link-out to Google for full reviews. Revisit only if
  a verifiable snippet source is added to the dataset.

Tests: added `src/ui/geo.test.ts` (every clickable stop has a valid in-US Street View coord;
keyless svembed URL; per-day weather day-offset is monotonic and advances downstream) and a
Street View assertion to the Playwright modal e2e. Full suite green (47 unit tests + typecheck
+ build).
