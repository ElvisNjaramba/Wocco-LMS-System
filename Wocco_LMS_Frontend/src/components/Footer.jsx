import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-indigo-600 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center">
        
        {/* Branding */}
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-lg">Grey Moon LMS Portal</span>
          <p className="text-gray-200 text-sm">© {new Date().getFullYear()} All Rights Reserved.</p>
        </div>

        {/* Links */}
        <div className="flex space-x-6">
          <Link to="/" className="hover:text-gray-200 transition text-sm">Home</Link>
          <Link to="/dashboard" className="hover:text-gray-200 transition text-sm">Dashboard</Link>
          <Link to="" className="hover:text-gray-200 transition text-sm">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
