import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function SuperuserUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`superuser/user-progress/${id}/`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-400">User not found.</p>
      </div>
    );
  }

  const totalModules = data.modules.length;
  const completedModules = data.modules.filter(m => m.completed).length;
  const avgScore =
    totalModules > 0
      ? (
          data.modules.reduce((sum, m) => sum + (m.score || 0), 0) / totalModules
        ).toFixed(1)
      : 0;
  const allDone = completedModules === totalModules && totalModules > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate("/superuser/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition"
        >
          ← Back to Dashboard
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
              {data.user.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.user}</h1>
              <p className="text-sm text-gray-500">{data.position} — {data.department}</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{completedModules}/{totalModules}</p>
              <p className="text-xs text-gray-500">Modules Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{avgScore}</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${data.final_quiz?.completed ? "text-green-600" : "text-red-400"}`}>
                {data.final_quiz?.completed ? "✔" : "✖"}
              </p>
              <p className="text-xs text-gray-500">Final Quiz</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border p-5 mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Overall Progress</span>
            <span>{totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalModules > 0 ? (completedModules / totalModules) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Module timeline */}
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Module Progress</h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />

            <div className="space-y-6">
              {data.modules.map((m, i) => (
                <div key={i} className="flex gap-5 relative">
                  {/* Circle indicator */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 text-sm font-bold
                    ${m.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {m.completed ? "✔" : i + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="font-semibold text-gray-800">{m.module_title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full w-fit font-medium
                        ${m.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                        }`}
                      >
                        {m.completed ? "Completed" : "Incomplete"}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500
                            ${m.score >= 8 ? "bg-green-500" : m.score >= 5 ? "bg-yellow-400" : "bg-red-400"}`}
                          style={{ width: `${(m.score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                        {m.score}/10
                      </span>
                    </div>

                    {/* Attempt history */}
                    {m.attempts && m.attempts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">Attempt history:</p>
                        <div className="flex flex-wrap gap-2">
                          {m.attempts.map((a, j) => (
                            <span
                              key={j}
                              className="text-xs bg-gray-50 border rounded px-2 py-0.5 text-gray-500"
                            >
                              #{j + 1} — {a.score}/10 &nbsp;·&nbsp;{" "}
                              {new Date(a.attempted_at).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short", year: "numeric"
                              })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Quiz card */}
        <div className={`rounded-2xl border p-5 ${data.final_quiz?.completed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">🎯 Final Quiz</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {data.final_quiz?.completed
                  ? "Successfully completed the final assessment."
                  : "Has not completed the final quiz yet."}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${data.final_quiz?.completed ? "text-green-600" : "text-red-400"}`}>
                {data.final_quiz?.score ?? 0}
                <span className="text-base font-normal text-gray-400">/25</span>
              </p>
              <p className="text-xs text-gray-400">Score</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}