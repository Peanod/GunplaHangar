import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import kitService from '../services/kitService.js';
import logService from '../services/logService.js';
import uploadService from '../services/uploadService.js';
import { enqueue } from '../outbox.js';
import { kitTitle } from '../util.js';
import { useGrades } from '../hooks/useGrades.js';
import { useKits } from '../hooks/useKits.js';
import './Add.css';

const MAX_MB = 4;
const today = () => new Date().toISOString().slice(0, 10);

function KitForm() {
  const nav = useNavigate();
  const { data: grades } = useGrades();
  const [f, setF] = useState({ name: '', grade_id: '', series: '', image_url: '' });
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0); // untuk mereset input file
  const [localUrl, setLocalUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // pratinjau foto yang dipilih
  useEffect(() => {
    if (!file) { setLocalUrl(''); return undefined; }
    const u = URL.createObjectURL(file);
    setLocalUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const preview = localUrl || f.image_url.trim();

  const pickFile = (e) => {
    const picked = e.target.files[0] || null;
    if (picked && picked.size > MAX_MB * 1024 * 1024) {
      setErr(`Ukuran foto maksimal ${MAX_MB} MB.`);
      setFileKey((k) => k + 1);
      return;
    }
    setErr('');
    setFile(picked);
  };

  const clearFile = () => { setFile(null); setFileKey((k) => k + 1); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');

    const body = { ...f, image_url: f.image_url.trim(), grade_id: Number(f.grade_id) || '' };
    const grade = grades?.find((g) => String(g.id) === String(f.grade_id));

    // Simpan ke antrean offline; akan dikirim otomatis saat koneksi kembali
    const queueIt = async () => {
      await enqueue({
        type: 'kit',
        payload: body,
        file,
        meta: { grade_name: grade?.name, grade_scale: grade?.scale },
      });
      nav('/progres');
    };

    try {
      if (!navigator.onLine) { await queueIt(); return; }
      let image_url = body.image_url;
      if (file) image_url = (await uploadService.upload(file)).url;
      await kitService.create({ ...body, image_url });
      nav('/');
    } catch (e2) {
      // Tanpa status = masalah jaringan (bukan ditolak server) -> masukkan ke antrean
      if (!e2.status) {
        try { await queueIt(); return; } catch { /* gagal menyimpan antrean: tampilkan error di bawah */ }
      }
      setErr(e2.message); setBusy(false);
    }
  };

  return (
    <form className="add-form" onSubmit={submit}>
      <label>Nama Gunpla
        <input value={f.name} onChange={set('name')} placeholder="Contoh: Nu Gundam" required />
        <small>Tulis tanpa grade, grade ditambahkan otomatis di depan nama.</small>
      </label>

      <div className="two">
        <label>Grade
          <select value={f.grade_id} onChange={set('grade_id')} required>
            <option value="">Pilih grade</option>
            {grades?.map((g) => <option key={g.id} value={g.id}>{g.name}{g.scale ? ` (${g.scale})` : ''}</option>)}
          </select>
        </label>
        <label>Seri anime
          <input value={f.series} onChange={set('series')} placeholder="Contoh: Char's Counterattack" />
        </label>
      </div>

      <label>URL gambar
        <input type="url" value={f.image_url} onChange={set('image_url')} placeholder="https://…jpg" disabled={!!file} />
      </label>

      <div className="field">
        <span>Atau unggah foto (maks. {MAX_MB} MB)</span>
        <label className="drop">
          <input key={fileKey} type="file" accept="image/*" onChange={pickFile} />
          <b>{file ? 'Ganti foto' : 'Pilih foto dari perangkat'}</b>
          <em>{file ? file.name : 'JPG, PNG, atau WEBP'}</em>
        </label>
        {file && <button type="button" className="linklike" onClick={clearFile}>Hapus foto terpilih</button>}
      </div>

      {preview && (
        <img
          className="preview"
          src={preview}
          alt="Pratinjau gambar kit"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          onLoad={(e) => { e.currentTarget.style.display = ''; }}
        />
      )}

      {err && <p className="msg error" role="alert">{err}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan ke hangar'}</button>
    </form>
  );
}

function LogForm() {
  const nav = useNavigate();
  const { data: kits } = useKits();
  const [f, setF] = useState({ kit_id: '', title: '', technique: '', notes: '', work_date: today() });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');

    const body = { ...f, kit_id: Number(f.kit_id) || '' };
    const kit = kits?.find((k) => String(k.id) === String(f.kit_id));

    const queueIt = async () => {
      await enqueue({ type: 'log', payload: body, meta: { kit_name: kit ? kitTitle(kit) : '' } });
      nav('/log');
    };

    try {
      if (!navigator.onLine) { await queueIt(); return; }
      await logService.create(body);
      nav('/log');
    } catch (e2) {
      if (!e2.status) {
        try { await queueIt(); return; } catch { /* tampilkan error di bawah */ }
      }
      setErr(e2.message); setBusy(false);
    }
  };

  return (
    <form className="add-form" onSubmit={submit}>
      <label>Kit yang dikerjakan
        <select value={f.kit_id} onChange={set('kit_id')} required>
          <option value="">{kits?.length === 0 ? 'Belum ada kit, tambah kit dulu' : 'Pilih kit'}</option>
          {kits?.map((k) => <option key={k.id} value={k.id}>{kitTitle(k)}</option>)}
        </select>
      </label>
      <label>Judul catatan
        <input value={f.title} onChange={set('title')} placeholder="Contoh: Rakit inner frame kaki" required />
      </label>

      <div className="two">
        <label>Teknik
          <input value={f.technique} onChange={set('technique')} placeholder="Contoh: Metallic drybrush" />
        </label>
        <label>Tanggal kerja
          <input type="date" value={f.work_date} onChange={set('work_date')} required />
        </label>
      </div>

      <label>Catatan
        <textarea rows="5" value={f.notes} onChange={set('notes')} placeholder="Apa yang dikerjakan, cat atau tool yang dipakai, kendala…" />
      </label>
      {err && <p className="msg error" role="alert">{err}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan catatan'}</button>
    </form>
  );
}

export default function Add() {
  const [mode, setMode] = useState('kit');
  return (
    <div className="add-page">
      <header className="top"><h1>Tambah data</h1></header>
      <div className="pills" role="group" aria-label="Jenis data">
        <button type="button" className={mode === 'kit' ? 'on' : ''} aria-pressed={mode === 'kit'} onClick={() => setMode('kit')}>Kit baru</button>
        <button type="button" className={mode === 'log' ? 'on' : ''} aria-pressed={mode === 'log'} onClick={() => setMode('log')}>Catatan baru</button>
      </div>
      {mode === 'kit' ? <KitForm /> : <LogForm />}
    </div>
  );
}
