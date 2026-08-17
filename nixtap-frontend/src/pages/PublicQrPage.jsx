import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

const PublicQrPage = () => {
  const { username } = useParams();
  const rawUsername = username || 'kanhaiya';

  // Target URL embedded inside the QR Code
  const targetPageUrl = `${window.location.protocol}//${window.location.host}/${rawUsername}`;

  // Quick chart Google QR API or QR Server API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetPageUrl)}&color=7C3AED&bgcolor=FFFFFF`;

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetPageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-white text-dark" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Navbar */}
      <PublicNavbar />

      {/* Main QR Showcase Card */}
      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="border border-slate-200 rounded-5 shadow-xl p-4 p-sm-5 bg-white text-center position-relative">
              
              {/* Header Badge */}
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-pastel-lavender text-purple fw-bold extra-small mb-3" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                <i className="bi bi-qr-code-scan"></i>
                <span>Digital QR Code Studio</span>
              </div>

              <h2 className="fw-extrabold text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                @{rawUsername}'s QR Code
              </h2>
              <p className="text-secondary extra-small mb-4">
                Scan this QR code with any smartphone camera to visit the profile page instantly.
              </p>

              {/* QR Image Container */}
              <div className="p-4 rounded-4 bg-light border border-slate-200 d-inline-block shadow-sm mb-4">
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${rawUsername}`}
                  className="img-fluid rounded-3 shadow-xs"
                  style={{ width: '240px', height: '240px' }}
                />
              </div>

              {/* Encoded URL Box */}
              <div className="bg-light p-3 rounded-4 border border-slate-200 mb-4 text-start">
                <div className="extra-small text-muted mb-1 fw-semibold">Target Destination URL:</div>
                <div className="d-flex align-items-center justify-content-between gap-2 bg-white p-2.5 rounded-3 border border-slate-200">
                  <span className="extra-small text-dark fw-bold text-truncate" style={{ fontFamily: 'monospace' }}>
                    {targetPageUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-sm btn-light border border-slate-200 rounded-pill px-3 extra-small fw-bold flex-shrink-0"
                  >
                    <i className={`bi ${copied ? 'bi-check-lg text-success' : 'bi-clipboard'}`}></i>
                    <span className="ms-1">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2.5">
                <Link
                  to={`/${rawUsername}`}
                  className="btn text-white py-3 fw-bold rounded-pill shadow-sm border-0 d-flex align-items-center justify-content-center gap-2 transition-all"
                  style={{ background: '#7C3AED' }}
                >
                  <i className="bi bi-person-badge-fill fs-5"></i>
                  <span>Visit @{rawUsername}'s Page</span>
                </Link>

                <a
                  href={qrImageUrl}
                  download={`${rawUsername}-qr-code.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-dark py-2.5 fw-bold rounded-pill extra-small d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-download"></i>
                  <span>Download High-Res QR Image</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 bg-dark text-white mt-auto">
        <div className="container text-center">
          <p className="text-slate-400 extra-small mb-0">&copy; {new Date().getFullYear()} Nixtap Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicQrPage;
