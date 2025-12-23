import { useNavigate, useLocation } from "react-router-dom";

const FinalQuizResult = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state) {
      api.get("/final-quiz/result/")
        .then(res => setData(res.data))
        .catch(() => navigate("/dashboard"));
    }
  }, []);


  const { score, passed, results } = state;

  return (
    <div className="max-w-4xl mx-auto p-8 mt-12 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-4">
        {passed ? "🎉 Passed Final Quiz!" : "❌ Failed Final Quiz"}
      </h1>

      <p className="text-center text-xl mb-6">
        Your score: <strong>{score}/25</strong>
      </p>

      <div className="space-y-6">
        {results.map((r, index) => (
          <div
            key={r.question_id}
            className={`p-4 rounded-lg border ${
              r.is_correct
                ? "border-green-400 bg-green-50"
                : "border-red-400 bg-red-50"
            }`}
          >
            <p className="font-semibold mb-2">
              {index + 1}. {r.question}
            </p>

            {Object.entries(r.options).map(([key, value]) => {
              const isSelected = r.selected === key;
              const isCorrect = r.correct === key;

              return (
                <div
                  key={key}
                  className={`px-3 py-1 rounded mb-1 text-sm ${
                    isCorrect
                      ? "bg-green-200 font-semibold"
                      : isSelected
                      ? "bg-red-200"
                      : "bg-gray-100"
                  }`}
                >
                  {key}. {value}
                </div>
              );
            })}

            <p className="mt-2 text-sm font-semibold">
              {r.is_correct ? "✅ Correct" : "❌ Incorrect"}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default FinalQuizResult;
