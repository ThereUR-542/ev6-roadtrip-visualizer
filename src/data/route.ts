import type { RouteLeg, TollSegment, PriceSeed, VerifiedSource } from './types';

/**
 * Route basics, tolls (FR-18) and seeded energy prices (OQ-2) for
 * Jenks, OK -> 400 David Ct, Calverton, NY 11933. All distances/times are
 * estimates with their method noted (ACC-5); sources in docs/verification.md.
 */

export interface RouteData {
  summary: string;
  oneWayMiles: number;
  oneWayDriveTimeHours: number;
  /** Estimate method (ACC-5). */
  milesNote: string;
  routing: string[];
  nycCrossing: string;
  legs: RouteLeg[];
  sources: VerifiedSource[];
}

export const route: RouteData = {
  summary:
    'Jenks OK -> US-75 N to I-44 E through Tulsa -> Will Rogers Turnpike (I-44) to the MO line -> I-44 E via Springfield MO to St. Louis -> I-55/I-70 E across IL -> I-70 E via Effingham, Terre Haute, Indianapolis, Dayton, Columbus, Wheeling -> PA Turnpike I-76 E at New Stanton -> exit 226 Carlisle -> I-81 N -> I-78 E via Allentown and New Jersey -> I-95 George Washington Bridge -> Cross Bronx Expwy -> Throgs Neck Bridge -> Clearview Expwy -> I-495 LIE E to exit 71 (NY-24) -> 400 David Ct, Calverton NY 11933',
  oneWayMiles: 1450,
  oneWayDriveTimeHours: 22.5,
  milesNote:
    'Estimate: 1,450 mi one-way per distance-cities.com Jenks->Calverton (fetched 2026-06-13), cross-checked with Travelmath OK->NY 1,445 mi. Drive time estimate: 1,450 mi at a ~65 mph interstate average ≈ 22.3 h; routing engines report 24-27 h nonstop (conservative). 22.5 h used as the central no-stops estimate; FR-7 speed-limit timing is Phase 2 work.',
  routing: [
    'Jenks OK -> US-75 N / I-44 E through Tulsa (free; avoids Creek Turnpike)',
    'I-44 E Will Rogers Turnpike (toll), Tulsa -> Missouri line at Joplin',
    'I-44 E Joplin -> Springfield MO -> St. Louis',
    'I-55/I-70 E across the Mississippi -> I-70 E Effingham IL -> Terre Haute -> Indianapolis',
    'I-70 E Indianapolis -> Dayton -> Columbus -> Wheeling WV -> Washington PA',
    'I-70 E / PA Turnpike I-76 E (toll), New Stanton -> Carlisle',
    'I-81 N Carlisle -> Harrisburg area -> I-78 E',
    'I-78 E Allentown PA -> across New Jersey (free) -> I-95 N',
    'George Washington Bridge (toll eastbound) -> Cross Bronx Expwy -> Throgs Neck Bridge (toll)',
    'Clearview Expwy -> I-495 LIE E (free) -> exit 71 NY-24 -> Calverton (400 David Ct)',
  ],
  nycCrossing:
    'George Washington Bridge -> Cross Bronx Expressway -> Throgs Neck Bridge -> LIE (standard NJ-to-eastern-Long-Island routing). The Verrazzano via the NJ Turnpike/Staten Island is the common alternate but is longer with a higher toll.',
  legs: [
    { from: 'Jenks OK', to: 'Springfield MO', miles: 188, note: 'distance-cities.com, I-44 route' },
    { from: 'Springfield MO', to: 'St. Louis MO', miles: 216, note: 'distance-cities.com, I-44 route' },
    { from: 'St. Louis MO', to: 'Effingham IL', miles: 105, note: 'estimate via I-55/I-70 mileposts' },
    { from: 'Effingham IL', to: 'Terre Haute IN', miles: 76, note: 'estimate via I-70 mileposts' },
    { from: 'Terre Haute IN', to: 'Indianapolis IN', miles: 77, note: 'estimate via I-70 mileposts' },
    { from: 'Indianapolis IN', to: 'Dayton OH', miles: 107, note: 'estimate via I-70 mileposts' },
    { from: 'Dayton OH', to: 'Columbus OH', miles: 71, note: 'estimate via I-70 mileposts' },
    { from: 'Columbus OH', to: 'New Stanton PA', miles: 197, note: 'distance-cities.com, I-70 route' },
    { from: 'New Stanton PA (PA Tpk exit 75)', to: 'Carlisle PA (exit 226)', miles: 151, note: 'estimate via PA Turnpike milepost difference' },
    { from: 'Carlisle PA', to: 'Allentown PA', miles: 100, note: 'distance-cities.com, I-81/I-78 route' },
    { from: 'Allentown PA', to: 'New York NY (GWB)', miles: 93, note: 'distance-cities.com, I-78 route' },
    { from: 'NYC (GWB/Bronx)', to: 'Calverton NY', miles: 70, note: 'estimate; leg sum 1,451 mi matches the 1,450 mi total' },
  ],
  sources: [
    { org: 'Distance-Cities.com', url: 'https://www.distance-cities.com/distance-jenks-ok-to-calverton-ny', confirms: '1,450 mi Jenks->Calverton' },
    { org: 'Travelmath', url: 'https://www.travelmath.com/drive-distance/from/Oklahoma/to/New+York', confirms: 'OK->NY 1,445 mi cross-check' },
    { org: 'Distance-Cities.com', url: 'https://www.distance-cities.com/distance-jenks-ok-to-springfield-mo', confirms: 'Jenks->Springfield 188 mi via I-44' },
    { org: 'Distance-Cities.com', url: 'https://www.distance-cities.com/distance-columbus-oh-to-new-stanton-pa', confirms: 'Columbus->New Stanton 197 mi via I-70' },
    { org: 'Tripadvisor forums', url: 'https://www.tripadvisor.com/ShowTopic-g28953-i4-k635071-Getting_to_Long_Island_by_car-New_York.html', confirms: 'GWB -> Cross Bronx -> Throgs Neck -> LIE standard routing' },
  ],
};

