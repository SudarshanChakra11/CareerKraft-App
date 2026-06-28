import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getUserProgress,
  completeTask,
  completeDay,
  resetProgress,
  updateOnboardingData,
} from "../controllers/progressController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET user progress (called on dashboard load)
router.get("/", getUserProgress);

// POST complete a task (watch video)
router.post("/complete-task", completeTask);

// POST complete a day (finish quiz)
router.post("/complete-day", completeDay);

// POST update onboarding data (store career path, interest, etc.)
router.post("/update-onboarding", updateOnboardingData);

// POST reset all progress (for testing/user request)
router.post("/reset", resetProgress);

export default router;