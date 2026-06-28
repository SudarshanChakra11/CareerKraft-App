import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authMiddleware from "./middleware/authMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"; // Add if using chatbot routes

dotenv.config();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Database Connection
// ===============================
connectDB();

// ===============================
// Public Routes
// ===============================
app.use("/api/auth", authRoutes);

// ===============================
// Protected Routes
// ===============================
app.use("/api/progress", authMiddleware, progressRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/roadmap", authMiddleware, roadmapRoutes);
app.use("/api/chat", authMiddleware, chatRoutes); // Remove if not used

// ===============================
// Health Check
// ===============================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "CareerKraft API is running",
  });
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CareerKraft Backend started successfully on port ${PORT}`);
});