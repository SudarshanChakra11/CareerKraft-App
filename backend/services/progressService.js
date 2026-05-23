import Progress from "../models/Progress.js";

/* ===== UPDATE TASK ===== */
export const updateTaskProgress = async (userId, day, taskId) => {

  console.log("🔥 API HIT (update-task):", userId, day, taskId);

  let progress = await Progress.findOne({ userId });

  // create new user progress if not exists
  if (!progress) {
    progress = new Progress({
      userId,
      completedTasks: new Map(),
      completedDays: new Map()
    });
  }

  // ensure Map exists
  if (!progress.completedTasks) {
    progress.completedTasks = new Map();
  }

  const tasks = progress.completedTasks.get(day) || [];

  if (!tasks.includes(taskId)) {
    tasks.push(taskId);
    progress.completedTasks.set(day, tasks);
  }

  await progress.save();

  return progress;
};

/* ===== UPDATE STREAK ===== */
const updateStreak = (progress) => {

  const today = new Date().toLocaleDateString("en-CA");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA");

  if (progress.lastStudyDate === today) return progress;

  if (!progress.lastStudyDate) {
    progress.streak = 1;
  } else if (progress.lastStudyDate === yesterdayStr) {
    progress.streak += 1;
  } else {
    progress.streak = 1;
  }

  progress.lastStudyDate = today;

  return progress;
};

/* ===== COMPLETE DAY ===== */
export const completeDayService = async (userId, day) => {

  console.log("🔥 API HIT (complete-day):", userId, day);

  let progress = await Progress.findOne({ userId });

  if (!progress) {
    progress = new Progress({
      userId,
      completedTasks: new Map(),
      completedDays: new Map()
    });
  }

  // ensure Map exists
  if (!progress.completedDays) {
    progress.completedDays = new Map();
  }

  progress = updateStreak(progress);

  progress.completedDays.set(day, true);

  await progress.save();

  return progress;
};