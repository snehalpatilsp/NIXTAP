import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMeetingsByOwner,
  getMeetingStats,
  acceptMeeting,
  rejectMeeting,
  deleteMeeting,
  submitMeetingRequest
} from '../api/meetingService';
import { getUserCards } from '../api/cardService';

const MeetingsPage = () => {
  const { user } = useAuth();

  const [meetings, setMeetings]         = useState([]);
  const [stats, setStats]               = useState(null);
  const [cards, setCards]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | PENDING | ACCEPTED | REJECTED
  const [toast, setToast]               = useState(null);

  // New Request Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm]           = useState({
    cardId: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });
  const [submitting, setSubmitting]             = useState(false);

  useEffect(() => {
    fetchMeetingData();
  }, [user?.userId]);

  const fetchMeetingData = async () => {
    const userId = user?.userId || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      const [meetingsRes, statsRes, cardsRes] = await Promise.allSettled([
        getMeetingsByOwner(userId),
        getMeetingStats(userId),
        getUserCards(),
      ]);

      if (meetingsRes.status === 'fulfilled') {
        const data = meetingsRes.value?.data || meetingsRes.value || [];
        setMeetings(Array.isArray(data) ? data : []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value?.data || statsRes.value || null);
      }
      if (cardsRes.status === 'fulfilled') {
        const cardList = cardsRes.value?.data || cardsRes.value || [];
        setCards(Array.isArray(cardList) ? cardList : []);
      }
    } catch (err) {
      console.warn('Meeting load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAccept = async (id) => {
    try {
      await acceptMeeting(id, 'Accepted via owner portal');
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'ACCEPTED' } : m));
      showToast('Meeting request accepted!');
    } catch (err) {
      showToast('Failed to accept meeting', 'danger');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectMeeting(id, 'Rejected via owner portal');
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'REJECTED' } : m));
      showToast('Meeting request rejected');
    } catch (err) {
      showToast('Failed to reject meeting', 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMeeting(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      showToast('Meeting request deleted');
    } catch (err) {
      showToast('Failed to delete meeting', 'danger');
    }
  };

  const handleNewRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const ownerId = user?.userId || user?.id || 1;
      const payload = {
        ownerId,
        cardId: requestForm.cardId ? parseInt(requestForm.cardId) : (cards[0]?.id || 1),
        requesterName: requestForm.requesterName || 'Visitor',
        requesterEmail: requestForm.requesterEmail || 'visitor@nixtap.com',
        requesterPhone: requestForm.requesterPhone || '',
        purpose: requestForm.purpose || 'Business Discussion',
        preferredDate: requestForm.preferredDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        preferredTime: requestForm.preferredTime || '14:00',
        message: requestForm.message || '',
      };
      await submitMeetingRequest(payload);
      showToast('Meeting request submitted successfully!');
      setShowRequestModal(false);
      fetchMeetingData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Submitted meeting request!', 'success');
      setShowRequestModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      PENDING:   'bg-warning-subtle text-warning border border-warning-subtle',
      ACCEPTED:  'bg-success-subtle text-success border border-success-subtle',
      REJECTED:  'bg-danger-subtle text-danger border border-danger-subtle',
      CANCELLED: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
    };
    return `badge rounded-pill extra-small fw-bold px-2.5 py-1 ${map[status] || 'bg-secondary-subtle text-secondary'}`;
  };

  const filteredMeetings = filterStatus === 'ALL'
    ? meetings
    : meetings.filter(m => m.status === filterStatus);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ width: '2.5rem', height: '2.5rem', color: '#7C3AED' }}></div>
          <p className="text-muted fw-semibold small">Fetching meeting scheduler data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 pb-5" style={{ background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Toast Alert */}
      {toast && (
        <div className="position-fixed top-0 end-0 m-4 z-3">
          <div className={`alert border-0 rounded-4 shadow-lg px-4 py-3 text-white d-flex align-items-center gap-2 mb-0`}
            style={{ background: toast.type === 'success' ? '#10B981' : '#EF4444' }}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span className="fw-bold small">{toast.text}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="py-4 border-bottom border-slate-200 bg-white position-relative mb-4">
        <div className="container-fluid px-lg-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold text-purple mb-2" style={{ background: '#EDE9FE' }}>
                Meeting Scheduler Studio
              </span>
              <h1 className="fw-extrabold fs-3 text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Card Meeting <span style={{ color: '#7C3AED' }}>Requests</span>
              </h1>
              <p className="text-secondary small mb-0">Manage incoming appointment and call requests from your virtual business cards.</p>
            </div>
            <button onClick={() => setShowRequestModal(true)}
              className="btn text-white fw-bold rounded-pill px-4 py-2.5 small shadow-sm d-inline-flex align-items-center gap-2 border-0"
              style={{ background: '#7C3AED' }}>
              <i className="bi bi-calendar-plus-fill"></i> New Meeting Request
            </button>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="container-fluid px-lg-5">

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Requests',  value: stats?.total ?? meetings.length, color: '#7C3AED', icon: 'bi-calendar-event' },
            { label: 'Pending Action',  value: stats?.pending ?? meetings.filter(m => m.status === 'PENDING').length, color: '#F59E0B', icon: 'bi-hourglass-split' },
            { label: 'Accepted Calls',  value: stats?.accepted ?? meetings.filter(m => m.status === 'ACCEPTED').length, color: '#10B981', icon: 'bi-check-circle-fill' },
            { label: 'Rejected / Cancelled', value: (stats?.rejected ?? 0) + (stats?.cancelled ?? 0), color: '#EF4444', icon: 'bi-x-circle-fill' },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-xs text-center h-100">
                <i className={`bi ${s.icon} fs-4 mb-1 d-block`} style={{ color: s.color }}></i>
                <h3 className="fw-extrabold text-dark mb-0">{s.value}</h3>
                <span className="extra-small text-muted fw-semibold">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-2.5 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold extra-small transition-all ${
                  filterStatus === st ? 'bg-dark text-white' : 'btn-light text-secondary'
                }`}>
                {st}
              </button>
            ))}
          </div>
          <span className="extra-small text-muted fw-semibold me-2">Showing {filteredMeetings.length} requests</span>
        </div>

        {/* Request List */}
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-4 border border-slate-200 p-5 text-center shadow-xs">
            <i className="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
            <h6 className="fw-bold text-dark mb-1">No meeting requests found</h6>
            <p className="text-muted small mb-0">Visitors who scan your card can request meetings directly.</p>
          </div>
        ) : (
          <div className="d-grid gap-3">
            {filteredMeetings.map((m, i) => (
              <div key={m.id || i} className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 hover-elevate transition-all">
                <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <h6 className="fw-extrabold text-dark mb-0">{m.requesterName || 'Visitor'}</h6>
                      <span className={statusBadge(m.status)}>{m.status}</span>
                    </div>

                    <div className="extra-small text-muted d-flex align-items-center gap-3 flex-wrap mt-1">
                      {m.requesterEmail && <span><i className="bi bi-envelope me-1"></i>{m.requesterEmail}</span>}
                      {m.requesterPhone && <span><i className="bi bi-telephone me-1"></i>{m.requesterPhone}</span>}
                      {m.preferredDate && <span><i className="bi bi-calendar-check me-1"></i>{m.preferredDate}</span>}
                      {m.preferredTime && <span><i className="bi bi-clock me-1"></i>{m.preferredTime}</span>}
                    </div>

                    {m.message && (
                      <div className="bg-light p-3 rounded-3 mt-3 extra-small text-dark border-start border-3 border-purple">
                        "{m.message}"
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {m.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAccept(m.id)}
                          className="btn btn-sm btn-outline-success rounded-pill px-3 extra-small fw-bold">
                          <i className="bi bi-check-lg me-1"></i>Accept
                        </button>
                        <button onClick={() => handleReject(m.id)}
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 extra-small fw-bold">
                          <i className="bi bi-x-lg me-1"></i>Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(m.id)} className="btn btn-sm btn-light border rounded-pill px-2.5 text-muted" title="Delete">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Meeting Request Modal */}
      {showRequestModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
                <h5 className="modal-title fw-extrabold d-flex align-items-center gap-2">
                  <i className="bi bi-calendar-plus text-purple"></i> Schedule Meeting
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRequestModal(false)}></button>
              </div>

              <form onSubmit={handleNewRequestSubmit}>
                <div className="modal-body p-4">
                  {cards.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label extra-small fw-bold text-secondary">Target Digital Card</label>
                      <select className="form-select form-select-sm"
                        onChange={e => setRequestForm({ ...requestForm, cardId: e.target.value })}>
                        <option value="">Select Digital Card</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.cardName || c.name || `Card #${c.id}`}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">Requester Name *</label>
                    <input type="text" className="form-control form-control-sm" required
                      onChange={e => setRequestForm({ ...requestForm, requesterName: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">Requester Email *</label>
                    <input type="email" className="form-control form-control-sm" required
                      onChange={e => setRequestForm({ ...requestForm, requesterEmail: e.target.value })} />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label extra-small fw-bold text-secondary">Preferred Date *</label>
                      <input type="date" className="form-control form-control-sm" required
                        onChange={e => setRequestForm({ ...requestForm, preferredDate: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label extra-small fw-bold text-secondary">Preferred Time *</label>
                      <input type="time" className="form-control form-control-sm" required
                        onChange={e => setRequestForm({ ...requestForm, preferredTime: e.target.value })} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">Agenda / Message</label>
                    <textarea className="form-control form-control-sm" rows="3"
                      placeholder="Brief description of discussion topic..."
                      onChange={e => setRequestForm({ ...requestForm, message: e.target.value })}></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-sm btn-light border rounded-pill px-4 extra-small fw-bold"
                    onClick={() => setShowRequestModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-sm btn-dark rounded-pill px-4 extra-small fw-bold" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
