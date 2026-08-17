import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="card border-0 shadow-lg rounded-4 p-5 text-center bg-white max-w-lg mx-auto">
            <div className="my-3">
              <i className="bi bi-exclamation-triangle-fill display-3 text-warning"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">
              {this.props.moduleName ? `${this.props.moduleName} Unavailable` : 'Something Went Wrong'}
            </h4>
            <p className="text-muted small mb-4">
              We encountered a temporary rendering or service connectivity error while loading this module.
              Your data is safe.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 d-flex align-items-center gap-2"
                onClick={this.handleRetry}
              >
                <i className="bi bi-arrow-clockwise"></i> Retry Connection
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
