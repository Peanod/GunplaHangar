import { Link } from 'react-router-dom';
import { useKits } from '../hooks/useKits.js';
import { FitImg, State } from '../components/Bits.jsx';
import { fmtDate, kitTitle, normPhoto, photoEntries } from '../util.js';

export default function Hangar() {
  const { data: kits, loading, error } = useKits();

  // Hasil jadi: kit rampung yang punya foto akhir, terbaru dulu
  const results = (kits || [])
    .filter((k) => k.status === 'Completed' && normPhoto(k.progress_photos?.final))
    .sort((a, b) => (normPhoto(b.progress_photos.final).at || '').localeCompare(normPhoto(a.progress_photos.final).at || ''));

  // Riwayat: semua foto progres per tahap (tanpa foto akhir), terbaru dulu
  const history = (kits || [])
    .flatMap((k) => photoEntries(k.progress_photos).filter((p) => p.key !== 'final').map((p) => ({ ...p, kit: k })))
    .sort((a, b) => (b.at || '').localeCompare(a.at || '') || a.kit.id - b.kit.id);

  return (
    <>
      <header className="top"><h1>GunplaHangar</h1></header>
      <State loading={loading} error={error}>
        <section aria-labelledby="hj">
          <h2 id="hj">Hasil jadi</h2>
          {results.length === 0 ? (
            <p className="empty">
              Belum ada hasil jadi. Selesaikan 4 tahap utama sebuah kit, lalu unggah foto akhirnya di{' '}
              <Link to="/progres">halaman Progres</Link>.
            </p>
          ) : (
            <ul className="results">
              {results.map((k, i) => {
                const f = normPhoto(k.progress_photos.final);
                return (
                  <li key={k.id} className={`result ${i === 0 ? 'feature' : ''}`}>
                    <Link to={`/kit/${k.id}`}>
                      <FitImg src={f.url} alt={`Hasil akhir ${k.name}`} className="result-img" />
                      <span className="cap">
                        <strong>{kitTitle(k)}</strong>
                        <small>{[k.series, k.grades?.scale].filter(Boolean).join(' • ')}</small>
                        {f.at && <small>Rampung {fmtDate(f.at)}</small>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="rp">
          <h2 id="rp">Riwayat progres</h2>
          {history.length === 0 ? (
            <p className="empty">
              Belum ada foto progres. Tambahkan dari halaman detail kit di <Link to="/progres">Progres</Link>.
            </p>
          ) : (
            <ul className="history">
              {history.map((p) => (
                <li key={`${p.kit.id}-${p.id}`}>
                  <Link to={`/kit/${p.kit.id}`}>
                    <FitImg src={p.url} alt={`${p.label} ${p.kit.name}`} className="h-img" />
                    <strong>{p.kit.name}</strong>
                    <small>{p.label}{p.at ? ` • ${fmtDate(p.at)}` : ''}</small>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </State>
    </>
  );
}
