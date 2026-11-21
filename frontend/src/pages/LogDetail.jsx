import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logService from '../services/logService.js';
import { useLogById } from '../hooks/useLogs.js';
import { FitImg, State } from '../components/Bits.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { fmtDate, photoEntries } from '../util.js';

export default function LogDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: log, loading, error } = useLogById(id);
  const [msg, setMsg] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { await logService.remove(id); nav('/log'); }
    catch (e) { setMsg(e.message); setConfirming(false); setBusy(false); }
  };

  return (
    <>
      <header className="top split">
        <Link to="/log" className="back">← Kembali</Link>
        <button className="danger" onClick={() => setConfirming(true)} disabled={!log}>Hapus</button>
      </header>
      <State loading={loading} error={error}>
        {log && (
          <div className="detail-grid">
            <div>
            <h1 className="title">{log.title}</h1>
            <dl className="facts">
              <dt>Unit terkait</dt><dd><Link to={`/kit/${log.kit_id}`}>{log.kits?.name}</Link></dd>
              <dt>Tanggal kerja</dt><dd>{fmtDate(log.work_date)}</dd>
              <dt>Teknik utama</dt><dd>{log.technique || '-'}</dd>
            </dl>
            <h2>Catatan pengerjaan</h2>
            <p className="notes">{log.notes || 'Tidak ada catatan.'}</p>
            {msg && <p className="msg error">{msg}</p>}
            </div>
            <div>

            <h2>Foto progres {log.kits?.name}</h2>
            {photoEntries(log.kits?.progress_photos).length === 0 ? (
              <p className="muted">
                Belum ada foto progres. Tambahkan dari <Link to={`/kit/${log.kit_id}`}>halaman detail kit</Link>.
              </p>
            ) : (
              <ul className="gallery">
                {photoEntries(log.kits.progress_photos).map((p) => (
                  <li key={p.id} className={p.key === 'final' ? 'final' : ''}>
                    <a href={p.url} target="_blank" rel="noreferrer">
                      <FitImg src={p.url} alt={`${p.label} ${log.kits.name}`} className="gal-img" />
                    </a>
                    <span>{p.label}</span>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </div>
        )}
      </State>
      <ConfirmModal
        open={confirming}
        title="Hapus catatan ini?"
        message="Catatan pengerjaan akan dihapus permanen."
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
