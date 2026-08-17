import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

const features = [
  {
    icon: 'bi-credit-card-2-front-fill',
    title: 'Fun & Smart Digital Cards',
    tag: '#easy',
    tagBg: '#EDE9FE',
    tagColor: '#6D28D9',
    cardBg: '#EDE9FE',
    cardBorder: '#DDD6FE',
    description: 'Design beautiful, interactive digital cards with custom themes, photos, and social handles in seconds.',
  },
  {
    icon: 'bi-hand-index-thumb-fill',
    title: 'NFC Contact Tap Sharing',
    tag: '#fast',
    tagBg: '#DDD6FE',
    tagColor: '#5B21B6',
    cardBg: '#7C3AED',
    cardColor: '#FFFFFF',
    description: 'Tap your NFC card onto any modern phone to instantly share contact info, portfolio links, and socials.',
  },
  {
    icon: 'bi-qr-code-scan',
    title: 'Instant QR Scan Code',
    tag: '#enjoy',
    tagBg: '#FEF08A',
    tagColor: '#854D0E',
    cardBg: '#FDE047',
    cardColor: '#1E293B',
    description: 'Every profile gets an auto-generated QR code. Print it on resumes, badges, or presentations effortlessly.',
  },
  {
    icon: 'bi-graph-up-arrow',
    title: 'Real-Time Engagement Stats',
    tag: '#smart',
    tagBg: '#E0E7FF',
    tagColor: '#3730A3',
    cardBg: '#F1F5F9',
    cardColor: '#0F172A',
    description: 'Track how many people view your card, scan your QR code, or click on your portfolio and social channels.',
  },
  {
    icon: 'bi-calendar-check-fill',
    title: 'One-Click Meeting Booking',
    tag: '#connect',
    tagBg: '#FCE7F3',
    tagColor: '#9D174D',
    cardBg: '#FBCFE8',
    cardColor: '#831843',
    description: 'Let prospects schedule meetings directly from your public profile card without back-and-forth emails.',
  },
  {
    icon: 'bi-journal-code',
    title: 'Complete Showcase Portfolio',
    tag: '#showcase',
    tagBg: '#DCFCE7',
    tagColor: '#166534',
    cardBg: '#BBF7D0',
    cardColor: '#14532D',
    description: 'Turn your profile into a mini portfolio website with projects, experiences, skills, certificates, and resumes.',
  },
];

const shareSteps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Sign up in under 30 seconds and set up your personal public handle (@username).',
  },
  {
    step: '02',
    title: 'Customize Your Content',
    description: 'Add your photo, role, company, social links, portfolio projects, and downloadable resume.',
  },
  {
    step: '03',
    title: 'Tap or Scan to Share',
    description: 'Share via NFC tap, scannable QR code, or direct public link across any platform.',
  },
  {
    step: '04',
    title: 'Track & Grow',
    description: 'Monitor live visitor analytics, receive meeting bookings, and collect 5-star feedback reviews.',
  },
];

const testimonials = [
  {
    name: 'Kristin Watson',
    role: 'Product Designer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    quote: 'Nixtap replaced my paper cards completely! One tap at events and people are immediately blown away by my clean portfolio.',
  },
  {
    name: 'Jenny Wilson',
    role: 'Creative Director',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    quote: 'The white playful aesthetic and instantaneous NFC tap sharing make networking super fun and memorable.',
  },
  {
    name: 'Jacob Jones',
    role: 'Lead Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    quote: 'Being able to see live scan statistics and receive direct meeting bookings from my QR card changed how I close deals.',
  },
  {
    name: 'Savannah Nguyen',
    role: 'Engineering Lead',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    quote: 'My entire resume, projects, and feedback live on one smart link (@username). It is the ultimate digital identity.',
  },
];

