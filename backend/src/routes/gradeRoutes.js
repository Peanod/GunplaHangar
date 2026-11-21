import express from "express";
import { GradeController } from "../controllers/gradeController.js";

const router = express.Router();

router.get("/", GradeController.getAll);

export default router;
