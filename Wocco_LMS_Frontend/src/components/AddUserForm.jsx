import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AddUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
  });

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("profile-choices/").then(res => {
      setPositions(res.data.positions);
      setDepartments(res.data.departments);
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("superuser/add-user/", form);

      navigate("/superuser/dashboard", {
        state: {
          newUser: {
            username: res.data.username,
            password: res.data.password,
          }
        }
      });
    } catch (err) {
      alert(err.response?.data?.error || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white border rounded-xl shadow-sm p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Employee
          </h1>
          <p className="text-gray-500 mt-1">
            Create a user and automatically assign learning modules.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Grid Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              >
                <option value="">Select position</option>
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select department</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-2
              rounded-lg px-4 py-3 text-white font-semibold transition
              ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"}
            `}
          >
            {loading && (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Creating User..." : "Create User"}
          </button>

        </form>
      </div>
    </div>
  );
}
