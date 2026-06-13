/**
 * Adjustable efficiency model (FR-16) with EPA-derived, highway-adjusted
 * defaults (OQ-6, adopted per docs/DECISIONS.md). Pure data + helpers; the UI
 * binds these to editable inputs and recomputes plans/costs/times on change.
 *
 * Every default here is an ESTIMATE and must be labeled as such in the UI
 * with its assumption visible (ACC-5).
 */

export interface EfficiencyDefault {
  value: number;
  unit: string;
  /** OQ-6 documentation: where the default comes from. */
  note: string;
  isEstimate: true;
}

/** 2023 Kia EV6 GT-Line AWD (the client's car, VIN KNDC4DLC2P5098444). */
export const EV6 = {
  /** Usable battery capacity, kWh (Kia long-range pack spec). */
  batteryKwh: 77.4,
  /**
   * Default real-world efficiency. EPA highway for the 2023 EV6 GT-Line AWD
   * (20" wheels) is ~96 MPGe ≈ 2.85 mi/kWh (96 / 33.7 kWh-per-gallon-equiv);
   * adjusted conservatively to 2.7 mi/kWh for sustained 70–75 mph interstate
   * driving with climate load (75-mph instrumented tests of the EV6 AWD
   * report ~2.5–2.7 mi/kWh). Editable per FR-16.
   */
  miPerKwh: {
    value: 2.7,
    unit: 'mi/kWh',
    note: 'EPA highway ~96 MPGe (≈2.85 mi/kWh) for the 2023 EV6 GT-Line AWD, adjusted conservatively to 2.7 for 70–75 mph interstate driving. Editable (FR-16).',
    isEstimate: true,
  } as EfficiencyDefault,
  /**
   * Average DC fast-charge power across a 20→80% session, kW. The EV6's
   * 800-V pack peaks ~235 kW on a 350 kW dispenser but tapers; observed
   * 20→80 sessions average ~160–180 kW (≈18 min). 170 kW is the central
   * estimate; editable.
   */
  avgDcChargePowerKw: {
    value: 170,
    unit: 'kW',
    note: 'EV6 800-V peak ~235 kW with taper; 20→80% sessions on 350 kW hardware average ~160–180 kW. 170 kW central estimate.',
    isEstimate: true,
  } as EfficiencyDefault,
  /** Per-stop overhead (exit, plug in, authenticate, re-enter highway), min. */
  perStopOverheadMin: 5,
} as const;

/** 2023 Kia Sportage Hybrid (non-plug-in), Dark Matte Gray. */
export const SPORTAGE = {
  /**
   * Default real-world fuel economy. EPA for the 2023 Sportage Hybrid is
   * 43 MPG combined (FWD) / 38 MPG (AWD); using the AWD figure adjusted
   * conservatively to 36 MPG for sustained interstate speeds. Editable per
   * FR-16.
   */
  mpg: {
    value: 36,
    unit: 'MPG',
    note: 'EPA 38 MPG (2023 Sportage Hybrid AWD; FWD rates 43), adjusted conservatively to 36 for 70–75 mph interstate driving. Editable (FR-16).',
    isEstimate: true,
  } as EfficiencyDefault,
  /** Fuel tank capacity, gallons (Kia spec). */
  tankGallons: 13.7,
  /** Refuel when this much is left in the tank, gallons. */
  reserveGallons: 2,
  /** Minutes per gas stop (OQ-10: time counts; stations are never rendered). */
  refuelMinutes: 10,
} as const;

/** Full EV range in miles at a given efficiency. */
export function fullRangeMiles(miPerKwh: number, batteryKwh: number = EV6.batteryKwh): number {
  return miPerKwh * batteryKwh;
}

/** Battery percent consumed per mile at a given efficiency. */
export function pctPerMile(miPerKwh: number, batteryKwh: number = EV6.batteryKwh): number {
  return 100 / fullRangeMiles(miPerKwh, batteryKwh);
}
