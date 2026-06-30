
import axios from 'axios';
import RoadmapGeneratorService from './roadmapGeneratorService.js';
import UserRoadmap from '../models/UserRoadmap.js';
import User from '../models/User.js';

class RoadmapService {
  constructor() {
    this.aiService = null;
    this.staticConfig = {
      // Fallback static roadmaps (from your Roadmap.jsx)
      placement: {
        FSD: { /* your static FSD config */ },
        ds: { /* your static DS config */ },
        ai: { /* your static AI config */ },
        cyber: { /* your static cyber config */ },
      },
      'higher-studies': {
        fullstack: { /* your static GATE config */ },
        'data-science': { /* your static GRE config */ },
        'ai-ml': { /* your static CAT config */ },
      },
    };
  }


  initializeAIService() {
    if (!this.aiService) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        console.warn('⚠️  GROQ_API_KEY not set - AI roadmap generation disabled, using fallback');
        return false;
      }
      this.aiService = new RoadmapGeneratorService(apiKey);
      return true;
    }
    return true;
  }

  async generateRoadmap(userId, studentProfile) {
    try {
      let roadmap = null;
      let generatedBy = null;

      // ──────────────────────────────────────────
      // STRATEGY 1: Try Local ML Engine
      // ──────────────────────────────────────────
      try {
        const localResult = await this.callLocalMlEngine(studentProfile);
        if (localResult && localResult.success && localResult.data) {
          roadmap = localResult.data;
          generatedBy = 'Local ML Engine';
        }
      } catch (localError) {
        console.warn(`⚠️  Local ML engine failed: ${localError.message}`);
      }

      // ──────────────────────────────────────────
      // STRATEGY 2: Try Groq AI Generation
      // ──────────────────────────────────────────
      if (!roadmap) {
        const aiAvailable = this.initializeAIService();
        
        if (aiAvailable) {
          try {
            const aiResult = await this.aiService.generateRoadmap(studentProfile);
            
            if (aiResult.success) {
              roadmap = aiResult.roadmap;
              generatedBy = 'AI (Groq)';
            }
          } catch (aiError) {
            console.warn(`⚠️  AI generation failed: ${aiError.message}`);
          }
        }
      }

      // ──────────────────────────────────────────
      // STRATEGY 3: Fallback to Static Roadmap
      // ──────────────────────────────────────────
      if (!roadmap) {
        roadmap = this.generateStaticRoadmap(studentProfile);
        generatedBy = 'Static (Hardcoded)';
      }

      // ──────────────────────────────────────────
      // STRATEGY 3: Enrich & Persist
      // ──────────────────────────────────────────
      const enrichedRoadmap = this.enrichRoadmap(roadmap, studentProfile);
      
      // Save to database
      await this.saveRoadmap(userId, enrichedRoadmap, generatedBy);

      return {
        success: true,
        roadmap: enrichedRoadmap,
        generatedBy,
        message: `Roadmap generated successfully using ${generatedBy}`,
      };

    } catch (error) {
      console.error('❌ Roadmap generation fatal error:', error.message);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }


  generateStaticRoadmap(studentProfile) {
    const { branch, careerInterest, currentYear } = studentProfile;

    // Determine learning path based on career interest
    let pathType = 'placement'; // default
    let pathKey = 'FSD'; // default

    // Map career interest to predefined path
    const careerToPathMap = {
      'Full Stack Development': { path: 'placement', key: 'FSD' },
      'Data Science': { path: 'placement', key: 'ds' },
      'AI/ML': { path: 'placement', key: 'ai' },
      'Cybersecurity': { path: 'placement', key: 'cyber' },
      'GATE': { path: 'higher-studies', key: 'fullstack' },
      'GRE': { path: 'higher-studies', key: 'data-science' },
      'CAT': { path: 'higher-studies', key: 'ai-ml' },
    };

    const mapping = careerToPathMap[careerInterest] || careerToPathMap['Full Stack Development'];
    pathType = mapping.path;
    pathKey = mapping.key;

    // Get learning parameters
    const learningParams = this.calculateLearningParameters(currentYear);

    // Convert static steps to AI-like structure
    const phases = this.convertStaticStepsToPhases(careerInterest, learningParams);
    const dailyBreakdown = this.generateDailyBreakdown(phases, learningParams);
    const milestones = this.generateMilestones(phases, learningParams);

    return {
      id: this.generateRoadmapId(),
      studentProfile,
      learningParams,
      phases,
      dailyBreakdown,
      milestones,
      recommendedResources: {
        books: [],
        courses: [],
        websites: [],
        tools: [],
      },
      createdAt: new Date(),
      status: 'active',
      progress: {
        completedDays: 0,
        totalDays: dailyBreakdown.length,
        completionPercentage: 0,
      },
    };
  }

  calculateLearningParameters(year) {
    const totalMonthsRemaining = (5 - year) * 12;
    
    const intensityMap = {
      1: { multiplier: 1.0, pace: 'normal', focus: 'foundational' },
      2: { multiplier: 1.3, pace: 'moderate', focus: 'intermediate' },
      3: { multiplier: 1.6, pace: 'fast', focus: 'advanced' },
      4: { multiplier: 2.0, pace: 'intensive', focus: 'placement-ready' },
    };

    const intensity = intensityMap[year] || intensityMap[1];

    return {
      totalMonthsRemaining,
      monthsPerPhase: Math.ceil(totalMonthsRemaining / 4),
      intensityMultiplier: intensity.multiplier,
      learningPace: intensity.pace,
      focusArea: intensity.focus,
    };
  }

  mapYearToExperience(year) {
    if (year >= 4) return 'Advanced';
    if (year >= 3) return 'Intermediate';
    return 'Beginner';
  }

  deriveHoursPerDay(year) {
    if (year >= 4) return 4;
    if (year === 3) return 3;
    return 2;
  }

  async callLocalMlEngine(studentProfile) {
    const url = process.env.ML_ENGINE_URL || 'http://localhost:5001/generate-roadmap';
    const payload = {
      career: studentProfile.careerInterest,
      experience: this.mapYearToExperience(studentProfile.currentYear),
      skills: `${studentProfile.branch}, ${studentProfile.careerInterest}`,
      hoursPerDay: this.deriveHoursPerDay(studentProfile.currentYear),
    };

    const response = await axios.post(url, payload, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }


  convertStaticStepsToPhases(careerInterest, learningParams) {
    // This creates 4 phases from static steps
    return [
      {
        phaseNumber: 1,
        duration: `${learningParams.monthsPerPhase} months`,
        title: `Phase 1: Foundations - ${careerInterest}`,
        focus: 'Core fundamentals',
        objectives: ['Learn basics', 'Build foundation', 'Setup environment'],
        topics: [],
        weeklyTasks: [],
        projects: [],
        skills: [],
        status: 'not-started',
      },
      {
        phaseNumber: 2,
        duration: `${learningParams.monthsPerPhase} months`,
        title: `Phase 2: Intermediate - ${careerInterest}`,
        focus: 'Practical skills',
        objectives: ['Apply concepts', 'Build projects', 'Hands-on practice'],
        topics: [],
        weeklyTasks: [],
        projects: [],
        skills: [],
        status: 'not-started',
      },
      {
        phaseNumber: 3,
        duration: `${learningParams.monthsPerPhase} months`,
        title: `Phase 3: Advanced - ${careerInterest}`,
        focus: 'Advanced topics',
        objectives: ['Master advanced concepts', 'Complex projects'],
        topics: [],
        weeklyTasks: [],
        projects: [],
        skills: [],
        status: 'not-started',
      },
      {
        phaseNumber: 4,
        duration: `${learningParams.monthsPerPhase} months`,
        title: `Phase 4: Placement Ready - ${careerInterest}`,
        focus: 'Interview & deployment ready',
        objectives: ['Polish portfolio', 'Interview prep', 'Deploy projects'],
        topics: [],
        weeklyTasks: [],
        projects: [],
        skills: [],
        status: 'not-started',
      },
    ];
  }


  generateDailyBreakdown(phases, learningParams) {
    const dailyBreakdown = [];
    const daysPerPhase = 90; // 90 days per phase

    for (let day = 1; day <= 360; day++) {
      const phaseNumber = Math.ceil(day / daysPerPhase);
      
      dailyBreakdown.push({
        day,
        phase: Math.min(phaseNumber, 4),
        topic: phases[Math.min(phaseNumber - 1, 3)].title,
        tasks: [
          {
            taskId: `task_${day}_001`,
            description: `Daily learning task ${day}`,
            duration: '30-45 minutes',
            type: day % 3 === 0 ? 'theory' : 'practical',
            resources: [],
          },
        ],
        practiceProblems: Math.ceil(day / 10),
        estimatedXP: 50 + (day % 50),
        completionStatus: 'pending',
      });
    }

    return dailyBreakdown;
  }


  generateMilestones(phases, learningParams) {
    return [
      {
        month: 1,
        milestone: 'Complete Phase 1 foundations',
        expectedSkills: ['Basic knowledge', 'Setup complete'],
        projects: [],
        completed: false,
      },
      {
        month: 3,
        milestone: 'Complete Phase 2 with first project',
        expectedSkills: ['Practical application', 'Project completion'],
        projects: ['First mini project'],
        completed: false,
      },
      {
        month: 6,
        milestone: 'Complete Phase 3 advanced topics',
        expectedSkills: ['Advanced concepts', 'Complex problem solving'],
        projects: ['Advanced project'],
        completed: false,
      },
      {
        month: 12,
        milestone: 'Interview ready with portfolio',
        expectedSkills: ['Interview skills', 'Portfolio ready'],
        projects: ['Capstone project'],
        completed: false,
      },
    ];
  }


  enrichRoadmap(roadmap, studentProfile) {
    return {
      ...roadmap,
      roadmapId: roadmap.id || this.generateRoadmapId(),
      studentProfile,
      generatedAt: new Date(),
      status: 'active',
    };
  }


  async saveRoadmap(userId, roadmap, generatedBy) {
    try {
      // Delete old roadmap if exists
      await UserRoadmap.findOneAndDelete({ userId });

      // Create new roadmap
      const savedRoadmap = await UserRoadmap.create({
        userId,
        roadmapId: roadmap.roadmapId,
        studentProfile: roadmap.studentProfile,
        learningParams: roadmap.learningParams,
        phases: roadmap.phases,
        dailyBreakdown: roadmap.dailyBreakdown,
        milestones: roadmap.milestones,
        recommendedResources: roadmap.recommendedResources,
        progress: {
          completedDays: 0,
          totalDays: roadmap.dailyBreakdown.length,
          completionPercentage: 0,
          totalXPGained: 0,
          lastAccessedDay: 0,
          lastAccessedAt: new Date(),
        },
        status: 'active',
        generatedAt: new Date(),
      });

      
      return savedRoadmap;
    } catch (error) {
      console.error('❌ Error saving roadmap:', error.message);
      throw new Error(`Failed to save roadmap: ${error.message}`);
    }
  }


  async getUserRoadmap(userId) {
    try {
      const roadmap = await UserRoadmap.findOne({ userId }).lean();
      
      if (!roadmap) {
        return null;
      }

      return roadmap;
    } catch (error) {
      console.error('❌ Error fetching user roadmap:', error.message);
      throw new Error(`Failed to fetch roadmap: ${error.message}`);
    }
  }


  async getDailyTasks(userId, day) {
    try {
      const roadmap = await UserRoadmap.findOne({ userId }).lean();
      
      if (!roadmap) {
        return null;
      }

      const dailyTask = roadmap.dailyBreakdown.find(d => d.day === parseInt(day));
      return dailyTask || null;
    } catch (error) {
      console.error('❌ Error fetching daily tasks:', error.message);
      throw new Error(`Failed to fetch daily tasks: ${error.message}`);
    }
  }


  async updateProgress(userId, completedTaskIds) {
    try {
      const roadmap = await UserRoadmap.findOne({ userId });
      
      if (!roadmap) {
        throw new Error('Roadmap not found');
      }

      // Mark tasks as completed
      completedTaskIds.forEach(taskId => {
        const task = roadmap.dailyBreakdown.flatMap(d => d.tasks)
          .find(t => t.taskId === taskId);
        
        if (task) {
          task.completed = true;
          task.completedAt = new Date();
        }
      });

      // Calculate progress
      const totalTasks = roadmap.dailyBreakdown.reduce(
        (sum, day) => sum + day.tasks.length,
        0
      );
      
      const completedTasks = roadmap.dailyBreakdown
        .flatMap(d => d.tasks)
        .filter(t => t.completed).length;

      roadmap.progress.completedDays = Math.ceil(completedTasks / 
        (totalTasks / roadmap.dailyBreakdown.length));
      roadmap.progress.completionPercentage = Math.round(
        (completedTasks / totalTasks) * 100
      );
      roadmap.progress.totalXPGained += completedTaskIds.length * 50; // 50 XP per task
      roadmap.progress.lastAccessedAt = new Date();

      await roadmap.save();

      return {
        success: true,
        progress: roadmap.progress,
        message: 'Progress updated successfully',
      };
    } catch (error) {
      console.error('❌ Error updating progress:', error.message);
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  }


  async deleteRoadmap(userId) {
    try {
      const result = await UserRoadmap.deleteOne({ userId });
      
      if (result.deletedCount === 0) {
        throw new Error('Roadmap not found');
      }

      return {
        success: true,
        message: 'Roadmap deleted successfully',
      };
    } catch (error) {
      console.error('❌ Error deleting roadmap:', error.message);
      throw new Error(`Failed to delete roadmap: ${error.message}`);
    }
  }


  generateRoadmapId() {
    return `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new RoadmapService();