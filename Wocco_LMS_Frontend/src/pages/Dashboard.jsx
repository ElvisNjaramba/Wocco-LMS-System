import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finalQuizUnlocked, setFinalQuizUnlocked] = useState(false);
  const [finalQuizCompleted, setFinalQuizCompleted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("dashboard/modules/");

        setModules(res.data.modules || []);
        setIsAuthenticated(res.data.authenticated);

        if (res.data.authenticated) {
          const allCompleted =
            res.data.modules.length > 0 &&
            res.data.modules.every(m => m.has_content && m.completed);

          setFinalQuizUnlocked(allCompleted);
          setFinalQuizCompleted(res.data.final_quiz?.completed || false);
        } else {
          setFinalQuizUnlocked(false);
          setFinalQuizCompleted(false);
        }

      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 animate-pulse">Loading modules...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-10">Learning Modules</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {modules.map(m => {
          const canAccess =
            isAuthenticated && m.has_content && m.unlocked;

          return (
            <div
              key={m.title_id}
              className={`relative rounded-xl border p-6
                ${canAccess
                  ? "cursor-pointer bg-white hover:shadow-lg"
                  : "bg-gray-50 opacity-70"
                }`}
            >
              {/* Badge */}
              {m.has_content && (
                <span
                  className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full
                    ${m.completed
                      ? "bg-green-200 text-green-800"
                      : m.unlocked
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-gray-300 text-gray-600"
                    }`}
                >
                  {m.completed
                    ? "Completed"
                    : m.unlocked
                      ? "Pending"
                      : "Locked"}
                </span>
              )}

              <h2 className="text-lg font-semibold mb-2">{m.title}</h2>

              <p className="text-sm text-gray-600">
                {!m.has_content
                  ? "Not available for your role"
                  : !isAuthenticated
                    ? "Log in to access this module."
                    : m.completed
                      ? "Module completed."
                      : m.unlocked
                        ? "Ready to start."
                        : "Complete previous module first."}
              </p>
              {m.reading_time > 0 && (
                  <p className="text-xs text-gray-400 mt-1">⏱ ~{m.reading_time} min read</p>
              )}
              {/* Actions */}
              {canAccess && (
                <div
                  onClick={() => navigate(`/modules/${m.module_id}`)}
                  className="mt-6 text-indigo-600 font-medium cursor-pointer"
                >
                  Start Module →
                </div>
              )}

              {!isAuthenticated && m.has_content && (
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Log in to access
                </button>
              )}
            </div>
          );
        })}

        {/* FINAL QUIZ CARD */}
        <div
          className={`relative rounded-xl border p-6
            ${finalQuizCompleted
              ? "bg-green-50"
              : finalQuizUnlocked
                ? "cursor-pointer bg-yellow-50 hover:shadow-lg"
                : "bg-gray-100 opacity-60"
            }`}
          onClick={() => {
            if (finalQuizUnlocked && !finalQuizCompleted) {
              navigate("/final-quiz");
            }
          }}
        >
          <span
            className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full
              ${finalQuizCompleted
                ? "bg-green-200 text-green-800"
                : finalQuizUnlocked
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-gray-300 text-gray-600"
              }`}
          >
            {finalQuizCompleted
              ? "Completed"
              : finalQuizUnlocked
                ? "Unlocked"
                : "Locked"}
          </span>

          <h2 className="text-lg font-semibold mb-2">🎯 Final Quiz</h2>

          <p className="text-sm text-gray-600">
            {!isAuthenticated
              ? "Log in to unlock the final quiz."
              : finalQuizCompleted
                ? "Final assessment completed."
                : finalQuizUnlocked
                  ? "Take the final assessment."
                  : "Complete all modules first."}
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
