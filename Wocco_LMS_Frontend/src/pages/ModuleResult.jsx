import { useNavigate } from "react-router-dom";

const ModuleResult = ({ score, passed, nextModule, results }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (passed) {
      if (nextModule) {
      
        navigate(`/modules/${nextModule.id}/content`);
      } else {
       
        navigate("/final-quiz");
      }
    } else {
  
      navigate(0); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 mt-12 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-4">
        {passed ? "🎉 Passed!" : "❌ Failed"}
      </h1>

      <p className="text-center text-xl mb-6">
        Your score: <strong>{score}/10</strong>
      </p>

      {/* Results */}
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
<div className="flex items-start gap-3 mb-2">
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
    {index + 1}
  </div>

  <p className="font-semibold">
    {r.question}
  </p>
</div>


            {Object.entries(r.options).map(([key, value]) => {
              const isSelected = r.selected === key;
              const isCorrect = r.correct === key;

              return (
                <div
                  key={key}
                  className={`px-3 py-1 rounded mb-1 text-sm
                    ${
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
          onClick={handleContinue}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          {passed
            ? nextModule
              ? "Continue to Next Module"
              : "Proceed to Final Quiz"
            : "Retry Module"}
        </button>
      </div>
    </div>
  );
};

export default ModuleResult;
