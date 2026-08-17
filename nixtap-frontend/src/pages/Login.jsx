import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(formData.email, formData.password);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = res?.data?.role || res?.role || storedUser?.role || (formData.email.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER');

      if (role === 'ROLE_ADMIN' || role === 'ADMIN' || formData.email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const serverMessage = err.message || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between py-4 bg-white text-dark" 
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header Brand */}
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2">
          <Link className="d-inline-flex align-items-center fw-extrabold fs-4 text-decoration-none text-dark gap-2" to="/">
            <div className="rounded-3 p-2 bg-purple text-white d-flex align-items-center justify-content-center shadow-sm" 
              style={{ width: '38px', height: '38px', background: '#7C3AED' }}>
              <i className="bi bi-flower1 fs-5"></i>
            </div>
            <span className="fw-extrabold tracking-tight text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Nixtap<span style={{ color: '#7C3AED' }}>.</span>
            </span>
          </Link>

          <Link to="/register" className="btn btn-sm btn-outline-dark rounded-pill px-3.5 py-1.5 fw-bold">
            Create Account
          </Link>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="container my-auto py-4">
        <div className="row align-items-center g-5 justify-content-center">
          
          {/* Left Column Playful Showcase */}
          <div className="col-12 col-lg-6 col-xl-5 d-none d-lg-block">
            <div className="pe-xl-4">
              
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-pastel-lavender text-purple fw-bold small mb-4">
                <i className="bi bi-[#7C3AED] bi-stars"></i>
                <span>Welcome back to Nixtap</span>
              </div>

              <h1 className="display-4 fw-extrabold text-dark mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", lineHeight: 1.15 }}>
                Sign in to your <br />
                <span className="position-relative d-inline-block px-3 py-1 me-2 rounded-4 text-purple mt-1" 
                  style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED', transform: 'rotate(-1.5deg)' }}>
                  digital card hub
                </span>
              </h1>

              <p className="text-secondary fs-6 mb-4 leading-relaxed">
                Manage your NFC tags, digital business cards, view live scan telemetry, and receive booking requests directly from your custom handles.
              </p>

              {/* Badges */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge rounded-pill px-3 py-2 fw-bold text-purple" style={{ background: '#EDE9FE' }}>
                  <i className="bi bi-nfc me-1"></i> #NFCReady
                </span>
                <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: '#FEF08A', color: '#854D0E' }}>
                  <i className="bi bi-qr-code me-1"></i> #InstantScan
                </span>
                <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: '#FCE7F3', color: '#9D174D' }}>
                  <i className="bi bi-graph-up-arrow me-1"></i> #LiveStats
                </span>
              </div>

              {/* Clean Testimonial Card */}
              <div className="p-4 rounded-5 border border-slate-200 bg-light shadow-sm">
                <div className="d-flex gap-3 align-items-center mb-3">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" 
                    alt="Kristin Watson" className="rounded-circle border" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                  <div>
                    <div className="fw-extrabold text-dark small">Kristin Watson</div>
                    <div className="extra-small text-muted">Senior Product Designer</div>
                  </div>
                </div>
                <p className="text-secondary extra-small mb-0 fst-italic leading-relaxed">
                  "Nixtap replaced my paper cards completely! One tap at events and people are immediately blown away by my clean profile."
                </p>
              </div>

            </div>
          </div>

          {/* Right Column Form Card */}
          <div className="col-12 col-lg-6 col-xl-5">
            <div className="border border-slate-200 rounded-5 shadow-sm p-4 p-sm-5 bg-white position-relative">
              
              <div className="mb-4">
                <h2 className="fw-extrabold text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Sign In</h2>
                <p className="text-secondary small">Enter your account credentials to continue</p>
              </div>

              {error && (
                <div className="alert alert-danger rounded-4 border-0 small py-3 px-3.5 mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3.5">
                  <label className="form-label text-dark fw-bold extra-small mb-1.5">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-sm focus-ring-purple"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <label className="form-label text-dark fw-bold extra-small mb-0">Password</label>
                    <Link to="/forgot-password" className="fw-bold extra-small text-decoration-none" style={{ color: '#7C3AED' }}>
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-sm focus-ring-purple"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn text-white w-100 py-3 fw-bold rounded-pill shadow-sm border-0 d-flex align-items-center justify-content-center gap-2 transition-all"
                  style={{ background: '#7C3AED' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <i className="bi bi-arrow-right-short fs-5"></i>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-3 border-top border-slate-100 text-center">
                <span className="text-secondary extra-small">Don't have an account? </span>
                <Link to="/register" className="fw-bold text-purple text-decoration-none extra-small ms-1" style={{ color: '#7C3AED' }}>
                  Register here
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="container py-2 text-center text-muted extra-small">
        © 2026 Nixtap Inc. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
