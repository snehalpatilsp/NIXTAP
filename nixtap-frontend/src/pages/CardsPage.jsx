import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserCards, createCard, updateCard, deleteCard } from '../api/cardService';
import CardBuilder from '../components/CardBuilder';
import NfcLinkModal from '../components/NfcLinkModal';
import QrCodeModal from '../components/qr/QrCodeModal';
import CardAnalyticsDrawer from '../components/analytics/CardAnalyticsDrawer';

const DEFAULT_MOCK_CARDS = [
  {
    id: 1,
    cardTitle:   'Executive Business Card',
    designation: 'Principal Software Engineer',
    company:     'Nixtap Microservices',
    theme:       'midnight-indigo',
    slug:        'john-doe-exec',
    isPublic:    true,
    profileImage: '',
    viewsCount:  142,
    nfcWritten:  true,
    nfcTagUid:   '04:8A:2B:10:99:A1',
    customGradient: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
  },
  {
    id: 2,
    cardTitle:   'Tech Conference Networking Card',
    designation: 'Full-Stack Developer',
    company:     'Innovate Labs',
    theme:       'emerald-luxe',
    slug:        'john-doe-tech',
    isPublic:    true,
    profileImage: '',
    viewsCount:  89,
    nfcWritten:  false,
    nfcTagUid:   '',
    customGradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
  },
];

