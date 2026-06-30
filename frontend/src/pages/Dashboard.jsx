import { useNavigate } from "react-router-dom";
import { useAppStore, ALL_BADGES } from "@/store/useAppStore";
import { getPathDays } from "@/data/pathTasks/pathMapper";
import { getStoredUser } from "@/lib/store";
import { getUserProgress } from "@/services/api"; // ← ADD THIS IMPORT
import { useEffect, useState } from "react";
import RoadmapGenerator from "@/comps/ui/RoadmapGenerator";

const PATH_LABELS = {
  "Full Stack Development": "Full Stack Dev",
  "Data Science": "Data Science",
  "AI/ML": "AI / Machine Learning",
  "Cloud Computing": "Cloud Computing",
  "Cybersecurity": "Cybersecurity",
  "GATE": "GATE Prep",
  "GRE": "GRE Prep",
  "CAT": "CAT Prep",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const onboardingData = useAppStore((s) => s.onboardingData);
  const getPathKey = useAppStore((s) => s.getPathKey);
  const setProgress = useAppStore((s) => s.setProgress);
  const completedDays = useAppStore((s) => s.completedDays);
  const streak = useAppStore((s) => s.streak);
  const badges = useAppStore((s) => s.badges);
  const xp = useAppStore((s) => s.xp);
  const level = useAppStore((s) => s.level);

  // ✅ ADD THIS STATE - manages which tab is active
  const [activeTab, setActiveTab] = useState('dashboard');

  const [loadingProgress, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── FETCH PROGRESS ON MOUNT ──
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const data = await getUserProgress(); // ✅ Fetch from backend
        setProgress(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [setProgress]);

  const pathKey = getPathKey();
  const pathDays = getPathDays(pathKey);
  const totalDays = Object.keys(pathDays).length;

  const careerLabel =
    PATH_LABELS[onboardingData.careerInterest] ||
    onboardingData.careerInterest ||
    "Your Path";
  const completedCount = completedDays.length;

  // XP to next level
  const xpInCurrentLevel = xp - (level - 1) * 200;
  const levelProgress = Math.min(
    Math.round((xpInCurrentLevel / 200) * 100),
    100
  );

  const handleDayClick = (dayNumber) => {
    const maxUnlocked = completedDays.length + 1;
    if (dayNumber > maxUnlocked) {
      alert(`Complete Day ${dayNumber - 1} first!`);
      return;
    }
    navigate(`/day/${dayNumber}`);
  };

  if (!pathDays || totalDays === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            No tasks found for your path.
          </p>
          <button
            onClick={() => navigate("/onboarding/step1")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Redo Onboarding
          </button>
        </div>
      </div>
    );
  }

  if (loadingProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            Error loading progress: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ── PAGE TITLE ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'dashboard' ? careerLabel + ' — Daily Tasks' : 'Your Roadmap'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab === 'dashboard' ? (
              <>
                {onboardingData.skillLevel && `${onboardingData.skillLevel} · `}
                {totalDays} days total
              </>
            ) : (
              'View your personalized learning path with milestones and resources'
            )}
          </p>
        </div>

        {/* ── 4 STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Day Streak — from DB */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {streak}
            </div>
            <div className="text-xs text-gray-400 mt-1">Day Streak</div>
          </div>

          {/* Total XP */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-3xl mb-1">⚡</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {xp}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total XP</div>
          </div>

          {/* Level */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-3xl mb-1">⭐</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              Lv. {level}
            </div>
            <div className="text-xs text-gray-400 mt-1">Level</div>
          </div>

          {/* Badges */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {badges.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Badges</div>
          </div>
        </div>

        {/* ── LEVEL PROGRESS BAR ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Level {level} → Level {level + 1}
            </span>
            <span className="text-purple-600 font-semibold">
              {xpInCurrentLevel} / 200 XP
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* ── TAB NAVIGATION (OPTIONAL BUT RECOMMENDED) ── */}
        <div className="mb-6 flex gap-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            📊 Daily Tasks
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`pb-3 px-4 font-medium transition ${
              activeTab === 'roadmap'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            📍 Roadmap
          </button>
        </div>

        {/* ── MAIN + SIDEBAR ── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── LEFT: MAIN CONTENT AREA ── */}
          <div className="flex-1">
            {/* ── DASHBOARD TAB ── */}
            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.keys(pathDays).map((dayKey, index) => {
                    const dayNumber = index + 1;
                    const dayData = pathDays[dayKey];
                    // ✅ Check against DB completedDaysList (array of day numbers)
                    const isDone = completedDays.includes(dayNumber);
                    const isUnlocked = dayNumber <= completedDays.length + 1;
                    const isCurrent = dayNumber === completedDays.length + 1;

                    return (
                      <div
                        key={dayKey}
                        onClick={() => handleDayClick(dayNumber)}
                        className={`
                          relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-200
                          ${isDone
                            ? "bg-purple-50 dark:bg-purple-950 border-purple-300"
                            : isCurrent
                              ? "bg-white dark:bg-gray-900 border-purple-500 shadow-md hover:shadow-lg"
                              : isUnlocked
                                ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-400"
                                : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-50"
                          }
                        `}
                      >
                        <div
                          className={`
                          absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full
                          ${isDone
                              ? "bg-purple-100 text-purple-700"
                              : isCurrent
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                            }
                        `}
                        >
                          {isDone ? "✓ Done" : isCurrent ? "Active" : "🔒"}
                        </div>

                        <div
                          className={`
                          w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mb-3
                          ${isDone
                              ? "bg-purple-600 text-white"
                              : isCurrent
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                            }
                        `}
                        >
                          {dayNumber}
                        </div>

                        <h3
                          className={`font-semibold text-sm mb-1 pr-16 ${isDone
                              ? "text-purple-800 dark:text-purple-300"
                              : "text-gray-800 dark:text-gray-200"
                            }`}
                        >
                          Day {dayNumber}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {dayData?.tasks?.length || 0} tasks ·
                          +{(dayData?.tasks?.length || 0) * 50 +
                            (dayData?.quiz?.length || 0) * 10}{" "}
                          XP
                        </p>
                      </div>
                    );
                  })}
                </div>

                {completedCount === totalDays && totalDays > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 text-center shadow-xl">
                    <div className="text-5xl mb-3">🎉</div>
                    <h2 className="text-2xl font-bold mb-2">Path Complete!</h2>
                    <p className="text-purple-200">
                      You finished all {totalDays} days. Incredible work!
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── ROADMAP TAB ── */}
            {activeTab === 'roadmap' && <RoadmapGenerator />}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:w-80 flex flex-col gap-5">
            {/* Badges */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                🏆 Badges
              </h3>
              <div className="space-y-3">
                {ALL_BADGES.map((badge) => {
                  const earned = badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-3 p-2 rounded-xl transition ${earned ? "" : "opacity-40"
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${earned ? "bg-yellow-50" : "bg-gray-100 dark:bg-gray-800"
                          }`}
                      >
                        {badge.emoji}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${earned
                              ? "text-gray-800 dark:text-white"
                              : "text-gray-400"
                            }`}
                        >
                          {badge.label}
                        </p>
                        <p className="text-xs text-gray-400">{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Navigation to Roadmap */}
            {activeTab === 'dashboard' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                <div className="text-4xl mb-3">🗺️</div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                  Your Roadmap
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  View your personalized step-by-step learning path with
                  milestones and resources.
                </p>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  📍 View Roadmap
                </button>
              </div>
            )}

            {/* Profile */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                📋 Profile
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Name", value: user?.name || "—" },
                  { label: "Email", value: user?.email || "—" },
                  {
                    label: "Path",
                    value:
                      onboardingData.selectedPath === "placement"
                        ? "Placement"
                        : "Higher Studies",
                  },
                  {
                    label: "Interest",
                    value: onboardingData.careerInterest || "—",
                  },
                  {
                    label: "Qualification",
                    value: onboardingData.qualification || "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}