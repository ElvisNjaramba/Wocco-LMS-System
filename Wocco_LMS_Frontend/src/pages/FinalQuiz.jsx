import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const FinalQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinalQuiz = async () => {
      try {
        const res = await api.get("/final-quiz/");
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load final quiz");
      }
    };
    fetchFinalQuiz();
  }, []);

  const handleAnswerChange = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [String(questionId)]: option, // 🔑 string keys
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post("/submit-final-quiz/", {
        answers: answers,
        question_ids: questions.map(q => q.id)  // send exact question IDs
      });

      navigate("/final-quiz/result", { state: { score: res.data.score, passed: res.data.passed } });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to submit final quiz");
    }
  };




  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Final Quiz</h1>
      {questions.map((q) => (
        <div key={q.id} className="mb-6 p-4 border rounded">
          <p className="font-semibold mb-2">{q.text}</p>
          {["option_a","option_b","option_c","option_d"].map((opt) => (
            <label key={opt} className="block mb-1">
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={() => handleAnswerChange(q.id, opt)}
              />{" "}
              {q[opt]}
            </label>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded"
      >
        Submit Final Quiz
      </button>
    </div>
  );
};

export default FinalQuiz;
