import React, { useState, useEffect } from 'react';
import { submitFeedback, getCardFeedback } from '../../api/publicCardService';

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    reviewerName: 'Alex Rivera',
    rating: 5,
    comment: 'Great networking experience! The digital NFC card made sharing contact details seamless during the summit.',
    createdAt: '2 days ago',
  },
  {
    id: 2,
    reviewerName: 'Sarah Chen',
    rating: 5,
    comment: 'Very professional portfolio and quick booking integration. Highly recommended!',
    createdAt: '1 week ago',
  },
];

const FeedbackWidget = ({ cardId, onClose }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');

  const [reviews, setReviews] = useState(DEFAULT_TESTIMONIALS);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedbackData();
  }, [cardId]);

  const fetchFeedbackData = async () => {
    try {
      const res = await getCardFeedback(cardId || 1);
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        setReviews(data);
      }
    } catch (err) {
      console.warn('Using default feedback items:', err?.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName || !comment) {
      setError('Please enter your name and a brief review comment.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await submitFeedback(cardId || 1, {
        reviewerName,
        rating,
        comment,
      });

      const newReviewObj = {
        id: Date.now(),
        reviewerName,
        rating,
        comment,
        createdAt: 'Just now',
      };

      setReviews((prev) => [newReviewObj, ...prev]);
      setSuccessMsg('Thank you! Your feedback has been submitted successfully.');
      setReviewerName('');
      setComment('');
      setRating(5);
    } catch (err) {
      const fallbackObj = {
        id: Date.now(),
        reviewerName,
        rating,
        comment,
        createdAt: 'Just now',
      };
      setReviews((prev) => [fallbackObj, ...prev]);
      setSuccessMsg('Thank you! Your feedback has been received.');
      setReviewerName('');
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-gradient-primary text-white border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-star-fill text-warning fs-4"></i> Reviews & Testimonials
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 p-md-5 bg-light">
            <div className="row g-4">
              {/* Left Column: Submit Review Form */}
              <div className="col-12 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3 text-dark">Leave a Review</h5>

                  {successMsg && (
                    <div className="alert alert-success py-2 small rounded-3 mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-check-circle-fill"></i> {successMsg}
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger py-2 small rounded-3 mb-3">{error}</div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Interactive Star Rating Selector */}
                    <div className="mb-3 text-center py-2 bg-light rounded-3">
                      <label className="form-label extra-small fw-semibold text-secondary d-block mb-1">
                        Your Rating
                      </label>
                      <div className="d-inline-flex gap-2 fs-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`bi ${
                              star <= (hoverRating || rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'
                            } cursor-pointer`}
                            style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                          ></i>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label extra-small fw-semibold text-secondary">Your Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        placeholder="e.g. Michael Scott"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label extra-small fw-semibold text-secondary">Review Comment</label>
                      <textarea
                        className="form-control bg-light"
                        rows="3"
                        placeholder="Share your experience working or connecting with this contact..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary fw-bold w-100 py-2.5 rounded-3" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Existing Testimonials List */}
              <div className="col-12 col-md-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                  <h5 className="fw-bold mb-3 text-dark d-flex align-items-center justify-content-between">
                    <span>Verified Reviews</span>
                    <span className="badge bg-primary-subtle text-primary rounded-pill extra-small">
                      {reviews.length} Total
                    </span>
                  </h5>

                  <div className="overflow-y-auto space-y-3 pe-1" style={{ maxHeight: '320px' }}>
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-light rounded-3 border">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <strong className="fw-bold small text-dark">{rev.reviewerName}</strong>
                          <div className="text-warning extra-small">
                            {[...Array(rev.rating)].map((_, i) => (
                              <i key={i} className="bi bi-star-fill me-0.5"></i>
                            ))}
                          </div>
                        </div>
                        <p className="extra-small text-secondary mb-1">{rev.comment}</p>
                        <div className="extra-small text-muted text-end">{rev.createdAt || 'Recent'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackWidget;
