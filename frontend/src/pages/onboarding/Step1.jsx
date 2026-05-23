import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import { useAppStore } from "@/store/useAppStore";

export default function Step1() {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData } = useAppStore();
  const [qualification, setQualification] = useState(onboardingData.qualification || "");

  const handleNext = () => {
    if (!qualification) { alert("Please select your qualification"); return; }
    setOnboardingData({ qualification });
    navigate("/onboarding/step2");
  };

  return (
    <OnboardingLayout step={1} totalSteps={5} onNext={handleNext}>
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-white">
        Select Your Qualification
      </h3>
      <div className="space-y-3">
        {["B.E/B.Tech", "M.E/M.Tech"].map((option) => (
          <button
            key={option}
            onClick={() => setQualification(option)}
            className={`w-full py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
              qualification === option
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