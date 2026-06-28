import Progress from "../models/Progress.js";
import {
  updateTaskProgress,
  completeDayService
} from "../services/progressService.js";
import User from "../models/User.js";

// ================= GET USER PROGRESS =================
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    let progress = await Progress.findOne({ userId });

    // ✅ If no progress → return default structure
    if (!progress) {
      return res.status(200).json({
        userId,
        completedTasks: {},
        completedDays: {},
        streak: 0,
        lastStudyDate: null
      });
    }

    // ✅ Convert Map → Object safely
    const completedTasks = progress.completedTasks
      ? Object.fromEntries(progress.completedTasks)
      : {};

    const completedDays = progress.completedDays
      ? Object.fromEntries(progress.completedDays)
      : {};

    return res.status(200).json({
      userId: progress.userId,
      completedTasks,
      completedDays,
      streak: progress.streak || 0,
      lastStudyDate: progress.lastStudyDate || null
    });

  } catch (error) {
    console.error("Error in getUserProgress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE TASK =================
export const updateTask = async (req, res) => {
  try {
    const { userId, day, taskId } = req.body;

    if (!userId || !day || !taskId) {
      return res.status(400).json({
        message: "userId, day and taskId are required"
      });
    }

    const progress = await updateTaskProgress(userId, day, taskId);

    return res.status(200).json({
      message: "Task updated",
      completedTasks: progress.completedTasks,
      streak: progress.streak
    });

  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= COMPLETE DAY =================
export const completeDay = async (req, res) => {
  try {
    const { userId, day } = req.body;

    if (!userId || !day) {
      return res.status(400).json({
        message: "userId and day are required"
      });
    }

    const progress = await completeDayService(userId, day);

    return res.status(200).json({
      message: "Day completed",
      streak: progress.streak
    });

  } catch (error) {
    console.error("Error in completeDay:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE USER SETUP =================
// Saves onboarding fields to DB so getRedirectTo() in authController
// returns "dashboard" on subsequent logins instead of "path-selection".
// Called from PathSelection (selectedPath) and Step4 (all fields).
export const updateUserSetup = async (req, res) => {
  try {
    const ALLOWED_FIELDS = [
      "selectedPath",
      "careerInterest",
      "qualification",
      "branch",
      "year",
      "skillLevel",
      "duration",
    ];

    // Only pick fields that were actually sent — partial updates are fine
    const updates = {};
    ALLOWED_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,        // set by authMiddleware via JWT
      { $set: updates },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Return sanitized user so frontend can keep its stored user in sync
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;

    res.status(200).json({ message: "User setup updated", user: userObj });
  } catch (error) {
    console.error("updateUserSetup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};