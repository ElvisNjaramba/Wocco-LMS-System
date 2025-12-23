'use client';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import SuperuserDashboard from "./pages/SuperuserDashboard";
import AddUser from "./components/AddUserForm";
import UploadUsers from "./components/UploadCsv";
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ModuleDetail from './pages/ModuleDetail';
import ModuleContent from './pages/ModuleContent';
import ModuleQuiz from './pages/ModuleQuiz';
import FinalQuiz from './pages/FinalQuiz';
import FinalQuizResult from './pages/FinalQuizResult';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SuperuserOnly from './components/SuperuserOnly';

function AppRoutes() {
  const location = useLocation();
  const hideOn = ['/login', '/register'];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show Navbar unless on login/register */}
      {!hideOn.includes(location.pathname) && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/modules/:id" element={<ModuleDetail />} />
          <Route path="/modules/:id/content" element={<ModuleContent />} />
          <Route path="/modules/:id/quiz" element={<ModuleQuiz />} />
          <Route
            path="/register"
            element={
              <SuperuserOnly>
                <Register />
              </SuperuserOnly>
            }
          />
          <Route path="/superuser/dashboard" element={<SuperuserDashboard />} />
          <Route path="/superuser/add-user" element={<AddUser />} />
          <Route path="/superuser/upload-users" element={<UploadUsers />} />
          <Route path="/final-quiz" element={<FinalQuiz />} />
          <Route path="/final-quiz/result" element={<FinalQuizResult />} />
        </Routes>
      </main>

      {/* Show Footer unless on login/register */}
      {!hideOn.includes(location.pathname) && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
