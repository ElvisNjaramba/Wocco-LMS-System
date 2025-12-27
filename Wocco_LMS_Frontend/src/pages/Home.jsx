import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  // Check if user is authenticated
  const isLoggedIn = () => {
    return !!localStorage.getItem("access_token");
  };

  const handleGetStarted = () => {
    const token = localStorage.getItem("access");
    const isSuperuser = localStorage.getItem("is_superuser") === "true";

    if (!token) {
      navigate("/login");
    } else {
      navigate(isSuperuser ? "/superuser/dashboard" : "/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* ================= HERO SECTION ================= */}
      <section className="bg-indigo-600 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center px-6 py-20 md:py-32 gap-10">
          {/* Left Text */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome to Wocco <br /> Employee Onboarding
            </h1>
            <p className="text-lg md:text-xl text-indigo-100">
              Learn about Wocco culture, policies, and processes with interactive modules, engaging videos, and quizzes.
            </p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleGetStarted}
                className="bg-yellow-400 text-indigo-900 px-12 py-3 rounded-lg font-semibold shadow hover:bg-yellow-300 transition"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <img
              src="https://cdn.dribbble.com/userupload/19893846/file/original-2ae7ef14b61707d64f2fe68eaa5707a9.gif"
              alt="Employee onboarding illustration"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Wocco Onboarding?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white shadow rounded-lg p-6 text-center hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">
              Interactive Learning
            </h3>
            <p className="text-gray-600">
              Understand company policies, workflows, and best practices
              through engaging content and quizzes.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 text-center hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">
              Track Your Progress
            </h3>
            <p className="text-gray-600">
              Monitor your completion of onboarding modules and ensure you’re
              up to date with Wocco standards.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 text-center hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">
              Certification
            </h3>
            <p className="text-gray-600">
              Complete the final quiz to demonstrate your understanding and get
              certified in Wocco onboarding program.
            </p>
          </div>

        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="bg-indigo-50 py-20">
        <div className="container mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Begin?
          </h2>

          <p className="text-gray-700 mb-6">
            Join your fellow Wocco employees in exploring company culture,
            policies, and workflows—all in one interactive platform.
          </p>

          <button
            onClick={handleGetStarted}
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}
