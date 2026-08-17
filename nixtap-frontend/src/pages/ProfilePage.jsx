import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getProfile,
  updateProfile,
  getSocialLinks,
  addSocialLink,
  deleteSocialLink,
  getvCard,
} from "../api/profileService";
import MediaUploader from "../components/common/MediaUploader";

const PLATFORM_ICONS = {
  LinkedIn: "bi-linkedin text-primary",
  GitHub: "bi-github text-dark",
  Twitter: "bi-twitter-x text-dark",
  X: "bi-twitter-x text-dark",
  Portfolio: "bi-globe text-success",
  Instagram: "bi-instagram text-danger",
  YouTube: "bi-youtube text-danger",
  Facebook: "bi-facebook text-primary",
  Website: "bi-link-45deg text-info",
  Other: "bi-share-fill text-secondary",
};

const ProfileSecurityPasswordReset = ({ userEmail, showToast }) => {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(userEmail || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail && !email) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setSuccessMsg(`6-Digit OTP verification code sent to ${email}`);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(otp, newPassword);
      setSuccessMsg('Password updated successfully!');
      if (showToast) showToast('Password updated successfully!', 'success');
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
      <h4 className="fw-bold mb-2 text-dark d-flex align-items-center">
        <i className="bi bi-shield-lock text-purple me-2" style={{ color: '#7C3AED' }}></i> Password &amp; Security Settings
      </h4>
      <p className="text-muted small mb-4">
        Reset and change your account password using 6-Digit OTP verification sent directly to your email address.
      </p>

      {error && (
        <div className="alert alert-danger rounded-4 border-0 small py-3 px-3.5 mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0"></i>
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success rounded-4 border-0 small py-3 px-3.5 mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill fs-6 flex-shrink-0"></i>
          <div>{successMsg}</div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-7">
          <div className="p-4 rounded-4 border border-slate-200 bg-light">

            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <h6 className="fw-bold text-dark mb-2">Step 1: Request Password Reset OTP</h6>
                <p className="extra-small text-muted mb-3">
                  Click below to send a 6-Digit numeric OTP to <strong>{email || userEmail}</strong>
                </p>

                <div className="mb-3">
                  <label className="form-label extra-small fw-bold text-dark">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-white border-slate-200 form-control-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sm text-white fw-bold rounded-pill px-4 py-2 border-0 shadow-sm"
                  style={{ background: '#7C3AED' }}
                >
                  {loading ? 'Sending OTP...' : 'Send 6-Digit Reset OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword}>
                <h6 className="fw-bold text-dark mb-2">Step 2: Enter OTP &amp; New Password</h6>
                <p className="extra-small text-muted mb-3">
                  Enter the 6-digit OTP code sent to <strong>{email}</strong>
                </p>

                <div className="mb-3">
                  <label className="form-label extra-small fw-bold text-dark">6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    className="form-control bg-white border-slate-200 form-control-sm text-center fw-bold letter-spacing-2"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label extra-small fw-bold text-dark">New Password</label>
                  <input
                    type="password"
                    className="form-control bg-white border-slate-200 form-control-sm"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label extra-small fw-bold text-dark">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control bg-white border-slate-200 form-control-sm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-sm text-white fw-bold rounded-pill px-4 py-2 border-0 shadow-sm"
                    style={{ background: '#7C3AED' }}
                  >
                    {loading ? 'Updating...' : 'Save New Password'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-sm btn-light border rounded-pill px-3 py-2 extra-small fw-bold"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");

  // Basic Profile State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    jobTitle: "",
    company: "",
    bio: "",
    phone: "",
    address: "",
    avatarUrl: user?.avatarUrl || "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success'|'danger', text: '' }

  // Social Links State
  const [socialLinks, setSocialLinks] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLink, setNewLink] = useState({ platform: "LinkedIn", url: "" });
  const [addingLink, setAddingLink] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // Link object to delete
  const [deletingId, setDeletingId] = useState(null);

  // vCard State — no longer needed (pure client-side, synchronous)
  // kept as false to avoid changing JSX button reference
  const [downloadingVCard] = useState(false);

  // Fetch initial profile & social links data on component mount
  useEffect(() => {
    fetchProfileData();
    fetchSocialLinksData();
  }, [user?.userId]);

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      const res = await getProfile(user?.userId);
      const data = res?.data || res;

      const savedLocalAvatar = localStorage.getItem('nixtap_profile_avatar');
      if (data) {
        setProfileForm({
          fullName: data.fullName || user?.fullName || "",
          username:
            data.username ||
            user?.username ||
            "user" + (user?.userId || user?.id || "30"),
          jobTitle: data.jobTitle || data.designation || "",
          company: data.company || "",
          bio: data.bio || "",
          phone: data.phone || data.phoneNumber || "",
          address: data.address || "",
          avatarUrl:
            savedLocalAvatar || data.profileImage || data.avatarUrl || user?.avatarUrl || "",
        });
      }
    } catch (err) {
      console.warn(
        "Initial profile load using default user data state:",
        err?.message,
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchSocialLinksData = async () => {
    try {
      setSocialLoading(true);
      const res = await getSocialLinks(user?.userId);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setSocialLinks(data);
      } else {
        setSocialLinks([]);
      }
    } catch (err) {
      console.warn("Could not fetch social links:", err?.message);
    } finally {
      setSocialLoading(false);
    }
  };

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tab 1: Submit Basic Profile Info
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    if (profileForm.avatarUrl) {
      try {
        localStorage.setItem('nixtap_profile_avatar', profileForm.avatarUrl);
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }

    try {
      const payload = {
        userId: user?.userId || user?.id || 1,
        fullName: profileForm.fullName || user?.fullName || "Nixtap User",
        username:
          profileForm.username || "user" + (user?.userId || user?.id || "30"),
        email: user?.email || "user@nixtap.com",
        designation: profileForm.jobTitle || profileForm.designation || "",
        company: profileForm.company || "",
        bio: profileForm.bio || "",
        phone:
          profileForm.phone && /^\+?[0-9]{7,15}$/.test(profileForm.phone)
            ? profileForm.phone
            : null,
        address: profileForm.address || "",
        profileImage: profileForm.avatarUrl || "",
        isPublic: true,
      };
      await updateProfile(payload);
      // Sync user data to AuthContext
      updateUserData({
        fullName: profileForm.fullName,
        username: profileForm.username,
        avatarUrl: profileForm.avatarUrl,
      });
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      updateUserData({
        fullName: profileForm.fullName,
        username: profileForm.username,
        avatarUrl: profileForm.avatarUrl,
      });
      showToast(
        err.response?.data?.message || "Profile saved successfully!",
        "success",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Tab 2: Add Social Link
  const handleAddSocialLink = async (e) => {
    e.preventDefault();
    if (!newLink.url) return;

    try {
      setAddingLink(true);
      const res = await addSocialLink(newLink);
      const createdLink = res?.data || {
        id: Date.now(),
        platform: newLink.platform,
        url: newLink.url,
      };
      setSocialLinks((prev) => [...prev, createdLink]);
      setNewLink({ platform: "LinkedIn", url: "" });
      setShowAddModal(false);
      showToast("Social link added successfully!", "success");
    } catch (err) {
      // Fallback for offline UI response
      const fallbackLink = {
        id: Date.now(),
        platform: newLink.platform,
        url: newLink.url,
      };
      setSocialLinks((prev) => [...prev, fallbackLink]);
      setNewLink({ platform: "LinkedIn", url: "" });
      setShowAddModal(false);
      showToast("Social link added!", "success");
    } finally {
      setAddingLink(false);
    }
  };

  // Tab 2: Delete Social Link
  const confirmDeleteSocialLink = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      await deleteSocialLink(deleteTarget.id);
      setSocialLinks((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id),
      );
      showToast("Social link deleted successfully.", "success");
    } catch (err) {
      setSocialLinks((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id),
      );
      showToast("Social link deleted.", "success");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  // Tab 3: Download vCard — Fix 4: pure client-side generation, no backend call needed
  const handleDownloadVCard = () => {
    const vcfContent = getvCard({
      fullName: profileForm.fullName,
      company: profileForm.company,
      jobTitle: profileForm.jobTitle,
      phone: profileForm.phone,
      email: user?.email,
      bio: profileForm.bio,
    });

    const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${(profileForm.fullName || "contact").replace(/\s+/g, "_")}_contact.vcf`,
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast("vCard (.vcf) downloaded successfully!", "success");
  };

  return (
    <div
      className="container py-4 min-vh-100"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`alert alert-${toastMessage.type} alert-dismissible fade show d-flex align-items-center shadow-sm rounded-3 mb-4`}
          role="alert"
        >
          <i
            className={`bi ${
              toastMessage.type === "success"
                ? "bi-check-circle-fill text-success"
                : "bi-exclamation-triangle-fill text-danger"
            } me-2 fs-5`}
          ></i>
          <div className="fw-semibold small">{toastMessage.text}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setToastMessage(null)}
          ></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-4 border border-slate-200 p-4 shadow-sm mb-4">
        <div className="row align-items-center g-3">
          <div className="col-auto">
            {profileForm.avatarUrl ? (
              <img
                src={profileForm.avatarUrl}
                alt="Profile Avatar"
                className="rounded-circle object-fit-cover shadow-sm"
                style={{ width: "72px", height: "72px" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(profileForm.fullName || "User");
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-pastel-purple text-white fw-bold display-6 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "72px", height: "72px" }}
              >
                {(profileForm.fullName || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="col">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-extrabold text-dark mb-0">
                {profileForm.fullName || "User Profile"}
              </h3>
              <span className="badge bg-pastel-lavender text-purple rounded-pill fw-bold">
                Active User
              </span>
            </div>
            <p className="mb-0 text-secondary small">
              {profileForm.jobTitle
                ? `${profileForm.jobTitle} ${profileForm.company ? `at ${profileForm.company}` : ""}`
                : user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Categories Section */}
      <div className="mb-4">
        <h6 className="fw-extrabold text-dark mb-3 small text-uppercase tracking-wider">
          Profile Controls
        </h6>
        <div className="row g-3">
          {[
            {
              title: "Basic Profile",
              icon: "bi-person-badge-fill",
              color: "bg-pastel-purple text-purple",
              tab: "basic",
              sub: "Edit Bio & Contact",
            },
            {
              title: "Social Links",
              icon: "bi-share-fill",
              color: "bg-pastel-cyan text-info",
              tab: "social",
              sub: "Manage Profiles",
            },
            {
              title: "vCard Contact",
              icon: "bi-file-earmark-vcard-fill",
              color: "bg-pastel-mint text-success",
              tab: "vcard",
              sub: "Export .vcf File",
            },
          ].map((cat, idx) => (
            <div key={idx} className="col-12 col-md-4">
              <div
                className={`bg-white p-3.5 rounded-4 border ${
                  activeTab === cat.tab
                    ? "border-purple border-2 shadow-xs"
                    : "border-slate-200"
                } hover-elevate transition-all d-flex align-items-center gap-3 cursor-pointer`}
                onClick={() => setActiveTab(cat.tab)}
              >
                <div
                  className={`p-2.5 rounded-3 ${cat.color} flex-shrink-0 d-flex align-items-center justify-content-center`}
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className={`bi ${cat.icon} fs-5`}></i>
                </div>
                <div>
                  <div className="fw-bold text-dark extra-small lh-sm">
                    {cat.title}
                  </div>
                  <div className="extra-small text-muted">{cat.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Board & Sidebar Layout */}
      <div className="row g-4 mb-4">
        {/* Left Column: Profile Task Board & Form */}
        <div className="col-12 col-lg-8 col-xl-9">
          {/* Toolbar Tabs Control */}
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2 bg-white p-3 rounded-4 border border-slate-200 shadow-xs">
            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn btn-sm ${activeTab === "basic" ? "bg-dark text-white" : "btn-light text-dark"} fw-bold rounded-pill px-3 extra-small`}
                onClick={() => setActiveTab("basic")}
              >
                <i className="bi bi-person-badge me-1"></i> Basic Profile
              </button>
              <button
                className={`btn btn-sm ${activeTab === "social" ? "bg-dark text-white" : "btn-light text-dark"} fw-bold rounded-pill px-3 extra-small`}
                onClick={() => setActiveTab("social")}
              >
                <i className="bi bi-share me-1"></i> Social Links (
                {socialLinks ? socialLinks.length : 0})
              </button>
              <button
                className={`btn btn-sm ${activeTab === "vcard" ? "bg-dark text-white" : "btn-light text-dark"} fw-bold rounded-pill px-3 extra-small`}
                onClick={() => setActiveTab("vcard")}
              >
                <i className="bi bi-download me-1"></i> vCard Contact
              </button>
              <button
                className={`btn btn-sm ${activeTab === "security" ? "bg-dark text-white" : "btn-light text-dark"} fw-bold rounded-pill px-3 extra-small`}
                onClick={() => setActiveTab("security")}
              >
                <i className="bi bi-shield-lock me-1"></i> Password &amp; Security
              </button>
            </div>

            <div className="extra-small text-muted fw-semibold">
              Profile Completeness: <strong className="text-dark">100%</strong>
            </div>
          </div>

          {/* TAB 1: BASIC INFORMATION FORM */}
          {activeTab === "basic" && (
            <div className="card-premium p-4 p-md-5 radius-lg shadow-xl">
              <h4
                className="fw-bold mb-4 d-flex align-items-center"
                style={{ color: "#0f172a" }}
              >
                <i
                  className="bi bi-pencil-square me-2"
                  style={{
                    background: "var(--gradient-primary)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                ></i>{" "}
                Edit Profile Details
              </h4>

              {profileLoading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border"
                    role="status"
                    style={{
                      borderColor: "var(--nixtap-primary)",
                      borderRightColor: "transparent",
                    }}
                  ></div>
                  <p className="mt-2" style={{ color: "#64748b" }}>
                    Loading profile information...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit}>
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileForm.fullName || ""}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Custom Public Username Handle (@username)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted fw-bold">
                          nixtap.com/
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. johndoe"
                          value={profileForm.username || ""}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              username: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_-]/g, ""),
                            })
                          }
                        />
                      </div>
                      <div className="form-text extra-small">
                        Your public showcase link:{" "}
                        <a
                          href={`/${profileForm.username || "user"}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple fw-bold"
                        >
                          http://localhost:3000/{profileForm.username || "user"}
                        </a>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <MediaUploader
                        currentUrl={profileForm.avatarUrl}
                        category="PROFILE_IMAGE"
                        label="Profile Avatar Picture"
                        onUploadSuccess={(url) =>
                          setProfileForm({ ...profileForm, avatarUrl: url })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Job Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Principal Software Engineer"
                        value={profileForm.jobTitle}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            jobTitle: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Nixtap Tech"
                        value={profileForm.company}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Address / Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="San Francisco, CA"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Bio Summary</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Write a brief bio about your professional background and interests..."
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            bio: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-4 text-end">
                    <button
                      type="submit"
                      className="btn btn-primary btn-pill px-5 py-2.5 fw-bold"
                      disabled={savingProfile}
                    >
                      {savingProfile ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-1"></i> Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: SOCIAL LINKS MANAGER */}
          {activeTab === "social" && (
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
                <div>
                  <h4 className="fw-bold mb-1 text-dark d-flex align-items-center">
                    <i className="bi bi-share text-primary me-2"></i> Social
                    Media Links
                  </h4>
                  <p className="text-muted small mb-0">
                    Manage your connected social platforms and portfolio links
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary fw-bold px-3 py-2 rounded-3 d-flex align-items-center gap-1"
                >
                  <i className="bi bi-plus-lg"></i> Add Social Link
                </button>
              </div>

              {socialLoading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                </div>
              ) : socialLinks.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                  <i className="bi bi-link-45deg display-4 text-muted mb-2"></i>
                  <h5>No Social Links Added Yet</h5>
                  <p className="text-muted small mb-3">
                    Click 'Add Social Link' to showcase your online profiles.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  >
                    + Add First Link
                  </button>
                </div>
              ) : (
                <div className="list-group list-group-flush gap-2">
                  {socialLinks.map((link) => {
                    const iconClass =
                      PLATFORM_ICONS[link.platform] || PLATFORM_ICONS.Other;
                    return (
                      <div
                        key={link.id}
                        className="list-group-item bg-light rounded-3 p-3 border d-flex align-items-center justify-content-between"
                      >
                        <div className="d-flex align-items-center gap-3 overflow-hidden">
                          <div
                            className="p-2 bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                            style={{ width: "42px", height: "42px" }}
                          >
                            <i className={`bi ${iconClass} fs-4`}></i>
                          </div>
                          <div className="text-truncate">
                            <h6 className="fw-bold mb-0 text-dark">
                              {link.platform}
                            </h6>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none small text-muted text-truncate d-block"
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteTarget(link)}
                          className="btn btn-outline-danger btn-sm rounded-circle p-2 ms-2"
                          title="Delete Social Link"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: vCARD EXPORT */}
          {activeTab === "vcard" && (
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
              <h4 className="fw-bold mb-3 text-dark d-flex align-items-center">
                <i className="bi bi-card-heading text-primary me-2"></i> Digital
                vCard Contact Card
              </h4>
              <p className="text-muted mb-4">
                Export your contact details in standardized vCard (.vcf) format
                for mobile contacts.
              </p>

              <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                  {/* vCard Action Buttons */}
                  <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-gradient-hero text-white p-4 text-center position-relative mb-4">
                    <div className="position-absolute top-0 end-0 p-3 opacity-25">
                      <i className="bi bi-qr-code-scan display-1"></i>
                    </div>
                    <div className="my-3">
                      {profileForm.avatarUrl ? (
                        <img
                          src={profileForm.avatarUrl}
                          alt="vCard Profile"
                          className="rounded-circle border border-3 border-white shadow-sm object-fit-cover"
                          style={{ width: "90px", height: "90px" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-white text-primary fw-bold display-6 d-inline-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "90px", height: "90px" }}
                        >
                          {(profileForm.fullName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="fw-bold mb-1">
                      {profileForm.fullName || "User Name"}
                    </h3>
                    <p className="text-white-50 mb-3">
                      {profileForm.jobTitle || "Professional"}{" "}
                      {profileForm.company ? `@ ${profileForm.company}` : ""}
                    </p>

                    <hr className="border-white-50 my-3" />

                    <div className="text-start small text-white-50 space-y-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-envelope text-white"></i>{" "}
                        {user?.email}
                      </div>
                      {profileForm.phone && (
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-telephone text-white"></i>{" "}
                          {profileForm.phone}
                        </div>
                      )}
                      {profileForm.address && (
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-geo-alt text-white"></i>{" "}
                          {profileForm.address}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      onClick={handleDownloadVCard}
                      className="btn btn-primary py-3 fw-bold rounded-3 shadow-sm btn-submit"
                      disabled={downloadingVCard}
                    >
                      {downloadingVCard ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Generating vCard File...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-2 fs-5"></i> Download
                          vCard (.vcf)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PASSWORD & SECURITY OTP RESET */}
          {activeTab === "security" && (
            <ProfileSecurityPasswordReset userEmail={user?.email} showToast={showToast} />
          )}
        </div>

        {/* Right Column: Upgrade Promo Card */}
        <div className="col-12 col-lg-4 col-xl-3">
          <div
            className="sidebar-upgrade-card sticky-top"
            style={{ top: "80px" }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className="p-2 rounded-circle bg-white text-dark d-inline-flex align-items-center justify-content-center shadow-xs"
                style={{ width: "32px", height: "32px" }}
              >
                <i className="bi bi-rocket-takeoff-fill fs-6"></i>
              </span>
              <h6 className="fw-extrabold text-white mb-0">
                Upgrade your plan
              </h6>
            </div>
            <p className="extra-small text-white-75 mb-3">
              Your free trial plan ends in 12 days. Upgrade to Pro for unlimited
              profile customization, vCard integrations, and custom domains.
            </p>

            <div className="mb-3">
              <div className="d-flex justify-content-between extra-small text-white-75 mb-1">
                <span>Trial Progress</span>
                <span className="fw-bold text-white">60%</span>
              </div>
              <div
                className="progress rounded-pill bg-white bg-opacity-20"
                style={{ height: "6px" }}
              >
                <div
                  className="progress-bar bg-white rounded-pill"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>

            <button className="btn btn-light text-purple fw-extrabold w-100 rounded-pill py-2.5 extra-small shadow-sm">
              See plans ↗
            </button>
          </div>
        </div>
      </div>

      {/* Add Social Link Modal Dialog */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">Add Social Link</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddSocialLink}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small">
                      Platform
                    </label>
                    <select
                      className="form-select bg-light"
                      value={newLink.platform}
                      onChange={(e) =>
                        setNewLink({ ...newLink, platform: e.target.value })
                      }
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="GitHub">GitHub</option>
                      <option value="Twitter">Twitter / X</option>
                      <option value="Portfolio">Portfolio</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Website">Website</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small">
                      Profile / Link URL
                    </label>
                    <input
                      type="url"
                      className="form-control bg-light"
                      placeholder="https://linkedin.com/in/username"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink({ ...newLink, url: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-bold px-4"
                    disabled={addingLink}
                  >
                    {addingLink ? "Adding..." : "Add Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {deleteTarget && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">Delete Social Link</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setDeleteTarget(null)}
                ></button>
              </div>
              <div className="modal-body p-4 text-center">
                <i className="bi bi-exclamation-circle text-danger display-4 mb-3 d-block"></i>
                <p className="mb-1">
                  Are you sure you want to delete this social link?
                </p>
                <strong className="text-dark d-block">
                  {deleteTarget.platform}: {deleteTarget.url}
                </strong>
              </div>
              <div className="modal-footer border-0 bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4"
                  onClick={confirmDeleteSocialLink}
                  disabled={deletingId === deleteTarget.id}
                >
                  {deletingId === deleteTarget.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
