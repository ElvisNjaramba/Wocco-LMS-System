import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const ModuleContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`modules/${id}/pages/`)
      .then((res) => setPages(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading content...</p>;
  if (!pages.length) return <p className="text-center mt-10 text-gray-500">No content available for this module.</p>;

  const page = pages[index];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-gray-50 min-h-screen rounded-xl shadow-sm">
      {/* Page Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
        📘 {page.title}
      </h1>

      {/* Content Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-10 prose prose-indigo max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {page.content}
        </ReactMarkdown>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 disabled:opacity-50 transition transform hover:scale-105"
        >
          ⬅ Previous
        </button>

        {index < pages.length - 1 ? (
          <button
            onClick={() => setIndex((i) => i + 1)}
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
