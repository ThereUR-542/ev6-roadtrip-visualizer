/**
 * EV6 charging plan engine — implements the client's 20–80% discipline
 * exactly as stated in the PRD (CHG-1..CHG-6):
 *
 * - CHG-1: the trip departs Jenks at 100% SoC; the first leg departs at 100%.
 * - CHG-2: drive each leg down to ~20%, then charge 20→80%.
 * - CHG-3: never plan charging above 80%.
 * - CHG-4: never plan an arrival below 20% at a charger; arriving with up to
 *   ~35% is acceptable when station spacing requires it.
 * - CHG-5: all legs after the first follow the 20→80 pattern (depart 80%).
 * - CHG-6: every planned stop exposes projected arrival SoC and charge-to SoC.
 *
 * Planning strategy: greedy farthest-reachable. From the current position the
 * engine skips ahead to the farthest station reachable without dropping below
 * the 20% floor — this drives each leg as close to 20% as the real station
 * spacing allows (CHG-2) and minimizes stop count. Charge-to is always exactly
 * 80% (CHG-2/3/5). Because gaps between corridor stations (~40–120 mi) are
 * often shorter than the full 20→80 window (~125 mi at defaults), some forced
 * arrivals exceed the ~35% tolerance; each such stop is flagged
 * `spacingForced` and the test suite independently verifies that skipping it
 * would have breached the 20% floor (i.e., the excess is genuinely
 * spacing-required, honoring CHG-4's tolerance rule).
 *
 * Destination-floor exemption (documented for QA): CHG-4's floor applies to
 * charger arrivals. The final arrival at the *trip endpoint* (home in Jenks /
 * the Calverton hotel) uses a separate `minDestinationArrivalPct` (default
 * 10%) because the dataset's closest charger to Jenks (Mount Vernon MO) sits
 * 140 route-miles out: outbound that gap is covered by the 100% start (CHG-1),
 * but on the return the final 140-mi leg from an 80% departure arrives home
 * at ~13% and no compliant alternative exists (charging above 80% would break
 * CHG-3 and there is no closer verified ≥200 kW station, see
 * docs/verification.md). Such arrivals are flagged `belowPreferredFloor` so
 * the UI can surface them.
 *
 * The return leg is planned independently (OQ-9) with an editable starting
 * SoC at Calverton (default 100% — the destination hotel, Hyatt Place Long
 * Island/East End, has verified on-site Level 2 charging; see
 * docs/DECISIONS.md).
 *
 * Pure TypeScript: no UI dependencies (NFR via DECISIONS technical baseline).
 */

import type { ChargingStation } from '../data/types';
import { chargingStations } from '../data/chargingStations';
import { route } from '../data/route';
import { EV6, pctPerMile } from './efficiency';

/** A station projected onto a single travel direction. */
export interface DirectionalStation {
  id: string;
  name: string;
  network: string;
  /** Route miles from the direction's start (Jenks or Calverton). */
  milesFromStart: number;
}

/** A planned charging stop (CHG-6: arrival SoC + charge-to SoC per stop). */
export interface PlannedChargeStop {
  stationId: string;
  stationName: string;
  network: string;
  milesFromStart: number;
  /** Miles driven on the leg that ends at this stop. */
  legMiles: number;
  /** SoC at the start of that leg, percent. */
  departSocPct: number;
  /** Projected SoC on arrival at this charger, percent (CHG-6). */
  arrivalSocPct: number;
  /** SoC the plan charges to at this stop, percent (CHG-6; always 80, CHG-3). */
  chargeToSocPct: number;
  /** Energy added at this stop, kWh. */
  energyAddedKwh: number;
  /** Estimated session time incl. per-stop overhead, minutes. */
  chargeMinutes: number;
  /**
   * True when the arrival SoC exceeds the ~35% tolerance because the next
   * station up the road was unreachable without dropping below 20% (CHG-4).
   */
  spacingForced: boolean;
}

export interface FinalLeg {
  fromMiles: number;
  legMiles: number;
  departSocPct: number;
  /** Projected SoC on arrival at the trip endpoint, percent. */
  arrivalSocPct: number;
  /** True when the endpoint arrival is below the preferred 20% (see header). */
  belowPreferredFloor: boolean;
}

export interface ChargingPlan {
  direction: 'outbound' | 'return';
  startLabel: string;
  endLabel: string;
  totalMiles: number;
  startSocPct: number;
  stops: PlannedChargeStop[];
  finalLeg: FinalLeg;
  totals: {
    stopCount: number;
    dcEnergyAddedKwh: number;
    chargeHours: number;
  };
  params: Required<ChargingParams>;
}

