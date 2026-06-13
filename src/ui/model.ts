/**
 * UI trip model: turns the editable settings (FR-16, OQ-2) into the Phase 2
 * engine outputs and reshapes them into direction-keyed "journeys" the map,
 * timeline and slider all share. Pure — recomputed via useMemo on any setting
 * change so vehicle/efficiency edits re-render instantly (FR-3/FR-16).
 */

import {
  planEv6RoundTrip,
  computeEv6Cost,
  computeEv6Time,
  computeSportagePlan,
  computeSouthwestOptions,
  chargingStrategyText,
  type RoundTripPlan,
  type ChargingPlan,
  type Ev6TripCost,
  type Ev6TripTime,
  type SportagePlan,
  type SouthwestOption,
} from '../engine';
import {
  chargingStations,
  coffeeShops,
  hotels,
  route,
  energyPrices,
  type ChargingStation,
  type CoffeeShop,
  type Hotel,
} from '../data';

export type Mode = 'ev6' | 'sportage' | 'southwest';
export type Direction = 'outbound' | 'return';

export interface Settings {
  departureDate: string;
  ev6MiPerKwh: number;
  ev6AvgDcKw: number;
  ev6ReturnStartSoc: number;
  dcRatePerKwh: number;
  homeRatePerKwh: number;
  sportageMpg: number;
  avgSpeedMph: number;
}

export const SETTING_NOTES: Record<keyof Omit<Settings, 'departureDate'>, string> = {
  ev6MiPerKwh:
    'EPA highway ~96 MPGe (≈2.85 mi/kWh) for the 2023 EV6 GT-Line AWD, adjusted conservatively to 2.7 for 70–75 mph interstate driving. Editable (FR-16, OQ-6).',
  ev6AvgDcKw:
    'EV6 800-V peak ~235 kW with taper; 20→80% sessions on 350 kW hardware average ~160–180 kW. 170 kW central estimate (OQ-6).',
  ev6ReturnStartSoc:
    'OQ-9: the return is planned independently; Calverton start SoC defaults to 100% because the destination Hyatt Place has verified on-site Level 2 charging. Editable assumption.',
  dcRatePerKwh: energyPrices.electrifyAmericaPerKwhGuest.note,
  homeRatePerKwh: energyPrices.homeElectricityPerKwh.note,
  sportageMpg:
    'EPA 38 MPG (2023 Sportage Hybrid AWD; FWD rates 43), adjusted conservatively to 36 for 70–75 mph interstate driving. Editable (FR-16, OQ-6).',
  avgSpeedMph: 'Interstate average at the posted speed limit (FR-7). Default 65 mph from the route dataset.',
};

export const HUBER_ANCHOR_MILE = 730; // overnight near Huber Heights, OH
export const DEST_HOTEL_ANCHOR_MILE = 1446; // Riverhead/Calverton lodging

export interface JourneyStop {
  kind: 'origin' | 'charge' | 'coffee' | 'hotel' | 'dest';
  id: string;
  name: string;
  city?: string;
  state?: string;
  /** Distance along the *selected direction*, miles. */
  mileFromStart: number;
  /** Geographic position for the map, miles from Jenks. */
  mileFromJenks: number;
  arrivalSocPct?: number;
  chargeToSocPct?: number;
  spacingForced?: boolean;
  network?: string;
  /** Optional sub-label, e.g. charge-to / rating. */
  detail?: string;
}

export interface SocNode {
  mile: number;
  soc: number;
}

export interface Journey {
  direction: Direction;
  startLabel: string;
  endLabel: string;
  totalMiles: number;
  stops: JourneyStop[];
  /** EV6 only: piecewise SoC ledger for slider scrubbing (CHG-6). */
  socNodes?: SocNode[];
  /** EV6 only: per-stop charge minutes keyed by mileFromStart. */
  chargeMinutesByMile?: { mile: number; minutes: number }[];
}

function dirMile(dir: Direction, mileFromJenks: number, total: number): number {
  return dir === 'outbound' ? mileFromJenks : total - mileFromJenks;
}

