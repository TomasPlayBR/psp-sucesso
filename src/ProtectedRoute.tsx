import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isSuperior } from "@/lib/roles";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperior?: boolean;
}

export default function ProtectedRoute({ children, requireSuperior }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  // Wait for Firebase Auth to resolve before redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
        <div className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>A verificar sessão...</div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  if (requireSuperior && !isSuperior(currentUser.role)) {
    return <Navigate to="/hub" replace />;
  }

  return <>{children}</>;
}
