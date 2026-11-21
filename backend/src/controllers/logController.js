import { LogModel } from "../models/logModel.js";

export const LogController = {
  async getAll(req, res) {
    try {
      res.json(await LogModel.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const log = await LogModel.getById(req.params.id);
      if (!log) return res.status(404).json({ error: "Catatan tidak ditemukan" });
      res.json(log);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      if (!req.body.kit_id)
        return res.status(400).json({ error: "Pilih kit yang dikerjakan" });
      if (!req.body.title?.trim())
        return res.status(400).json({ error: "Judul catatan wajib diisi" });
      res.status(201).json(await LogModel.create(req.body));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      res.json(await LogModel.remove(req.params.id));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
