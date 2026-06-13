import type { CSSProperties, ReactNode } from 'react';

/** ACC-5 estimate badge — the assumption is one hover away (title) and can be expanded. */
export function EstBadge({ note }: { note: string }) {
  return (
    <span className="badge est" title={note} aria-label={`Estimate: ${note}`}>
      ⓘ est.
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent ?? 'var(--ink)', lineHeight: 1.1, marginTop: 3 }}>
        {value}
      </div>
      {sub != null && <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Card({
  children,
  style,
  strong,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={`glass ${strong ? 'glass-strong' : ''} ${className ?? ''}`} style={{ padding: 18, ...style }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
      <h3 style={{ fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-dim)' }}>
        {children}
      </h3>
      {hint != null && <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{hint}</span>}
    </div>
  );
}

export const STOP_STYLE: Record<string, { color: string; glyph: string; label: string }> = {
  origin: { color: '#9fc0ff', glyph: '◉', label: 'Start' },
  charge: { color: '#57e6c3', glyph: '⚡', label: 'DC fast charge' },
  coffee: { color: '#e8b27a', glyph: '☕', label: 'Coffee (4.9★+)' },
  hotel: { color: '#c79bff', glyph: '🛏', label: 'Hotel' },
  dest: { color: '#ff9f7a', glyph: '⚑', label: 'Destination' },
};
