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

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/repositories" element={<RepositoriesPage />} />
        <Route path="/repositories/new" element={<RepositoryNewPage />} />

        <Route path="/repositories/:id" element={<RepositoryDetailPage />} />
        <Route path="/repositories/:id/pull-requests" element={<RepositoryPullRequestsPage />} />
        <Route path="/repositories/:id/issues" element={<RepositoryIssuesPage />} />
        <Route path="/repositories/:id/reviews" element={<RepositoryReviewsPage />} />
        <Route path="/repositories/:id/workload" element={<RepositoryWorkloadPage />} />
        <Route path="/repositories/:id/hotspots" element={<RepositoryHotspotsPage />} />
        <Route
          path="/repositories/:id/release-readiness"
          element={<RepositoryReleaseReadinessPage />}
        />
        <Route
          path="/repositories/:id/technical-debt"
          element={<RepositoryTechnicalDebtPage />}
        />
        <Route path="/repositories/:id/weekly-digest" element={<RepositoryWeeklyDigestPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
