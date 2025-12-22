import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ---------- Reusable Components ---------- */

const InputField = ({ label, placeholder, type = "text", width = "w-[48%]", onChange, value }) => (
  <div className={`flex flex-col ${width} p-4`}>
    <label className="font-bold mb-1">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      required
    />
  </div>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div className="flex flex-col w-[48%] p-4">
    <label className="font-bold mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      required
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

/* ---------- Register Page ---------- */

const Register = () => {
  const navigate = useNavigate();

  // Form fields
  const [username, setUsername] = useState("");
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");

  // Backend-driven choices
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingChoices, setLoadingChoices] = useState(true);

  /* ---------- Load dropdown data ---------- */
  useEffect(() => {
    api.get("profile-choices/")
      .then(res => {
        setPositions(res.data.positions || []);
        setDepartments(res.data.departments || []);
      })
      .catch(err => {
        console.error("Failed to load profile choices", err);
        alert("Failed to load form options.");
      })
      .finally(() => setLoadingChoices(false));
  }, []);

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      username,
      first_name,
      last_name,
      email,
      password,
      position,
      department,
    };

    try {
      await api.post("register/", payload);
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data || err.message;
      alert(typeof msg === "object" ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingChoices) {
    return <p className="text-center mt-20">Loading registration form...</p>;
  }

  /* ---------- Render ---------- */
  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen bg-[#F4F7FA] p-10">
      <div className="bg-white shadow-2xl rounded-2xl px-10 py-12 w-full max-w-[900px]">
        <h1 className="text-4xl font-bold text-center mb-6">Create Account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex flex-wrap justify-between w-full max-w-[800px]">
            <InputField label="First Name" placeholder="John" onChange={setFirstname} value={first_name} />
            <InputField label="Last Name" placeholder="Doe" onChange={setLastname} value={last_name} />
          </div>

          <div className="flex flex-wrap justify-between w-full max-w-[800px]">
            <InputField label="Username" placeholder="johndoe123" onChange={setUsername} value={username} />
            <InputField label="Email" placeholder="john@example.com" type="email" onChange={setEmail} value={email} />
          </div>

          <div className="flex flex-wrap justify-between w-full max-w-[800px]">
            <SelectField label="Position" options={positions} value={position} onChange={setPosition} />
            <SelectField label="Department" options={departments} value={department} onChange={setDepartment} />
          </div>

          <div className="w-full max-w-[800px]">
            <InputField
              label="Password"
              placeholder="Enter your password"
              type="password"
              width="w-full"
              onChange={setPassword}
              value={password}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-8 px-16 py-3 rounded-lg text-white font-semibold flex items-center ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? <>Registering <Spinner /></> : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
