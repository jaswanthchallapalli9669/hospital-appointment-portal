import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
  X
} from 'lucide-react';
import { patientApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const INITIAL_FORM = {
  name: '',
  age: '',
  gender: 'Female',
  phone: '',
  email: '',
};

export default function Patients() {
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientApi.getAll();
      setPatients(data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load patients list. Please check JSON Server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered patients by name
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPatient(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender || 'Female',
      phone: patient.phone,
      email: patient.email,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Patient name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (formData.age === '' || formData.age === null) {
      errors.age = 'Age is required.';
    } else if (Number(formData.age) < 0 || Number(formData.age) > 130) {
      errors.age = 'Please enter a valid age between 0 and 130.';
    }

    if (!formData.gender) {
      errors.gender = 'Gender is required.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      };

      if (editingPatient) {
        // PUT update
        const updated = await patientApi.update(editingPatient.id, payload);
        setPatients((prev) =>
          prev.map((p) => (String(p.id) === String(editingPatient.id) ? updated : p))
        );
        showToast(`Patient ${payload.name} updated successfully!`, 'success');
      } else {
        // POST create
        const newPatient = await patientApi.create(payload);
        setPatients((prev) => [...prev, newPatient]);
        showToast(`Patient ${payload.name} registered successfully!`, 'success');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving patient record.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    try {
      setIsDeleting(true);
      await patientApi.delete(patientToDelete.id);
      setPatients((prev) => prev.filter((p) => String(p.id) !== String(patientToDelete.id)));
      showToast(`Patient ${patientToDelete.name} has been removed.`, 'info');
      setPatientToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete patient record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* PAGE TOOLBAR */}
      <div className="filter-toolbar">
        <div className="filter-group">
          {/* SEARCH BY PATIENT NAME */}
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-teal" onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>Add Patient</span>
        </button>
      </div>

      {/* PATIENTS TABLE PANEL */}
      <div className="panel-card">
        <div className="panel-header">
          <div className="panel-header-title">
            <Users size={19} color="var(--teal)" />
            <h2>Hospital Patients Directory</h2>
            <span className="panel-badge-count">{filteredPatients.length} patients</span>
          </div>
        </div>

        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Fetching patient records...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={30} />
              </div>
              <h3>No Patients Found</h3>
              <p>
                {searchTerm
                  ? `No patients found matching "${searchTerm}".`
                  : 'No patients have been registered yet. Click "Add Patient" to register one.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name & Email</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="entity-meta">
                          <span className="entity-name">{patient.name}</span>
                          <span className="entity-sub" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Mail size={12} />
                            {patient.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600' }}>{patient.age}</span> yrs
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: patient.gender === 'Female' ? '#fdf2f8' : patient.gender === 'Male' ? '#eff6ff' : '#f1f5f9',
                            color: patient.gender === 'Female' ? '#be185d' : patient.gender === 'Male' ? '#1d4ed8' : '#475569',
                          }}
                        >
                          <User size={12} />
                          {patient.gender}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Phone size={13} color="var(--text-muted)" />
                          <span>{patient.phone}</span>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn-icon edit"
                            onClick={() => handleOpenEdit(patient)}
                            title="Edit Patient"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => setPatientToDelete(patient)}
                            title="Delete Patient"
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

      {/* ADD / EDIT PATIENT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Users size={20} color="var(--teal)" />
                <span>{editingPatient ? 'Edit Patient Details' : 'Register New Patient'}</span>
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
                {/* Patient Name */}
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="e.g. Ramesh Chandra"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>

                {/* Age & Gender */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Age <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="130"
                      className={`form-input ${formErrors.age ? 'error' : ''}`}
                      placeholder="e.g. 35"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                    {formErrors.age && <span className="error-text">{formErrors.age}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Gender <span className="required">*</span>
                    </label>
                    <select
                      className={`form-select ${formErrors.gender ? 'error' : ''}`}
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && <span className="error-text">{formErrors.gender}</span>}
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
                      placeholder="e.g. +91 98480 11223"
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
                      placeholder="e.g. ramesh.chandra@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                  </div>
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
                <button type="submit" className="btn btn-teal" disabled={submitting}>
                  {submitting ? 'Saving...' : editingPatient ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(patientToDelete)}
        title="Remove Patient Record"
        message={`Are you sure you want to delete patient "${patientToDelete?.name}"?`}
        confirmText="Delete Patient"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPatientToDelete(null)}
      />
    </div>
  );
}
