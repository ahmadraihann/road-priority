// src/modules/redirect.tsx
import { Navigate } from "react-router";

const RedirectPage = () => {
  return <Navigate to="/dashboard" replace />;
};

export default RedirectPage;
