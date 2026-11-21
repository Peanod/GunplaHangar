export const STATUS = {
  Backlog: { label: 'Backlog', cls: 'backlog' },
  'On Progress': { label: 'WIP', cls: 'wip' },
  Completed: { label: 'Done', cls: 'done' },
};

// 4 tahap utama menentukan progres dan status.
export const CORE_PARTS = [
  ['check_head_torso', 'Head & Torso', 'Kepala, cockpit, dan dada'],
  ['check_arms', 'Arms & Shoulders', 'Rangka dalam dan armor lengan'],
  ['check_legs', 'Waist & Legs', 'Pinggang, kedua kaki, dan telapak'],
  ['check_weapons', 'Backpack & Weapons', 'Backpack, thruster, shield, senjata'],
];

// Finishing bersifat opsional dan tidak memengaruhi progres.
export const EXTRA_PARTS = [
  ['check_decal', 'Panel Lining & Decals', 'Garis panel dan sticker / water slide'],
  ['check_topcoat', 'Topcoat & Finishing', 'Topcoat matte/gloss atau weathering'],
];

export const PARTS = [...CORE_PARTS, ...EXTRA_PARTS];

export const PHOTO_LABELS = {
  ...Object.fromEntries(PARTS.map(([k, name]) => [k, name])),
  final: 'Hasil akhir',
};

// Foto bisa berupa string (data lama) atau { url, at }
export const normPhoto = (v) =>
  Array.isArray(v) ? normPhoto(v[v.length - 1])
    : !v ? null
    : typeof v === 'string' ? { url: v, at: null }
    : { url: v.url, at: v.at || null };

// Satu tahap bisa punya banyak foto -> daftar [{ url, at }]
export const normPhotos = (v) =>
  (Array.isArray(v) ? v : v ? [v] : []).map(normPhoto).filter((p) => p?.url);

// Semua foto progres berurutan: per tahap, lalu hasil akhir -> [{ key, id, label, url, at }]
export const photoEntries = (photos) =>
  [...PARTS.map(([k]) => k), 'final'].flatMap((k) =>
    normPhotos(photos?.[k]).map((p, i) => ({ key: k, id: `${k}-${i}`, label: PHOTO_LABELS[k], ...p })));

// Kit yang sudah rampung menampilkan foto hasil akhir; selain itu foto/box art biasa
export const cardImage = (kit) =>
  (kit.status === 'Completed' && normPhoto(kit.progress_photos?.final)?.url) || kit.image_url;

export function derive(kit) {
  const total = CORE_PARTS.length;
  const done = CORE_PARTS.filter(([k]) => kit[k]).length;
  return {
    done,
    total,
    extra: EXTRA_PARTS.filter(([k]) => kit[k]).length,
    progress: Math.round((done / total) * 100),
    status: done === 0 ? 'Backlog' : done === total ? 'Completed' : 'On Progress',
  };
}

export const fmtDate = (d) =>
  new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

// Grade ditambahkan di depan nama, kecuali nama sudah diawali grade itu (hindari "MG MG ...")
export const kitTitle = (k) => {
  const g = k.grades?.name;
  if (!g) return k.name;
  return k.name.toLowerCase().startsWith(`${g.toLowerCase()} `) ? k.name : `${g} ${k.name}`;
};

const SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='#111c36'/><g fill='none' stroke='#35d6ff' stroke-width='3' stroke-linejoin='round' opacity='.75'><path d='M60 22 40 8M60 22 80 8M60 22v8'/><path d='M44 34h32l6 26-8 10H46L38 60z'/><path d='M46 70 40 104h14l6-20 6 20h14l-6-34'/></g><rect x='50' y='44' width='20' height='5' fill='#ffb02e'/></svg>`;
export const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`;
