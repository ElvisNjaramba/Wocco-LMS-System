import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const FinalQuizResult = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [data, setData] = useState(state || null);
  const [loading, setLoading] = useState(!state);

  useEffect(() => {
    if (!state) {
      api
        .get("/final-quiz/result/")
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(() => navigate("/dashboard"));
    }
  }, [state, navigate]);

  if (loading || !data) {
    return (
      <div className="text-center mt-20 text-lg">
        Loading results...
      </div>
    );
  }

  const { score, passed, results } = data;

  const handleAction = () => {
    if (passed) {
      navigate("/dashboard");
    } else {
      navigate("/final-quiz"); // 🔁 retake quiz
    }
  };

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
          onClick={handleAction}
          className={`px-6 py-3 rounded-lg text-white shadow transition ${
            passed
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {passed ? "Go to Dashboard" : "Retake Final Quiz"}
        </button>
      </div>
    </div>
  );
};

export default FinalQuizResult;
