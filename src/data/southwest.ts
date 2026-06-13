import type {
  AirportInfo,
  RentalCarInfo,
  AirportDriveToHq,
  SouthwestItinerary,
  FareSnapshot,
} from './types';

/**
 * Southwest Airlines mode data (SW-1..SW-6, OQ-5, OQ-7). Fares and travel
 * times are estimates labeled with their derivation (ACC-5); the fare snapshot
 * refresh procedure lives in docs/verification.md §Southwest fare snapshot.
 */

export const airports: AirportInfo[] = [
  {
    code: 'TUL',
    name: 'Tulsa International Airport',
    servedBySouthwest: true,
    note: 'Southwest nonstops from TUL (2026): AUS, MDW, DAL, DEN, HOU, LAS, BNA, MCO, PHX.',
    sources: [
      { org: 'Fly Tulsa', url: 'https://flytulsa.com/travel/flights/nonstop-destinations/', confirms: 'WN nonstop destinations from TUL' },
    ],
  },
  {
    code: 'LGA',
    name: 'LaGuardia Airport (preferred destination)',
    servedBySouthwest: true,
    note: 'Southwest operates ~228 weekly departures from LGA to 9 nonstop cities incl. MDW, STL, DEN, BNA, HOU, ATL, MKE (2026). No WN nonstop TUL-LGA.',
    sources: [
      { org: 'FlightsFrom.com', url: 'https://www.flightsfrom.com/LGA/WN', confirms: 'WN LGA operation and destinations' },
    ],
  },
  {
    code: 'ISP',
    name: 'Long Island MacArthur Airport (alternative)',
    servedBySouthwest: true,
    note: 'Southwest serves ISP nonstop to BWI, FLL, BNA, MCO, TPA, PBI with connections beyond (2026). No WN nonstop TUL-ISP.',
    sources: [
      { org: 'Long Island MacArthur Airport', url: 'https://www.flymacarthur.com/', confirms: 'WN service at ISP' },
      { org: 'Southwest', url: 'https://www.southwest.com/en/flights/flights-to-long-island-islip-macarthur', confirms: 'WN flies to ISP' },
    ],
  },
];

export const typicalItineraries: SouthwestItinerary[] = [
  {
    routePair: 'TUL-LGA',
    stops: '1 stop (via MDW most common; also DEN, HOU or BNA)',
    totalTravelTimeHours: 6.0,
    note: 'ESTIMATE — no WN nonstop; connection cities are the overlap of WN TUL and LGA nonstop lists. WN 1-stop itineraries typically run ~5-7 h air+connection (AA/DL nonstops average 3h13m for comparison).',
    sources: [
      { org: 'Kayak', url: 'https://www.kayak.com/flight-routes/Tulsa-TUL/New-York-LaGuardia-LGA', confirms: 'route stats, nonstop average, carriers' },
      { org: 'Fly Tulsa / FlightsFrom', url: 'https://flytulsa.com/travel/flights/nonstop-destinations/', confirms: 'connection-city overlap method' },
    ],
  },
  {
    routePair: 'TUL-ISP',
    stops: '1-2 stops (via BNA or MCO; many displayed itineraries need 2+)',
    totalTravelTimeHours: 7.5,
    note: 'ESTIMATE — WN overlap cities are only BNA and MCO; Kayak (2026-06-13) shows no direct flights and frequent 2-connection itineraries at 7-8+ h. 7.5 h is a mid estimate for a workable 1-stop via BNA.',
    sources: [
      { org: 'Kayak', url: 'https://www.kayak.com/flight-routes/Tulsa-TUL/Islip-Long-Island-ISP', confirms: 'no direct flights; connection patterns' },
      { org: 'Long Island MacArthur Airport', url: 'https://www.flymacarthur.com/', confirms: 'WN ISP destinations' },
    ],
  },
];

/**
 * Last-minute fare snapshot (SW-1 / OQ-7). ESTIMATE — Southwest fares are not
 * exposed via public APIs; refresh procedure documented in
 * docs/verification.md. Companion Pass economics (SW-4: second ticket
 * effectively free) are applied in Phase 2 math, not here.
 */
