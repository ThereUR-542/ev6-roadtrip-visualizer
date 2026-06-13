/**
 * Cost & time engine for the driving options (FR-7, FR-16, FR-18, OQ-2,
 * OQ-10). Pure TypeScript over the Phase 1 verified dataset; every output
 * line carries a note + isEstimate so the UI can label assumptions (ACC-5).
 */

import { route, tollSegments, tollTotals, energyPrices } from '../data/route';
import { coffeeShops } from '../data/coffeeShops';
import type { CoffeeShop } from '../data/types';
import type { RoundTripPlan } from './chargingPlan';
import { SPORTAGE } from './efficiency';

/** A labeled cost/time line item (ACC-5: assumption visible). */
export interface LineItem {
  label: string;
  amountUsd: number;
  note: string;
  isEstimate: boolean;
}

// ---------------------------------------------------------------------------
// Tolls (FR-18)
// ---------------------------------------------------------------------------

export interface TollCosts {
  oneWayEastboundUsd: number;
  oneWayWestboundUsd: number;
  roundTripUsd: number;
  paymentMethod: 'transponder' | 'plate';
  note: string;
  isEstimate: true;
}

const GWB_NAME = 'George Washington Bridge';

/**
 * Round-trip toll cost for a 2-axle car on the documented route. Transponder
 * rates are computed from the per-segment dataset (the GWB is charged
 * eastbound only); plate-billing totals come from the dataset's published
 * aggregate (its per-segment plate figures are partly estimates).
 */
export function computeTollCosts(paymentMethod: 'transponder' | 'plate' = 'transponder'): TollCosts {
  if (paymentMethod === 'plate') {
    return {
      oneWayEastboundUsd: tollTotals.eastboundPlateBillingUsd,
      oneWayWestboundUsd: tollTotals.westboundPlateBillingUsd,
      roundTripUsd: tollTotals.eastboundPlateBillingUsd + tollTotals.westboundPlateBillingUsd,
      paymentMethod,
      note: 'Plate/mail billing, 2026 rates; PA Turnpike and Throgs Neck mail figures are estimates (see route data).',
      isEstimate: true,
    };
  }
  const east = tollSegments.reduce((sum, s) => sum + s.carTollUsd, 0);
  const west = tollSegments.reduce(
    (sum, s) => sum + (s.name.includes(GWB_NAME) ? 0 : s.carTollUsd),
    0,
  );
  return {
    oneWayEastboundUsd: round2(east),
    oneWayWestboundUsd: round2(west),
    roundTripUsd: round2(east + west),
    paymentMethod,
    note: 'PikePass + E-ZPass 2026 rates, GWB off-peak; the GWB is tolled eastbound only.',
    isEstimate: true,
  };
}

// ---------------------------------------------------------------------------
// EV6 cost & time
// ---------------------------------------------------------------------------

export interface Ev6CostInputs {
  /** DC fast-charging price, $/kWh. Default: EA guest seed (OQ-2, editable). */
  dcRatePerKwh?: number;
  /** Home/hotel Level-2 price, $/kWh. Default: OK residential seed (OQ-2). */
  homeRatePerKwh?: number;
  tollPaymentMethod?: 'transponder' | 'plate';
}

export interface Ev6TripCost {
  dcFastEnergyKwh: number;
  totalEnergyKwh: number;
  lines: LineItem[];
  totalUsd: number;
}

/**
 * Round-trip EV6 running cost. All energy the trip consumes is priced: DC
 * fast energy at the network rate, and the remainder (the 100% starts funded
 * by home charging in Jenks and Level-2 at the Calverton hotel) at the
 * home-electricity rate.
 */
export function computeEv6Cost(plan: RoundTripPlan, inputs: Ev6CostInputs = {}): Ev6TripCost {
  const dcRate = inputs.dcRatePerKwh ?? energyPrices.electrifyAmericaPerKwhGuest.value;
  const homeRate = inputs.homeRatePerKwh ?? energyPrices.homeElectricityPerKwh.value;
  const miPerKwh = plan.outbound.params.miPerKwh;
  const dcKwh = plan.outbound.totals.dcEnergyAddedKwh + plan.returnTrip.totals.dcEnergyAddedKwh;
  const totalKwh = (plan.outbound.totalMiles + plan.returnTrip.totalMiles) / miPerKwh;
  const homeKwh = Math.max(0, totalKwh - dcKwh);
  const tolls = computeTollCosts(inputs.tollPaymentMethod);

  const lines: LineItem[] = [
    {
      label: 'DC fast charging',
      amountUsd: round2(dcKwh * dcRate),
      note: `${dcKwh.toFixed(0)} kWh at $${dcRate.toFixed(2)}/kWh (${energyPrices.electrifyAmericaPerKwhGuest.note})`,
      isEstimate: true,
    },
    {
      label: 'Home & hotel Level-2 charging',
      amountUsd: round2(homeKwh * homeRate),
      note: `${homeKwh.toFixed(0)} kWh at $${homeRate.toFixed(2)}/kWh — the 100% departures from Jenks and Calverton are charged off-network (CHG-1 / OQ-9); hotel L2 priced at the home rate as a proxy.`,
      isEstimate: true,
    },
    {
      label: 'Tolls (round trip)',
      amountUsd: tolls.roundTripUsd,
      note: tolls.note,
      isEstimate: true,
    },
  ];
  return {
    dcFastEnergyKwh: round2(dcKwh),
    totalEnergyKwh: round2(totalKwh),
    lines,
    totalUsd: round2(lines.reduce((a, l) => a + l.amountUsd, 0)),
  };
}