/** Toll segments for a 2-axle passenger car (FR-18). 2026 rates. */
export const tollSegments: TollSegment[] = [
  {
    name: 'Will Rogers Turnpike (I-44, OK)',
    road: 'I-44 Tulsa -> Missouri line, 88.5 mi, all-electronic',
    carTollUsd: 5.4,
    method: 'PikePass $5.40 / PlatePay $10.50 full length',
    note: 'Rates effective 2025-01-01, unchanged through 2026 (OTA 2-year cycle). Charged both directions. Jenks -> I-44 via US-75 through Tulsa is free.',
    sources: [
      { org: 'Wikipedia (Will Rogers Turnpike)', url: 'https://en.wikipedia.org/wiki/Will_Rogers_Turnpike', confirms: 'length, all-electronic, toll' },
      { org: 'TollGuru', url: 'https://tollguru.com/oklahoma-turnpike-toll-roads', confirms: 'OK turnpike rates' },
    ],
  },
  {
    name: 'I-44 (MO) and I-70 (IL/IN/OH/WV)',
    road: 'Free interstates between the MO line and the PA Turnpike',
    carTollUsd: 0,
    method: 'n/a',
    note: 'No tolls on this stretch.',
    sources: [{ org: 'TollGuru', url: 'https://tollguru.com/toll-calculator', confirms: 'no tolls on segment' }],
  },
  {
    name: 'Pennsylvania Turnpike (I-76)',
    road: 'New Stanton (exit 75) -> Carlisle (exit 226), ~151 mi',
    carTollUsd: 12.15,
    method: 'E-ZPass ~$12.15 / Toll By Plate ~$24.30',
    note: 'ESTIMATE from PTC published 2026 formula (effective 2026-01-04): $0.073/mi + $1.13 fee, E-ZPass; plate billing ~2x. Charged both directions.',
    sources: [
      { org: 'PA Turnpike Commission', url: 'https://www.paturnpike.com/news/pa-turnpike-blog/details/blog/2025/07/01/understanding-the-pa-turnpike-s-2026-toll-rates', confirms: '2026 per-mile rate formula' },
      { org: 'PA Turnpike Commission', url: 'https://www.paturnpike.com/news/details/2025/12/30/2026-toll-schedule-takes-effect-this-weekend-on-pennsylvania-turnpike', confirms: '2026 schedule effective date' },
    ],
  },
  {
    name: 'I-78 across New Jersey',
    road: 'I-78 PA line -> I-95',
    carTollUsd: 0,
    method: 'n/a',
    note: 'I-78 is free in NJ (route avoids the NJ Turnpike/GSP).',
    sources: [{ org: 'TollGuru', url: 'https://tollguru.com/toll-calculator', confirms: 'no tolls on I-78 NJ' }],
  },
  {
    name: 'George Washington Bridge (Port Authority)',
    road: 'I-95 NJ -> NY',
    carTollUsd: 14.79,
    method: 'E-ZPass off-peak $14.79 / peak $16.79 / Tolls by Mail $23.30',
    note: '2026 tariff effective 2026-01-04. EASTBOUND ONLY — westbound return is free. Peak: weekdays 6-10 AM & 4-8 PM, weekends 11 AM-9 PM.',
    sources: [
      { org: 'Port Authority NY/NJ', url: 'https://www.panynj.gov/bridges-tunnels/en/tolls.html', confirms: 'GWB toll schedule' },
      { org: 'GeorgeWashingtonBridgeToll.com', url: 'https://georgewashingtonbridgetoll.com/', confirms: '2026 rates' },
    ],
  },
  {
    name: 'Throgs Neck Bridge (MTA)',
    road: 'I-295 Bronx -> Queens',
    carTollUsd: 7.46,
    method: 'NY E-ZPass $7.46 / Tolls by Mail est. ~$12.03',
    note: '2026 MTA rates effective 2026-01-04 (7.5% increase). Mail figure is an ESTIMATE (2025 rate + 7.5%). Charged both directions.',
    sources: [
      { org: 'MTA', url: 'https://www.mta.info/fares-tolls/tolls', confirms: 'MTA bridge tolls' },
      { org: 'NY1 (Spectrum News)', url: 'https://ny1.com/nyc/all-boroughs/news/2026/01/02/mta-fare-and-toll-hikes-to-take-effect-sunday', confirms: '$7.46 E-ZPass 2026' },
    ],
  },
  {
    name: 'Long Island Expressway (I-495)',
    road: 'Queens -> exit 71 Calverton',
    carTollUsd: 0,
    method: 'n/a',
    note: 'The LIE is free.',
    sources: [{ org: 'MTA', url: 'https://www.mta.info/fares-tolls/tolls', confirms: 'LIE is not a tolled facility' }],
  },
];

