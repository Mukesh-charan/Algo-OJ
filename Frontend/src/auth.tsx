import React from "react";
import { Navigate, useParams } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  role: string;
}

interface ContestProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/login" replace />;
  }

  // Return children wrapped in a fragment to ensure valid JSX.Element
  return <>{children}</>;
}

export function RoleProtectedRoute({ children, role }: RoleProtectedRouteProps): React.ReactElement {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token || userType !== role) {
    // Redirect to login if not authorized
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function ContestProtectedRoute({ children }: ContestProtectedRouteProps): React.ReactElement {
  const { id, contestId } = useParams();

  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const contestKey = id || contestId;

  if (!contestKey) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = localStorage.getItem(`contestAccess_${contestKey}`);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function handleLogout() {
  localStorage.clear();
};
