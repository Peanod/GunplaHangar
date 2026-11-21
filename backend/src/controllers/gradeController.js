import { GradeModel } from "../models/gradeModel.js";

export const GradeController = {
  async getAll(req, res) {
    try {
      res.json(await GradeModel.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
