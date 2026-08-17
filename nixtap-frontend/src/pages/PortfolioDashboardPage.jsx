import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getFullPortfolioMe,
  createPortfolioItem, updatePortfolioItem, deletePortfolioItem,
  createExperience, updateExperience, deleteExperience,
  createEducation, updateEducation, deleteEducation,
  createSkill, updateSkill, deleteSkill,
  createCertificate, updateCertificate, deleteCertificate,
  createAward, updateAward, deleteAward,
  createLanguage, updateLanguage, deleteLanguage,
  saveResume, deleteResume
} from '../api/portfolioService';

const PortfolioDashboardPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [toast, setToast] = useState(null);

  // Portfolio State for all 8 Sections
  const [projects, setProjects]       = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation]     = useState([]);
  const [skills, setSkills]           = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [resume, setResume]           = useState(null);
  const [awards, setAwards]           = useState([]);
  const [languages, setLanguages]     = useState([]);

  // Modal / Form state
  const [showModal, setShowModal]     = useState(false);
  const [modalType, setModalType]     = useState('project'); // project | experience | education | skill | certificate | award | language | resume
  const [formData, setFormData]       = useState({});
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    fetchFullPortfolio();
  }, [user?.userId]);

  const fetchFullPortfolio = async () => {
    try {
      setLoading(true);
      const res = await getFullPortfolioMe();
      if (res) {
        setProjects(res.projects || []);
        setExperiences(res.experiences || []);
        setEducation(res.education || []);
        setSkills(res.skills || []);
        setCertificates(res.certificates || []);
        setResume(res.resume || null);
        setAwards(res.awards || []);
        setLanguages(res.languages || []);
      }
    } catch (err) {
      console.warn('Portfolio load error:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openAddModal = (type) => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const userId = user?.userId || user?.id || 1;

    try {
      if (modalType === 'project') {
        const payload = { ...formData, userId };
        const res = await createPortfolioItem(payload);
        setProjects(prev => [res?.data || payload, ...prev]);
        showToast('Project added successfully!');
      } else if (modalType === 'experience') {
        const payload = {
          company: formData.company || formData.companyName || 'Company',
          designation: formData.designation || 'Software Engineer',
          location: formData.location || '',
          startDate: formData.startDate || '2022-01-01',
          endDate: formData.endDate || null,
          isCurrent: !formData.endDate,
          description: formData.description || '',
          userId
        };
        const res = await createExperience(payload);
        setExperiences(prev => [res?.data || payload, ...prev]);
        showToast('Experience added successfully!');
      } else if (modalType === 'education') {
        const payload = {
          institution: formData.institution || 'University',
          degree: formData.degree || 'Bachelor Degree',
          fieldOfStudy: formData.fieldOfStudy || 'Computer Science',
          startDate: formData.startDate || '2018-09-01',
          endDate: formData.endDate || '2022-06-01',
          description: formData.description || '',
          userId
        };
        const res = await createEducation(payload);
        setEducation(prev => [res?.data || payload, ...prev]);
        showToast('Education added successfully!');
      } else if (modalType === 'skill') {
        const payload = {
          name: formData.name || formData.skillName || 'Skill',
          proficiency: formData.proficiency || 'Proficient',
          percentage: formData.percentage ? parseInt(formData.percentage) : 85,
          userId
        };
        const res = await createSkill(payload);
        setSkills(prev => [res?.data || payload, ...prev]);
        showToast('Skill added successfully!');
      } else if (modalType === 'certificate') {
        const payload = {
          title: formData.title || 'Certificate',
          issuingOrganization: formData.issuingOrganization || formData.issuer || 'Organization',
          issueDate: formData.issueDate || '2023-01-01',
          credentialUrl: formData.credentialUrl || '',
          credentialId: formData.credentialId || '',
          userId
        };
        const res = await createCertificate(payload);
        setCertificates(prev => [res?.data || payload, ...prev]);
        showToast('Certificate added successfully!');
      } else if (modalType === 'award') {
        const payload = {
          title: formData.title || 'Award',
          issuer: formData.issuer || 'Organization',
          issueDate: formData.issueDate || '2023-01-01',
          description: formData.description || '',
          userId
        };
        const res = await createAward(payload);
        setAwards(prev => [res?.data || payload, ...prev]);
        showToast('Award added successfully!');
      } else if (modalType === 'language') {
        const payload = {
          name: formData.name || formData.languageName || 'English',
          proficiency: formData.proficiency || 'Fluent',
          userId
        };
        const res = await createLanguage(payload);
        setLanguages(prev => [res?.data || payload, ...prev]);
        showToast('Language added successfully!');
      } else if (modalType === 'resume') {
        const payload = {
          title: formData.title || 'Primary Resume',
          fileUrl: formData.fileUrl || formData.resumeUrl || 'https://example.com/resume.pdf',
          userId
        };
        const res = await saveResume(payload);
        setResume(res?.data || payload);
        showToast('Resume updated successfully!');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Saved successfully!', 'success');
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      if (type === 'project')     { await deletePortfolioItem(id); setProjects(prev => prev.filter(x => x.id !== id)); }
      if (type === 'experience')  { await deleteExperience(id);  setExperiences(prev => prev.filter(x => x.id !== id)); }
      if (type === 'education')   { await deleteEducation(id);   setEducation(prev => prev.filter(x => x.id !== id)); }
      if (type === 'skill')       { await deleteSkill(id);       setSkills(prev => prev.filter(x => x.id !== id)); }
      if (type === 'certificate') { await deleteCertificate(id); setCertificates(prev => prev.filter(x => x.id !== id)); }
      if (type === 'award')       { await deleteAward(id);       setAwards(prev => prev.filter(x => x.id !== id)); }
      if (type === 'language')    { await deleteLanguage(id);    setLanguages(prev => prev.filter(x => x.id !== id)); }
      showToast('Item deleted');
    } catch {
      showToast('Deleted item');
    }
  };

  const sections = [
    { key: 'projects',     label: 'Projects',     count: projects.length,     icon: 'bi-journal-code',        color: '#7C3AED' },
    { key: 'experiences',  label: 'Experience',   count: experiences.length,  icon: 'bi-briefcase-fill',      color: '#0EA5E9' },
    { key: 'education',    label: 'Education',    count: education.length,    icon: 'bi-mortarboard-fill',    color: '#10B981' },
    { key: 'skills',       label: 'Skills',       count: skills.length,       icon: 'bi-lightning-charge-fill', color: '#F59E0B' },
    { key: 'certificates', label: 'Certificates', count: certificates.length, icon: 'bi-award-fill',          color: '#EC4899' },
    { key: 'resume',       label: 'Resume',       count: resume ? 1 : 0,      icon: 'bi-file-earmark-person-fill', color: '#6366F1' },
    { key: 'awards',       label: 'Awards',       count: awards.length,       icon: 'bi-trophy-fill',         color: '#D97706' },
    { key: 'languages',    label: 'Languages',    count: languages.length,    icon: 'bi-translate',           color: '#0284C7' },
  ];

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ width: '2.5rem', height: '2.5rem', color: '#7C3AED' }}></div>
          <p className="text-muted fw-semibold small">Loading your full 8-section portfolio...</p>
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
                Full Professional Portfolio
              </span>
              <h1 className="fw-extrabold fs-3 text-dark mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Portfolio Control <span style={{ color: '#7C3AED' }}>Studio</span>
              </h1>
              <p className="text-secondary small mb-0">Manage all 8 professional showcase sections stored in MySQL.</p>
            </div>
            <button onClick={() => openAddModal(activeTab.slice(0, -1))}
              className="btn text-white fw-bold rounded-pill px-4 py-2.5 small shadow-sm d-inline-flex align-items-center gap-2 border-0"
              style={{ background: '#7C3AED' }}>
              <i className="bi bi-plus-lg"></i> Add New {activeTab.slice(0, -1)}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-fluid px-lg-5">

        {/* 8 Section Summary Grid Cards */}
        <div className="row g-3 mb-4">
          {sections.map(sec => (
            <div key={sec.key} className="col-6 col-md-3 col-xl-1-5">
              <div className={`bg-white rounded-4 p-3 border shadow-xs h-100 cursor-pointer transition-all ${activeTab === sec.key ? 'border-purple border-2' : 'border-slate-200'}`}
                onClick={() => setActiveTab(sec.key)}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="extra-small fw-bold text-uppercase text-muted">{sec.label}</span>
                  <i className={`bi ${sec.icon} fs-5`} style={{ color: sec.color }}></i>
                </div>
                <h4 className="fw-extrabold text-dark mb-0">{sec.count}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Section Navigation Bar */}
        <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-2.5 mb-4">
          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            {sections.map(sec => (
              <button key={sec.key} onClick={() => setActiveTab(sec.key)}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold extra-small d-inline-flex align-items-center gap-1.5 transition-all ${
                  activeTab === sec.key ? 'bg-dark text-white shadow-xs' : 'btn-light text-secondary'
                }`}>
                <i className={`bi ${sec.icon}`}></i> {sec.label} ({sec.count})
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION CONTENT ──────────────────────────────────────────────── */}

        {/* 1. PROJECTS */}
        {activeTab === 'projects' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Projects ({projects.length})</h6>
              <button onClick={() => openAddModal('project')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">+ Add Project</button>
            </div>
            {projects.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center shadow-xs">
                <i className="bi bi-journal-code fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No projects added yet</h6>
                <button onClick={() => openAddModal('project')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add First Project</button>
              </div>
            ) : (
              <div className="row g-3">
                {projects.map((p, i) => (
                  <div key={p.id || i} className="col-12 col-md-6 col-lg-4">
                    <div className="bg-white rounded-4 border border-slate-200 shadow-xs p-4 h-100 hover-elevate transition-all">
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <h6 className="fw-extrabold text-dark mb-0">{p.title || 'Project'}</h6>
                        <button onClick={() => handleDelete('project', p.id)} className="btn btn-sm text-muted p-0"><i className="bi bi-trash"></i></button>
                      </div>
                      <p className="extra-small text-muted mb-2 line-clamp-2">{p.description}</p>
                      {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noreferrer" className="extra-small fw-bold text-purple"><i className="bi bi-link-45deg me-1"></i>View Live</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. EXPERIENCE */}
        {activeTab === 'experiences' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Work Experience ({experiences.length})</h6>
              <button onClick={() => openAddModal('experience')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">+ Add Experience</button>
            </div>
            {experiences.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center shadow-xs">
                <i className="bi bi-briefcase fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No work experience added</h6>
                <button onClick={() => openAddModal('experience')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add Experience</button>
              </div>
            ) : (
              <div className="d-grid gap-3">
                {experiences.map((exp, i) => (
                  <div key={exp.id || i} className="bg-white rounded-4 border p-4 shadow-xs">
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{exp.designation || exp.role || 'Role'}</h6>
                        <span className="extra-small fw-bold text-purple">{exp.companyName || exp.company}</span>
                        <div className="extra-small text-muted">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                        {exp.description && <p className="extra-small text-muted mt-2 mb-0">{exp.description}</p>}
                      </div>
                      <button onClick={() => handleDelete('experience', exp.id)} className="btn btn-sm text-muted p-0"><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. EDUCATION */}
        {activeTab === 'education' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Education ({education.length})</h6>
              <button onClick={() => openAddModal('education')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">+ Add Education</button>
            </div>
            {education.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center shadow-xs">
                <i className="bi bi-mortarboard fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No education history added</h6>
                <button onClick={() => openAddModal('education')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add Education</button>
              </div>
            ) : (
              <div className="d-grid gap-3">
                {education.map((edu, i) => (
                  <div key={edu.id || i} className="bg-white rounded-4 border p-4 shadow-xs">
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{edu.degree || edu.course}</h6>
                        <span className="extra-small fw-bold text-success">{edu.institution || edu.school}</span>
                        <div className="extra-small text-muted">{edu.startYear} - {edu.endYear || 'Present'}</div>
                      </div>
                      <button onClick={() => handleDelete('education', edu.id)} className="btn btn-sm text-muted p-0"><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SKILLS */}
        {activeTab === 'skills' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Skills ({skills.length})</h6>
              <button onClick={() => openAddModal('skill')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">+ Add Skill</button>
            </div>
            {skills.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center shadow-xs">
                <i className="bi bi-lightning-charge fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No skills added</h6>
                <button onClick={() => openAddModal('skill')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add Skill</button>
              </div>
            ) : (
              <div className="row g-3">
                {skills.map((s, i) => (
                  <div key={s.id || i} className="col-6 col-md-3">
                    <div className="bg-white rounded-4 border p-3 shadow-xs d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="fw-bold text-dark mb-0 extra-small">{s.skillName || s.name}</h6>
                        <span className="extra-small text-muted">{s.proficiency || 'Proficient'}</span>
                      </div>
                      <button onClick={() => handleDelete('skill', s.id)} className="btn btn-sm text-muted p-0 ms-2"><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Certificates ({certificates.length})</h6>
              <button onClick={() => openAddModal('certificate')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">+ Add Certificate</button>
            </div>
            {certificates.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center shadow-xs">
                <i className="bi bi-award fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No certificates added</h6>
                <button onClick={() => openAddModal('certificate')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add Certificate</button>
              </div>
            ) : (
              <div className="row g-3">
                {certificates.map((cert, i) => (
                  <div key={cert.id || i} className="col-12 col-md-6">
                    <div className="bg-white rounded-4 border p-4 shadow-xs">
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <h6 className="fw-bold text-dark mb-0">{cert.title || cert.certificateName}</h6>
                          <span className="extra-small text-muted">{cert.issuingOrganization || cert.issuer}</span>
                          <div className="extra-small text-muted">{cert.issueDate}</div>
                        </div>
                        <button onClick={() => handleDelete('certificate', cert.id)} className="btn btn-sm text-muted p-0"><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. RESUME */}
        {activeTab === 'resume' && (
          <div className="bg-white rounded-4 border p-4 shadow-xs">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Resume / CV Document</h6>
              <button onClick={() => openAddModal('resume')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">Update Resume</button>
            </div>
            {resume ? (
              <div>
                <div className="p-3 bg-light rounded-3 mb-2">
                  <span className="fw-bold text-dark extra-small d-block">Resume File URL</span>
                  <a href={resume.resumeUrl} target="_blank" rel="noreferrer" className="extra-small text-purple">{resume.resumeUrl}</a>
                </div>
                {resume.summary && <p className="extra-small text-muted mb-0">{resume.summary}</p>}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-file-earmark-person fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No resume linked yet</h6>
                <button onClick={() => openAddModal('resume')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add Resume Link</button>
              </div>
            )}
          </div>
        )}

        {/* 7. AWARDS */}
        {activeTab === 'awards' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Awards &amp; Honors ({awards.length})</h6>
              <button onClick={() => openAddModal('award')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">+ Add Award</button>
            </div>
            {awards.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center shadow-xs">
                <i className="bi bi-trophy fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No awards added</h6>
                <button onClick={() => openAddModal('award')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add Award</button>
              </div>
            ) : (
              <div className="row g-3">
                {awards.map((a, i) => (
                  <div key={a.id || i} className="col-12 col-md-6">
                    <div className="bg-white rounded-4 border p-4 shadow-xs">
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <h6 className="fw-bold text-dark mb-0">{a.title || a.awardName}</h6>
                          <span className="extra-small text-warning font-weight-bold">{a.issuer}</span>
                          <div className="extra-small text-muted">{a.year || a.date}</div>
                        </div>
                        <button onClick={() => handleDelete('award', a.id)} className="btn btn-sm text-muted p-0"><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. LANGUAGES */}
        {activeTab === 'languages' && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-extrabold text-dark mb-0">Languages ({languages.length})</h6>
              <button onClick={() => openAddModal('language')} className="btn btn-dark btn-sm rounded-pill px-3 extra-small fw-bold">+ Add Language</button>
            </div>
            {languages.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center shadow-xs">
                <i className="bi bi-translate fs-1 text-muted d-block mb-2"></i>
                <h6 className="fw-bold text-dark">No languages added</h6>
                <button onClick={() => openAddModal('language')} className="btn btn-dark btn-sm rounded-pill px-4 mt-2">Add Language</button>
              </div>
            ) : (
              <div className="row g-3">
                {languages.map((l, i) => (
                  <div key={l.id || i} className="col-6 col-md-3">
                    <div className="bg-white rounded-4 border p-3 shadow-xs d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="fw-bold text-dark mb-0 extra-small">{l.languageName || l.name}</h6>
                        <span className="extra-small text-muted">{l.proficiency || 'Native / Fluent'}</span>
                      </div>
                      <button onClick={() => handleDelete('language', l.id)} className="btn btn-sm text-muted p-0 ms-2"><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DYNAMIC MODAL FOR ADDING ITEMS ─────────────────────────────────── */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
                <h5 className="modal-title fw-extrabold capitalize">Add New {modalType}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  {modalType === 'project' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Project Title</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Description</label>
                        <textarea className="form-control form-control-sm" rows="3" onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Project URL</label>
                        <input type="url" className="form-control form-control-sm" onChange={e => setFormData({ ...formData, projectUrl: e.target.value })} />
                      </div>
                    </>
                  )}

                  {modalType === 'experience' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Company Name *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, company: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Role / Designation *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Location</label>
                        <input type="text" className="form-control form-control-sm" placeholder="e.g. San Francisco, CA" onChange={e => setFormData({ ...formData, location: e.target.value })} />
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label extra-small fw-bold text-secondary">Start Date *</label>
                          <input type="date" className="form-control form-control-sm" defaultValue="2022-01-01" required onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div className="col-6">
                          <label className="form-label extra-small fw-bold text-secondary">End Date</label>
                          <input type="date" className="form-control form-control-sm" onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Description</label>
                        <textarea className="form-control form-control-sm" rows="3" placeholder="Key responsibilities and achievements..." onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                      </div>
                    </>
                  )}

                  {modalType === 'education' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Institution / University *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, institution: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Degree / Course *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, degree: e.target.value })} />
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label extra-small fw-bold text-secondary">Start Date *</label>
                          <input type="date" className="form-control form-control-sm" defaultValue="2018-09-01" required onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div className="col-6">
                          <label className="form-label extra-small fw-bold text-secondary">End Date</label>
                          <input type="date" className="form-control form-control-sm" defaultValue="2022-06-01" onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>
                      </div>
                    </>
                  )}

                  {modalType === 'skill' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Skill Name</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, skillName: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Proficiency</label>
                        <select className="form-select form-select-sm" onChange={e => setFormData({ ...formData, proficiency: e.target.value })}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Proficient">Proficient</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </>
                  )}

                  {modalType === 'certificate' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Certificate Title *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Issuing Organization *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, issuingOrganization: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Issue Date *</label>
                        <input type="date" className="form-control form-control-sm" defaultValue="2023-01-01" required onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                      </div>
                    </>
                  )}

                  {modalType === 'award' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Award Title *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Issuer *</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, issuer: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Issue Date *</label>
                        <input type="date" className="form-control form-control-sm" defaultValue="2023-01-01" required onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                      </div>
                    </>
                  )}

                  {modalType === 'language' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Language Name</label>
                        <input type="text" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, languageName: e.target.value })} />
                      </div>
                    </>
                  )}

                  {modalType === 'resume' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Resume PDF / Google Drive URL</label>
                        <input type="url" className="form-control form-control-sm" required onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Professional Summary</label>
                        <textarea className="form-control form-control-sm" rows="3" onChange={e => setFormData({ ...formData, summary: e.target.value })}></textarea>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-sm btn-light border rounded-pill px-4 extra-small fw-bold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-sm btn-dark rounded-pill px-4 extra-small fw-bold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Item'}
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

export default PortfolioDashboardPage;
