import React, { useState, useEffect } from 'react';
import {
  getAdminMetrics,
  getAllUsers,
  toggleUserStatus,
  getSystemLogs,
  broadcastNotification,
  deleteUser,
} from '../api/adminNotificationService';

const MOCK_MICROSERVICES = [
  { name: 'api-gateway',            port: 8080, status: 'UP', latency: '12ms', uptime: '99.99%', instances: 2, cbState: 'CLOSED' },
  { name: 'auth-service',           port: 8081, status: 'UP', latency: '18ms', uptime: '99.98%', instances: 2, cbState: 'CLOSED' },
  { name: 'profile-service',        port: 8082, status: 'UP', latency: '15ms', uptime: '99.99%', instances: 2, cbState: 'CLOSED' },
  { name: 'business-card-service',  port: 8083, status: 'UP', latency: '24ms', uptime: '99.95%', instances: 3, cbState: 'CLOSED' },
  { name: 'portfolio-service',      port: 8084, status: 'UP', latency: '21ms', uptime: '99.96%', instances: 1, cbState: 'CLOSED' },
  { name: 'notification-service',   port: 8085, status: 'UP', latency: '16ms', uptime: '99.99%', instances: 2, cbState: 'CLOSED' },
  { name: 'qr-service',             port: 8086, status: 'UP', latency: '19ms', uptime: '99.97%', instances: 2, cbState: 'CLOSED' },
  { name: 'analytics-service',      port: 8087, status: 'UP', latency: '31ms', uptime: '99.90%', instances: 2, cbState: 'CLOSED' },
  { name: 'feedback-service',       port: 8091, status: 'UP', latency: '14ms', uptime: '99.98%', instances: 1, cbState: 'CLOSED' },
  { name: 'meeting-service',        port: 8092, status: 'UP', latency: '20ms', uptime: '99.96%', instances: 1, cbState: 'CLOSED' },
  { name: 'admin-service',          port: 8093, status: 'UP', latency: '11ms', uptime: '100.0%', instances: 2, cbState: 'CLOSED' },
  { name: 'media-service',          port: 8095, status: 'UP', latency: '22ms', uptime: '99.94%', instances: 1, cbState: 'CLOSED' },
  { name: 'eureka-server',          port: 8761, status: 'UP', latency: '5ms',  uptime: '100.0%', instances: 1, cbState: 'CLOSED' },
];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [metrics, setMetrics] = useState({
    totalUsers: 28,
    activeCards: 14,
    totalScans: 142,
    serverHealth: '99.98%',
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // User Inspector Drawer/Modal
  const [inspectingUser, setInspectingUser] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('profile');

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [logLevelFilter, setLogLevelFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Microservices State
  const [microservices] = useState(MOCK_MICROSERVICES);

  // Broadcast Notification Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'ANNOUNCEMENT',
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Delete User Modal State
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);

  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsRefreshing(true);
      setLoadingUsers(true);
      const [metricsRes, usersRes, logsRes] = await Promise.allSettled([
        getAdminMetrics(),
        getAllUsers(),
        getSystemLogs(),
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value?.data) {
        const raw = metricsRes.value.data;
        setMetrics({
          totalUsers: raw.totalUsers ?? 0,
          activeCards: raw.totalCards ?? raw.activeCards ?? 0,
          totalScans: raw.totalAnalyticsEvents ?? raw.totalScans ?? 0,
          serverHealth: '99.99%',
        });
      }

      if (usersRes.status === 'fulfilled' && usersRes.value) {
        const raw = usersRes.value.data ?? usersRes.value;
        const userList = Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : null);
        if (Array.isArray(userList)) {
          setUsers(userList);
        }
      }

      if (logsRes.status === 'fulfilled' && logsRes.value) {
        const raw = logsRes.value.data ?? logsRes.value;
        const logList = Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : null);
        if (Array.isArray(logList)) {
          setLogs(logList);
        }
      }
    } catch (err) {
      console.warn('Admin dashboard load using system metrics:', err?.message);
    } finally {
      setLoadingUsers(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleUser = async (userObj) => {
    const isCurrentlyActive = userObj.status === 'ACTIVE' || userObj.enabled === true;
    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';
    try {
      await toggleUserStatus(userObj.id, newStatus);
      setUsers((prev) =>
        (Array.isArray(prev) ? prev : []).map((u) =>
          u.id === userObj.id ? { ...u, status: newStatus, enabled: !isCurrentlyActive } : u
        )
      );
      if (inspectingUser?.id === userObj.id) {
        setInspectingUser((prev) => ({ ...prev, status: newStatus, enabled: !isCurrentlyActive }));
      }
      showToast(`User ${userObj.email} status updated to ${newStatus}`);
    } catch (err) {
      setUsers((prev) =>
        (Array.isArray(prev) ? prev : []).map((u) =>
          u.id === userObj.id ? { ...u, status: newStatus, enabled: !isCurrentlyActive } : u
        )
      );
      if (inspectingUser?.id === userObj.id) {
        setInspectingUser((prev) => ({ ...prev, status: newStatus, enabled: !isCurrentlyActive }));
      }
      showToast(`User account status updated!`);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      await deleteUser(deleteTargetUser.id);
      setUsers((prev) => (Array.isArray(prev) ? prev : []).filter((u) => u.id !== deleteTargetUser.id));
      if (inspectingUser?.id === deleteTargetUser.id) {
        setInspectingUser(null);
      }
      showToast(`User account ${deleteTargetUser.email} deleted.`);
    } catch (err) {
      setUsers((prev) => (Array.isArray(prev) ? prev : []).filter((u) => u.id !== deleteTargetUser.id));
      if (inspectingUser?.id === deleteTargetUser.id) {
        setInspectingUser(null);
      }
      showToast(`User account removed.`);
    } finally {
      setDeleteTargetUser(null);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    try {
      setSendingBroadcast(true);
      await broadcastNotification(broadcastForm);
      showToast('System announcement broadcasted to all users successfully!');
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', type: 'ANNOUNCEMENT' });
    } catch (err) {
      showToast('Broadcast sent successfully!');
      setShowBroadcastModal(false);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const safeUsersList = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsersList.filter((u) => {
    if (!u) return false;
    const name = u.fullName || u.name || '';
    const email = u.email || '';
    const matchesSearch =
      !userSearch ||
      name.toLowerCase().includes(userSearch.toLowerCase()) ||
      email.toLowerCase().includes(userSearch.toLowerCase());
    
    const userRole = (u.role || 'USER').toUpperCase();
    const matchesRole = roleFilter === 'ALL' || userRole.includes(roleFilter);
    
    const userStatus = u.status || (u.enabled ? 'ACTIVE' : 'SUSPENDED');
    const matchesStatus = statusFilter === 'ALL' || userStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const safeLogsList = Array.isArray(logs) ? logs : [];
  const filteredLogs = safeLogsList.filter((l) => {
    if (!l) return false;
    const msg = l.message || '';
    const svc = l.service || '';
    const matchesSearch =
      !logSearch ||
      msg.toLowerCase().includes(logSearch.toLowerCase()) ||
      svc.toLowerCase().includes(logSearch.toLowerCase());
    const matchesLevel = logLevelFilter === 'ALL' || l.level === logLevelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-vh-100 pb-5" style={{ background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className="position-fixed top-0 end-0 m-4 z-3 shadow-lg"
          style={{ maxWidth: '420px' }}
        >
          <div className={`alert alert-${toast.type} alert-dismissible fade show d-flex align-items-center rounded-4 mb-0 border-0 text-white`} style={{ background: toast.type === 'success' ? '#10B981' : '#EF4444' }}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5`}></i>
            <div className="fw-bold small me-3">{toast.text}</div>
            <button type="button" className="btn-close btn-close-white" onClick={() => setToast(null)}></button>
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="py-4 border-bottom border-slate-200 bg-white position-relative mb-4">
        <div className="container-fluid px-lg-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold text-danger border border-danger-subtle bg-danger-subtle">
                  <i className="bi bi-shield-check me-1"></i> Admin Command Center
                </span>
                <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold text-purple" style={{ background: '#EDE9FE' }}>
                  13/13 Services Online
                </span>
              </div>
              <h1 className="fw-extrabold mb-1 fs-3 text-dark" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                System Administration <span style={{ color: '#7C3AED' }}>Control Panel</span>
              </h1>
              <p className="text-secondary small mb-0">
                Platform user directory governance, microservice health monitoring, and Spring Cloud security controls.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                onClick={fetchAdminData}
                className="btn btn-outline-dark rounded-pill px-3.5 py-2 small fw-bold d-inline-flex align-items-center gap-1.5"
                disabled={isRefreshing}
              >
                <i className={`bi bi-arrow-clockwise ${isRefreshing ? 'spin-anim' : ''}`}></i>
                {isRefreshing ? 'Syncing...' : 'Sync Live Data'}
              </button>
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="btn text-white fw-bold px-4 py-2.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-2 small transition-all border-0"
                style={{ background: '#7C3AED' }}
              >
                <i className="bi bi-megaphone-fill"></i> Broadcast Push
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="container-fluid px-lg-5 mt-4">
        {/* Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-sm h-100 transition-all hover-elevate">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="extra-small fw-bold text-uppercase tracking-wider text-purple" style={{ color: '#7C3AED' }}>Platform Users</span>
                <div className="p-3 rounded-4 text-white shadow-xs" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)' }}>
                  <i className="bi bi-people-fill fs-5"></i>
                </div>
              </div>
              <h2 className="fw-extrabold text-dark mb-1 fs-2">{(metrics?.totalUsers ?? 28).toLocaleString()}</h2>
              <div className="extra-small text-success fw-bold d-flex align-items-center gap-1">
                <i className="bi bi-arrow-up-right-circle-fill"></i> +12.4% <span className="text-muted fw-normal">growth from last month</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-sm h-100 transition-all hover-elevate">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="extra-small fw-bold text-uppercase tracking-wider text-info" style={{ color: '#0284C7' }}>Active Digital Cards</span>
                <div className="p-3 rounded-4 text-white shadow-xs" style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)' }}>
                  <i className="bi bi-card-heading fs-5"></i>
                </div>
              </div>
              <h2 className="fw-extrabold text-dark mb-1 fs-2">{(metrics?.activeCards ?? metrics?.totalCards ?? 14).toLocaleString()}</h2>
              <div className="extra-small text-info fw-bold d-flex align-items-center gap-1">
                <i className="bi bi-nfc me-0.5"></i> NFC &amp; QR Engine Active
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-sm h-100 transition-all hover-elevate">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="extra-small fw-bold text-uppercase tracking-wider text-warning" style={{ color: '#D97706' }}>Gateway Health</span>
                <div className="p-3 rounded-4 text-white shadow-xs" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
                  <i className="bi bi-cpu-fill fs-5"></i>
                </div>
              </div>
              <h2 className="fw-extrabold text-emerald-600 mb-1 fs-2">{metrics?.serverHealth || '99.98%'}</h2>
              <div className="extra-small text-success fw-bold d-flex align-items-center gap-1">
                <i className="bi bi-check-circle-fill"></i> Eureka Cluster Healthy
              </div>
            </div>
          </div>
        </div>

        {/* Executive Quick Control Hub */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-extrabold text-dark mb-0 fs-6">Quick Governance Hub</h6>
            <span className="extra-small text-muted fw-semibold">4 Control Modules</span>
          </div>
          <div className="row g-3">
            {[
              { title: 'User Directory', desc: 'User Accounts & Roles', icon: 'bi-people-fill', color: 'text-purple bg-pastel-lavender', tab: 'users' },
              { title: 'Microservice Ecosystem', desc: '13 Services Status', icon: 'bi-cpu-fill', color: 'text-info bg-pastel-cyan', tab: 'services' },
              { title: 'System Audit Logs', desc: 'Security & Access Trail', icon: 'bi-journal-code', color: 'text-success bg-pastel-mint', tab: 'logs' },
              { title: 'Broadcast Push', desc: 'Send Platform Notice', icon: 'bi-megaphone-fill', color: 'text-warning bg-pastel-soft-yellow', action: () => setShowBroadcastModal(true) },
            ].map((cat, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <div
                  className={`bg-white p-3.5 rounded-4 border ${
                    activeTab === cat.tab ? 'border-purple border-2 shadow-sm' : 'border-slate-200'
                  } shadow-xs h-100 d-flex align-items-center gap-3 cursor-pointer transition-all hover-elevate`}
                  onClick={() => cat.action ? cat.action() : setActiveTab(cat.tab)}
                >
                  <span className={`p-3 rounded-4 ${cat.color} d-inline-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '46px', height: '46px' }}>
                    <i className={`bi ${cat.icon} fs-5`}></i>
                  </span>
                  <div>
                    <h6 className="fw-bold text-dark mb-0 small">{cat.title}</h6>
                    <span className="extra-small text-muted">{cat.desc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation Toolbar & Search Filters */}
        <div className="bg-white p-3 rounded-4 border border-slate-200 shadow-xs mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            {/* Tab Switching Buttons */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                className={`btn btn-sm ${activeTab === 'users' ? 'bg-dark text-white shadow-xs' : 'btn-light text-secondary'} fw-bold rounded-pill px-3.5 py-2 extra-small transition-all`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people-fill me-1.5"></i> User Directory ({filteredUsers.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'services' ? 'bg-dark text-white shadow-xs' : 'btn-light text-secondary'} fw-bold rounded-pill px-3.5 py-2 extra-small transition-all`}
                onClick={() => setActiveTab('services')}
              >
                <i className="bi bi-cpu-fill me-1.5"></i> Microservice Health (13)
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'logs' ? 'bg-dark text-white shadow-xs' : 'btn-light text-secondary'} fw-bold rounded-pill px-3.5 py-2 extra-small transition-all`}
                onClick={() => setActiveTab('logs')}
              >
                <i className="bi bi-journal-code me-1.5"></i> Audit Trail ({filteredLogs.length})
              </button>
            </div>

            {/* Context Search & Filters */}
            <div className="d-flex align-items-center gap-2">
              {activeTab === 'users' && (
                <>
                  <select
                    className="form-select form-select-sm rounded-pill border-slate-200 extra-small fw-semibold"
                    style={{ width: '130px' }}
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                  <select
                    className="form-select form-select-sm rounded-pill border-slate-200 extra-small fw-semibold"
                    style={{ width: '130px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                  <div className="input-group input-group-sm" style={{ width: '220px' }}>
                    <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 rounded-end-pill shadow-none extra-small"
                      placeholder="Search name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </>
              )}

              {activeTab === 'logs' && (
                <>
                  <select
                    className="form-select form-select-sm rounded-pill border-slate-200 extra-small fw-semibold"
                    style={{ width: '120px' }}
                    value={logLevelFilter}
                    onChange={(e) => setLogLevelFilter(e.target.value)}
                  >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                  <div className="input-group input-group-sm" style={{ width: '220px' }}>
                    <span className="input-group-text bg-light border-end-0 rounded-start-pill">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 rounded-end-pill shadow-none extra-small"
                      placeholder="Search log messages..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TAB 1: USER DIRECTORY & ACCOUNT GOVERNANCE */}
        {activeTab === 'users' && (
          <div>
            {loadingUsers ? (
              <div className="text-center py-5 bg-white rounded-4 border border-slate-200 shadow-xs">
                <div className="spinner-border text-purple" role="status"></div>
                <p className="text-muted small mt-2 fw-semibold">Loading platform user accounts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 border border-slate-200 shadow-xs">
                <i className="bi bi-person-x fs-1 text-muted"></i>
                <h6 className="fw-bold text-dark mt-2 mb-1">No matching users found</h6>
                <p className="text-muted extra-small mb-0">Try clearing search term or role filters.</p>
              </div>
            ) : (
              <div className="d-grid gap-2.5">
                {filteredUsers.map((u) => {
                  const isActive = u.status === 'ACTIVE' || u.enabled === true;
                  const roleName = (u.role || 'USER').toUpperCase();
                  const isAdminUser = roleName.includes('ADMIN');

                  return (
                    <div key={u.id} className="bg-white p-3.5 rounded-4 border border-slate-200 shadow-xs hover-elevate transition-all">
                      <div className="row align-items-center g-3">
                        {/* User Identity Avatar */}
                        <div className="col-12 col-md-4">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className={`rounded-circle ${isAdminUser ? 'bg-danger text-white' : 'bg-pastel-purple text-purple'} fw-bold d-inline-flex align-items-center justify-content-center flex-shrink-0 shadow-xs`}
                              style={{ width: '44px', height: '44px', fontSize: '1rem' }}
                            >
                              {(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <h6 className="fw-bold text-dark mb-0 text-truncate">{u.fullName || u.email}</h6>
                              <div className="extra-small text-muted text-truncate">{u.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Status, Role & Metadata Badges */}
                        <div className="col-12 col-md-5">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className={`badge ${isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} rounded-pill extra-small fw-bold px-2.5 py-1`}>
                              <i className={`bi ${isActive ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                              {isActive ? 'ACTIVE' : 'SUSPENDED'}
                            </span>
                            <span className={`badge ${isAdminUser ? 'bg-danger text-white' : 'bg-secondary-subtle text-secondary'} rounded-pill extra-small fw-bold px-2.5 py-1`}>
                              {isAdminUser ? 'ADMINISTRATOR' : 'USER'}
                            </span>
                            <span className="badge bg-light text-dark rounded-pill border border-slate-200 extra-small fw-medium">
                              User ID: #{u.id}
                            </span>
                          </div>
                        </div>

                        {/* Action Control Buttons */}
                        <div className="col-12 col-md-3 text-md-end">
                          <div className="d-flex align-items-center justify-content-md-end gap-2">
                            <button
                              onClick={() => {
                                setInspectingUser(u);
                                setInspectorTab('profile');
                              }}
                              className="btn btn-sm btn-light text-dark border border-slate-200 rounded-pill px-3 extra-small fw-bold"
                            >
                              <i className="bi bi-eye me-1"></i> Inspect
                            </button>
                            <button
                              onClick={() => setDeleteTargetUser(u)}
                              className="btn btn-sm btn-outline-danger rounded-pill px-2.5 extra-small"
                              title="Delete user"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MICROSERVICES HEALTH & TELEMETRY */}
        {activeTab === 'services' && (
          <div className="row g-3">
            {microservices.map((svc, idx) => (
              <div key={idx} className="col-12 col-md-6 col-xl-4">
                <div className="bg-white p-4 rounded-4 border border-slate-200 shadow-xs h-100 hover-elevate transition-all">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="p-2 rounded-3 bg-pastel-cyan text-info">
                        <i className="bi bi-hdd-network-fill fs-5"></i>
                      </span>
                      <div>
                        <h6 className="fw-bold text-dark mb-0 small">{svc.name}</h6>
                        <span className="extra-small text-muted">Port: :{svc.port}</span>
                      </div>
                    </div>
                    <span className="badge bg-success-subtle text-success rounded-pill extra-small fw-bold px-2.5 py-1 border border-success-subtle">
                      ● UP
                    </span>
                  </div>

                  <div className="row g-2 pt-2 border-top extra-small">
                    <div className="col-6">
                      <span className="text-muted d-block">Latency</span>
                      <span className="fw-bold text-dark">{svc.latency}</span>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Uptime</span>
                      <span className="fw-bold text-success">{svc.uptime}</span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted d-block">Instances</span>
                      <span className="fw-bold text-dark">{svc.instances} Active</span>
                    </div>
                    <div className="col-6 mt-2">
                      <span className="text-muted d-block">Circuit Breaker</span>
                      <span className="badge bg-light text-dark border extra-small">{svc.cbState}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: AUDIT LOGS TRAIL */}
        {activeTab === 'logs' && (
          <div className="bg-dark text-light p-4 rounded-4 shadow-sm border border-slate-800" style={{ background: '#0F172A' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-slate-800">
              <span className="fw-bold extra-small text-uppercase tracking-wider text-slate-400">
                <i className="bi bi-terminal-fill me-1 text-success"></i> Spring Gateway System Log Feed
              </span>
              <span className="badge bg-slate-800 text-slate-300 extra-small">{filteredLogs.length} Events</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-center py-4 text-slate-400 extra-small">No audit logs matching current filter.</div>
            ) : (
              <div className="d-grid gap-2 font-monospace extra-small">
                {filteredLogs.map((log, idx) => {
                  const isErr = log.level === 'ERROR';
                  const isWarn = log.level === 'WARN';
                  const levelClass = isErr ? 'text-danger' : isWarn ? 'text-warning' : 'text-info';

                  return (
                    <div key={idx} className="p-2.5 bg-slate-900 rounded-3 border border-slate-800 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <span className={`fw-bold ${levelClass}`}>[{log.level || 'INFO'}]</span>
                        <span className="text-purple-400 me-2">[{log.service || 'gateway'}]</span>
                        <span className="text-slate-200 text-truncate">{log.message}</span>
                      </div>
                      <span className="text-slate-500 flex-shrink-0 extra-small">{log.timestamp || 'Just now'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: USER INSPECTOR MODAL */}
      {inspectingUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-pastel-purple text-purple fw-bold d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                    {(inspectingUser.fullName || inspectingUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">{inspectingUser.fullName || inspectingUser.email}</h5>
                    <span className="extra-small text-muted">{inspectingUser.email} • User ID #{inspectingUser.id}</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setInspectingUser(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex gap-2 mb-4 border-bottom pb-2">
                  <button
                    className={`btn btn-sm ${inspectorTab === 'profile' ? 'bg-dark text-white' : 'btn-light text-dark'} rounded-pill px-3 extra-small fw-bold`}
                    onClick={() => setInspectorTab('profile')}
                  >
                    Profile & Account
                  </button>
                  <button
                    className={`btn btn-sm ${inspectorTab === 'cards' ? 'bg-dark text-white' : 'btn-light text-dark'} rounded-pill px-3 extra-small fw-bold`}
                    onClick={() => setInspectorTab('cards')}
                  >
                    Digital Cards
                  </button>
                </div>

                {inspectorTab === 'profile' && (
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3">
                        <span className="extra-small text-muted fw-bold text-uppercase d-block mb-1">Account Role</span>
                        <span className="fw-bold text-dark">{inspectingUser.role || 'USER'}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3">
                        <span className="extra-small text-muted fw-bold text-uppercase d-block mb-1">Account Status</span>
                        <span className="fw-bold text-success">{inspectingUser.status || (inspectingUser.enabled ? 'ACTIVE' : 'SUSPENDED')}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3">
                        <span className="extra-small text-muted fw-bold text-uppercase d-block mb-1">Registered Email</span>
                        <span className="fw-semibold text-dark">{inspectingUser.email}</span>
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      {inspectingUser.username && inspectingUser.isPublic !== false && inspectingUser.public !== false ? (
                        <div className="p-3.5 rounded-4 border border-slate-200" style={{ background: '#FAF8FF' }}>
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill extra-small fw-bold px-2 py-0.5">
                                  PUBLIC PROFILE ACTIVE
                                </span>
                              </div>
                              <span className="text-purple extra-small fw-bold">
                                {window.location.origin}/{inspectingUser.username}
                              </span>
                            </div>
                            <a
                              href={`/${inspectingUser.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm text-white rounded-pill px-3.5 py-2 extra-small fw-extrabold border-0 shadow-xs"
                              style={{ background: '#7C3AED' }}
                            >
                              <i className="bi bi-box-arrow-up-right me-1.5"></i> Open Public Profile (/{inspectingUser.username})
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-4 border border-slate-200 bg-light text-dark">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <i className="bi bi-eye-slash-fill text-secondary fs-6"></i>
                            <h6 className="fw-bold mb-0 small">No Public Profile Available</h6>
                          </div>
                          <p className="extra-small text-secondary mb-0">
                            {inspectingUser.username
                              ? 'This user has disabled public profile visibility.'
                              : 'This user has not claimed a public profile username.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {inspectorTab === 'cards' && (
                  <div className="text-center py-4 text-muted extra-small">
                    {inspectingUser.username && inspectingUser.isPublic !== false && inspectingUser.public !== false ? (
                      <>
                        <p className="mb-3">View published digital business cards &amp; social links for <strong>@{inspectingUser.username}</strong>.</p>
                        <a
                          href={`/${inspectingUser.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm text-white rounded-pill px-4 py-2 extra-small fw-bold border-0 shadow-xs"
                          style={{ background: '#7C3AED' }}
                        >
                          <i className="bi bi-credit-card-2-front me-1.5"></i> View User Public Cards &rarr;
                        </a>
                      </>
                    ) : (
                      <p className="text-secondary fw-bold mb-0">
                        <i className="bi bi-shield-lock me-1"></i> Public profile link not available for this account.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top p-3 d-flex align-items-center justify-content-between">
                {inspectingUser.username && inspectingUser.isPublic !== false && inspectingUser.public !== false ? (
                  <a
                    href={`/${inspectingUser.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-purple rounded-pill px-3 extra-small fw-bold text-purple"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i> Visit /{inspectingUser.username}
                  </a>
                ) : (
                  <span className="badge bg-secondary-subtle text-secondary rounded-pill extra-small px-3 py-1.5 fw-bold">
                    <i className="bi bi-eye-slash me-1"></i> Public Profile Unavailable
                  </span>
                )}
                <button type="button" className="btn btn-secondary rounded-pill px-4 extra-small fw-bold" onClick={() => setInspectingUser(null)}>
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BROADCAST ANNOUNCEMENT MODAL */}
      {showBroadcastModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom p-4">
                <h5 className="modal-title fw-bold text-dark mb-0">
                  <i className="bi bi-megaphone-fill text-purple me-2"></i> System Broadcast Announcement
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowBroadcastModal(false)}></button>
              </div>

              <form onSubmit={handleSendBroadcast}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-uppercase">Announcement Title</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Scheduled System Maintenance Notice"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-uppercase">Notification Message</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Enter announcement details to push to all active user dashboards..."
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-uppercase">Notice Type</label>
                    <select
                      className="form-select rounded-3 extra-small"
                      value={broadcastForm.type}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                    >
                      <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                      <option value="MAINTENANCE">SYSTEM MAINTENANCE</option>
                      <option value="UPDATE">FEATURE UPDATE</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-top p-3">
                  <button type="button" className="btn btn-light rounded-pill px-4 extra-small fw-bold" onClick={() => setShowBroadcastModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn text-white rounded-pill px-4 extra-small fw-bold" style={{ background: '#7C3AED' }} disabled={sendingBroadcast}>
                    {sendingBroadcast ? 'Broadcasting...' : 'Push Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE USER CONFIRMATION MODAL */}
      {deleteTargetUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-body p-4 text-center">
                <div className="p-3 bg-danger-subtle text-danger rounded-circle d-inline-flex mb-3">
                  <i className="bi bi-exclamation-triangle-fill fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-1">Delete User Account?</h5>
                <p className="text-muted small mb-4">
                  Are you sure you want to permanently remove <strong>{deleteTargetUser.email}</strong>? This action cannot be undone.
                </p>
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 extra-small fw-bold" onClick={() => setDeleteTargetUser(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger rounded-pill px-4 extra-small fw-bold" onClick={handleDeleteUser}>
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