function overnightHotel(dir: Direction): Hotel | undefined {
  return hotels.find((h) => h.role === (dir === 'outbound' ? 'outbound-overnight' : 'return-overnight'));
}
function destinationHotel(): Hotel | undefined {
  return hotels.find((h) => h.role === 'destination');
}

function ev6Journey(plan: ChargingPlan, dir: Direction, total: number): Journey {
  const stops: JourneyStop[] = [];
  stops.push({
    kind: 'origin',
    id: 'origin',
    name: dir === 'outbound' ? 'Jenks, OK' : 'SQ4D HQ — Calverton, NY',
    mileFromStart: 0,
    mileFromJenks: dir === 'outbound' ? 0 : total,
  });
  for (const s of plan.stops) {
    const station = chargingStations.find((c) => c.id === s.stationId);
    stops.push({
      kind: 'charge',
      id: s.stationId,
      name: s.stationName,
      city: station?.city,
      state: station?.state,
      mileFromStart: s.milesFromStart,
      mileFromJenks: dir === 'outbound' ? s.milesFromStart : total - s.milesFromStart,
      arrivalSocPct: s.arrivalSocPct,
      chargeToSocPct: s.chargeToSocPct,
      spacingForced: s.spacingForced,
      network: s.network,
      detail: `Arrive ${Math.round(s.arrivalSocPct)}% → charge to ${Math.round(s.chargeToSocPct)}%`,
    });
  }
  addHotels(stops, dir, total);
  // Destination
  stops.push({
    kind: 'dest',
    id: 'dest',
    name: dir === 'outbound' ? 'SQ4D HQ — Calverton, NY' : 'Jenks, OK',
    mileFromStart: total,
    mileFromJenks: dir === 'outbound' ? total : 0,
    detail: `Arrive ${Math.round(plan.finalLeg.arrivalSocPct)}%${plan.finalLeg.belowPreferredFloor ? ' (below 20% — see note)' : ''}`,
    arrivalSocPct: plan.finalLeg.arrivalSocPct,
  });
  stops.sort((a, b) => a.mileFromStart - b.mileFromStart);

  // SoC ledger (CHG-6)
  const socNodes: SocNode[] = [{ mile: 0, soc: plan.startSocPct }];
  for (const s of plan.stops) {
    socNodes.push({ mile: s.milesFromStart, soc: s.arrivalSocPct });
    socNodes.push({ mile: s.milesFromStart, soc: s.chargeToSocPct });
  }
  socNodes.push({ mile: total, soc: plan.finalLeg.arrivalSocPct });
  socNodes.sort((a, b) => a.mile - b.mile);

  const chargeMinutesByMile = plan.stops.map((s) => ({ mile: s.milesFromStart, minutes: s.chargeMinutes }));

  return {
    direction: dir,
    startLabel: plan.startLabel,
    endLabel: plan.endLabel,
    totalMiles: total,
    stops,
    socNodes,
    chargeMinutesByMile,
  };
}

function sportageJourney(
  plan: SportagePlan,
  dir: Direction,
  total: number,
): Journey {
  const events = dir === 'outbound' ? plan.timeline.outbound : plan.timeline.returnTrip;
  const stops: JourneyStop[] = [];
  stops.push({
    kind: 'origin',
    id: 'origin',
    name: dir === 'outbound' ? 'Jenks, OK' : 'SQ4D HQ — Calverton, NY',
    mileFromStart: 0,
    mileFromJenks: dir === 'outbound' ? 0 : total,
  });
  for (const e of events) {
    const shop = coffeeShops.find((c) => c.id === e.shopId);
    stops.push({
      kind: 'coffee',
      id: e.shopId,
      name: e.name,
      city: e.city,
      state: e.state,
      mileFromStart: e.milesFromStart,
      mileFromJenks: dir === 'outbound' ? e.milesFromStart : total - e.milesFromStart,
      detail: shop ? `${shop.googleRating.toFixed(1)}★ Google · ${shop.reviewCount} reviews` : undefined,
    });
  }
  addHotels(stops, dir, total);
  stops.push({
    kind: 'dest',
    id: 'dest',
    name: dir === 'outbound' ? 'SQ4D HQ — Calverton, NY' : 'Jenks, OK',
    mileFromStart: total,
    mileFromJenks: dir === 'outbound' ? total : 0,
  });
  stops.sort((a, b) => a.mileFromStart - b.mileFromStart);
  return { direction: dir, startLabel: dir === 'outbound' ? 'Jenks, OK' : 'Calverton, NY', endLabel: dir === 'outbound' ? 'Calverton, NY' : 'Jenks, OK', totalMiles: total, stops };
}

