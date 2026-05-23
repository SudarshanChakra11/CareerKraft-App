import express from "express";
import {
  getUserProgress,
  updateTask,
  completeDay
} from "../controllers/userController.js";

import { updateUserSetup } from "../controllers/userSetupController.js"; // ✅ NEW

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// ================= CORE USER ROUTES =================

// Get user progress
router.get("/progress", authMiddleware, getUserProgress);

// Update task completion
router.post("/update-task", authMiddleware, updateTask);

// Mark day complete
router.post("/complete-day", authMiddleware, completeDay);


// ================= ONBOARDING (NEW CLEAN SYSTEM) =================

// Save selected path + setup
router.patch("/setup", authMiddleware, updateUserSetup);


export default router;