import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getOverviewStats,
  getTrafficSources,
  getGeographicData,
} from '../api/analyticsService';
import CardAnalyticsDrawer from '../components/analytics/CardAnalyticsDrawer';

const MOCK_TIME_SERIES = [
  { day: 'Mon', views: 45, scans: 28, clicks: 14 },
  { day: 'Tue', views: 72, scans: 45, clicks: 22 },
  { day: 'Wed', views: 98, scans: 60, clicks: 35 },
  { day: 'Thu', views: 110, scans: 78, clicks: 42 },
  { day: 'Fri', views: 145, scans: 95, clicks: 58 },
  { day: 'Sat', views: 88, scans: 52, clicks: 30 },
  { day: 'Sun', views: 124, scans: 82, clicks: 48 },
];

const MOCK_TOP_CARDS = [
  { id: 1, cardName: 'Executive Networking Card', views: 482, scans: 290, ctr: '68%' },
  { id: 2, cardName: 'Tech Conference Tag', views: 310, scans: 195, ctr: '63%' },
  { id: 3, cardName: 'Portfolio Showcase Card', views: 184, scans: 92, ctr: '50%' },
];

const AnalyticsDashboardPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  // Analytics Data
  const [stats, setStats] = useState({
    totalViews: 1286,
    viewsChange: '+18.4%',
    totalScans: 742,
    scansChange: '+24.1%',
    totalClicks: 449,
    clicksChange: '+12.5%',
    vcardsSaved: 280,
    vcardsChange: '+35.2%',
  });

  const [trafficSources, setTrafficSources] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [topCards, setTopCards] = useState(MOCK_TOP_CARDS);
  const [selectedCardForDrawer, setSelectedCardForDrawer] = useState(null);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, [user?.userId, timeRange]);

  const fetchDashboardAnalytics = async () => {
    try {
      setLoading(true);
      const userId = user?.userId || user?.id || 1;
      const [overviewRes, sourcesRes, geoRes] = await Promise.allSettled([
        getOverviewStats(userId),
        getTrafficSources(timeRange),
        getGeographicData(timeRange),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        const d = overviewRes.value;
        setStats((prev) => ({
          ...prev,
          totalViews: d.totalViews ?? d.totalEvents ?? prev.totalViews,
          totalScans: d.totalScans ?? prev.totalScans,
          totalClicks: d.totalTaps ?? prev.totalClicks,
          vcardsSaved: d.vcardsSaved ?? Math.round((d.totalViews || 0) * 0.4),
        }));
      }

      if (sourcesRes.status === 'fulfilled' && sourcesRes.value?.data) {
        setTrafficSources(sourcesRes.value.data);
      } else {
        setTrafficSources([
          { name: 'NFC Tap', value: 45, color: '#4f46e5' },
          { name: 'QR Code Scan', value: 30, color: '#06b6d4' },
          { name: 'Direct Link', value: 15, color: '#10b981' },
          { name: 'Social Referral', value: 10, color: '#f59e0b' },
        ]);
      }

      if (geoRes.status === 'fulfilled' && geoRes.value?.data) {
        setGeoData(geoRes.value.data);
      } else {
        setGeoData([
          { city: 'San Francisco', country: 'United States', views: 420, pct: '35%' },
          { city: 'London', country: 'United Kingdom', views: 285, pct: '24%' },
          { city: 'New York', country: 'United States', views: 210, pct: '17%' },
          { city: 'Berlin', country: 'Germany', views: 160, pct: '13%' },
          { city: 'Tokyo', country: 'Japan', views: 130, pct: '11%' },
        ]);
      }
    } catch (err) {
      console.warn('Analytics fetch using dev metrics:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 min-vh-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header & Time Filter */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-extrabold text-dark mb-0 fs-3" style={{ letterSpacing: '-0.02em' }}>Analytics Telemetry Studio</h2>
            <span className="badge bg-pastel-lavender text-purple rounded-pill fw-bold">Live Data</span>
          </div>
          <p className="text-secondary small mb-0">Real-time interaction telemetry, NFC tap metrics, and QR code scans.</p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white rounded-pill p-1.5 border border-slate-200 shadow-xs d-inline-flex gap-1">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: 'all', label: 'All Time' },
          ].map((r) => (
            <button
              key={r.id}
              className={`btn btn-sm px-3 py-1.5 fw-bold rounded-pill extra-small transition-all ${
                timeRange === r.id ? 'bg-dark text-white shadow-xs' : 'text-secondary bg-transparent border-0'
              }`}
              onClick={() => setTimeRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Top Metric Cards Grid */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-pastel-lavender rounded-4 p-4 text-dark border border-slate-100 shadow-sm h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-bold text-uppercase text-purple">Total Card Views</span>
              <div className="p-2.5 rounded-circle bg-white text-purple shadow-xs">
                <i className="bi bi-eye-fill fs-5"></i>
              </div>
            </div>
            <h2 className="fw-extrabold text-dark mb-2 display-6">{stats.totalViews.toLocaleString()}</h2>
            <div className="extra-small text-purple fw-bold d-flex align-items-center gap-1">
              <i className="bi bi-arrow-up-right"></i> {stats.viewsChange} <span className="text-muted fw-normal">vs previous period</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-pastel-cyan rounded-4 p-4 text-dark border border-slate-100 shadow-sm h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-bold text-uppercase text-info">QR Code Scans</span>
              <div className="p-2.5 rounded-circle bg-white text-info shadow-xs">
                <i className="bi bi-qr-code-scan fs-5"></i>
              </div>
            </div>
            <h2 className="fw-extrabold text-dark mb-2 display-6">{stats.totalScans.toLocaleString()}</h2>
            <div className="extra-small text-info fw-bold d-flex align-items-center gap-1">
              <i className="bi bi-arrow-up-right"></i> {stats.scansChange} <span className="text-muted fw-normal">vs previous period</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-pastel-mint rounded-4 p-4 text-dark border border-slate-100 shadow-sm h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-bold text-uppercase text-success">Link / Social Clicks</span>
              <div className="p-2.5 rounded-circle bg-white text-success shadow-xs">
                <i className="bi bi-cursor-fill fs-5"></i>
              </div>
            </div>
            <h2 className="fw-extrabold text-dark mb-2 display-6">{stats.totalClicks.toLocaleString()}</h2>
            <div className="extra-small text-success fw-bold d-flex align-items-center gap-1">
              <i className="bi bi-arrow-up-right"></i> {stats.clicksChange} <span className="text-muted fw-normal">vs previous period</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="bg-pastel-soft-yellow rounded-4 p-4 text-dark border border-slate-100 shadow-sm h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="extra-small fw-bold text-uppercase text-warning">vCard Downloads</span>
              <div className="p-2.5 rounded-circle bg-white text-warning shadow-xs">
                <i className="bi bi-person-check-fill fs-5"></i>
              </div>
            </div>
            <h2 className="fw-extrabold text-dark mb-2 display-6">{stats.vcardsSaved.toLocaleString()}</h2>
            <div className="extra-small text-warning fw-bold d-flex align-items-center gap-1">
              <i className="bi bi-arrow-up-right"></i> {stats.vcardsChange} <span className="text-muted fw-normal">vs previous period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Categories Section */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0">Recommended categories</h6>
          <button className="btn btn-sm text-secondary p-0 fw-bold extra-small">View all</button>
        </div>
        <div className="row g-3">
          {[
            { title: 'NFC Telemetry', icon: 'bi-nfc', color: 'bg-pastel-purple text-purple' },
            { title: 'QR Analytics', icon: 'bi-qr-code-scan', color: 'bg-pastel-cyan text-info' },
            { title: 'Traffic Sources', icon: 'bi-funnel', color: 'bg-pastel-mint text-success' },
            { title: 'Geo Tracking', icon: 'bi-geo-alt', color: 'bg-pastel-soft-yellow text-warning' },
            { title: 'vCard Downloads', icon: 'bi-person-check', color: 'bg-pastel-lavender text-purple' },
            { title: 'Link Click Rates', icon: 'bi-cursor', color: 'bg-pastel-mint text-success' },
            { title: 'Device Insights', icon: 'bi-laptop', color: 'bg-pastel-cyan text-info' },
            { title: 'Export Reports', icon: 'bi-download', color: 'bg-pastel-soft-yellow text-warning' },
          ].map((cat, idx) => (
            <div key={idx} className="col-6 col-sm-4 col-md-3 col-xl-1-5">
              <div className="category-quick-card bg-white p-3 rounded-4 border border-slate-200 shadow-xs h-100 d-flex align-items-center gap-3">
                <span className={`p-2.5 rounded-circle ${cat.color} d-inline-flex align-items-center justify-content-center`} style={{ width: '38px', height: '38px' }}>
                  <i className={`bi ${cat.icon} fs-5`}></i>
                </span>
                <span className="fw-bold text-dark extra-small lh-sm">{cat.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="row g-4 mb-4">
        {/* Left Column: Telemetry Performance Trend & Top Cards Board */}
        <div className="col-12 col-lg-8 col-xl-9">
          {/* Performance Trend Chart */}
          <div className="bg-white p-4 rounded-4 border border-slate-200 shadow-xs mb-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h6 className="fw-extrabold text-dark mb-0">Views & Scans Performance Trend</h6>
                <span className="extra-small text-muted">Daily breakdown of NFC taps and QR code scans</span>
              </div>
              <div className="d-flex align-items-center gap-3 extra-small fw-bold">
                <span className="d-flex align-items-center gap-1.5">
                  <span className="d-inline-block rounded-circle bg-purple" style={{ width: '10px', height: '10px', background: '#7C3AED' }}></span> Views
                </span>
                <span className="d-flex align-items-center gap-1.5">
                  <span className="d-inline-block rounded-circle bg-info" style={{ width: '10px', height: '10px' }}></span> Scans
                </span>
              </div>
            </div>

            <div className="py-2">
              <div className="d-flex align-items-end justify-content-between gap-2" style={{ height: '180px' }}>
                {MOCK_TIME_SERIES.map((item, idx) => {
                  const maxVal = 160;
                  const viewHeight = Math.round((item.views / maxVal) * 100);
                  const scanHeight = Math.round((item.scans / maxVal) * 100);
                  return (
                    <div key={idx} className="flex-grow-1 d-flex flex-column align-items-center h-100 justify-content-end">
                      <div className="w-100 d-flex justify-content-center align-items-end gap-1 mb-2 h-100">
                        <div
                          className="rounded-top-2 transition-all"
                          style={{ width: '14px', height: `${viewHeight}%`, background: '#7C3AED' }}
                          title={`Views: ${item.views}`}
                        ></div>
                        <div
                          className="bg-info rounded-top-2 transition-all"
                          style={{ width: '14px', height: `${scanHeight}%` }}
                          title={`Scans: ${item.scans}`}
                        ></div>
                      </div>
                      <span className="extra-small text-muted fw-bold">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Group: TOP PERFORMING CARDS BOARD */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2 px-1">
              <span className="fw-extrabold text-dark extra-small text-uppercase tracking-wider">Top Performing Digital Cards</span>
              <span className="badge bg-light text-dark rounded-pill border border-slate-200 extra-small">Live Sync</span>
            </div>

            <div className="d-grid gap-2">
              {topCards.map((card, index) => {
                const statusClass   = index === 0 ? 'in-progress' : index === 1 ? 'in-review' : 'drafts';
                const statusText    = index === 0 ? 'In Progress' : index === 1 ? 'In Review' : 'Drafts';
                const priorityClass = index === 0 ? 'high' : 'medium';
                const priorityText  = index === 0 ? 'High' : 'Medium';
                const progressPct   = card.pct;

                return (
                  <div key={card.id} className="bg-white p-3.5 rounded-4 border border-slate-200 shadow-xs hover-card transition-all">
                    <div className="row align-items-center g-3">
                      {/* Title & Info */}
                      <div className="col-12 col-md-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 p-2 text-white fw-bold d-inline-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)' }}
                          >
                            <i className="bi bi-bar-chart fs-5"></i>
                          </div>
                          <div className="overflow-hidden">
                            <h6 className="fw-bold text-dark mb-0 text-truncate">{card.name}</h6>
                            <div className="extra-small text-muted text-truncate">{card.views} Taps · {card.scans} Scans</div>
                          </div>
                        </div>
                      </div>

                      {/* Badges & Metrics */}
                      <div className="col-12 col-md-5">
                        <div className="d-flex align-items-center gap-2.5 flex-wrap">
                          <span className="extra-small text-muted d-inline-flex align-items-center gap-1">
                            <i className="bi bi-paperclip"></i> {12 + index * 4}
                          </span>
                          <span className="extra-small text-muted d-inline-flex align-items-center gap-1">
                            <i className="bi bi-chat"></i> {21 + index * 3}
                          </span>
                          <span className={`badge-status ${statusClass}`}>
                            {statusText}
                          </span>
                          <span className={`badge-priority ${priorityClass}`}>
                            {priorityText}
                          </span>
                        </div>
                      </div>

                      {/* Progress & Options */}
                      <div className="col-12 col-md-3">
                        <div className="d-flex align-items-center justify-content-end gap-3">
                          <div className="w-100" style={{ maxWidth: '90px' }}>
                            <div className="d-flex justify-content-between extra-small text-muted mb-1">
                              <span>Share</span>
                              <span className="fw-bold text-dark">{progressPct}%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '5px' }}>
                              <div
                                className="progress-bar rounded-pill"
                                role="progressbar"
                                style={{ width: `${progressPct}%`, background: '#7C3AED' }}
                              ></div>
                            </div>
                          </div>

                          <button
                            className="btn btn-sm btn-light rounded-circle p-0 d-inline-flex align-items-center justify-content-center text-secondary"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <i className="bi bi-three-dots"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Upgrade Promo Card & Traffic Breakdown */}
        <div className="col-12 col-lg-4 col-xl-3">
          {/* Upgrade Promo Card */}
          <div className="sidebar-upgrade-card mb-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="p-2 rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center shadow-xs" style={{ width: '32px', height: '32px' }}>
                <i className="bi bi-rocket-takeoff-fill fs-6"></i>
              </span>
              <h6 className="fw-extrabold text-white mb-0">Upgrade your plan</h6>
            </div>
            <p className="extra-small text-white-75 mb-3">
              Your free trial plan ends in 12 days. Upgrade to Pro for unlimited card creations, custom domains, and NFC telemetry.
            </p>

            <div className="mb-3">
              <div className="d-flex justify-content-between extra-small text-white-75 mb-1">
                <span>Trial Progress</span>
                <span className="fw-bold text-white">60%</span>
              </div>
              <div className="progress rounded-pill bg-white bg-opacity-20" style={{ height: '6px' }}>
                <div className="progress-bar bg-white rounded-pill" style={{ width: '60%' }}></div>
              </div>
            </div>

            <button className="btn btn-light text-purple fw-extrabold w-100 rounded-pill py-2.5 extra-small shadow-sm">
              See plans ↗
            </button>
          </div>

          {/* Traffic Sources Breakdown */}
          <div className="bg-white p-4 rounded-4 border border-slate-200 shadow-xs">
            <h6 className="fw-extrabold text-dark mb-1">Traffic Sources</h6>
            <p className="extra-small text-muted mb-3">Referral mechanism distribution</p>

            <div className="space-y-3">
              {trafficSources.map((source, idx) => (
                <div key={idx} className="mb-2">
                  <div className="d-flex align-items-center justify-content-between extra-small mb-1">
                    <span className="fw-bold text-dark d-flex align-items-center gap-1.5">
                      <span
                        className="rounded-circle d-inline-block"
                        style={{ width: '10px', height: '10px', backgroundColor: source.color || '#7C3AED' }}
                      ></span>
                      {source.name}
                    </span>
                    <span className="fw-bold text-dark">{source.value}%</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: '5px' }}>
                    <div
                      className="progress-bar rounded-pill"
                      role="progressbar"
                      style={{ width: `${source.value}%`, backgroundColor: source.color || '#7C3AED' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Performing Cards & Geographic Locations */}
      <div className="row g-4">
        {/* Top Cards Table */}
        <div className="col-12 col-lg-6">
          <div className="card-premium p-5 h-100 shadow-lg">
            <h5 className="fw-bold mb-4 text-dark fs-4 d-flex align-items-center gap-2">
              <span className="p-2 rounded-lg bg-warning bg-opacity-15 text-warning shadow-sm animate-floaty">
                <i className="bi bi-trophy fs-4"></i>
              </span>
              Top Performing Business Cards
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Card Name</th>
                    <th>Views</th>
                    <th>Scans</th>
                    <th>CTR</th>
                    <th>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TOP_CARDS.map((cardItem) => (
                    <tr key={cardItem.id}>
                      <td className="fw-bold text-dark">{cardItem.cardName}</td>
                      <td className="fs-6">{cardItem.views}</td>
                      <td className="fs-6">{cardItem.scans}</td>
                      <td>
                        <span className="badge-premium bg-teal-100 text-teal">
                          {cardItem.ctr}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedCardForDrawer(cardItem)}
                          className="btn btn-outline-primary btn-sm btn-pill px-3 py-2 shadow-sm"
                          title="Open Deep-dive Drawer"
                        >
                          <i className="bi bi-bar-chart me-1"></i> Analyze
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Geographic Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="card-premium p-5 h-100 shadow-lg">
            <h5 className="fw-bold mb-4 text-dark fs-4 d-flex align-items-center gap-2">
              <span className="p-2 rounded-lg bg-pink-100 text-pink shadow-sm animate-floaty">
                <i className="bi bi-geo-alt fs-4"></i>
              </span>
              Top Visitor Geographic Locations
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Location / City</th>
                    <th>Country</th>
                    <th>Total Views</th>
                    <th>Share %</th>
                  </tr>
                </thead>
                <tbody>
                  {geoData.map((loc, i) => (
                    <tr key={i}>
                      <td className="fw-bold text-dark">{loc.city}</td>
                      <td className="text-muted">{loc.country}</td>
                      <td className="fs-6 fw-semibold">{loc.views}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bold text-dark">{loc.pct || '20%'}</span>
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div
                              className="progress-bar rounded-pill"
                              style={{ width: loc.pct || '20%' }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-dive Card Analytics Drawer Modal */}
      {selectedCardForDrawer && (
        <CardAnalyticsDrawer
          card={selectedCardForDrawer}
          onClose={() => setSelectedCardForDrawer(null)}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
