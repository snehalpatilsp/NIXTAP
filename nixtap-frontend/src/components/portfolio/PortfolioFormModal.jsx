import React, { useState } from 'react';
import MediaUploader from '../common/MediaUploader';

const CATEGORIES = ['Web App', 'Mobile App', 'Design', 'Research', 'Microservices', 'Other'];

const PortfolioFormModal = ({ initialProject, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: initialProject?.title || '',
    category: initialProject?.category || 'Web App',
    description: initialProject?.description || '',
    projectUrl: initialProject?.projectUrl || '',
    coverImageUrl: initialProject?.coverImageUrl || '',
    tags: Array.isArray(initialProject?.tags)
      ? initialProject.tags.join(', ')
      : initialProject?.tags || '',
    featured: initialProject?.featured || false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a Project Title.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      // Convert comma-separated string to tag array
      const processedTags = typeof formData.tags === 'string'
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : formData.tags;

      await onSave({ ...formData, tags: processedTags });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save portfolio project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-gradient-primary text-white border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-journal-album fs-4"></i>
              {initialProject ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 p-md-5 bg-white">
              {error && <div className="alert alert-danger py-2 small rounded-3 mb-3">{error}</div>}

              <div className="row g-4">
                <div className="col-12 col-md-8">
                  <label className="form-label fw-semibold text-secondary small">
                    Project Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control bg-light"
                    placeholder="e.g. Nixtap Microservices Gateway"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold text-secondary small">Category</label>
                  <select
                    name="category"
                    className="form-select bg-light"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <MediaUploader
                    currentUrl={formData.coverImageUrl}
                    category="PORTFOLIO_IMAGE"
                    label="Project Cover Image / Screenshot"
                    onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, coverImageUrl: url }))}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-secondary small">Live Demo / Repository URL</label>
                  <input
                    type="url"
                    name="projectUrl"
                    className="form-control bg-light"
                    placeholder="https://github.com/username/project"
                    value={formData.projectUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-secondary small">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-control bg-light"
                    placeholder="React, Spring Boot, Microservices, Tailwind"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-secondary small">Project Description</label>
                  <textarea
                    name="description"
                    className="form-control bg-light"
                    rows="4"
                    placeholder="Describe key technical highlights, architecture, and features..."
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="col-12">
                  <div className="form-check form-switch p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                    <div>
                      <label className="form-check-label fw-bold text-dark d-block mb-0" htmlFor="featuredToggle">
                        Highlight as Featured Project
                      </label>
                      <span className="extra-small text-muted">Featured projects display on your public digital business card</span>
                    </div>
                    <input
                      className="form-check-input ms-0 fs-4"
                      type="checkbox"
                      role="switch"
                      id="featuredToggle"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 bg-light p-3">
              <button type="button" className="btn btn-outline-secondary rounded-3" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fw-bold px-4 rounded-3" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving Project...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i> Save Portfolio Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortfolioFormModal;