/**
 * One-way toll totals with transponders (PikePass + E-ZPass, GWB off-peak):
 * eastbound $5.40 + $12.15 + $14.79 + $7.46 = $39.80; westbound $25.01 (GWB
 * free westbound). Without transponders: eastbound ~$70.13, westbound ~$46.83.
 * PA Turnpike and Throgs Neck mail figures are estimates as noted above.
 */
export const tollTotals = {
  eastboundTransponderUsd: 39.8,
  westboundTransponderUsd: 25.01,
  eastboundPlateBillingUsd: 70.13,
  westboundPlateBillingUsd: 46.83,
  isEstimate: true,
} as const;

/** Seeded energy prices for the editable inputs (OQ-2, ACC-5). */
export const energyPrices: {
  electrifyAmericaPerKwhGuest: PriceSeed;
  electrifyAmericaPerKwhPassPlus: PriceSeed;
  francisEnergyPerKwh: PriceSeed;
  gasPerGallonByState: Record<string, number> & { asOf?: never };
  gasPricesAsOf: string;
  gasPricesSources: VerifiedSource[];
  homeElectricityPerKwh: PriceSeed;
} = {
  electrifyAmericaPerKwhGuest: {
    value: 0.56,
    note: 'ESTIMATE — EA prices per station; typical 2026 standard/guest DCFC rates run $0.48-$0.58/kWh (observed range $0.43-$0.69). Check the EA app per station.',
    isEstimate: true,
    sources: [
      { org: 'Electrify America', url: 'https://www.electrifyamerica.com/pricing/', confirms: 'per-station pricing model' },
      { org: 'Recharged (2026 cost guide)', url: 'https://recharged.com/articles/electrify-america-charging-cost-per-kwh/', confirms: 'typical 2026 rate range' },
    ],
  },
  electrifyAmericaPerKwhPassPlus: {
    value: 0.42,
    note: 'ESTIMATE — Pass+ ($7/mo) gives ~25% off the guest rate, typically low-$0.40s/kWh.',
    isEstimate: true,
    sources: [
      { org: 'Electrify America', url: 'https://www.electrifyamerica.com/pricing/', confirms: 'Pass+ discount model' },
      { org: 'InsideEVs', url: 'https://insideevs.com/news/678257/electrify-america-raises-prices/', confirms: 'Pass+ $7/mo, ~25% discount' },
    ],
  },
  francisEnergyPerKwh: {
    value: 0.44,
    note: 'ESTIMATE — Francis bills $0.39/min + $1.00 session at many DCFC sites; observed per-kWh rates $0.42-$0.48 (time-of-day) and $0.44 at newer sites. $0.44 used as central value. Not used in the EV6 plan (no qualifying Francis station on the corridor) but seeded per OQ-2.',
    isEstimate: true,
    sources: [
      { org: 'Francis Energy help center', url: 'https://francisevcharging.zendesk.com/hc/en-us/articles/4434557693467-What-does-it-cost-to-charge', confirms: 'billing model (page fetch blocked; figures via search summary)' },
      { org: 'DCFC Tracker', url: 'https://dcfctracker.com/stations/156540', confirms: 'observed Francis per-kWh rates (OK site)' },
    ],
  },
  gasPerGallonByState: { OK: 3.6, MO: 3.78, IL: 4.42, IN: 3.38, OH: 4.12, PA: 4.25, NJ: 4.15, NY: 4.39 },
  gasPricesAsOf: '2026-06-12',
  gasPricesSources: [
    { org: 'AAA Gas Prices', url: 'https://gasprices.aaa.com/?state=OK', confirms: 'state averages, regular, data as of 2026-06-12 (national avg $4.108)' },
    { org: 'AAA Gas Prices', url: 'https://gasprices.aaa.com/?state=NY', confirms: 'NY state average' },
  ],
  homeElectricityPerKwh: {
    value: 0.12,
    note: 'ESTIMATE — Oklahoma residential average ~12.0-12.9 c/kWh (June 2026), for home charging in Jenks before departure (CHG-1 100% start).',
    isEstimate: true,
    sources: [
      { org: 'Choose Energy', url: 'https://www.chooseenergy.com/electricity-rates-by-state/', confirms: 'state residential rates, June 2026' },
      { org: 'Electric Choice', url: 'https://www.electricchoice.com/electricity-prices-by-state/oklahoma/', confirms: 'Oklahoma residential rate' },
    ],
  },
};
