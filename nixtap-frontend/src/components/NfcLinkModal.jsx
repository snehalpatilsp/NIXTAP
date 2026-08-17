import React, { useState, useEffect } from 'react';
import { linkNfcTag } from '../api/cardService';

const NfcLinkModal = ({ card, onClose, onSuccess }) => {
  const [tagUid, setTagUid] = useState(card?.nfcTagUid || '');
  const [isWritten, setIsWritten] = useState(card?.nfcWritten || false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Web NFC API State
  const [nfcScanning, setNfcScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcMessage, setNfcMessage] = useState('');

  const publicUrl = `${window.location.origin}/card/${card?.slug || card?.id || 'demo'}`;

  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Hardware Web NFC Scan Handler
  const handleWebNfcScan = async () => {
    if (!('NDEFReader' in window)) {
      setNfcMessage('Web NFC API is not supported on this browser/device. Please scan using a Chrome/Android phone or enter the UID manually.');
      return;
    }

    try {
      setNfcScanning(true);
      setNfcMessage('Hold your NFC card or hardware tag against the back of your device...');
      const ndef = new window.NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', ({ message, serialNumber }) => {
        if (serialNumber) {
          const formattedUid = serialNumber.toUpperCase().replace(/(.{2})(?=.)/g, '$1:');
          setTagUid(formattedUid);
          setNfcMessage(`NFC Tag detected! UID: ${formattedUid}`);
          setNfcScanning(false);
        }
      });

      ndef.addEventListener('readingerror', () => {
        setNfcMessage('NFC Tag read error. Please hold the tag steady and try again.');
        setNfcScanning(false);
      });
    } catch (err) {
      setNfcMessage(`NFC Scan error: ${err.message || 'Permission denied or NFC disabled.'}`);
      setNfcScanning(false);
    }
  };

  // Web NFC Write/Flash Handler
  const handleWebNfcWrite = async () => {
    if (!('NDEFReader' in window)) {
      setNfcMessage('Web NFC API is not supported on this device.');
      return;
    }

    try {
      setNfcScanning(true);
      setNfcMessage('Hold NFC chip to write digital business card URL...');
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [
          { recordType: 'url', data: publicUrl }
        ]
      });
      setIsWritten(true);
      setNfcMessage('NFC Tag successfully flashed with card URL!');
      setNfcScanning(false);
    } catch (err) {
      setNfcMessage(`NFC Write failed: ${err.message}`);
      setNfcScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tagUid.trim()) {
      setError('Please enter or scan an NFC Tag Hardware UID.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await linkNfcTag(card.id, {
        nfcTagUid: tagUid.trim(),
        nfcWritten: isWritten,
        publicUrl,
      });
      onSuccess?.({ ...card, nfcTagUid: tagUid.trim(), nfcWritten: isWritten });
      onClose();
    } catch (err) {
      onSuccess?.({ ...card, nfcTagUid: tagUid.trim(), nfcWritten: isWritten });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
            <h5 className="modal-title fw-extrabold d-flex align-items-center gap-2">
              <i className="bi bi-nfc text-cyan" style={{ color: '#38BDF8' }}></i> NFC Tag Programmer & Scanner
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && <div className="alert alert-danger py-2 extra-small rounded-3 mb-3">{error}</div>}

              {/* Target Card Cardlet */}
              <div className="bg-light border-0 rounded-4 p-3 mb-3">
                <span className="extra-small text-muted fw-bold text-uppercase d-block mb-1">Target Business Card</span>
                <h6 className="fw-extrabold text-dark mb-0">{card?.cardName || card?.cardTitle || 'Digital Card'}</h6>
                <span className="extra-small text-muted">ID #{card?.id} • {card?.company || 'Nixtap User'}</span>
              </div>

              {/* Web NFC Hardware Scanner Banner */}
              <div className="p-3 bg-pastel-cyan rounded-4 border border-cyan-subtle mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-broadcast fs-5 text-info"></i>
                    <span className="fw-bold text-dark extra-small">Live Web NFC Hardware Scanner</span>
                  </div>
                  <span className={`badge ${nfcSupported ? 'bg-success' : 'bg-secondary'} extra-small rounded-pill`}>
                    {nfcSupported ? 'WebNFC Ready' : 'Manual Mode'}
                  </span>
                </div>

                <p className="extra-small text-secondary mb-3">
                  Tap your physical NFC card or tag against your device to auto-detect its hardware serial number.
                </p>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-info text-white rounded-pill px-3 py-1.5 fw-bold extra-small d-inline-flex align-items-center gap-1.5"
                    onClick={handleWebNfcScan}
                    disabled={nfcScanning}
                  >
                    <i className={`bi bi-wifi ${nfcScanning ? 'spin-anim' : ''}`}></i>
                    {nfcScanning ? 'Scanning for Tag...' : 'Scan Physical NFC Tag'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-info rounded-pill px-3 py-1.5 fw-bold extra-small d-inline-flex align-items-center gap-1.5"
                    onClick={handleWebNfcWrite}
                    disabled={nfcScanning}
                  >
                    <i className="bi bi-[#10B981] bi-lightning-fill"></i> Flash URL to Chip
                  </button>
                </div>

                {nfcMessage && (
                  <div className="mt-2 text-info extra-small fw-bold animate-pulse">
                    <i className="bi bi-info-circle me-1"></i>{nfcMessage}
                  </div>
                )}
              </div>

              {/* Tag UID Input */}
              <div className="mb-3">
                <label className="form-label fw-bold extra-small text-uppercase text-secondary">
                  NFC Tag Hardware UID / Serial Number <span className="text-danger">*</span>
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-slate-200">
                    <i className="bi bi-cpu text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control font-monospace border-slate-200 shadow-none extra-small"
                    placeholder="e.g. 04:A2:89:FA:12:80"
                    value={tagUid}
                    onChange={(e) => setTagUid(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Public URL Input */}
              <div className="mb-3">
                <label className="form-label fw-bold extra-small text-uppercase text-secondary">Card Public URL</label>
                <div className="input-group input-group-sm">
                  <input type="text" className="form-control bg-light font-monospace border-slate-200 extra-small" value={publicUrl} readOnly />
                  <button type="button" className={`btn ${copied ? 'btn-success text-white' : 'btn-outline-secondary'} extra-small fw-bold px-3`} onClick={handleCopyLink}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Written Toggle Switch */}
              <div className="form-check form-switch p-3 bg-light rounded-4 d-flex align-items-center justify-content-between">
                <div>
                  <label className="form-check-label fw-bold text-dark extra-small d-block mb-0" htmlFor="nfcStatusToggle">
                    Hardware Written Status
                  </label>
                  <span className="extra-small text-muted">Mark as active after flashing chip</span>
                </div>
                <input
                  className="form-check-input ms-0 fs-5 cursor-pointer"
                  type="checkbox"
                  role="switch"
                  id="nfcStatusToggle"
                  checked={isWritten}
                  onChange={(e) => setIsWritten(e.target.checked)}
                />
              </div>
            </div>

            <div className="modal-footer border-0 p-3 bg-light">
              <button type="button" className="btn btn-sm btn-light border rounded-pill px-4 extra-small fw-bold" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-dark rounded-pill px-4 extra-small fw-bold" disabled={saving}>
                {saving ? 'Linking...' : 'Save & Bind NFC Tag'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NfcLinkModal;
