import { Link } from 'react-router-dom';
import { useLogs } from '../hooks/useLogs.js';
import { State } from '../components/Bits.jsx';
import { fmtDate, photoEntries } from '../util.js';

export default function BuildLog() {
  const { data: logs, loading, error } = useLogs();
  return (
    <>
      <header className="top"><h1>Jurnal perakitan</h1></header>
      <State loading={loading} error={error}>
        {logs?.length === 0 ? (
          <p className="state">Belum ada catatan. <Link to="/tambah">Tulis catatan pertamamu</Link>.</p>
        ) : (
          <ul className="list">
            {logs?.map((l) => (
              <li key={l.id}>
                <Link to={`/log/${l.id}`} className="card log">
                  <small>{fmtDate(l.work_date)} • <span className="tag">{l.kits?.name}</span></small>
                  <strong>{l.title}</strong>
                  {l.technique && <small>Teknik: {l.technique}</small>}
                  {photoEntries(l.kits?.progress_photos).length > 0 && (
                    <small>{photoEntries(l.kits.progress_photos).length} foto progres unit ini</small>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </State>
    </>
  );
}
