import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { NotFound } from '../../components/ui/NotFound';
import { useAuth } from '../../hooks/useAuth';

// Lazy load feature pages from features directory
const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage'));
const CampaignsPage = lazy(() => import('../../features/campaigns/pages/CampaignsPage'));
const TemplatesPage = lazy(() => import('../../features/templates/pages/TemplatesPage'));
const ContactsPage = lazy(() => import('../../features/contacts/pages/ContactsPage'));
const AnalyticsPage = lazy(() => import('../../features/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('../../features/settings/pages/SettingsPage'));
const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" message="Loading MailPilot..." />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
