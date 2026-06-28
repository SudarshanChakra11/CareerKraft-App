import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Track which days are completed: { 1: true, 2: true, 3: false, ... }
    completedDays: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
    // Array of completed day numbers for quick filtering
    completedDaysList: {
      type: [Number],
      default: [],
    },
    // Total XP across all days
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Current user level (1 level = 200 XP)
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Current streak count
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Last completion date (for streak calculation)
    lastCompletionDate: {
      type: Date,
      default: null,
    },
    // Array of earned badge IDs
    badges: {
      type: [String],
      default: [],
    },
    // Completed tasks per day: { 1: ["1", "2"], 2: ["1", "2", "3"], ... }
    completedTasks: {
      type: Map,
      of: [String],
      default: new Map(),
    },
    // Quiz scores per day
    quizScores: {
      type: Map,
      of: {
        correct: Number,
        total: Number,
        isPerfect: Boolean,
      },
      default: new Map(),
    },
    // Path/career info
    selectedPath: {
      type: String,
      enum: ["placement", "higher-studies"],
      default: "placement",
    },
    careerInterest: String,
    skillLevel: String,
    qualification: String,
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
progressSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Progress", progressSchema);