function addHotels(stops: JourneyStop[], dir: Direction, total: number) {
  const overnight = overnightHotel(dir);
  if (overnight) {
    stops.push({
      kind: 'hotel',
      id: overnight.id,
      name: overnight.name,
      city: overnight.city,
      state: overnight.state,
      mileFromStart: dirMile(dir, HUBER_ANCHOR_MILE, total),
      mileFromJenks: HUBER_ANCHOR_MILE,
      detail: 'Overnight (OQ-4)',
    });
  }
  const dest = destinationHotel();
  if (dest) {
    stops.push({
      kind: 'hotel',
      id: dest.id,
      name: dest.name,
      city: dest.city,
      state: dest.state,
      mileFromStart: dirMile(dir, DEST_HOTEL_ANCHOR_MILE, total),
      mileFromJenks: DEST_HOTEL_ANCHOR_MILE,
      detail: 'Destination lodging (OQ-4 / OQ-9)',
    });
  }
}

/** Interpolate SoC at a mile along the direction (CHG-6 slider scrubbing). */
export function socAtMile(nodes: SocNode[], mile: number): number {
  if (!nodes.length) return 0;
  if (mile <= nodes[0].mile) return nodes[0].soc;
  const last = nodes[nodes.length - 1];
  if (mile >= last.mile) return last.soc;
  let result = last.soc;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    if (b.mile > a.mile && mile >= a.mile && mile <= b.mile) {
      const t = (mile - a.mile) / (b.mile - a.mile);
      result = a.soc + (b.soc - a.soc) * t; // later matching segment wins (post-charge)
    }
  }
  return result;
}

export interface ComparisonOption {
  key: 'ev6' | 'sportage' | 'southwest-lga' | 'southwest-isp';
  label: string;
  sublabel: string;
  totalHours: number;
  /** Headline running cost (driving) or fare midpoint (air). */
  costUsd: number;
  costRangeUsd?: [number, number];
  roundTripMiles?: number;
  lines: { label: string; amountUsd: number; note: string }[];
  /** Estimated en-route lodging add-on (driving only). */
  lodgingUsd?: number;
  notes: string[];
}

export interface TripModel {
  ev6: {
    plan: RoundTripPlan;
    cost: Ev6TripCost;
    time: Ev6TripTime;
    journeys: Record<Direction, Journey>;
    strategy: readonly string[];
  };
  sportage: {
    plan: SportagePlan;
    journeys: Record<Direction, Journey>;
  };
  southwest: { lga: SouthwestOption; isp: SouthwestOption };
  comparison: ComparisonOption[];
  totalMiles: number;
}

function enRouteLodgingUsd(): number {
  const out = overnightHotel('outbound')?.approxNightlyRateUsd ?? 0;
  const ret = overnightHotel('return')?.approxNightlyRateUsd ?? 0;
  return Math.round(out + ret);
}

