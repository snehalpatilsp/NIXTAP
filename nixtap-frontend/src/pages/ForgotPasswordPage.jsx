import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // Step 1: Enter Email | Step 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Step 1: Send OTP to user's email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccessMsg(`A 6-digit OTP code has been sent to ${email}`);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Please check your email address.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(otp, newPassword);
      setSuccessMsg('Password reset successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-between py-4 bg-white text-dark"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Top Header */}
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2">
          <Link className="d-inline-flex align-items-center fw-extrabold fs-4 text-decoration-none text-dark gap-2" to="/">
            <div className="rounded-3 p-2 text-white d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '38px', height: '38px', background: '#7C3AED' }}>
              <i className="bi bi-flower1 fs-5"></i>
            </div>
            <span className="fw-extrabold tracking-tight text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Nixtap<span style={{ color: '#7C3AED' }}>.</span>
            </span>
          </Link>

          <Link to="/login" className="btn btn-sm btn-outline-dark rounded-pill px-3.5 py-1.5 fw-bold">
            Back to Sign In
          </Link>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="container my-auto py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="border border-slate-200 rounded-5 shadow-sm p-4 p-sm-5 bg-white position-relative">
              
              {/* Header Title */}
              <div className="mb-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3 text-purple"
                  style={{ background: '#EDE9FE', color: '#7C3AED', width: '64px', height: '64px' }}>
                  <i className={`bi ${step === 1 ? 'bi-shield-lock-fill' : 'bi-key-fill'} fs-2`}></i>
                </div>
                <h2 className="fw-extrabold text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
                </h2>
                <p className="text-secondary small">
                  {step === 1 
                    ? 'Enter your registered email address to receive a 6-digit OTP code'
                    : `Enter the 6-digit OTP code sent to ${email} and your new password`}
                </p>
              </div>

              {/* Status Notifications */}
              {error && (
                <div className="alert alert-danger rounded-4 border-0 small py-3 px-3.5 mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
                  <div>{error}</div>
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success rounded-4 border-0 small py-3 px-3.5 mb-4 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill fs-6 flex-shrink-0"></i>
                  <div>{successMsg}</div>
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {step === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-4">
                    <label className="form-label text-dark fw-bold extra-small mb-1.5">Registered Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-sm focus-ring-purple"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit Reset OTP</span>
                        <i className="bi bi-arrow-right-short fs-5"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter OTP & New Password */}
              {step === 2 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold extra-small mb-1.5">6-Digit Verification OTP Code</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                        <i className="bi bi-shield-check"></i>
                      </span>
                      <input
                        type="text"
                        maxLength="6"
                        className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-center fw-bold letter-spacing-2 text-sm focus-ring-purple"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-dark fw-bold extra-small mb-1.5">New Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-sm focus-ring-purple"
                        placeholder="•••••••• (Min 8 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-dark fw-bold extra-small mb-1.5">Confirm New Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-slate-200 text-muted rounded-start-4 border-end-0 px-3">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-slate-200 text-dark rounded-end-4 py-2.5 px-3 text-sm focus-ring-purple"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn text-white w-100 py-3 fw-bold rounded-pill shadow-sm border-0 d-flex align-items-center justify-content-center gap-2 transition-all mb-2"
                    style={{ background: '#7C3AED' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password &amp; Save</span>
                        <i className="bi bi-check-circle-fill"></i>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-sm btn-link text-muted text-decoration-none w-100 extra-small fw-bold"
                  >
                    <i className="bi bi-arrow-left me-1"></i> Change Email Address
                  </button>
                </form>
              )}

              <div className="mt-4 pt-3 border-top border-slate-100 text-center">
                <span className="text-secondary extra-small">Remembered your password? </span>
                <Link to="/login" className="fw-bold text-purple text-decoration-none extra-small ms-1" style={{ color: '#7C3AED' }}>
                  Sign in here
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

export default ForgotPasswordPage;
