import UserRoadmap from "../models/userRoadmap.js";
import User from "../models/User.js";
import { generateRoadmap } from "../utils/roadmapEngine.js";


// ================= MAP TRACK TO GOAL =================
const mapTrackToGoal = (track) => {
  const trackMap = {
    "fullstack": "Full Stack",
    "data-science": "Data Science",
    "ai-ml": "AI Engineer",
    "GATE": "Full Stack",
    "GRE": "AI Engineer",
    "CAT": "Data Science"
  };
  return trackMap[track] || "Full Stack";
};


// ================= CREATE / GENERATE ROADMAP =================
export const createRoadmap = async (req, res) => {
  try {
    const { userId, goal, level, timePerDay, tenure } = req.body;

    // 🔍 Validation
    if (!userId || !goal || !level || !tenure) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // 🔥 Generate roadmap
    const roadmap = generateRoadmap({
      goal,
      level,
      timePerDay: timePerDay || 2,
      tenure
    });

    // 🔥 Remove old roadmap (avoid duplicates)
    await UserRoadmap.findOneAndDelete({ userId });

    // 🔥 Save new roadmap
    const savedRoadmap = await UserRoadmap.create({
      userId,
      roadmap
    });

    res.status(200).json(savedRoadmap);

  } catch (err) {
    console.error("CREATE ROADMAP ERROR:", err);
    res.status(500).json({
      message: "Failed to generate roadmap"
    });
  }
};


// ================= GET USER ROADMAP =================
export const getUserRoadmap = async (req, res) => {
  try {
    const { userId } = req.params;

    let data = await UserRoadmap.findOne({ userId });

    // 🔥 CRITICAL FIX: If roadmap doesn't exist, auto-generate it
    if (!data) {
      // Fetch user to get their selected path
      const user = await User.findById(userId);
      
      if (!user || !user.selectedPath) {
        return res.status(404).json({
          message: "No roadmap found and no path selected"
        });
      }

      // Auto-generate roadmap based on user's selected path
      const goal = mapTrackToGoal(user.selectedPath.track);
      const level = "beginner";
      const timePerDay = 2;
      const tenure = "90 days";

      const roadmap = generateRoadmap({
        goal,
        level,
        timePerDay,
        tenure
      });

      // Save the auto-generated roadmap
      const savedRoadmap = await UserRoadmap.create({
        userId,
        roadmap
      });

      console.log(`✅ Auto-generated roadmap for user ${userId}`);
      return res.status(200).json(savedRoadmap.roadmap);
    }

    res.status(200).json(data.roadmap);

  } catch (err) {
    console.error("GET ROADMAP ERROR:", err);
    res.status(500).json({
      message: "Error fetching roadmap"
    });
  }
};