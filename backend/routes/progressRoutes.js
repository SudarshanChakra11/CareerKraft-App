import express from "express";
import { getUserProgress, updateTask, completeDay } from "../controllers/progressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All protected — userId derived from token server-side
router.get("/me", authMiddleware, getUserProgress);
router.post("/update-task", authMiddleware, updateTask);
router.post("/complete-day", authMiddleware, completeDay);

export default router;