export interface DriveTimeInputs {
  /** Interstate average at the speed limit (FR-7). Default 65 mph (route data). */
  avgSpeedMph?: number;
}

export interface Ev6TripTime {
  driveHours: number;
  chargeHours: number;
  totalHours: number;
  note: string;
}

/** Round-trip EV6 moving + charging time (overnight stops are timeline events, not travel time). */
export function computeEv6Time(plan: RoundTripPlan, inputs: DriveTimeInputs = {}): Ev6TripTime {
  const mph = inputs.avgSpeedMph ?? 65;
  const driveHours = (plan.outbound.totalMiles + plan.returnTrip.totalMiles) / mph;
  const chargeHours = plan.outbound.totals.chargeHours + plan.returnTrip.totals.chargeHours;
  return {
    driveHours: round2(driveHours),
    chargeHours: round2(chargeHours),
    totalHours: round2(driveHours + chargeHours),
    note: `Driving at a ~${mph} mph interstate speed-limit average (FR-7) plus ${plan.outbound.totals.stopCount + plan.returnTrip.totals.stopCount} charging stops; overnight hotel time excluded from travel time.`,
  };
}

// ---------------------------------------------------------------------------
// Sportage Hybrid cost & time (OQ-10: refuel time/cost counted, stations never
// rendered; DR-2: only >=4.9-star coffee shops appear in the timeline)
// ---------------------------------------------------------------------------

/**
 * Approximate route miles driven per state, one way (estimate derived from
 * the route-leg table in src/data/route.ts; West Virginia's ~15 mi panhandle
 * is folded into Ohio). Used to mile-weight AAA state gas prices.
 */
export const milesByStateOneWay: Record<string, number> = {
  OK: 110,
  MO: 290,
  IL: 150,
  IN: 150,
  OH: 245,
  PA: 305,
  NJ: 65,
  NY: 135,
};

/** Mile-weighted average gas price over the route, $/gal. */
export function weightedGasPricePerGallon(
  pricesByState: Record<string, number> = energyPrices.gasPerGallonByState,
): number {
  let miles = 0;
  let dollars = 0;
  for (const [state, mi] of Object.entries(milesByStateOneWay)) {
    const price = pricesByState[state];
    if (price === undefined) throw new Error(`no gas price seeded for ${state}`);
    miles += mi;
    dollars += mi * price;
  }
  return dollars / miles;
}

/** Timeline event for the Sportage view. Note: no fuel-station events exist (OQ-10/DR-2). */
export interface SportageTimelineEvent {
  kind: 'coffee';
  shopId: string;
  name: string;
  city: string;
  state: string;
  /** Approx route miles from the direction start (estimate, from route legs). */
  milesFromStart: number;
  dwellMinutes: number;
}

/**
 * Approximate route position of each verified coffee shop, miles from Jenks
 * (estimate: interpolated from the route-leg table; shops sit minutes off
 * the listed interchange).
 */
const coffeeShopMilesFromJenks: Record<string, number> = {
  'black-wall-street-liquid-lounge': 14,
  'el-cafecito-springfield-mo': 188,
  'e61-cafe-st-louis': 404,
  'loose-goose-terre-haute-in': 585,
  'claypot-coffee-house-indianapolis': 662,
  'tiger-eye-coffee-harrisburg-pa': 1205,
  'nowhere-coffee-roastery-allentown-pa': 1288,
};

export interface SportageInputs {
  mpg?: number;
  tankGallons?: number;
  reserveGallons?: number;
  refuelMinutes?: number;
  coffeeDwellMinutes?: number;
  avgSpeedMph?: number;
  gasPricesByState?: Record<string, number>;
  tollPaymentMethod?: 'transponder' | 'plate';
}

