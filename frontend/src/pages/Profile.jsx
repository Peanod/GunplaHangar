import { useKits } from '../hooks/useKits.js';

export default function Profile() {
  const { data: kits, error } = useKits();
  const count = (s) => kits?.filter((k) => k.status === s).length ?? '-';

  return (
    <>
      <header className="top"><h1>Profil</h1></header>
      <div className="narrow">
      <section className="me">
        <div className="avatar" aria-hidden="true">F</div>
        <div>
          <strong>Finodi</strong>
          <small>NIM 2112012414013</small>
          <small>Teknik Komputer UNDIP • PPB 2026</small>
        </div>
      </section>
      <h2>Statistik hangar</h2>
      {error && <p className="state error">{error}</p>}
      <div className="stats">
        <div><b>{kits?.length ?? '-'}</b><span>Total</span></div>
        <div><b>{count('Backlog')}</b><span>Backlog</span></div>
        <div><b>{count('On Progress')}</b><span>WIP</span></div>
        <div><b>{count('Completed')}</b><span>Done</span></div>
      </div>
      <h2>Tentang aplikasi</h2>
      <p className="notes">GunplaHangar v1.0 adalah Website untuk mengkatalog koleksi model kit dan melacak progres perakitannya lewat 4 tahap utama dan finishing opsional, dibangun dengan React + Vite dan REST API Express + Supabase.</p>
      </div>
    </>
  );
}
