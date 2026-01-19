import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ModuleResult from "./ModuleResult";

const ModuleQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null); // store quiz result

  useEffect(() => {
    api.get(`modules/${id}/questions/`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    try {
      const res = await api.post(`modules/${id}/complete/`, { answers });
      setResult(res.data); // ✅ store quiz result
    } catch (err) {
      console.error(err);
      alert("Error submitting quiz. Try again.");
    }
  };

  const handleNext = () => {
    // If there's a next module, navigate there
    if (result.next) {
      navigate(`/modules/${result.next.id}/quiz`);
    } else {
      // No next module -> proceed to final quiz
      navigate("/final-quiz");
    }
  };

  if (loading) return <p>Loading quiz...</p>;

  // If result exists, show result page first
  if (result) {
    return (
      <ModuleResult
        score={result.score}
        passed={result.passed}
        nextModule={result.next}
        results={result.results}
        onNext={handleNext} // ✅ pass next handler
      />
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Module Quiz</h1>

      {questions.map((q, index) => (
        <div key={q.id} className="mb-6">
          <div className="flex items-start gap-3 mb-2">
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
    {index + 1}
  </div>
  <p className="font-semibold">
    {q.text}
  </p>
</div>

          {['a','b','c','d'].map(opt => (
            <label key={opt} className="block mb-1">
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt.toUpperCase()}
                checked={answers[q.id] === opt.toUpperCase()}
                onChange={() =>
                  setAnswers({ ...answers, [q.id]: opt.toUpperCase() })
                }
              />{" "}
              {q[`option_${opt}`]}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-3 rounded-lg"
      >
        Submit Module
      </button>
    </div>
  );
};

export default ModuleQuiz;
