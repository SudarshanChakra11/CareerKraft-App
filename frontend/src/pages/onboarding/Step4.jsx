import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import { useAppStore } from "@/store/useAppStore";
import { updateUserSetup } from "@/services/api";
import { setStoredUser } from "@/lib/store";

export default function Step4() {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData, setUser } = useAppStore();
  const [careerInterest, setCareerInterest] = useState(onboardingData.careerInterest || "");
  const [loading, setLoading] = useState(false);

  const selectedPath = onboardingData.selectedPath;
  const options =
    selectedPath === "placement"
      ? ["Full Stack Development", "Data Science", "AI/ML", "Cloud Computing", "Cybersecurity"]
      : ["GATE", "GRE", "CAT"];

  const handleNext = async () => {
    if (!careerInterest) { alert("Please select your career interest"); return; }

    // 1. Save to Zustand store (as before)
    setOnboardingData({ careerInterest });

    // 2. ✅ Save ALL onboarding data to DB so redirectTo works correctly on next login
    try {
      setLoading(true);
      const updatedUser = await updateUserSetup({
        careerInterest,
        selectedPath:  onboardingData.selectedPath,
        qualification: onboardingData.qualification,
        branch:        onboardingData.branch,
        year:          onboardingData.year,
        skillLevel:    onboardingData.skillLevel,
        duration:      onboardingData.duration,
      });

      // Keep stored user in sync so the guard in PathSelection also works
      if (updatedUser?.user) {
        setStoredUser(updatedUser.user);
        setUser(updatedUser.user);
      }
    } catch (e) {
      console.error("Failed to save onboarding data:", e);
      // Non-blocking — still navigate so UX isn't broken
    } finally {
      setLoading(false);
    }

    navigate("/dashboard");
  };

  return (
    <OnboardingLayout
      step={4}
      totalSteps={4}
      onNext={handleNext}
      onBack={() => navigate("/onboarding/step3")}
      isLast
      loading={loading}
    >
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-white">
        Select Your Career Interest
      </h3>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => setCareerInterest(option)}
            className={`w-full py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
              careerInterest === option
                ? "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </OnboardingLayout>
  );
}