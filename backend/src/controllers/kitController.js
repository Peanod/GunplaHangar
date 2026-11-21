import { KitModel } from "../models/kitModel.js";

export const KitController = {
  async getAll(req, res) {
    try {
      res.json(await KitModel.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const kit = await KitModel.getById(req.params.id);
      if (!kit) return res.status(404).json({ error: "Kit tidak ditemukan" });
      res.json(kit);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      if (!req.body.name?.trim())
        return res.status(400).json({ error: "Nama Gunpla wajib diisi" });
      if (!req.body.grade_id)
        return res.status(400).json({ error: "Grade wajib dipilih" });
      res.status(201).json(await KitModel.create(req.body));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const kit = await KitModel.update(req.params.id, req.body);
      if (!kit) return res.status(404).json({ error: "Kit tidak ditemukan" });
      res.json(kit);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      res.json(await KitModel.remove(req.params.id));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
