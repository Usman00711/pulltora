import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/layouts/main-layout';
import LandingPage from '@/pages/landing-page';
import LoginPage from '@/pages/login-page';
import RegisterPage from '@/pages/register-page';
import DashboardPage from '@/pages/dashboard-page';
import RepositoriesPage from '@/pages/repositories-page';
import RepositoryNewPage from '@/pages/repository-new-page';
import RepositoryDetailPage from '@/pages/repository-detail-page';
import RepositoryPullRequestsPage from '@/pages/repository-pull-requests-page';
import RepositoryIssuesPage from '@/pages/repository-issues-page';
import RepositoryReviewsPage from '@/pages/repository-reviews-page';
import RepositoryWorkloadPage from '@/pages/repository-workload-page';
import RepositoryHotspotsPage from '@/pages/repository-hotspots-page';
import RepositoryReleaseReadinessPage from '@/pages/repository-release-readiness-page';
import RepositoryTechnicalDebtPage from '@/pages/repository-technical-debt-page';
import RepositoryWeeklyDigestPage from '@/pages/repository-weekly-digest-page';
import SettingsPage from '@/pages/settings-page';
import { ProtectedRoute } from './protected-route';
import { PublicRoute } from './public-route';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/repositories" element={<ProtectedRoute><RepositoriesPage /></ProtectedRoute>} />
        <Route path="/repositories/new" element={<ProtectedRoute><RepositoryNewPage /></ProtectedRoute>} />

        <Route path="/repositories/:id" element={<ProtectedRoute><RepositoryDetailPage /></ProtectedRoute>} />
        <Route path="/repositories/:id/pull-requests" element={<ProtectedRoute><RepositoryPullRequestsPage /></ProtectedRoute>} />
        <Route path="/repositories/:id/issues" element={<ProtectedRoute><RepositoryIssuesPage /></ProtectedRoute>} />
        <Route path="/repositories/:id/reviews" element={<ProtectedRoute><RepositoryReviewsPage /></ProtectedRoute>} />
        <Route path="/repositories/:id/workload" element={<ProtectedRoute><RepositoryWorkloadPage /></ProtectedRoute>} />
        <Route path="/repositories/:id/hotspots" element={<ProtectedRoute><RepositoryHotspotsPage /></ProtectedRoute>} />
        <Route
          path="/repositories/:id/release-readiness"
          element={<ProtectedRoute><RepositoryReleaseReadinessPage /></ProtectedRoute>}
        />
        <Route
          path="/repositories/:id/technical-debt"
          element={<ProtectedRoute><RepositoryTechnicalDebtPage /></ProtectedRoute>}
        />
        <Route path="/repositories/:id/weekly-digest" element={<ProtectedRoute><RepositoryWeeklyDigestPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
