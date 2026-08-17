import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getThemes } from '../api/cardService';
import MediaUploader from './common/MediaUploader';

// Fix 12: field names now match BusinessCardRequest on the backend
// Backend fields: cardTitle, designation, company, theme (string name), slug,
//                 isPublic, profileImage, coverImage
// Removed from form: email, phone, address, bio, fullName
//   — those belong to UserProfile, not BusinessCard

const PRESET_THEMES = [
  { id: 1, name: 'midnight-indigo', label: 'Midnight Indigo', gradient: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' },
  { id: 2, name: 'emerald-luxe',    label: 'Emerald Luxe',    gradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' },
  { id: 3, name: 'sunset-bronze',   label: 'Sunset Bronze',   gradient: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)' },
  { id: 4, name: 'cyber-neon',      label: 'Cyber Neon',      gradient: 'linear-gradient(135deg, #ec4899 0%, #831843 100%)' },
  { id: 5, name: 'clean-slate',     label: 'Clean Slate',     gradient: 'linear-gradient(135deg, #475569 0%, #0f172a 100%)' },
];

const CardBuilder = ({ initialCard, onSave, onCancel }) => {
  const { user } = useAuth();
  const [themes, setThemes] = useState(PRESET_THEMES);

  // formData uses the exact field names expected by BusinessCardRequest
  const [formData, setFormData] = useState({
    cardTitle:    initialCard?.cardTitle    || 'My Primary Business Card',
    designation:  initialCard?.designation  || '',
    company:      initialCard?.company      || '',
    theme:        initialCard?.theme        || 'midnight-indigo',
    slug:         initialCard?.slug         || '',
    isPublic:     initialCard?.isPublic     !== undefined ? initialCard.isPublic : true,
    profileImage: initialCard?.profileImage || '',
    coverImage:   initialCard?.coverImage   || '',
    // preview-only fields (not sent to backend)
    _previewGradient: PRESET_THEMES[0].gradient,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchThemesData();
  }, []);

  const fetchThemesData = async () => {
    try {
      const res = await getThemes();
      const themeList = res?.data || res;
      if (Array.isArray(themeList) && themeList.length > 0) {
        // Map backend theme objects to preset shape
        const mapped = themeList.map((t) => ({
          id:       t.id,
          name:     t.slug || t.name,
          label:    t.name,
          gradient: t.gradient || PRESET_THEMES[0].gradient,
        }));
        setThemes(mapped);
      }
    } catch (err) {
      console.warn('Using default theme presets:', err?.message);
    }
  };

  const activeGradient =
    themes.find((t) => t.name === formData.theme)?.gradient ||
    PRESET_THEMES[0].gradient;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleThemeSelect = (theme) => {
    setFormData((prev) => ({
      ...prev,
      theme:            theme.name,
      _previewGradient: theme.gradient,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Strip internal preview fields before sending to backend
      const { _previewGradient, ...backendPayload } = formData;
      await onSave(backendPayload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
      <div className="card-header bg-dark text-white p-4 border-0 d-flex align-items-center justify-content-between">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-palette-fill text-primary"></i> Digital Card Builder & Theme Engine
          </h4>
          <p className="text-white-50 small mb-0">Design your personalized NFC business card with real-time preview</p>
        </div>
        <button type="button" className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={onCancel}>
          <i className="bi bi-x-lg me-1"></i> Close
        </button>
      </div>

      <div className="card-body p-4 p-lg-5">
        <div className="row g-5">
          {/* LEFT PANEL: CONTROLS & INPUTS */}
          <div className="col-12 col-lg-7">
            <form onSubmit={handleSubmit}>

              {/* ── Section 1: Card Identity ──────────────────────────────── */}
              <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">1. Card Identification</h5>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">
                  Card Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="cardTitle"
                  className="form-control bg-light"
                  placeholder="e.g. Executive Networking Card"
                  value={formData.cardTitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small">
                  Slug <span className="text-muted">(optional — auto-generated if blank)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  className="form-control bg-light"
                  placeholder="e.g. john-doe-exec  (lowercase, hyphens only)"
                  value={formData.slug}
                  onChange={handleChange}
                  pattern="[a-z0-9-]*"
                  title="Only lowercase letters, numbers, and hyphens"
                />
              </div>

              {/* ── Section 2: Professional Details ──────────────────────── */}
              <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">2. Professional Details</h5>
              <div className="row g-3 mb-4">

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Designation / Job Title</label>
                  <input
                    type="text"
                    name="designation"
                    className="form-control bg-light"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Company / Organisation</label>
                  <input
                    type="text"
                    name="company"
                    className="form-control bg-light"
                    placeholder="e.g. Nixtap Global"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                {/* Profile image — maps to businessCard.profileImage */}
                <div className="col-12 col-md-6">
                  <MediaUploader
                    currentUrl={formData.profileImage}
                    category="PROFILE_IMAGE"
                    label="Card Profile Picture"
                    onUploadSuccess={(url) =>
                      setFormData((prev) => ({ ...prev, profileImage: url }))
                    }
                  />
                </div>

                {/* Cover image — maps to businessCard.coverImage */}
                <div className="col-12 col-md-6">
                  <MediaUploader
                    currentUrl={formData.coverImage}
                    category="COVER_IMAGE"
                    label="Card Cover / Banner Image"
                    onUploadSuccess={(url) =>
                      setFormData((prev) => ({ ...prev, coverImage: url }))
                    }
                  />
                </div>

                {/* isPublic toggle */}
                <div className="col-12">
                  <div className="form-check form-switch p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                    <div>
                      <label className="form-check-label fw-bold text-dark d-block mb-0" htmlFor="isPublicToggle">
                        Make Card Publicly Visible
                      </label>
                      <span className="extra-small text-muted">
                        Public cards are accessible via NFC tap and QR scan without login
                      </span>
                    </div>
                    <input
                      className="form-check-input ms-0 fs-4"
                      type="checkbox"
                      role="switch"
                      id="isPublicToggle"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="alert alert-info py-2 small rounded-3 mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-info-circle-fill"></i>
                    <span>
                      Contact details (email, phone, bio) are managed on your{' '}
                      <strong>Profile page</strong> and shown automatically on your public card.
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Theme ─────────────────────────────────────── */}
              <h5 className="fw-bold mb-3 text-dark border-bottom pb-2">3. Theme & Colour Scheme</h5>
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small">Select Card Theme Preset</label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 border-2 ${
                        formData.theme === theme.name ? 'btn-dark fw-bold' : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleThemeSelect(theme)}
                    >
                      <span
                        className="rounded-circle d-inline-block border"
                        style={{ width: '16px', height: '16px', background: theme.gradient }}
                      ></span>
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary fw-bold px-5 py-2 rounded-3" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving Card...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-1"></i> Save Card
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT PANEL: LIVE MOBILE PREVIEW */}
          <div className="col-12 col-lg-5 d-flex flex-column align-items-center">
            <div className="sticky-top" style={{ top: '90px', width: '100%', maxWidth: '340px' }}>
              <div className="text-center mb-2">
                <span className="badge bg-dark text-white rounded-pill px-3 py-1.5 fw-semibold small">
                  <i className="bi bi-phone me-1"></i> Real-time Mobile Preview
                </span>
              </div>

              <div
                className="card border-0 shadow-2xl rounded-5 overflow-hidden position-relative border-4 border-dark"
                style={{ height: '520px', background: activeGradient }}
              >
                <div className="position-absolute top-0 start-50 translate-middle-x bg-dark rounded-bottom-4 px-3 py-1 z-3">
                  <div className="bg-secondary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                </div>

                <div className="card-body p-4 d-flex flex-column justify-content-between text-white text-center pt-5 h-100 overflow-y-auto">
                  <div>
                    <div className="my-3">
                      {formData.profileImage ? (
                        <img
                          src={formData.profileImage}
                          alt="Preview"
                          className="rounded-circle border border-3 border-white shadow-lg object-fit-cover"
                          style={{ width: '90px', height: '90px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://ui-avatars.com/api/?name=' +
                              encodeURIComponent(formData.cardTitle || 'Card');
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-white text-dark fw-bold display-6 d-inline-flex align-items-center justify-content-center shadow-lg"
                          style={{ width: '90px', height: '90px' }}
                        >
                          {(user?.fullName || formData.cardTitle || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h4 className="fw-bold mb-1">{user?.fullName || 'Full Name'}</h4>
                    <p className="small text-white-75 mb-1">{formData.designation || 'Designation'}</p>
                    <p className="extra-small text-white-50 fw-semibold">
                      {formData.company || 'Company'}
                    </p>
                  </div>

                  <div className="my-3">
                    <div className="d-grid gap-2">
                      <button className="btn btn-light btn-sm fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-telephone-fill text-primary"></i> Save Contact (.vcf)
                      </button>
                      <div className="row g-2">
                        <div className="col-6">
                          <button className="btn btn-outline-light btn-sm w-100 rounded-pill">
                            <i className="bi bi-envelope"></i> Email
                          </button>
                        </div>
                        <div className="col-6">
                          <button className="btn btn-outline-light btn-sm w-100 rounded-pill">
                            <i className="bi bi-telephone"></i> Call
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-top border-white-20 text-white-50 extra-small d-flex align-items-center justify-content-between">
                    <span>Powered by Nixtap NFC</span>
                    <i className="bi bi-nfc fs-5 text-white"></i>
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

export default CardBuilder;
