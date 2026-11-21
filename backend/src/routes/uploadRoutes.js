import express from "express";
import multer from "multer";
import { UploadController } from "../controllers/uploadController.js";

const router = express.Router();
const memory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

router.post("/", memory.single("image"), UploadController.upload);

export default router;
