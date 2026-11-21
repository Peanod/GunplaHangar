import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useKits } from '../hooks/useKits.js';
import { Badge, KitImg, Segments, State } from '../components/Bits.jsx';
import { cardImage, derive, kitTitle } from '../util.js';

const FILTERS = [
  ['all', 'Semua'], ['Backlog', 'Backlog'], ['On Progress', 'WIP'], ['Completed', 'Done'],
];
const CLS = (s) => (s === 'Completed' ? 'done' : s === 'On Progress' ? 'wip' : 'backlog');

export default function Progress() {
  const { data: kits, loading, error } = useKits();
  const [filter, setFilter] = useState('all');
  const shown = (kits || []).filter((k) => filter === 'all' || k.status === filter);

  return (
    <>
      <header className="top"><h1>Progres rakit</h1></header>
      <div className="pills" role="tablist">
        {FILTERS.map(([v, l]) => (
          <button key={v} className={filter === v ? 'on' : ''} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      <State loading={loading} error={error}>
        {kits?.length === 0 ? (
          <p className="state">Belum ada kit. <Link to="/tambah">Tambah kit pertamamu</Link>.</p>
        ) : shown.length === 0 ? (
          <p className="state">Tidak ada kit dengan status ini.</p>
        ) : (
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
                    <Badge status={k.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </State>
    </>
  );
}
