import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

const SuperuserOnly = ({ children }) => {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    api.get("me/")
      .then(res => {
        setAllowed(res.data.is_superuser === true);
      })
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) return null; // or spinner
  if (!allowed) return <Navigate to="/dashboard" replace />;

  return children;
};

export default SuperuserOnly;
