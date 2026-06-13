import type { TripModel, Direction } from '../model';
import type { WeatherState } from '../useWeather';
import { Card, SectionTitle } from './common';
import { VehicleRender } from './VehicleRender';
import { JourneyMap } from './JourneyMap';
import { Timeline } from './Timeline';
import { ChargingStrategy } from './ChargingStrategy';
import { WeatherStrip } from './WeatherStrip';
import { MetricsBar } from './MetricsBar';
import { TollEstimator } from './TollEstimator';

/** EV6 / Sportage driving view — journey map, timeline scrubber, metrics, strategy/weather. */
export function DrivingView({
  vehicle,
  model,
  avgSpeedMph,
  weather,
  departureDate,
  onDateChange,
  direction,
  onDirection,
  scrubMile,
  onScrub,
  onSelectStop,
}: {
  vehicle: 'ev6' | 'sportage';
  model: TripModel;
  avgSpeedMph: number;
  weather: WeatherState;
  departureDate: string;
  onDateChange: (d: string) => void;
  direction: Direction;
  onDirection: (d: Direction) => void;
  scrubMile: number;
  onScrub: (m: number) => void;
  onSelectStop: (id: string, kind: string) => void;
}) {
  const branch = vehicle === 'ev6' ? model.ev6 : model.sportage;
  const journey = branch.journeys[direction];
  const option = model.comparison.find((o) => o.key === vehicle)!;

  return (
    <div className="swap" key={vehicle} style={{ display: 'grid', gap: 16 }}>
      {/* Render + metrics + direction */}
      <Card>
        <div className="grid-render">
          <VehicleRender vehicle={vehicle} />
          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="toggle glass" role="tablist" aria-label="Direction">
                {(['outbound', 'return'] as Direction[]).map((d) => (
                  <button key={d} className={direction === d ? 'on' : ''} onClick={() => onDirection(d)} role="tab" aria-selected={direction === d}>
                    {d === 'outbound' ? 'Outbound →' : '← Return'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--ink-dim)' }}>
                {journey.startLabel} → {journey.endLabel}
              </span>
            </div>
            <MetricsBar option={option} />
          </div>
        </div>
      </Card>

      <div className="grid-main">
        {/* Map + timeline */}
        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            <SectionTitle hint={`${journey.totalMiles} mi one way · both directions (FR-6)`}>Journey — {journey.startLabel} to {journey.endLabel}</SectionTitle>
            <JourneyMap journey={journey} direction={direction} scrubMile={scrubMile} onSelectStop={onSelectStop} />
          </Card>
          <Card>
            <SectionTitle hint="drag to scrub (FR-12)">Trip timeline</SectionTitle>
            <Timeline
              journey={journey}
              mode={vehicle}
              avgSpeedMph={avgSpeedMph}
              scrubMile={scrubMile}
              onScrub={onScrub}
              onSelectStop={onSelectStop}
            />
          </Card>
        </div>

        {/* Side panel */}
        <div style={{ display: 'grid', gap: 16 }}>
          <Card>
            {vehicle === 'ev6' ? (
              <ChargingStrategy strategy={model.ev6.strategy} plan={model.ev6.plan} direction={direction} />
            ) : (
              <SportageNotes plan={model.sportage.plan} />
            )}
          </Card>
          <Card>
            <TollEstimator />
          </Card>
          <Card>
            <WeatherStrip weather={weather} departureDate={departureDate} onDateChange={onDateChange} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function SportageNotes({ plan }: { plan: TripModel['sportage']['plan'] }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SectionTitle hint="DR-2 / OQ-10">Hybrid stops — coffee only</SectionTitle>
      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-dim)', lineHeight: 1.5 }}>
        The Sportage view shows <strong>no charging or gas stations</strong> — only the best coffee shops on the route,
        rated <strong>4.9★ and above</strong> on Google at verification time (DR-2). Refueling time and fuel cost are
        still counted (OQ-10), but a gas station is never drawn as a stop.
      </p>
      <div className="glass" style={{ padding: 12, borderRadius: 12, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13 }}>
        <Fact label="Coffee stops / way" value={`${plan.timeline.outbound.length}`} />
        <Fact label="Refuels / way" value={`${plan.refueling.stopsPerDirection}`} />
        <Fact label="Refuel time (RT)" value={`${plan.refueling.totalMinutes} min`} />
        <Fact label="Fuel (RT)" value={`${plan.fuel.gallonsRoundTrip} gal`} />
      </div>
      <p style={{ margin: 0, fontSize: 11.5, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
        Honest coverage gap (ACC-3): no shop east of Allentown, PA could be verified at ≥4.9★, so none is shown there —
        rather than inventing one.
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
