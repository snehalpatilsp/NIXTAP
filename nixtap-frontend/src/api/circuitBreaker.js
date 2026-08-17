// Lightweight Circuit Breaker & Service Health Manager

const SERVICE_HEALTH = {
  auth: { status: 'HEALTHY', failures: 0, resetTime: null },
  profile: { status: 'HEALTHY', failures: 0, resetTime: null },
  cards: { status: 'HEALTHY', failures: 0, resetTime: null },
  qr: { status: 'HEALTHY', failures: 0, resetTime: null },
  media: { status: 'HEALTHY', failures: 0, resetTime: null },
  meetings: { status: 'HEALTHY', failures: 0, resetTime: null },
  feedback: { status: 'HEALTHY', failures: 0, resetTime: null },
  portfolio: { status: 'HEALTHY', failures: 0, resetTime: null },
  analytics: { status: 'HEALTHY', failures: 0, resetTime: null },
  admin: { status: 'HEALTHY', failures: 0, resetTime: null },
};

const LISTENERS = new Set();

const notifyListeners = () => {
  LISTENERS.forEach((cb) => cb({ ...SERVICE_HEALTH }));
};

export const subscribeServiceHealth = (callback) => {
  LISTENERS.add(callback);
  callback({ ...SERVICE_HEALTH });
  return () => LISTENERS.delete(callback);
};

export const getServiceHealth = () => ({ ...SERVICE_HEALTH });

export const identifyServiceFromUrl = (url) => {
  if (!url) return 'cards';
  if (url.includes('/auth')) return 'auth';
  if (url.includes('/profiles') || url.includes('/social') || url.includes('/contacts')) return 'profile';
  if (url.includes('/cards') || url.includes('/themes') || url.includes('/nfc')) return 'cards';
  if (url.includes('/qr')) return 'qr';
  if (url.includes('/media')) return 'media';
  if (url.includes('/meetings')) return 'meetings';
  if (url.includes('/feedback')) return 'feedback';
  if (url.includes('/portfolio')) return 'portfolio';
  if (url.includes('/analytics')) return 'analytics';
  if (url.includes('/admin')) return 'admin';
  return 'cards';
};

export const recordServiceSuccess = (serviceName) => {
  if (!SERVICE_HEALTH[serviceName]) return;
  const svc = SERVICE_HEALTH[serviceName];
  if (svc.failures > 0 || svc.status !== 'HEALTHY') {
    svc.failures = 0;
    svc.status = 'HEALTHY';
    svc.resetTime = null;
    notifyListeners();
  }
};

export const recordServiceFailure = (serviceName, status) => {
  if (!SERVICE_HEALTH[serviceName]) return;
  const svc = SERVICE_HEALTH[serviceName];

  if (!status || status >= 500) {
    svc.failures += 1;
    if (svc.failures >= 3 && svc.status !== 'DEGRADED') {
      svc.status = 'DEGRADED';
      svc.resetTime = Date.now() + 30000; // 30s cooldown
      notifyListeners();

      setTimeout(() => {
        svc.status = 'HEALTHY';
        svc.failures = 0;
        svc.resetTime = null;
        notifyListeners();
      }, 30000);
    }
  }
};

export const setServiceDegradedManually = (serviceName, degraded = true) => {
  if (!SERVICE_HEALTH[serviceName]) return;
  SERVICE_HEALTH[serviceName].status = degraded ? 'DEGRADED' : 'HEALTHY';
  SERVICE_HEALTH[serviceName].failures = degraded ? 3 : 0;
  notifyListeners();
};

export const executeWithRetry = async (fn, maxRetries = 2, delay = 1000) => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || (err.response && err.response.status < 500 && err.response.status !== 429)) {
        throw err;
      }
      attempt += 1;
      await new Promise((res) => setTimeout(res, delay * Math.pow(2, attempt - 1)));
    }
  }
};
