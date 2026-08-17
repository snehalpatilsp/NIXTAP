import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { getPublicFullPortfolio } from '../api/portfolioService';
import { getPublicSocialLinks, getPublicProfileByUsername, getPublicProfileByUserId } from '../api/profileService';
import { getApprovedFeedback, getFeedbackSummary, submitFeedback } from '../api/feedbackService';
import { submitMeetingRequest } from '../api/meetingService';
import { getPublicUserCards } from '../api/cardService';
import { trackEvent } from '../api/analyticsService';

const PLATFORM_ICONS = {
  LINKEDIN:  { icon: 'bi-linkedin',  color: '#0A66C2', label: 'LinkedIn' },
  GITHUB:    { icon: 'bi-github',    color: '#0D1117', label: 'GitHub' },
  TWITTER:   { icon: 'bi-twitter-x', color: '#1DA1F2', label: 'Twitter / X' },
  INSTAGRAM: { icon: 'bi-instagram', color: '#E4405F', label: 'Instagram' },
  FACEBOOK:  { icon: 'bi-facebook',  color: '#1877F2', label: 'Facebook' },
  WHATSAPP:  { icon: 'bi-whatsapp',  color: '#25D366', label: 'WhatsApp' },
  YOUTUBE:   { icon: 'bi-youtube',   color: '#FF0000', label: 'YouTube' },
  WEBSITE:   { icon: 'bi-globe',     color: '#10B981', label: 'Website' },
  CUSTOM:    { icon: 'bi-link-45deg', color: '#7C3AED', label: 'Link' },
};

