# PRD: Pearl White EV6 Road Trip Visualizer

## Document Status & Provenance

- **Status:** Build-ready, pending client sign-off on Open Questions (§ Open Questions). All other requirements are final.
- **Source:** Client brief in [PRD-36](/PRD/issues/PRD-36). The raw brief was pasted twice (second copy with markdown escaping artifacts); the copies are content-identical and were deduplicated, first copy treated as canonical. No contradictions existed between them.
- **Sign-off:** Approved by firm-director on 2026-06-13. Drafted on [PRD-40](/PRD/issues/PRD-40); a parallel draft also landed on [PRD-38](/PRD/issues/PRD-38). This document is canonical and incorporates the one unique open question from that draft (OQ-10).
- **Audience:** the external development company that will build, verify, and deploy the app, and the client (the EV6 owner). Written for an engineering team that has never seen the brief.
- **Requirement numbering:** `FR-x` functional, `DR-x` vehicle-specific display rules, `CHG-x` EV6 charging strategy, `SW-x` Southwest mode, `ACC-x` accuracy/verification obligations, `NFR-x` technical/non-functional, `OQ-x` open questions. Every numbered requirement is independently testable: a QA agent can mark it pass/fail without consulting the PRD authors.

## Product Overview

A premium interactive React web application for clear side-by-side comparison of **three travel options** for a **round trip** between **Jenks, Oklahoma** and **SQ4D headquarters, 400 David Ct, Calverton, NY 11933**:

1. **2023 Kia EV6 GT-Line** — Pearl White, VIN `KNDC4DLC2P5098444`, 81,000 miles (the client's car; the app's namesake and default view).
2. **2023 Kia Sportage Hybrid** — Dark Matte Gray, non-plug-in hybrid, 49,000 miles.
3. **Southwest Airlines** — Tulsa (TUL) → LaGuardia (LGA, preferred) or Long Island MacArthur (ISP).

The app answers one question well: *which option costs how much and takes how long, door to door, round trip* — with the EV6 experience treated as the primary, lovingly detailed view.

## Goals

- Let the client compare total time and total cost across the three options at a glance, and drill into every stop and leg in detail.
- Make the EV6 trip plan faithful to the client's stated 20–80% charging discipline (§ EV6 Charging Strategy) — the plan shown must be one the client can actually drive.
- Present only real, verified locations (§ Accuracy Obligations). The app's credibility is the product.

## Non-Goals

- **No booking or transactions** of any kind (flights, hotels, chargers, rentals). The app informs; it does not book.
- **No live vehicle telemetry** (no Kia Connect/OBD integration). State of charge is modeled, not read from the car.
- **No turn-by-turn navigation.** This is a planning/visualization tool, not a nav app.
- **No multi-trip generality.** One origin/destination pair (Jenks, OK ⇄ Calverton, NY) is in scope; do not build a generic trip planner.
- **No user accounts / auth / persistence backend** unless an Open Question resolution adds one.
- **No light mode.** Dark night-mode glassmorphism only.

## Scope & Responsibilities

**In scope for the development company:**

- Build the application per this PRD; React 18+ / TypeScript (NFR-1, NFR-2).
- Perform all location research and **verify every physical location from ≥2 independent sources**, documenting the sources (ACC-1..ACC-5).
- Maintain the code in a GitHub repository with automatic builds deploying to Vercel (NFR-5, NFR-6).
- Provision API keys/integrations needed at build time, subject to OQ-3.

**Out of scope for the PRD firm (authors of this document):**

- Building, testing, or deploying anything.
- Verifying real-world locations or choosing specific charger/coffee-shop/hotel instances — this PRD specifies the *rules and obligations* for selection and verification; the dev team executes them.
- The PRD firm's responsibility ends with this document.

## Definitions

- **SoC** — battery state of charge, in percent.
- **Mode / view** — one of: EV6 view, Sportage Hybrid view, Southwest Airlines view.
- **Leg** — driving segment between two consecutive stops (or origin/destination).
- **Stop** — a charging stop (EV6), coffee stop (Sportage), or itinerary event (Southwest).

## Functional Requirements

### Modes & Navigation

- **FR-1** — The app presents exactly three modes: EV6, Sportage Hybrid, and Southwest Airlines.
- **FR-2** — The **EV6 view is the default** on first load.
- **FR-3** — A prominent vehicle toggle/selector switches **instantly** between EV6 and Sportage Hybrid views (no full page reload; perceived switch ≤ ~200 ms).
- **FR-4** — Southwest Airlines is a **separate comparison mode**, reachable from the same top-level navigation but visually distinct from the two driving views.

### Journey View (driving modes only)

- **FR-5** — Driving modes render a **horizontal, left-to-right journey view** over an **accurate US map** with the route line drawn between Jenks, OK and Calverton, NY.
- **FR-6** — All stops for the active vehicle are plotted on the route in sequence, with both outbound and return directions of the round trip representable (see OQ-9 for direction symmetry).
- **FR-7** — The journey view displays, per option: total mileage, estimated driving time **at the speed limit**, running costs, and a full trip timeline.

