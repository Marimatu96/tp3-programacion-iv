import { Navigate, Outlet } from "react-router";
import { useAuth } from "./Auth";

export function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // Sin sesión iniciada, se redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}