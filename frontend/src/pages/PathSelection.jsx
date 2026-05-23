import { useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function PathSelection() {
  const navigate = useNavigate();
  const setOnboardingData = useAppStore((s) => s.setOnboardingData);

  const handleSelect = (path) => {
    setOnboardingData({ selectedPath: path });
    navigate("/onboarding/step1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">

      <div className="flex justify-center pt-10">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
          ⚡ CareerKraft
        </h2>
      </div>

      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Choose Your <span className="text-indigo-600 dark:text-indigo-400">Path</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3">
          What's your primary goal after graduation?
        </p>
      </div>

      <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-2 gap-10 px-6 pb-16">

        {/* Placement */}
        <div
          onClick={() => handleSelect("placement")}
          className="cursor-pointer bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-3xl p-10 text-center shadow-lg hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200"
        >
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <Briefcase size={28} />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">🎯 Placement</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Prepare for industry roles with career-focused learning paths in
            Full Stack Development, Data Science, AI/ML, and Cybersecurity.
          </p>
        </div>

        {/* Higher Studies */}
        <div
          onClick={() => handleSelect("higher-studies")}
          className="cursor-pointer bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-3xl p-10 text-center shadow-lg hover:shadow-xl dark:hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200"
        >
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
            <GraduationCap size={28} />
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">📚 Higher Studies</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Prepare for competitive exams like GATE, GRE, and CAT
            with structured study plans and daily practice.
          </p>
        </div>

      </div>
    </div>
  );
}