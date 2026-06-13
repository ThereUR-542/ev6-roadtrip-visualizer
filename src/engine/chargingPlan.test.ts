/**
 * CHG-1..CHG-6 verification against the Phase 1 verified dataset — this suite
 * is QA's leg-by-leg SoC verification basis (PRD § Acceptance: "CHG items are
 * verified by inspecting the EV6 plan").
 *
 * Where it matters, the tests recompute SoC arithmetic independently from the
 * raw dataset instead of trusting engine fields.
 */
import { describe, expect, it } from 'vitest';
import { chargingStations } from '../data/chargingStations';
import { route } from '../data/route';
import {
  ChargingPlanError,
  type ChargingPlan,
  planDirection,
  planEv6RoundTrip,
  stationsForDirection,
} from './chargingPlan';
import { EV6, pctPerMile } from './efficiency';

const PPM = pctPerMile(EV6.miPerKwh.value); // battery % per mile at defaults
const trip = planEv6RoundTrip();
const plans: ChargingPlan[] = [trip.outbound, trip.returnTrip];

describe('CHG-1 — depart Jenks at 100%', () => {
  it('outbound starts at 100% and the first leg departs at 100%', () => {
    expect(trip.outbound.startSocPct).toBe(100);
    expect(trip.outbound.stops[0].departSocPct).toBe(100);
  });
});

describe('CHG-2 / CHG-5 — every leg after the first follows 20→80', () => {
  it('every stop charges to exactly 80%', () => {
    for (const plan of plans) {
      for (const stop of plan.stops) {
        expect(stop.chargeToSocPct).toBe(80);
      }
    }
  });

  it('every leg after the first departs at 80%', () => {
    for (const plan of plans) {
      for (const stop of plan.stops.slice(1)) {
        expect(stop.departSocPct).toBe(80);
      }
      if (plan.stops.length > 0) {
        expect(plan.finalLeg.departSocPct).toBe(80);
      }
    }
  });

  it('drives each leg as close to 20% as station spacing allows (greedy skip check)', () => {
    // For every planned stop, the next station beyond it must NOT have been
    // reachable above the 20% floor — otherwise the engine should have
    // skipped further (CHG-2's "drive down to ~20%").
    for (const plan of plans) {
      const stations = stationsForDirection(plan.direction);
      let position = 0;
      let soc = plan.startSocPct;
      for (const stop of plan.stops) {
        const reach = position + (soc - 20) / PPM;
        const beyond = stations.find((s) => s.milesFromStart > stop.milesFromStart);
        if (beyond) {
          expect(beyond.milesFromStart).toBeGreaterThan(reach);
        }
        position = stop.milesFromStart;
        soc = stop.chargeToSocPct;
      }
    }
  });
});

