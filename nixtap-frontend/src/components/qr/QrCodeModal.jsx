import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const QrCodeModal = ({ card, onClose }) => {
  const [fgColor, setFgColor] = useState('#4f46e5');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const targetUrl = `${window.location.origin}/card/${card?.slug || card?.id || 'demo'}`;

  useEffect(() => {
    generateRealQr();
  }, [card, fgColor, bgColor, targetUrl]);

  const generateRealQr = async () => {
    try {
      const opts = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        width: 300,
      };
      const url = await QRCode.toDataURL(targetUrl, opts);
      setQrDataUrl(url);
    } catch (err) {
      console.error('Error generating QR Code:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (format = 'png') => {
    try {
      setDownloading(true);
      if (format === 'svg') {
        const svgString = await QRCode.toString(targetUrl, {
          type: 'svg',
          color: { dark: fgColor, light: bgColor },
          margin: 1,
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qrcode_${card?.slug || card?.id || 'card'}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `qrcode_${card?.slug || card?.id || 'card'}.png`;
        a.click();
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
            <h5 className="modal-title fw-extrabold d-flex align-items-center gap-2">
              <i className="bi bi-qr-code-scan text-purple" style={{ color: '#A78BFA' }}></i> QR Code Studio
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* Live Rendered Real QR Code */}
            <div className="text-center mb-4">
              <div className="d-inline-block p-3 bg-white rounded-4 shadow-sm border mb-3">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Live QR Code" width="220" height="220" className="img-fluid rounded-3" />
                ) : (
                  <div className="d-flex align-items-center justify-content-center" style={{ width: '220px', height: '220px' }}>
                    <div className="spinner-border text-purple" role="status"></div>
                  </div>
                )}
              </div>
              <h6 className="fw-bold text-dark mb-0">{card?.cardTitle || card?.cardName || 'Digital Business Card'}</h6>
              <span className="extra-small text-muted font-monospace">{targetUrl}</span>
            </div>

            {/* Controls */}
            <div className="card bg-light border-0 rounded-4 p-3 mb-4">
              <h6 className="fw-bold text-dark mb-3 extra-small text-uppercase tracking-wider">
                <i className="bi bi-palette-fill me-1.5 text-purple" style={{ color: '#7C3AED' }}></i> Customize QR Styling
              </h6>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label extra-small fw-bold text-secondary mb-1">Foreground Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color border-0 p-0 rounded-circle cursor-pointer"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                    />
                    <span className="font-monospace extra-small fw-bold">{fgColor}</span>
                  </div>
                </div>

                <div className="col-6">
                  <label className="form-label extra-small fw-bold text-secondary mb-1">Background Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color border-0 p-0 rounded-circle cursor-pointer"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                    <span className="font-monospace extra-small fw-bold">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-grid gap-2">
              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-dark fw-bold w-100 py-2.5 rounded-pill extra-small d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={() => handleDownload('png')}
                    disabled={downloading}
                  >
                    <i className="bi bi-download"></i> Download PNG
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-dark fw-bold w-100 py-2.5 rounded-pill extra-small d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleDownload('svg')}
                    disabled={downloading}
                  >
                    <i className="bi bi-filetype-svg"></i> Download SVG
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`btn ${copied ? 'btn-success text-white' : 'btn-light border'} fw-bold py-2.5 rounded-pill extra-small d-flex align-items-center justify-content-center gap-2 transition-all`}
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <i className="bi bi-check2-circle fs-6"></i> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <i className="bi bi-link-45deg fs-6"></i> Copy Public URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
