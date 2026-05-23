import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one progress doc per user
    },

    // Map of day → completed task IDs
    // e.g. { "day_1": ["task_1", "task_2"] }
    completedTasks: {
      type: Map,
      of: [String],
      default: {},
    },

    // Map of day → fully completed boolean
    // e.g. { "day_1": true }
    completedDays: {
      type: Map,
      of: Boolean,
      default: {},
    },

    // Map of quiz key → completed boolean
    quizCompleted: {
      type: Map,
      of: Boolean,
      default: {},
    },

    // Streak tracking
    streak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastStudyDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Progress", progressSchema);