describe('CHG-3 — never plan charging above 80%', () => {
  it('no planned SoC anywhere exceeds the 100% start or 80% charge ceiling', () => {
    for (const plan of plans) {
      for (const stop of plan.stops) {
        expect(stop.chargeToSocPct).toBeLessThanOrEqual(80);
        expect(stop.departSocPct).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('CHG-4 — 20% floor with the ~35% spacing tolerance', () => {
  it('no planned charger arrival is below 20%', () => {
    for (const plan of plans) {
      for (const stop of plan.stops) {
        expect(stop.arrivalSocPct).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it('arrivals above ~35% occur only where station spacing requires it', () => {
    // Independently verify each flagged stop: skipping it would have meant
    // arriving at the next station (or the endpoint) below the 20% floor.
    for (const plan of plans) {
      const stations = stationsForDirection(plan.direction);
      let position = 0;
      let soc = plan.startSocPct;
      for (const stop of plan.stops) {
        if (stop.arrivalSocPct > 35) {
          expect(stop.spacingForced).toBe(true);
          const beyond = stations.find((s) => s.milesFromStart > stop.milesFromStart);
          const nextTargetMiles = beyond ? beyond.milesFromStart : plan.totalMiles;
          const socAtNextTarget = soc - (nextTargetMiles - position) * PPM;
          expect(socAtNextTarget).toBeLessThan(20);
        }
        position = stop.milesFromStart;
        soc = stop.chargeToSocPct;
      }
    }
  });

  it('outbound first stop honors the tolerance (~35%): Mount Vernon at ~33%', () => {
    const first = trip.outbound.stops[0];
    expect(first.stationId).toBe('ea-walmart-mount-vernon-mo');
    expect(first.arrivalSocPct).toBeGreaterThanOrEqual(20);
    expect(first.arrivalSocPct).toBeLessThanOrEqual(35);
  });

  it('endpoint arrivals: outbound arrives Calverton above 20%; the return home-arrival exemption is flagged', () => {
    expect(trip.outbound.finalLeg.arrivalSocPct).toBeGreaterThanOrEqual(20);
    expect(trip.outbound.finalLeg.belowPreferredFloor).toBe(false);
    // Return: the closest verified >=200 kW charger to Jenks (Mount Vernon MO)
    // is 140 route-miles out; from an 80% departure the home arrival lands
    // ~13% — below the preferred floor, with no CHG-3-compliant alternative.
    // The engine must flag it, and there must truly be no closer station.
    const ret = trip.returnTrip;
    if (ret.finalLeg.arrivalSocPct < 20) {
      expect(ret.finalLeg.belowPreferredFloor).toBe(true);
      const stations = stationsForDirection('return');
      const lastStop = ret.stops[ret.stops.length - 1];
      expect(stations.filter((s) => s.milesFromStart > lastStop.milesFromStart)).toHaveLength(0);
    }
  });
});

describe('CHG-6 — per-stop projected arrival SoC and charge-to SoC', () => {
  it('every stop exposes arrival and charge-to SoC and self-consistent leg math', () => {
    for (const plan of plans) {
      let position = 0;
      let soc = plan.startSocPct;
      for (const stop of plan.stops) {
        // Independent recomputation of the leg-by-leg SoC ledger.
        const expectedArrival = soc - (stop.milesFromStart - position) * PPM;
        expect(stop.arrivalSocPct).toBeCloseTo(expectedArrival, 6);
        expect(stop.legMiles).toBeCloseTo(stop.milesFromStart - position, 6);
        expect(stop.energyAddedKwh).toBeCloseTo(
          ((stop.chargeToSocPct - stop.arrivalSocPct) / 100) * EV6.batteryKwh,
          6,
        );
        expect(stop.chargeMinutes).toBeGreaterThan(0);
        position = stop.milesFromStart;
        soc = stop.chargeToSocPct;
      }
      const expectedFinal = soc - (plan.totalMiles - position) * PPM;
      expect(plan.finalLeg.arrivalSocPct).toBeCloseTo(expectedFinal, 6);
    }
  });

  it('stops are strictly ordered and drawn from the verified dataset', () => {
    const knownIds = new Set(chargingStations.map((s) => s.id));
    for (const plan of plans) {
      let prev = 0;
      for (const stop of plan.stops) {
        expect(knownIds.has(stop.stationId)).toBe(true);
        expect(stop.milesFromStart).toBeGreaterThan(prev);
        expect(stop.milesFromStart).toBeLessThan(plan.totalMiles);
        prev = stop.milesFromStart;
      }
      expect(plan.totalMiles).toBe(route.oneWayMiles);
    }
  });
});

describe('OQ-9 — return planned independently with editable Calverton start SoC', () => {
  it('default return departs Calverton at 100% (verified hotel L2) and is planned independently', () => {
    expect(trip.returnTrip.startSocPct).toBe(100);
    // Independence is structural, not a station-set difference: on a symmetric
    // corridor (every station serves both directions) an independent 100%→
    // 20→80 plan legitimately selects the mirror station set. What proves the
    // return is its own pass — not a copy of outbound — is that its distances
    // are measured from Calverton and its per-stop SoC ledger differs.
    expect(trip.returnTrip.stops[0].milesFromStart).toBeLessThan(
      trip.outbound.stops[0].milesFromStart,
    ); // first return stop sits near the Calverton end (58 mi vs 140 mi)
    expect(trip.returnTrip.stops[0].arrivalSocPct).not.toBeCloseTo(
      trip.outbound.stops[0].arrivalSocPct,
      1,
    ); // independent ledger: 72.2% vs 33.0%
    // The return's final home-arrival exemption fires (see header) while the
    // outbound's destination arrival does not — only an independent return
    // plan would produce this asymmetry.
    expect(trip.returnTrip.finalLeg.belowPreferredFloor).toBe(true);
    expect(trip.outbound.finalLeg.belowPreferredFloor).toBe(false);
  });

  it('a lower editable start SoC changes the first return stop', () => {
    const low = planEv6RoundTrip({ returnStartSocPct: 30 });
    // At 30% only Manorville (19 mi from Calverton) is reachable above 20%.
    expect(low.returnTrip.stops[0].stationId).toBe('ea-manorville-square-manorville-ny');
    expect(trip.returnTrip.stops[0].stationId).not.toBe('ea-manorville-square-manorville-ny');
    for (const stop of low.returnTrip.stops) {
      expect(stop.arrivalSocPct).toBeGreaterThanOrEqual(20);
      expect(stop.chargeToSocPct).toBe(80);
    }
  });
});

describe('FR-16 — plans recompute from adjustable efficiency', () => {
  it('a less efficient setting yields equal-or-more stops and lower arrivals', () => {
    const eff = planEv6RoundTrip({ params: { miPerKwh: 3.0 } });
    const ineff = planEv6RoundTrip({ params: { miPerKwh: 2.6 } });
    expect(ineff.outbound.stops.length).toBeGreaterThanOrEqual(eff.outbound.stops.length);
    expect(ineff.outbound.stops[0].arrivalSocPct).toBeLessThan(
      eff.outbound.stops[0].arrivalSocPct,
    );
    for (const plan of [eff.outbound, eff.returnTrip, ineff.outbound, ineff.returnTrip]) {
      for (const stop of plan.stops) {
        expect(stop.arrivalSocPct).toBeGreaterThanOrEqual(20);
        expect(stop.chargeToSocPct).toBe(80);
      }
    }
  });

  it('reports an infeasible corridor instead of silently breaking the rules', () => {
    expect(() => planEv6RoundTrip({ params: { miPerKwh: 1.0 } })).toThrow(ChargingPlanError);
  });
});

describe('engine purity / guards', () => {
  it('rejects a start SoC at or below the floor', () => {
    expect(() =>
      planDirection({
        direction: 'return',
        startLabel: 'Calverton, NY',
        endLabel: 'Jenks, OK',
        totalMiles: route.oneWayMiles,
        startSocPct: 20,
        stations: stationsForDirection('return'),
      }),
    ).toThrow(ChargingPlanError);
  });
});
