import { useEffect, useState } from 'react';
import { KitImg } from './Bits.jsx';
import { fmtDate, kitTitle } from '../util.js';
import './QueueCard.css';

const LABEL = { pending: 'Pending', uploading: 'Uploading', failed: 'Gagal' };

function useFileUrl(file) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!file) { setUrl(''); return undefined; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

// Satu item antrean: kit baru atau catatan baru yang belum terkirim ke server
export default function QueueCard({ item, onRetry, onDiscard }) {
  const { type, payload, meta = {}, status, error } = item;
  const isKit = type === 'kit';
  const preview = useFileUrl(item.file) || payload.image_url;

  const title = isKit
    ? kitTitle({ name: payload.name, grades: meta.grade_name ? { name: meta.grade_name } : null })
    : payload.title;
  const sub = isKit
    ? [payload.series, meta.grade_scale].filter(Boolean).join(' • ')
    : `${meta.kit_name || 'Kit'}${payload.work_date ? ` • ${fmtDate(payload.work_date)}` : ''}`;

  const note =
    status === 'uploading' ? 'Mengirim ke server…'
    : status === 'failed' ? error || 'Gagal dikirim'
    : navigator.onLine ? 'Menunggu giliran dikirim…'
    : 'Offline. Akan dikirim otomatis saat online.';

  return (
    <li>
      <div className={`card qcard ${status}`}>
        {isKit && <KitImg src={preview} alt="" className="thumb" />}
        <div className="grow">
          <strong>{title}</strong>
          {sub && <small>{sub}</small>}
          <small className="qnote" role="status">{note}</small>
          {status === 'uploading' && <span className="qbar" aria-hidden="true" />}
          {status !== 'uploading' && (
            <div className="qactions">
              {status === 'failed' && (
                <button type="button" className="linklike" onClick={() => onRetry(item.id)}>Coba lagi</button>
              )}
              <button type="button" className="linklike" onClick={() => onDiscard(item.id)}>Hapus</button>
            </div>
          )}
        </div>
        <span className={`badge qb ${status}`}>{LABEL[status]}</span>
      </div>
    </li>
  );
}
