import Progress from "../models/Progress.js";

/* ===== GET USER PROGRESS ===== */
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id; // ← from JWT token

    let progress = await Progress.findOne({ userId });
    if (!progress) progress = await Progress.create({ userId });

    res.json({
      ...progress._doc,
      completedTasks: progress.completedTasks || {},
      completedDays: progress.completedDays || {},
      quizCompleted: progress.quizCompleted || {},
    });
  } catch (err) {
    console.error("❌ Error fetching progress:", err);
    res.status(500).json({ message: "Error fetching progress", error: err.message });
  }
};

/* ===== UPDATE TASK ===== */
export const updateTask = async (req, res) => {
  try {
    const userId = req.user.id; // ← from JWT token
    const { day, taskId } = req.body; // ← no userId from body

    if (!day || !taskId)
      return res.status(400).json({ message: "Missing day or taskId" });

    let progress = await Progress.findOne({ userId });
    if (!progress) progress = new Progress({ userId });

    const taskIdStr = String(taskId);
    if (!progress.completedTasks.has(day)) progress.completedTasks.set(day, []);

    const tasks = progress.completedTasks.get(day);
    if (!tasks.includes(taskIdStr)) tasks.push(taskIdStr);

    progress.completedTasks.set(day, tasks);
    progress.markModified("completedTasks");
    await progress.save();

    res.json({ message: "Task updated", completedTasks: progress.completedTasks.get(day) });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ message: "Error updating task", error: err.message });
  }
};

/* ===== COMPLETE DAY ===== */
export const completeDay = async (req, res) => {
  try {
    const userId = req.user.id; // ← from JWT token
    const { day } = req.body; // ← no userId from body

    if (!day) return res.status(400).json({ message: "Missing day" });

    let progress = await Progress.findOne({ userId });
    if (!progress) progress = new Progress({ userId });

    progress.completedDays.set(day, true);
    progress.quizCompleted.set(day, true);
    progress.markModified("completedDays");
    progress.markModified("quizCompleted");

    const today = new Date().toDateString();
    if (progress.lastStudyDate !== today) {
      progress.streak += 1;
      progress.lastStudyDate = today;
    }

    await progress.save();
    res.json({ message: "Day completed", streak: progress.streak });
  } catch (err) {
    console.error("❌ Error completing day:", err);
    res.status(500).json({ message: "Error completing day", error: err.message });
  }
};