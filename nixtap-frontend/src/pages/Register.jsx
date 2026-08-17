import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Register Form, 2: OTP Verification Form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { fullName, email, password } = formData;
    if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 100) {
      setError('Full name must be between 2 and 100 characters.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return false;
    }
    if (!password || password.length < 8 || password.length > 32) {
      setError('Password must be between 8 and 32 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register(formData.fullName.trim(), formData.email.trim(), formData.password);
      setSuccess(`An OTP verification code has been sent to ${formData.email}. Please check your inbox.`);
      setStep(2); // Move to OTP Verification step
    } catch (err) {
      const serverMessage = err.message || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      await axios.get(`http://localhost:8080/api/v1/auth/verify-email?token=${otpCode.trim()}`);
      setSuccess('Account verified & created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Invalid or expired OTP verification code. Please try again.';
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

          <Link to="/login" className="btn btn-sm btn-outline-dark rounded-pill px-3.5 py-1.5 fw-bold">
            Sign In
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
                <i className="bi bi-stars"></i>
                <span>Get started with Nixtap</span>
              </div>

              <h1 className="display-4 fw-extrabold text-dark mb-3 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", lineHeight: 1.15 }}>
                Create your digital <br />
                <span className="position-relative d-inline-block px-3 py-1 me-2 rounded-4 text-purple mt-1" 
                  style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED', transform: 'rotate(-1.5deg)' }}>
                  professional identity
                </span>
              </h1>

              <p className="text-secondary fs-6 mb-4 leading-relaxed">
                Join thousands of creators, engineers, and leaders who share their digital cards, portfolio, and contact details with one simple tap.
              </p>

              {/* Badges */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge rounded-pill px-3 py-2 fw-bold text-purple" style={{ background: '#EDE9FE' }}>
                  <i className="bi bi-shield-check me-1"></i> #InstantSetup
                </span>
                <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: '#FEF08A', color: '#854D0E' }}>
                  <i className="bi bi-person-badge me-1"></i> #CustomHandle
                </span>
                <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: '#FCE7F3', color: '#9D174D' }}>
                  <i className="bi bi-globe me-1"></i> #MiniPortfolio
                </span>
              </div>

              {/* Clean Testimonial Card */}
              <div className="p-4 rounded-5 border border-slate-200 bg-light shadow-sm">
                <div className="d-flex gap-3 align-items-center mb-3">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80" 
                    alt="Jenny Wilson" className="rounded-circle border" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                  <div>
                    <div className="fw-extrabold text-dark small">Jenny Wilson</div>
                    <div className="extra-small text-muted">Creative Director</div>
                  </div>
                </div>
                <p className="text-secondary extra-small mb-0 fst-italic leading-relaxed">
                  "The clean white playful aesthetic and instantaneous NFC tap sharing make networking super fun and memorable."
                </p>
              </div>

            </div>
          </div>

          {/* Right Column Form Card */}
          <div className="col-12 col-lg-6 col-xl-5">
            <div className="border border-slate-200 rounded-5 shadow-sm p-4 p-sm-5 bg-white position-relative">
              
              <div className="mb-4">
                <h2 className="fw-extrabold text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {step === 1 ? 'Register Account' : 'Verify Email OTP'}
                </h2>
                <p className="text-secondary small">
                  {step === 1 ? 'Set up your profile credentials in seconds' : `Enter 6-digit code sent to ${formData.email}`}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger rounded-4 border-0 small py-3 px-3.5 mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div className="alert alert-success rounded-4 border-0 small py-3 px-3.5 mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill fs-6 flex-shrink-0"></i>
                  <div>{success}</div>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3.5">
                    <label className="form-label text-dark fw-bold extra-small mb-1.5">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-sm focus-ring-purple"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

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
                    <label className="form-label text-dark fw-bold extra-small mb-1.5">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-sm focus-ring-purple"
                        placeholder="At least 8 characters"
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
                        <span>Sending OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Verification OTP</span>
                        <i className="bi bi-arrow-right-short fs-5"></i>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify}>
                  <div className="mb-4 text-center">
                    <label className="form-label text-dark fw-bold extra-small mb-2">6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-control text-center fw-extrabold fs-3 bg-light border-slate-200 text-dark rounded-4 py-3 tracking-widest focus-ring-purple"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                    <div className="extra-small text-muted mt-2">
                      Didn't receive email? Check spam folder or <button type="button" onClick={() => setStep(1)} className="btn btn-link p-0 extra-small text-purple fw-bold text-decoration-none">click here to retry</button>.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="btn text-white w-100 py-3 fw-bold rounded-pill shadow-sm border-0 d-flex align-items-center justify-content-center gap-2 transition-all"
                    style={{ background: '#7C3AED' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check fs-5 me-1"></i>
                        <span>Verify &amp; Activate Account</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-4 pt-3 border-top border-slate-100 text-center">
                <p className="text-secondary extra-small mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="fw-bold text-purple text-decoration-none">
                    Sign In instead
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer Minimal */}
      <div className="container">
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between py-3 border-top border-slate-100 extra-small text-muted">
          <div>&copy; {new Date().getFullYear()} Nixtap Platform Inc. All rights reserved.</div>
          <div className="d-flex gap-3 mt-2 mt-sm-0">
            <Link to="/" className="text-muted text-decoration-none">Privacy</Link>
            <Link to="/" className="text-muted text-decoration-none">Terms</Link>
            <Link to="/" className="text-muted text-decoration-none">Support</Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;
