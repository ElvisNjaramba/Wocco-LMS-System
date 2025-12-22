import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const InputField = ({ label, placeholder, type = "text", value, onChange }) => {
  return (
    <div className="flex flex-col w-full md:w-[48%] px-2 mb-4">
      <label className="font-semibold mb-1 text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 transition-all w-full"
        required
      />
    </div>
  );
};

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white inline-block ml-2"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>
);

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("token/", { username, password });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("username", username);

      const profileRes = await api.get("profile/");
      const profile = profileRes.data[0];
      if (profile?.user?.is_superuser) {
        navigate("/superuser/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-[900px] flex flex-col md:flex-row overflow-hidden">

        {/* Left image section */}
        <div className="md:w-1/2 h-64 md:h-auto bg-indigo-600 relative flex-shrink-0">
          <img
            src="https://cdn.dribbble.com/userupload/19893846/file/original-2ae7ef14b61707d64f2fe68eaa5707a9.gif"
            alt="Learning illustration"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-indigo-700 opacity-30"></div>
        </div>

        {/* Form section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Log in to your account and continue your learning journey.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-wrap justify-between">
            <InputField
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={setUsername}
            />
            <InputField
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={setPassword}
            />

            {/* <div className="w-full text-right mb-4">
              <span
                className="text-indigo-600 font-medium text-sm cursor-pointer hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div> */}

            <div className="w-full mt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg flex justify-center items-center transition-colors hover:bg-indigo-700 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    Logging in...
                    <Spinner />
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          {/* <p className="text-center text-gray-500 mt-6 text-sm">
            Don’t have an account?{" "}
            <span
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
