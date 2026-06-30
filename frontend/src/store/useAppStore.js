import { create } from "zustand";
import { persist } from "zustand/middleware";

export const careerToPathKey = (careerInterest) => {
  const map = {
    "Full Stack Development": "fsd",
    "Data Science": "ds",
    "AI/ML": "ds",
    "Cloud Computing": "fsd",
    "Cybersecurity": "fsd",
    "GATE": "fsd",
    "GRE": "fsd",
    "CAT": "fsd",
  };
  return map[careerInterest] || "fsd";
};

export const ALL_BADGES = [
  { id: "first_step",   emoji: "🌟", label: "First Step",   desc: "Complete your first task" },
  { id: "on_fire",      emoji: "🔥", label: "On Fire",      desc: "Maintain a 3-day streak" },
  { id: "week_warrior", emoji: "⚔️", label: "Week Warrior", desc: "Maintain a 7-day streak" },
  { id: "quiz_master",  emoji: "🧠", label: "Quiz Master",  desc: "Score 100% on a quiz" },
  { id: "rising_star",  emoji: "⭐", label: "Rising Star",  desc: "Earn 500 XP" },
];

export const useAppStore = create(
  persist(
    (set, get) => ({

      // ── USER ──
      user: null,
      setUser: (user) => set({ user }),

      // ── PROGRESS ──
      streak:     0,
      xp:         0,
      level:      1,
      badges:     [],
      currentDay: 1,
      completedTasks: {},
      completedDays:  [],

      // ✅ Direct setters — used by Dashboard to sync DB values into store
      setStreak: (streak) => set({ streak }),
      setXP:     (xp)     => set({ xp }),
      setLevel:  (level)  => set({ level }),
      setBadges: (badges) => set({ badges }),
      setProgress: (progress) =>
        set({
          streak: progress.streak ?? 0,
          xp: progress.xp ?? 0,
          level: progress.level ?? 1,
          badges: progress.badges || [],
          completedDays: progress.completedDaysList || [],
          completedTasks: progress.completedTasks || {},
        }),
      setCurrentDay: (day) => set({ currentDay: day }),

      // Get completed task IDs for a specific day
      getTasksForDay: (dayNumber) => get().completedTasks[dayNumber] || [],

      // Check if a specific task is done on a specific day
      isTaskDone: (dayNumber, taskId) =>
        (get().completedTasks[dayNumber] || []).includes(String(taskId)),

      // +50 XP per task
      addCompletedTask: (dayNumber, taskId) =>
        set((state) => {
          const dayTasks = state.completedTasks[dayNumber] || [];
          if (dayTasks.includes(String(taskId))) return {};

          const newDayTasks      = [...dayTasks, String(taskId)];
          const newCompletedTasks = { ...state.completedTasks, [dayNumber]: newDayTasks };
          const newXP    = state.xp + 50;
          const newLevel = Math.floor(newXP / 200) + 1;
          const newBadges = [...state.badges];
          if (!newBadges.includes("first_step")) newBadges.push("first_step");
          if (!newBadges.includes("rising_star") && newXP >= 500) newBadges.push("rising_star");

          return { completedTasks: newCompletedTasks, xp: newXP, level: newLevel, badges: newBadges };
        }),

      // +10 XP per correct quiz answer
      addQuizXP: () =>
        set((state) => {
          const newXP    = state.xp + 10;
          const newLevel = Math.floor(newXP / 200) + 1;
          const newBadges = [...state.badges];
          if (!newBadges.includes("rising_star") && newXP >= 500) newBadges.push("rising_star");
          return { xp: newXP, level: newLevel, badges: newBadges };
        }),

      // Complete day: streak + badges
      addCompletedDay: (dayNumber, perfectQuiz = false) =>
        set((state) => {
          if (state.completedDays.includes(dayNumber)) return {};
          const newStreak = state.streak + 1;
          const newBadges = [...state.badges];
          if (!newBadges.includes("on_fire")      && newStreak >= 3) newBadges.push("on_fire");
          if (!newBadges.includes("week_warrior") && newStreak >= 7) newBadges.push("week_warrior");
          if (perfectQuiz && !newBadges.includes("quiz_master"))      newBadges.push("quiz_master");
          return {
            completedDays: [...state.completedDays, dayNumber],
            streak: newStreak,
            badges: newBadges,
          };
        }),

      isDayCompleted: (dayNumber) => get().completedDays.includes(dayNumber),

      onboardingData: {
        qualification: "",
        branch: "",
        year: "",
        careerInterest: "",
        skillLevel: "",
        duration: "",
        selectedPath: ""
      },

      setOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data }
        })),

      getPathKey: () => careerToPathKey(get().onboardingData.careerInterest),

      resetOnboarding: () =>
        set({
          onboardingData: {
            qualification: "", branch: "", year: "",
            careerInterest: "", skillLevel: "", duration: "", selectedPath: ""
          }
        }),

      resetStore: () =>
        set({
          user: null, streak: 0, xp: 0, level: 1, badges: [],
          completedTasks: {}, completedDays: [], currentDay: 1,
          onboardingData: {
            qualification: "", branch: "", year: "",
            careerInterest: "", skillLevel: "", duration: "", selectedPath: ""
          }
        }),
    }),
    {
      name: "careerkraft-store",
      partialize: (state) => ({
        onboardingData:  state.onboardingData,
        completedDays:   state.completedDays,
        completedTasks:  state.completedTasks,
        currentDay:      state.currentDay,
        streak:          state.streak,
        xp:              state.xp,
        level:           state.level,
        badges:          state.badges,
        user:            state.user,
      }),
    }
  )
);