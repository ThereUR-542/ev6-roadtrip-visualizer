/**
 * Pearl White EV6 Road Trip Visualizer — Phase 4.
 *
 * Phase 4 additions over Phase 3:
 *   FR-15  PDF export (PrintContent + triggerPrint via window.print())
 *   FR-17  Pre-trip checklist/packing list (Checklist modal, per vehicle)
 *   FR-18  Toll estimator surfaced in running costs (TollEstimator in DrivingView)
 *   NFR-3  Transitions/responsiveness polish
 *   OQ defaults release notes (ReleaseNotes modal)
 */
import { useMemo, useState } from 'react';
import { buildTripModel, defaultSettings, type Direction, type Mode, type Settings } from './ui/model';
import { todayIso } from './ui/format';
import { useWeather } from './ui/useWeather';
import { TopNav } from './ui/components/TopNav';
import { DrivingView } from './ui/components/DrivingView';
import { SouthwestView } from './ui/components/SouthwestView';
import { SettingsPanel } from './ui/components/SettingsPanel';
import { StopModal } from './ui/components/StopModal';
import { Checklist } from './ui/components/Checklist';
import { ReleaseNotes } from './ui/components/ReleaseNotes';
import { PrintContent, triggerPrint } from './ui/components/PrintExport';

export default function App() {
  const today = useMemo(() => todayIso(), []);
  const [settings, setSettings] = useState<Settings>(() => defaultSettings(today));
  const [mode, setMode] = useState<Mode>('ev6'); // FR-2: EV6 default
  const [direction, setDirection] = useState<Direction>('outbound');
  const [scrubMile, setScrubMile] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; kind: string } | null>(null);

  const model = useMemo(() => buildTripModel(settings), [settings]);
  const weather = useWeather(settings.departureDate);

  const patchSettings = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  const changeMode = (m: Mode) => {
    setMode(m);
    setScrubMile(0);
  };
  const changeDirection = (d: Direction) => {
    setDirection(d);
    setScrubMile(0);
  };

  return (
    <>
      {/* Main interactive app (hidden on print — FR-15) */}
      <div className="no-print" style={{ minHeight: '100vh', paddingBottom: 40 }}>
        <TopNav
          mode={mode}
          onMode={changeMode}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenChecklist={() => setChecklistOpen(true)}
          onExportPdf={triggerPrint}
          onOpenReleaseNotes={() => setReleaseNotesOpen(true)}
        />

        <main style={{ maxWidth: 1320, margin: '0 auto', padding: '6px 14px 0' }}>
          {mode === 'southwest' ? (
            <SouthwestView options={model.southwest} comparison={model.comparison} />
          ) : (
            <DrivingView
              vehicle={mode}
              model={model}
              avgSpeedMph={settings.avgSpeedMph}
              weather={weather}
              departureDate={settings.departureDate}
              onDateChange={(d) => patchSettings({ departureDate: d })}
              direction={direction}
              onDirection={changeDirection}
              scrubMile={scrubMile}
              onScrub={setScrubMile}
              onSelectStop={(id, kind) => setSelected({ id, kind })}
            />
          )}
        </main>

        {selected && <StopModal id={selected.id} kind={selected.kind} onClose={() => setSelected(null)} />}
        {settingsOpen && (
          <SettingsPanel
            settings={settings}
            onChange={patchSettings}
            onReset={() => setSettings(defaultSettings(today))}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {checklistOpen && <Checklist mode={mode} onClose={() => setChecklistOpen(false)} />}
        {releaseNotesOpen && <ReleaseNotes onClose={() => setReleaseNotesOpen(false)} />}
      </div>

      {/* Print-only view (FR-15): hidden in browser, shown on print/PDF export */}
      <PrintContent mode={mode} model={model} />
    </>
  );
}
