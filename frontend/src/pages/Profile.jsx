import { useEffect, useState } from 'react';
import './Profile.css';
import { isInstalled, promptInstall, subscribe } from '../pwaInstall.js';
import * as kitHooks from '../hooks/useKits';

// useKits bisa diekspor named atau default; dua-duanya ditangani.
const useKits = kitHooks.useKits ?? kitHooks.default;

// ====== DATA DIRI ======
const PROFILE = {
  name: 'Finodi',
  nim: '2112012414013',
  campus: 'Teknik Komputer UNDIP · PPB 2026',
  repo: 'https://github.com/Peanod/GunplaHangar',
  demo: 'https://gunpla-hangar-tau.vercel.app',
};

const ABOUT_TEXT =
  'GunplaHangar v1.0 adalah website untuk mengkatalog koleksi model kit dan melacak progres perakitannya lewat 4 tahap utama dan finishing opsional, dibangun dengan React + Vite dan REST API Express + Supabase.';

const icon = {
  box: <path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.5L12 12.3l8.7-4.8M12 12.3V21" />,
  gauge: <path d="M12 14l4-5M3.5 18a9.5 9.5 0 1117 0" />,
  camera: <path d="M4 8h3l2-3h6l2 3h3v11H4V8zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />,
  phone: <path d="M8 2h8a1 1 0 011 1v18a1 1 0 01-1 1H8a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2" />,
};

const FEATURES = [
  { icon: 'box', c: 'var(--cyan)', title: 'Katalog model kit', desc: 'Simpan koleksi Gundam lengkap dengan grade, foto, dan status perakitan.' },
  { icon: 'gauge', c: 'var(--orange)', title: 'Pelacak progres', desc: 'Centang 4 tahap utama, progres terhitung otomatis dari 0 sampai 100%.' },
  { icon: 'camera', c: 'var(--green)', title: 'Foto progres & hasil akhir', desc: 'Unggah foto di tiap tahap, lalu pajang hasil jadi di halaman Hangar.' },
  { icon: 'phone', c: 'var(--slate)', title: 'Pasang di HP', desc: 'Berjalan sebagai PWA: bisa di-install ke layar utama dan dibuka offline.' },
];

const TECH = [
  { title: 'React 19 + Vite', desc: 'Antarmuka SPA berbasis komponen', tag: 'Frontend', c: 'var(--cyan)' },
  { title: 'React Router', desc: 'Navigasi antar halaman & detail', tag: 'Frontend', c: 'var(--cyan)' },
  { title: 'Axios', desc: 'Konsumsi REST API', tag: 'Frontend', c: 'var(--cyan)' },
  { title: 'vite-plugin-pwa (Workbox)', desc: 'Service worker, manifest, offline', tag: 'PWA', c: 'var(--orange)' },
  { title: 'Express + Supabase', desc: 'Web service sendiri (Modul 1)', tag: 'Backend', c: 'var(--green)' },
];

// Hitung statistik dari daftar kit (status: Backlog / On Progress / Completed)
function useStats() {
  const res = useKits ? useKits() : null;
  const raw = Array.isArray(res) ? res : res?.kits ?? res?.data ?? [];
  const kits = Array.isArray(raw) ? raw : [];
  const has = (k, word) => String(k.status ?? '').toLowerCase().includes(word);
  return {
    total: kits.length,
    backlog: kits.filter((k) => has(k, 'backlog')).length,
    wip: kits.filter((k) => has(k, 'progress')).length,
    done: kits.filter((k) => has(k, 'complete')).length,
  };
}


// Tombol Install memakai tawaran install browser yang ditangkap di pwaInstall.js
const HINT = 'Buka menu browser lalu pilih "Install app" atau "Add to Home Screen".';

function useInstall() {
  const [, refresh] = useState(0);
  const [hint, setHint] = useState('');

  useEffect(() => subscribe(() => refresh((n) => n + 1)), []);

  const install = async () => {
    setHint('');
    const result = await promptInstall();
    if (result === 'unavailable' || result === 'error') setHint(HINT);
  };

  return { install, installed: isInstalled(), hint };
}

export default function Profile() {
  const s = useStats();
  const { install, installed, hint } = useInstall();
  const stats = [
    { n: s.total, label: 'Total', c: 'var(--cyan)' },
    { n: s.backlog, label: 'Backlog', c: 'var(--slate)' },
    { n: s.wip, label: 'WIP', c: 'var(--orange)' },
    { n: s.done, label: 'Done', c: 'var(--green)' },
  ];

  return (
    <main className="page profile">
      <h1 className="page-title">Profil</h1>

      <div className="id-card">
        <div className="avatar" aria-hidden="true">{PROFILE.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{PROFILE.name}</h2>
          <p>NIM {PROFILE.nim}</p>
          <p>{PROFILE.campus}</p>
        </div>
        <div className="id-meta">
          <span className="chip">Tugas Akhir</span>
          <span className="chip">Gunpla Builder</span>
        </div>
      </div>

      <section className="section">
        <h3>Statistik hangar</h3>
        <div className="stats">
          {stats.map((x) => (
            <div className="stat" key={x.label} style={{ '--c': x.c }}>
              <b>{x.n}</b>
              <span>{x.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h3>Tentang aplikasi</h3>
        <p className="lead">{ABOUT_TEXT}</p>
      </section>

      <div className="cols">
        <section className="section">
          <h3>Fitur</h3>
          <div className="list">
            {FEATURES.map((f) => (
              <div className="card card-row" key={f.title} style={{ '--c': f.c }}>
                <div className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {icon[f.icon]}
                  </svg>
                </div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h3>Teknologi</h3>
          <div className="list">
            {TECH.map((t) => (
              <div className="card has-tag" key={t.title} style={{ '--c': t.c }}>
                <span className="tag">{t.tag}</span>
                <h4>{t.title}</h4>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="section">
        <h3>Tautan</h3>
        <div className="links">
          {!installed && (
            <button type="button" className="profile-btn solid" onClick={install}>Install</button>
          )}
          <a className="profile-btn" href={PROFILE.repo} target="_blank" rel="noreferrer">Repository GitHub</a>
          {hint && <p className="install-hint">{hint}</p>}
        </div>
      </section>
    </main>
  );
}
