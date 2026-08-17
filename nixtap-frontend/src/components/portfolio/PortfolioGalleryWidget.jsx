import React from 'react';

const PortfolioGalleryWidget = ({ projects = [], title = 'Featured Portfolio Projects' }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="portfolio-gallery-widget mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <i className="bi bi-journal-code text-primary"></i> {title}
        </h6>
        <span className="badge bg-white-10 text-white-75 rounded-pill extra-small">
          {projects.length} Showcase Items
        </span>
      </div>

      <div className="row g-3">
        {projects.map((proj) => (
          <div key={proj.id} className="col-12 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 bg-black-20 text-white border border-white-10">
              {proj.coverImageUrl && (
                <img
                  src={proj.coverImageUrl}
                  alt={proj.title}
                  className="card-img-top object-fit-cover"
                  style={{ height: '120px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="card-body p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary rounded-pill extra-small">
                      {proj.category || 'Project'}
                    </span>
                    {proj.featured && (
                      <span className="badge bg-warning text-dark rounded-pill extra-small">
                        <i className="bi bi-star-fill me-1"></i> Featured
                      </span>
                    )}
                  </div>
                  <h6 className="fw-bold mb-1 text-truncate">{proj.title}</h6>
                  <p className="extra-small text-white-75 mb-2 line-clamp-2">
                    {proj.description}
                  </p>

                  {/* Tags */}
                  {proj.tags && Array.isArray(proj.tags) && (
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {proj.tags.map((tag, idx) => (
                        <span key={idx} className="badge bg-white-10 text-white-50 extra-small">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {proj.projectUrl && (
                  <div className="pt-2 border-top border-white-10">
                    <a
                      href={proj.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-light btn-sm w-100 rounded-pill extra-small fw-semibold d-flex align-items-center justify-content-center gap-1"
                    >
                      <i className="bi bi-box-arrow-up-right"></i> View Project Live
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioGalleryWidget;
