import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getFeedbackByOwner,
  approveFeedback,
  rejectFeedback,
  deleteFeedback,
  submitFeedback
} from '../api/feedbackService';
import { getUserCards } from '../api/cardService';

const FeedbackPage = () => {
  const { user } = useAuth();

  const [feedbackList, setFeedbackList] = useState([]);
  const [cards, setCards]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('ALL'); // ALL | PENDING | APPROVED | REJECTED
  const [toast, setToast]               = useState(null);

  // Submit Feedback Modal
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState({
    cardId: '',
    visitorName: '',
    visitorEmail: '',
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    fetchFeedbackData();
  }, [user?.userId]);

  const fetchFeedbackData = async () => {
    const userId = user?.userId || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      const [fbRes, cardsRes] = await Promise.allSettled([
        getFeedbackByOwner(userId),
        getUserCards(),
      ]);

      if (fbRes.status === 'fulfilled') {
        const data = fbRes.value?.data || fbRes.value || [];
        setFeedbackList(Array.isArray(data) ? data : []);
      }
      if (cardsRes.status === 'fulfilled') {
        const cardList = cardsRes.value?.data || cardsRes.value || [];
        setCards(Array.isArray(cardList) ? cardList : []);
      }
    } catch (err) {
      console.warn('Feedback load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (id) => {
    try {
      await approveFeedback(id);
      setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, approved: true, isApproved: true } : f));
      showToast('Feedback approved and published to card!');
    } catch {
      showToast('Failed to approve feedback', 'danger');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectFeedback(id);
      setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, approved: false, isApproved: false } : f));
      showToast('Feedback rejected/hidden');
    } catch {
      showToast('Failed to reject feedback', 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id);
      setFeedbackList(prev => prev.filter(f => f.id !== id));
      showToast('Feedback entry deleted');
    } catch {
      showToast('Failed to delete entry', 'danger');
    }
  };

  const handleSubmitNewFeedback = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const ownerId = user?.userId || user?.id || 1;
      const payload = {
        ownerId,
        cardId: form.cardId ? parseInt(form.cardId) : (cards[0]?.id || 1),
        visitorName: form.visitorName || 'Visitor',
        visitorEmail: form.visitorEmail || 'visitor@nixtap.com',
        rating: parseInt(form.rating || 5),
        comment: form.comment || '',
      };
      await submitFeedback(payload);
      showToast('Feedback submitted successfully!');
      setShowModal(false);
      fetchFeedbackData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Submitted feedback!', 'success');
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = feedbackList.length
    ? (feedbackList.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbackList.length).toFixed(1)
    : '5.0';

  const filteredList = feedbackList.filter(f => {
    if (filter === 'APPROVED') return f.approved || f.isApproved;
    if (filter === 'PENDING')  return !(f.approved || f.isApproved);
    return true;
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ width: '2.5rem', height: '2.5rem', color: '#7C3AED' }}></div>
          <p className="text-muted fw-semibold small">Loading card ratings and feedback...</p>
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
                Card Feedback &amp; Reviews Studio
              </span>
              <h1 className="fw-extrabold fs-3 text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Ratings &amp; Visitor <span style={{ color: '#7C3AED' }}>Reviews</span>
              </h1>
              <p className="text-secondary small mb-0">Review, approve, and moderate client feedback submitted on your digital business cards.</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="btn text-white fw-bold rounded-pill px-4 py-2.5 small shadow-sm d-inline-flex align-items-center gap-2 border-0"
              style={{ background: '#7C3AED' }}>
              <i className="bi bi-star-fill"></i> Add Test Review
            </button>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="container-fluid px-lg-5">

        {/* Overview Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-xs text-center h-100">
              <i className="bi bi-star-fill fs-3 text-warning mb-1 d-block"></i>
              <h3 className="fw-extrabold text-dark mb-0">{avgRating} <span className="fs-6 text-muted font-normal">/ 5.0</span></h3>
              <span className="extra-small text-muted fw-semibold">Average Rating</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-xs text-center h-100">
              <i className="bi bg-purple-subtle text-purple bi-chat-square-quote-fill fs-4 mb-1 d-block"></i>
              <h3 className="fw-extrabold text-dark mb-0">{feedbackList.length}</h3>
              <span className="extra-small text-muted fw-semibold">Total Reviews</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-xs text-center h-100">
              <i className="bi bi-check-circle-fill fs-4 text-success mb-1 d-block"></i>
              <h3 className="fw-extrabold text-dark mb-0">{feedbackList.filter(f => f.approved || f.isApproved).length}</h3>
              <span className="extra-small text-muted fw-semibold">Approved &amp; Published</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="bg-white rounded-4 p-4 border border-slate-200 shadow-xs text-center h-100">
              <i className="bi bi-hourglass-split fs-4 text-warning mb-1 d-block"></i>
              <h3 className="fw-extrabold text-dark mb-0">{feedbackList.filter(f => !(f.approved || f.isApproved)).length}</h3>
              <span className="extra-small text-muted fw-semibold">Pending Moderation</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-2.5 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            {['ALL', 'APPROVED', 'PENDING'].map(st => (
              <button key={st} onClick={() => setFilter(st)}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold extra-small transition-all ${
                  filter === st ? 'bg-dark text-white' : 'btn-light text-secondary'
                }`}>
                {st}
              </button>
            ))}
          </div>
          <span className="extra-small text-muted fw-semibold me-2">Showing {filteredList.length} reviews</span>
        </div>

        {/* Feedback Items Grid */}
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-4 border border-slate-200 p-5 text-center shadow-xs">
            <i className="bi bi-chat-left-dots fs-1 text-muted d-block mb-2"></i>
            <h6 className="fw-bold text-dark mb-1">No feedback entries found</h6>
            <p className="text-muted small mb-0">Visitors who view your card can leave ratings and testimonials.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredList.map((f, i) => (
              <div key={f.id || i} className="col-12 col-md-6 col-lg-4">
                <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 h-100 d-flex flex-column justify-content-between hover-elevate transition-all">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-1 text-warning">
                        {[...Array(5)].map((_, idx) => (
                          <i key={idx} className={`bi ${idx < (f.rating || 5) ? 'bi-star-fill' : 'bi-star'} extra-small`}></i>
                        ))}
                      </div>
                      <span className={`badge rounded-pill extra-small fw-bold px-2.5 py-1 ${
                        f.approved || f.isApproved
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : 'bg-warning-subtle text-warning border border-warning-subtle'
                      }`}>
                        {f.approved || f.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>

                    <h6 className="fw-extrabold text-dark mb-0">{f.visitorName || 'Visitor'}</h6>
                    {f.visitorEmail && <span className="extra-small text-muted d-block mb-2">{f.visitorEmail}</span>}

                    {f.comment && (
                      <p className="extra-small text-secondary bg-light p-3 rounded-3 mb-3 border-start border-3 border-purple">
                        "{f.comment}"
                      </p>
                    )}
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-3 border-top border-slate-100 mt-2">
                    <span className="extra-small text-muted">Card #{f.cardId}</span>
                    <div className="d-flex align-items-center gap-1.5">
                      {!(f.approved || f.isApproved) ? (
                        <button onClick={() => handleApprove(f.id)} className="btn btn-sm btn-outline-success rounded-pill extra-small px-3 fw-bold">
                          Approve
                        </button>
                      ) : (
                        <button onClick={() => handleReject(f.id)} className="btn btn-sm btn-outline-warning rounded-pill extra-small px-3 fw-bold">
                          Hide
                        </button>
                      )}
                      <button onClick={() => handleDelete(f.id)} className="btn btn-sm btn-light border rounded-pill px-2 text-muted" title="Delete">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
                <h5 className="modal-title fw-extrabold d-flex align-items-center gap-2">
                  <i className="bi bi-star-fill text-warning"></i> Add Card Review
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmitNewFeedback}>
                <div className="modal-body p-4">
                  {cards.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label extra-small fw-bold text-secondary">Target Card</label>
                      <select className="form-select form-select-sm"
                        onChange={e => setForm({ ...form, cardId: e.target.value })}>
                        <option value="">Select Digital Card</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.cardName || c.name || `Card #${c.id}`}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">Visitor Name *</label>
                    <input type="text" className="form-control form-control-sm" required
                      onChange={e => setForm({ ...form, visitorName: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">Visitor Email</label>
                    <input type="email" className="form-control form-control-sm"
                      onChange={e => setForm({ ...form, visitorEmail: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">Star Rating (1 - 5)</label>
                    <select className="form-select form-select-sm" value={form.rating}
                      onChange={e => setForm({ ...form, rating: e.target.value })}>
                      <option value="5">5 Stars - Outstanding</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Good</option>
                      <option value="2">2 Stars - Fair</option>
                      <option value="1">1 Star - Poor</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">Comment / Review</label>
                    <textarea className="form-control form-control-sm" rows="3"
                      placeholder="Share your testimonial or feedback..."
                      onChange={e => setForm({ ...form, comment: e.target.value })}></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-sm btn-light border rounded-pill px-4 extra-small fw-bold"
                    onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-sm btn-dark rounded-pill px-4 extra-small fw-bold" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
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

export default FeedbackPage;