### Vehicle Renders

- **FR-8** — Each driving view shows an accurate **3D-style visual render** of the active vehicle: Pearl White Kia EV6 GT-Line and Dark Matte Gray Kia Sportage Hybrid. Colors must match the named colors; the render must be identifiable as the correct model (not a generic car silhouette).

### Stop Detail Modals

- **FR-9** — Clicking any stop opens a rich **glassmorphic modal** containing: an **embedded Google Map** of the location, full details, ratings, reviews, photos, and recommendations.
- **FR-10** — Every fact shown in a stop modal must come from the verified dataset (ACC-1..ACC-4) — no placeholder text, stock photos standing in for real locations, or invented reviews.

### Weather Integration

- **FR-11** — Weather forecasts are integrated **along the route** (not just endpoints) and surfaced with **proactive guidance** (e.g., warnings on legs with adverse forecasts), for both driving modes.

### Timeline Slider

- **FR-12** — A timeline slider lets the user **scrub through the trip**; the journey view and displayed metrics update to reflect the selected point in the trip.

### Comparison Dashboard

- **FR-13** — A comparison dashboard shows **clear visual and numerical** total-time and total-cost differences across all three options simultaneously.
- **FR-14** — The three options can be compared in **all three** of: graphical form, drill-in modals, and a clean comparison **table** (one of each at minimum).

### PDF Export

- **FR-15** — The app exports a PDF that **unambiguously states the selected vehicle/mode** and includes all stops and data for that option. A reader of the PDF alone must never be uncertain which option it describes.

### Additional Features

- **FR-16** — **Adjustable real-world efficiency settings** for both vehicles (EV6 efficiency in mi/kWh, Sportage in MPG or equivalent); recalculation of stops/costs/times follows the adjusted values. Defaults per OQ-6.
- **FR-17** — A **pre-trip checklist and packing list**, with different contents per vehicle (e.g., charging cables/adapters for the EV6).
- **FR-18** — A **toll cost estimator** for the driving routes, included in running costs.

## EV6 Charging Strategy (CHG)

The client's 20–80% charging rule, preserved as stated; the app must both **communicate** this strategy to the user and **follow** it when planning stops:

- **CHG-1** — The trip starts from Jenks at **100% SoC**. The **first leg departs at 100%**.
- **CHG-2** — Drive each leg down to approximately **20% SoC**, then charge from **20% to 80%**.
- **CHG-3** — **Never plan charging above 80%**, because charging speed slows dramatically beyond it.
- **CHG-4** — Prefer not to drop **below 20%**; however, **arriving at a charger with up to ~35% SoC is acceptable** when station spacing requires it.
- **CHG-5** — All legs after the first follow the 20→80% pattern.
- **CHG-6** — The strategy itself (CHG-1..CHG-5) is displayed to the user in the EV6 view in plain language, and each planned stop shows projected arrival SoC and charge-to SoC consistent with the rule.

## Vehicle-Specific Display Rules (DR)

- **DR-1** — **EV6 view:** show **only 200–300 kW charging stations**, prioritizing **Francis Energy** and **Electrify America** networks. No slower chargers appear, even as secondary options.
- **DR-2** — **Sportage Hybrid view:** show **no charging stations and no gas stations**. Instead show only the absolute best coffee shops along the route, rated **4.9 stars and above** (rating source per OQ-8).
- **DR-3** — **Southwest Airlines view:** **no map route.** A clear **timeline-based** presentation only (SW-1..SW-6).

## Southwest Airlines Mode (SW)

- **SW-1** — Fares reflect **last-minute booking** (not two-weeks-in-advance pricing). Fare data method per OQ-7.
- **SW-2** — The timeline includes, in order: **2-hour early arrival at TUL**, security time, flight duration **including connections**, baggage claim, **rental car pickup**, and **drive time from LGA (preferred) or ISP to SQ4D HQ**.
- **SW-3** — Both destination airports are represented: **LGA preferred/default**, ISP as the alternative, with door-to-door totals for each.
- **SW-4** — **Companion Pass economics** are factored in: one of the two tickets is effectively free, and the comparison dashboard's airline cost reflects this.
- **SW-5** — The view **clearly notes the limitation on transporting bulky material samples back home** when flying (a stated reason driving might win).
- **SW-6** — The Southwest option appears in the comparison dashboard/table with door-to-door total time and total cost, computed from SW-1..SW-4 inputs.

## Accuracy & Verification Obligations (ACC)

These are **obligations on the development company**, written to be auditable:

