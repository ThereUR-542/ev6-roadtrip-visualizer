# Location Verification Record (ACC-2)

This is the verification artifact required by **ACC-2**: for every physical location in the
dataset (`src/data/`), it lists the name, address, the **≥2 independent sources** consulted
(with URLs), the date checked, and the attribute that qualifies the location under the
display rules (kW class + network for chargers per DR-1, Google rating for coffee per DR-2/OQ-8).

- **Date checked (all entries): 2026-06-13**
- **Method:** live web research (search + page fetches) on 2026-06-13. No location, rating,
  kW level, address, or price in the dataset comes from model memory. "Independent" means
  the sources belong to different organizations.
- **Exclusion policy (ACC-3):** anything that could not be verified from 2 independent
  sources — or that failed a display-rule threshold — was **excluded**, and is listed in
  §Excluded candidates so QA can audit that nothing was invented to fill gaps.
- **Estimates (ACC-5):** distances along the route, drive times, tolls computed from rate
  formulas, energy prices, hotel rates, and airline fares are estimates; each carries its
  assumption/method in the dataset (`note`/`rateNote`/`milesNote` fields) and below.

## DR-1 interpretation note (kW class)

DR-1 requires "only 200–300 kW charging stations." High-power DC networks deploy hardware
rated 150 kW, 250 kW, or 350 kW — almost nothing is *labeled* exactly "200–300 kW."
Interpretation applied, recorded here for QA and client sign-off:

- A station qualifies only if **at least one dispenser is verifiably rated ≥200 kW**.
- **150 kW-only sites are excluded** (several were rejected on exactly this ground — see
  §Excluded candidates).
- The dataset records the **actual verified hardware rating** (`maxPowerKw`, mostly 350 kW
  cabinets, one site with a 250 kW unit). The 2023 EV6 GT-Line AWD's peak draw is ~235 kW
  (800 V), so the power actually delivered at these stations falls **inside the 200–300 kW
  band**; a 350 kW cabinet never charges this car outside it. PlugShare check-ins at the
  Lebanon, MO site show a Kia drawing exactly 235 kW.
- Network priority honored: **Francis Energy was checked first**; no Francis site with a
  verifiable ≥200 kW dispenser exists on this corridor (its Tulsa-area hub is 150 kW-class,
  and all OK sites sit inside the first-leg window anyway). All included stations are
  **Electrify America**, the second-priority network.

If the Tech Lead/client wants the stricter literal reading (station max rating numerically
≤300 kW), the corridor has essentially **zero** qualifying DC fast stations and the trip is
unplannable — flagged on PLE-38 rather than silently reinterpreted.

## EV6 charging stops (DR-1 / ACC-4)

Qualifying attribute for every entry: **network identity + ≥1 dispenser rated ≥200 kW**
(actual rating shown). All checked 2026-06-13. Route miles from Jenks are estimates.

