// Antrean offline (outbox) untuk data yang dibuat/diubah saat tidak ada koneksi.
// Mendukung: 'kit' (tambah kit), 'log' (tambah catatan), dan 'progress' (update checklist kit).
import { useEffect, useState } from 'react';
import kitService from './services/kitService.js';
import logService from './services/logService.js';
import uploadService from './services/uploadService.js';
import { derive } from './util.js';

const DB = 'gunplahangar-outbox';
const STORE = 'queue';

// ---------- IndexedDB ----------
const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
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

async function serializeFile(file) {
  if (!file) return null;
  const buffer = await file.arrayBuffer();
  return { name: file.name, type: file.type || 'image/jpeg', buffer };
}

function deserializeFile(raw) {
  if (!raw) return null;
  if (raw instanceof File || raw instanceof Blob) return raw;
  if (raw.buffer) {
    return new File([raw.buffer], raw.name || 'upload.jpg', { type: raw.type || 'image/jpeg' });
  }
  return null;
}

const dbAll = async () => {
  const rows = (await run('readonly', (s) => s.getAll())) || [];
  return rows.map((r) => ({ ...r, file: deserializeFile(r.fileData) }));
};

const dbPut = async (item) => {
  const { file, ...rest } = item;
  const fileData = item.fileData ?? (await serializeFile(file));
  return run('readwrite', (s) => s.put({ ...rest, fileData }));
};

const dbDel = (id) => run('readwrite', (s) => s.delete(id));

// ---------- state di memori ----------
let items = [];
let tick = 0;
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
  // Jika sudah ada antrean 'progress' untuk kit_id yang sama dan masih 'pending', timpa saja agar tidak menumpuk
  if (type === 'progress' && meta.kit_id != null) {
    const existing = items.find(
      (i) => i.type === 'progress' && String(i.meta?.kit_id) === String(meta.kit_id) && i.status === 'pending'
    );
    if (existing) {
      await patch(existing.id, { payload, meta: { ...existing.meta, ...meta }, createdAt: Date.now() });
      return items.find((i) => i.id === existing.id);
    }
  }

  const fileData = await serializeFile(file);
  const item = {
    id: newId(),
    type,
    payload,
    file,
    fileData,
    meta,
    status: 'pending',
    error: '',
    createdAt: Date.now(),
  };
  await dbPut(item);
  items = [...items, item].sort(byTime);
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

// Terapkan perubahan progres lokal yang belum terkirim ke objek kit
export async function applyPendingProgress(kit) {
  if (!kit) return kit;
  const rows = items.length ? items : await dbAll();
  const pendingProg = rows
    .filter((i) => i.type === 'progress' && String(i.meta?.kit_id) === String(kit.id))
    .sort(byTime);

  if (pendingProg.length === 0) return kit;

  let merged = { ...kit };
  for (const p of pendingProg) {
    merged = { ...merged, ...p.payload };
    const d = derive(merged);
    merged.progress = d.progress;
    merged.status = d.status;
    merged._syncStatus = p.status; // 'pending' | 'uploading' | 'failed'
  }
  return merged;
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
            image_url = it.uploadedUrl || (await uploadService.upload(it.file)).url;
            if (!it.uploadedUrl) await patch(it.id, { uploadedUrl: image_url });
          }
          await kitService.create({ ...it.payload, image_url });
        } else if (it.type === 'progress') {
          await kitService.update(it.meta.kit_id, it.payload);
        } else {
          await logService.create(it.payload);
        }
        items = items.filter((i) => i.id !== it.id);
        await dbDel(it.id);
        tick += 1;
        emit();
      } catch (e) {
        if (!e.status) {
          await patch(it.id, { status: 'pending' });
          break;
        }
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
      const saved = await dbAll();
      items = saved
        .map((i) => (i.status === 'uploading' ? { ...i, status: 'pending' } : i))
        .sort(byTime);
      emit();
    } catch (err) {
      console.error('Gagal membaca outbox IndexedDB:', err);
    }
    if (navigator.onLine) sync();
  })();
  window.addEventListener('online', () => sync());
  setInterval(() => {
    if (navigator.onLine && items.some((i) => i.status === 'pending')) sync();
  }, 15000);
}
