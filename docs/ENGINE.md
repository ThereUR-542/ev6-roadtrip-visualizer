# Phase 2 — Math Engine (CHG-1..CHG-6, cost/time, Southwest)

Pure, unit-tested TypeScript in `src/engine/`, no UI dependencies (importable
by the Phase 3 UI). Operates entirely over the Phase 1 verified dataset
(`src/data/`). All estimate defaults are labeled in code with their assumption
so the UI can surface them per ACC-5.

| File | Responsibility |
| --- | --- |
| `efficiency.ts` | Adjustable efficiency model + EPA-derived defaults (FR-16, OQ-6). |
| `chargingPlan.ts` | EV6 charging plan engine (CHG-1..CHG-6, OQ-9). |
| `costs.ts` | EV6 + Sportage cost/time, tolls (FR-7, FR-16, FR-18, OQ-2, OQ-10). |
| `southwest.ts` | Southwest time/cost (SW-1..SW-4, SW-6, OQ-5, OQ-7). |
| `*.test.ts` | 35 unit tests — **QA's CHG verification basis**. |

## How CHG-1..CHG-6 are implemented

`planDirection()` uses a **greedy farthest-reachable** strategy: from the
current position it skips to the farthest verified ≥200 kW station reachable
without dropping below the 20% floor, charges to exactly 80%, and repeats.
This drives each leg as close to 20% as the real station spacing allows
(CHG-2) and minimizes stop count.

- **CHG-1** — outbound `startSocPct` is hard-coded 100; the first leg departs 100%.
- **CHG-2 / CHG-5** — every stop charges to exactly 80%; every leg after the first departs 80%.
- **CHG-3** — `chargeToPct` defaults to 80 and is the planning ceiling; nothing plans above it.
- **CHG-4** — `minChargerArrivalPct` = 20 is a hard floor on charger arrivals; arrivals above the ~35% tolerance are flagged `spacingForced` and the test suite independently proves that skipping such a stop would breach 20%.
- **CHG-6** — each `PlannedChargeStop` exposes `arrivalSocPct` and `chargeToSocPct`; `chargingStrategyText` carries the plain-language strategy for the EV6 view.

### Computed default plan (efficiency 2.7 mi/kWh, 77.4 kWh pack)

- **Outbound** (Jenks 100% → Calverton): 15 charging stops, every arrival ≥20% (lowest 22.6% at Cambridge OH), first stop Mount Vernon MO at 33% (within tolerance), arrives Calverton at 52%.
- **Return** (Calverton 100% → Jenks, planned independently per OQ-9): 15 stops, arrives home at ~13%.

### Documented exemption — return home-arrival below 20%

The closest verified ≥200 kW charger to Jenks (Mount Vernon, MO) is 140
route-miles out. Outbound, that first gap is covered by the CHG-1 100% start.
On the **return**, the final 140-mi leg from an 80% departure arrives home at
~13% — below the preferred 20% floor. There is no CHG-3-compliant alternative
(charging past 80% is forbidden; no closer verified ≥200 kW station exists —
all Riverhead/Tulsa-proper DCFC failed the ≥200 kW filter, see
`verification.md §Excluded`). The engine therefore arrives via
`minDestinationArrivalPct` (default 10%) and flags the leg
`belowPreferredFloor: true` so the UI can surface it. This applies only to the
trip endpoint (home), never to a charger arrival; all charger arrivals remain
≥20%.

## OQ-6 efficiency defaults (documented; editable per FR-16)

| Vehicle | Default | Basis |
| --- | --- | --- |
| EV6 GT-Line AWD | **2.7 mi/kWh** | EPA highway ~96 MPGe (≈2.85 mi/kWh), adjusted conservatively for 70–75 mph interstate + climate load (instrumented 75-mph tests ~2.5–2.7). |
| EV6 DC power | **170 kW avg** | 800-V peak ~235 kW with taper; 20→80% sessions average ~160–180 kW. |
| Sportage Hybrid | **36 MPG** | EPA 38 MPG (AWD; FWD 43), adjusted conservatively for sustained interstate speed. |

All three are editable inputs; the plan, costs, and times recompute from them
(FR-16). Energy/gas/toll prices come from the Phase 1 seeds (`src/data/`,
OQ-2) and are likewise editable.

## Cost/time model notes

- **Tolls (FR-18)** — transponder totals computed from the per-segment dataset (GWB eastbound-only); plate billing from the dataset aggregate. Round-trip transponder ≈ **$64.81**.
- **EV6 cost (OQ-2)** — DC fast energy priced at the network rate; the remaining energy (the 100% departures from Jenks and the Calverton hotel L2, OQ-9) priced at the home-electricity rate.
- **Sportage (OQ-10)** — realistic refuel time (~10 min/fill) counts toward the timeline and fuel cost toward running costs, but **no gas-station stop is ever emitted** (DR-2); the only timeline events are the verified ≥4.9★ coffee stops, in route order.
- **Southwest (SW-1..SW-4)** — door-to-door for LGA (preferred) and ISP: drive to TUL, 2-hour buffer (security clears inside it — counted once), flight incl. connections, baggage, rental pickup (LGA off-airport/ISP on-airport, OQ-5), drive to SQ4D. Companion Pass (SW-4) zeroes the second of two tickets. Fares are the timestamped last-minute snapshot (SW-1/OQ-7), labeled estimates.

## Verifying

```
npm install --include=dev
npm run typecheck   # tsc --noEmit, clean
npm test            # 35 tests pass
npm run build       # tsc + vite production build, clean
```

The test suite recomputes the leg-by-leg SoC ledger independently from the raw
dataset (it does not trust engine output fields), so a passing run is direct
evidence that CHG-1..CHG-6 hold against the Phase 1 data.
