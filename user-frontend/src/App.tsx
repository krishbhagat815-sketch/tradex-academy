import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { CertificateVerifyPage } from './pages/CertificateVerifyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Do not render top Navbar or bottom Footer inside full-screen Course Player
  const isPlayer = location.pathname.startsWith('/learn/');

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {!isPlayer && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isPlayer && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:id" element={<CourseDetailsPage />} />
            <Route path="/checkout/:courseId" element={<CheckoutPage />} />
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/learn/:courseId" element={<CoursePlayerPage />} />
            <Route path="/verify-certificate" element={<CertificateVerifyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