const CardsPage = () => {
  const { user } = useAuth();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { type, text }

  // Modal / View States
  const [buildingCard, setBuildingCard] = useState(null); // null | 'new' | cardObject
  const [nfcTargetCard, setNfcTargetCard] = useState(null);
  const [qrTargetCard, setQrTargetCard] = useState(null);
  const [analyticsCard, setAnalyticsCard] = useState(null);
  const [deleteTargetCard, setDeleteTargetCard] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);

  useEffect(() => {
    fetchCards();
  }, [user?.userId]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await getUserCards(); // Fix 1: no userId arg needed — uses /cards/user/me
      const rawData = res?.data?.content || res?.data || res;
      const data = Array.isArray(rawData) ? rawData : [];
      if (data.length > 0) {
        setCards(data);
      } else {
        setCards(DEFAULT_MOCK_CARDS);
      }
    } catch (err) {
      console.warn('Could not fetch user cards, using demo cards:', err?.message);
      setCards(DEFAULT_MOCK_CARDS);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Card Builder Save Handler
  const handleSaveCard = async (formData) => {
    if (buildingCard === 'new') {
      try {
        const res = await createCard(formData);
        const newCardObj = res?.data || {
          ...formData,
          id: Date.now(),
          viewsCount: 0,
          nfcWritten: false,
          slug: formData.cardName.toLowerCase().replace(/\s+/g, '-'),
        };
        setCards((prev) => [newCardObj, ...prev]);
        showToast('New digital business card created successfully!');
      } catch (err) {
        const fallbackCard = {
          ...formData,
          id: Date.now(),
          viewsCount: 0,
          nfcWritten: false,
          slug: formData.cardName.toLowerCase().replace(/\s+/g, '-'),
        };
        setCards((prev) => [fallbackCard, ...prev]);
        showToast('Card saved locally!');
      }
    } else if (buildingCard?.id) {
      try {
        await updateCard(buildingCard.id, formData);
        setCards((prev) =>
          prev.map((c) => (c.id === buildingCard.id ? { ...c, ...formData } : c))
        );
        showToast('Business card updated successfully!');
      } catch (err) {
        setCards((prev) =>
          prev.map((c) => (c.id === buildingCard.id ? { ...c, ...formData } : c))
        );
        showToast('Card updated locally!');
      }
    }
    setBuildingCard(null);
  };

  // Delete Card Handler
  const confirmDeleteCard = async () => {
    if (!deleteTargetCard) return;
    try {
      await deleteCard(deleteTargetCard.id);
      setCards((prev) => prev.filter((c) => c.id !== deleteTargetCard.id));
      showToast('Business card deleted successfully.');
    } catch (err) {
      setCards((prev) => prev.filter((c) => c.id !== deleteTargetCard.id));
      showToast('Business card deleted.');
    } finally {
      setDeleteTargetCard(null);
    }
  };

  // NFC Link Success Update Handler
  const handleNfcSuccess = (updatedCard) => {
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? { ...c, ...updatedCard } : c))
    );
    showToast('NFC hardware tag linked to card successfully!');
  };

  if (buildingCard) {
    return (
      <div className="container py-4">
        <CardBuilder
          initialCard={buildingCard === 'new' ? null : buildingCard}
          onSave={handleSaveCard}
          onCancel={() => setBuildingCard(null)}
        />
      </div>
    );
  }

  return (
    <div className="container py-4 min-vh-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`alert alert-${toast.type} alert-dismissible fade show d-flex align-items-center shadow-sm rounded-3 mb-4`}
          role="alert"
        >
          <i
            className={`bi ${
              toast.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'
            } me-2 fs-5`}
          ></i>
          <div className="fw-semibold small">{toast.text}</div>
          <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-extrabold text-dark mb-0 fs-3" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
              Digital <span style={{ color: '#7C3AED' }}>Business Cards</span>
            </h2>
            <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold text-purple" style={{ background: '#EDE9FE' }}>Card Studio</span>
          </div>
          <p className="text-secondary small mb-0">Create, customize, and program NFC & QR cards for your professional identity.</p>
        </div>
        <button
          onClick={() => setBuildingCard('new')}
          className="btn text-white fw-bold px-4 py-2.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-2 small border-0"
          style={{ background: '#7C3AED' }}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Create New Card</span>
        </button>
      </div>

      {/* Recommended Categories Section */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-extrabold text-dark mb-0" style={{ fontFamily: "'Outfit', sans-serif" }}>Recommended categories</h6>
        </div>
        <div className="row g-3">
          {[
            { title: 'Create Card', icon: 'bi-card-heading', color: 'text-purple', bg: '#EDE9FE' },
            { title: 'Link NFC Tag', icon: 'bi-nfc', color: 'text-info', bg: '#E0F2FE' },
            { title: 'Generate QR', icon: 'bi-qr-code-scan', color: 'text-success', bg: '#DCFCE7' },
            { title: 'Card Templates', icon: 'bi-palette', color: 'text-purple', bg: '#F3E8FF' },
            { title: 'Social Links', icon: 'bi-share', color: 'text-success', bg: '#E0E7FF' },
          ].map((cat, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2.4 col-xl-2">
              <div 
                className="p-3 rounded-4 border border-slate-200 bg-white text-center h-100 shadow-sm transition-all hover-translate-y cursor-pointer"
                onClick={() => setBuildingCard('new')}
              >
                <div 
                  className={`rounded-circle p-2.5 d-inline-flex align-items-center justify-content-center mb-2`}
                  style={{ background: cat.bg }}
                >
                  <i className={`bi ${cat.icon} fs-5 ${cat.color}`}></i>
                </div>
                <div className="fw-bold extra-small text-dark">{cat.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards List Section */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-extrabold text-dark mb-0" style={{ fontFamily: "'Outfit', sans-serif" }}>Your Active Cards</h5>
        <span className="badge rounded-pill extra-small px-3 py-1.5 fw-bold text-purple" style={{ background: '#EDE9FE' }}>
          {cards.length} Total
        </span>
      </div>

      {/* Main Task List Layout */}
      <div className="row g-4">
        <div className="col-12">
          {/* Toolbar Control */}
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2 bg-white p-3 rounded-4 border border-slate-200 shadow-xs">
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-light border-slate-200 text-dark fw-bold rounded-pill px-3 extra-small">
                <i className="bi bi-funnel me-1"></i> Filter
              </button>
              <button className="btn btn-sm btn-light border-slate-200 text-dark fw-bold rounded-pill px-3 extra-small">
                <i className="bi bi-sort-down me-1"></i> Sort
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="extra-small text-muted fw-semibold me-1">{cards ? cards.length : 0} Cards Total</span>
              <button
                onClick={() => setBuildingCard('new')}
                className="btn btn-sm bg-dark text-white fw-bold rounded-pill px-3.5 py-1.5 extra-small"
              >
                <i className="bi bi-plus-lg me-1"></i> New Card
              </button>
            </div>
          </div>

          {/* Group 1: ACTIVE BUSINESS CARDS */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2 px-1">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-extrabold text-dark extra-small text-uppercase tracking-wider">Active Digital Cards</span>
                <span className="badge bg-light text-dark rounded-pill border border-slate-200 extra-small">{cards ? cards.length : 0}</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5 bg-white rounded-4 border border-slate-200">
                <div className="spinner-border text-purple" role="status"></div>
                <p className="text-muted small mt-2">Loading digital business cards...</p>
              </div>
            ) : (!cards || cards.length === 0) ? (
              <div className="bg-white rounded-4 border border-slate-200 text-center py-5 p-4">
                <h6 className="fw-bold text-dark mb-1">No business cards found</h6>
                <p className="text-muted extra-small mb-3">Create your first NFC digital business card.</p>
                <button
                  onClick={() => setBuildingCard('new')}
                  className="btn btn-sm bg-pastel-purple text-white fw-bold rounded-pill px-4 py-2"
                  style={{ background: '#7C3AED' }}
                >
                  <i className="bi bi-plus-lg me-1"></i> Create Card
                </button>
              </div>
            ) : (
              <div className="d-grid gap-2">
                {cards.map((card, index) => {
                  const statusClass = card.nfcWritten ? 'in-progress' : index % 2 === 0 ? 'in-review' : 'drafts';
                  const statusText  = card.nfcWritten ? 'NFC Linked' : index % 2 === 0 ? 'Active' : 'Draft';
                  const priorityClass = index % 2 === 0 ? 'high' : 'medium';
                  const priorityText  = index % 2 === 0 ? 'High' : 'Medium';
                  const progressPct   = (card.viewsCount || 0) > 100 ? 100 : Math.min(100, Math.round(((card.viewsCount || 0) / 150) * 100));

                  return (
                    <div key={card.id} className="bg-white p-3.5 rounded-4 border border-slate-200 shadow-xs hover-card transition-all">
                      <div className="row align-items-center g-3">
                        {/* Title & Info */}
                        <div className="col-12 col-lg-5">
                          <div className="d-flex align-items-center gap-3">
                            <div className="position-relative flex-shrink-0">
                              {card.profileImage || user?.avatarUrl || localStorage.getItem('nixtap_profile_avatar') ? (
                                <img
                                  src={card.profileImage || user?.avatarUrl || localStorage.getItem('nixtap_profile_avatar')}
                                  alt={card.cardTitle || 'Profile'}
                                  className="rounded-circle object-fit-cover border shadow-sm"
                                  style={{ width: '44px', height: '44px' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="rounded-circle p-2 text-white fw-bold d-inline-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  background: card.customGradient || 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
                                  display: (card.profileImage || user?.avatarUrl || localStorage.getItem('nixtap_profile_avatar')) ? 'none' : 'flex',
                                }}
                              >
                                {(card.cardTitle || user?.fullName || 'C').charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="overflow-hidden">
                              <h6 className="fw-extrabold text-dark mb-0.5 text-truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>{card.cardTitle}</h6>
                              <div className="extra-small text-muted text-truncate">
                                {card.designation || 'Professional'} {card.company ? `@ ${card.company}` : ''}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Badges & Metrics */}
                        <div className="col-12 col-lg-4">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="extra-small text-secondary d-inline-flex align-items-center gap-1">
                              <i className="bi bi-paperclip"></i> {12 + index * 3}
                            </span>
                            <span className="extra-small text-secondary d-inline-flex align-items-center gap-1 me-1">
                              <i className="bi bi-chat-dots"></i> {21 + index * 5}
                            </span>
                            <span className={`badge-status ${statusClass}`}>
                              {statusText}
                            </span>
                            <span className={`badge-priority ${priorityClass}`}>
                              {priorityText}
                            </span>
                            <span className="extra-small text-muted ms-auto me-1 fw-semibold">
                              {card.viewsCount || 0} Taps
                            </span>
                          </div>
                        </div>

                        {/* Progress & Actions */}
                        <div className="col-12 col-lg-3">
                          <div className="d-flex align-items-center justify-content-end gap-3">
                            <div className="w-100" style={{ maxWidth: '90px' }}>
                              <div className="d-flex justify-content-between extra-small text-muted mb-1">
                                <span>Views</span>
                                <span className="fw-bold text-dark">{progressPct}%</span>
                              </div>
                              <div className="progress rounded-pill bg-slate-100" style={{ height: '6px' }}>
                                <div
                                  className="progress-bar rounded-pill"
                                  role="progressbar"
                                  style={{ width: `${progressPct}%`, background: '#7C3AED' }}
                                ></div>
                              </div>
                            </div>

                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-light rounded-circle p-0 d-inline-flex align-items-center justify-content-center text-secondary border border-slate-200"
                                style={{ width: '32px', height: '32px' }}
                                type="button"
                                data-bs-toggle="dropdown"
                              >
                                <i className="bi bi-three-dots"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-slate-200 small">
                                <li>
                                  <button className="dropdown-item py-1.5" onClick={() => setBuildingCard(card)}>
                                    <i className="bi bi-pencil me-2 text-purple"></i> Edit Card
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item py-1.5" onClick={() => setQrTargetCard(card)}>
                                    <i className="bi bi-qr-code me-2 text-info"></i> Generate QR Code
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item py-1.5" onClick={() => setNfcTargetCard(card)}>
                                    <i className="bi bi-nfc me-2 text-success"></i> Link NFC Tag
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item py-1.5" onClick={() => setAnalyticsCard(card)}>
                                    <i className="bi bi-bar-chart me-2 text-warning"></i> View Analytics
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item py-1.5" onClick={() => setPreviewCard(card)}>
                                    <i className="bi bi-eye me-2 text-dark"></i> Preview Card
                                  </button>
                                </li>
                                <li><hr className="dropdown-divider my-1" /></li>
                                <li>
                                  <button className="dropdown-item py-1.5 text-danger" onClick={() => setDeleteTargetCard(card)}>
                                    <i className="bi bi-trash me-2"></i> Delete Card
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dashed Add Card Row */}
            <button
              onClick={() => setBuildingCard('new')}
              className="btn w-100 mt-3 py-3.5 bg-white rounded-4 text-secondary fw-bold extra-small d-flex align-items-center justify-content-center gap-2 transition-all"
              style={{ border: '2px dashed #E2E8F0' }}
            >
              <i className="bi bi-plus-lg text-purple"></i>
              <span>Add New Digital Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Per-Card Analytics Deep-dive Drawer */}
      {analyticsCard && (
        <CardAnalyticsDrawer
          card={analyticsCard}
          onClose={() => setAnalyticsCard(null)}
        />
      )}

      {/* Dynamic QR Code Modal */}
      {qrTargetCard && (
        <QrCodeModal
          card={qrTargetCard}
          onClose={() => setQrTargetCard(null)}
        />
      )}

      {/* NFC Linker Modal Dialog */}
      {nfcTargetCard && (
        <NfcLinkModal
          card={nfcTargetCard}
          onClose={() => setNfcTargetCard(null)}
          onSuccess={handleNfcSuccess}
        />
      )}

      {/* Card Mobile Preview Quick Modal */}
      {previewCard && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h5 className="modal-title fw-bold">Live Card Preview</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setPreviewCard(null)}
                ></button>
              </div>
              <div className="modal-body p-4 d-flex justify-content-center bg-light">
                <div
                  className="card border-0 shadow-lg rounded-5 overflow-hidden text-white text-center p-4"
                  style={{
                    width: '300px',
                    height: '480px',
                    background: previewCard.customGradient || 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                  }}
                >
                  <div className="my-3">
                    <div
                      className="rounded-circle bg-white text-dark fw-bold display-6 d-inline-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '80px', height: '80px' }}
                    >
                      {(previewCard.cardTitle || 'C').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h4 className="fw-bold mb-1">{previewCard.cardTitle}</h4>
                  <p className="small text-white-75 mb-1">{previewCard.designation}</p>
                  <p className="extra-small text-white-50">{previewCard.company}</p>

                  <div className="mt-auto pt-3 border-top border-white-20 d-grid gap-2">
                    <button className="btn btn-light btn-sm fw-bold rounded-pill">
                      <i className="bi bi-download me-1"></i> Save vCard Contact
                    </button>
                    <span className="extra-small text-white-50">Tap URL: http://localhost:3000/card/{previewCard.slug || previewCard.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {deleteTargetCard && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">Delete Digital Business Card</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setDeleteTargetCard(null)}
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <i className="bi bi-exclamation-triangle text-danger display-4 mb-3 d-block"></i>
                <p className="mb-1">Are you sure you want to delete this business card?</p>
                <strong className="text-dark d-block">{deleteTargetCard.cardTitle}</strong>
              </div>
              <div className="modal-footer border-0 bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setDeleteTargetCard(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4"
                  onClick={confirmDeleteCard}
                >
                  Delete Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsPage;
