import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "./OnboardingLayout";
import { useAppStore } from "@/store/useAppStore";

export default function Step3() {
  const navigate = useNavigate();
  const { onboardingData, setOnboardingData } = useAppStore();
  const [year, setYear] = useState(onboardingData.year || "");

  const handleNext = () => {
    if (!year) { alert("Please select your current year"); return; }
    setOnboardingData({ year });
    navigate("/onboarding/step4");
  };

  return (
    <OnboardingLayout step={3} totalSteps={5} onNext={handleNext} onBack={() => navigate("/onboarding/step2")}>
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-white">
        Select Your Current Year
      </h3>
      <div className="space-y-3">
        {["1st Year", "2nd Year", "3rd Year", "4th Year", "Passout"].map((option) => (
          <button
            key={option}
            onClick={() => setYear(option)}
            className={`w-full py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
              year === option
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