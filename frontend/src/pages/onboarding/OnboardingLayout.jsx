import { useNavigate } from "react-router-dom";

export default function OnboardingLayout({
  step,
  totalSteps = 5,
  children,
  onNext,
  onBack,
  isLast,
  loading = false,
}) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-950 dark:to-gray-900 transition-colors duration-300 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-[420px] rounded-2xl shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8">

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          Tell Us About You
        </h2>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
          <div
            style={{ width: `${progress}%` }}
            className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
          />
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          Step {step} of {totalSteps}
        </p>

        {/* Step content */}
        <div className="text-gray-800 dark:text-gray-100">
          {children}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step !== 1 && (
            <button
              onClick={onBack}
              disabled={loading}
              className="w-1/2 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              ← Back
            </button>
          )}

          <button
            onClick={onNext}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none transition-all duration-200 shadow-md shadow-purple-500/20"
          >
            {loading ? "⏳ Loading..." : isLast ? "🚀 Start Learning" : "Next →"}
          </button>
        </div>

      </div>
    </div>
  );
}