import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLayout } from './components/layout/AdminLayout';

import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardOverview } from './pages/AdminDashboardOverview';
import { AdminCoursesPage } from './pages/AdminCoursesPage';
import { AdminCourseEditorPage } from './pages/AdminCourseEditorPage';
import { AdminEnrollmentsPage } from './pages/AdminEnrollmentsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminCouponsPage } from './pages/AdminCouponsPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { AdminInstructorsPage } from './pages/AdminInstructorsPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminContentCMSPage } from './pages/AdminContentCMSPage';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Validating Administrative Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardOverview />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardOverview />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedAdminRoute>
                <AdminCoursesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/courses/new"
            element={
              <ProtectedAdminRoute>
                <AdminCourseEditorPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/courses/:id/edit"
            element={
              <ProtectedAdminRoute>
                <AdminCourseEditorPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/enrollments"
            element={
              <ProtectedAdminRoute>
                <AdminEnrollmentsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrdersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <ProtectedAdminRoute>
                <AdminCouponsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedAdminRoute>
                <AdminReviewsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedAdminRoute>
                <AdminStudentsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/instructors"
            element={
              <ProtectedAdminRoute>
                <AdminInstructorsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedAdminRoute>
                <AdminCategoriesPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/content"
            element={
              <ProtectedAdminRoute>
                <AdminContentCMSPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
