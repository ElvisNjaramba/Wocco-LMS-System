import { useNavigate, useLocation } from "react-router-dom";

const FinalQuizResult = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read state passed from navigate
  const score = location.state?.score ?? 0;
  const passed = location.state?.passed ?? false;

  const handleContinue = () => {
    // After passing, go to dashboard or a certificate page
    navigate("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-20 bg-gray-50 rounded-xl shadow-lg text-center">
      <h1 className="text-3xl font-bold mb-4">
        {passed ? "🎉 Passed Final Quiz!" : "❌ Failed Final Quiz"}
      </h1>
      <p className="text-xl mb-6">Your score: {score}/25</p>
      <button
        onClick={handleContinue}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
      >
        {passed ? "Go to Dashboard" : "Retry Final Quiz"}
      </button>
    </div>
  );
};

export default FinalQuizResult;
