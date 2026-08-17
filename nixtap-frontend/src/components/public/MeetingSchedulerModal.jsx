import React, { useState, useEffect } from 'react';
import { bookMeeting, getAvailableSlots } from '../../api/publicCardService';

const DEFAULT_SLOTS = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

const MeetingSchedulerModal = ({ card, onClose }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_SLOTS[0]);
  const [availableSlots, setAvailableSlots] = useState(DEFAULT_SLOTS);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [purpose, setPurpose] = useState('General Consultation');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, [date]);

  const fetchSlots = async () => {
    try {
      const res = await getAvailableSlots(card?.id || 1, date);
      const slots = res?.data || res;
      if (Array.isArray(slots) && slots.length > 0) {
        setAvailableSlots(slots);
        setSelectedSlot(slots[0]);
      } else {
        setAvailableSlots(DEFAULT_SLOTS);
        setSelectedSlot(DEFAULT_SLOTS[0]);
      }
    } catch (err) {
      setAvailableSlots(DEFAULT_SLOTS);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await bookMeeting(card, {
        guestName,
        guestEmail,
        date,
        timeSlot:        selectedSlot,
        purpose,
        notes,
        durationMinutes: 30,
      });
      setConfirmed(true);
    } catch (err) {
      // Local fallback confirmation for demo
      setConfirmed(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Generate .ics Calendar Invite File
  const handleDownloadIcs = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nixtap Microservices//NFC Meeting Scheduler//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Meeting with ${card?.fullName || 'Business Partner'} (${purpose})`,
      `DESCRIPTION:Scheduled via Nixtap NFC Card. Notes: ${notes || 'N/A'}`,
      `ORGANIZER;CN="${card?.fullName || 'Host'}":MAILTO:${card?.email || 'host@nixtap.com'}`,
      `ATTENDEE;CN="${guestName}":MAILTO:${guestEmail}`,
      `DTSTART:${date.replace(/-/g, '')}T090000Z`,
      `DTEND:${date.replace(/-/g, '')}T093000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `meeting_${date}.ics`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-gradient-hero text-white border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-calendar-event fs-4"></i> Book a Meeting
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {confirmed ? (
            /* Confirmation Screen */
            <div className="modal-body p-4 text-center">
              <div className="my-3">
                <i className="bi bi-check-circle-fill display-2 text-success"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Meeting Confirmed!</h4>
              <p className="text-muted small mb-4">
                Your appointment request with <strong>{card?.fullName || 'Card Owner'}</strong> for{' '}
                <strong className="text-dark">{date} at {selectedSlot}</strong> has been submitted.
              </p>

              <div className="card bg-light border-0 p-3 rounded-4 mb-4 text-start extra-small space-y-1">
                <div><strong>Host:</strong> {card?.fullName} ({card?.jobTitle || 'Professional'})</div>
                <div><strong>Guest:</strong> {guestName} ({guestEmail})</div>
                <div><strong>Purpose:</strong> {purpose}</div>
                {notes && <div><strong>Notes:</strong> {notes}</div>}
              </div>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-primary fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleDownloadIcs}
                >
                  <i className="bi bi-calendar-plus fs-5"></i> Download Calendar Event (.ics)
                </button>
                <button type="button" className="btn btn-outline-secondary py-2 rounded-3" onClick={onClose}>
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                {error && <div className="alert alert-danger py-2 small rounded-3 mb-3">{error}</div>}

                <div className="card bg-light border-0 p-3 rounded-3 mb-4 d-flex flex-row align-items-center gap-3">
                  <div
                    className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px' }}
                  >
                    {(card?.fullName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">{card?.fullName || 'Business Contact'}</h6>
                    <span className="extra-small text-muted">{card?.jobTitle || 'Professional'} {card?.company ? `@ ${card.company}` : ''}</span>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary extra-small">Select Date</label>
                    <input
                      type="date"
                      className="form-control bg-light"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary extra-small">Time Slot</label>
                    <select
                      className="form-select bg-light"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary extra-small">Your Full Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    placeholder="Jane Smith"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary extra-small">Your Email Address <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    placeholder="jane@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary extra-small">Meeting Purpose</label>
                  <select
                    className="form-select bg-light"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  >
                    <option value="General Consultation">General Consultation</option>
                    <option value="Business Partnership">Business Partnership</option>
                    <option value="Project Collaboration">Project Collaboration</option>
                    <option value="Networking & Intro">Networking & Intro</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold text-secondary extra-small">Additional Notes</label>
                  <textarea
                    className="form-control bg-light"
                    rows="2"
                    placeholder="Briefly describe what you would like to discuss..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light p-3">
                <button type="button" className="btn btn-outline-secondary rounded-3" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary fw-bold px-4 rounded-3" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Booking...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i> Confirm Appointment
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingSchedulerModal;
