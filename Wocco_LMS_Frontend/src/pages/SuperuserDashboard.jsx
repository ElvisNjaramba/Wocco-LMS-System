import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function SuperuserDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState("");

  // 🔢 Pagination
  const USERS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all users
  useEffect(() => {
    api
      .get("superuser/all-users-progress/")
      .then(res => setUsers(res.data))
      .catch(() => {});
  }, []);

  // Build module columns
  useEffect(() => {
    const allModules = users
      .filter(u => Array.isArray(u.modules))
      .flatMap(u => u.modules.map(m => m.module_title));

    setModules([...new Set(allModules)]);
  }, [users]);

  const hasAnyModules = modules.length > 0;

  // 🔍 Search filter
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;

    return users.filter(u =>
      [
        u.username,
        u.first_name,
        u.last_name,
        u.position,
        u.department,
      ]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q))
    );
  }, [search, users]);

  // 🔁 Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 📄 Pagination logic
  const totalPages = Math.ceil(
    filteredUsers.length / USERS_PER_PAGE
  );

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="p-6 md:p-10 max-w-[95vw] mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          🌟 Superuser Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/superuser/add-user")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            ➕ Add Employee
          </button>
          <button
            onClick={() => navigate("/superuser/upload-users")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            📤 Upload Excel
          </button>
        </div>
      </div>

      {/* 🔍 Search */}
      <div className="mb-4 max-w-md">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, username, position, department..."
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing{" "}
        {filteredUsers.length === 0
          ? 0
          : (currentPage - 1) * USERS_PER_PAGE + 1}{" "}
        –{" "}
        {Math.min(
          currentPage * USERS_PER_PAGE,
          filteredUsers.length
        )}{" "}
        of {filteredUsers.length} users
      </p>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-[1500px] table-fixed text-sm">
          <thead className="bg-indigo-100 sticky top-0">
            <tr>
              <th className="sticky left-0 bg-indigo-100 border p-3">
                Name
              </th>
              <th className="border p-3">Username</th>
              <th className="border p-3">Password</th>
              <th className="border p-3">Position</th>
              <th className="border p-3">Department</th>

              {modules.map((m, i) => (
                <th key={i} className="border p-2 text-center">
                  {m}
                </th>
              ))}

              {hasAnyModules && (
                <th className="border p-3 text-center">
                  Final Quiz
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.length === 0 && (
              <tr>
                <td
                  colSpan={6 + modules.length + (hasAnyModules ? 1 : 0)}
                  className="text-center py-10 text-gray-400"
                >
                  No users found
                </td>
              </tr>
            )}

            {paginatedUsers.map((u, i) => (
              <tr key={i} className="hover:bg-indigo-50">
                <td className="sticky left-0 bg-white border p-3 font-semibold">
                  {u.first_name} {u.last_name}
                </td>
                <td className="border p-3 text-xs">{u.username}</td>
                <td className="border p-3 text-xs">{u.password}</td>
                <td className="border p-3">{u.position}</td>
                <td className="border p-3">{u.department}</td>

                {modules.map((m, j) => {
                  const mod = u.modules.find(
                    mm => mm.module_title === m
                  );
                  return (
                    <td key={j} className="border p-2 text-center">
                      {mod ? (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            mod.completed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {mod.completed ? "✔" : "✖"} {mod.score}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                })}

                {hasAnyModules && (
                  <td className="border p-2 text-center">
                    {u.final_quiz ? u.final_quiz.score : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔢 Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-2 rounded border disabled:opacity-40"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded border ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-2 rounded border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
