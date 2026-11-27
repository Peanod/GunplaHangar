// Antrean offline (outbox) untuk data yang dibuat saat tidak ada koneksi.
// Disimpan di IndexedDB (bisa menyimpan File/foto, localStorage tidak bisa).
// Status item: 'pending' -> 'uploading' -> (berhasil: dihapus dari antrean) atau 'failed'.
import { useEffect, useState } from 'react';
import kitService from './services/kitService.js';
import logService from './services/logService.js';
import uploadService from './services/uploadService.js';

const DB = 'gunplahangar-outbox';
const STORE = 'queue';

// ---------- IndexedDB kecil ----------
const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

async function run(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = action(t.objectStore(STORE));
    t.oncomplete = () => { db.close(); resolve(req?.result); };
    t.onerror = t.onabort = () => { db.close(); reject(t.error); };
  });
}
const dbAll = () => run('readonly', (s) => s.getAll());
const dbPut = (item) => run('readwrite', (s) => s.put(item)).catch(() => {});
const dbDel = (id) => run('readwrite', (s) => s.delete(id)).catch(() => {});

// ---------- state di memori ----------
let items = [];
let tick = 0;          // naik setiap ada item yang berhasil terkirim (untuk refresh daftar)
let running = false;
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };

const byTime = (a, b) => a.createdAt - b.createdAt;
const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

async function patch(id, changes) {
  items = items.map((i) => (i.id === id ? { ...i, ...changes } : i));
  const next = items.find((i) => i.id === id);
  if (next) await dbPut(next);
  emit();
}

// ---------- API antrean ----------
export async function enqueue({ type, payload, file = null, meta = {} }) {
  const item = { id: newId(), type, payload, file, meta, status: 'pending', error: '', createdAt: Date.now() };
  items = [...items, item].sort(byTime);
  await dbPut(item);
  emit();
  return item;
}

export async function discard(id) {
  items = items.filter((i) => i.id !== id);
  await dbDel(id);
  emit();
}

export async function retry(id) {
  await patch(id, { status: 'pending', error: '' });
  sync();
}

// Kirim semua item 'pending' satu per satu
export async function sync() {
  if (running || !navigator.onLine) return;
  running = true;
  try {
    const todo = items.filter((i) => i.status === 'pending').sort(byTime);
    for (const it of todo) {
      await patch(it.id, { status: 'uploading', error: '' });
      try {
        if (it.type === 'kit') {
          let image_url = it.payload.image_url;
          if (it.file) {
            // simpan URL hasil unggah supaya tidak mengunggah ulang kalau langkah berikutnya gagal
            image_url = it.uploadedUrl || (await uploadService.upload(it.file)).url;
            if (!it.uploadedUrl) await patch(it.id, { uploadedUrl: image_url });
          }
          await kitService.create({ ...it.payload, image_url });
        } else {
          await logService.create(it.payload);
        }
        items = items.filter((i) => i.id !== it.id);
        await dbDel(it.id);
        tick += 1;
        emit();
      } catch (e) {
        if (!e.status) {
          // masih tidak ada koneksi: kembalikan ke pending, coba lagi nanti
          await patch(it.id, { status: 'pending' });
          break;
        }
        // ditolak server (mis. data tidak valid): tandai gagal
        await patch(it.id, { status: 'failed', error: e.message });
      }
    }
  } finally {
    running = false;
  }
}

// ---------- hook untuk komponen ----------
export function useOutbox() {
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  return { items, tick, syncNow: sync, retry, discard };
}

// ---------- jalan otomatis sejak aplikasi dimuat ----------
if (typeof window !== 'undefined') {
  (async () => {
    try {
      const saved = (await dbAll()) || [];
      // item yang tertahan 'uploading' (tab tertutup saat mengirim) dikembalikan ke pending
      items = saved.map((i) => (i.status === 'uploading' ? { ...i, status: 'pending' } : i)).sort(byTime);
      emit();
    } catch { /* IndexedDB tidak tersedia: antrean hanya di memori */ }
    if (navigator.onLine) sync();
  })();
  window.addEventListener('online', () => sync());
  // jaga-jaga kalau navigator.onLine "online" tapi server sempat tidak terjangkau
  setInterval(() => {
    if (navigator.onLine && items.some((i) => i.status === 'pending')) sync();
  }, 15000);
}
