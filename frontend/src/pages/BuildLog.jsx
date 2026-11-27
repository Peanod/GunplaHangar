import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLogs } from '../hooks/useLogs.js';
import { useOutbox } from '../outbox.js';
import QueueCard from '../components/QueueCard.jsx';
import { State } from '../components/Bits.jsx';
import { fmtDate, photoEntries } from '../util.js';

export default function BuildLog() {
  const { data: logs, loading, error, refetch } = useLogs();
  const { items, tick, syncNow, retry, discard } = useOutbox();
  const queued = items.filter((q) => q.type === 'log');

  useEffect(() => { if (tick > 0) refetch(); }, [tick, refetch]);

  return (
    <>
      <header className="top"><h1>Jurnal perakitan</h1></header>

      {queued.length > 0 && (
        <section aria-labelledby="antrean-log">
          <div className="qhead">
            <h2 id="antrean-log">Menunggu dikirim ({queued.length})</h2>
            {queued.some((q) => q.status === 'pending') && (
              <button type="button" className="linklike" onClick={syncNow}>Kirim sekarang</button>
            )}
          </div>
          <ul className="list">
            {queued.map((q) => <QueueCard key={q.id} item={q} onRetry={retry} onDiscard={discard} />)}
          </ul>
        </section>
      )}

      <State loading={loading} error={error}>
        {logs?.length === 0 ? (
          queued.length === 0 && <p className="state">Belum ada catatan. <Link to="/tambah">Tulis catatan pertamamu</Link>.</p>
        ) : (
          <>
            {queued.length > 0 && <h2>Tersimpan</h2>}
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
          </>
        )}
      </State>
    </>
  );
}
