export default function DayNavigation({
  currentDay,
  onNext,
  onPrev,
  isDayCompleted
}) {

  return (

    <div className="flex gap-3 mb-4">

      {/* PREVIOUS BUTTON */}
      <button
        onClick={onPrev}
        disabled={currentDay === "day_01"}
        className="bg-gray-300 px-4 py-2 rounded-lg disabled:opacity-50"
      >
        ← Previous Day
      </button>

      {/* NEXT BUTTON */}
      <button
        onClick={onNext}
        disabled={!isDayCompleted}
        className={`px-4 py-2 rounded-lg text-white ${
          isDayCompleted
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Next Day →
      </button>

    </div>

  );

}