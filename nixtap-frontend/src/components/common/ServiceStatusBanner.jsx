import React, { useState, useEffect } from 'react';
import { subscribeServiceHealth } from '../../api/circuitBreaker';

const ServiceStatusBanner = () => {
  const [degradedServices, setDegradedServices] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeServiceHealth((health) => {
      const degraded = Object.keys(health).filter(
        (key) => health[key].status === 'DEGRADED'
      );
      setDegradedServices(degraded);
    });
    return () => unsubscribe();
  }, []);

  if (degradedServices.length === 0) return null;

  return (
    <div className="bg-warning text-dark py-2 px-3 text-center fw-semibold small shadow-sm position-relative z-3 d-flex align-items-center justify-content-center gap-2">
      <i className="bi bi-exclamation-triangle-fill fs-5"></i>
      <span>
        Service Degradation Alert: The <strong>{degradedServices.join(', ')}</strong> microservice(s) are currently experiencing high latency or downtime. Core business card features remain online.
      </span>
    </div>
  );
};

export default ServiceStatusBanner;
