import express from "express";
import {
  createRoadmap,
  getUserRoadmap
} from "../controllers/roadmapController.js";

const router = express.Router();

// ================= GENERATE & SAVE ROADMAP =================
router.post("/generate", createRoadmap);

// ================= GET USER ROADMAP =================
router.get("/user/:userId", getUserRoadmap);

export default router;