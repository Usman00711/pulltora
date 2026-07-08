import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import type { ReactNode } from 'react';

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
