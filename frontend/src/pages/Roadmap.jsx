import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  BookOpen,
  PlayCircle,
  ExternalLink,
} from "lucide-react";

const ROADMAP_CONFIG = {
  placement: {
    FSD: {
      title: "Full Stack Development Roadmap",
      subtitle: "From core fundamentals to deployment-ready projects.",
      steps: [
        {
          id: "foundations",
          label: "Programming & Web Basics",
          duration: "2 Days",
          description:
            "Get comfortable with JavaScript, HTML, CSS, Git, and basic problem solving.",
          resources: [
            {
              type: "Course",
              label: "Introduction to Web Development",
              url: "https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w",
            },
            {
              type: "Practice",
              label: "Create your first website",
              url: "https://www.youtube.com/watch?v=tVzUXW6siu0&start=368&end=674"
            },
          ],
        },
        {
          id: "frontend",
          label: "Heading, Paragraphs and Links ",
          duration: "2 Days",
          description:
            "Learn Heading, Paragraphs and Links in HTML.",
          resources: [
            {
              type: "Course",
              label: "Basics of HTML",
              url: "https://www.youtube.com/watch?v=nXba2-mgn1k&list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w&index=4",
            },
          ],
        },
        {
          id: "frontend",
          label: "Image, Lists, and Tables in HTML",
          duration: "2 Days",
          description:
            "Learn Image, Lists, and Tables in HTML.",
          resources: [
            {
              type: "Learning",
              label: "Learn Image, Lists, and Tables in HTML",
              url: "https://www.youtube.com/watch?v=nXba2-mgn1k&list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w&index=4"
            },
          ],
        },
        {
          id: "projects",
          label: "Capstone Projects & Interview Prep",
          duration: "3–6 weeks",
          description:
            "Ship 1–2 polished projects and prepare for system design + tech interviews.",
          resources: [
            {
              type: "Project",
              label: "Full Stack MERN Project",
              url: "https://github.com/topics/mern-stack",
            },
            {
              type: "Interview",
              label: "Interview Preparation",
              url: "https://www.interviewbit.com/",
            },
          ],
        },
      ],
    },
    ds: {
      title: "Data Science Roadmap",
      subtitle: "From statistics to production-ready ML models.",
      steps: [
        {
          id: "python-basics",
          label: "Python & Math Foundations",
          duration: "2–4 weeks",
          description:
            "Learn Python, NumPy, and the core statistics/linear algebra you’ll use daily.",
          resources: [
            {
              type: "Course",
              label: "Python for Everybody",
              url: "https://www.py4e.com/lessons",
            },
            {
              type: "Notes",
              label: "Khan Academy – Statistics",
              url: "https://www.khanacademy.org/math/statistics-probability",
            },
          ],
        },
        {
          id: "eda-ml",
          label: "EDA & Classical ML",
          duration: "3–5 weeks",
          description:
            "Practice exploratory data analysis, feature engineering, and core ML algorithms.",
          resources: [
            {
              type: "Course",
              label: "scikit-learn Tutorial",
              url: "https://scikit-learn.org/stable/tutorial/index.html",
            },
            {
              type: "Practice",
              label: "Kaggle Getting Started",
              url: "https://www.kaggle.com/learn",
            },
          ],
        },
        {
          id: "ml-systems",
          label: "Model Deployment & Systems",
          duration: "3–4 weeks",
          description:
            "Learn how to serve models, build simple APIs, and monitor performance.",
          resources: [
            {
              type: "Course",
              label: "ML in Production",
              url: "https://madewithml.com/",
            },
          ],
        },
      ],
    },
    ai: {
      title: "AI & Machine Learning Roadmap",
      subtitle: "From ML foundations to modern deep learning.",
      steps: [
        {
          id: "math-ml",
          label: "ML Math & Foundations",
          duration: "3–4 weeks",
          description:
            "Strengthen linear algebra, calculus, and probability with ML in mind.",
          resources: [
            {
              type: "Course",
              label: "Mathematics for ML",
              url: "https://www.coursera.org/specializations/mathematics-machine-learning",
            },
          ],
        },
        {
          id: "ml-core",
          label: "Core ML Algorithms",
          duration: "3–5 weeks",
          description:
            "Implement and understand regression, classification, trees, ensembles, and clustering.",
          resources: [
            {
              type: "Book",
              label: "Hands-On ML with Scikit-Learn & TensorFlow",
              url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/",
            },
          ],
        },
        {
          id: "deep-learning",
          label: "Deep Learning & DL Projects",
          duration: "3–6 weeks",
          description:
            "Learn neural networks, CNNs/RNNs, and build end-to-end DL projects.",
          resources: [
            {
              type: "Course",
              label: "Deep Learning Specialization",
              url: "https://www.coursera.org/specializations/deep-learning",
            },
          ],
        },
      ],
    },
    cyber: {
      title: "Cybersecurity Roadmap",
      subtitle: "From networking basics to hands-on security labs.",
      steps: [
        {
          id: "networking",
          label: "Networking & OS Basics",
          duration: "2–4 weeks",
          description:
            "Understand how the internet works, TCP/IP, Linux basics, and system internals.",
          resources: [
            {
              type: "Course",
              label: "Computer Networking Basics",
              url: "https://www.geeksforgeeks.org/computer-network-tutorials/",
            },
          ],
        },
        {
          id: "security-fundamentals",
          label: "Security Fundamentals",
          duration: "3–5 weeks",
          description:
            "Learn common vulnerabilities, OWASP Top 10, and secure coding practices.",
          resources: [
            {
              type: "Docs",
              label: "OWASP Top 10",
              url: "https://owasp.org/www-project-top-ten/",
            },
          ],
        },
        {
          id: "hands-on",
          label: "Hands-on Labs & CTF",
          duration: "Ongoing",
          description:
            "Practice with labs, CTFs, and real-world security challenges.",
          resources: [
            {
              type: "Practice",
              label: "TryHackMe Labs",
              url: "https://tryhackme.com/",
            },
          ],
        },
      ],
    },
  },
  "higher-studies": {
    fullstack: {
      title: "GATE Preparation Roadmap",
      subtitle: "Structured preparation for competitive engineering exams.",
      steps: [
        {
          id: "syllabus",
          label: "Understand Syllabus & Weightage",
          duration: "3–5 days",
          description:
            "Map your branch syllabus, past trends, and decide focus subjects.",
          resources: [
            {
              type: "Docs",
              label: "Official GATE Syllabus",
              url: "https://gate.iitkgp.ac.in/",
            },
          ],
        },
        {
          id: "concepts",
          label: "Core Concepts & Notes",
          duration: "6–10 weeks",
          description:
            "Cover each subject with handwritten notes and standard textbooks.",
          resources: [
            {
              type: "Course",
              label: "NPTEL / GATE Lectures",
              url: "https://nptel.ac.in/",
            },
          ],
        },
        {
          id: "tests",
          label: "Mocks & Revision",
          duration: "4–6 weeks",
          description:
            "Attempt full-length mocks, analyze mistakes, and revise weak topics.",
          resources: [
            {
              type: "Practice",
              label: "GATE Mock Tests",
              url: "https://testbook.com/gate-cs-test-series",
            },
          ],
        },
      ],
    },
    "data-science": {
      title: "GRE Preparation Roadmap",
      subtitle: "Plan for strong quant, verbal, and AWA scores.",
      steps: [
        {
          id: "diagnostic",
          label: "Diagnostic Test & Plan",
          duration: "2–3 days",
          description:
            "Attempt a full-length mock to identify your baseline and gaps.",
          resources: [
            {
              type: "Practice",
              label: "Free GRE Mock",
              url: "https://www.ets.org/gre",
            },
          ],
        },
        {
          id: "quant-verbal",
          label: "Quant & Verbal Foundations",
          duration: "4–8 weeks",
          description:
            "Strengthen core quant topics and build vocabulary + reading skills.",
          resources: [
            {
              type: "Book",
              label: "Official GRE Guide",
              url: "https://www.ets.org/gre/test-takers/general-test/prepare/books.html",
            },
          ],
        },
        {
          id: "practice-mocks",
          label: "Timed Practice & Mocks",
          duration: "4–6 weeks",
          description:
            "Do section-wise practice, timed sets, and full mocks with analysis.",
          resources: [
            {
              type: "Practice",
              label: "GRE Practice Sets",
              url: "https://www.manhattanprep.com/gre/resources/",
            },
          ],
        },
      ],
    },
    "ai-ml": {
      title: "CAT Preparation Roadmap",
      subtitle: "Balanced focus on QA, VARC, and DILR.",
      steps: [
        {
          id: "basics",
          label: "Concept Building",
          duration: "4–8 weeks",
          description:
            "Cover basics of QA, grammar, reading skills, and puzzle-based reasoning.",
          resources: [
            {
              type: "Book",
              label: "How to Prepare for Quantitative Aptitude – Arun Sharma",
              url: "https://www.amazon.in/",
            },
          ],
        },
        {
          id: "sectional",
          label: "Sectional Practice",
          duration: "4–6 weeks",
          description:
            "Solve topic-wise sets for QA, VARC, and DILR with increasing difficulty.",
          resources: [
            {
              type: "Practice",
              label: "CAT Topic Tests",
              url: "https://www.handakafunda.com/",
            },
          ],
        },
        {
          id: "full-mocks",
          label: "Full Mocks & Analysis",
          duration: "4–6 weeks",
          description:
            "Attempt proctored mocks in exam-like conditions and analyze thoroughly.",
          resources: [
            {
              type: "Practice",
              label: "CAT Mock Test Series",
              url: "https://www.time4education.com/",
            },
          ],
        },
      ],
    },
  },
};

