import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKits } from '../hooks/useKits.js';
import { useOutbox } from '../outbox.js';
import QueueCard from '../components/QueueCard.jsx';
import { Badge, KitImg, Segments, State } from '../components/Bits.jsx';
import { cardImage, derive, kitTitle } from '../util.js';

const FILTERS = [
  ['all', 'Semua'], ['Backlog', 'Backlog'], ['On Progress', 'WIP'], ['Completed', 'Done'],
];
const CLS = (s) => (s === 'Completed' ? 'done' : s === 'On Progress' ? 'wip' : 'backlog');

export default function Progress() {
  const { data: kits, loading, error, refetch } = useKits();
  const { items, tick, syncNow, retry, discard } = useOutbox();
  const [filter, setFilter] = useState('all');

  useEffect(() => { refetch(); }, [tick, items.length, refetch]);

  const queued = items.filter((q) => q.type === 'kit' || q.type === 'progress');
  const showQueue =
    queued.length > 0 &&
    (filter === 'all' || filter === 'Backlog' || queued.some((q) => q.type === 'progress'));
  const shown = (kits || []).filter((k) => filter === 'all' || k.status === filter);

  return (
    <>
      <header className="top"><h1>Progres rakit</h1></header>
      <div className="pills" role="tablist">
        {FILTERS.map(([v, l]) => (
          <button key={v} className={filter === v ? 'on' : ''} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {showQueue && (
        <section aria-labelledby="antrean">
          <div className="qhead">
            <h2 id="antrean">Menunggu dikirim ({queued.length})</h2>
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
        {kits?.length === 0 ? (
          queued.length === 0 && <p className="state">Belum ada kit. <Link to="/tambah">Tambah kit pertamamu</Link>.</p>
        ) : shown.length === 0 ? (
          <p className="state">Tidak ada kit dengan status ini.</p>
        ) : (
          <>
            {showQueue && <h2>Di hangar</h2>}
            <ul className="list">
              {shown.map((k) => {
                const { done } = derive(k);
                return (
                  <li key={k.id}>
                    <Link to={`/kit/${k.id}`} className={`card kit ${CLS(k.status)}`}>
                      <KitImg src={cardImage(k)} alt="" className="thumb" />
                      <div className="grow">
                        <strong>{kitTitle(k)}</strong>
                        <small>{[k.series, k.grades?.scale].filter(Boolean).join(' • ')}</small>
                        <div className="row">
                          <Segments done={done} status={k.status} />
                          <span className="pct">{k.progress}%</span>
                        </div>
                      </div>
                      <Badge status={k.status} syncStatus={k._syncStatus} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </State>
    </>
  );
}