const Home = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-white text-dark" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <PublicNavbar />

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="py-5 position-relative overflow-hidden bg-white">
        <div className="container py-lg-5 text-center position-relative" style={{ zIndex: 1 }}>
          
          {/* Floating Badge */}
          <div className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-pastel-lavender text-purple fw-bold small mb-4 shadow-sm">
            <span className="rounded-circle p-1 bg-purple text-white d-inline-flex" style={{ background: '#7C3AED' }}>
              <i className="bi bi-stars fs-6"></i>
            </span>
            <span>The best place to share and connect for professionals</span>
          </div>

          {/* Main Hero Headline with Playful Highlight */}
          <h1 className="display-3 fw-extrabold text-dark mb-4 tracking-tight" style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", lineHeight: 1.15 }}>
            The best place to <br className="d-none d-md-block" />
            <span className="position-relative d-inline-block px-3 py-1 me-2 rounded-4 text-purple" 
              style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED', transform: 'rotate(-2deg)' }}>
              learn
            </span>
            and
            <span className="position-relative d-inline-block px-3 py-1 ms-2 rounded-4 text-warning" 
              style={{ background: 'rgba(234, 179, 8, 0.18)', color: '#D97706', transform: 'rotate(2deg)' }}>
              grow
            </span>
            <br />
            your brand
          </h1>

          {/* Subtitle */}
          <p className="lead text-secondary mx-auto mb-5" style={{ maxWidth: '640px', fontSize: '1.15rem' }}>
            Discover interactive digital business cards, instant NFC tap sharing, full portfolio showcases, and real-time scan analytics.
          </p>

          {/* CTA Buttons */}
          <div className="d-flex align-items-center justify-content-center gap-3 mb-5">
            <Link
              to="/register"
              className="btn btn-lg text-white fw-bold rounded-pill px-5 py-3 shadow-md d-inline-flex align-items-center gap-2 border-0 transition-all hover-scale"
              style={{ background: '#7C3AED' }}
            >
              <span>Get started</span>
              <div className="rounded-circle bg-white text-purple d-flex align-items-center justify-content-center ms-1" style={{ width: '28px', height: '28px', color: '#7C3AED' }}>
                <i className="bi bi-arrow-up-right fs-6"></i>
              </div>
            </Link>

            <a
              href="#features"
              className="btn btn-lg btn-outline-dark fw-bold rounded-pill px-4 py-3 d-inline-flex align-items-center gap-2"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Decorative Playful Blobs / Tags */}
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mt-4">
            <span className="badge rounded-pill px-3 py-2 fw-bold text-purple" style={{ background: '#EDE9FE' }}>#smart</span>
            <span className="badge rounded-pill px-3 py-2 fw-bold text-amber" style={{ background: '#FEF08A', color: '#854D0E' }}>#fast</span>
            <span className="badge rounded-pill px-3 py-2 fw-bold text-pink" style={{ background: '#FCE7F3', color: '#9D174D' }}>#enjoy</span>
          </div>

        </div>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────────────────────────── */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-lg-4">
          
          <div className="text-center mb-5">
            <h2 className="display-5 fw-extrabold text-dark mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Our <span style={{ color: '#7C3AED', fontStyle: 'italic' }}>interactive</span> features
            </h2>
            <p className="text-secondary small fw-semibold">Everything you need to showcase your digital card & portfolio</p>
          </div>

          <div className="row g-4">
            {features.map((feat, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-4">
                <div className="h-100 p-4 p-xl-5 rounded-5 border-0 shadow-sm d-flex flex-column justify-content-between transition-all hover-translate-y"
                  style={{ background: feat.cardBg, color: feat.cardColor || '#1E293B' }}>
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="rounded-4 p-3 d-inline-flex align-items-center justify-content-center"
                        style={{ background: 'rgba(255,255,255,0.6)', width: '56px', height: '56px' }}>
                        <i className={`bi ${feat.icon} fs-3`} style={{ color: feat.cardColor === '#FFFFFF' ? '#7C3AED' : '#4C1D95' }}></i>
                      </div>
                      <span className="badge rounded-pill px-3 py-1.5 fw-bold" style={{ background: feat.tagBg, color: feat.tagColor }}>
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="fw-extrabold fs-4 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {feat.title}
                    </h3>
                    <p className="small opacity-85 leading-relaxed mb-0">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── MISSION / HIGHLIGHT BANNER ───────────────────────────────────── */}
      <section className="py-5 text-white position-relative" style={{ background: '#7C3AED' }}>
        <div className="container py-lg-5 text-center">
          <div className="mx-auto" style={{ maxWidth: '820px' }}>
            <h2 className="display-4 fw-extrabold mb-4 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>
              We aim to help professionals <br />
              <span className="fst-italic text-warning">discover the joy</span> of creative <br />
              networking and personal branding.
            </h2>

            {/* Team Avatars */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 mt-5">
              {testimonials.map((t, i) => (
                <div key={i} className="text-center">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="rounded-circle border border-3 border-white shadow-sm mb-2"
                    style={{ width: '72px', height: '72px', objectFit: 'cover' }}
                  />
                  <div className="fw-extrabold small text-white">{t.name}</div>
                  <div className="extra-small opacity-75 text-white">{t.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────────────────── */}
      <section id="how" className="py-5 bg-white">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-extrabold text-dark mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              How <span style={{ color: '#7C3AED', fontStyle: 'italic' }}>Nixtap</span> Works
            </h2>
            <p className="text-secondary small fw-semibold">Four simple steps to transform your professional networking</p>
          </div>

          <div className="row g-4">
            {shareSteps.map((step, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-3">
                <div className="p-4 rounded-5 border border-slate-200 bg-light h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="display-4 fw-extrabold mb-3 text-purple" style={{ color: '#7C3AED', fontFamily: "'Outfit', sans-serif" }}>
                      {step.step}
                    </div>
                    <h4 className="fw-extrabold text-dark fs-5 mb-2">{step.title}</h4>
                    <p className="text-secondary small mb-0 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / REVIEWS SECTION ───────────────────────────────── */}
      <section id="testimonials" className="py-5 bg-light">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-extrabold text-dark mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Read our <span style={{ color: '#7C3AED', fontStyle: 'italic' }}>reviews</span>
            </h2>
            <p className="text-secondary small fw-semibold">Loved by creators, engineers, and executives</p>
          </div>

          <div className="row g-4">
            {testimonials.map((item, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-3">
                <div className="p-4 rounded-5 border-0 shadow-sm bg-white h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-1 mb-3 text-warning">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill fs-6"></i>
                      ))}
                    </div>
                    <p className="text-secondary small mb-4 fst-italic leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="d-flex align-items-center gap-3 pt-3 border-top border-slate-100">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="rounded-circle border"
                      style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-extrabold text-dark small">{item.name}</div>
                      <div className="extra-small text-muted">{item.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-4 bg-white border-top border-slate-200">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-secondary small">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-extrabold text-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>Nixtap.</span>
            <span>© 2026 Nixtap Inc. All rights reserved.</span>
          </div>
          <div className="d-flex align-items-center gap-4 fw-semibold">
            <a href="#features" className="text-secondary hover-text-dark text-decoration-none">Features</a>
            <a href="#how" className="text-secondary hover-text-dark text-decoration-none">How It Works</a>
            <Link to="/login" className="text-purple hover-text-dark text-decoration-none fw-bold" style={{ color: '#7C3AED' }}>Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
