import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import kitService from '../services/kitService.js';
import uploadService from '../services/uploadService.js';
import { useGrades } from '../hooks/useGrades.js';
import { useKitById } from '../hooks/useKits.js';
import { FitImg, State } from '../components/Bits.jsx';

export default function EditKit() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const goBack = () => (location.key !== 'default' ? nav(-1) : nav(`/kit/${id}`));
  const { data: kit, loading, error } = useKitById(id);
  const { data: grades } = useGrades();
  const [f, setF] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Isi form dengan data kit saat pertama kali dimuat
  useEffect(() => {
    if (kit && !f) {
      setF({ name: kit.name || '', grade_id: String(kit.grade_id || ''), series: kit.series || '', image_url: kit.image_url || '' });
    }
  }, [kit, f]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      let image_url = f.image_url.trim();
      if (file) image_url = (await uploadService.upload(file)).url;
      await kitService.update(id, {
        name: f.name.trim(),
        grade_id: Number(f.grade_id),
        series: f.series.trim(),
        image_url,
      });
      goBack();
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <>
      <header className="top split">
        <button className="back" onClick={goBack}>← Batal</button>
      </header>
      <h1 className="title">Edit kit</h1>
      <State loading={loading} error={error}>
        {f && (
          <form onSubmit={submit}>
            <label>Nama Gunpla
              <input value={f.name} onChange={set('name')} required />
              <small>Tulis tanpa grade, grade ditambahkan otomatis di depan nama.</small>
            </label>
            <label>Grade
              <select value={f.grade_id} onChange={set('grade_id')} required>
                <option value="">Pilih grade</option>
                {grades?.map((g) => <option key={g.id} value={g.id}>{g.name}{g.scale ? ` (${g.scale})` : ''}</option>)}
              </select>
            </label>
            <label>Seri anime
              <input value={f.series} onChange={set('series')} />
            </label>
            {f.image_url && !file && <FitImg src={f.image_url} alt="Gambar sampul saat ini" className="edit-preview" />}
            <label>URL gambar sampul
              <input type="url" value={f.image_url} onChange={set('image_url')} placeholder="https://…jpg" disabled={!!file} />
              <small>Kosongkan untuk memakai gambar placeholder.</small>
            </label>
            <label>Atau unggah foto baru (maks. 4 MB)
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} />
              {file && <small>Foto baru dipilih: {file.name}</small>}
            </label>
            {err && <p className="msg error" role="alert">{err}</p>}
            <button className="primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan perubahan'}</button>
          </form>
        )}
      </State>
    </>
  );
}
