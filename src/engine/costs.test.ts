/** Cost/time engine tests — FR-7, FR-16, FR-18, OQ-2, OQ-10. */
import { describe, expect, it } from 'vitest';
import { energyPrices, tollTotals } from '../data/route';
import { coffeeShops } from '../data/coffeeShops';
import { planEv6RoundTrip } from './chargingPlan';
import {
  computeEv6Cost,
  computeEv6Time,
  computeSportagePlan,
  computeTollCosts,
  milesByStateOneWay,
  weightedGasPricePerGallon,
} from './costs';

describe('FR-18 — tolls', () => {
  it('transponder totals computed from segments match the verified dataset aggregate', () => {
    const tolls = computeTollCosts('transponder');
    expect(tolls.oneWayEastboundUsd).toBeCloseTo(tollTotals.eastboundTransponderUsd, 2);
    expect(tolls.oneWayWestboundUsd).toBeCloseTo(tollTotals.westboundTransponderUsd, 2);
    expect(tolls.roundTripUsd).toBeCloseTo(64.81, 2);
  });

  it('westbound is cheaper than eastbound (GWB tolled eastbound only)', () => {
    const tolls = computeTollCosts('transponder');
    expect(tolls.oneWayWestboundUsd).toBeLessThan(tolls.oneWayEastboundUsd);
  });

  it('plate billing uses the dataset aggregates', () => {
    const tolls = computeTollCosts('plate');
    expect(tolls.roundTripUsd).toBeCloseTo(
      tollTotals.eastboundPlateBillingUsd + tollTotals.westboundPlateBillingUsd,
      2,
    );
  });
});

describe('EV6 round-trip cost & time', () => {
  const trip = planEv6RoundTrip();
  const cost = computeEv6Cost(trip);
  const time = computeEv6Time(trip);

  it('prices all consumed energy: DC fast at network rate, remainder at home rate', () => {
    const miPerKwh = trip.outbound.params.miPerKwh;
    expect(cost.totalEnergyKwh).toBeCloseTo(2900 / miPerKwh, 0);
    expect(cost.dcFastEnergyKwh).toBeGreaterThan(0);
    expect(cost.dcFastEnergyKwh).toBeLessThanOrEqual(cost.totalEnergyKwh);
    const dcLine = cost.lines.find((l) => l.label === 'DC fast charging')!;
    expect(dcLine.amountUsd).toBeCloseTo(
      cost.dcFastEnergyKwh * energyPrices.electrifyAmericaPerKwhGuest.value,
      0,
    );
    expect(cost.totalUsd).toBeCloseTo(
      cost.lines.reduce((a, l) => a + l.amountUsd, 0),
      2,
    );
  });

  it('every line is labeled with a note and estimate flag (ACC-5)', () => {
    for (const line of cost.lines) {
      expect(line.note.length).toBeGreaterThan(0);
      expect(line.isEstimate).toBe(true);
    }
  });

  it('editable rates change the answer (OQ-2 / FR-16)', () => {
    const passPlus = computeEv6Cost(trip, {
      dcRatePerKwh: energyPrices.electrifyAmericaPerKwhPassPlus.value,
    });
    expect(passPlus.totalUsd).toBeLessThan(cost.totalUsd);
  });

  it('time = drive at speed-limit average + charge time at stops (FR-7)', () => {
    expect(time.driveHours).toBeCloseTo(2900 / 65, 1);
    expect(time.chargeHours).toBeGreaterThan(0);
    expect(time.totalHours).toBeCloseTo(time.driveHours + time.chargeHours, 1);
  });
});

describe('Sportage Hybrid plan (OQ-10, DR-2, FR-16)', () => {
  const plan = computeSportagePlan();

  it('mile-weighted gas price falls within the seeded state price range', () => {
    const prices = Object.values(energyPrices.gasPerGallonByState);
    const weighted = weightedGasPricePerGallon();
    expect(weighted).toBeGreaterThanOrEqual(Math.min(...prices));
    expect(weighted).toBeLessThanOrEqual(Math.max(...prices));
    expect(Object.values(milesByStateOneWay).reduce((a, b) => a + b, 0)).toBe(1450);
  });

  it('fuel math follows the adjustable MPG (FR-16)', () => {
    expect(plan.fuel.gallonsRoundTrip).toBeCloseTo(2900 / 36, 1);
    const thirstier = computeSportagePlan({ mpg: 30 });
    expect(thirstier.fuel.costUsd).toBeGreaterThan(plan.fuel.costUsd);
  });

  it('OQ-10: refuel time counts in the timeline but no gas-station stop is ever rendered', () => {
    expect(plan.refueling.stopsRoundTrip).toBeGreaterThan(0);
    expect(plan.refueling.totalMinutes).toBe(
      plan.refueling.stopsRoundTrip * 10,
    );
    expect(plan.time.refuelHours).toBeCloseTo(plan.refueling.totalMinutes / 60, 2);
    // The only timeline event kind is 'coffee' — no fuel or charging stops.
    for (const events of [plan.timeline.outbound, plan.timeline.returnTrip]) {
      for (const e of events) {
        expect(e.kind).toBe('coffee');
      }
    }
  });

  it('all verified >=4.9★ coffee shops appear in the timeline in route order (DR-2)', () => {
    expect(plan.timeline.outbound).toHaveLength(coffeeShops.length);
    const miles = plan.timeline.outbound.map((e) => e.milesFromStart);
    expect([...miles].sort((a, b) => a - b)).toEqual(miles);
    const returnMiles = plan.timeline.returnTrip.map((e) => e.milesFromStart);
    expect([...returnMiles].sort((a, b) => a - b)).toEqual(returnMiles);
    expect(plan.time.coffeeHours).toBeCloseTo((coffeeShops.length * 2 * 20) / 60, 2);
  });

  it('totals add up and include tolls', () => {
    expect(plan.time.totalHours).toBeCloseTo(
      plan.time.driveHours + plan.time.refuelHours + plan.time.coffeeHours,
      1,
    );
    expect(plan.totalCostUsd).toBeCloseTo(plan.fuel.costUsd + 64.81, 1);
  });
});
