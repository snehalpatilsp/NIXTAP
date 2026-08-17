import React, { useState, useEffect } from 'react';
import { subscribeServiceHealth, setServiceDegradedManually } from '../../api/circuitBreaker';

const ServiceHealthCheck = () => {
  const [healthMap, setHealthMap] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeServiceHealth((health) => {
      setHealthMap(health);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="position-fixed bottom-0 end-0 p-3 z-3">
      {open ? (
        <div className="card border-0 shadow-lg rounded-4 p-3 bg-dark text-white" style={{ width: '320px' }}>
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary pb-2">
            <h6 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
              <i className="bi bi-shield-check"></i> Circuit Breaker Simulator
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setOpen(false)}
            ></button>
          </div>

          <p className="extra-small text-white-50 mb-3">
            Toggle microservice health status to test resilience, fallbacks, and degraded banners:
          </p>

          <div className="space-y-2 extra-small overflow-y-auto" style={{ maxHeight: '260px' }}>
            {Object.keys(healthMap).map((serviceKey) => {
              const isDegraded = healthMap[serviceKey].status === 'DEGRADED';
              return (
                <div key={serviceKey} className="d-flex align-items-center justify-content-between p-2 bg-secondary bg-opacity-25 rounded-3">
                  <span className="fw-bold uppercase">{serviceKey}</span>
                  <button
                    type="button"
                    className={`btn btn-sm py-0.5 px-2 rounded-pill extra-small fw-bold ${
                      isDegraded ? 'btn-danger' : 'btn-success'
                    }`}
                    onClick={() => setServiceDegradedManually(serviceKey, !isDegraded)}
                  >
                    {isDegraded ? 'DEGRADED' : 'HEALTHY'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-dark btn-sm rounded-pill shadow-lg border border-primary px-3 py-2 fw-bold text-primary d-flex align-items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <i className="bi bi-shield-slash-fill"></i> Test Resilience & Circuit Breaker
        </button>
      )}
    </div>
  );
};

export default ServiceHealthCheck;
