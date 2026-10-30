import React, { useState, useEffect, useMemo } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Award,
  X,
  AlertCircle
} from 'lucide-react';
import { doctorApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SPECIALIZATIONS = [
  'All Specializations',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
  'Gynecology',
  'Ophthalmology',
  'Psychiatry',
  'Oncology'
];

const INITIAL_FORM = {
  name: '',
  specialization: 'Cardiology',
  experience: '',
  phone: '',
  email: '',
  available: true,
};

export default function Doctors() {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorApi.getAll();
      setDoctors(data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load doctors list. Please check JSON Server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpec =
        selectedSpecialization === 'All Specializations' ||
        doc.specialization.toLowerCase() === selectedSpecialization.toLowerCase();
      return matchesSearch && matchesSpec;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      phone: doctor.phone,
      email: doctor.email,
      available: doctor.available ?? true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Doctor name is required.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters.';
    }

    if (!formData.specialization.trim()) {
      errors.specialization = 'Please select a specialization.';
    }

    if (formData.experience === '' || formData.experience === null) {
      errors.experience = 'Years of experience is required.';
    } else if (Number(formData.experience) < 0 || Number(formData.experience) > 60) {
      errors.experience = 'Experience must be between 0 and 60 years.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Contact phone number is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        specialization: formData.specialization,
        experience: Number(formData.experience),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        available: Boolean(formData.available),
      };

      if (editingDoctor) {
        // PUT update
        const updated = await doctorApi.update(editingDoctor.id, payload);
        setDoctors((prev) =>
          prev.map((d) => (String(d.id) === String(editingDoctor.id) ? updated : d))
        );
        showToast(`Dr. ${payload.name} details updated successfully!`, 'success');
      } else {
        // POST create
        const newDoctor = await doctorApi.create(payload);
        setDoctors((prev) => [...prev, newDoctor]);
        showToast(`Dr. ${payload.name} added to the medical team!`, 'success');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle quick toggle availability
  const handleToggleAvailability = async (doctor) => {
    try {
      const updatedPayload = { ...doctor, available: !doctor.available };
      const res = await doctorApi.update(doctor.id, updatedPayload);
      setDoctors((prev) =>
        prev.map((d) => (String(d.id) === String(doctor.id) ? res : d))
      );
      showToast(
        `${doctor.name} is now ${res.available ? 'Available' : 'Unavailable'} for appointments.`,
        res.available ? 'success' : 'warning'
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle availability status.', 'error');
    }
  };

  // Handle Delete Doctor
  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;
    try {
      setIsDeleting(true);
      await doctorApi.delete(doctorToDelete.id);
      setDoctors((prev) => prev.filter((d) => String(d.id) !== String(doctorToDelete.id)));
      showToast(`${doctorToDelete.name} has been removed from the registry.`, 'info');
      setDoctorToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete doctor record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* PAGE TOOLBAR */}
      <div className="filter-toolbar">
        <div className="filter-group">
          {/* SEARCH */}
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FILTER BY SPECIALIZATION */}
          <select
            className="select-input"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* DOCTORS TABLE PANEL */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-header-title">
            <Stethoscope size={19} color="var(--primary)" />
            <h2>Medical Doctors Registry</h2>
            <span className="panel-badge-count">{filteredDoctors.length} found</span>
          </div>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Fetching doctors directory...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Stethoscope size={30} />
              </div>
              <h3>No Doctors Found</h3>
              <p>
                {searchTerm || selectedSpecialization !== 'All Specializations'
                  ? 'No doctors match the selected search or specialization filters.'
                  : 'No doctors have been registered yet. Click "Add Doctor" to create one.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor Name & Email</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Phone</th>
                    <th>Availability Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="entity-meta">
                          <span className="entity-name">{doc.name}</span>
                          <span className="entity-sub" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Mail size={12} />
                            {doc.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: '600',
                            color: 'var(--primary)',
                            backgroundColor: 'var(--primary-light)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                          }}
                        >
                          {doc.specialization}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Award size={14} color="var(--teal)" />
                          <span>{doc.experience} years</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Phone size={13} color="var(--text-muted)" />
                          <span>{doc.phone}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailability(doc)}
                          title="Click to toggle availability"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {doc.available ? (
                            <span className="badge badge-available">
                              <CheckCircle2 size={13} />
                              Available
                            </span>
                          ) : (
                            <span className="badge badge-unavailable">
                              <XCircle size={13} />
                              Unavailable
                            </span>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn-icon edit"
                            onClick={() => handleOpenEdit(doc)}
                            title="Edit Doctor"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => setDoctorToDelete(doc)}
                            title="Delete Doctor"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Stethoscope size={20} color="var(--primary)" />
                <span>{editingDoctor ? 'Edit Doctor Information' : 'Register New Doctor'}</span>
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
                {/* Doctor Name */}
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="e.g. Dr. Suresh Varma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                {/* Specialization & Experience */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Specialization <span className="required">*</span>
                    </label>
                    <select
                      className={`form-select ${formErrors.specialization ? 'error' : ''}`}
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    >
                      {SPECIALIZATIONS.filter((s) => s !== 'All Specializations').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {formErrors.specialization && (
                      <span className="error-text">{formErrors.specialization}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Experience (Years) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      className={`form-input ${formErrors.experience ? 'error' : ''}`}
                      placeholder="e.g. 10"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    />
                    {formErrors.experience && (
                      <span className="error-text">{formErrors.experience}</span>
                    )}
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Phone Number <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.phone ? 'error' : ''}`}
                      placeholder="e.g. +91 98490 55443"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-input ${formErrors.email ? 'error' : ''}`}
                      placeholder="e.g. suresh.varma@medpulse.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                  </div>
                </div>

                {/* Availability Checkbox */}
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                      Available for patient bookings
                    </span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '1.75rem' }}>
                    When unchecked, appointments cannot be scheduled with this doctor.
                  </span>
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
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(doctorToDelete)}
        title="Remove Doctor"
        message={`Are you sure you want to delete ${doctorToDelete?.name}? This record will be removed permanently.`}
        confirmText="Delete Doctor"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDoctorToDelete(null)}
      />
    </div>
  );
}