export interface ChargingParams {
  /** Usable battery, kWh. Default 77.4 (EV6 long-range pack). */
  batteryKwh?: number;
  /** Efficiency, mi/kWh. Default per OQ-6 (see efficiency.ts). Editable, FR-16. */
  miPerKwh?: number;
  /** Charge-to ceiling, percent. 80 per CHG-2/CHG-3 — do not raise. */
  chargeToPct?: number;
  /** Hard charger-arrival floor, percent. 20 per CHG-4. */
  minChargerArrivalPct?: number;
  /** Soft arrival ceiling, percent (~35 per CHG-4). */
  arrivalTolerancePct?: number;
  /** Endpoint arrival floor, percent (documented exemption, see header). */
  minDestinationArrivalPct?: number;
  /** Average 20→80 DC power, kW. */
  avgDcChargePowerKw?: number;
  /** Per-stop overhead, minutes. */
  perStopOverheadMin?: number;
}

export class ChargingPlanError extends Error {}

function resolveParams(p: ChargingParams = {}): Required<ChargingParams> {
  return {
    batteryKwh: p.batteryKwh ?? EV6.batteryKwh,
    miPerKwh: p.miPerKwh ?? EV6.miPerKwh.value,
    chargeToPct: p.chargeToPct ?? 80,
    minChargerArrivalPct: p.minChargerArrivalPct ?? 20,
    arrivalTolerancePct: p.arrivalTolerancePct ?? 35,
    minDestinationArrivalPct: p.minDestinationArrivalPct ?? 10,
    avgDcChargePowerKw: p.avgDcChargePowerKw ?? EV6.avgDcChargePowerKw.value,
    perStopOverheadMin: p.perStopOverheadMin ?? EV6.perStopOverheadMin,
  };
}

/**
 * Project the verified station dataset onto one travel direction, sorted by
 * distance from that direction's start.
 */
export function stationsForDirection(
  direction: 'outbound' | 'return',
  totalMiles: number = route.oneWayMiles,
  stations: ChargingStation[] = chargingStations,
): DirectionalStation[] {
  return stations
    .filter((s) => s.directions === 'both' || s.directions === direction)
    .map((s) => ({
      id: s.id,
      name: s.name,
      network: s.network,
      milesFromStart:
        direction === 'outbound'
          ? s.approxRouteMilesFromJenks
          : totalMiles - s.approxRouteMilesFromJenks,
    }))
    .filter((s) => s.milesFromStart > 0 && s.milesFromStart < totalMiles)
    .sort((a, b) => a.milesFromStart - b.milesFromStart);
}

/**
 * Plan one direction of the trip under CHG-1..CHG-5.
 *
 * `startSocPct` is 100 outbound (CHG-1) and editable for the return (OQ-9).
 */
