/** Southwest engine tests — SW-1..SW-4, SW-6; OQ-5, OQ-7. */
import { describe, expect, it } from 'vitest';
import { lastMinuteFareSnapshot } from '../data/southwest';
import { computeSouthwestOption, computeSouthwestOptions } from './southwest';

describe('SW-2 — door-to-door timeline components', () => {
  const lga = computeSouthwestOption({ airport: 'LGA' });

  it('contains every SW-2 component in order', () => {
    expect(lga.segments.map((s) => s.kind)).toEqual([
      'drive-to-airport',
      'airport-buffer',
      'security',
      'flight',
      'baggage-claim',
      'rental-pickup',
      'drive-to-hq',
    ]);
  });

  it('counts the 2-hour early arrival once (security clears inside the buffer)', () => {
    const buffer = lga.segments.find((s) => s.kind === 'airport-buffer')!;
    const security = lga.segments.find((s) => s.kind === 'security')!;
    expect(buffer.hours).toBe(2.0);
    expect(security.containedInBuffer).toBe(true);
    const additive = lga.segments
      .filter((s) => !s.containedInBuffer)
      .reduce((a, s) => a + s.hours, 0);
    expect(lga.oneWayHours).toBeCloseTo(additive, 2);
    // 0.35 drive + 2.0 buffer + 6.0 flight + 0.5 baggage + 1.0 rental + 1.5 drive
    expect(lga.oneWayHours).toBeCloseTo(11.35, 2);
    expect(lga.roundTripHours).toBeCloseTo(22.7, 2);
  });
});

describe('SW-3 / OQ-5 — both airports, LGA preferred', () => {
  const { lga, isp } = computeSouthwestOptions();

  it('LGA is the preferred/default airport', () => {
    expect(lga.preferred).toBe(true);
    expect(isp.preferred).toBe(false);
    expect(computeSouthwestOption().airport).toBe('LGA');
  });

  it('both include rental pickup; ISP pickup is faster (on-airport) but its flight is longer', () => {
    const lgaRental = lga.segments.find((s) => s.kind === 'rental-pickup')!;
    const ispRental = isp.segments.find((s) => s.kind === 'rental-pickup')!;
    expect(ispRental.hours).toBeLessThan(lgaRental.hours);
    const lgaFlight = lga.segments.find((s) => s.kind === 'flight')!;
    const ispFlight = isp.segments.find((s) => s.kind === 'flight')!;
    expect(ispFlight.hours).toBeGreaterThan(lgaFlight.hours);
    expect(isp.oneWayHours).toBeGreaterThan(0);
  });
});

describe('SW-1 / SW-4 / SW-6 — last-minute fares with Companion Pass', () => {
  it('two travelers pay for one round-trip ticket (Companion Pass)', () => {
    const option = computeSouthwestOption({ travelers: 2, companionPass: true });
    expect(option.cost.payingTravelers).toBe(1);
    expect(option.cost.companionPassApplied).toBe(true);
    expect(option.cost.lowUsd).toBeCloseTo(lastMinuteFareSnapshot.oneWayUsdLow * 2, 2);
    expect(option.cost.highUsd).toBeCloseTo(lastMinuteFareSnapshot.oneWayUsdHigh * 2, 2);
  });

  it('without the pass, both travelers pay', () => {
    const option = computeSouthwestOption({ travelers: 2, companionPass: false });
    expect(option.cost.payingTravelers).toBe(2);
    expect(option.cost.lowUsd).toBeCloseTo(lastMinuteFareSnapshot.oneWayUsdLow * 4, 2);
  });

  it('fares are labeled last-minute estimates from the timestamped snapshot (SW-1 / OQ-7 / ACC-5)', () => {
    const option = computeSouthwestOption();
    expect(option.cost.isEstimate).toBe(true);
    expect(option.cost.note).toContain(lastMinuteFareSnapshot.asOf);
  });
});
