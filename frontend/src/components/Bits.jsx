import { CORE_PARTS, PLACEHOLDER, STATUS } from '../util.js';

// Bar 6 segmen: satu segmen = satu tahap perakitan.
export function Segments({ done, status, total = CORE_PARTS.length }) {
  return (
    <div className={`segs ${STATUS[status].cls}`} role="img" aria-label={`${done} dari ${total} tahap utama selesai`}>
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < done ? 'on' : ''} />)}
    </div>
  );
}

export function Badge({ status }) {
  const s = STATUS[status] || STATUS.Backlog;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function KitImg({ src, alt = '', className = '' }) {
  return (
    <img
      className={className}
      src={src || PLACEHOLDER}
      alt={alt}
      loading="lazy"
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
    />
  );
}

// Menampilkan seluruh foto tanpa terpotong (object-fit: contain). Sisa ruang diisi
// versi blur dari foto yang sama, jadi foto vertikal maupun horizontal tetap pas.
export function FitImg({ src, alt = '', className = '' }) {
  const url = (src || PLACEHOLDER).replace(/"/g, '%22');
  return (
    <span className={`fit ${className}`} style={{ '--img': `url("${url}")` }}>
      <KitImg src={src} alt={alt} />
    </span>
  );
}

export function State({ loading, error, children }) {
  if (loading) return <p className="state">Memuat…</p>;
  if (error) return <p className="state error">{error}</p>;
  return children;
}
