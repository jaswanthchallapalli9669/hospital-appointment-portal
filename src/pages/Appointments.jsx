import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  AlertCircle
} from 'lucide-react';
import { appointmentApi, doctorApi, patientApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const STATUSES = ['All Statuses', 'Booked', 'Confirmed', 'Completed', 'Cancelled'];

const INITIAL_FORM = {
  patientId: '',
  doctorId: '',
  date: '',
  time: '',
  reason: '',
  status: 'Booked',
};

export default function Appointments() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Cancellation banner notification
  const [lastCancelledNotice, setLastCancelledNotice] = useState(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Confirm delete modal
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Confirm cancel modal
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [appData, docData, patData] = await Promise.all([
        appointmentApi.getAll(),
        doctorApi.getAll(),
        patientApi.getAll(),
      ]);
      setAppointments(appData || []);
      setDoctors(docData || []);
      setPatients(patData || []);
    } catch (err) {
      console.error(err);
      showToast('Error loading appointments data. Verify JSON Server is active.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper mappings
  const getDoctor = (id) => doctors.find((d) => String(d.id) === String(id));
  const getPatient = (id) => patients.find((p) => String(p.id) === String(id));

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const patient = getPatient(app.patientId);
      const doctor = getDoctor(app.doctorId);

      const matchesStatus = filterStatus === 'All Statuses' || app.status === filterStatus;
      const matchesDate = !filterDate || app.date === filterDate;

      const patientName = patient ? patient.name.toLowerCase() : '';
      const doctorName = doctor ? doctor.name.toLowerCase() : '';
      const reason = app.reason ? app.reason.toLowerCase() : '';
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        !term ||
        patientName.includes(term) ||
        doctorName.includes(term) ||
        reason.includes(term);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, doctors, patients, filterStatus, filterDate, searchTerm]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAppointment(null);
    // Auto-select first available doctor and first patient if available
    const availableDoc = doctors.find((d) => d.available);
    setFormData({
      patientId: patients.length > 0 ? String(patients[0].id) : '',
      doctorId: availableDoc ? String(availableDoc.id) : (doctors[0] ? String(doctors[0].id) : ''),
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      reason: '',
      status: 'Booked',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (app) => {
    setEditingAppointment(app);
    setFormData({
      patientId: String(app.patientId),
      doctorId: String(app.doctorId),
      date: app.date,
      time: app.time,
      reason: app.reason,
      status: app.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Selected doctor object for the active form
  const selectedDoctorObj = doctors.find((d) => String(d.id) === String(formData.doctorId));

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.patientId) {
      errors.patientId = 'Please select a patient.';
    }

    if (!formData.doctorId) {
      errors.doctorId = 'Please select a doctor.';
    } else {
      // REQUIREMENT: Prevent booking appointments with unavailable doctors
      const doc = doctors.find((d) => String(d.id) === String(formData.doctorId));
      if (doc && !doc.available) {
        // If creating a new appointment or changing doctor to an unavailable one
        errors.doctorId = `${doc.name} is currently unavailable for bookings. Please choose an available doctor.`;
      }
    }

    if (!formData.date) {
      errors.date = 'Appointment date is required.';
    }

    if (!formData.time) {
      errors.time = 'Appointment time is required.';
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Please state the appointment reason or clinical concern.';
    } else if (formData.reason.trim().length < 4) {
      errors.reason = 'Reason must be at least 4 characters long.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Create or Edit Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        patientId: String(formData.patientId),
        doctorId: String(formData.doctorId),
        date: formData.date,
        time: formData.time,
        reason: formData.reason.trim(),
        status: formData.status,
      };

      if (editingAppointment) {
        const updated = await appointmentApi.update(editingAppointment.id, payload);
        setAppointments((prev) =>
          prev.map((a) => (String(a.id) === String(editingAppointment.id) ? updated : a))
        );
        showToast(`Appointment #${updated.id} updated successfully!`, 'success');
      } else {
        const newApp = await appointmentApi.create(payload);
        setAppointments((prev) => [...prev, newApp]);
        showToast(`Appointment #${newApp.id} booked successfully!`, 'success');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save appointment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Quick Status Change from Table Row
  const handleQuickStatusChange = async (appointment, newStatus) => {
    if (appointment.status === newStatus) return;

    if (newStatus === 'Cancelled') {
      // Trigger confirmation dialog for cancellation
      setAppointmentToCancel(appointment);
      return;
    }

    try {
      const updatedPayload = { ...appointment, status: newStatus };
      const res = await appointmentApi.update(appointment.id, updatedPayload);
      setAppointments((prev) =>
        prev.map((a) => (String(a.id) === String(appointment.id) ? res : a))
      );
      showToast(`Appointment #${appointment.id} status changed to ${newStatus}.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update status.', 'error');
    }
  };

  // Execute cancellation after confirmation
  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
      setIsCancelling(true);
      const updatedPayload = { ...appointmentToCancel, status: 'Cancelled' };
      const res = await appointmentApi.update(appointmentToCancel.id, updatedPayload);
      setAppointments((prev) =>
        prev.map((a) => (String(a.id) === String(appointmentToCancel.id) ? res : a))
      );

      const patientName = getPatient(appointmentToCancel.patientId)?.name || `Patient #${appointmentToCancel.patientId}`;
      const doctorName = getDoctor(appointmentToCancel.doctorId)?.name || `Doctor #${appointmentToCancel.doctorId}`;

      // Requirement: Display a clear message when an appointment has been cancelled
      const noticeMsg = `Appointment #${appointmentToCancel.id} for ${patientName} with ${doctorName} has been cancelled successfully.`;
      setLastCancelledNotice(noticeMsg);
      showToast(noticeMsg, 'warning', 6000);
      setAppointmentToCancel(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel appointment.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      setIsDeleting(true);
      await appointmentApi.delete(appointmentToDelete.id);
      setAppointments((prev) =>
        prev.filter((a) => String(a.id) !== String(appointmentToDelete.id))
      );
      showToast(`Appointment #${appointmentToDelete.id} permanently deleted.`, 'info');
      setAppointmentToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete appointment record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* CLEAR BANNER MESSAGE WHEN AN APPOINTMENT HAS BEEN CANCELLED */}
      {lastCancelledNotice && (
        <div className="alert-banner warning">
          <div className="alert-content">
            <AlertTriangle size={18} color="#d97706" />
            <div>
              <strong>Cancellation Notice:</strong> {lastCancelledNotice}
            </div>
          </div>
          <button
            className="btn-icon"
            onClick={() => setLastCancelledNotice(null)}
            title="Dismiss notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* PAGE TOOLBAR */}
      <div className="filter-toolbar">
        <div className="filter-group">
          {/* SEARCH */}
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by patient, doctor, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FILTER BY STATUS */}
          <select
            className="select-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* FILTER BY DATE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="date"
              className="date-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              title="Filter by appointment date"
            />
            {filterDate && (
              <button
                className="btn btn-outline"
                style={{ padding: '0.55rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => setFilterDate('')}
                title="Clear date filter"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* APPOINTMENTS TABLE PANEL */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-header-title">
            <CalendarDays size={19} color="var(--primary)" />
            <h2>Clinical Appointments Master List</h2>
            <span className="panel-badge-count">{filteredAppointments.length} bookings</span>
          </div>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Fetching scheduled appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CalendarDays size={30} />
              </div>
              <h3>No Appointments Found</h3>
              <p>
                {filterStatus !== 'All Statuses' || filterDate || searchTerm
                  ? 'No appointments match the applied filter criteria.'
                  : 'There are currently no appointments booked. Click "Book Appointment" to schedule one.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient Details</th>
                    <th>Assigned Doctor</th>
                    <th>Schedule</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Quick Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((app) => {
                    const patient = getPatient(app.patientId);
                    const doctor = getDoctor(app.doctorId);
                    const isDoctorUnavailable = doctor && !doctor.available;

                    return (
                      <tr key={app.id}>
                        <td>
                          <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>
                            #{app.id}
                          </span>
                        </td>
                        <td>
                          <div className="entity-meta">
                            <span className="entity-name">
                              {patient ? patient.name : `Patient #${app.patientId}`}
                            </span>
                            <span className="entity-sub">
                              {patient ? patient.phone : 'No phone recorded'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="entity-meta">
                            <span className="entity-name">
                              {doctor ? doctor.name : `Doctor #${app.doctorId}`}
                            </span>
                            <span className="entity-sub" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{doctor ? doctor.specialization : 'Specialist'}</span>
                              {isDoctorUnavailable && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    padding: '0.1rem 0.35rem',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: '#fee2e2',
                                    color: '#b91c1c',
                                    fontWeight: '600'
                                  }}
                                  title="Doctor is currently marked as unavailable in the system"
                                >
                                  Doctor Unavailable
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', fontSize: '0.825rem' }}>
                              <Calendar size={13} color="var(--primary)" />
                              <span>{app.date}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <Clock size={12} />
                              <span>{app.time}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ maxWidth: '240px' }}>
                          <span
                            title={app.reason}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.825rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {app.reason}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          {/* Quick Status Updater */}
                          <select
                            className="status-select"
                            value={app.status}
                            onChange={(e) => handleQuickStatusChange(app, e.target.value)}
                            title="Update appointment status"
                          >
                            <option value="Booked">Booked</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                            {app.status !== 'Cancelled' && (
                              <button
                                className="btn-icon"
                                onClick={() => setAppointmentToCancel(app)}
                                title="Cancel Appointment"
                                style={{ color: '#e11d48' }}
                              >
                                <Ban size={16} />
                              </button>
                            )}
                            <button
                              className="btn-icon edit"
                              onClick={() => handleOpenEdit(app)}
                              title="Edit Appointment Details"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => setAppointmentToDelete(app)}
                              title="Delete Appointment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* BOOK / EDIT APPOINTMENT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <CalendarDays size={20} color="var(--primary)" />
                <span>{editingAppointment ? `Edit Appointment #${editingAppointment.id}` : 'Book New Clinical Appointment'}</span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* SELECT PATIENT */}
                <div className="form-group">
                  <label className="form-label">
                    Select Patient <span className="required">*</span>
                  </label>
                  {patients.length === 0 ? (
                    <div className="alert-banner warning" style={{ margin: 0, padding: '0.6rem 0.9rem' }}>
                      <AlertCircle size={16} />
                      <span style={{ fontSize: '0.8rem' }}>No patients found. Please add a patient first in Patients tab.</span>
                    </div>
                  ) : (
                    <select
                      className={`form-select ${formErrors.patientId ? 'error' : ''}`}
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    >
                      <option value="">-- Choose a registered patient --</option>
                      {patients.map((pat) => (
                        <option key={pat.id} value={pat.id}>
                          {pat.name} (Age: {pat.age}, Phone: {pat.phone})
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.patientId && <span className="error-text">{formErrors.patientId}</span>}
                </div>

                {/* SELECT DOCTOR WITH AVAILABILITY INDICATOR */}
                <div className="form-group">
                  <label className="form-label">
                    Select Doctor <span className="required">*</span>
                  </label>
                  {doctors.length === 0 ? (
                    <div className="alert-banner warning" style={{ margin: 0, padding: '0.6rem 0.9rem' }}>
                      <AlertCircle size={16} />
                      <span style={{ fontSize: '0.8rem' }}>No doctors found. Please add a doctor in Doctors tab.</span>
                    </div>
                  ) : (
                    <select
                      className={`form-select ${formErrors.doctorId ? 'error' : ''}`}
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    >
                      <option value="">-- Choose a doctor --</option>
                      {doctors.map((doc) => (
                        <option
                          key={doc.id}
                          value={doc.id}
                          style={{
                            color: doc.available ? '#0f172a' : '#991b1b',
                            backgroundColor: doc.available ? '#ffffff' : '#fef2f2',
                          }}
                        >
                          {doc.name} - {doc.specialization} ({doc.available ? 'Available' : 'UNAVAILABLE'})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* REQUIREMENT: Display appropriate message when a doctor is unavailable */}
                  {selectedDoctorObj && !selectedDoctorObj.available && (
                    <div
                      className="alert-banner danger"
                      style={{ margin: '0.5rem 0 0 0', padding: '0.65rem 0.9rem', fontSize: '0.8rem' }}
                    >
                      <div className="alert-content">
                        <AlertTriangle size={16} />
                        <div>
                          <strong>Doctor Unavailable:</strong> {selectedDoctorObj.name} is currently marked as unavailable. Booking with an unavailable doctor is strictly prohibited.
                        </div>
                      </div>
                    </div>
                  )}

                  {formErrors.doctorId && <span className="error-text">{formErrors.doctorId}</span>}
                </div>

                {/* DATE & TIME */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Appointment Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-input ${formErrors.date ? 'error' : ''}`}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {formErrors.date && <span className="error-text">{formErrors.date}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Appointment Time <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      className={`form-input ${formErrors.time ? 'error' : ''}`}
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                    {formErrors.time && <span className="error-text">{formErrors.time}</span>}
                  </div>
                </div>

                {/* REASON */}
                <div className="form-group">
                  <label className="form-label">
                    Appointment Reason / Symptoms <span className="required">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className={`form-textarea ${formErrors.reason ? 'error' : ''}`}
                    placeholder="Enter reason for visit, symptoms, or clinical notes..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                  {formErrors.reason && <span className="error-text">{formErrors.reason}</span>}
                </div>

                {/* STATUS */}
                <div className="form-group">
                  <label className="form-label">Appointment Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Booked">Booked</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || (selectedDoctorObj && !selectedDoctorObj.available)}
                  title={
                    selectedDoctorObj && !selectedDoctorObj.available
                      ? 'Cannot book appointment with an unavailable doctor'
                      : ''
                  }
                >
                  {submitting
                    ? 'Saving...'
                    : editingAppointment
                    ? 'Update Appointment'
                    : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM CANCELLATION MODAL */}
      <ConfirmModal
        isOpen={Boolean(appointmentToCancel)}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel Appointment #${appointmentToCancel?.id}? The slot will be marked as Cancelled and recorded in the audit log.`}
        confirmText="Yes, Cancel Appointment"
        cancelText="Keep Appointment"
        isDanger={true}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setAppointmentToCancel(null)}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(appointmentToDelete)}
        title="Delete Appointment Record"
        message={`Are you sure you want to permanently delete Appointment #${appointmentToDelete?.id}? This action cannot be reversed.`}
        confirmText="Delete Record"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAppointmentToDelete(null)}
      />
    </div>
  );
}
