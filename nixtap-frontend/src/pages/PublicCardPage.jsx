import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicCard, trackCardView } from '../api/publicCardService';
import { getvCard } from '../api/profileService';
import { subscribeServiceHealth } from '../api/circuitBreaker';
import MeetingSchedulerModal from '../components/public/MeetingSchedulerModal';
import FeedbackWidget from '../components/public/FeedbackWidget';
import PortfolioGalleryWidget from '../components/portfolio/PortfolioGalleryWidget';

const MOCK_PUBLIC_CARD = {
  id: 1,
  cardName: 'Executive Business Card',
  fullName: 'John Doe',
  jobTitle: 'Principal Software Engineer',
  company: 'Nixtap Microservices',
  bio: 'Architecting scalable cloud applications, high-performance microservices, and modern frontend platforms.',
  email: 'john.doe@nixtap.com',
  phone: '+1 (555) 234-5678',
  address: 'San Francisco, California',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  customGradient: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
  socialLinks: [
    { id: 1, platform: 'LinkedIn', url: 'https://linkedin.com' },
    { id: 2, platform: 'GitHub', url: 'https://github.com' },
    { id: 3, platform: 'Twitter', url: 'https://x.com' },
    { id: 4, platform: 'Portfolio', url: 'https://nixtap.com' },
  ],
  featuredProjects: [
    {
      id: 101,
      title: 'Nixtap Microservice Architecture',
      category: 'Microservices',
      description: 'Distributed Spring Cloud microservices featuring Spring Security, Eureka, and API Gateway.',
      projectUrl: 'https://github.com/nixtap/microservices',
      coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      tags: ['Spring Cloud', 'Docker'],
      featured: true,
    },
    {
      id: 102,
      title: 'NFC Contact Tap System',
      category: 'Web App',
      description: 'Instant contactless digital business card sharing via NFC tags and dynamic QR codes.',
      projectUrl: 'https://nixtap.com/demo',
      coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      tags: ['React', 'NFC'],
      featured: true,
    },
  ],
};

const PLATFORM_ICONS = {
  LinkedIn: 'bi-linkedin text-primary',
  GitHub: 'bi-github text-dark',
  Twitter: 'bi-twitter-x text-dark',
  X: 'bi-twitter-x text-dark',
  Portfolio: 'bi-globe text-success',
  Instagram: 'bi-instagram text-danger',
  YouTube: 'bi-youtube text-danger',
  Facebook: 'bi-facebook text-primary',
  Website: 'bi-link-45deg text-info',
  Other: 'bi-share-fill text-secondary',
};

