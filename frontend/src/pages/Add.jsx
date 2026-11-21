import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import kitService from '../services/kitService.js';
import logService from '../services/logService.js';
import uploadService from '../services/uploadService.js';
import { kitTitle } from '../util.js';
import { useGrades } from '../hooks/useGrades.js';
import { useKits } from '../hooks/useKits.js';

const today = () => new Date().toISOString().slice(0, 10);

function KitForm() {
  const nav = useNavigate();
  const { data: grades } = useGrades();
  const [f, setF] = useState({ name: '', grade_id: '', series: '', image_url: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      let image_url = f.image_url.trim();
      if (file) image_url = (await uploadService.upload(file)).url;
      await kitService.create({ ...f, image_url, grade_id: Number(f.grade_id) || '' });
      nav('/');
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit}>
      <label>Nama Gunpla
        <input value={f.name} onChange={set('name')} placeholder="Contoh: Nu Gundam" required />
        <small>Tulis tanpa grade, grade ditambahkan otomatis di depan nama.</small>
      </label>
      <label>Grade
        <select value={f.grade_id} onChange={set('grade_id')} required>
          <option value="">Pilih grade</option>
          {grades?.map((g) => <option key={g.id} value={g.id}>{g.name}{g.scale ? ` (${g.scale})` : ''}</option>)}
        </select>
      </label>
      <label>Seri anime
        <input value={f.series} onChange={set('series')} placeholder="Contoh: Char's Counterattack" />
      </label>
      <label>URL gambar
        <input type="url" value={f.image_url} onChange={set('image_url')} placeholder="https://…jpg" disabled={!!file} />
      </label>
      <label>Atau unggah foto (maks. 4 MB)
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
      </label>
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
    try {
      await logService.create({ ...f, kit_id: Number(f.kit_id) || '' });
      nav('/log');
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <form onSubmit={submit}>
      <label>Kit yang dikerjakan
        <select value={f.kit_id} onChange={set('kit_id')} required>
          <option value="">{kits?.length === 0 ? 'Belum ada kit, tambah kit dulu' : 'Pilih kit'}</option>
          {kits?.map((k) => <option key={k.id} value={k.id}>{kitTitle(k)}</option>)}
        </select>
      </label>
      <label>Judul catatan
        <input value={f.title} onChange={set('title')} placeholder="Contoh: Rakit inner frame kaki" required />
      </label>
      <label>Teknik
        <input value={f.technique} onChange={set('technique')} placeholder="Contoh: Metallic drybrush" />
      </label>
      <label>Tanggal kerja
        <input type="date" value={f.work_date} onChange={set('work_date')} required />
      </label>
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
    <>
      <header className="top"><h1>Tambah data</h1></header>
      <div className="pills">
        <button className={mode === 'kit' ? 'on' : ''} onClick={() => setMode('kit')}>Kit baru</button>
        <button className={mode === 'log' ? 'on' : ''} onClick={() => setMode('log')}>Catatan baru</button>
      </div>
      {mode === 'kit' ? <KitForm /> : <LogForm />}
    </>
  );
}
