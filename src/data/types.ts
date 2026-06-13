/**
 * Phase 1 verified dataset types — Pearl White EV6 Road Trip Visualizer.
 *
 * Every physical location in this dataset is verified from >=2 independent
 * sources (ACC-1); the sources are documented in docs/verification.md (ACC-2).
 * Fields marked "estimate" carry their assumption/source so the UI can label
 * them per ACC-5.
 */

/** A source consulted during verification (ACC-1/ACC-2). */
export interface VerifiedSource {
  /** Organization behind the source (e.g. "Electrify America", "AFDC", "Yelp"). */
  org: string;
  url: string;
  /** What this source confirms (existence, address, kW, rating, ...). */
  confirms: string;
}

export interface VerifiedLocationBase {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  /** ISO date the location was verified (ACC-2). */
  dateVerified: string;
  /** >=2 independent sources (ACC-1). */
  sources: VerifiedSource[];
  notes?: string;
}

/**
 * DC fast charging stop for the EV6 view (DR-1).
 *
 * DR-1 interpretation (documented in docs/verification.md §DR-1): stations are
 * included only when at least one dispenser is verifiably rated >=200 kW.
 * `maxPowerKw` records the actual hardware rating (commonly 350 kW cabinets);
 * the 2023 EV6 GT-Line AWD's peak draw is ~235 kW, so delivered power at these
 * stations falls in the 200-300 kW band. No 150 kW-only site is included.
 */
export interface ChargingStation extends VerifiedLocationBase {
  network: 'Electrify America' | 'Francis Energy' | string;
  /** Verified max rated output of the most powerful dispenser on site, kW. */
  maxPowerKw: number;
  /** Number of DC fast dispensers on site (per the cited sources). */
  dcFastChargerCount: number;
  /** Nearest highway exit / position. */
  nearHighway: string;
  /** Estimated route miles from Jenks, OK along the documented routing (estimate). */
  approxRouteMilesFromJenks: number;
  /** Which trip directions the stop serves. */
  directions: 'outbound' | 'return' | 'both';
}

/** Coffee stop for the Sportage Hybrid view (DR-2: Google rating >=4.9). */
export interface CoffeeShop extends VerifiedLocationBase {
  /** Google Maps rating observed at verification time (OQ-8 / ACC-4). */
  googleRating: number;
  /** Google review count observed at verification time. */
  reviewCount: number;
  /** How/where the rating was observed (evidence trail, ACC-2). */
  ratingEvidence: string;
  /** Where along the route the shop sits. */
  approxRouteArea: string;
  /** Opening hours if verified, else null. */
  hours: string | null;
}

/** Overnight / destination hotel (OQ-4). */
export interface Hotel extends VerifiedLocationBase {
  brand: string;
  role: 'outbound-overnight' | 'return-overnight' | 'destination';
  nearHighway: string;
  /** On-site EV charging, only as verified ("none verified" / "unknown" allowed). */
  evCharging: string;
  /** Nearest verified DC fast charger, if any. */
  nearbyDcFastCharger: string | null;
  /** Nightly rate actually observed on a booking site (estimate, ACC-5). */
  approxNightlyRateUsd?: number;
  /** Where/when the rate estimate was seen. */
  rateNote?: string;
}

export interface RouteLeg {
  from: string;
  to: string;
  miles: number;
  /** Method/source; all leg distances are estimates (ACC-5). */
  note: string;
}

export interface TollSegment {
  name: string;
  road: string;
  /** Toll for a 2-axle passenger car with transponder, USD. */
  carTollUsd: number;
  /** Payment method the rate applies to (PikePass / E-ZPass / plate billing...). */
  method: string;
  note: string;
  sources: VerifiedSource[];
}

export interface PriceSeed {
  /** USD value (per kWh or per gallon depending on context). */
  value: number;
  /** Assumption/method — these are seeds for editable inputs (OQ-2, ACC-5). */
  note: string;
  isEstimate: boolean;
  sources: VerifiedSource[];
}

export interface AirportInfo {
  code: 'TUL' | 'LGA' | 'ISP';
  name: string;
  servedBySouthwest: boolean;
  note: string;
  sources: VerifiedSource[];
}

export interface RentalCarInfo {
  airport: 'LGA' | 'ISP';
  situation: string;
  companies: string;
  sources: VerifiedSource[];
}

export interface AirportDriveToHq {
  airport: 'LGA' | 'ISP';
  miles: number;
  driveTimeHours: number;
  /** Estimate method (ACC-5). */
  note: string;
  sources: VerifiedSource[];
}

export interface SouthwestItinerary {
  routePair: string;
  stops: string;
  totalTravelTimeHours: number;
  /** Estimate method (ACC-5). */
  note: string;
  sources: VerifiedSource[];
}

/** Timestamped last-minute fare snapshot (SW-1 / OQ-7) — always an estimate. */
export interface FareSnapshot {
  asOf: string;
  oneWayUsdLow: number;
  oneWayUsdHigh: number;
  /** Exactly how the estimate was derived (ACC-5). */
  method: string;
  isEstimate: true;
  sources: VerifiedSource[];
}
