export const generateRoadmap = ({ goal, level, timePerDay, tenure }) => {

  // ===== TENURE → DAYS =====
  const daysMap = {
    "90 days": 90,
    "180 days": 180,
    "1 year": 365,
    "2 year": 730
  };

  const totalDays = daysMap[tenure] || 30;

  const roadmap = {
    path: goal,
    days: []
  };

  // ===== DIFFICULTY =====
  let multiplier = 1;

  if (level === "beginner") multiplier = 1;
  else if (level === "intermediate") multiplier = 1.5;
  else if (level === "advanced") multiplier = 2;

  const tasksPerDay = Math.max(1, Math.floor(timePerDay * multiplier));

  // ===== TOPICS =====
  const topics = {
    "AI Engineer": [
      "Python Basics",
      "Data Structures",
      "Linear Algebra",
      "Machine Learning",
      "Deep Learning",
      "Projects"
    ],
    "Full Stack": [
      "HTML CSS",
      "JavaScript",
      "React",
      "Node.js",
      "MongoDB",
      "Projects"
    ]
  };

  const selectedTopics = topics[goal] || ["General Programming"];

  // ===== GENERATE ROADMAP =====
  for (let i = 1; i <= totalDays; i++) {

    // 🔥 FIXED topic cycling
    const topic = selectedTopics[(i - 1) % selectedTopics.length];

    const tasks = Array.from({ length: tasksPerDay }, (_, j) => ({
      id: j + 1,
      title: `${topic} - Day ${i} Task ${j + 1}`,
      videoId: "dQw4w9WgXcQ",
      start: j * 300,
      end: (j + 1) * 300
    }));

    const quiz = [
      {
        question: `What did you learn in ${topic} on Day ${i}?`,
        options: ["Concept A", "Concept B", "Concept C"],
        answer: "Concept A"
      }
    ];

    roadmap.days.push({
      day: `day_${String(i).padStart(2, "0")}`,
      tasks,
      quiz
    });
  }

  return roadmap;
};