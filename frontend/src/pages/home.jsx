import { useNavigate } from "react-router-dom";
import { Target, CheckSquare, TrendingUp, Brain, BookOpen, Flame, BarChart3 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Target,
      number: 1,
      title: "Choose Your Path",
      desc: "Pick between Placement or Higher Studies",
      color: "from-pink-500 to-rose-500",
      glow: "rgba(244,63,94,0.4)",
    },
    {
      icon: CheckSquare,
      number: 2,
      title: "Complete Daily Tasks",
      desc: "Finish tasks and quizzes to earn XP",
      color: "from-emerald-400 to-teal-500",
      glow: "rgba(52,211,153,0.4)",
    },
    {
      icon: TrendingUp,
      number: 3,
      title: "Track Your Growth",
      desc: "Watch your skills and streaks grow",
      color: "from-blue-400 to-indigo-500",
      glow: "rgba(99,102,241,0.4)",
    },
  ];

  const keyFeatures = [
    {
      icon: Brain,
      title: "Personalized Roadmaps",
      desc: "AI-driven learning paths tailored to your career goals and pace",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: BookOpen,
      title: "Daily Tasks & Quizzes",
      desc: "Bite-sized challenges to build skills consistently every day",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: Flame,
      title: "Streak & XP System",
      desc: "Stay motivated with streaks, XP points, and badge rewards",
      gradient: "from-orange-400 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Progress Dashboards",
      desc: "Track your growth with beautiful analytics and insights",
      gradient: "from-teal-400 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">

      {/* ── HERO ── */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            CareerKraft
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
            Discover your perfect career path with AI personalized guidance and real-world skills.
          </p>
          <button
            onClick={() => navigate("/Auth")}
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
          >
            Start Your Journey →
          </button>
        </div>

        {/* ── FEATURE CARDS ── */}
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { icon: "🎯", title: "Personalized Paths", desc: "Tailored career recommendations based on your skills and goals", gradient: "from-green-400 to-blue-500", glow: "rgba(59,130,246,0.35)" },
            { icon: "📊", title: "Real Skills",         desc: "Learn in-demand technologies used by top companies",              gradient: "from-blue-500 to-purple-500", glow: "rgba(139,92,246,0.35)" },
            { icon: "🚀", title: "Fast Results",        desc: "From student to job-ready in months, not years",                  gradient: "from-orange-400 to-red-500",  glow: "rgba(249,115,22,0.35)" },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-lg p-10 text-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
              style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 35px ${card.glow}`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)")}
            >
              <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-r ${card.gradient} text-white text-2xl shadow-lg`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              How It <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Three simple steps to kickstart your career journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-gradient-to-r from-pink-400 via-emerald-400 to-indigo-400 opacity-30" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center gap-5">
                  {/* Icon box */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 8px 24px ${step.glow}` }}
                  >
                    <Icon size={32} color="#fff" strokeWidth={2} />
                  </div>
                  {/* Number badge */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md -mt-2">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Key <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Everything you need to land your dream career</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-7 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} color="#fff" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-base leading-snug">{feat.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Ready to Start Your{" "}
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 bg-clip-text text-transparent">
              Journey?
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 leading-relaxed">
            Join thousands of students already building their dream careers with CareerKraft.
          </p>
          <button
            onClick={() => navigate("/Auth")}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_36px_rgba(139,92,246,0.5)]"
          >
            🚀 Get Started Now
          </button>
        </div>
      </section>

    </div>
  );
}