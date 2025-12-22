// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";

// const Dashboard = () => {
//   const [modules, setModules] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [finalQuizUnlocked, setFinalQuizUnlocked] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // track login
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchModules = async () => {
//       try {
//         const res = await api.get("dashboard/modules/");
//         setModules(res.data);

//         // Check authentication
//         setIsAuthenticated(res.status === 200);

//         const allCompleted = res.data.every(
//           m => m.has_content && m.completed
//         );
//         setFinalQuizUnlocked(allCompleted);
//       } catch (err) {
//         // If 401, user is not authenticated
//         if (err.response && err.response.status === 401) {
//           setIsAuthenticated(false);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchModules();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <p className="text-gray-500 animate-pulse">Loading learning modules...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10">
//       {/* Header */}
//       <div className="mb-10">
//         <h1 className="text-3xl font-bold text-gray-900">
//           My Learning Modules
//         </h1>
//         <p className="text-gray-500 mt-2">
//           Complete each module to unlock the final assessment.
//         </p>
//       </div>

//       {/* Modules Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

//         {modules.map(m => {
//           const canAccess = isAuthenticated && m.has_content && m.unlocked;
//           const showLoginPrompt = !isAuthenticated && m.has_content && m.unlocked;
//           const showUnavailableMessage = isAuthenticated && !m.has_content;

//           return (
//             <div
//               key={m.title_id}
//               className={`relative rounded-xl border p-6 transition-all duration-200
//                 ${canAccess
//                   ? "cursor-pointer bg-white hover:shadow-lg hover:-translate-y-1"
//                   : "bg-gray-50 opacity-70 cursor-not-allowed"
//                 }`}
//             >
//               {/* Status Badge */}
//               {m.has_content && (
//                 <span
//                   className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full
//                     ${m.completed
//                       ? "bg-green-100 text-green-700"
//                       : m.unlocked
//                         ? "bg-yellow-100 text-yellow-700"
//                         : "bg-gray-200 text-gray-600"
//                     }`}
//                 >
//                   {m.completed
//                     ? "Completed"
//                     : m.unlocked
//                       ? "Pending"
//                       : "Locked"}
//                 </span>
//               )}

//               {/* Title */}
//               <h2 className="text-lg font-semibold text-gray-800 mb-2">
//                 {m.title}
//               </h2>

//               {/* Description / Messages */}
//               <p className="text-sm">
//                 {!m.has_content
//                   ? "Not available for your role"
//                   : m.completed
//                     ? "You have successfully completed this module."
//                     : m.unlocked
//                       ? isAuthenticated
//                         ? "This module is ready to start."
//                         : "Log in to start this module."
//                       : "Complete the previous module to unlock."
//                 }
//               </p>

//               {/* Actions */}
//               {canAccess && (
//                 <div
//                   onClick={() => navigate(`/modules/${m.module_id}`)}
//                   className="mt-6 text-sm font-medium text-indigo-600 cursor-pointer"
//                 >
//                   Start Module →
//                 </div>
//               )}

//               {showLoginPrompt && (
//                 <button
//                   onClick={() => navigate("/login")}
//                   className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//                 >
//                   Log in to start
//                 </button>
//               )}

//               {showUnavailableMessage && (
//                 <div className="mt-6 text-sm text-gray-500 italic">
//                   Module not available - Login to access
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {/* Final Quiz Card */}
//         <div
//           className={`relative rounded-xl border p-6 transition-all duration-200
//             ${finalQuizUnlocked
//               ? "cursor-pointer bg-yellow-50 hover:shadow-lg hover:-translate-y-1"
//               : "bg-gray-100 opacity-60 cursor-not-allowed"
//             }`}
//           onClick={() => finalQuizUnlocked && navigate("/final-quiz")}
//         >
//           <span
//             className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full
//               ${finalQuizUnlocked
//                 ? "bg-yellow-200 text-yellow-800"
//                 : "bg-gray-300 text-gray-600"
//               }`}
//           >
//             {finalQuizUnlocked ? "Unlocked" : "Locked"}
//           </span>

//           <h2 className="text-lg font-semibold text-gray-800 mb-2">
//             🎯 Final Quiz
//           </h2>

//           <p className="text-sm text-gray-600">
//             {finalQuizUnlocked
//               ? "Take the final 25-question assessment."
//               : "Complete all modules to unlock the final quiz."}
//           </p>

//           {finalQuizUnlocked && (
//             <div className="mt-6 text-sm font-medium text-yellow-700">
//               Start Final Quiz →
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;


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
