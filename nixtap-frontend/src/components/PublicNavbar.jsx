import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicNavbar = () => {
  const { isAuthenticated, user } = useAuth();

  const isAdmin =
    user?.role === 'ROLE_ADMIN' ||
    user?.role === 'ADMIN' ||
    (Array.isArray(user?.roles) && user.roles.some((r) => String(r).toUpperCase().includes('ADMIN')));

  return (
    <nav className="navbar navbar-expand-lg sticky-top py-3 border-bottom border-slate-100 bg-white" 
      style={{ backdropFilter: 'blur(20px)', zIndex: 1000 }}>
      <div className="container">
        {/* Brand / Logo */}
        <Link className="navbar-brand d-flex align-items-center fw-extrabold fs-4 me-4 text-dark" to="/">
          <div className="rounded-3 p-2 bg-purple me-2 shadow-sm d-flex align-items-center justify-content-center text-white" 
            style={{ width: '38px', height: '38px', background: '#7C3AED' }}>
            <i className="bi bi-flower1 fs-5"></i>
          </div>
          <span className="fw-extrabold tracking-tight text-dark" style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
            Nixtap<span style={{ color: '#7C3AED' }}>.</span>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0 text-dark shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#publicNavbar"
          aria-controls="publicNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-2 text-dark"></i>
        </button>

        <div className="collapse navbar-collapse" id="publicNavbar">
          {/* Centered Pill Nav */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 px-3 py-1.5 rounded-pill border border-slate-200 bg-light">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link px-3.5 py-1.5 rounded-pill fw-bold small transition-all ${
                    isActive ? 'bg-dark text-white shadow-sm' : 'text-slate-600 hover-text-dark'
                  }`
                }
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <a
                href="#features"
                className="nav-link px-3.5 py-1.5 rounded-pill fw-bold small text-slate-600 hover-text-dark"
              >
                Features
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#how"
                className="nav-link px-3.5 py-1.5 rounded-pill fw-bold small text-slate-600 hover-text-dark"
              >
                How It Works
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#testimonials"
                className="nav-link px-3.5 py-1.5 rounded-pill fw-bold small text-slate-600 hover-text-dark"
              >
                Reviews
              </a>
            </li>
          </ul>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className="btn text-white fw-bold px-4 py-2.5 small d-flex align-items-center gap-2 rounded-pill border-0 shadow-sm transition-all"
                  style={{ background: '#7C3AED' }}
                >
                  <span>{isAdmin ? "Admin Portal" : "Dashboard"}</span>
                  <i className="bi bi-arrow-up-right-circle-fill fs-6"></i>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="fw-bold text-slate-700 hover-text-dark text-decoration-none small px-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn text-white fw-bold px-4 py-2.5 small d-flex align-items-center gap-2 rounded-pill border-0 shadow-sm transition-all"
                  style={{ background: '#7C3AED' }}
                >
                  <span>Get Started</span>
                  <div className="rounded-circle bg-white bg-opacity-20 p-1 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                    <i className="bi bi-arrow-up-right fs-6 text-white"></i>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