export interface SportagePlan {
  oneWayMiles: number;
  roundTripMiles: number;
  /** Coffee stops in route order for each direction (DR-2 / deliverable 3). */
  timeline: { outbound: SportageTimelineEvent[]; returnTrip: SportageTimelineEvent[] };
  fuel: {
    gallonsRoundTrip: number;
    pricePerGallonUsd: number;
    costUsd: number;
    note: string;
    isEstimate: true;
  };
  /** OQ-10: counted in time, never rendered as stops. */
  refueling: {
    stopsPerDirection: number;
    stopsRoundTrip: number;
    totalMinutes: number;
    note: string;
  };
  time: {
    driveHours: number;
    refuelHours: number;
    coffeeHours: number;
    totalHours: number;
    note: string;
  };
  costLines: LineItem[];
  totalCostUsd: number;
}

export function computeSportagePlan(
  inputs: SportageInputs = {},
  shops: CoffeeShop[] = coffeeShops,
): SportagePlan {
  const mpg = inputs.mpg ?? SPORTAGE.mpg.value;
  const tank = inputs.tankGallons ?? SPORTAGE.tankGallons;
  const reserve = inputs.reserveGallons ?? SPORTAGE.reserveGallons;
  const refuelMin = inputs.refuelMinutes ?? SPORTAGE.refuelMinutes;
  const dwellMin = inputs.coffeeDwellMinutes ?? 20;
  const mph = inputs.avgSpeedMph ?? 65;
  const oneWay = route.oneWayMiles;
  const roundTrip = oneWay * 2;

  // Refueling model (OQ-10): depart full, refuel when the tank hits the
  // reserve; the overnight stop resets nothing (gas is everywhere).
  const usableRangeMiles = (tank - reserve) * mpg;
  const stopsPerDirection = Math.max(0, Math.ceil((oneWay - usableRangeMiles) / usableRangeMiles));

  const pricePerGallon = weightedGasPricePerGallon(inputs.gasPricesByState);
  const gallons = roundTrip / mpg;
  const tolls = computeTollCosts(inputs.tollPaymentMethod);

  const outboundEvents: SportageTimelineEvent[] = shops
    .map((s) => ({
      kind: 'coffee' as const,
      shopId: s.id,
      name: s.name,
      city: s.city,
      state: s.state,
      milesFromStart: coffeeShopMilesFromJenks[s.id] ?? NaN,
      dwellMinutes: dwellMin,
    }))
    .filter((e) => Number.isFinite(e.milesFromStart))
    .sort((a, b) => a.milesFromStart - b.milesFromStart);
  const returnEvents = outboundEvents
    .map((e) => ({ ...e, milesFromStart: oneWay - e.milesFromStart }))
    .sort((a, b) => a.milesFromStart - b.milesFromStart);

  const driveHours = roundTrip / mph;
  const refuelHours = (stopsPerDirection * 2 * refuelMin) / 60;
  const coffeeHours = ((outboundEvents.length + returnEvents.length) * dwellMin) / 60;

  const costLines: LineItem[] = [
    {
      label: 'Gasoline',
      amountUsd: round2(gallons * pricePerGallon),
      note: `${gallons.toFixed(1)} gal at a mile-weighted $${pricePerGallon.toFixed(2)}/gal (AAA state averages as of ${energyPrices.gasPricesAsOf}); ${mpg} MPG (FR-16, editable).`,
      isEstimate: true,
    },
    {
      label: 'Tolls (round trip)',
      amountUsd: tolls.roundTripUsd,
      note: tolls.note,
      isEstimate: true,
    },
  ];

  return {
    oneWayMiles: oneWay,
    roundTripMiles: roundTrip,
    timeline: { outbound: outboundEvents, returnTrip: returnEvents },
    fuel: {
      gallonsRoundTrip: round2(gallons),
      pricePerGallonUsd: round2(pricePerGallon),
      costUsd: round2(gallons * pricePerGallon),
      note: 'Mile-weighted across the states on the route (estimate).',
      isEstimate: true,
    },
    refueling: {
      stopsPerDirection,
      stopsRoundTrip: stopsPerDirection * 2,
      totalMinutes: stopsPerDirection * 2 * refuelMin,
      note: `OQ-10: ~${refuelMin} min per fill counted in the timeline; gas stations are never rendered as stops (DR-2).`,
    },
    time: {
      driveHours: round2(driveHours),
      refuelHours: round2(refuelHours),
      coffeeHours: round2(coffeeHours),
      totalHours: round2(driveHours + refuelHours + coffeeHours),
      note: `Driving at a ~${mph} mph speed-limit average (FR-7) plus refueling time and ${outboundEvents.length} coffee stops each way (${dwellMin} min each); overnight hotel time excluded.`,
    },
    costLines,
    totalCostUsd: round2(costLines.reduce((a, l) => a + l.amountUsd, 0)),
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
