import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import { routePaths } from './routePaths';
import HomePage from '../pages/HomePage';
import JobsPage from '../pages/JobsPage';
import JobDetailsPage from '../pages/JobDetailsPage';
import ApplyPage from '../pages/ApplyPage';
import ManageJobsPage from '../pages/ManageJobsPage';
import CompaniesPage from '../pages/CompaniesPage';
import CompanyDetailsPage from '../pages/CompanyDetailsPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import NotFoundPage from '../pages/NotFoundPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={routePaths.home} element={<HomePage />} />
          <Route path={routePaths.jobs} element={<JobsPage />} />
          <Route path={routePaths.jobDetails} element={<JobDetailsPage />} />
          <Route path={routePaths.apply} element={<ApplyPage />} />
          <Route path={routePaths.companies} element={<CompaniesPage />} />
          <Route path={routePaths.companyDetails} element={<CompanyDetailsPage />} />

          <Route element={<ProtectedRoute allowedRoles={['job-seeker', 'employer', 'admin']} />}>
            <Route path={routePaths.dashboard} element={<DashboardPage />} />
            <Route path={routePaths.profile} element={<ProfilePage />} />
            <Route path={routePaths.notifications} element={<NotificationsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['employer', 'admin']} />}>
            <Route path={routePaths.manageJobs} element={<ManageJobsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path={routePaths.adminUsers} element={<AdminUsersPage />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={routePaths.login} element={<LoginPage />} />
          <Route path={routePaths.register} element={<RegisterPage />} />
        </Route>

        <Route path="/signup" element={<Navigate to={routePaths.register} replace />} />
        <Route path={routePaths.notFound} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
