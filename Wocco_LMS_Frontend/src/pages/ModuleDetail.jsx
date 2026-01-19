import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const ModuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);

  useEffect(() => {
    api.get(`modules/${id}/`)
      .then(res => setModule(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!module) return <p className="text-center mt-10 text-gray-500">Loading module...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-gray-50 min-h-screen rounded-xl shadow-sm">
      <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
        📚 {module.title}
      </h1>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-8 prose prose-indigo">
        <p>{module.description}</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate(`/modules/${id}/content`)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition transform hover:scale-105"
        >
          🚀 Start Module
        </button>
      </div>
    </div>
  );
};

export default ModuleDetail;
