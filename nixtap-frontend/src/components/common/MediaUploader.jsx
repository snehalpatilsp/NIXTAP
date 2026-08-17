import React, { useState, useRef } from 'react';
import { uploadFile } from '../../api/mediaQrService';

const MediaUploader = ({
  currentUrl,
  onUploadSuccess,
  category = 'PROFILE_IMAGE',
  label = 'Upload Image',
  maxSizeMB = 5,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');

  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setError('');

    // Validate image format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file format. Please upload PNG, JPG, or WEBP images.');
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    // Convert file to base64 Data URL for persistent storage & frontend rendering
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreviewUrl(dataUrl);
      try {
        localStorage.setItem('nixtap_profile_avatar', dataUrl);
      } catch (err) {
        console.warn('LocalStorage avatar quota exceeded:', err);
      }
      onUploadSuccess?.(dataUrl);
    };
    reader.readAsDataURL(file);

    // Perform upload to backend as well
    performUpload(file);
  };

  const performUpload = async (file) => {
    try {
      setUploading(true);
      setProgress(20);

      // Simulate smooth progress steps for UI UX
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 25 : prev));
      }, 150);

      const res = await uploadFile(file, category);
      clearInterval(interval);
      setProgress(100);

      const uploadedUrl = res?.data?.publicUrl || res?.publicUrl || previewUrl;
      onUploadSuccess?.(uploadedUrl);
    } catch (err) {
      console.warn('Backend upload notice, using local media preview:', err?.message);
      setProgress(100);
      onUploadSuccess?.(previewUrl);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 600);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    localStorage.removeItem('nixtap_profile_avatar');
    onUploadSuccess?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="media-uploader mb-3">
      <label className="form-label fw-semibold text-secondary small">{label}</label>

      {error && (
        <div className="alert alert-danger alert-dismissible py-2 small rounded-3 mb-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
          <button type="button" className="btn-close py-2" onClick={() => setError('')}></button>
        </div>
      )}

      {previewUrl ? (
        /* Image Preview Mode */
        <div className="card border-0 bg-light p-3 rounded-4">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3 overflow-hidden">
              <img
                src={previewUrl}
                alt="Uploaded Preview"
                className="rounded-3 object-fit-cover border shadow-sm"
                style={{ width: '64px', height: '64px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=Preview';
                }}
              />
              <div className="text-truncate">
                <span className="badge bg-success-subtle text-success rounded-pill mb-1">
                  <i className="bi bi-check-circle me-1"></i> Image Ready
                </span>
                <div className="extra-small text-muted text-truncate">{previewUrl}</div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                onClick={() => fileInputRef.current?.click()}
                title="Replace Image"
              >
                <i className="bi bi-arrow-repeat"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-circle p-2"
                onClick={handleClear}
                title="Remove Image"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          className={`border-2 border-dashed rounded-4 p-4 text-center cursor-pointer transition-all ${
            dragActive ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-light'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-cloud-arrow-up display-5 text-primary mb-2 d-block"></i>
          <h6 className="fw-bold mb-1">Drag & Drop image file here</h6>
          <p className="extra-small text-muted mb-2">Supports PNG, JPG, or WEBP (Max {maxSizeMB}MB)</p>
          <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            Browse File
          </button>
        </div>
      )}

      {/* Progress Bar Indicator */}
      {uploading && (
        <div className="progress mt-2 rounded-pill" style={{ height: '6px' }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        className="d-none"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default MediaUploader;
