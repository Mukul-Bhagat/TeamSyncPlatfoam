import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import type { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!initialized || loading) {
    return <LoadingPage />;
  }

  // Redirect to workspace if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/workspace';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
