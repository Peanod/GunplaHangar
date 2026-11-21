import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gradeRoutes from "./routes/gradeRoutes.js";
import kitRoutes from "./routes/kitRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ app: "GunplaHangar API", status: "ok" }));
app.use("/api/grades", gradeRoutes);
app.use("/api/kits", kitRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/upload", uploadRoutes);

app.use((req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan" }));
// Penanganan error terpusat (mis. file terlalu besar dari multer)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const tooBig = err.code === "LIMIT_FILE_SIZE";
  res
    .status(tooBig ? 413 : err.status || 500)
    .json({ error: tooBig ? "Ukuran gambar maksimal 4 MB" : err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
