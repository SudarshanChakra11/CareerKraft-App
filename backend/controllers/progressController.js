import Progress from "../models/Progress.js";
import User from "../models/User.js";


export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId });

   
    if (!progress) {
      progress = new Progress({
        userId,
        completedDays: new Map(),
        completedDaysList: [],
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        completedTasks: new Map(),
        quizScores: new Map(),
      });
      await progress.save();
    }

    const response = {
      userId: progress.userId,
      completedDays: Object.fromEntries(progress.completedDays),
      completedDaysList: progress.completedDaysList,
      xp: progress.xp,
      level: progress.level,
      streak: progress.streak,
      badges: progress.badges,
      completedTasks: Object.fromEntries(progress.completedTasks),
      quizScores: Object.fromEntries(progress.quizScores),
      selectedPath: progress.selectedPath,
      careerInterest: progress.careerInterest,
      skillLevel: progress.skillLevel,
      qualification: progress.qualification,
      lastCompletionDate: progress.lastCompletionDate,
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};


export const completeTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dayNumber, taskId } = req.body;

    if (!dayNumber || !taskId) {
      return res
        .status(400)
        .json({ error: "dayNumber and taskId are required" });
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    const dayKey = String(dayNumber);
    let dayTasks = progress.completedTasks.get(dayKey) || [];

    if (!dayTasks.includes(String(taskId))) {
      dayTasks.push(String(taskId));
      progress.completedTasks.set(dayKey, dayTasks);
    }

    const taskXP = 50;
    progress.xp += taskXP;

    progress.level = Math.floor(progress.xp / 200) + 1;

    await progress.save();

    res.json({
      success: true,
      message: "Task completed",
      xp: taskXP,
      totalXP: progress.xp,
      level: progress.level,
    });
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ error: "Failed to complete task" });
  }
};


export const completeDay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dayNumber, quizCorrect, quizTotal, isPerfect } = req.body;

    if (!dayNumber) {
      return res.status(400).json({ error: "dayNumber is required" });
    }

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    const dayKey = String(dayNumber);
    progress.completedDays.set(dayKey, true);

    const daysArray = Array.from(progress.completedDays.entries())
      .filter(([_, completed]) => completed)
      .map(([day]) => parseInt(day))
      .sort((a, b) => a - b);
    progress.completedDaysList = daysArray;

    const quizXP = (quizCorrect || 0) * 10;
    progress.xp += quizXP;

    progress.level = Math.floor(progress.xp / 200) + 1;

    progress.quizScores.set(dayKey, {
      correct: quizCorrect || 0,
      total: quizTotal || 0,
      isPerfect: isPerfect || false,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompletion = progress.lastCompletionDate
      ? new Date(progress.lastCompletionDate)
      : null;
    if (lastCompletion) {
      lastCompletion.setHours(0, 0, 0, 0);
    }

    const dayDifference = lastCompletion
      ? Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24))
      : 1;

    if (dayDifference === 1) {
      // Consecutive day
      progress.streak += 1;
    } else if (dayDifference > 1) {
      // Streak broken, reset
      progress.streak = 1;
    }


    progress.lastCompletionDate = new Date();


    checkAndAwardBadges(progress);

    await progress.save();

    res.json({
      success: true,
      message: "Day completed",
      xp: quizXP,
      totalXP: progress.xp,
      level: progress.level,
      streak: progress.streak,
      badges: progress.badges,
    });
  } catch (err) {
    console.error("Error completing day:", err);
    res.status(500).json({ error: "Failed to complete day" });
  }
};


function checkAndAwardBadges(progress) {
  const badges = progress.badges || [];

  
  if (
    progress.completedDaysList.length >= 1 &&
    !badges.includes("first_step")
  ) {
    badges.push("first_step");
  }


  if (progress.streak >= 3 && !badges.includes("on_fire")) {
    badges.push("on_fire");
  }

  
  if (progress.streak >= 7 && !badges.includes("week_warrior")) {
    badges.push("week_warrior");
  }

  // Quiz Master: Perfect quiz (100%)
  if (
    Array.from(progress.quizScores.values()).some((q) => q.isPerfect) &&
    !badges.includes("quiz_master")
  ) {
    badges.push("quiz_master");
  }

  progress.badges = badges;
}


export const resetProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    await Progress.findOneAndUpdate(
      { userId },
      {
        completedDays: new Map(),
        completedDaysList: [],
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        completedTasks: new Map(),
        quizScores: new Map(),
        lastCompletionDate: null,
      },
      { new: true }
    );

    res.json({ success: true, message: "Progress reset" });
  } catch (err) {
    console.error("Error resetting progress:", err);
    res.status(500).json({ error: "Failed to reset progress" });
  }
};


export const updateOnboardingData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedPath, careerInterest, skillLevel, qualification } =
      req.body;

    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    if (selectedPath) progress.selectedPath = selectedPath;
    if (careerInterest) progress.careerInterest = careerInterest;
    if (skillLevel) progress.skillLevel = skillLevel;
    if (qualification) progress.qualification = qualification;

    await progress.save();

    res.json({ success: true, message: "Onboarding data updated", progress });
  } catch (err) {
    console.error("Error updating onboarding data:", err);
    res.status(500).json({ error: "Failed to update onboarding data" });
  }
};