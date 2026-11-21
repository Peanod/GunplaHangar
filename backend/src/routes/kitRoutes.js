import express from "express";
import { KitController } from "../controllers/kitController.js";

const router = express.Router();

router.get("/", KitController.getAll);
router.get("/:id", KitController.getById);
router.post("/", KitController.create);
router.put("/:id", KitController.update);
router.delete("/:id", KitController.remove);

export default router;
