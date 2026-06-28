
import RoadmapService from '../services/roadmapService.js';
import UserRoadmap from '../models/UserRoadmap.js';
import User from '../models/User.js';


export const createRoadmap = async (req, res) => {
  try {
    const { qualification, currentYear, branch, careerInterest } = req.body;
    const userId = req.user?.id; // From authMiddleware

    // ──────────────────────────────────
    // VALIDATION
    // ──────────────────────────────────
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID not found',
      });
    }

    if (!qualification || !currentYear || !branch || !careerInterest) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: qualification, currentYear, branch, careerInterest',
      });
    }

    // Validate year
    if (![1, 2, 3, 4].includes(parseInt(currentYear))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currentYear. Must be 1, 2, 3, or 4',
      });
    }

    // ──────────────────────────────────
    // GENERATION
    // ──────────────────────────────────
    const studentProfile = {
      qualification,
      currentYear: parseInt(currentYear),
      branch,
      careerInterest,
    };

    const result = await RoadmapService.generateRoadmap(userId, studentProfile);

    // ──────────────────────────────────
    // RESPONSE
    // ──────────────────────────────────
    return res.status(200).json({
      success: true,
      message: result.message,
      generatedBy: result.generatedBy,
      data: result.roadmap,
    });

  } catch (error) {
    console.error("Roadmap generation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate roadmap',
    });
  }
};


export const getUserRoadmap = async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeProgress } = req.query;
    const authUserId = req.user?.id;

    // ──────────────────────────────────
    // AUTHORIZATION CHECK
    // ──────────────────────────────────
    if (authUserId !== userId && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized - Cannot access other user\'s roadmap',
      });
    }

    // ──────────────────────────────────
    // FETCH ROADMAP
    // ──────────────────────────────────
    const roadmap = await RoadmapService.getUserRoadmap(userId);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'No roadmap found for this user. Please generate one first.',
      });
    }

    // ──────────────────────────────────
    // FORMAT RESPONSE
    // ──────────────────────────────────
    const response = {
      success: true,
      message: 'Roadmap fetched successfully',
      data: roadmap,
    };

    // Include detailed progress if requested
    if (includeProgress === 'true') {
      response.detailedProgress = {
        totalDays: roadmap.progress.totalDays,
        completedDays: roadmap.progress.completedDays,
        remainingDays: roadmap.progress.totalDays - roadmap.progress.completedDays,
        completionPercentage: roadmap.progress.completionPercentage,
        totalXPGained: roadmap.progress.totalXPGained,
        estCompletionDate: this.calculateEstCompletionDate(roadmap),
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch roadmap',
    });
  }
};


export const getRoadmapById = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user?.id;

    // ──────────────────────────────────
    // FETCH
    // ──────────────────────────────────
    const roadmap = await UserRoadmap.findOne({
      roadmapId,
      userId,
    }).lean();

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Roadmap fetched successfully',
      data: roadmap,
    });

  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch roadmap',
    });
  }
};

export const getDailyTasks = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { day } = req.query;
    const userId = req.user?.id;

    // ──────────────────────────────────
    // VALIDATION
    // ──────────────────────────────────
    if (!day) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "day" is required',
      });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 360) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day parameter. Must be between 1 and 360',
      });
    }

    // ──────────────────────────────────
    // FETCH
    // ──────────────────────────────────
    const roadmap = await UserRoadmap.findOne({
      roadmapId,
      userId,
    }).lean();

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found',
      });
    }

    const dailyTask = roadmap.dailyBreakdown.find(d => d.day === dayNum);

    if (!dailyTask) {
      return res.status(404).json({
        success: false,
        message: `Daily tasks not found for day ${dayNum}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Daily tasks for day ${dayNum}`,
      data: {
        day: dailyTask.day,
        phase: dailyTask.phase,
        topic: dailyTask.topic,
        tasks: dailyTask.tasks,
        practiceProblems: dailyTask.practiceProblems,
        estimatedXP: dailyTask.estimatedXP,
        completionStatus: dailyTask.completionStatus,
      },
    });

  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch daily tasks',
    });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { completedTaskIds } = req.body;
    const userId = req.user?.id;

    // ──────────────────────────────────
    // VALIDATION
    // ──────────────────────────────────
    if (!completedTaskIds || !Array.isArray(completedTaskIds)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: completedTaskIds (must be array)',
      });
    }

    if (completedTaskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'completedTaskIds cannot be empty',
      });
    }

    // ──────────────────────────────────
    // UPDATE PROGRESS
    // ──────────────────────────────────
    const result = await RoadmapService.updateProgress(userId, completedTaskIds);

    // ──────────────────────────────────
    // AWARD XP (Optional - integrate with gamification)
    // ──────────────────────────────────
    const xpGained = completedTaskIds.length * 50; // 50 XP per task
    
    try {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { xp: xpGained } },
        { new: true }
      );
    } catch (xpError) {
      console.warn(`⚠️  Could not update user XP: ${xpError.message}`);
      // Don't fail the request if XP update fails
    }

    return res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      xpAwarded: xpGained,
      data: result.progress,
    });

  } catch (error) {
    console.error("Error updating progress:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update progress',
    });
  }
};


