import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { updateUserSetup } from "@/services/api";
import { getStoredUser, setStoredUser } from "@/lib/store";

export default function PathSelection() {
  const navigate = useNavigate();
  const setOnboardingData = useAppStore((s) => s.setOnboardingData);
  const setUser           = useAppStore((s) => s.setUser);
  const [saving, setSaving] = useState(false);

  // ✅ Guard: already-onboarded users should never see this page
  useEffect(() => {
    const user = getStoredUser();
    if (user?.selectedPath && user?.careerInterest) {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const handleSelect = async (path) => {
    // 1. Save to Zustand store (as before)
    setOnboardingData({ selectedPath: path });

    // 2. ✅ Persist to DB immediately so login redirect is correct even if
    //    user abandons onboarding after this step
    try {
      setSaving(true);
      const updatedUser = await updateUserSetup({ selectedPath: path });

      if (updatedUser?.user) {
        setStoredUser(updatedUser.user);
        setUser(updatedUser.user);
      }
    } catch (e) {
      console.error("Failed to save selected path:", e);
      // Non-blocking — still proceed to onboarding
    } finally {
      setSaving(false);
    }

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
          onClick={() => !saving && handleSelect("placement")}
          className={`cursor-pointer bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-3xl p-10 text-center shadow-lg hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200 ${saving ? "opacity-60 pointer-events-none" : ""}`}
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
          onClick={() => !saving && handleSelect("higher-studies")}
          className={`cursor-pointer bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-3xl p-10 text-center shadow-lg hover:shadow-xl dark:hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 ${saving ? "opacity-60 pointer-events-none" : ""}`}
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

      {saving && (
        <p className="text-center text-sm text-indigo-500 dark:text-indigo-400 animate-pulse pb-4">
          Saving your choice...
        </p>
      )}
    </div>
  );
}