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

  if (loading) return <p>Loading quiz...</p>;
  if (result) {
    // show result page
    return (
      <ModuleResult
        score={result.score}
        passed={result.passed}
        nextModule={result.next}
      />
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Module Quiz</h1>

      {questions.map((q, index) => (
        <div key={q.id} className="mb-6">
          <p className="font-semibold mb-2">{index + 1}. {q.text}</p>
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
