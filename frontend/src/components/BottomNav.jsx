import { Link, useLocation } from 'react-router-dom';

const I = (d) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const ITEMS = [
  { to: '/', label: 'Hangar', match: (p) => p === '/', icon: I(<><path d="M3 20V9l9-5 9 5v11" /><path d="M8 20v-6h8v6" /></>) },
  { to: '/progres', label: 'Progres', match: (p) => p.startsWith('/progres') || p.startsWith('/kit'), icon: I(<><path d="M5 20V11M12 20V4M19 20v-6" /></>) },
  { to: '/log', label: 'Build Log', match: (p) => p.startsWith('/log'), icon: I(<><path d="M5 4h11l3 3v13H5z" /><path d="M9 11h6M9 15h6" /></>) },
  { to: '/tambah', label: 'Tambah', match: (p) => p.startsWith('/tambah'), icon: I(<><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>) },
  { to: '/profil', label: 'Profil', match: (p) => p.startsWith('/profil'), icon: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>) },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="nav" aria-label="Navigasi utama">
      {ITEMS.map((it) => (
        <Link key={it.to} to={it.to} className={it.match(pathname) ? 'active' : ''} aria-current={it.match(pathname) ? 'page' : undefined}>
          {it.icon}
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}
