import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getRoleHome } from "../../utils/formatters.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }
  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Outlet />;
  return <Navigate to={getRoleHome(user.role)} replace />;
};

export const AuthLoading = LoadingSpinner;
export default ProtectedRoute;
