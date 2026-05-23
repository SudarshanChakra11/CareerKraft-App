import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import { useAppStore } from "@/store/useAppStore";

export default function Step4() {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData } = useAppStore();
  const [careerInterest, setCareerInterest] = useState(onboardingData.careerInterest || "");

  const selectedPath = onboardingData.selectedPath;
  const options =
    selectedPath === "placement"
      ? ["Full Stack Development", "Data Science", "AI/ML", "Cloud Computing", "Cybersecurity"]
      : ["GATE", "GRE", "CAT"];

  const handleNext = () => {
    if (!careerInterest) { alert("Please select your career interest"); return; }
    setOnboardingData({ careerInterest });
    navigate("/dashboard");
  };

  return (
    <OnboardingLayout step={4} totalSteps={4} onNext={handleNext} onBack={() => navigate("/onboarding/step3")} isLast>
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