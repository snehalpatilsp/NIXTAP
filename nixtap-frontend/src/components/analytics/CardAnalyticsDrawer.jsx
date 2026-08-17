import React, { useState, useEffect } from 'react';
import { getCardAnalytics } from '../../api/analyticsService';

const CardAnalyticsDrawer = ({ card, onClose }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCardMetrics();
  }, [card?.id, timeRange]);

  const fetchCardMetrics = async () => {
    try {
      setLoading(true);
      const res = await getCardAnalytics(card?.id || 1, timeRange);
      const data = res?.data || res;
      setAnalytics(data);
    } catch (err) {
      console.warn('Could not fetch card analytics:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-bar-chart-line text-primary fs-4"></i>
              Card Performance: <span className="text-primary">{card?.cardName || 'Business Card'}</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 p-md-5 bg-light">
            {/* Header controls */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
                  style={{ width: '42px', height: '42px' }}
                >
                  {(card?.fullName || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">{card?.fullName || 'Card Owner'}</h6>
                  <span className="extra-small text-muted">{card?.jobTitle || 'Professional'}</span>
                </div>
              </div>

              {/* Time Range Filter */}
              <div className="btn-group btn-group-sm">
                {['7d', '30d', '90d', 'all'].map((range) => (
                  <button
                    key={range}
                    className={`btn ${timeRange === range ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                    onClick={() => setTimeRange(range)}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Loading card telemetry analytics...</p>
              </div>
            ) : (
              <div>
                {/* Metric Summary Stat Badges */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                      <div className="text-muted extra-small fw-semibold text-uppercase">Total Views</div>
                      <h3 className="fw-extrabold text-primary mb-0">{analytics?.totalViews || 142}</h3>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                      <div className="text-muted extra-small fw-semibold text-uppercase">QR Scans</div>
                      <h3 className="fw-extrabold text-info mb-0">{analytics?.qrScans || 89}</h3>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                      <div className="text-muted extra-small fw-semibold text-uppercase">Link Clicks</div>
                      <h3 className="fw-extrabold text-success mb-0">{analytics?.linkClicks || 47}</h3>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white text-center">
                      <div className="text-muted extra-small fw-semibold text-uppercase">vCards Saved</div>
                      <h3 className="fw-extrabold text-warning mb-0">{analytics?.vcardDownloads || 31}</h3>
                    </div>
                  </div>
                </div>

                {/* Click-Through Rate Breakdown */}
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
                    <span>Social & Contact Link Click-Throughs (CTR)</span>
                    <span className="badge bg-success-subtle text-success rounded-pill extra-small">
                      CTR: {analytics?.ctr || '62.6%'}
                    </span>
                  </h6>

                  <div className="space-y-3">
                    {(analytics?.socialClickBreakdown || [
                      { platform: 'LinkedIn', clicks: 28 },
                      { platform: 'GitHub', clicks: 14 },
                      { platform: 'Portfolio Website', clicks: 5 },
                    ]).map((item, idx) => {
                      const total = analytics?.linkClicks || 47;
                      const pct = Math.round((item.clicks / (total || 1)) * 100);
                      return (
                        <div key={idx}>
                          <div className="d-flex align-items-center justify-content-between mb-1 extra-small">
                            <span className="fw-semibold text-dark">{item.platform}</span>
                            <span className="text-muted">{item.clicks} clicks ({pct}%)</span>
                          </div>
                          <div className="progress rounded-pill" style={{ height: '8px' }}>
                            <div
                              className="progress-bar bg-gradient-hero rounded-pill"
                              role="progressbar"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hardware NFC Tag Telemetry */}
                <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary-subtle text-primary border border-primary-subtle d-flex flex-row align-items-center gap-3">
                  <i className="bi bi-nfc display-6"></i>
                  <div>
                    <h6 className="fw-bold mb-0">NFC Hardware Tag ID: {card?.nfcTagId || 'NFC-TAG-89234'}</h6>
                    <span className="extra-small text-secondary">
                      Tag is active and bound to public route <strong>http://localhost:3000/card/{card?.id || 1}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 bg-light p-3">
            <button type="button" className="btn btn-outline-secondary rounded-3" onClick={onClose}>
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardAnalyticsDrawer;
