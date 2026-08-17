import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── API Services ─────────────────────────────────────────────────────────────
import { getProfile }                                 from '../api/profileService';
import { getUserCards }                               from '../api/cardService';
import { getOverviewStats, getEventsByOwner }         from '../api/analyticsService';
import { getUserQrCodes }                             from '../api/mediaQrService';
import { getUserPortfolios }                          from '../api/portfolioService';
import { getMeetingsByOwner, getMeetingStats, acceptMeeting, rejectMeeting, deleteMeeting } from '../api/meetingService';
import { getFeedbackByOwner, approveFeedback, rejectFeedback }                              from '../api/feedbackService';
import { getNotificationLogs, getUnreadNotificationCount, markAllNotificationsRead, markNotificationRead } from '../api/notificationService';

// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',       icon: 'bi-grid-fill',             label: 'Overview'       },
  { key: 'cards',          icon: 'bi-credit-card-fill',      label: 'Cards'          },
  { key: 'meetings',       icon: 'bi-calendar-check-fill',   label: 'Meetings'       },
  { key: 'feedback',       icon: 'bi-star-fill',             label: 'Feedback'       },
  { key: 'notifications',  icon: 'bi-bell-fill',             label: 'Notifications'  },
  { key: 'portfolio',      icon: 'bi-journal-code',          label: 'Portfolio'      },
];

const statusBadge = (status) => {
  const map = {
    PENDING:   'bg-warning-subtle text-warning border border-warning-subtle',
    ACCEPTED:  'bg-success-subtle text-success border border-success-subtle',
    REJECTED:  'bg-danger-subtle text-danger border border-danger-subtle',
    CANCELLED: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
    ACTIVE:    'bg-success-subtle text-success border border-success-subtle',
    INACTIVE:  'bg-secondary-subtle text-secondary',
  };
  return `badge rounded-pill extra-small fw-bold px-2.5 py-1 ${map[status] || 'bg-secondary-subtle text-secondary'}`;
};

// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast]         = useState(null);

  const [profile,       setProfile]       = useState(null);
  const [cards,         setCards]         = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [qrCodes,       setQrCodes]       = useState([]);
  const [portfolios,    setPortfolios]    = useState([]);
  const [meetings,      setMeetings]      = useState([]);
  const [meetingStats,  setMeetingStats]  = useState(null);
  const [feedback,      setFeedback]      = useState([]);
  const [notifs,        setNotifs]        = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [svcStatus,     setSvcStatus]     = useState({});

  // ── Data Fetcher ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    const userId = user?.userId || user?.id;
    const status = {};

    const [
      profileRes, cardsRes, analyticsRes, qrRes,
      portfolioRes, meetingsRes, meetingStatsRes,
      feedbackRes, notifsRes, unreadRes,
    ] = await Promise.allSettled([
      getProfile(),
      getUserCards(),
      getOverviewStats(),
      getUserQrCodes(),
      getUserPortfolios(),
      userId ? getMeetingsByOwner(userId) : Promise.resolve({ data: [] }),
      userId ? getMeetingStats(userId)    : Promise.resolve({ data: null }),
      userId ? getFeedbackByOwner(userId) : Promise.resolve({ data: [] }),
      getNotificationLogs(0, 30),
      getUnreadNotificationCount(),
    ]);

    const safe = (res, fallback = null) => {
      if (res.status !== 'fulfilled') return fallback;
      const v = res.value;
      return v?.data ?? v ?? fallback;
    };

    const safeArray = (res) => {
      const v = safe(res, []);
      return Array.isArray(v) ? v : Array.isArray(v?.content) ? v.content : [];
    };

    setProfile(safe(profileRes));            status.profile      = profileRes.status === 'fulfilled';
    setAnalytics(safe(analyticsRes));        status.analytics    = analyticsRes.status === 'fulfilled';

    const cardList = safeArray(cardsRes);
    setCards(cardList);                      status.cards        = cardsRes.status === 'fulfilled';

    setQrCodes(safeArray(qrRes));            status.qr           = qrRes.status === 'fulfilled';
    setPortfolios(safeArray(portfolioRes));  status.portfolio    = portfolioRes.status === 'fulfilled';
    setMeetings(safeArray(meetingsRes));     status.meetings     = meetingsRes.status === 'fulfilled';
    setMeetingStats(safe(meetingStatsRes));  
    setFeedback(safeArray(feedbackRes));     status.feedback     = feedbackRes.status === 'fulfilled';

    const notifData = safe(notifsRes, { content: [] });
    setNotifs(Array.isArray(notifData) ? notifData : Array.isArray(notifData?.content) ? notifData.content : []);
    status.notifications = notifsRes.status === 'fulfilled';

    const unread = safe(unreadRes, 0);
    setUnreadCount(typeof unread === 'number' ? unread : 0);

    setSvcStatus(status);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Meeting Actions ───────────────────────────────────────────────────────
  const handleMeetingAction = async (id, action) => {
    try {
      if (action === 'accept')  await acceptMeeting(id);
      if (action === 'reject')  await rejectMeeting(id);
      if (action === 'delete')  await deleteMeeting(id);
      setMeetings(prev => action === 'delete'
        ? prev.filter(m => m.id !== id)
        : prev.map(m => m.id === id ? { ...m, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' } : m)
      );
      showToast(`Meeting ${action}ed successfully`);
    } catch { showToast(`Failed to ${action} meeting`, 'danger'); }
  };

  // ── Feedback Actions ─────────────────────────────────────────────────────
  const handleFeedbackAction = async (id, action) => {
    try {
      if (action === 'approve') await approveFeedback(id);
      if (action === 'reject')  await rejectFeedback(id);
      setFeedback(prev => prev.map(f => f.id === id
        ? { ...f, approved: action === 'approve', status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
        : f
      ));
      showToast(`Feedback ${action}d successfully`);
    } catch { showToast(`Failed to ${action} feedback`, 'danger'); }
  };

  // ── Notification Actions ──────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read');
    } catch { showToast('Could not mark all as read', 'danger'); }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const displayName   = profile?.fullName || user?.fullName || 'User';
  const displayEmail  = profile?.email    || user?.email    || '';
  const activeCards   = cards.filter(c => c.status === 'ACTIVE' || c.active === true);
  const pendingMeetings = meetings.filter(m => m.status === 'PENDING');
  const pendingFeedback = feedback.filter(f => !f.approved && f.status !== 'REJECTED');
  const totalViews    = analytics?.totalViews  ?? analytics?.totalScans ?? 0;
  const totalScans    = analytics?.totalScans  ?? analytics?.totalAnalyticsEvents ?? 0;

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ width: '2.5rem', height: '2.5rem', color: '#7C3AED' }}></div>
          <p className="text-muted fw-semibold small">Fetching your data from all microservices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 pb-5" style={{ background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="position-fixed top-0 end-0 m-4 z-3">
          <div className={`alert border-0 rounded-4 shadow-lg px-4 py-3 text-white d-flex align-items-center gap-2 mb-0`}
            style={{ background: toast.type === 'success' ? '#10B981' : '#EF4444', minWidth: '280px' }}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span className="fw-bold small">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
      <div className="py-4 border-bottom border-slate-200 bg-white position-relative">
        <div className="container-fluid px-lg-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold text-purple" style={{ background: '#EDE9FE' }}>
                  <i className="bi bi-circle-fill text-success me-1.5" style={{ fontSize: '7px' }}></i>
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                {pendingMeetings.length > 0 && (
                  <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold" style={{ background: '#FEF08A', color: '#854D0E' }}>
                    <i className="bi bi-calendar-check me-1"></i>{pendingMeetings.length} Pending Meeting{pendingMeetings.length > 1 ? 's' : ''}
                  </span>
                )}
                {unreadCount > 0 && (
                  <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold text-pink" style={{ background: '#FCE7F3', color: '#9D174D' }}>
                    <i className="bi bi-bell-fill me-1"></i>{unreadCount} Unread
                  </span>
                )}
              </div>
              <h1 className="fw-extrabold fs-3 text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.025em' }}>
                Welcome back, <span style={{ color: '#7C3AED' }}>{displayName}</span> 👋
              </h1>
              <p className="text-secondary small mb-0">{displayEmail}</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button onClick={fetchAll} disabled={refreshing}
                className="btn btn-outline-dark rounded-pill px-3.5 py-2 small fw-bold d-inline-flex align-items-center gap-2">
                <i className={`bi bi-arrow-clockwise ${refreshing ? 'spin-anim' : ''}`}></i>
                {refreshing ? 'Syncing...' : 'Refresh'}
              </button>
              <Link to="/cards"
                className="btn text-white fw-bold rounded-pill px-4 py-2 small shadow-sm d-inline-flex align-items-center gap-2 border-0"
                style={{ background: '#7C3AED' }}>
                <i className="bi bi-plus-lg"></i> New Card
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <div className="container-fluid px-lg-5 mt-4">
        <div className="row g-4">

          {/* ── MAIN COLUMN ─────────────────────────────────────────────── */}
          <div className="col-12 col-xl-8">

            {/* KPI Cards Row */}
            <div className="row g-3 mb-4">
              {[
                { label: 'Digital Cards',   value: cards.length,       sub: `${activeCards.length} active`,       icon: 'bi-credit-card-fill',    grad: '#7C3AED,#6366F1', tab: 'cards' },
                { label: 'Profile Views',   value: totalViews.toLocaleString(), sub: 'All time',             icon: 'bi-eye-fill',           grad: '#0EA5E9,#2563EB', tab: 'overview' },
                { label: 'QR / NFC Scans',  value: totalScans.toLocaleString(), sub: 'Analytics events',    icon: 'bi-qr-code-scan',       grad: '#10B981,#059669', tab: 'overview' },
                { label: 'Meetings',         value: meetings.length,    sub: `${pendingMeetings.length} pending`,  icon: 'bi-calendar-check-fill', grad: '#F59E0B,#D97706', tab: 'meetings' },
                { label: 'Reviews',          value: feedback.length,    sub: `${pendingFeedback.length} pending`,  icon: 'bi-star-fill',          grad: '#EC4899,#DB2777', tab: 'feedback' },
                { label: 'Portfolio Items',  value: portfolios.length,  sub: 'Projects',                    icon: 'bi-journal-code',       grad: '#6366F1,#4338CA', tab: 'portfolio' },
              ].map((k, i) => (
                <div key={i} className="col-6 col-md-4">
                  <div className="bg-white rounded-4 p-3 border border-slate-200 shadow-xs h-100 hover-elevate transition-all cursor-pointer"
                    onClick={() => setActiveTab(k.tab)}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="extra-small fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.05em' }}>{k.label}</span>
                      <div className="p-2 rounded-3 text-white" style={{ background: `linear-gradient(135deg, ${k.grad})` }}>
                        <i className={`bi ${k.icon}`}></i>
                      </div>
                    </div>
                    <h3 className="fw-extrabold text-dark mb-0">{k.value}</h3>
                    <span className="extra-small text-muted">{k.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab Toolbar */}
            <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-2.5 mb-4">
              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                {TABS.map(tab => {
                  const badge = tab.key === 'meetings' ? pendingMeetings.length
                              : tab.key === 'feedback' ? pendingFeedback.length
                              : tab.key === 'notifications' ? unreadCount : 0;
                  return (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold extra-small d-inline-flex align-items-center gap-1.5 position-relative transition-all ${
                        activeTab === tab.key ? 'bg-dark text-white shadow-xs' : 'btn-light text-secondary'
                      }`}>
                      <i className={`bi ${tab.icon}`}></i> {tab.label}
                      {badge > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px' }}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── TAB: OVERVIEW ──────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <>
                {/* Quick Actions */}
                <div className="mb-4">
                  <h6 className="fw-extrabold text-dark mb-3">Quick Actions</h6>
                  <div className="row g-2">
                    {[
                      { title: 'My Profile',      icon: 'bi-person-badge-fill',        bg: '#FEF3C7', color: '#D97706', path: '/profile' },
                      { title: 'Digital Cards',   icon: 'bi-credit-card-2-front-fill', bg: '#F3E8FF', color: '#7C3AED', path: '/cards' },
                      { title: 'QR / NFC Studio', icon: 'bi-qr-code-scan',             bg: '#CFFAFE', color: '#0284C7', path: '/cards' },
                      { title: 'Portfolio',       icon: 'bi-journal-code',              bg: '#E0E7FF', color: '#4338CA', path: '/portfolio' },
                      { title: 'Analytics',       icon: 'bi-graph-up-arrow',            bg: '#D1FAE5', color: '#059669', path: '/analytics' },
                      { title: 'Meetings',        icon: 'bi-calendar-check-fill',       bg: '#FEF3C7', color: '#B45309', action: () => setActiveTab('meetings') },
                    ].map((a, i) => (
                      <div key={i} className="col-6 col-md-4">
                        {a.path ? (
                          <Link to={a.path} className="text-decoration-none">
                            <div className="bg-white p-3 rounded-4 border border-slate-200 shadow-xs d-flex align-items-center gap-3 hover-elevate transition-all">
                              <div className="p-2.5 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                                style={{ background: a.bg, color: a.color, width: '42px', height: '42px' }}>
                                <i className={`bi ${a.icon} fs-5`}></i>
                              </div>
                              <span className="fw-bold text-dark extra-small">{a.title}</span>
                            </div>
                          </Link>
                        ) : (
                          <div className="bg-white p-3 rounded-4 border border-slate-200 shadow-xs d-flex align-items-center gap-3 hover-elevate transition-all cursor-pointer"
                            onClick={a.action}>
                            <div className="p-2.5 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                              style={{ background: a.bg, color: a.color, width: '42px', height: '42px' }}>
                              <i className={`bi ${a.icon} fs-5`}></i>
                            </div>
                            <span className="fw-bold text-dark extra-small">{a.title}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics Summary */}
                {analytics && (
                  <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-extrabold text-dark mb-0"><i className="bi bi-graph-up-arrow me-2" style={{ color: '#7C3AED' }}></i>Analytics Overview</h6>
                      <Link to="/analytics" className="btn btn-sm btn-light rounded-pill px-3 extra-small fw-bold">Full Report →</Link>
                    </div>
                    <div className="row g-3">
                      {[
                        { label: 'Profile Views',    value: (analytics.totalViews ?? 0).toLocaleString(),          icon: 'bi-eye', color: '#7C3AED' },
                        { label: 'QR Scans',         value: (analytics.totalScans ?? 0).toLocaleString(),          icon: 'bi-qr-code-scan', color: '#0EA5E9' },
                        { label: 'NFC Taps',         value: (analytics.nfcTaps ?? analytics.totalNfcTaps ?? 0).toLocaleString(), icon: 'bi-nfc', color: '#10B981' },
                        { label: 'vCards Exported',  value: (analytics.vcardsDownloaded ?? analytics.vcardDownloads ?? 0).toLocaleString(), icon: 'bi-person-vcard', color: '#F59E0B' },
                      ].map((s, i) => (
                        <div key={i} className="col-6 col-md-3">
                          <div className="text-center p-3 bg-light rounded-4">
                            <i className={`bi ${s.icon} fs-4 mb-1`} style={{ color: s.color }}></i>
                            <h5 className="fw-extrabold text-dark mb-0">{s.value}</h5>
                            <span className="extra-small text-muted">{s.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Cards */}
                {cards.length > 0 && (
                  <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-extrabold text-dark mb-0"><i className="bi bi-credit-card-fill me-2" style={{ color: '#7C3AED' }}></i>Recent Cards</h6>
                      <button onClick={() => setActiveTab('cards')} className="btn btn-sm btn-light rounded-pill px-3 extra-small fw-bold">View All ({cards.length}) →</button>
                    </div>
                    <div className="row g-3">
                      {cards.slice(0, 3).map((card, i) => (
                        <div key={card.id || i} className="col-12 col-md-4">
                          <div className="p-3 rounded-4 text-white h-100 shadow-xs"
                            style={{ background: card.primaryColor ? `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor || '#6366F1'})` : 'linear-gradient(135deg, #7C3AED, #6366F1)' }}>
                            <div className="fw-extrabold small mb-0.5 text-truncate">{card.cardName || card.name || 'Digital Card'}</div>
                            <div className="extra-small text-white text-opacity-75 text-truncate">{card.jobTitle || ''}</div>
                            <div className="extra-small text-white text-opacity-75 text-truncate">{card.company || ''}</div>
                            <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-white border-opacity-25">
                              <span className="extra-small text-white text-opacity-75">{card.status === 'ACTIVE' || card.active ? '● Active' : '○ Inactive'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── TAB: CARDS ──────────────────────────────────────────────── */}
            {activeTab === 'cards' && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-extrabold text-dark mb-0">Digital Cards ({cards.length})</h6>
                  <Link to="/cards" className="btn btn-dark rounded-pill px-3 py-2 extra-small fw-bold d-inline-flex align-items-center gap-1">
                    <i className="bi bi-plus-lg"></i> New Card
                  </Link>
                </div>

                {cards.length === 0 ? (
                  <div className="bg-white rounded-4 border border-slate-200 p-5 text-center shadow-xs">
                    <i className="bi bi-credit-card-2-front fs-1 text-muted d-block mb-2"></i>
                    <h6 className="fw-bold text-dark mb-1">No cards yet</h6>
                    <Link to="/cards" className="btn btn-dark rounded-pill px-4 small fw-bold mt-2">Create First Card</Link>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {cards.map((card, i) => {
                      const isActive = card.status === 'ACTIVE' || card.active;
                      return (
                        <div key={card.id || i} className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 hover-elevate transition-all">
                          <div className="row align-items-center g-3">
                            <div className="col-12 col-md-5 d-flex align-items-center gap-3">
                              <div className="rounded-4 p-3 text-white flex-shrink-0 d-flex align-items-center justify-content-center"
                                style={{ background: card.primaryColor ? `linear-gradient(135deg, ${card.primaryColor}, ${card.secondaryColor || '#6366F1'})` : 'linear-gradient(135deg, #7C3AED, #6366F1)', width: '48px', height: '48px' }}>
                                <i className="bi bi-credit-card-2-front-fill fs-5"></i>
                              </div>
                              <div className="overflow-hidden">
                                <h6 className="fw-bold text-dark mb-0 text-truncate">{card.cardName || card.name || 'Digital Card'}</h6>
                                <div className="extra-small text-muted text-truncate">{card.jobTitle || ''} {card.company ? `@ ${card.company}` : ''}</div>
                              </div>
                            </div>
                            <div className="col-12 col-md-4">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className={statusBadge(isActive ? 'ACTIVE' : 'INACTIVE')}>{isActive ? '● Active' : '○ Inactive'}</span>
                                {card.nfcEnabled && <span className="badge bg-pastel-cyan text-info rounded-pill extra-small fw-bold px-2"><i className="bi bi-nfc me-1"></i>NFC</span>}
                                {card.qrEnabled !== false && <span className="badge bg-pastel-lavender text-purple rounded-pill extra-small fw-bold px-2"><i className="bi bi-qr-code me-1"></i>QR</span>}
                                {card.slug && <span className="badge bg-light text-muted border rounded-pill extra-small">#{card.id}</span>}
                              </div>
                            </div>
                            <div className="col-12 col-md-3 text-md-end">
                              <Link to="/cards" className="btn btn-sm btn-light border rounded-pill px-3 extra-small fw-bold">Manage →</Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: MEETINGS ───────────────────────────────────────────── */}
            {activeTab === 'meetings' && (
              <div>
                {/* Meeting Stats */}
                {meetingStats && (
                  <div className="row g-3 mb-4">
                    {[
                      { label: 'Total',     value: meetingStats.total     ?? meetings.length, color: '#7C3AED' },
                      { label: 'Pending',   value: meetingStats.pending   ?? pendingMeetings.length, color: '#F59E0B' },
                      { label: 'Accepted',  value: meetingStats.accepted  ?? 0, color: '#10B981' },
                      { label: 'Rejected',  value: meetingStats.rejected  ?? 0, color: '#EF4444' },
                    ].map((s, i) => (
                      <div key={i} className="col-6 col-md-3">
                        <div className="bg-white rounded-4 p-3 border border-slate-200 shadow-xs text-center">
                          <h4 className="fw-extrabold mb-0" style={{ color: s.color }}>{s.value}</h4>
                          <span className="extra-small text-muted">{s.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-extrabold text-dark mb-0">Meeting Requests ({meetings.length})</h6>
                </div>

                {meetings.length === 0 ? (
                  <div className="bg-white rounded-4 border border-slate-200 p-5 text-center shadow-xs">
                    <i className="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
                    <h6 className="fw-bold text-dark mb-1">No meeting requests yet</h6>
                    <p className="text-muted small mb-0">Visitors can request meetings through your public card.</p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {meetings.map((m, i) => (
                      <div key={m.id || i} className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 hover-elevate transition-all">
                        <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h6 className="fw-bold text-dark mb-0">{m.requesterName || m.name || 'Requester'}</h6>
                              <span className={statusBadge(m.status)}>{m.status}</span>
                            </div>
                            <div className="extra-small text-muted d-flex align-items-center gap-3 flex-wrap">
                              {m.requesterEmail && <span><i className="bi bi-envelope me-1"></i>{m.requesterEmail}</span>}
                              {m.preferredDate && <span><i className="bi bi-calendar me-1"></i>{m.preferredDate}</span>}
                              {m.preferredTime && <span><i className="bi bi-clock me-1"></i>{m.preferredTime}</span>}
                            </div>
                            {m.message && <p className="text-muted extra-small mt-2 mb-0 fst-italic">"{m.message}"</p>}
                          </div>
                          {m.status === 'PENDING' && (
                            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                              <button onClick={() => handleMeetingAction(m.id, 'accept')}
                                className="btn btn-sm btn-outline-success rounded-pill px-3 extra-small fw-bold">
                                <i className="bi bi-check-lg me-1"></i>Accept
                              </button>
                              <button onClick={() => handleMeetingAction(m.id, 'reject')}
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 extra-small fw-bold">
                                <i className="bi bi-x-lg me-1"></i>Reject
                              </button>
                            </div>
                          )}
                          <button onClick={() => handleMeetingAction(m.id, 'delete')}
                            className="btn btn-sm btn-outline-secondary rounded-pill px-2 extra-small" title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: FEEDBACK ───────────────────────────────────────────── */}
            {activeTab === 'feedback' && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-extrabold text-dark mb-0">
                    Visitor Feedback ({feedback.length})
                    {pendingFeedback.length > 0 && <span className="badge bg-warning text-dark rounded-pill extra-small ms-2">{pendingFeedback.length} pending</span>}
                  </h6>
                </div>

                {feedback.length === 0 ? (
                  <div className="bg-white rounded-4 border border-slate-200 p-5 text-center shadow-xs">
                    <i className="bi bi-chat-square-heart fs-1 text-muted d-block mb-2"></i>
                    <h6 className="fw-bold text-dark mb-1">No feedback yet</h6>
                    <p className="text-muted small mb-0">Visitors can leave ratings and reviews on your public cards.</p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {feedback.map((f, i) => (
                      <div key={f.id || i} className={`bg-white rounded-4 border shadow-xs p-4 hover-elevate transition-all ${!f.approved && f.status !== 'REJECTED' ? 'border-warning' : 'border-slate-200'}`}>
                        <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span className="fw-bold text-dark small">{f.visitorName || f.name || 'Anonymous'}</span>
                              <div>
                                {Array.from({ length: 5 }, (_, k) => (
                                  <i key={k} className={`bi ${k < (f.rating ?? 0) ? 'bi-star-fill text-warning' : 'bi-star text-muted'} extra-small`}></i>
                                ))}
                              </div>
                              <span className={statusBadge(f.approved ? 'ACCEPTED' : f.status === 'REJECTED' ? 'REJECTED' : 'PENDING')}>
                                {f.approved ? 'Approved' : f.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                              </span>
                            </div>
                            {f.comment && <p className="text-muted small mb-0 fst-italic">"{f.comment}"</p>}
                            <span className="extra-small text-muted mt-1 d-block">{f.createdAt || f.submittedAt || ''}</span>
                          </div>
                          {!f.approved && f.status !== 'REJECTED' && (
                            <div className="d-flex align-items-center gap-2 flex-shrink-0">
                              <button onClick={() => handleFeedbackAction(f.id, 'approve')}
                                className="btn btn-sm btn-outline-success rounded-pill px-3 extra-small fw-bold">
                                <i className="bi bi-check-lg me-1"></i>Approve
                              </button>
                              <button onClick={() => handleFeedbackAction(f.id, 'reject')}
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 extra-small fw-bold">
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: NOTIFICATIONS ──────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-extrabold text-dark mb-0">
                    Notifications ({notifs.length})
                    {unreadCount > 0 && <span className="badge bg-danger rounded-pill extra-small ms-2">{unreadCount} new</span>}
                  </h6>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="btn btn-sm btn-light rounded-pill px-3 extra-small fw-bold">
                      <i className="bi bi-check-all me-1"></i>Mark All Read
                    </button>
                  )}
                </div>

                {notifs.length === 0 ? (
                  <div className="bg-white rounded-4 border border-slate-200 p-5 text-center shadow-xs">
                    <i className="bi bi-bell-slash fs-1 text-muted d-block mb-2"></i>
                    <h6 className="fw-bold text-dark mb-1">No notifications</h6>
                    <p className="text-muted small mb-0">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    {notifs.map((n, i) => {
                      const typeStyle = {
                        MEETING:  { icon: 'bi-calendar-check-fill', bg: '#D1FAE5', color: '#059669' },
                        FEEDBACK: { icon: 'bi-star-fill',            bg: '#FEF3C7', color: '#D97706' },
                        CARD_TAP: { icon: 'bi-nfc',                  bg: '#CFFAFE', color: '#0284C7' },
                        SYSTEM:   { icon: 'bi-bell-fill',            bg: '#F3E8FF', color: '#7C3AED' },
                      }[n.type] || { icon: 'bi-bell-fill', bg: '#F1F5F9', color: '#475569' };
                      return (
                        <div key={n.id || i}
                          className={`bg-white rounded-4 p-3 border shadow-xs transition-all cursor-pointer ${!n.read ? 'border-purple' : 'border-slate-200'}`}
                          style={{ borderLeft: !n.read ? '3px solid #7C3AED' : '1px solid #e2e8f0' }}
                          onClick={() => !n.read && handleMarkOneRead(n.id)}>
                          <div className="d-flex align-items-start gap-3">
                            <div className="p-2.5 rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                              style={{ background: typeStyle.bg, color: typeStyle.color, width: '40px', height: '40px' }}>
                              <i className={`bi ${typeStyle.icon}`}></i>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex align-items-center justify-content-between">
                                <h6 className="fw-bold text-dark mb-0 small text-truncate">{n.title || n.subject || n.type}</h6>
                                {!n.read && <span className="badge bg-danger rounded-circle flex-shrink-0" style={{ width: '8px', height: '8px', padding: 0 }}></span>}
                              </div>
                              <p className="text-muted extra-small mb-0 mt-0.5">{n.message || n.body}</p>
                              <span className="extra-small text-muted">{n.sentAt || n.createdAt || n.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: PORTFOLIO ──────────────────────────────────────────── */}
            {activeTab === 'portfolio' && (
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-extrabold text-dark mb-0">Portfolio Projects ({portfolios.length})</h6>
                  <Link to="/portfolio" className="btn btn-dark rounded-pill px-3 py-2 extra-small fw-bold d-inline-flex align-items-center gap-1">
                    <i className="bi bi-plus-lg"></i> Add Project
                  </Link>
                </div>

                {portfolios.length === 0 ? (
                  <div className="bg-white rounded-4 border border-slate-200 p-5 text-center shadow-xs">
                    <i className="bi bi-journal-code fs-1 text-muted d-block mb-2"></i>
                    <h6 className="fw-bold text-dark mb-1">No portfolio items yet</h6>
                    <Link to="/portfolio" className="btn btn-dark rounded-pill px-4 small fw-bold mt-2">Add First Project</Link>
                  </div>
                ) : (
                  <div className="row g-3">
                    {portfolios.map((p, i) => (
                      <div key={p.id || i} className="col-12 col-md-6">
                        <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 h-100 hover-elevate transition-all">
                          <div className="d-flex align-items-start justify-content-between mb-2">
                            <h6 className="fw-bold text-dark mb-0 text-truncate flex-grow-1 me-2">{p.title || p.projectName || 'Project'}</h6>
                            {p.featured && <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill extra-small flex-shrink-0"><i className="bi bi-star-fill me-1"></i>Featured</span>}
                          </div>
                          <p className="text-muted extra-small mb-2 line-clamp-2">{p.description || ''}</p>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            {p.category && <span className="badge bg-pastel-lavender text-purple rounded-pill extra-small">{p.category}</span>}
                            {(p.techStack || p.tags || []).slice(0, 3).map((tag, t) => (
                              <span key={t} className="badge bg-light text-muted border extra-small">{tag}</span>
                            ))}
                          </div>
                          {(p.projectUrl || p.liveUrl) && (
                            <a href={p.projectUrl || p.liveUrl} target="_blank" rel="noreferrer"
                              className="btn btn-sm btn-light rounded-pill px-3 extra-small fw-bold mt-2">
                              <i className="bi bi-box-arrow-up-right me-1"></i>Live
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ───────────────────────────────────────────── */}
          <div className="col-12 col-xl-4">

            {/* Profile Card */}
            <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 mb-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle text-white fw-extrabold d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs fs-5"
                  style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #7C3AED, #6366F1)' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h6 className="fw-extrabold text-dark mb-0 text-truncate">{displayName}</h6>
                  <div className="extra-small text-muted text-truncate">{displayEmail}</div>
                  <span className="badge bg-pastel-lavender text-purple rounded-pill extra-small fw-bold mt-1">
                    {user?.role?.replace('ROLE_', '') || 'USER'}
                  </span>
                </div>
              </div>
              {profile && (
                <div className="border-top pt-3 d-grid gap-1.5">
                  {profile.jobTitle && (
                    <div className="d-flex align-items-center gap-2 extra-small text-muted">
                      <i className="bi bi-briefcase-fill" style={{ color: '#7C3AED' }}></i>
                      <span className="text-truncate">{profile.jobTitle}</span>
                    </div>
                  )}
                  {profile.company && (
                    <div className="d-flex align-items-center gap-2 extra-small text-muted">
                      <i className="bi bi-building text-info"></i>
                      <span className="text-truncate">{profile.company}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="d-flex align-items-center gap-2 extra-small text-muted">
                      <i className="bi bi-telephone-fill text-success"></i>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="d-flex align-items-center gap-2 extra-small text-muted">
                      <i className="bi bi-geo-alt-fill text-danger"></i>
                      <span className="text-truncate">{profile.location}</span>
                    </div>
                  )}
                </div>
              )}
              <Link to="/profile" className="btn btn-sm w-100 mt-3 rounded-pill fw-bold extra-small"
                style={{ background: '#F3E8FF', color: '#7C3AED' }}>
                <i className="bi bi-pencil-fill me-1"></i>Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
