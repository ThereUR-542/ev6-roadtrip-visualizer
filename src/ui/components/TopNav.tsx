import type { Mode } from '../model';

const MODES: { key: Mode; label: string; glyph: string }[] = [
  { key: 'ev6', label: 'EV6', glyph: '⚡' },
  { key: 'sportage', label: 'Sportage Hybrid', glyph: '🛢' },
  { key: 'southwest', label: 'Southwest Air', glyph: '✈️' },
];

/** Three-mode top-level navigation (FR-1, FR-4). */
export function TopNav({
  mode,
  onMode,
  onOpenSettings,
  onOpenChecklist,
  onExportPdf,
  onOpenReleaseNotes,
}: {
  mode: Mode;
  onMode: (m: Mode) => void;
  onOpenSettings: () => void;
  onOpenChecklist: () => void;
  onExportPdf: () => void;
  onOpenReleaseNotes: () => void;
}) {
  return (
    <header
      className="glass glass-strong"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        margin: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        borderRadius: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 'auto' }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(180deg, #6ea8ff, #57e6c3)',
            color: '#06101f',
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          ⚡
        </div>
        <div>
          <div style={{ fontWeight: 750, fontSize: 15, lineHeight: 1.05 }}>Pearl White EV6</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Jenks, OK ⇄ Calverton, NY · round trip</div>
        </div>
      </div>

      <nav className="toggle glass" role="tablist" aria-label="Travel mode" style={{ padding: 5 }}>
        {MODES.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            className={`nav-pill ${mode === m.key ? 'active' : ''}`}
            onClick={() => onMode(m.key)}
          >
            <span aria-hidden style={{ marginRight: 6 }}>{m.glyph}</span>
            {m.label}
          </button>
        ))}
      </nav>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          className="nav-pill"
          onClick={onOpenSettings}
          title="Editable efficiency & price inputs (FR-16, OQ-2)"
          style={{ border: '1px solid var(--glass-border)' }}
        >
          ⚙ Inputs
        </button>
        <button
          className="nav-pill"
          onClick={onOpenChecklist}
          title="Pre-trip checklist and packing list (FR-17)"
          style={{ border: '1px solid var(--glass-border)' }}
        >
          📋 Checklist
        </button>
        <button
          className="nav-pill"
          onClick={onExportPdf}
          title="Export current mode as PDF (FR-15)"
          style={{ border: '1px solid var(--glass-border)' }}
        >
          ↗ Export PDF
        </button>
        <button
          className="nav-pill"
          onClick={onOpenReleaseNotes}
          title="OQ defaults adopted — release notes"
          style={{ border: '1px solid var(--glass-border)' }}
        >
          📖 Notes
        </button>
      </div>
    </header>
  );
}
