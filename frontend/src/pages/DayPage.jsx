import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { getPathDays } from "@/data/pathTasks/pathMapper";

export default function DayPage() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const dayNum = parseInt(dayNumber, 10);

  // ── Store ──
  const getPathKey       = useAppStore((s) => s.getPathKey);
  const completedTasks   = useAppStore((s) => s.completedTasks);   // { 1: ["1","2"], 2: [...] }
  const completedDays    = useAppStore((s) => s.completedDays);
  const addCompletedTask = useAppStore((s) => s.addCompletedTask);  // (dayNumber, taskId)
  const addQuizXP        = useAppStore((s) => s.addQuizXP);
  const addCompletedDay  = useAppStore((s) => s.addCompletedDay);
  const setCurrentDay    = useAppStore((s) => s.setCurrentDay);

  // ── Day data ──
  const pathKey  = getPathKey();
  const pathDays = getPathDays(pathKey);
  const dayKey   = `day_${String(dayNum).padStart(2, "0")}`;
  const dayData  = pathDays[dayKey];
  const tasks    = dayData?.tasks  || [];
  const quizData = dayData?.quiz   || [];

  // Tasks done for THIS day only
  const doneTasks = completedTasks[dayNum] || [];

  // ── Local state ──
  const [activeTask,       setActiveTask]       = useState(null);
  const [quizStarted,      setQuizStarted]      = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption,   setSelectedOption]   = useState(null);
  const [quizResult,       setQuizResult]       = useState(null);
  const [wrongCount,       setWrongCount]       = useState(0);
  const [dayDone,          setDayDone]          = useState(false);

  const playerRef = useRef(null);

  useEffect(() => { setCurrentDay(dayNum); }, [dayNum]);

  const alreadyDone = completedDays.includes(dayNum);
  const totalDays   = Object.keys(pathDays).length;

  // All tasks for this day done?
  const allTasksDone = tasks.length > 0 &&
    tasks.every((t) => doneTasks.includes(String(t.id)));

  // Is task at index unlocked? First task always unlocked, rest need previous done
  const isTaskUnlocked = (index) => {
    if (index === 0) return true;
    const prevTask = tasks[index - 1];
    return doneTasks.includes(String(prevTask.id));
  };

  // ── YouTube ──
  useEffect(() => {
    if (!activeTask) return;

    const initPlayer = () => {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new window.YT.Player("yt-player", {
        height: "400",
        width: "100%",
        videoId: activeTask.videoId,
        playerVars: { start: activeTask.start, rel: 0, modestbranding: 1 },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              const interval = setInterval(() => {
                if (!playerRef.current) return clearInterval(interval);
                const t = playerRef.current.getCurrentTime();
                if (t >= activeTask.end) {
                  playerRef.current.pauseVideo();
                  addCompletedTask(dayNum, String(activeTask.id)); // pass dayNum
                  clearInterval(interval);
                }
              }, 1000);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [activeTask]);

  // ── Quiz ──
  const currentQuiz = quizData[currentQuizIndex];

  const handleAnswer = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);

    if (option === currentQuiz.answer) {
      setQuizResult("correct");
      addQuizXP(); // +10 XP

      setTimeout(() => {
        if (currentQuizIndex < quizData.length - 1) {
          setCurrentQuizIndex((i) => i + 1);
          setSelectedOption(null);
          setQuizResult(null);
        } else {
          const perfect = wrongCount === 0;
          addCompletedDay(dayNum, perfect);
          setDayDone(true);
        }
      }, 800);
    } else {
      setQuizResult("wrong");
      setWrongCount((c) => c + 1);
    }
  };

  const retryWrong = () => {
    setSelectedOption(null);
    setQuizResult(null);
  };

  const goNext = () => {
    if (dayNum < totalDays) navigate(`/day/${dayNum + 1}`);
    else navigate("/dashboard");
  };

  const goPrev = () => {
    if (dayNum > 1) navigate(`/day/${dayNum - 1}`);
    else navigate("/dashboard");
  };

  // ── Guard ──
  if (!dayData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Day {dayNum} not found.</p>
          <button onClick={() => navigate("/dashboard")} className="bg-purple-600 text-white px-6 py-2 rounded-lg">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Already done ──
  if (alreadyDone && !dayDone) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-2xl mx-auto">
          <BackBtn onClick={() => navigate("/dashboard")} />
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow text-center mt-6 border border-gray-100 dark:border-gray-800">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-purple-700 mb-2">Day {dayNum} Complete!</h2>
            <p className="text-gray-500 mb-6">You already finished this day. Keep going!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={goPrev} className="px-5 py-2 border rounded-lg hover:bg-gray-50 text-sm">← Prev</button>
              {dayNum < totalDays && (
                <button onClick={goNext} className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                  Next Day →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const taskXP  = tasks.length * 50;
  const quizXP  = quizData.length * 10;
  const totalXP = taskXP + quizXP;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">

        {/* TOP NAV */}
        <div className="flex items-center justify-between mb-6">
          <BackBtn onClick={() => navigate("/dashboard")} />
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Day {dayNum}</h1>
            <p className="text-xs text-purple-500 font-semibold">+{totalXP} XP available</p>
          </div>
          <div className="text-sm text-gray-400">{dayNum} / {totalDays}</div>
        </div>

        {/* TASKS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 mb-5 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">📋 Tasks</h2>
            <span className="text-sm text-gray-400">
              {doneTasks.length} / {tasks.length}
              <span className="ml-2 text-purple-500 font-semibold">+{taskXP} XP</span>
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => {
              const done      = doneTasks.includes(String(task.id));
              const unlocked  = isTaskUnlocked(index);
              const isActive  = activeTask?.id === task.id;

              return (
                <div
                  key={task.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    done      ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
                    : isActive  ? "border-purple-400 bg-purple-50 dark:bg-purple-950"
                    : unlocked  ? "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Status circle */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        done      ? "bg-green-500 text-white"
                        : isActive  ? "bg-purple-500 text-white"
                        : unlocked  ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-300"
                      }`}>
                        {done ? "✓" : !unlocked ? "🔒" : task.id}
                      </div>

                      <div>
                        <span className={`font-medium text-sm block ${
                          done      ? "text-green-700 dark:text-green-400 line-through"
                          : !unlocked ? "text-gray-300 dark:text-gray-600"
                          : "text-gray-800 dark:text-gray-200"
                        }`}>
                          {task.title}
                        </span>
                        {!unlocked && (
                          <span className="text-xs text-gray-400">Complete Task {index} first</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-500 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                        +50 XP
                      </span>
                      {!done && unlocked && (
                        <button
                          onClick={() => setActiveTask(task)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                            isActive
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-100 hover:text-purple-700"
                          }`}
                        >
                          {isActive ? "Watching..." : "Watch"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* VIDEO */}
        {activeTask && (
          <div className="bg-black rounded-2xl overflow-hidden mb-5 shadow-lg">
            <div className="px-4 py-2 bg-gray-900 text-white text-sm font-medium">▶ {activeTask.title}</div>
            <div id="yt-player" />
          </div>
        )}

        {/* QUIZ */}
        {allTasksDone && !dayDone && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 border border-gray-100 dark:border-gray-800">
            {!quizStarted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🎯</div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">All tasks done!</h2>
                <p className="text-gray-500 mb-1 text-sm">Take the quiz to complete Day {dayNum}</p>
                <p className="text-purple-500 font-semibold text-sm mb-5">+{quizXP} XP available</p>
                <button
                  onClick={() => setQuizStarted(true)}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
                >
                  Start Quiz →
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-800 dark:text-white">
                    Q{currentQuizIndex + 1} / {quizData.length}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-500 font-semibold">+10 XP per correct</span>
                    <div className="flex gap-1">
                      {quizData.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${
                          i < currentQuizIndex    ? "bg-purple-500"
                          : i === currentQuizIndex ? "bg-purple-300"
                          : "bg-gray-200 dark:bg-gray-700"
                        }`} />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-800 dark:text-gray-200 font-medium mb-4 text-base">
                  {currentQuiz.question}
                </p>

                <div className="space-y-2">
                  {currentQuiz.options.map((option) => {
                    let style = "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950";
                    if (selectedOption) {
                      if (option === currentQuiz.answer) style = "border-green-400 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300";
                      else if (option === selectedOption && quizResult === "wrong") style = "border-red-400 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300";
                    }
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={!!selectedOption}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${style}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {quizResult === "wrong" && (
                  <div className="mt-4 text-center">
                    <p className="text-red-500 text-sm mb-2">❌ Wrong! Try again.</p>
                    <button onClick={retryWrong} className="text-sm px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100">
                      Retry
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* DAY COMPLETE */}
        {dayDone && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center shadow-xl">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold mb-1">Day {dayNum} Complete!</h2>
            <p className="text-purple-200 mb-2">
              +{totalXP} XP earned{wrongCount === 0 ? " · 🏆 Perfect Quiz!" : ""}
            </p>
            <p className="text-purple-200 mb-6 text-sm">Streak updated. Keep it going!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/dashboard")} className="px-5 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm">
                Dashboard
              </button>
              {dayNum < totalDays && (
                <button onClick={goNext} className="px-5 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 text-sm">
                  Next Day →
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition">
      ← Back
    </button>
  );
}
