// # CareerKraft Roadmap Generator - Detailed Merge Guide

// ## Overview

// This guide walks you through merging the AI-powered roadmap generator into your existing CareerKraft project structure. We'll preserve your existing code and add new AI capabilities alongside it.

// ---

// ## Part 1: Backend Integration

// ### Step 1.1: Update `backend/models/UserRoadmap.js`

// **Current Status:** You have `UserRoadmap.js` - we'll enhance it

// **Location:** `backend/models/UserRoadmap.js`

// **Action:** Replace the entire file with this merged schema:

// javascript
import mongoose from 'mongoose';

// Daily Task Schema (NEW)
const DailyTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: String,
  type: {
    type: String,
    enum: ['theory', 'practical', 'assignment', 'project', 'quiz', 'practice', 'coding', 'reading', 'video', 'review'],
  },
  resources: [String],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
});

// Daily Breakdown Schema (NEW)
const DailyBreakdownSchema = new mongoose.Schema({
  day: Number,
  phase: Number,
  topic: String,
  tasks: [DailyTaskSchema],
  practiceProblems: Number,
  estimatedXP: Number,
  completionStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
});

// Topic Schema (NEW)
const TopicSchema = new mongoose.Schema({
  name: String,
  duration: String,
  subtopics: [String],
  resources: [String],
});

// Weekly Task Schema (NEW)
const WeeklyTaskSchema = new mongoose.Schema({
  week: Number,
  goals: [String],
  assignments: [String],
});

// Phase Schema (NEW)
const PhaseSchema = new mongoose.Schema({
  phaseNumber: Number,
  duration: String,
  title: String,
  focus: String,
  objectives: [String],
  topics: [TopicSchema],
  weeklyTasks: [WeeklyTaskSchema],
  projects: [String],
  skills: [String],
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started',
  },
});

// Milestone Schema (NEW)
const MilestoneSchema = new mongoose.Schema({
  month: Number,
  milestone: String,
  expectedSkills: [String],
  projects: [String],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
});

// Main User Roadmap Schema (ENHANCED)
const UserRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // AI Generation Metadata (NEW)
    roadmapId: {
      type: String,
      unique: true,
      required: true,
    },
    
    // Student Profile (NEW - for AI generation)
    studentProfile: {
      qualification: {
        type: String,
        enum: ['BE/BTech', 'ME/MTech'],
      },
      currentYear: {
        type: Number,
        enum: [1, 2, 3, 4],
      },
      branch: {
        type: String,
        enum: [
          'AI & DS',
          'IT',
          'Computer Science',
          'E&TC',
          'Mechanical',
          'Civil',
          'Others',
        ],
      },
      careerInterest: {
        type: String,
        enum: [
          'Full Stack Development',
          'AI/ML',
          'Data Science',
          'Cybersecurity',
          'Cloud Computing',
          'DevOps',
          'App Development',
          'GATE',
          'GRE',
          'CAT',
          'Others',
        ],
      },
    },

    // Learning Parameters (NEW)
    learningParams: {
      totalMonthsRemaining: Number,
      monthsPerPhase: Number,
      intensityMultiplier: Number,
      learningPace: String,
      focusArea: String,
    },

    // AI-Generated Content (NEW)
    phases: [PhaseSchema],
    dailyBreakdown: [DailyBreakdownSchema],
    milestones: [MilestoneSchema],
    recommendedResources: {
      books: [String],
      courses: [String],
      websites: [String],
      tools: [String],
    },

    // YOUR EXISTING FIELDS - Keep all of these
    // Add your existing fields here
    // Example:
    // selectedPath: String,
    // customContent: [],
    // etc.

    // Progress Tracking (ENHANCED)
    progress: {
      completedDays: {
        type: Number,
        default: 0,
      },
      totalDays: Number,
      completionPercentage: {
        type: Number,
        default: 0,
      },
      totalXPGained: {
        type: Number,
        default: 0,
      },
      lastAccessedDay: Number,
      lastAccessedAt: Date,
      // Your existing fields
      // completedTasks: [],
      // etc.
    },

    // Status Management
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
    },

    // AI Generation Tracking
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    regeneratedAt: Date,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
UserRoadmapSchema.index({ userId: 1, createdAt: -1 });
UserRoadmapSchema.index({ userId: 1, status: 1 });

// Update progress percentage before saving
UserRoadmapSchema.pre('save', function (next) {
  if (this.progress.totalDays > 0) {
    this.progress.completionPercentage = Math.round(
      (this.progress.completedDays / this.progress.totalDays) * 100
    );
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('UserRoadmap', UserRoadmapSchema);