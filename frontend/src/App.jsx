import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import SignInPage from './pages/SignInPage';

/* Routes where we HIDE the global navbar/footer (they have their own) */
const STANDALONE_ROUTES = ['/', '/signin'];

function AppShell({ theme, setTheme, themes }) {
  const location = useLocation();
  const isStandalone = STANDALONE_ROUTES.includes(location.pathname);

  /* Simple auth guard */
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('dg-user')); } catch { return null; }
  })();

  const ProtectedRoute = ({ element }) => {
    if (!user) return <Navigate to="/signin" replace />;
    return element;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isStandalone ? undefined : 'var(--bg-primary)' }}>
      {!isStandalone && <Navbar theme={theme} setTheme={setTheme} themes={themes} />}
      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/signin"    element={<SignInPage />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
          <Route path="/analytics" element={<ProtectedRoute element={<AnalyticsPage />} />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isStandalone && <Footer />}
    </div>
  );
}

export default function App() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <BrowserRouter>
      <AppShell theme={theme} setTheme={setTheme} themes={themes} />
    </BrowserRouter>
  );
}
