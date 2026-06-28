export default function QuizSection({
    quiz,
    selectedOption,
    quizResult,
    onAnswer
}) {

  // Safety check: if quiz is not provided or has no options
  if (!quiz || !quiz.options || !Array.isArray(quiz.options)) {
    return (
      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <p className="text-gray-500">Quiz not available yet</p>
      </div>
    );
  }

  return (

    <div className="mt-8 bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-semibold mb-4">Quiz</h2>

      <p className="mb-4 font-medium">{quiz.question}</p>

      <div className="space-y-3">

        {quiz.options.map((option, i) => {

          const isSelected = selectedOption === option;
          const isCorrect = option === quiz.answer;

          let style = "border hover:bg-gray-100";

          if (quizResult === "wrong" && isSelected) {
            style = "border-red-500 bg-red-100";
          }

          if (quizResult === "correct" && isCorrect) {
            style = "border-green-500 bg-green-100";
          }

          return (
            <button
              key={i}
              disabled={quizResult === "correct"}
              onClick={() => onAnswer(option)}
              className={`block w-full text-left p-3 rounded-lg ${style}`}
            >
              {option}
            </button>
          );

        })}

      </div>

      {quizResult === "correct" && (
        <p className="mt-4 text-green-600 font-medium">
          ✅ Correct Answer!
        </p>
      )}

      {quizResult === "wrong" && (
        <p className="mt-4 text-red-600 font-medium">
          ❌ Wrong Answer — Try again
        </p>
      )}

    </div>

  );
}