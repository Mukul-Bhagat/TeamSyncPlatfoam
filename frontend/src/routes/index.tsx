import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProjectsPage } from '@/pages/dashboard/ProjectsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { WorkspacePage } from '@/pages/workspace/WorkspacePage';
import { ChannelPage } from '@/pages/workspace/ChannelPage';
import { IntegrationCenterPage } from '@/pages/integrations/IntegrationCenterPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/workspace',
    element: (
      <ProtectedRoute>
        <WorkspacePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/workspace/:workspaceId/channel/:channelId',
    element: (
      <ProtectedRoute>
        <ChannelPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects',
    element: (
      <ProtectedRoute>
        <ProjectsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/integrations',
    element: (
      <ProtectedRoute>
        <IntegrationCenterPage />
      </ProtectedRoute>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