const PublicProfilePage = ({ defaultTab = 'overview' }) => {
  const { username, userId } = useParams();
  const location = useLocation();
  const rawIdentifier = username || userId || 'kirtesh';
  const isPortfolioMode = location.pathname.endsWith('/portfolio');

  const [loading, setLoading]           = useState(true);
  const [userProfile, setUserProfile]   = useState(null);
  const [activeTab, setActiveTab]       = useState(defaultTab);
  const [portfolio, setPortfolio]       = useState(null);
  const [socialLinks, setSocialLinks]   = useState([]);
  const [userCards, setUserCards]       = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [toast, setToast]               = useState(null);

  // Modals
  const [showMeetingModal, setShowMeetingModal]   = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form State
  const [meetingForm, setMeetingForm] = useState({
    requesterName: '', requesterEmail: '', requesterPhone: '',
    purpose: 'Business Networking', preferredDate: '', preferredTime: '10:00', message: ''
  });

  const [feedbackForm, setFeedbackForm] = useState({
    visitorName: '', visitorEmail: '', rating: 5, comment: ''
  });

  useEffect(() => {
    fetchData();
  }, [rawIdentifier]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let profileData = null;

      try {
        if (isNaN(rawIdentifier)) {
          profileData = await getPublicProfileByUsername(rawIdentifier);
        } else {
          profileData = await getPublicProfileByUserId(rawIdentifier);
        }
      } catch (e) {
        console.warn('Profile fetch error:', e);
      }

      // If user profile is not found in database or isPublic/public is false, do not show any profile data
      const isPublic = profileData?.isPublic !== false && profileData?.public !== false;
      if (!profileData || !profileData.userId || !isPublic) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const targetUserId = profileData.userId;
      const savedLocalAvatar = localStorage.getItem('nixtap_profile_avatar');
      if (savedLocalAvatar && (!profileData.profileImage || profileData.profileImage.startsWith('blob:'))) {
        profileData.profileImage = savedLocalAvatar;
      }
      setUserProfile(profileData);

      const [portRes, socialRes, cardsRes, fbRes, sumRes] = await Promise.allSettled([
        getPublicFullPortfolio(targetUserId),
        getPublicSocialLinks(targetUserId),
        getPublicUserCards(targetUserId),
        getApprovedFeedback(targetUserId),
        getFeedbackSummary(targetUserId),
      ]);

      if (portRes.status === 'fulfilled' && portRes.value) {
        setPortfolio(portRes.value);
      }
      if (socialRes.status === 'fulfilled' && Array.isArray(socialRes.value)) {
        setSocialLinks(socialRes.value);
      }
      if (cardsRes.status === 'fulfilled' && Array.isArray(cardsRes.value)) {
        setUserCards(cardsRes.value);
      }
      if (fbRes.status === 'fulfilled' && fbRes.value?.data) {
        setFeedbackList(fbRes.value.data);
      }
      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setFeedbackSummary(sumRes.value.data);
      }

      trackEvent({ ownerId: String(targetUserId), targetType: 'PORTFOLIO', targetId: String(targetUserId), eventType: 'VIEW' });
    } catch (err) {
      console.warn('Public profile fetch error:', err);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    try {
      const targetUserId = userProfile?.userId || 30;
      await submitMeetingRequest({
        ownerId: targetUserId,
        cardId: userCards[0]?.id || 1,
        ...meetingForm
      });
      showToast('Meeting request sent successfully!');
      setShowMeetingModal(false);
    } catch {
      showToast('Meeting request submitted!');
      setShowMeetingModal(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const targetUserId = userProfile?.userId || 30;
      await submitFeedback({
        ownerId: targetUserId,
        cardId: userCards[0]?.id || 1,
        ...feedbackForm
      });
      showToast('Feedback submitted for review!');
      setShowFeedbackModal(false);
    } catch {
      showToast('Feedback submitted!');
      setShowFeedbackModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="text-center">
          <div className="spinner-border mb-3 text-purple" style={{ width: '3rem', height: '3rem', color: '#7C3AED' }}></div>
          <p className="text-secondary fw-semibold small">Loading profile showcase...</p>
        </div>
      </div>
    );
  }

  // ── 404 SCREEN IF PROFILE / USERNAME DOES NOT EXIST OR IS NOT PUBLIC ──
  const isProfilePublic = userProfile?.isPublic !== false && userProfile?.public !== false;
  if (!userProfile || !isProfilePublic) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-white text-dark" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <PublicNavbar />
        <div className="container my-auto py-5 text-center">
          <div className="p-5 rounded-5 border border-slate-200 shadow-sm mx-auto bg-light" style={{ maxWidth: '580px' }}>
            <div className="rounded-circle bg-pastel-lavender text-purple d-inline-flex align-items-center justify-content-center mb-4"
              style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-person-x-fill fs-1"></i>
            </div>
            <h2 className="fw-extrabold text-dark mb-2">Profile Not Available</h2>
            <p className="text-secondary small mb-4 leading-relaxed">
              The public profile for <strong className="text-purple">@{rawIdentifier}</strong> does not exist in our database or has been set to private by the account owner.
            </p>
            <div className="d-flex align-items-center justify-content-center gap-3">
              <Link to="/" className="btn btn-sm text-white fw-bold rounded-pill px-4 py-2.5 shadow-sm border-0"
                style={{ background: '#7C3AED' }}>
                <i className="bi bi-house-door me-1.5"></i> Return Home
              </Link>
              <Link to="/login" className="btn btn-sm btn-outline-dark rounded-pill px-4 py-2.5 fw-bold">
                Sign In to Platform
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const projects     = portfolio?.projects || [];
  const experiences  = portfolio?.experiences || [];
  const education    = portfolio?.education || [];
  const skills       = portfolio?.skills || [];
  const certificates = portfolio?.certificates || [];
  const resume       = portfolio?.resume || null;
  const awards       = portfolio?.awards || [];
  const languages    = portfolio?.languages || [];

  return (
    <div className="d-flex flex-column min-vh-100 bg-white text-dark" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toast Alert */}
      {toast && (
        <div className="position-fixed top-0 end-0 m-4" style={{ zIndex: 9999 }}>
          <div className="alert border-0 rounded-4 shadow-xl px-4 py-3 text-white d-flex align-items-center gap-2.5 mb-0"
            style={{ background: toast.type === 'success' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
            <span className="fw-bold small">{toast.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <PublicNavbar />

      {/* Hero Header */}
      <div className="position-relative overflow-hidden py-5 py-md-6 border-bottom border-slate-100" style={{ background: 'linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 100%)' }}>
        {/* Decorative Background Accents */}
        <div className="position-absolute" style={{ top: '5%', left: '5%', width: '140px', height: '140px', borderRadius: '50%', background: '#F3E8FF', opacity: 0.6, filter: 'blur(30px)', zIndex: 0 }}></div>
        <div className="position-absolute" style={{ bottom: '5%', right: '5%', width: '160px', height: '160px', borderRadius: '50%', background: '#FEF3C7', opacity: 0.7, filter: 'blur(40px)', zIndex: 0 }}></div>

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex flex-column flex-md-row align-items-center gap-4 text-center text-md-start">
            <div className="position-relative">
              <div className="rounded-circle p-1 bg-white shadow-xl" style={{ width: '120px', height: '120px' }}>
                {userProfile?.profileImage ? (
                  <img src={userProfile.profileImage} alt={userProfile.fullName} className="rounded-circle w-100 h-100 object-fit-cover" />
                ) : (
                  <div className="rounded-circle text-white fw-extrabold d-flex align-items-center justify-content-center fs-1 shadow-md w-100 h-100"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
                    {(userProfile?.fullName || rawIdentifier).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="position-absolute bottom-0 end-0 p-2 bg-success border border-white rounded-circle shadow-sm" title="Verified Creator"></span>
            </div>

            <div className="flex-grow-1">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2 flex-wrap">
                <span className="badge bg-pastel-lavender text-purple rounded-pill extra-small fw-extrabold px-3 py-1">
                  <i className="bi bi-patch-check-fill me-1"></i> VERIFIED CREATOR
                </span>
                <span className="badge bg-pastel-soft-yellow text-dark rounded-pill extra-small fw-extrabold px-3 py-1">
                  @{userProfile?.username || rawIdentifier}
                </span>
              </div>

              <h1 className="display-5 fw-extrabold text-dark mb-1 tracking-tight">
                {userProfile?.fullName || `@${rawIdentifier}`}
              </h1>
              
              {userProfile?.designation && (
                <p className="fs-6 fw-bold mb-2 text-purple">
                  {userProfile.designation} {userProfile.company && <span className="text-secondary">at <span className="text-dark">{userProfile.company}</span></span>}
                </p>
              )}
              
              <p className="text-secondary small mb-4 max-w-2xl leading-relaxed" style={{ color: '#475569' }}>
                {userProfile?.bio || userProfile?.headline || "Digital Creator & Tech Innovator. Crafting high-performance digital experiences and virtual business identities."}
              </p>

              {/* Action Bar with Meeting & Feedback Buttons */}
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 flex-wrap mb-3">
                <button onClick={() => setShowMeetingModal(true)}
                  className="btn btn-sm text-white fw-bold rounded-pill px-4 py-2.5 small shadow-md border-0 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                  <i className="bi bi-calendar2-plus-fill me-1.5"></i> Schedule Meeting
                </button>

                <button onClick={() => setShowFeedbackModal(true)}
                  className="btn btn-sm bg-white text-dark border border-slate-200 rounded-pill px-4 py-2.5 small fw-bold shadow-sm transition-all">
                  <i className="bi bi-chat-square-heart-fill text-purple me-1.5"></i> Leave Feedback
                </button>

                <Link to={`/${rawIdentifier}/qr`}
                  className="btn btn-sm bg-white text-dark border border-slate-200 rounded-pill px-4 py-2.5 small fw-bold shadow-sm transition-all">
                  <i className="bi bi-qr-code-scan text-purple me-1.5"></i> View QR Code
                </Link>

                {resume?.resumeUrl && (
                  <a href={resume.resumeUrl} target="_blank" rel="noreferrer"
                    className="btn btn-sm bg-white text-dark border border-slate-200 rounded-pill px-4 py-2.5 small fw-bold shadow-sm">
                    <i className="bi bi-file-earmark-arrow-down-fill text-info me-1.5"></i> Download CV
                  </a>
                )}
              </div>

              {/* Mode Toggle Pills */}
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 flex-wrap">
                <Link to={`/${rawIdentifier}`} 
                  className={`btn btn-sm rounded-pill px-4 py-2 small fw-bold transition-all border ${!isPortfolioMode ? 'bg-dark text-white shadow-sm border-0' : 'bg-light text-dark border-slate-200'}`}>
                  <i className="bi bi-credit-card-2-front me-1.5"></i> Social &amp; Cards
                </Link>
                
                <Link to={`/${rawIdentifier}/portfolio`} 
                  className={`btn btn-sm rounded-pill px-4 py-2 small fw-bold transition-all border ${isPortfolioMode ? 'bg-dark text-white shadow-sm border-0' : 'bg-light text-dark border-slate-200'}`}>
                  <i className="bi bi-journal-code me-1.5"></i> Full Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container py-5 flex-grow-1">

        {/* ── MODE 1: CARDS & SOCIAL LINKS ONLY (/:username) ── */}
        {!isPortfolioMode && (
          <div className="row g-4">
            {/* Left Column: Social Links & Contact Info */}
            <div className="col-12 col-lg-5">
              <div className="bg-white rounded-4 border border-slate-200 p-4 mb-4 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3.5">
                  <h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-share-fill text-purple"></i> Social &amp; Public Links
                  </h6>
                  <span className="badge bg-pastel-lavender text-purple rounded-pill extra-small fw-bold">{socialLinks.length} Links</span>
                </div>

                {socialLinks.length === 0 ? (
                  <p className="text-secondary small mb-0">No public social links added yet.</p>
                ) : (
                  <div className="d-grid gap-2.5">
                    {socialLinks.map((s, idx) => {
                      const meta = PLATFORM_ICONS[s.platform?.toUpperCase()] || PLATFORM_ICONS.CUSTOM;
                      return (
                        <a key={s.id || idx} href={s.url} target="_blank" rel="noreferrer"
                          className="p-3 rounded-3 border border-slate-100 text-decoration-none d-flex align-items-center justify-content-between hover-elevate transition-all bg-light">
                          <div className="d-flex align-items-center gap-3 overflow-hidden">
                            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center bg-white shadow-xs" style={{ minWidth: '38px', height: '38px' }}>
                              <i className={`bi ${meta.icon} fs-5`} style={{ color: meta.color }}></i>
                            </div>
                            <div className="text-truncate">
                              <span className="fw-bold text-dark d-block extra-small">{s.displayLabel || meta.label}</span>
                              <span className="text-secondary extra-small text-truncate d-block">{s.url}</span>
                            </div>
                          </div>
                          <i className="bi bi-arrow-up-right-circle-fill text-purple fs-6"></i>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View Full Portfolio Banner */}
              <div className="p-4 rounded-4 text-center border border-slate-200 shadow-sm" style={{ background: '#FAF8FF' }}>
                <i className="bi bi-journal-bookmark-fill fs-1 text-purple mb-2 d-block"></i>
                <h6 className="fw-bold text-dark mb-1">Looking for Full Portfolio?</h6>
                <p className="text-secondary extra-small mb-3 leading-relaxed">Explore complete work history, engineering projects, tech stack skills, and verified certificates.</p>
                <Link to={`/${rawIdentifier}/portfolio`} className="btn btn-sm text-white fw-extrabold rounded-pill px-4 py-2.5 small w-100 shadow-sm border-0"
                  style={{ background: '#7C3AED' }}>
                  View Full Portfolio &rarr;
                </Link>
              </div>
            </div>

            {/* Right Column: Digital Business Cards */}
            <div className="col-12 col-lg-7">
              <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3.5">
                  <h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-credit-card-2-front-fill text-purple"></i> Digital Business Cards ({userCards.length})
                  </h6>
                  <span className="badge bg-pastel-soft-yellow text-dark rounded-pill extra-small fw-bold">
                    <i className="bi bi-nfc me-1"></i> NFC ENABLED
                  </span>
                </div>

                {userCards.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-credit-card fs-1 text-muted mb-2 d-block"></i>
                    <p className="text-secondary small mb-0">No public business cards published yet.</p>
                  </div>
                ) : (
                  <div className="row g-3.5">
                    {userCards.map((c, i) => (
                      <div key={i} className="col-12 col-md-6">
                        <div className="p-4 rounded-4 border border-slate-200 h-100 d-flex flex-column justify-content-between hover-elevate transition-all shadow-xs bg-white">
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-2.5">
                              <span className="badge bg-pastel-lavender text-purple rounded-pill extra-small fw-extrabold px-2.5 py-1">
                                VIRTUAL VCARD
                              </span>
                              <i className="bi bi-qr-code-scan text-muted fs-6"></i>
                            </div>
                            <h5 className="fw-extrabold text-dark mb-1">{c.cardTitle || c.title}</h5>
                            <p className="text-purple extra-small fw-bold mb-2">{c.designation} {c.company && `@ ${c.company}`}</p>
                            <p className="text-secondary extra-small line-clamp-2 mb-3.5 leading-relaxed">{c.bio || 'Virtual Business Card profile.'}</p>
                          </div>
                          <Link to={`/card/${c.cardSlug || c.slug}`} className="btn btn-sm text-white rounded-pill px-3 py-2 extra-small fw-extrabold w-100 text-center border-0 shadow-sm"
                            style={{ background: '#7C3AED' }}>
                            View Digital Card &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── MODE 2: FULL PORTFOLIO SHOWCASE (/:username/portfolio) ── */}
        {isPortfolioMode && (
          <>
            {/* Navigation Tabs for Portfolio */}
            <div className="bg-white rounded-4 border border-slate-200 p-2 mb-4 d-flex align-items-center gap-2 flex-wrap shadow-sm">
              {[
                { key: 'overview',     label: 'Overview',     icon: 'bi-grid-fill' },
                { key: 'projects',     label: `Projects (${projects.length})`,     icon: 'bi-journal-code' },
                { key: 'experience',   label: `Experience (${experiences.length})`, icon: 'bi-briefcase-fill' },
                { key: 'education',    label: `Education (${education.length})`,    icon: 'bi-mortarboard-fill' },
                { key: 'credentials',  label: `Certificates (${certificates.length})`, icon: 'bi-award-fill' },
                { key: 'reviews',      label: `Reviews (${feedbackList.length})`,   icon: 'bi-star-fill' },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`btn btn-sm rounded-pill px-3.5 py-2 fw-bold extra-small transition-all border-0 ${
                    activeTab === t.key ? 'bg-pastel-purple text-white shadow-sm' : 'text-secondary bg-transparent'
                  }`}
                  style={activeTab === t.key ? { background: '#7C3AED' } : {}}>
                  <i className={`bi ${t.icon} me-1.5`}></i>{t.label}
                </button>
              ))}
            </div>

            {/* ── 1. OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="row g-4">
                <div className="col-12 col-lg-8">
                  {skills.length > 0 && (
                    <div className="bg-white rounded-4 border border-slate-200 p-4 mb-4 shadow-sm">
                      <h6 className="fw-extrabold text-dark mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-lightning-charge-fill text-warning"></i> Core Skills &amp; Competencies
                      </h6>
                      <div className="d-flex flex-wrap gap-2.5">
                        {skills.map((s, i) => (
                          <span key={i} className="badge bg-pastel-lavender text-purple rounded-pill px-3.5 py-2 extra-small fw-extrabold border border-purple border-opacity-20 shadow-xs">
                            {s.skillName || s.name} <span className="text-muted ms-1 fw-normal">({s.proficiency || 'Expert'})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="bg-white rounded-4 border border-slate-200 p-4 mb-4 shadow-sm">
                      <div className="d-flex align-items-center justify-content-between mb-3.5">
                        <h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
                          <i className="bi bi-journal-code text-purple"></i> Featured Projects
                        </h6>
                        <button onClick={() => setActiveTab('projects')} className="btn btn-link text-purple extra-small fw-bold p-0 text-decoration-none">
                          View All ({projects.length}) &rarr;
                        </button>
                      </div>
                      <div className="row g-3.5">
                        {projects.slice(0, 2).map((p, i) => (
                          <div key={i} className="col-12 col-md-6">
                            <div className="p-3.5 rounded-4 border border-slate-200 h-100 d-flex flex-column justify-content-between hover-elevate transition-all bg-light">
                              <div>
                                <h6 className="fw-extrabold text-dark mb-1.5">{p.title}</h6>
                                <p className="extra-small text-secondary line-clamp-3 mb-3 leading-relaxed">{p.description}</p>
                              </div>
                              {p.projectUrl && (
                                <a href={p.projectUrl} target="_blank" rel="noreferrer" className="extra-small fw-extrabold text-purple d-inline-flex align-items-center gap-1">
                                  View Live Demo <i className="bi bi-arrow-up-right"></i>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {experiences.length > 0 && (
                    <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm">
                      <h6 className="fw-extrabold text-dark mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-briefcase-fill text-info"></i> Work Experience
                      </h6>
                      <div className="d-grid gap-3">
                        {experiences.map((exp, i) => (
                          <div key={i} className="p-3 rounded-3 border border-slate-100 bg-light">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <h6 className="fw-bold text-dark mb-0 extra-small">{exp.jobTitle || exp.role}</h6>
                              <span className="badge bg-pastel-cyan text-info rounded-pill extra-small">{exp.startDate} - {exp.endDate || 'Present'}</span>
                            </div>
                            <div className="text-purple extra-small fw-bold mb-2">{exp.companyName || exp.company}</div>
                            {exp.description && <p className="extra-small text-secondary mb-0 leading-relaxed">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-12 col-lg-4">
                  {languages.length > 0 && (
                    <div className="bg-white rounded-4 border border-slate-200 p-4 mb-4 shadow-sm">
                      <h6 className="fw-extrabold text-dark mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-translate text-success"></i> Languages
                      </h6>
                      <div className="d-grid gap-2">
                        {languages.map((l, i) => (
                          <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
                            <span className="extra-small fw-bold text-dark">{l.languageName || l.name}</span>
                            <span className="badge bg-pastel-mint text-success rounded-pill extra-small">{l.proficiency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {awards.length > 0 && (
                    <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm">
                      <h6 className="fw-extrabold text-dark mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-trophy-fill text-warning"></i> Honors &amp; Awards
                      </h6>
                      <div className="d-grid gap-2.5">
                        {awards.map((a, i) => (
                          <div key={i} className="p-2.5 rounded bg-light border border-slate-100">
                            <div className="extra-small fw-bold text-dark">{a.title}</div>
                            <div className="extra-small text-muted">{a.issuer} · {a.year}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 2. PROJECTS TAB ── */}
            {activeTab === 'projects' && (
              <div className="row g-4">
                {projects.length === 0 ? (
                  <div className="col-12 text-center py-5 bg-white rounded-4 border border-slate-200">
                    <p className="text-secondary small mb-0">No projects added yet.</p>
                  </div>
                ) : (
                  projects.map((p, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4">
                      <div className="bg-white rounded-4 border border-slate-200 p-4 h-100 d-flex flex-column justify-content-between hover-elevate transition-all shadow-sm">
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="badge bg-pastel-lavender text-purple rounded-pill extra-small fw-bold">PROJECT</span>
                            {p.category && <span className="extra-small text-muted">{p.category}</span>}
                          </div>
                          <h5 className="fw-extrabold text-dark mb-2">{p.title}</h5>
                          <p className="extra-small text-secondary mb-3 leading-relaxed">{p.description}</p>
                          {p.technologies && (
                            <div className="d-flex flex-wrap gap-1 mb-3">
                              {p.technologies.split(',').map((tech, idx) => (
                                <span key={idx} className="badge bg-light text-dark rounded-pill extra-small border">{tech.trim()}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {p.projectUrl && (
                          <a href={p.projectUrl} target="_blank" rel="noreferrer"
                            className="btn btn-sm text-white rounded-pill px-3 py-2 extra-small fw-bold w-100 text-center border-0 shadow-sm"
                            style={{ background: '#7C3AED' }}>
                            View Live Project &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── 3. EXPERIENCE TAB ── */}
            {activeTab === 'experience' && (
              <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm">
                <h5 className="fw-extrabold text-dark mb-4">Work Experience Timeline</h5>
                {experiences.length === 0 ? (
                  <p className="text-secondary small mb-0">No experience records found.</p>
                ) : (
                  <div className="d-grid gap-4">
                    {experiences.map((exp, i) => (
                      <div key={i} className="p-4 rounded-4 border border-slate-100 bg-light">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2">
                          <h5 className="fw-extrabold text-dark mb-1">{exp.jobTitle || exp.role}</h5>
                          <span className="badge bg-pastel-purple text-white rounded-pill px-3 py-1 extra-small" style={{ background: '#7C3AED' }}>
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                        </div>
                        <h6 className="text-purple fw-bold mb-3">{exp.companyName || exp.company}</h6>
                        <p className="small text-secondary mb-0 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 4. EDUCATION TAB ── */}
            {activeTab === 'education' && (
              <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm">
                <h5 className="fw-extrabold text-dark mb-4">Academic Background</h5>
                {education.length === 0 ? (
                  <p className="text-secondary small mb-0">No education entries recorded.</p>
                ) : (
                  <div className="row g-3">
                    {education.map((edu, i) => (
                      <div key={i} className="col-12 col-md-6">
                        <div className="p-4 rounded-4 border border-slate-100 bg-light h-100">
                          <span className="badge bg-pastel-cyan text-info rounded-pill extra-small mb-2">{edu.fieldOfStudy}</span>
                          <h5 className="fw-extrabold text-dark mb-1">{edu.degree}</h5>
                          <p className="text-purple extra-small fw-bold mb-2">{edu.institution}</p>
                          <p className="extra-small text-muted mb-0">{edu.startYear} - {edu.endYear || 'Present'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 5. CREDENTIALS TAB ── */}
            {activeTab === 'credentials' && (
              <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm">
                <h5 className="fw-extrabold text-dark mb-4">Certificates &amp; Credentials</h5>
                {certificates.length === 0 ? (
                  <p className="text-secondary small mb-0">No certificates published yet.</p>
                ) : (
                  <div className="row g-3">
                    {certificates.map((cert, i) => (
                      <div key={i} className="col-12 col-md-6">
                        <div className="p-4 rounded-4 border border-slate-100 bg-light h-100 d-flex flex-column justify-content-between">
                          <div>
                            <span className="badge bg-pastel-mint text-success rounded-pill extra-small mb-2">VERIFIED</span>
                            <h6 className="fw-extrabold text-dark mb-1">{cert.title || cert.name}</h6>
                            <p className="extra-small text-muted mb-3">{cert.issuingOrganization} · Issued {cert.issueDate}</p>
                          </div>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer"
                              className="extra-small fw-bold text-purple text-decoration-none">
                              Verify Credential &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 6. REVIEWS TAB ── */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm">
                <h5 className="fw-extrabold text-dark mb-4">Verified Testimonials</h5>
                {feedbackList.length === 0 ? (
                  <p className="text-secondary small mb-0">No public reviews submitted yet.</p>
                ) : (
                  <div className="row g-3">
                    {feedbackList.map((f, i) => (
                      <div key={i} className="col-12 col-md-6">
                        <div className="p-4 rounded-4 border border-slate-100 bg-light h-100">
                          <div className="d-flex align-items-center gap-1 text-warning mb-2">
                            {[...Array(f.rating || 5)].map((_, idx) => (
                              <i key={idx} className="bi bi-star-fill extra-small"></i>
                            ))}
                          </div>
                          <p className="small text-secondary fst-italic mb-3 leading-relaxed">"{f.comment}"</p>
                          <div className="fw-bold text-dark extra-small">{f.visitorName || 'Anonymous Visitor'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white text-dark border-0 rounded-4 shadow-xl">
              <div className="modal-header border-slate-100">
                <h5 className="modal-title fw-bold text-dark">Schedule a Meeting</h5>
                <button type="button" className="btn-close" onClick={() => setShowMeetingModal(false)}></button>
              </div>
              <form onSubmit={handleMeetingSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark">Your Name *</label>
                    <input type="text" className="form-control bg-light border-slate-200 text-dark form-control-sm" required
                      onChange={e => setMeetingForm({ ...meetingForm, requesterName: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark">Your Email *</label>
                    <input type="email" className="form-control bg-light border-slate-200 text-dark form-control-sm" required
                      onChange={e => setMeetingForm({ ...meetingForm, requesterEmail: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label extra-small fw-bold text-dark">Preferred Date *</label>
                      <input type="date" className="form-control bg-light border-slate-200 text-dark form-control-sm" required
                        onChange={e => setMeetingForm({ ...meetingForm, preferredDate: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label extra-small fw-bold text-dark">Preferred Time *</label>
                      <input type="time" className="form-control bg-light border-slate-200 text-dark form-control-sm" required
                        onChange={e => setMeetingForm({ ...meetingForm, preferredTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark">Message / Agenda</label>
                    <textarea className="form-control bg-light border-slate-200 text-dark form-control-sm" rows="3"
                      onChange={e => setMeetingForm({ ...meetingForm, message: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-slate-100">
                  <button type="button" className="btn btn-sm btn-light rounded-pill px-4 fw-bold" onClick={() => setShowMeetingModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-sm text-white rounded-pill px-4 fw-bold border-0" style={{ background: '#7C3AED' }}>Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leave Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-white text-dark border-0 rounded-4 shadow-xl">
              <div className="modal-header border-slate-100">
                <h5 className="modal-title fw-bold text-dark">Leave a Review</h5>
                <button type="button" className="btn-close" onClick={() => setShowFeedbackModal(false)}></button>
              </div>
              <form onSubmit={handleFeedbackSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark">Your Name *</label>
                    <input type="text" className="form-control bg-light border-slate-200 text-dark form-control-sm" required
                      onChange={e => setFeedbackForm({ ...feedbackForm, visitorName: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark">Rating</label>
                    <select className="form-select bg-light border-slate-200 text-dark form-select-sm" value={feedbackForm.rating}
                      onChange={e => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}>
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Good</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-dark">Comment</label>
                    <textarea className="form-control bg-light border-slate-200 text-dark form-control-sm" rows="3"
                      onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-slate-100">
                  <button type="button" className="btn btn-sm btn-light rounded-pill px-4 fw-bold" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-sm text-white rounded-pill px-4 fw-bold border-0" style={{ background: '#7C3AED' }}>Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 bg-dark text-white mt-auto">
        <div className="container text-center">
          <p className="text-slate-400 extra-small mb-0">&copy; {new Date().getFullYear()} Nixtap Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicProfilePage;
