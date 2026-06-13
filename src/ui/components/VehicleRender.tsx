import ev6Img from '../../assets/ev6.png';
import sportageImg from '../../assets/sportage.png';

/** Accurate 3D-style vehicle render (FR-8). */
export function VehicleRender({ vehicle }: { vehicle: 'ev6' | 'sportage' }) {
  const isEv6 = vehicle === 'ev6';
  const spec = isEv6
    ? {
        img: ev6Img,
        name: '2023 Kia EV6 GT-Line',
        color: 'Pearl White',
        line: 'AWD · 77.4 kWh · VIN KNDC4DLC2P5098444 · 81,000 mi',
        swatch: 'linear-gradient(135deg, #ffffff, #dfe6f3)',
      }
    : {
        img: sportageImg,
        name: '2023 Kia Sportage Hybrid',
        color: 'Dark Matte Gray',
        line: 'Hybrid (non-plug-in) · 13.7 gal · 49,000 mi',
        swatch: 'linear-gradient(135deg, #4a4f57, #2c3036)',
      };

  return (
    <div className="swap" key={vehicle} style={{ display: 'grid', gap: 10 }}>
      <div
        style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'radial-gradient(120% 90% at 50% 10%, rgba(110,168,255,0.12), rgba(7,10,18,0) 60%)',
        }}
      >
        <img
          src={spec.img}
          alt={`${spec.color} ${spec.name} — 3D-style render`}
          style={{ width: '100%', display: 'block', filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.6))' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          aria-hidden
          style={{ width: 26, height: 26, borderRadius: 8, background: spec.swatch, border: '1px solid var(--glass-border)', flex: '0 0 auto' }}
        />
        <div>
          <div style={{ fontWeight: 700 }}>
            {spec.name} <span style={{ color: 'var(--ink-dim)', fontWeight: 500 }}>· {spec.color}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{spec.line}</div>
        </div>
      </div>
    </div>
  );
}