| # | Station / address | Network, kW, stalls | ~mi from Jenks | Sources (≥2 independent) |
|---|---|---|---|---|
| 1 | EA — Walmart, 500 W Mount Vernon Blvd, Mount Vernon, MO 65712 | EA, 350 kW (5×350+2×150), 7 | 140 | [Rivian Roamer 100174](https://rivianroamer.com/charging/sites/100174) · [PlugShare 158465](https://www.plugshare.com/location/158465) · [ChargeHub](https://chargehub.com/en/stations/mo/mt-vernon/walmart.html) |
| 2 | EA — Casey's, 669 W Elm St, Lebanon, MO 65536 | EA, 350 kW (4×350), 4 | 220 | [Rivian Roamer 100173](https://rivianroamer.com/charging/sites/100173) · [PlugShare 156029](https://www.plugshare.com/location/156029) · [ChargeHub](https://chargehub.com/en/stations/mo/lebanon/caseys-lebanon-mo.html) |
| 3 | EA — Walmart, 350 Park Ridge Rd, Sullivan, MO 63080 | EA, 350 kW (4×350+3×150), 7 | 320 | [Rivian Roamer 100171](https://rivianroamer.com/charging/sites/100171) · [PlugShare 163278](https://www.plugshare.com/location/163278) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/missouri/sullivan/walmart-65-sullivan-mo/electric-car-stations-near-me?locId=72415) |
| 4 | EA — Walmart, 1040 Collinsville Crossing Blvd, Collinsville, IL 62234 | EA, 350 kW, 4 | 395 | [PlugShare 169559](https://www.plugshare.com/location/169559) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/illinois/collinsville/walmart-361-collinsville-il/electric-car-stations-near-me?locId=70636) · [Electrly](https://electrly.com/ev-charging-network/electrify-america/collinsville-il) |
| 5 | EA — Firefly Grill, 1810 Avenue of Mid-America, Effingham, IL 62401 | EA, 350 kW (150/350 mix), 4 | 480 | [EA newsroom](https://media.electrifyamerica.com/releases/66) · [PlugShare 169433](https://www.plugshare.com/location/169433) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/illinois/effingham/firefly-grill-effingham-il/electric-car-stations-near-me?locId=72008) |
| 6 | EA — Walmart, 2399 State Road 46, Terre Haute, IN 47802 | EA, 350 kW (4×350+3×150), 7 | 555 | [Rivian Roamer 100209](https://rivianroamer.com/charging/sites/100209) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/indiana/terre-haute/walmart-4235-terre-haute-in/electric-car-stations-near-me?locId=73987) |
| 7 | EA — Walmart, 4650 S Emerson Ave, Indianapolis, IN 46203 | EA, 350 kW (2×350+13×150), 15 | 630 | [Rivian Roamer 100222](https://rivianroamer.com/charging/sites/100222) · [ChargeHub](https://chargehub.com/en/stations/in/indianapolis/walmart-indianapolis.html) |
| 8 | EA — Walmart, 7680 Brandt Pike, Huber Heights, OH 45424 | EA, 350 kW (6×350), 6 | 745 | [Rivian Roamer 100509](https://rivianroamer.com/charging/sites/100509) · [PlugShare 171776](https://www.plugshare.com/location/171776) |
| 9 | EA — Walmart, 5200 Westpointe Plaza Dr, Columbus, OH 43228 | EA, 350 kW (3-4×350 + 150s), 15 | 800 | [ChargeFinder](https://chargefinder.com/en/charging-station-columbus-walmart-2426-columbus-oh/pgg8nm) · [Rivian Roamer 100239](https://rivianroamer.com/charging/sites/100239) · [PlugShare directory](https://www.plugshare.com/directory/us/ohio/columbus) |
| 10 | EA — Walmart, 61205 Southgate Rd, Cambridge, OH 43725 | EA, 350 kW (2×350+150), 4 | 920 | [EA network API 100250](https://api-prod.electrifyamerica.com/v2/locations/100250) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/ohio/cambridge/walmart-cambridge-oh/electric-car-stations-near-me?locId=72005) |
| 11 | EA — Sheetz, 4692 Route 51 South, Belle Vernon, PA 15012 | EA, 350 kW (3×350+1×250), 4 | 1025 | [EA network API 100267](https://api-prod.electrifyamerica.com/v2/locations/100267) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/pennsylvania/belle-vernon/sheetz-belle-vernon/electric-car-stations-near-me?locId=74694) |
| 12 | EA — Sheetz, 4354 Business 220, Bedford, PA 15522 | EA, 350 kW (6×350), 6 | 1110 | [EA network API 100602](https://api-prod.electrifyamerica.com/v2/locations/100602) · [ChargeHub](https://chargehub.com/en/stations/pa/bedford/sheetz-bedford.html) |
| 13 | EA — Sheetz, 1098 Harrisburg Pike, Carlisle, PA 17013 | EA, 350 kW (4×350), 4 | 1190 | [EA network API 100601](https://api-prod.electrifyamerica.com/v2/locations/100601) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/pennsylvania/carlisle/sheetz-store-carlisle-pa/electric-car-stations-near-me?locId=64164) |
| 14 | EA — Brixmor Village West, 3100 Tilghman St, Allentown, PA 18104 | EA, 350 kW (4×350), 4 | 1275 | [EA network API 110035](https://api-prod.electrifyamerica.com/v2/locations/110035) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/pennsylvania/allentown/brixmor-village-west-allentown-pa/electric-car-stations-near-me?locId=92042) |
| 15 | EA — Brixmor Parkway Plaza, 207-225 Glen Cove Rd, Carle Place, NY 11514 | EA, 350 kW (4×350), 4 | 1392 | [EA network API 210173](https://api-prod.electrifyamerica.com/v2/locations/210173) · [Chargerzilla](https://chargerzilla.com/listing/brixmor-parkway-plaza-carle-place-ny/) · [ChargeHub](https://chargehub.com/en/ev-charging-stations/united-states/new-york/carle-place/parkway-plaza-carle-place-mall/electric-car-stations-near-me?locId=110549) |
| 16 | EA — Manorville Square, 287 Wading River Rd, Manorville, NY 11949 | EA, 350 kW (4×350), 4 | 1431 | [EA network API 110107](https://api-prod.electrifyamerica.com/v2/locations/110107) (re-fetched directly 2026-06-13: 4 EVSEs, 1000V/350A, 350 kW each) · [Chargerzilla](https://chargerzilla.com/listing/royal-development-manorville-square-manorville-ny/) · [Electrly](https://electrly.com/ev-charging-network/electrify-america/manorville-ny) |

**Spacing sanity (CHG-2/CHG-4, final math in Phase 2):** first gap Jenks→#1 ≈ 140 mi
(departs at 100% per CHG-1, window ~150–170 mi at 2.6–3.0 mi/kWh). Largest interior gaps:
#9→#10 ≈ 120 mi and #14→#15 ≈ 117 mi — inside the 20→80% usable window (~121–139 mi on a
77.4 kWh pack at 2.6–3.0 mi/kWh), with CHG-4's ≤35% arrival tolerance as margin. Spacing
works in both directions; #16 (≈4–6 mi from 400 David Ct) anchors the return departure (OQ-9).

**Conflicting-source notes:** Carle Place and Manorville carry a stale "150 kW" label on
one aggregator (Rivian Roamer); EA's own network API — fetched directly — shows 4×350 kW at
both, and the API is treated as authoritative for EA hardware. Columbus Westpointe sources
disagree 3 vs 4 on the count of 350 kW stalls (both confirm ≥200 kW).

## Coffee shops — Sportage view (DR-2 / OQ-8 / ACC-4)

Qualifying attribute: **Google Maps rating ≥4.9 observed 2026-06-13** (rating source per
OQ-8 = Google at verification time). Ratings drift; re-verify before each release.

| # | Shop / address | Google rating (reviews) | Sources (≥2 independent) |
|---|---|---|---|
| 1 | Black Wall Street Liquid Lounge, 10 N Greenwood Ave Ste 101, Tulsa, OK 74120 | 4.9 (164) | [Wanderlog (Google data)](https://wanderlog.com/list/geoCategory/17964/best-coffee-shops-and-best-cafes-in-tulsa) · [Yelp](https://www.yelp.com/biz/black-wall-street-liquid-lounge-tulsa-2) · [Visit Tulsa](https://www.visittulsa.com/listing/black-wall-street-liquid-lounge/1637/) |
| 2 | El Cafecito - The Little Coffee Shop, 2462 S Campbell Ave, Springfield, MO 65807 | 4.9 (684) — re-confirmed by direct fetch 2026-06-13 | [Wanderlog (Google data)](https://wanderlog.com/place/details/9416689/el-cafecito-the-little-coffee-shop) · [Yelp](https://www.yelp.com/biz/el-cafecito-springfield) · [official site](https://elcafecito417.com/) |
| 3 | E61 Cafe, 307 Belt Ave, St. Louis, MO 63112 | 4.9 (124) | [Wanderlog (Google data)](https://wanderlog.com/place/details/14308350/e61-cafe) · [Yelp](https://www.yelp.com/biz/e61-cafe-saint-louis) · [official site](https://e61cafe.com/) |
| 4 | Loose Goose Coffee Company, 3020 S 7th St, Terre Haute, IN 47802 | 4.9 (302) | [Restaurant Guru](https://restaurantguru.com/Loose-Goose-Coffee-Company-Terre-Haute) · [Yelp](https://www.yelp.com/biz/loose-goose-coffee-company-terre-haute) · [terrehaute.com](https://www.terrehaute.com/listing/loose-goose-coffee-company/114/) |
| 5 | Claypot Coffee House, 1551 E Stop 12 Rd, Indianapolis, IN 46227 | 4.9 (323) | [Matcha Spot (Google-sourced)](https://www.matcha-spot.com/cities/indianapolis/) · [Yelp](https://www.yelp.com/biz/claypot-coffee-house-indianapolis) · [Indianapolis Monthly](https://www.indianapolismonthly.com/food-and-drinks/drinks/cheers-claypot-coffee-house/) |
| 6 | The Tiger Eye Coffee Shop, 3418 Derry St, Harrisburg, PA 17111 | 4.9 (283) | [Restaurant Guru](https://restaurantguru.com/The-Tiger-Eye-Coffee-Shop-Harrisburg) · [Yelp](https://www.yelp.com/biz/the-tiger-eye-harrisburg) · [localcoffeeshops.org](https://www.localcoffeeshops.org/shop/pennsylvania/harrisburg/the-tiger-eye-coffee-shop) |
| 7 | Nowhere Coffee Co. - The Roastery, 17 S 9th St, Allentown, PA 18102 | 4.9 (64) — roastery location only; the West End location rates lower and is excluded | [joe.coffee (Google Places data)](https://joe.coffee/locations/pa/allentown/nowhere-coffee-co-the-roastery-allentown/) · [LehighValleyNews.com](https://www.lehighvalleynews.com/allentown/cool-beans-nowhere-coffee-co-brings-fresh-roasts-to-allentown) · [official site](https://www.nowherecoffeeco.com/) |

**Honest coverage gap (ACC-3):** no shop on the Columbus OH, Pittsburgh, NJ, or Long Island
stretches could be verified at ≥4.9 — best found were 4.7–4.8 and were excluded (see
§Excluded candidates). The Sportage view will have no qualifying coffee stop east of
Allentown, PA. This is a consequence of DR-2's hard 4.9 threshold, not missing research.

## Hotels (OQ-4 / ACC-1..3)

Qualifying attribute: position at the ~10–11 h/day driving boundary (overnights) or
proximity to 400 David Ct (destination), verified existence + address. Rates are estimates
observed on the cited sites on 2026-06-13 (ACC-5).

| # | Hotel / address | Role | Sources (≥2 independent) |
|---|---|---|---|
| 1 | Hampton Inn Dayton/Huber Heights, 5588 Merily Way, Huber Heights, OH 45424 | Outbound overnight (I-70 exit 36, ~720-745 mi from Jenks); EA DCFC ~2 mi | [HotelGuides](https://hotelguides.com/hotels/ohio/huber-heights/123429.html) · [Reservations.com](https://www.reservations.com/hotel/hampton-inn-dayton-huber-heights) · [Hilton](https://www.hilton.com/en/hotels/dayhhhx-hampton-dayton-huber-heights/) |
| 2 | Holiday Inn Express & Suites Dayton-Huber Heights, 5610 Merily Way, Huber Heights, OH 45424 | Return overnight (same exit; ~705-720 mi remaining) | [Trip.com](https://us.trip.com/hotels/huber-heights-hotel-detail-2118100/holiday-inn-express-suites-dayton-huber-heights/) · [HotelGuides](https://hotelguides.com/interstate-hotels/i-70-exit-38-oh-hotels.html) · [IHG](https://www.ihg.com/holidayinnexpress/hotels/us/en/huber-heights/huboh/hoteldetail) |
| 3 | Hyatt Place Long Island/East End, 451 East Main St, Riverhead, NY 11901 | Destination (~5 mi to SQ4D HQ); **on-site L2 EV charging verified** (supports OQ-9 100%-return-start default, editable) | [Kayak](https://www.kayak.com/Riverhead-Hotels-Hyatt-Place-Long-Island-East-End.406470.ksp) · [Trip.com](https://us.trip.com/hotels/riverhead-hotel-detail-2882513/hyatt-place-long-island-east-end/) · [Hyatt policies](https://www.hyatt.com/hyatt-place/en-US/ispzr-hyatt-place-long-island-east-end/policies) · [ChargeHub](https://chargehub.com/en/stations/ny/riverhead-/hyatt-place-tesla.html) |
| 4 | Residence Inn Long Island East End, 2012 Old Country Rd, Riverhead, NY 11901 | Destination alternative (~4 mi to SQ4D HQ) | [I LOVE NY](https://www.iloveny.com/listing/residence-inn-long-island-east-end/131559/) · [Yelp](https://www.yelp.com/biz/residence-inn-by-marriott-long-island-east-end-riverhead) · [TripAdvisor](https://www.tripadvisor.com/Hotel_Review-g48502-d12451376-Reviews-Residence_Inn_by_Marriott_Long_Island_East_End-Riverhead_Long_Island_New_York.html) |

Note: sources show 5610 vs 5612 Merily Way for hotel #2 (same property); Hilton/IHG brand
pages blocked direct fetching (403) — brand listings were confirmed via search results, with
two other organizations independently confirming each property.

## Airports, rental cars, drive times (SW-2/SW-3/OQ-5)

- **TUL — Tulsa International.** Southwest nonstops 2026: AUS, MDW, DAL, DEN, HOU, LAS, BNA,
  MCO, PHX. Source: [Fly Tulsa](https://flytulsa.com/travel/flights/nonstop-destinations/).
- **LGA — LaGuardia (preferred).** Southwest operates ~228 weekly departures, 9 nonstop
  cities. No WN nonstop TUL–LGA; typical 1-stop via MDW/DEN/HOU/BNA, ~6 h est.
  Sources: [FlightsFrom](https://www.flightsfrom.com/LGA/WN) · [Kayak route page](https://www.kayak.com/flight-routes/Tulsa-TUL/New-York-LaGuardia-LGA).
- **ISP — Long Island MacArthur (alternative).** Southwest serves BWI, FLL, BNA, MCO, TPA,
  PBI nonstop. TUL–ISP needs 1–2 stops (via BNA/MCO), ~7.5 h est.
  Sources: [flymacarthur.com](https://www.flymacarthur.com/) · [Southwest ISP page](https://www.southwest.com/en/flights/flights-to-long-island-islip-macarthur) · [Kayak route page](https://www.kayak.com/flight-routes/Tulsa-TUL/Islip-Long-Island-ISP).
- **Rental cars at LGA:** off-airport lots (East Elmhurst/Ditmars Blvd) via shuttle from
  Terminals A/B/C ground transportation; Avis, Budget, Hertz, Enterprise, National, Alamo,
  Sixt, Drivo. Sources: [Enterprise LGA](https://www.enterprise.com/en/car-rental-locations/us/ny/new-york-laguardia-airport-24jr.html) · [Sixt LGA](https://www.sixt.com/car-rental/usa/new-york-city/la-guardia-airport/) · [shuttle guide](https://holacarrentals.com/blogs/car-rental-united-states/laguardia-airport-lga-car-rental-shuttles-routes-tolls).
- **Rental cars at ISP (OQ-5):** on-airport counters at baggage claim; Avis, Budget,
  Enterprise, Hertz, National. Sources: [Avis ISP](https://www.avis.com/en/locations/nam/us/ny/ronkonkoma/isp) · [National ISP](https://www.nationalcar.com/en/car-rental-locations/us/ny/long-island-islip-macarthur-airport-24jd.html) · [Enterprise ISP](https://www.enterprise.com/en/car-rental-locations/us/ny/long-island-islip-macarthur-airport-24jc.html).
- **Drive to SQ4D HQ (estimates):** LGA→400 David Ct ≈ 66 mi / ~1.5 h ([distance-cities](https://www.distance-cities.com/distance-east-elmhurst-ny-to-calverton-ny));
  ISP→400 David Ct ≈ 22 mi / ~0.5 h ([distance-cities](https://www.distance-cities.com/distance-ronkonkoma-ny-to-calverton-ny)).

## Southwest fare snapshot (SW-1 / OQ-7) — ESTIMATE

- **Snapshot (2026-06-13):** last-minute (booked within a few days of departure) Southwest
  one-way TUL→LGA/ISP ≈ **$230–$450** ($460–$820 round trip), TUL–ISP at the top of the range.
- **Derivation:** Southwest fares have no public API; figures triangulated from
  [Kayak TUL-LGA](https://www.kayak.com/flight-routes/Tulsa-TUL/New-York-LaGuardia-LGA)
  ("last-minute round trips from $479"; WN advance one-ways from $128),
  [Cheapflights](https://www.cheapflights.com/flights-to-la-guardia/tulsa/) (cheapest WN $230),
  and [Kayak TUL-ISP](https://www.kayak.com/flight-routes/Tulsa-TUL/Islip-Long-Island-ISP)
  ($432 one-way departing in 5 days; cheapest WN round trip $818 within 2 weeks).
- **Refresh procedure (required by OQ-7 resolution):**
  1. On southwest.com, price TUL→LGA and TUL→ISP one-way for a departure 1–3 days out
     (lowest "Wanna Get Away" or current equivalent); record both directions.
  2. Cross-check the two Kayak route pages above for the same dates.
  3. Update `lastMinuteFareSnapshot` in `src/data/southwest.ts` (values, `asOf`, `method`)
     and this section. Keep the `isEstimate: true` label (ACC-5).
  4. Refresh before any release and whenever the snapshot is >14 days old.

## Route, tolls, energy prices (FR-18 / OQ-2) — sources

- **Route & mileage:** 1,450 mi one-way, ~22.5 h at interstate speeds (estimates).
  [distance-cities Jenks→Calverton](https://www.distance-cities.com/distance-jenks-ok-to-calverton-ny) ·
  [Travelmath OK→NY cross-check](https://www.travelmath.com/drive-distance/from/Oklahoma/to/New+York) ·
  leg sources in `src/data/route.ts`. NYC crossing: GWB → Cross Bronx → Throgs Neck → LIE.
- **Tolls (2-axle car, 2026 rates):** Will Rogers Tpk $5.40 PikePass/$10.50 PlatePay
  ([Wikipedia](https://en.wikipedia.org/wiki/Will_Rogers_Turnpike) · [TollGuru](https://tollguru.com/oklahoma-turnpike-toll-roads));
  PA Turnpike New Stanton→Carlisle ≈ $12.15 E-ZPass (estimate from
  [PTC 2026 rate formula](https://www.paturnpike.com/news/pa-turnpike-blog/details/blog/2025/07/01/understanding-the-pa-turnpike-s-2026-toll-rates) ·
  [2026 schedule](https://www.paturnpike.com/news/details/2025/12/30/2026-toll-schedule-takes-effect-this-weekend-on-pennsylvania-turnpike));
  GWB $14.79 E-ZPass off-peak, eastbound only
  ([Port Authority](https://www.panynj.gov/bridges-tunnels/en/tolls.html) · [gwb toll site](https://georgewashingtonbridgetoll.com/));
  Throgs Neck $7.46 NY E-ZPass ([MTA](https://www.mta.info/fares-tolls/tolls) · [NY1](https://ny1.com/nyc/all-boroughs/news/2026/01/02/mta-fare-and-toll-hikes-to-take-effect-sunday)).
  Totals: ≈ $39.80 eastbound / $25.01 westbound with transponders (estimates).
- **Energy price seeds (editable inputs):** EA ≈ $0.56/kWh guest, ≈ $0.42/kWh Pass+
  ([EA pricing](https://www.electrifyamerica.com/pricing/) · [Recharged guide](https://recharged.com/articles/electrify-america-charging-cost-per-kwh/) · [InsideEVs](https://insideevs.com/news/678257/electrify-america-raises-prices/));
  Francis Energy ≈ $0.44/kWh ([help center](https://francisevcharging.zendesk.com/hc/en-us/articles/4434557693467-What-does-it-cost-to-charge) · [DCFC Tracker](https://dcfctracker.com/stations/156540));
  AAA state gas averages as of 2026-06-12 (OK $3.60 … NY $4.39; [AAA](https://gasprices.aaa.com/?state=OK));
  home electricity (Jenks) ≈ $0.12/kWh ([Choose Energy](https://www.chooseenergy.com/electricity-rates-by-state/) · [Electric Choice](https://www.electricchoice.com/electricity-prices-by-state/oklahoma/)).
  All labeled estimates (ACC-5).

## Excluded candidates (ACC-3 audit trail)

Chargers — failed the ≥200 kW filter or 2-source verification:

- **Francis Energy, all OK I-44 sites** — Tulsa hub verified at 150 kW max (8×150 kW per
  Rivian Roamer); no Francis ≥200 kW site found on the corridor; all OK sites sit inside the
  first-leg 100% window anyway.
- **Joplin, MO options (Pilot, Liberty Utilities/ChargePoint)** — no EA site in Joplin;
  ≥200 kW unverifiable from 2 sources.
- **EA St. Charles MO (Walmart)** — exists, but off this route's alignment.
- **EA Meijer, 8375 E 96th St, Indianapolis** — ~15 mi off-route; kW not 2-source verified.
- **EA Bridgewater Promenade, NJ** — verified 150 kW max: fails DR-1.
- **EVolve NY Riverhead (209 East Ave)** — verified 150 kW max: fails DR-1.
- **EA UBP Riverhead Plaza (1820 Old Country Rd)** — exists; ≥200 kW unverifiable (data
  indicates 150 kW units).
- **EVgo The Shops at Riverhead/Costco** — exists; kW rating unverifiable (evgo.com rate-limited,
  no rating on ChargeHub).
- **EA Sam's Club Medford NY** — conflicting 150 vs 350 kW data, unresolved; not needed for spacing.
- **EVolve NY Commack** — 150 kW class: fails DR-1.
- **EA "The Highlands" Triadelphia WV** — could not verify it exists at all.
- **Tanger Outlets Riverhead** — Level 2 only on site; the "Tanger hosts DCFC" assumption did
  not check out.

Coffee — failed the ≥4.9 Google threshold or rating unverifiable (selection): The Coffee
Grinder, Jenks (4.8); Drip City / SONA, Tulsa (4.7); CTX, Sapulpa (4.7); 7 Brew Bartlesville
(4.9 but ~45 min off-route); Fox Holler, Effingham (4.7); Parlor Public House, Indianapolis
(4.5); Niyyah, Indianapolis (conflicting 4.5–4.9); Koffee Paradise (4.8) and Royal Flamingo
(4.8), Columbus; The Silver Slipper, Dayton (4.8, wine bar); Kerry's Café, Springfield OH
(4.8); Afters Cafe (4.8) and Espresso A Mano (unverifiable), Pittsburgh; Hidden Grounds, NJ
(4.7); Cafe Victoria (4.8), Mugs on Main (~4.5), Bean & Bagel Calverton (~4.4), Riverhead;
Nice Place, Speonk (unverifiable); Tend, Shirley (4.7); Brekky, Wading River (4.7); Nettie's,
Center Moriches (4.8); Coffee Booths, Selden / Georgio's, Farmingdale (4.8 — Long Island's
highest found).

Hotels — **Courtyard Columbus West/Hilliard** (conflicting branding — apparently deflagged to
"The Columbus Hilliard Hotel"; failed consistent 2-source verification); **Hilton Garden Inn
Riverhead / Hotel Indigo East End** (brand pages blocked; 2-source verification incomplete);
no verified hotel adjacent to the Columbus Westpointe charger — Dayton-area stop selected
instead.
