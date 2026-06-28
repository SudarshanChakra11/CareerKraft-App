

import axios from 'axios';

class RoadmapGeneratorService {
  constructor(apiKey) {
    this.groqApiKey = apiKey;
    this.groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'mixtral-8x7b-32768'; // Groq's fastest model
  }


  async callGroqAPI(prompt) {
    try {
      const response = await axios.post(
        this.groqBaseUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );


      return response.data;
    } catch (error) {
      console.error("Groq API Error:", error);
      throw new Error(`Groq API call failed: ${error.message}`);
    }
  }

  async generateRoadmap(studentProfile) {
    try {
      // Validate input
      this.validateStudentProfile(studentProfile);

      // Calculate learning parameters
      const learningParams = this.calculateLearningParameters(studentProfile);

      // Generate AI prompt
      const prompt = this.buildPrompt(studentProfile, learningParams);

      // Call AI API
      const aiResponse = await this.callGroqAPI(prompt);
      const roadmapText = aiResponse.choices[0].message.content;

      // Parse and structure the response
      const structuredRoadmap = this.parseRoadmapResponse(
        roadmapText,
        studentProfile,
        learningParams
      );

      return {
        success: true,
        roadmap: structuredRoadmap,
        metadata: {
          generatedAt: new Date(),
          studentProfile,
          learningParams,
        },
      };
    } catch (error) {
      console.error("Roadmap generation error:", error);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }

  validateStudentProfile(profile) {
    const required = ['qualification', 'currentYear', 'branch', 'careerInterest'];
    const missing = required.filter(field => !profile[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate year range
    const validYears = [1, 2, 3, 4];
    if (!validYears.includes(profile.currentYear)) {
      throw new Error('Current year must be 1, 2, 3, or 4');
    }
  }


  calculateLearningParameters(studentProfile) {
    const year = studentProfile.currentYear;
    const totalMonthsRemaining = (5 - year) * 12;

    // Intensity multipliers based on year
    const intensityMap = {
      1: { multiplier: 1.0, pace: 'normal', focus: 'foundational' },
      2: { multiplier: 1.3, pace: 'moderate', focus: 'intermediate' },
      3: { multiplier: 1.6, pace: 'fast', focus: 'advanced' },
      4: { multiplier: 2.0, pace: 'intensive', focus: 'placement-ready' },
    };

    const intensity = intensityMap[year];

    return {
      totalMonthsRemaining,
      monthsPerPhase: Math.ceil(totalMonthsRemaining / 4),
      intensityMultiplier: intensity.multiplier,
      learningPace: intensity.pace,
      focusArea: intensity.focus,
    };
  }

  
  buildPrompt(studentProfile, learningParams) {
    const { qualification, currentYear, branch, careerInterest } = studentProfile;
    const {
      totalMonthsRemaining,
      monthsPerPhase,
      intensityMultiplier,
      learningPace,
      focusArea,
    } = learningParams;

    return `You are an expert academic advisor and career mentor. Generate a highly personalized learning roadmap for an engineering student.

STUDENT PROFILE:
- Qualification: ${qualification}
- Current Year: ${currentYear}
- Branch/Department: ${branch}
- Career Interest: ${careerInterest}
- Time Remaining: ${totalMonthsRemaining} months
- Learning Pace: ${learningPace}
- Focus: ${focusArea}

ROADMAP REQUIREMENTS:
1. Create 4 phases based on remaining study years
2. Each phase should last approximately ${monthsPerPhase} months
3. Apply intensity multiplier of ${intensityMultiplier}x for accelerated learning
4. Include progression from foundational to advanced topics
5. Balance theory with practical implementation
6. Include industry-relevant tools and technologies
7. End with placement-focused projects and skills

RESPONSE FORMAT (MUST FOLLOW EXACTLY - Return only valid JSON):

{
  "phases": [
    {
      "phaseNumber": 1,
      "duration": "${monthsPerPhase} months",
      "title": "Phase 1 Title",
      "focus": "Main focus area",
      "objectives": ["obj1", "obj2", "obj3"],
      "topics": [
        {
          "name": "Topic Name",
          "duration": "2 weeks",
          "subtopics": ["sub1", "sub2"],
          "resources": ["resource1", "resource2"]
        }
      ],
      "weeklyTasks": [
        {
          "week": 1,
          "goals": ["goal1", "goal2"],
          "assignments": ["assignment1"]
        }
      ],
      "projects": ["project1", "project2"],
      "skills": ["skill1", "skill2"]
    }
  ],
  "dailyBreakdown": [
    {
      "day": 1,
      "phase": 1,
      "topic": "Topic Name",
      "tasks": [
        {
          "taskId": "task_001",
          "description": "Task description",
          "duration": "30 minutes",
          "type": "theory",
          "resources": ["link1"]
        }
      ],
      "practiceProblems": 5,
      "estimatedXP": 100
    }
  ],
  "milestones": [
    {
      "month": 3,
      "milestone": "Milestone name",
      "expectedSkills": ["skill1"],
      "projects": ["project1"]
    }
  ],
  "recommendedResources": {
    "books": ["book1"],
    "courses": ["course1"],
    "websites": ["website1"],
    "tools": ["tool1"]
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown, no explanation, just pure JSON.`;
  }


  parseRoadmapResponse(responseText, studentProfile, learningParams) {
    try {
      let roadmapData;

      // Try direct parse first
      try {
        roadmapData = JSON.parse(responseText);
      } catch (e) {
        // Extract JSON from markdown blocks
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          roadmapData = JSON.parse(jsonMatch[1]);
        } else {
          // Extract any JSON object
          const directMatch = responseText.match(/\{[\s\S]*\}/);
          if (directMatch) {
            roadmapData = JSON.parse(directMatch[0]);
          } else {
            throw new Error('No valid JSON found in AI response');
          }
        }
      }

      // Validate structure
      if (!roadmapData.phases || !Array.isArray(roadmapData.phases)) {
        throw new Error('Invalid roadmap structure: missing phases array');
      }

      // Return enriched roadmap
      return {
        id: this.generateRoadmapId(),
        studentProfile,
        learningParams,
        ...roadmapData,
        createdAt: new Date(),
        status: 'active',
        progress: {
          completedDays: 0,
          totalDays: roadmapData.dailyBreakdown?.length || 0,
          completionPercentage: 0,
        },
      };
    } catch (error) {
      console.error("Error parsing roadmap response:", error);

      if (process.env.NODE_ENV !== "production") {
        console.error(responseText.substring(0, 500));
      }
      throw new Error('Failed to parse roadmap data: ' + error.message);
    }
  }

  generateRoadmapId() {
    return `roadmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }


  async getUserRoadmap(userId) {
  }


  async saveRoadmap(userId, roadmap) {
  }


  async updateRoadmapProgress(userId, completedTaskIds) {
  }
}

export default RoadmapGeneratorService;