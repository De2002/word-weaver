import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, user, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = roles.includes("admin");

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
