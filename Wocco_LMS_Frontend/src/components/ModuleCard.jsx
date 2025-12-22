// src/components/ModuleCard.jsx
import { useNavigate } from "react-router-dom";

export default function ModuleCard({ module }) {
  const navigate = useNavigate();

  return (
    <div className="border rounded-xl p-6 shadow hover:shadow-lg transition">
      <h2 className="text-xl font-semibold">{module.title}</h2>
      <p className="text-sm text-gray-500 mt-2">
        10 Questions • Required
      </p>
      <button
        onClick={() => navigate(`/learning/module/${module.slug}`)}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Start Module
      </button>
    </div>
  );
}
