import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../shared/layout/Layout';
import Loader from '../../shared/ui/Loader';
import EmptyState from '../../shared/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';

// Lazy load feature pages for optimal code splitting
const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const InboxPage = lazy(() => import('../../features/inbox/pages/InboxPage'));
const CampaignsPage = lazy(() => import('../../features/campaigns/pages/CampaignsPage'));
const TemplatesPage = lazy(() => import('../../features/templates/pages/TemplatesPage'));
const ContactsPage = lazy(() => import('../../features/contacts/pages/ContactsPage'));
const AnalyticsPage = lazy(() => import('../../features/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../../features/settings/pages/SettingsPage'));
const AiWorkspacePage = lazy(() => import('../../features/ai/pages/AiWorkspacePage'));
const WorkflowsPage = lazy(() => import('../../features/workflows/pages/WorkflowsPage'));
const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../../features/auth/pages/ResetPasswordPage'));
const UnsubscribePage = lazy(() => import('../../features/auth/pages/UnsubscribePage'));

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center p-6">
      <EmptyState
        title="404 — Page Not Found"
        description="The requested page could not be located in MailPilot."
        actionLabel="Return to Dashboard"
        onAction={() => navigate('/', { replace: true })}
      />
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While checking session on mount, show full-screen loader (not redirect)
  if (isLoading) {
    return <Loader size="lg" message="Loading MailPilot..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader size="lg" message="Loading MailPilot..." />;
  }

  // Redirect already-authenticated users away from login/register
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader size="lg" message="Loading MailPilot..." />}>
      <Routes>
        {/* Public auth & compliance routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/unsubscribe"
          element={<UnsubscribePage />}
        />

        {/* Protected workspace routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-workspace" element={<AiWorkspacePage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;

