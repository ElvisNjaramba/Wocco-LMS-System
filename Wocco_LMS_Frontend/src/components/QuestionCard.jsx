// src/components/QuestionCard.jsx
export default function QuestionCard({ question, onAnswer }) {
  return (
    <div className="border rounded-lg p-6">
      <h3 className="font-semibold mb-4">{question.text}</h3>

      <div className="space-y-2">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt)}
            className="block w-full text-left border p-3 rounded hover:bg-indigo-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