function loadProgress(path, interest) {
  try {
    const raw = localStorage.getItem(
      `roadmapProgress::${path}::${interest}`
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveProgress(path, interest, completedIds) {
  try {
    localStorage.setItem(
      `roadmapProgress::${path}::${interest}`,
      JSON.stringify(completedIds)
    );
  } catch {
    // ignore write errors
  }
}

export default function Roadmap() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState(null);
  const [careerInterest, setCareerInterest] = useState(null);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const path = localStorage.getItem("selectedPath");
    const interest = localStorage.getItem("careerInterest");
    setSelectedPath(path);
    setCareerInterest(interest);
    if (path && interest) {
      setCompleted(loadProgress(path, interest));
    }
  }, []);

  const config = useMemo(() => {
    if (!selectedPath || !careerInterest) return null;
    const pathConfig = ROADMAP_CONFIG[selectedPath];
    if (!pathConfig) return null;
    return pathConfig[careerInterest] || null;
  }, [selectedPath, careerInterest]);

  const totalSteps = config?.steps?.length || 0;
  const completedCount = completed.length;
  const progressPercent =
    totalSteps === 0 ? 0 : Math.round((completedCount / totalSteps) * 100);

  const handleToggleStep = (stepId) => {
    if (!selectedPath || !careerInterest) return;

    setCompleted((prev) => {
      const exists = prev.includes(stepId);
      const updated = exists
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId];
      saveProgress(selectedPath, careerInterest, updated);
      return updated;
    });
  };

  const showMissingData = !selectedPath || !careerInterest;
  const showMissingConfig = !showMissingData && !config;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">
              Your Personalized Roadmap
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
              {config?.title || "Learning Roadmap"}
            </h1>
            {config?.subtitle && (
              <p className="text-gray-600 mt-2">{config.subtitle}</p>
            )}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-white shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          {showMissingData && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Complete your onboarding first
              </h2>
              <p className="text-gray-600 mb-4">
                We couldn&apos;t find your selected path or career interest.
                Tell us about yourself so we can build a personalized roadmap.
              </p>
              <button
                onClick={() => navigate("/path-selection")}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-md hover:shadow-lg"
              >
                Go to Path Selection
              </button>
            </div>
          )}

          {showMissingConfig && (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Roadmap coming soon
              </h2>
              <p className="text-gray-600">
                We don&apos;t have a predefined roadmap yet for this
                combination. Try selecting a different career interest.
              </p>
            </div>
          )}

          {!showMissingData && config && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Path:{" "}
                    <span className="font-medium text-gray-800">
                      {selectedPath === "placement"
                        ? "Placement"
                        : "Higher Studies"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Interest:{" "}
                    <span className="font-medium text-gray-800">
                      {careerInterest}
                    </span>
                  </p>
                </div>

                <div className="w-full md:w-72">
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>
                      Progress: {completedCount}/{totalSteps} milestones
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-1">
                Tip: Mark each milestone as completed as you progress. Your
                progress is stored on this device.
              </p>
            </>
          )}
        </div>

        {!showMissingData && config && (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 md:p-8">
            <div className="relative">
              <div className="absolute left-4 md:left-6 top-0 bottom-0 border-l border-dashed border-indigo-200 pointer-events-none" />

              <div className="space-y-8 relative">
                {config.steps.map((step, index) => {
                  const isCompleted = completed.includes(step.id);
                  const isActive =
                    !isCompleted &&
                    (index === 0 ||
                      completed.includes(config.steps[index - 1].id));

                  return (
                    <div
                      key={step.id}
                      className="flex gap-4 md:gap-6 items-start relative"
                    >
                      <div className="flex flex-col items-center pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStep(step.id)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 shadow-sm transition-colors ${isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : isActive
                                ? "bg-white border-indigo-400 text-indigo-500"
                                : "bg-white border-gray-300 text-gray-300"
                            }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                        {index < config.steps.length - 1 && (
                          <div className="flex-1 w-px bg-indigo-100 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 bg-indigo-50/60 rounded-2xl p-4 md:p-5 border border-indigo-100">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                              Step {index + 1}
                            </p>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                              {step.label}
                            </h3>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-xs font-medium text-gray-700 shadow-sm border border-indigo-100">
                            ⏱ {step.duration}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                          {step.description}
                        </p>

                        {step.resources && step.resources.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                              <BookOpen size={14} />
                              Recommended Resources
                            </p>
                            <div className="grid md:grid-cols-2 gap-2">
                              {step.resources.map((res) => (
                                <a
                                  key={res.label}
                                  href={res.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white text-sm border border-indigo-50 hover:border-indigo-200 hover:shadow-sm transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600">
                                      {res.type}
                                    </span>
                                    <span className="text-gray-800 group-hover:text-indigo-700">
                                      {res.label}
                                    </span>
                                  </div>
                                  <ExternalLink
                                    size={14}
                                    className="text-indigo-400 group-hover:text-indigo-600"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">
                  Next Action
                </p>
                <p className="text-lg font-semibold">
                  {completedCount === 0
                    ? "Start with the first milestone and block 1–2 hours this week."
                    : completedCount === totalSteps
                      ? "Amazing! You’ve completed this roadmap. Keep revising and deepening your knowledge."
                      : "Pick the next milestone and schedule focused study/practice time."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-sm font-semibold shadow-sm"
              >
                <PlayCircle size={18} />
                Jump to top
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