const PublicCardPage = () => {
  const { cardId } = useParams();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  const [meetingsDegraded, setMeetingsDegraded] = useState(false);
  const [feedbackDegraded, setFeedbackDegraded] = useState(false);
  const [portfolioDegraded, setPortfolioDegraded] = useState(false);

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeServiceHealth((health) => {
      setMeetingsDegraded(health.meetings?.status === 'DEGRADED');
      setFeedbackDegraded(health.feedback?.status === 'DEGRADED');
      setPortfolioDegraded(health.portfolio?.status === 'DEGRADED');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPublicCardData();
  }, [cardId]);

  const fetchPublicCardData = async () => {
    try {
      setLoading(true);
      const res = await getPublicCard(cardId);
      const data = res?.data || res;
      if (data && (data.fullName || data.cardName)) {
        setCard(data);
        trackCardView(data);
      } else {
        setCard(null);
      }
    } catch (err) {
      console.warn('Public card fetch error:', err?.message);
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = () => {
    const vcfContent = getvCard({
      fullName: card.fullName,
      company:  card.company,
      jobTitle: card.jobTitle,
      phone:    card.phone,
      email:    card.email,
      bio:      card.bio,
    });
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', `${(card.fullName || 'contact').replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleShareCard = () => {
    if (navigator.share) {
      navigator.share({
        title: card.fullName,
        text: `${card.fullName} - ${card.jobTitle}`,
        url: window.location.href,
      }).catch(() => copyFallback());
    } else {
      copyFallback();
    }
  };

  const copyFallback = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-purple" role="status">
          <span className="visually-hidden">Loading Digital Business Card...</span>
        </div>
      </div>
    );
  }

  // ── 404 SCREEN IF CARD / PROFILE DOES NOT EXIST ──
  if (!card) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-white text-dark" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="container my-auto py-5 text-center">
          <div className="p-5 rounded-5 border border-slate-200 shadow-sm mx-auto bg-light" style={{ maxWidth: '580px' }}>
            <div className="rounded-circle bg-pastel-lavender text-purple d-inline-flex align-items-center justify-content-center mb-4"
              style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-credit-card-2-front-fill fs-1 text-purple"></i>
            </div>
            <h2 className="fw-extrabold text-dark mb-2">Business Card Not Available</h2>
            <p className="text-secondary small mb-4 leading-relaxed">
              The requested digital business card or user profile does not exist in our database or has been deactivated.
            </p>
            <div className="d-flex align-items-center justify-content-center gap-3">
              <Link to="/" className="btn btn-sm text-white fw-bold rounded-pill px-4 py-2.5 shadow-sm border-0"
                style={{ background: '#7C3AED' }}>
                <i className="bi bi-house-door me-1.5"></i> Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cardBg = card?.customGradient || 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)';

  return (
    <div className="min-vh-100 py-5 px-3 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FAF8FF 0%, #F1F5F9 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast Share Alert */}
      {copiedShare && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3">
          <div className="alert bg-dark text-white rounded-pill px-4 py-2.5 small fw-bold d-flex align-items-center gap-2 shadow-lg">
            <i className="bi bi-check-circle-fill text-success fs-5"></i> Link copied to clipboard!
          </div>
        </div>
      )}

      {/* Main Standalone Mobile/Desktop Public Card Container */}
      <div
        className="bg-white border border-slate-200 shadow-xl overflow-hidden text-dark w-100 position-relative"
        style={{ maxWidth: '460px', borderRadius: '32px' }}
      >
        {/* Banner Cover Header */}
        <div
          className="p-4 text-white position-relative text-center d-flex flex-column align-items-center justify-content-end"
          style={{ background: cardBg, minHeight: '160px', borderTopLeftRadius: '32px', borderTopRightRadius: '32px' }}
        >
          <div className="position-absolute top-0 end-0 p-3">
            <span className="badge bg-white bg-opacity-20 text-white rounded-pill extra-small fw-bold backdrop-blur">
              <i className="bi bi-shield-check me-1"></i> Verified Card
            </span>
          </div>

          {/* Avatar Ring */}
          <div className="position-relative" style={{ marginBottom: '-48px', zIndex: 2 }}>
            {card.avatarUrl ? (
              <img
                src={card.avatarUrl}
                alt={card.fullName}
                className="rounded-circle object-fit-cover shadow-lg border border-4 border-white"
                style={{ width: '96px', height: '96px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(card.fullName);
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-pastel-purple text-white fw-bold display-5 d-inline-flex align-items-center justify-content-center shadow-lg border border-4 border-white"
                style={{ width: '96px', height: '96px' }}
              >
                {(card.fullName || 'C').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle" title="Online & Available"></span>
          </div>
        </div>

        {/* Card Main Body */}
        <div className="p-4 pt-5 text-center position-relative z-1">
          <h3 className="fw-extrabold text-dark mb-0 lh-tight">{card.fullName}</h3>
          <p className="fw-semibold text-purple small mb-1">{card.jobTitle}</p>
          <div className="mb-3">
            <span className="badge bg-pastel-lavender text-purple rounded-pill small fw-bold">
              {card.company || 'Nixtap Platform'}
            </span>
          </div>

          {card.bio && (
            <div className="p-3 bg-light rounded-4 mb-4 text-start">
              <p className="extra-small text-secondary mb-0">{card.bio}</p>
            </div>
          )}

          {/* Primary Action Buttons Bar */}
          <div className="d-grid gap-2 mb-4">
            <button
              onClick={handleSaveContact}
              className="btn bg-pastel-purple text-white py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2 fs-6"
              style={{ background: '#7C3AED' }}
            >
              <i className="bi bi-person-plus-fill"></i> Save Contact (.vcf)
            </button>

            <div className="row g-2">
              <div className="col-6">
                <button
                  onClick={() => setShowMeetingModal(true)}
                  disabled={meetingsDegraded}
                  className={`btn btn-light text-dark py-2.5 w-100 rounded-pill fw-bold small d-flex align-items-center justify-content-center gap-1.5 border border-slate-200 ${
                    meetingsDegraded ? 'opacity-50' : ''
                  }`}
                  title={meetingsDegraded ? 'Meeting service degraded' : 'Book a meeting'}
                >
                  <i className="bi bi-calendar-event text-purple"></i> {meetingsDegraded ? 'Offline' : 'Book Meeting'}
                </button>
              </div>
              <div className="col-6">
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  disabled={feedbackDegraded}
                  className={`btn btn-light text-dark py-2.5 w-100 rounded-pill fw-bold small d-flex align-items-center justify-content-center gap-1.5 border border-slate-200 ${
                    feedbackDegraded ? 'opacity-50' : ''
                  }`}
                  title={feedbackDegraded ? 'Review service degraded' : 'Leave a review'}
                >
                  <i className="bi bi-star-fill text-warning"></i> {feedbackDegraded ? 'Offline' : 'Leave Review'}
                </button>
              </div>
            </div>

            <button
              onClick={handleShareCard}
              className="btn btn-outline-dark py-2.5 rounded-pill fw-bold small d-flex align-items-center justify-content-center gap-2 mt-1"
            >
              <i className="bi bi-share"></i> Share Card Link
            </button>
          </div>

          {/* Social Channels Pills Grid */}
          {card.socialLinks && card.socialLinks.length > 0 && (
            <div className="mb-4 text-start">
              <div className="extra-small text-muted fw-bold text-uppercase mb-2 text-center" style={{ letterSpacing: '0.05em' }}>Connect via Social</div>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {card.socialLinks.map((link) => {
                  const iconClass = PLATFORM_ICONS[link.platform] || PLATFORM_ICONS.Other;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-light rounded-pill px-3 py-2 d-flex align-items-center gap-2 extra-small border border-slate-200 text-dark fw-bold hover-card"
                    >
                      <i className={`bi ${iconClass} fs-6`}></i>
                      <span>{link.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Contact Details Container */}
          <div className="p-3 bg-light rounded-4 mb-4 text-start extra-small text-secondary space-y-2">
            {card.email && (
              <a href={`mailto:${card.email}`} className="d-flex align-items-center gap-2 text-dark text-decoration-none fw-semibold">
                <i className="bi bi-envelope text-purple"></i> {card.email}
              </a>
            )}
            {card.phone && (
              <a href={`tel:${card.phone}`} className="d-flex align-items-center gap-2 text-dark text-decoration-none fw-semibold mt-1">
                <i className="bi bi-telephone text-purple"></i> {card.phone}
              </a>
            )}
            {card.address && (
              <div className="d-flex align-items-center gap-2 text-muted mt-1">
                <i className="bi bi-geo-alt text-purple"></i> {card.address}
              </div>
            )}
          </div>

          {/* Featured Projects Widget */}
          {!portfolioDegraded && card.featuredProjects && card.featuredProjects.length > 0 && (
            <div className="mb-4 text-start">
              <PortfolioGalleryWidget
                projects={card.featuredProjects}
                title="Featured Projects"
              />
            </div>
          )}

          {/* Footer Powered By Badge */}
          <div className="pt-3 border-top border-slate-100 text-center extra-small text-muted">
            <Link to="/" className="text-decoration-none text-muted">
              Powered by <strong className="text-dark">Nixtap NFC Platform</strong>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      {showMeetingModal && !meetingsDegraded && (
        <MeetingSchedulerModal
          card={card}
          onClose={() => setShowMeetingModal(false)}
        />
      )}

      {showFeedbackModal && !feedbackDegraded && (
        <FeedbackWidget
          cardId={card?.id}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
};

export default PublicCardPage;
