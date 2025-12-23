// import { Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";

// export default function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is logged in by seeing if token exists
//     const token = localStorage.getItem("access");
//     setIsLoggedIn(!!token);
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//     navigate("/login");
//   };

//   return (
//     <nav className="bg-indigo-600 text-white shadow-md">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16 items-center">

//           {/* Logo */}
//           <div className="flex-shrink-0">
//             <Link to="/" className="font-bold text-xl tracking-tight hover:text-gray-200">
//               Grey Moon LMS Portal
//             </Link>
//           </div>

//           {/* Desktop menu */}
//           <div className="hidden md:flex space-x-6 items-center">
//             <Link to="/" className="block py-2 hover:text-gray-200 transition">Home</Link>
//             <Link to="/dashboard" className="hover:text-gray-200 transition">Dashboard</Link>
//             {isLoggedIn ? (
//               <button
//                 onClick={handleLogout}
//                 className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
//               >
//                 Logout
//               </button>
//             ) : (
//               <Link
//                 to="/login"
//                 className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
//               >
//                 Login
//               </Link>
//             )}
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setMenuOpen(!menuOpen)}
//               className="focus:outline-none"
//             >
//               <svg
//                 className="h-6 w-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 {menuOpen ? (
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 ) : (
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M4 6h16M4 12h16M4 18h16"
//                   />
//                 )}
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {menuOpen && (
//         <div className="md:hidden bg-indigo-700 px-4 pt-2 pb-4 space-y-1">
//             <Link to="/" className="block py-2 hover:text-gray-200 transition">Home</Link>
//           <Link to="/dashboard" className="block py-2 hover:text-gray-200 transition">Dashboard</Link>
//           {isLoggedIn ? (
//             <button
//               onClick={handleLogout}
//               className="w-full text-left py-2 bg-white text-indigo-600 font-semibold rounded hover:bg-gray-100 transition"
//             >
//               Logout
//             </button>
//           ) : (
//             <Link
//               to="/login"
//               className="block py-2 bg-white text-indigo-600 font-semibold rounded hover:bg-gray-100 transition"
//             >
//               Login
//             </Link>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// }


import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios"; // <-- import axios

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false); // ✅ new
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsLoggedIn(!!token);

    if (token) {
      api.get("me/")
        .then(res => setIsSuperuser(res.data.is_superuser))
        .catch(() => setIsSuperuser(false));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="font-bold text-xl tracking-tight hover:text-gray-200">
              Grey Moon LMS Portal
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="block py-2 hover:text-gray-200 transition">Home</Link>
            <Link
              to={isSuperuser ? "/superuser/dashboard" : "/dashboard"}
              className="hover:text-gray-200 transition"
            >
              Dashboard
            </Link>


            {/* ✅ Superuser-only Register link */}
            {isSuperuser && (
              <Link to="/register" className="hover:text-gray-200 transition">
                Register
              </Link>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-indigo-700 px-4 pt-2 pb-4 space-y-1">
          <Link to="/" className="block py-2 hover:text-gray-200 transition">Home</Link>
          <Link to="/dashboard" className="block py-2 hover:text-gray-200 transition">Dashboard</Link>

          {/* ✅ Superuser-only */}
          {isSuperuser && (
            <Link to="/register" className="block py-2 hover:text-gray-200 transition">Register</Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 bg-white text-indigo-600 font-semibold rounded hover:bg-gray-100 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="block py-2 bg-white text-indigo-600 font-semibold rounded hover:bg-gray-100 transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

