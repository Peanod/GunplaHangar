import { supabase, BUCKET } from "../config/supabaseClient.js";

export const UploadController = {
  async upload(req, res) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "File gambar tidak ditemukan" });
      if (!file.mimetype.startsWith("image/"))
        return res.status(400).json({ error: "File harus berupa gambar" });
      const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      res.status(201).json({ url: data.publicUrl });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
