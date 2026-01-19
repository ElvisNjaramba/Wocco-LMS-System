import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ModuleContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`modules/${id}/pages/`)
      .then(res =>{ 
        setPages(res.data);
        setIndex(0);})
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading content...</p>;
  if (!pages.length) return <p className="text-center mt-10 text-gray-500">No content available.</p>;

  const page = pages[index];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-gray-50 min-h-screen rounded-xl shadow-sm">
      {/* <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
        📘 {page.title}
      </h1> */}
<h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 flex items-center gap-5">

  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white font-extrabold shadow-lg">
    <span className="text-2xl md:text-3xl">{index + 1}</span>
  </div>

  <span>{page.title}</span>
</h1>


      <div
        className="space-y-6"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />

      <div className="flex justify-between mt-10">
        <button
          disabled={index === 0}
          onClick={() => setIndex(i => i - 1)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 disabled:opacity-50 transition transform hover:scale-105"
        >
          ⬅ Previous
        </button>

        {index < pages.length - 1 ? (
          <button
            onClick={() => setIndex(i => i + 1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition transform hover:scale-105"
          >
            Next ➡
          </button>
        ) : (
          <button
            onClick={() => navigate(`/modules/${id}/quiz`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition transform hover:scale-105"
          >
            🎯 Start Quiz
          </button>
        )}
      </div>
    </div>
  );
};


export default ModuleContent;
