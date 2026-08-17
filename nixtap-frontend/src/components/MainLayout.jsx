import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDrawer from './notifications/NotificationDrawer';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  };

  const isAdmin =
    user?.role === 'ROLE_ADMIN' ||
    user?.role === 'ADMIN' ||
    (Array.isArray(user?.roles) && user.roles.some((r) => String(r).toUpperCase().includes('ADMIN')));

  return (
    <div className="app-bg min-vh-100 d-flex flex-column">

      {/* ── TOP NAVBAR ──────────────────────────────────────────────────── */}
      <nav className="navbar navbar-expand-lg bg-white sticky-top" style={{ borderBottom: '1px solid #e2e8f0', minHeight: '60px' }}>
        <div className="container-fluid px-lg-5">

          {/* Brand */}
          <NavLink className="navbar-brand d-flex align-items-center gap-2 me-4" to={isAdmin ? '/admin' : '/dashboard'}>
            <div className="rounded-3 p-1.5 bg-purple text-white d-flex align-items-center justify-content-center shadow-sm" 
              style={{ width: '34px', height: '34px', background: '#7C3AED' }}>
              <i className="bi bi-flower1 fs-6"></i>
            </div>
            <span className="fw-extrabold fs-4 text-dark" style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}>
              Nixtap<span style={{ color: '#7C3AED' }}>.</span>
            </span>
            {isAdmin && (
              <span className="badge bg-danger-subtle text-danger rounded-pill extra-small fw-bold border border-danger-subtle d-inline-flex align-items-center gap-1">
                <i className="bi bi-shield-lock-fill"></i> ADMIN
              </span>
            )}
          </NavLink>

          {/* Mobile Toggler */}
          <button
            className="navbar-toggler border-0 ms-auto me-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">

            {/* ── ADMIN NAV LINKS ─────────────────────────────────────── */}
            {isAdmin ? (
              <div className="mx-auto"></div>
            ) : (
              /* ── USER NAV LINKS ─────────────────────────────────────── */
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 px-2 py-1 rounded-pill border border-slate-200 bg-light align-items-lg-center">
                <li className="nav-item">
                  <NavLink to="/dashboard"
                    className={({ isActive }) =>
                      `nav-link px-3 py-1.5 rounded-pill fw-bold small transition-all ${isActive ? 'bg-dark text-white shadow-sm' : 'text-slate-600 hover-text-dark'}`
                    }>
                    <i className="bi bi-grid-fill me-1.5"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/cards"
                    className={({ isActive }) =>
                      `nav-link px-3 py-1.5 rounded-pill fw-bold small transition-all ${isActive ? 'bg-dark text-white shadow-sm' : 'text-slate-600 hover-text-dark'}`
                    }>
                    <i className="bi bi-credit-card-fill me-1.5"></i> Cards
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/portfolio"
                    className={({ isActive }) =>
                      `nav-link px-3 py-1.5 rounded-pill fw-bold small transition-all ${isActive ? 'bg-dark text-white shadow-sm' : 'text-slate-600 hover-text-dark'}`
                    }>
                    <i className="bi bi-journal-code me-1.5"></i> Portfolio
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/meetings"
                    className={({ isActive }) =>
                      `nav-link px-3 py-1.5 rounded-pill fw-bold small transition-all ${isActive ? 'bg-dark text-white shadow-sm' : 'text-slate-600 hover-text-dark'}`
                    }>
                    <i className="bi bi-calendar-check-fill me-1.5"></i> Meetings
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/feedback"
                    className={({ isActive }) =>
                      `nav-link px-3 py-1.5 rounded-pill fw-bold small transition-all ${isActive ? 'bg-dark text-white shadow-sm' : 'text-slate-600 hover-text-dark'}`
                    }>
                    <i className="bi bi-star-fill me-1.5"></i> Feedback
                  </NavLink>
                </li>
              </ul>
            )}

            {/* ── RIGHT SIDE: Notifications + Avatar + Logout ─────────── */}
            <div className="d-flex align-items-center gap-2 ms-lg-3">

              {/* Notification Bell */}
              <NotificationDrawer />

              {/* Profile link avatar */}
              <NavLink to="/profile" className="text-decoration-none d-flex align-items-center gap-2">
                <div
                  className={`rounded-circle fw-bold d-flex align-items-center justify-content-center shadow-xs flex-shrink-0`}
                  style={{
                    width: '36px', height: '36px', fontSize: '0.8rem',
                    background: isAdmin ? '#EF4444' : 'linear-gradient(135deg, #7C3AED, #6366F1)',
                    color: '#fff',
                  }}>
                  {isAdmin ? <i className="bi bi-shield-check"></i> : getInitials(user?.fullName)}
                </div>
                <div className="d-none d-lg-flex flex-column">
                  <span className="text-dark fw-bold" style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                    {user?.fullName?.split(' ')[0] || (isAdmin ? 'Admin' : 'User')}
                  </span>
                  <span className={`fw-semibold ${isAdmin ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.68rem' }}>
                    {isAdmin ? 'ADMINISTRATOR' : 'USER'}
                  </span>
                </div>
              </NavLink>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-light border border-slate-200 rounded-pill px-3 text-secondary fw-semibold"
                style={{ fontSize: '0.78rem' }}
                disabled={loggingOut}
                title="Sign out"
              >
                {loggingOut
                  ? <span className="spinner-border spinner-border-sm"></span>
                  : <><i className="bi bi-box-arrow-right me-1"></i><span className="d-none d-sm-inline">Logout</span></>
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ────────────────────────────────────────────────── */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="footer-premium py-4 text-center small">
        <div className="container">
          <span style={{ color: '#94a3b8' }}>
            &copy; {new Date().getFullYear()}{' '}
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>
              Nixtap
            </span>{' '}
            Microservices Platform. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