export const lastMinuteFareSnapshot: FareSnapshot = {
  asOf: '2026-06-13',
  oneWayUsdLow: 230,
  oneWayUsdHigh: 450,
  method:
    'Derived 2026-06-13 from fare-aggregator route pages (no live Southwest.com query possible): Kayak TUL-LGA "last-minute round trips from $479" and WN advance one-ways from $128; Cheapflights cheapest WN TUL-LGA $230; Kayak TUL-ISP near-term snapshot $432 one-way (June 18 departure), cheapest WN round trip $818 (June 23-27). Conclusion: a WN ticket bought within a few days of departure realistically runs ~$230-$450 one-way, TUL-ISP at the top of the range.',
  isEstimate: true,
  sources: [
    { org: 'Kayak', url: 'https://www.kayak.com/flight-routes/Tulsa-TUL/New-York-LaGuardia-LGA', confirms: 'TUL-LGA fare levels' },
    { org: 'Kayak', url: 'https://www.kayak.com/flight-routes/Tulsa-TUL/Islip-Long-Island-ISP', confirms: 'TUL-ISP near-term fares' },
    { org: 'Cheapflights', url: 'https://www.cheapflights.com/flights-to-la-guardia/tulsa/', confirms: 'cheapest WN TUL-LGA observed' },
  ],
};

export const rentalCars: RentalCarInfo[] = [
  {
    airport: 'LGA',
    situation:
      'No consolidated on-airport rental facility: all major brands operate off-airport lots in East Elmhurst (Ditmars Blvd area), reached by rental-car shuttles from the Ground Transportation level of Terminals A/B/C. Add ~10-20 min shuttle each way (feeds the SW-2 timeline).',
    companies: 'Avis, Budget, Hertz, Enterprise (9501 Ditmars Blvd), National, Alamo, Sixt, Drivo',
    sources: [
      { org: 'Enterprise', url: 'https://www.enterprise.com/en/car-rental-locations/us/ny/new-york-laguardia-airport-24jr.html', confirms: 'LGA off-airport location + shuttle' },
      { org: 'Sixt', url: 'https://www.sixt.com/car-rental/usa/new-york-city/la-guardia-airport/', confirms: 'shuttle hours' },
      { org: 'Hola Car Rentals (LGA shuttle guide)', url: 'https://holacarrentals.com/blogs/car-rental-united-states/laguardia-airport-lga-car-rental-shuttles-routes-tolls', confirms: 'shuttle routes overview' },
    ],
  },
  {
    airport: 'ISP',
    situation:
      'On-airport rental car center: counters in/across from baggage claim with cars within walking distance — materially faster pickup than LGA.',
    companies: 'Avis, Budget, Enterprise, Hertz, National',
    sources: [
      { org: 'Avis', url: 'https://www.avis.com/en/locations/nam/us/ny/ronkonkoma/isp', confirms: 'on-airport ISP location' },
      { org: 'National', url: 'https://www.nationalcar.com/en/car-rental-locations/us/ny/long-island-islip-macarthur-airport-24jd.html', confirms: 'on-airport ISP location' },
      { org: 'Enterprise', url: 'https://www.enterprise.com/en/car-rental-locations/us/ny/long-island-islip-macarthur-airport-24jc.html', confirms: 'on-airport ISP location' },
    ],
  },
];

export const airportDrivesToSq4d: AirportDriveToHq[] = [
  {
    airport: 'LGA',
    miles: 66,
    driveTimeHours: 1.5,
    note: 'Estimate via distance-cities.com East Elmhurst NY (LGA) -> Calverton NY: 66 mi, 1h32m via I-495; heavy LIE traffic can push past 2 h.',
    sources: [
      { org: 'Distance-Cities.com', url: 'https://www.distance-cities.com/distance-east-elmhurst-ny-to-calverton-ny', confirms: '66 mi / ~1.5 h' },
    ],
  },
  {
    airport: 'ISP',
    miles: 22,
    driveTimeHours: 0.5,
    note: 'Estimate via distance-cities.com Ronkonkoma NY (ISP) -> Calverton NY: 22 mi, ~31 min via I-495.',
    sources: [
      { org: 'Distance-Cities.com', url: 'https://www.distance-cities.com/distance-ronkonkoma-ny-to-calverton-ny', confirms: '22 mi / ~0.5 h' },
    ],
  },
];
