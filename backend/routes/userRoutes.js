import express from "express";
import {
  getUserProgress,
  updateTask,
  completeDay,
  updateUserSetup,         // ✅ comes from userController, not a separate file
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// ================= CORE USER ROUTES =================

// Get user progress
router.get("/progress", authMiddleware, getUserProgress);

// Update task completion
router.post("/update-task", authMiddleware, updateTask);

// Mark day complete
router.post("/complete-day", authMiddleware, completeDay);


// ================= ONBOARDING =================

// Save selected path + setup fields to DB
// PUT to match frontend api.js → updateUserSetup()
router.put("/setup", authMiddleware, updateUserSetup);


export default router;