export function buildTripModel(s: Settings): TripModel {
  const total = route.oneWayMiles;
  const params = { miPerKwh: s.ev6MiPerKwh, avgDcChargePowerKw: s.ev6AvgDcKw };

  const plan = planEv6RoundTrip({ returnStartSocPct: s.ev6ReturnStartSoc, params });
  const cost = computeEv6Cost(plan, { dcRatePerKwh: s.dcRatePerKwh, homeRatePerKwh: s.homeRatePerKwh });
  const time = computeEv6Time(plan, { avgSpeedMph: s.avgSpeedMph });

  const sportage = computeSportagePlan({ mpg: s.sportageMpg, avgSpeedMph: s.avgSpeedMph });
  const sw = computeSouthwestOptions();

  const lodging = enRouteLodgingUsd();

  const comparison: ComparisonOption[] = [
    {
      key: 'ev6',
      label: '2023 Kia EV6 GT-Line',
      sublabel: 'Pearl White · the client’s car',
      totalHours: time.totalHours,
      costUsd: cost.totalUsd,
      roundTripMiles: total * 2,
      lines: cost.lines.map((l) => ({ label: l.label, amountUsd: l.amountUsd, note: l.note })),
      lodgingUsd: lodging,
      notes: [
        `${plan.outbound.totals.stopCount + plan.returnTrip.totals.stopCount} charging stops round trip; ${time.chargeHours.toFixed(1)} h charging + ${time.driveHours.toFixed(1)} h driving.`,
        time.note,
      ],
    },
    {
      key: 'sportage',
      label: '2023 Kia Sportage Hybrid',
      sublabel: 'Dark Matte Gray · gas hybrid',
      totalHours: sportage.time.totalHours,
      costUsd: sportage.totalCostUsd,
      roundTripMiles: sportage.roundTripMiles,
      lines: sportage.costLines.map((l) => ({ label: l.label, amountUsd: l.amountUsd, note: l.note })),
      lodgingUsd: lodging,
      notes: [sportage.fuel.note, sportage.refueling.note, sportage.time.note],
    },
    {
      key: 'southwest-lga',
      label: 'Southwest → LGA',
      sublabel: 'LaGuardia (preferred)',
      totalHours: sw.lga.roundTripHours,
      costUsd: Math.round((sw.lga.cost.lowUsd + sw.lga.cost.highUsd) / 2),
      costRangeUsd: [sw.lga.cost.lowUsd, sw.lga.cost.highUsd],
      lines: [
        { label: 'Airfare (round trip, Companion Pass)', amountUsd: Math.round((sw.lga.cost.lowUsd + sw.lga.cost.highUsd) / 2), note: sw.lga.cost.note },
      ],
      notes: [
        sw.lga.flightNote,
        'SW-5: bulky material samples cannot be transported home by air — a stated reason driving may win.',
        'Excludes rental car cost and bag fees (no verified quote in the dataset).',
      ],
    },
    {
      key: 'southwest-isp',
      label: 'Southwest → ISP',
      sublabel: 'Long Island MacArthur (alt.)',
      totalHours: sw.isp.roundTripHours,
      costUsd: Math.round((sw.isp.cost.lowUsd + sw.isp.cost.highUsd) / 2),
      costRangeUsd: [sw.isp.cost.lowUsd, sw.isp.cost.highUsd],
      lines: [
        { label: 'Airfare (round trip, Companion Pass)', amountUsd: Math.round((sw.isp.cost.lowUsd + sw.isp.cost.highUsd) / 2), note: sw.isp.cost.note },
      ],
      notes: [
        sw.isp.flightNote,
        'On-airport rental at ISP — materially faster pickup than LGA (OQ-5).',
        'Excludes rental car cost and bag fees (no verified quote in the dataset).',
      ],
    },
  ];

  return {
    ev6: {
      plan,
      cost,
      time,
      journeys: {
        outbound: ev6Journey(plan.outbound, 'outbound', total),
        return: ev6Journey(plan.returnTrip, 'return', total),
      },
      strategy: chargingStrategyText,
    },
    sportage: {
      plan: sportage,
      journeys: {
        outbound: sportageJourney(sportage, 'outbound', total),
        return: sportageJourney(sportage, 'return', total),
      },
    },
    southwest: sw,
    comparison,
    totalMiles: total,
  };
}

export function defaultSettings(today: string): Settings {
  return {
    departureDate: today,
    ev6MiPerKwh: 2.7,
    ev6AvgDcKw: 170,
    ev6ReturnStartSoc: 100,
    dcRatePerKwh: energyPrices.electrifyAmericaPerKwhGuest.value,
    homeRatePerKwh: energyPrices.homeElectricityPerKwh.value,
    sportageMpg: 36,
    avgSpeedMph: 65,
  };
}

/** Lookup helpers for modals. */
export function findChargingStation(id: string): ChargingStation | undefined {
  return chargingStations.find((c) => c.id === id);
}
export function findCoffeeShop(id: string): CoffeeShop | undefined {
  return coffeeShops.find((c) => c.id === id);
}
export function findHotel(id: string): Hotel | undefined {
  return hotels.find((h) => h.id === id);
}