export const regenerateRoadmap = async (req, res) => {
  try {
    const { qualification, currentYear, branch, careerInterest } = req.body;
    const userId = req.user?.id;

    // ──────────────────────────────────
    // VALIDATION
    // ──────────────────────────────────
    if (!qualification || !currentYear || !branch || !careerInterest) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // ──────────────────────────────────
    // REGENERATE
    // ──────────────────────────────────
    const studentProfile = {
      qualification,
      currentYear: parseInt(currentYear),
      branch,
      careerInterest,
    };

    const result = await RoadmapService.generateRoadmap(userId, studentProfile);

    return res.status(200).json({
      success: true,
      message: 'Roadmap regenerated successfully',
      generatedBy: result.generatedBy,
      data: result.roadmap,
    });

  } catch (error) {
    console.error("Roadmap regeneration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to regenerate roadmap',
    });
  }
};


export const deleteRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user?.id;

    // ──────────────────────────────────
    // AUTHORIZATION
    // ──────────────────────────────────
    const roadmap = await UserRoadmap.findOne({ roadmapId, userId });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or unauthorized',
      });
    }

    // ──────────────────────────────────
    // DELETE
    // ──────────────────────────────────
    await RoadmapService.deleteRoadmap(userId);

    return res.status(200).json({
      success: true,
      message: 'Roadmap deleted successfully',
    });

  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete roadmap',
    });
  }
};


export const getCompletionStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    const roadmap = await UserRoadmap.findOne({ userId }).lean();

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'No roadmap found',
      });
    }

    const totalTasks = roadmap.dailyBreakdown.reduce(
      (sum, day) => sum + day.tasks.length,
      0
    );

    const completedTasks = roadmap.dailyBreakdown
      .flatMap(d => d.tasks)
      .filter(t => t.completed).length;

    return res.status(200).json({
      success: true,
      data: {
        totalDays: roadmap.progress.totalDays,
        completedDays: roadmap.progress.completedDays,
        remainingDays: roadmap.progress.totalDays - roadmap.progress.completedDays,
        completionPercentage: roadmap.progress.completionPercentage,
        totalTasks,
        completedTasks,
        remainingTasks: totalTasks - completedTasks,
        totalXP: roadmap.progress.totalXPGained,
        phases: roadmap.phases.map(p => ({
          phaseNumber: p.phaseNumber,
          title: p.title,
          status: p.status,
        })),
        milestones: roadmap.milestones.map(m => ({
          month: m.month,
          milestone: m.milestone,
          completed: m.completed,
        })),
      },
    });

  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
    });
  }
};


function calculateEstCompletionDate(roadmap) {
  if (roadmap.progress.completionPercentage === 0) {
    return null;
  }

  const daysElapsed = roadmap.progress.completedDays;
  const daysRemaining = roadmap.progress.totalDays - daysElapsed;
  const today = new Date();
  
  // Simple estimation: assume same pace
  const completionDate = new Date(today.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  
  return completionDate.toISOString().split('T')[0];
}

export default {
  createRoadmap,
  getUserRoadmap,
  getRoadmapById,
  getDailyTasks,
  updateProgress,
  regenerateRoadmap,
  deleteRoadmap,
  getCompletionStats,
};