- **ACC-1** — Every physical location shown in the app (charging stations, coffee shops, hotels) is verified from **at least two independent sources** before inclusion.
- **ACC-2** — The sources for each location are **documented** in an artifact that ships with the repository (e.g., `docs/verification.md` or equivalent), listing per location: name, address, the ≥2 sources consulted, and the date checked.
- **ACC-3** — **No fake or placeholder data anywhere** in the shipped app: no lorem ipsum, no invented ratings/reviews/photos, no fictional stops, no made-up prices presented as real.
- **ACC-4** — Charger entries in the EV6 view verifiably meet DR-1 (200–300 kW class, network identity); coffee-shop entries verifiably meet DR-2 (≥4.9★ at time of verification).
- **ACC-5** — Where data is necessarily an estimate (fares, tolls, weather, efficiency), it is **labeled as an estimate with its assumption or source visible** in the UI (directly or one interaction away).

## Technical / Non-Functional Requirements (NFR)

- **NFR-1** — **React 18+** with **TypeScript**.
- **NFR-2** — **Dark night-mode** design with a strong **glassmorphism / frosted-glass** aesthetic throughout (translucent panels, blur, depth). No light theme.
- **NFR-3** — Premium feel: smooth transitions, responsive layout suitable for desktop and tablet; vehicle toggle meets FR-3's instant-switch bar.
- **NFR-4** — Embedded Google Maps per FR-9; API key handling per OQ-3.
- **NFR-5** — Source code in a **GitHub repository**.
- **NFR-6** — **Automatic builds from GitHub deploying to Vercel** (push → deploy with no manual step).

## Acceptance & Verification Notes

- Each `FR/DR/CHG/SW/ACC/NFR` item above is the acceptance checklist; QA verifies item-by-item, pass/fail.
- ACC items are verified by inspecting the shipped verification artifact (ACC-2) and spot-checking locations against the cited sources.
- CHG items are verified by inspecting the EV6 plan: leg-by-leg projected SoC must satisfy CHG-1..CHG-5 (no planned charge >80%, no planned arrival <20% except within the ~35% tolerance rule, first leg from 100%).

## Open Questions (OQ)

Unresolved by the brief; **recommended defaults are recommendations, not decisions**. The dev company should get client sign-off (via the CEO channel) or proceed on the recommendation and flag it in release notes.

- **OQ-1 — Travel dates/season.** Brief gives none; affects weather, fares, daylight. *Recommendation:* make departure date a user input, defaulting to the current date.
- **OQ-2 — Energy price assumptions.** Electricity ($/kWh at DC fast chargers, which varies by network) and gas ($/gal) for running costs. *Recommendation:* editable inputs seeded with documented real prices (charger-network published rates; regional gas averages), sources noted per ACC-5.
- **OQ-3 — API keys & paid-API budget.** Who provisions/pays for Google Maps, weather, and any other paid APIs? *Recommendation:* dev company provisions keys; any nonzero recurring cost is surfaced to the client/CEO for approval before launch.
- **OQ-4 — Overnight hotel stops.** The brief's accuracy rules mention hotels, but no requirement defines hotel stops. The ~1,450-mile each-way drive plausibly implies an overnight. *Recommendation:* include verified hotel stop(s) in both driving modes when the timeline crosses a sensible daily driving limit; treat hotels under ACC-1..ACC-3 like all locations.
- **OQ-5 — Rental car at ISP.** SW-2 names rental pickup in the LGA flow; the brief is silent for ISP. *Recommendation:* include rental car pickup + drive time for both airports.
- **OQ-6 — Baseline efficiency figures.** No baseline mi/kWh / MPG given for FR-16 defaults. *Recommendation:* EPA figures for each exact model/trim, adjusted conservatively for highway speeds, defaults documented and editable.
- **OQ-7 — Fare data method.** Southwest fares are not available via public APIs. *Recommendation:* a documented, timestamped fare snapshot for last-minute booking (SW-1), with a written refresh procedure, labeled per ACC-5.
- **OQ-8 — Coffee-shop rating source.** 4.9★ on which platform? *Recommendation:* Google Maps rating at time of verification, recorded in the ACC-2 artifact.
- **OQ-9 — Return-leg planning.** Are return stops mirrored or independently planned (charging needs differ — return departs Calverton, not Jenks, and CHG-1's 100% start may not hold)? *Recommendation:* plan the return leg independently under the same CHG rules, with the starting SoC at Calverton as an editable assumption.
- **OQ-10 — Sportage refueling in time/cost math.** Gas stations must not be *shown* in the Sportage view (DR-2), but the brief does not say whether refueling time and fuel cost still count toward the Sportage timeline and running costs. *Recommendation:* include realistic refueling time in the Sportage timeline and fuel cost in running costs, without rendering gas stations as stops.

## Handoff Notes for the Build Team

Start with the data layer: the verified-locations dataset and its verification artifact (ACC-1..ACC-4) gate everything user-facing. The EV6 charging plan (CHG) is the heart of the product — get leg/SoC modeling right before polishing visuals. The three display rules (DR-1..DR-3) are hard filters, not rankings: a single 150 kW charger in the EV6 view, a gas station in the Sportage view, or a map in the Southwest view is a failed requirement. Resolve or accept the OQ recommendations before locking cost calculations.