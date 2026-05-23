import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve("./.env"),
});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js"; // ✅ ADD THIS
import roadmapRoutes from "./routes/roadmapRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";


connectDB();

const app = express();

// Debug log (optional)
console.log("JWT:", process.env.JWT_SECRET);

// CORS — fix for prod
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173"
}));

// ✅ Middleware
app.use(express.json());

// ✅ TEST ROUTE (ADD THIS)
app.get("/api/test", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/roadmap", roadmapRoutes);
// Add at bottom (after all routes)

app.use(errorMiddleware);

// ✅ Server start
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});