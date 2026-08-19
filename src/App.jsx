/**
 * Route table
 * Public              /  /about  /features  /contact  /search
 * Authentication      /login  /register  /verify-otp  /forgot-password  /reset-password
 * Student  (portal)   /dashboard  /dashboard/search  /dashboard/upload
 *                     /dashboard/upload-history  /dashboard/download-history
 *                     /dashboard/profile  /dashboard/paper/:id
 * Admin    (portal)   /admin  /admin/papers  /admin/papers/:id  /admin/users
 */
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import { ProtectedRoute, StudentRoute, AdminRoute, PublicOnlyRoute } from './routes/guards';

import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import ContactPage from './pages/public/ContactPage';
import PublicSearchPage from './pages/public/PublicSearchPage';
import NotFoundPage from './pages/public/NotFoundPage';
import ForbiddenPage from './pages/public/ForbiddenPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import StudentDashboardPage from './pages/student/StudentDashboardPage';
import SearchPapersPage from './pages/student/SearchPapersPage';
import UploadPaperPage from './pages/student/UploadPaperPage';
import UploadHistoryPage from './pages/student/UploadHistoryPage';
import DownloadHistoryPage from './pages/student/DownloadHistoryPage';
import PaperDetailPage from './pages/student/PaperDetailPage';
import ProfilePage from './pages/student/ProfilePage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManagePapersPage from './pages/admin/ManagePapersPage';
import ReviewPaperPage from './pages/admin/ReviewPaperPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

export default function App() {
  return (
    <Routes>
      {/*  Public + authentication  */}
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="search" element={<PublicSearchPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-otp" element={<VerifyOtpPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/*  Student portal  */}
      <Route element={<StudentRoute />}>
        <Route path="/dashboard" element={<StudentLayout />}>
          <Route index element={<StudentDashboardPage />} />
          <Route path="search" element={<SearchPapersPage />} />
          <Route path="upload" element={<UploadPaperPage />} />
          <Route path="upload-history" element={<UploadHistoryPage />} />
          <Route path="download-history" element={<DownloadHistoryPage />} />
          <Route path="paper/:id" element={<PaperDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/*  Administrator portal  */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="papers" element={<ManagePapersPage />} />
          <Route path="papers/:id" element={<ReviewPaperPage />} />
          <Route path="users" element={<ManageUsersPage />} />
        </Route>
      </Route>

      {/* A signed-in user hitting a bare protected path lands somewhere sane. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/paper/:id" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
