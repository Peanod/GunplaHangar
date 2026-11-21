import { supabase } from "../config/supabaseClient.js";

export const CHECKS = [
  "check_head_torso",
  "check_arms",
  "check_legs",
  "check_weapons",
  "check_decal",
  "check_topcoat",
];
// 4 tahap utama menentukan progres. Decal dan topcoat bersifat opsional (finishing).
const CORE = CHECKS.slice(0, 4);
// Kunci foto progres yang valid: 6 tahap + 'final' (foto hasil akhir)
const PHOTO_KEYS = [...CHECKS, "final"];
const FIELDS = ["name", "series", "grade_id", "image_url"];
const SELECT = "*, grades ( id, name, scale )";

// Progres dan status SELALU dihitung di server dari 4 tahap utama:
// progress = (tahap utama tercentang / 4) x 100
export function derive(row) {
  const done = CORE.filter((k) => row[k] === true).length;
  return {
    progress: Math.round((done / CORE.length) * 100),
    status: done === 0 ? "Backlog" : done === CORE.length ? "Completed" : "On Progress",
  };
}

// Foto progres disimpan di kolom jsonb:
//   tahap  -> daftar foto  [{ url, at }, ...]  (jumlah bebas)
//   final  -> satu foto    { url, at }
// `at` = waktu unggah (diisi server kalau belum ada). Mengirim daftar kosong/null menghapus.
const toList = (v) =>
  (Array.isArray(v) ? v : v ? [v] : [])
    .map((p) => (typeof p === "string" ? { url: p } : p))
    .filter((p) => p && p.url)
    .map((p) => ({ url: String(p.url), at: p.at || new Date().toISOString() }));

export function mergePhotos(current, incoming) {
  const out = { ...(current || {}) };
  for (const [k, v] of Object.entries(incoming || {})) {
    if (!PHOTO_KEYS.includes(k)) continue;
    const list = toList(v);
    if (list.length === 0) delete out[k];
    else out[k] = k === "final" ? list[list.length - 1] : list;
  }
  return out;
}

export const KitModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("kits")
      .select(SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("kits")
      .select(SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(body) {
    const row = {};
    FIELDS.forEach((k) => {
      if (body[k] !== undefined && body[k] !== "") row[k] = body[k];
    });
    CHECKS.forEach((k) => {
      row[k] = Boolean(body[k]);
    });
    row.progress_photos = mergePhotos({}, body.progress_photos);
    Object.assign(row, derive(row));
    const { data, error } = await supabase
      .from("kits")
      .insert([row])
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, body) {
    const current = await this.getById(id);
    if (!current) return null;
    const changes = {};
    FIELDS.forEach((k) => {
      if (body[k] !== undefined) changes[k] = body[k] === "" ? null : body[k];
    });
    CHECKS.forEach((k) => {
      if (body[k] !== undefined) changes[k] = Boolean(body[k]);
    });
    if (body.progress_photos !== undefined) {
      changes.progress_photos = mergePhotos(current.progress_photos, body.progress_photos);
    }
    Object.assign(changes, derive({ ...current, ...changes }));
    const { data, error } = await supabase
      .from("kits")
      .update(changes)
      .eq("id", id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("kits").delete().eq("id", id);
    if (error) throw error;
    return { message: "Kit deleted successfully" };
  },
};
