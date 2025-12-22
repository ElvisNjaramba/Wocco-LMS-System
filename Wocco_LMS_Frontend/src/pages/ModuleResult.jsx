import { useNavigate } from "react-router-dom";

const ModuleResult = ({ score, passed, nextModule }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (nextModule) {
      // Ensure we navigate to content of next module
      navigate(`/modules/${nextModule.id}/content`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-20 bg-gray-50 rounded-xl shadow-lg text-center">
      <h1 className="text-3xl font-bold mb-4">{passed ? "🎉 Passed!" : "❌ Failed!"}</h1>
      <p className="text-xl mb-6">Your score: {score}/10</p>
      <button
        onClick={handleContinue}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
      >
        {passed ? "Continue to Next Module" : "Retry Module"}
      </button>
    </div>
  );
};

export default ModuleResult;
