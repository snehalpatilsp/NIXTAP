import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import CardsPage from './pages/CardsPage';
import PortfolioDashboardPage from './pages/PortfolioDashboardPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PublicCardPage from './pages/PublicCardPage';
import PublicProfilePage from './pages/PublicProfilePage';
import PublicQrPage from './pages/PublicQrPage';

import MeetingsPage from './pages/MeetingsPage';
import FeedbackPage from './pages/FeedbackPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Unauthenticated Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/card/:cardId"
            element={
              <ErrorBoundary moduleName="Public Digital Business Card">
                <PublicCardPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/u/:userId"
            element={
              <ErrorBoundary moduleName="Public User Profile Showcase">
                <PublicProfilePage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/profile/user/:userId"
            element={
              <ErrorBoundary moduleName="Public User Profile Showcase">
                <PublicProfilePage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/:username/portfolio"
            element={
              <ErrorBoundary moduleName="Public Username Portfolio Showcase">
                <PublicProfilePage defaultTab="overview" />
              </ErrorBoundary>
            }
          />
          <Route
            path="/:username/cards"
            element={
              <ErrorBoundary moduleName="Public Username Cards Showcase">
                <PublicProfilePage defaultTab="cards" />
              </ErrorBoundary>
            }
          />
          <Route
            path="/:username/qr"
            element={
              <ErrorBoundary moduleName="Public Username QR Studio">
                <PublicQrPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/:username"
            element={
              <ErrorBoundary moduleName="Public Username Social & Cards Showcase">
                <PublicProfilePage defaultTab="cards" />
              </ErrorBoundary>
            }
          />

          {/* Protected Routes wrapped inside MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* User Only Routes (Admins are redirected to /admin) */}
              <Route element={<UserRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/cards"
                  element={
                    <ErrorBoundary moduleName="Digital Business Cards Engine">
                      <CardsPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/portfolio"
                  element={
                    <ErrorBoundary moduleName="Portfolio Showcase Studio">
                      <PortfolioDashboardPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/meetings"
                  element={
                    <ErrorBoundary moduleName="Meeting Scheduler Studio">
                      <MeetingsPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/feedback"
                  element={
                    <ErrorBoundary moduleName="Card Feedback & Reviews Studio">
                      <FeedbackPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ErrorBoundary moduleName="Profile & Social Links Manager">
                      <ProfilePage />
                    </ErrorBoundary>
                  }
                />
              </Route>

              {/* Admin Protected Route */}
              <Route element={<AdminRoute />}>
                <Route
                  path="/admin"
                  element={
                    <ErrorBoundary moduleName="System Administration Control Center">
                      <AdminDashboardPage />
                    </ErrorBoundary>
                  }
                />
              </Route>
            </Route>
          </Route>

          {/* Public Home Page */}
          <Route path="/" element={<Home />} />

          {/* Default Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
