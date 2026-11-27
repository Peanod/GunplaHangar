import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import kitService from '../services/kitService.js';
import uploadService from '../services/uploadService.js';
import { enqueue, useOutbox } from '../outbox.js';
import QueueCard from '../components/QueueCard.jsx';
import { useKitById } from '../hooks/useKits.js';
import { Badge, FitImg, KitImg, Segments, State } from '../components/Bits.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { CORE_PARTS, EXTRA_PARTS, PARTS, cardImage, derive, kitTitle, normPhoto, normPhotos } from '../util.js';

export default function KitDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const goBack = () => (location.key !== 'default' ? nav(-1) : nav('/progres'));
  const { data: kit, loading, error, setData, refetch } = useKitById(id);
  const { items, tick, retry, discard } = useOutbox();
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState('');
  const [confirming, setConfirming] = useState(false);

  // Refresh data kit otomatis setelah antrean progres berhasil terkirim saat online
  useEffect(() => {
    if (tick > 0) refetch();
  }, [tick, refetch]);

  const pendingProgressItems = items.filter(
    (q) => q.type === 'progress' && String(q.meta?.kit_id) === String(id)
  );

  const toggle = (k) => { setData((cur) => ({ ...cur, [k]: !cur[k] })); setDirty(true); setMsg(''); };

  const save = async () => {
    setBusy(true);
    setMsg('');
    const body = {};
    PARTS.forEach(([k]) => { body[k] = !!kit[k]; });
    const dNext = derive(body);

    const queueProgress = async () => {
      await enqueue({
        type: 'progress',
        payload: body,
        meta: {
          kit_id: id,
          kit_name: kitTitle(kit),
          progress: dNext.progress,
          status: dNext.status,
        },
      });
      setData((cur) => ({
        ...cur,
        ...body,
        progress: dNext.progress,
        status: dNext.status,
        _syncStatus: 'pending',
      }));
      setDirty(false);
      setMsg('Offline: perubahan progres disimpan lokal (Pending) dan akan dikirim otomatis saat online.');
    };

    try {
      if (!navigator.onLine) {
        await queueProgress();
        setBusy(false);
        return;
      }
      const upd = await kitService.update(id, body);
      setData(upd);
      setDirty(false);
      setMsg(upd.status === 'Completed' && !upd.progress_photos?.final
        ? 'Progres tersimpan. Kit rampung, saatnya foto hasil akhir.'
        : 'Progres tersimpan.');
    } catch (e) {
      if (!e.status) {
        try {
          await queueProgress();
          setBusy(false);
          return;
        } catch { /* tampilkan error di bawah */ }
      }
      setMsg(e.message);
    }
    setBusy(false);
  };

  // Foto disimpan langsung (terpisah dari tombol simpan checklist)
  const sendPhotos = async (key, value, busyKey) => {
    setPhotoBusy(busyKey); setMsg('');
    try {
      const upd = await kitService.update(id, { progress_photos: { [key]: value } });
      setData((cur) => ({ ...cur, progress_photos: upd.progress_photos }));
    } catch (e) { setMsg(e.message); }
    setPhotoBusy('');
  };

  // Tahap: boleh menambah banyak foto sekaligus
  const addPhotos = async (key, files) => {
    if (!files?.length) return;
    setPhotoBusy(key); setMsg('');
    try {
      const urls = [];
      for (const f of files) urls.push((await uploadService.upload(f)).url);
      const list = [...normPhotos(kit.progress_photos?.[key]), ...urls.map((url) => ({ url, at: null }))];
      await sendPhotos(key, list, key);
    } catch (e) { setMsg(e.message); setPhotoBusy(''); }
  };
  const removePhoto = (key, idx) =>
    sendPhotos(key, normPhotos(kit.progress_photos?.[key]).filter((_, i) => i !== idx), key);

  // Foto hasil akhir: satu foto
  const setFinal = async (file) => {
    setPhotoBusy('final'); setMsg('');
    try {
      const url = file ? (await uploadService.upload(file)).url : null;
      await sendPhotos('final', url, 'final');
    } catch (e) { setMsg(e.message); setPhotoBusy(''); }
  };

  const remove = async () => {
    setBusy(true);
    try { await kitService.remove(id); nav('/progres'); }
    catch (e) { setMsg(e.message); setConfirming(false); setBusy(false); }
  };

  const d = kit ? derive(kit) : null;
  const photos = kit?.progress_photos || {};
  const urlOf = (k) => normPhoto(photos[k])?.url;

  const renderPart = ([k, name, desc], optional) => (
    <li key={k} className={`part ${kit[k] ? 'checked' : ''}`}>
      <label className="part-main">
        <input type="checkbox" checked={!!kit[k]} onChange={() => toggle(k)} />
        <span className="box" aria-hidden="true">{kit[k] ? '✓' : ''}</span>
        <span>
          <b>{name}{optional && <em className="opt">opsional</em>}</b>
          <small>{desc}</small>
        </span>
      </label>
      <div className="photo-row">
        {normPhotos(photos[k]).map((p, i) => (
          <span key={`${p.url}-${i}`} className="pthumb-wrap">
            <a href={p.url} target="_blank" rel="noreferrer">
              <KitImg src={p.url} alt={`Foto progres ${name} ${i + 1}`} className="pthumb" />
            </a>
            <button className="pdel" onClick={() => removePhoto(k, i)} disabled={!!photoBusy}
              aria-label={`Hapus foto ${i + 1} ${name}`}>✕</button>
          </span>
        ))}
        <label className="photo-btn">
          {photoBusy === k ? 'Mengunggah…' : normPhotos(photos[k]).length ? '+ Tambah foto' : '+ Foto progres'}
          <input type="file" accept="image/*" multiple disabled={!!photoBusy}
            onChange={(e) => { addPhotos(k, [...e.target.files]); e.target.value = ''; }} />
        </label>
      </div>
    </li>
  );

  return (
    <>
      <header className="top split">
        <button className="back" onClick={goBack}>← Kembali</button>
        <div className="row">
          {kit && <Link to={`/kit/${id}/edit`} className="edit-btn">Edit</Link>}
          <button className="danger" onClick={() => setConfirming(true)} disabled={!kit}>Hapus</button>
        </div>
      </header>
      <State loading={loading} error={error}>
        {kit && (
          <div className="detail-grid">
            <div className="sticky">
            <FitImg src={cardImage(kit)} alt={kit.name} className="hero" />
            <h1 className="title">{kitTitle(kit)}</h1>
            <p className="muted">{[kit.series, kit.grades?.scale].filter(Boolean).join(' • ')}</p>
            <div className="progress-box">
              <div className="row between">
                <span>Progres rakit: <b>{d.progress}%</b> ({d.done}/{d.total} tahap utama)</span>
                <Badge status={d.status} syncStatus={kit._syncStatus} />
              </div>
              <Segments done={d.done} total={d.total} status={d.status} />
            </div>

            {pendingProgressItems.length > 0 && (
              <ul className="list" style={{ marginTop: '12px' }}>
                {pendingProgressItems.map((q) => (
                  <QueueCard key={q.id} item={q} onRetry={retry} onDiscard={(qid) => { discard(qid); refetch(); }} />
                ))}
              </ul>
            )}
            </div>
            <div>

            {kit.status === 'Completed' && (
              <div className={`callout ${urlOf('final') ? 'done' : ''}`}>
                <b>{urlOf('final') ? 'Foto hasil akhir' : 'Kit rampung! Ambil foto hasil akhirnya'}</b>
                <small>
                  {urlOf('final')
                    ? 'Foto ini tampil di halaman Hangar dan galeri Build Log.'
                    : 'Foto keseluruhan unit akan dipajang di halaman Hangar dan Build Log.'}
                </small>
                <div className="photo-row flush">
                  {urlOf('final') && (
                    <a href={urlOf('final')} target="_blank" rel="noreferrer">
                      <KitImg src={urlOf('final')} alt={`Hasil akhir ${kit.name}`} className="pthumb" />
                    </a>
                  )}
                  <label className="photo-btn solid">
                    {photoBusy === 'final' ? 'Mengunggah…' : urlOf('final') ? 'Ganti foto' : 'Ambil / pilih foto'}
                    <input type="file" accept="image/*" disabled={!!photoBusy}
                      onChange={(e) => { setFinal(e.target.files[0]); e.target.value = ''; }} />
                  </label>
                  {urlOf('final') && (
                    <button className="linklike" onClick={() => setFinal(null)} disabled={!!photoBusy}>Hapus foto</button>
                  )}
                </div>
              </div>
            )}

            <h2>Perakitan utama</h2>
            <ul className="checks">{CORE_PARTS.map((p) => renderPart(p, false))}</ul>

            <h2>Finishing</h2>
            <p className="section-note">
              Opsional dan tidak memengaruhi progres. Centang kalau kamu mengerjakannya
              {d.extra > 0 ? ` (${d.extra}/${EXTRA_PARTS.length} dikerjakan).` : '.'}
            </p>
            <ul className="checks">{EXTRA_PARTS.map((p) => renderPart(p, true))}</ul>

            {msg && <p className="msg" role="status">{msg}</p>}
            <button className="primary" onClick={save} disabled={!dirty || busy}>
              {busy && !confirming ? 'Menyimpan…' : 'Simpan perubahan progres'}
            </button>
            </div>
          </div>
        )}
      </State>
      <ConfirmModal
        open={confirming}
        title="Hapus kit ini?"
        message={`${kit?.name ?? 'Kit'} akan dihapus dari hangar, begitu juga seluruh build log miliknya.`}
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