export function planDirection(opts: {
  direction: 'outbound' | 'return';
  startLabel: string;
  endLabel: string;
  totalMiles: number;
  startSocPct: number;
  stations: DirectionalStation[];
  params?: ChargingParams;
}): ChargingPlan {
  const params = resolveParams(opts.params);
  const { totalMiles, stations } = opts;
  const ppm = pctPerMile(params.miPerKwh, params.batteryKwh);

  if (opts.startSocPct <= params.minChargerArrivalPct || opts.startSocPct > 100) {
    throw new ChargingPlanError(
      `start SoC ${opts.startSocPct}% must be in (${params.minChargerArrivalPct}, 100]`,
    );
  }

  const stops: PlannedChargeStop[] = [];
  let positionMiles = 0;
  let soc = opts.startSocPct;

  // Greedy farthest-reachable loop; bounded by station count.
  for (let guard = 0; guard <= stations.length + 1; guard++) {
    const reachToChargerFloor = positionMiles + (soc - params.minChargerArrivalPct) / ppm;
    const reachToDestinationFloor = positionMiles + (soc - params.minDestinationArrivalPct) / ppm;

    // Done when the endpoint is reachable above the destination floor and no
    // further charge is needed.
    if (totalMiles <= reachToDestinationFloor) {
      // Prefer finishing without an extra stop only if we also respect the
      // preferred 20% floor OR no station could improve things (i.e., there is
      // no station between here and the destination that we must use anyway).
      const arrivalAtDest = soc - (totalMiles - positionMiles) * ppm;
      const couldStopCloser = stations.some(
        (s) =>
          s.milesFromStart > positionMiles &&
          s.milesFromStart <= reachToChargerFloor &&
          // a stop only helps the destination arrival if it is ahead of us
          s.milesFromStart < totalMiles,
      );
      if (arrivalAtDest >= params.minChargerArrivalPct || !couldStopCloser) {
        return {
          direction: opts.direction,
          startLabel: opts.startLabel,
          endLabel: opts.endLabel,
          totalMiles,
          startSocPct: opts.startSocPct,
          stops,
          finalLeg: {
            fromMiles: positionMiles,
            legMiles: totalMiles - positionMiles,
            departSocPct: soc,
            arrivalSocPct: arrivalAtDest,
            belowPreferredFloor: arrivalAtDest < params.minChargerArrivalPct,
          },
          totals: {
            stopCount: stops.length,
            dcEnergyAddedKwh: stops.reduce((a, s) => a + s.energyAddedKwh, 0),
            chargeHours: stops.reduce((a, s) => a + s.chargeMinutes, 0) / 60,
          },
          params,
        };
      }
    }

    // Otherwise: pick the farthest station reachable without breaching the
    // 20% charger floor (CHG-2/CHG-4).
    const candidates = stations.filter(
      (s) => s.milesFromStart > positionMiles && s.milesFromStart <= reachToChargerFloor,
    );
    if (candidates.length === 0) {
      const next = stations.find((s) => s.milesFromStart > positionMiles);
      throw new ChargingPlanError(
        `infeasible at mile ${positionMiles.toFixed(0)} (${soc.toFixed(1)}% SoC): ` +
          (next
            ? `next station "${next.name}" at mile ${next.milesFromStart} is beyond the ` +
              `${(reachToChargerFloor - positionMiles).toFixed(0)}-mi window to the 20% floor`
            : `no station remains before the endpoint at mile ${totalMiles}`),
      );
    }
    const chosen = candidates[candidates.length - 1];
    const legMiles = chosen.milesFromStart - positionMiles;
    const arrivalSocPct = soc - legMiles * ppm;
    const beyond = stations.find((s) => s.milesFromStart > chosen.milesFromStart);
    const spacingForced =
      arrivalSocPct > params.arrivalTolerancePct &&
      (beyond ? beyond.milesFromStart > reachToChargerFloor : totalMiles > reachToDestinationFloor);
    const energyAddedKwh = ((params.chargeToPct - arrivalSocPct) / 100) * params.batteryKwh;

    stops.push({
      stationId: chosen.id,
      stationName: chosen.name,
      network: chosen.network,
      milesFromStart: chosen.milesFromStart,
      legMiles,
      departSocPct: soc,
      arrivalSocPct,
      chargeToSocPct: params.chargeToPct,
      energyAddedKwh,
      chargeMinutes: (energyAddedKwh / params.avgDcChargePowerKw) * 60 + params.perStopOverheadMin,
      spacingForced,
    });
    positionMiles = chosen.milesFromStart;
    soc = params.chargeToPct; // CHG-2/CHG-5: depart every later leg at 80%.
  }
  throw new ChargingPlanError('planning did not converge (guard exceeded)');
}

export interface RoundTripPlan {
  outbound: ChargingPlan;
  /** Planned independently per OQ-9. */
  returnTrip: ChargingPlan;
}

/**
 * Plan the full round trip against the Phase 1 verified dataset.
 *
 * @param returnStartSocPct editable Calverton starting SoC (OQ-9). Default
 *   100: the destination hotel has verified on-site Level 2 charging.
 */
export function planEv6RoundTrip(
  opts: { returnStartSocPct?: number; params?: ChargingParams } = {},
): RoundTripPlan {
  const totalMiles = route.oneWayMiles;
  const outbound = planDirection({
    direction: 'outbound',
    startLabel: 'Jenks, OK',
    endLabel: 'SQ4D HQ, Calverton, NY',
    totalMiles,
    startSocPct: 100, // CHG-1: depart Jenks at 100%.
    stations: stationsForDirection('outbound', totalMiles),
    params: opts.params,
  });
  const returnTrip = planDirection({
    direction: 'return',
    startLabel: 'Calverton, NY',
    endLabel: 'Jenks, OK',
    totalMiles,
    startSocPct: opts.returnStartSocPct ?? 100,
    stations: stationsForDirection('return', totalMiles),
    params: opts.params,
  });
  return { outbound, returnTrip };
}

/**
 * Plain-language statement of the strategy for the EV6 view (CHG-6 first
 * half: the strategy itself is displayed to the user).
 */
export const chargingStrategyText: readonly string[] = [
  'Depart Jenks with a full 100% charge — the first leg runs on it (CHG-1).',
  'Drive each leg down to about 20%, then charge back to 80% (CHG-2).',
  'Never charge past 80% — charging slows dramatically beyond it (CHG-3).',
  'Never plan to arrive below 20%; arriving with up to ~35% is fine when station spacing requires it (CHG-4).',
  'Every leg after the first follows the same 20→80 rhythm (CHG-5).',
];
