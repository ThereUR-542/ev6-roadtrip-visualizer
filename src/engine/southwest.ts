/**
 * Southwest Airlines time/cost math (SW-1..SW-4, SW-6; OQ-5, OQ-7). Pure
 * TypeScript over the Phase 1 dataset. Door-to-door for two travelers with
 * the Companion Pass (SW-4: one of the two tickets is effectively free).
 *
 * SW-2 component note: the timeline shows the 2-hour early arrival at TUL and
 * security as ordered events; security clears *within* the 2-hour buffer, so
 * door-to-door totals count the buffer once (no double counting).
 */

import {
  airportDrivesToSq4d,
  lastMinuteFareSnapshot,
  typicalItineraries,
} from '../data/southwest';
import type { FareSnapshot } from '../data/types';
import { round2 } from './costs';

export type DestinationAirport = 'LGA' | 'ISP';

export interface SouthwestSegment {
  kind:
    | 'drive-to-airport'
    | 'airport-buffer'
    | 'security'
    | 'flight'
    | 'baggage-claim'
    | 'rental-pickup'
    | 'drive-to-hq';
  label: string;
  hours: number;
  /** Segments whose hours are contained in another segment (security ⊂ buffer). */
  containedInBuffer?: boolean;
  note: string;
}

export interface SouthwestInputs {
  airport?: DestinationAirport;
  /** Jenks -> Tulsa International drive (estimate: ~17 mi across Tulsa). */
  driveToTulHours?: number;
  /** SW-2: arrive 2 hours early at TUL. */
  airportBufferHours?: number;
  /** Security time, displayed as a component inside the buffer (SW-2). */
  securityHours?: number;
  baggageClaimHours?: number;
  /** Default differs by airport: LGA rentals are off-airport via shuttle (OQ-5). */
  rentalPickupHours?: number;
  travelers?: number;
  /** SW-4: Companion Pass — one of two tickets free. */
  companionPass?: boolean;
  fare?: FareSnapshot;
}

export interface SouthwestOption {
  airport: DestinationAirport;
  preferred: boolean;
  segments: SouthwestSegment[];
  oneWayHours: number;
  /** Return mirrors the outbound structure (estimate). */
  roundTripHours: number;
  cost: {
    travelers: number;
    payingTravelers: number;
    companionPassApplied: boolean;
    /** Round trip, all travelers, after Companion Pass. */
    lowUsd: number;
    highUsd: number;
    note: string;
    isEstimate: true;
  };
  flightNote: string;
}

const RENTAL_DEFAULTS: Record<DestinationAirport, { hours: number; note: string }> = {
  LGA: {
    hours: 1.0,
    note: 'LGA rentals are off-airport in East Elmhurst via shuttle (~10–20 min each way) plus counter time (OQ-5; estimate).',
  },
  ISP: {
    hours: 0.5,
    note: 'ISP has an on-airport rental center at baggage claim — materially faster than LGA (OQ-5; estimate).',
  },
};

export function computeSouthwestOption(inputs: SouthwestInputs = {}): SouthwestOption {
  const airport = inputs.airport ?? 'LGA'; // SW-3: LGA preferred/default.
  const itinerary = typicalItineraries.find((i) => i.routePair === `TUL-${airport}`);
  const drive = airportDrivesToSq4d.find((d) => d.airport === airport);
  if (!itinerary || !drive) throw new Error(`no dataset coverage for airport ${airport}`);

  const fare = inputs.fare ?? lastMinuteFareSnapshot;
  const travelers = inputs.travelers ?? 2;
  const companionPass = inputs.companionPass ?? true;
  const bufferHours = inputs.airportBufferHours ?? 2.0;
  const securityHours = inputs.securityHours ?? 0.5;
  const rental = RENTAL_DEFAULTS[airport];

  const segments: SouthwestSegment[] = [
    {
      kind: 'drive-to-airport',
      label: 'Drive Jenks → Tulsa International (TUL)',
      hours: inputs.driveToTulHours ?? 0.35,
      note: 'Estimate: ~17 mi across Tulsa.',
    },
    {
      kind: 'airport-buffer',
      label: 'Arrive 2 hours before departure (SW-2)',
      hours: bufferHours,
      note: 'Check-in, bag drop and security all happen inside this window.',
    },
    {
      kind: 'security',
      label: 'TSA security',
      hours: securityHours,
      containedInBuffer: true,
      note: 'Shown as its own timeline event (SW-2); its time is part of the 2-hour buffer, not added again.',
    },
    {
      kind: 'flight',
      label: `Fly TUL → ${airport} (${itinerary.stops})`,
      hours: itinerary.totalTravelTimeHours,
      note: itinerary.note,
    },
    {
      kind: 'baggage-claim',
      label: 'Baggage claim',
      hours: inputs.baggageClaimHours ?? 0.5,
      note: 'Estimate; the material-samples limitation when flying is noted in the view (SW-5).',
    },
    {
      kind: 'rental-pickup',
      label: `Rental car pickup at ${airport}`,
      hours: inputs.rentalPickupHours ?? rental.hours,
      note: rental.note,
    },
    {
      kind: 'drive-to-hq',
      label: `Drive ${airport} → SQ4D HQ, Calverton (${drive.miles} mi)`,
      hours: drive.driveTimeHours,
      note: drive.note,
    },
  ];

  const oneWayHours = segments.reduce(
    (sum, s) => sum + (s.containedInBuffer ? 0 : s.hours),
    0,
  );

  const payingTravelers = companionPass ? Math.max(1, travelers - 1) : travelers;
  const lowUsd = round2(fare.oneWayUsdLow * 2 * payingTravelers);
  const highUsd = round2(fare.oneWayUsdHigh * 2 * payingTravelers);

  return {
    airport,
    preferred: airport === 'LGA',
    segments,
    oneWayHours: round2(oneWayHours),
    roundTripHours: round2(oneWayHours * 2),
    cost: {
      travelers,
      payingTravelers,
      companionPassApplied: companionPass && travelers > 1,
      lowUsd,
      highUsd,
      note:
        `Last-minute one-way fares $${fare.oneWayUsdLow}–$${fare.oneWayUsdHigh} (snapshot ${fare.asOf}, SW-1/OQ-7), ` +
        `round trip × ${payingTravelers} paying traveler(s)` +
        (companionPass && travelers > 1
          ? ` — Companion Pass makes the second ticket free (SW-4). Excludes rental cost and bag fees (no verified quote in the dataset).`
          : `. Excludes rental cost and bag fees (no verified quote in the dataset).`),
      isEstimate: true,
    },
    flightNote: itinerary.note,
  };
}

/** Both destination airports for the comparison dashboard (SW-3 / SW-6). */
export function computeSouthwestOptions(
  inputs: Omit<SouthwestInputs, 'airport'> = {},
): { lga: SouthwestOption; isp: SouthwestOption } {
  return {
    lga: computeSouthwestOption({ ...inputs, airport: 'LGA' }),
    isp: computeSouthwestOption({ ...inputs, airport: 'ISP' }),
  };
}
