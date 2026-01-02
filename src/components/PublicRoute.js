import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const user = useSelector((state) => state.auth.user);

  // If already logged in, NEVER allow /login
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicRoute;
