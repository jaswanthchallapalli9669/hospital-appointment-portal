import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  CalendarCheck,
  CheckCircle,
  PlusCircle,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { doctorApi, patientApi, appointmentApi } from '../services/api';

export default function Dashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [doctorsData, patientsData, appointmentsData] = await Promise.all([
        doctorApi.getAll(),
        patientApi.getAll(),
        appointmentApi.getAll(),
      ]);
      setDoctors(doctorsData || []);
      setPatients(patientsData || []);
      setAppointments(appointmentsData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to load dashboard records. Ensure JSON Server is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const totalDoctors = doctors.length;
  const availableDoctors = doctors.filter((doc) => doc.available).length;
  const totalPatients = patients.length;
  const bookedAppointments = appointments.filter((app) => app.status === 'Booked' || app.status === 'Confirmed').length;
  const completedAppointments = appointments.filter((app) => app.status === 'Completed').length;

  // Compute Upcoming Appointments (sorted by date & time, excluding completed/cancelled, or all recent)
  const upcomingAppointments = appointments
    .filter((app) => app.status === 'Booked' || app.status === 'Confirmed')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 5);

  const getDoctorName = (id) => {
    const doc = doctors.find((d) => String(d.id) === String(id));
    return doc ? doc.name : `Doctor #${id}`;
  };

  const getPatientName = (id) => {
    const pat = patients.find((p) => String(p.id) === String(id));
    return pat ? pat.name : `Patient #${id}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading dashboard metrics and appointments...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert-banner danger">
          <div className="alert-content">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <button className="btn btn-outline" onClick={fetchDashboardData} style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* QUICK ACTIONS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
            Welcome to Clinical Administration
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Here is your daily medical operations summary and upcoming schedule.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/appointments" className="btn btn-primary">
            <PlusCircle size={17} />
            <span>Book Appointment</span>
          </Link>
          <Link to="/doctors" className="btn btn-outline">
            <Stethoscope size={17} />
            <span>Manage Doctors</span>
          </Link>
          <Link to="/patients" className="btn btn-outline">
            <Users size={17} />
            <span>Manage Patients</span>
          </Link>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="stats-grid">
        {/* Total Doctors */}
        <div className="stat-card blue">
          <div className="stat-info">
            <span className="stat-title">Total Doctors</span>
            <span className="stat-value">{totalDoctors}</span>
            <span className="stat-desc">
              <strong style={{ color: 'var(--success)' }}>{availableDoctors}</strong> on-duty & available
            </span>
          </div>
          <div className="stat-icon-wrapper">
            <Stethoscope size={28} />
          </div>
        </div>

        {/* Total Patients */}
        <div className="stat-card teal">
          <div className="stat-info">
            <span className="stat-title">Total Patients</span>
            <span className="stat-value">{totalPatients}</span>
            <span className="stat-desc">Registered in portal</span>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={28} />
          </div>
        </div>

        {/* Booked Appointments */}
        <div className="stat-card indigo">
          <div className="stat-info">
            <span className="stat-title">Booked / Confirmed</span>
            <span className="stat-value">{bookedAppointments}</span>
            <span className="stat-desc">Pending & upcoming sessions</span>
          </div>
          <div className="stat-icon-wrapper">
            <CalendarCheck size={28} />
          </div>
        </div>

        {/* Completed Appointments */}
        <div className="stat-card emerald">
          <div className="stat-info">
            <span className="stat-title">Completed Consultations</span>
            <span className="stat-value">{completedAppointments}</span>
            <span className="stat-desc">Successfully treated</span>
          </div>
          <div className="stat-icon-wrapper">
            <CheckCircle size={28} />
          </div>
        </div>
      </div>

      {/* DASHBOARD SPLIT SECTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        {/* UPCOMING APPOINTMENTS */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Calendar size={18} color="var(--primary)" />
              <h2>Upcoming Appointments</h2>
              <span className="panel-badge-count">{upcomingAppointments.length} scheduled</span>
            </div>
            <Link to="/appointments" className="btn btn-outline" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {upcomingAppointments.length === 0 ? (
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <div className="empty-state-icon">
                  <Calendar size={28} />
                </div>
                <h3>No upcoming appointments</h3>
                <p>New bookings will appear here once scheduled.</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className="entity-name">{getPatientName(app.patientId)}</div>
                          <div className="entity-sub">{app.reason}</div>
                        </td>
                        <td>
                          <div className="entity-name">{getDoctorName(app.doctorId)}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}>
                            <Clock size={13} color="var(--text-muted)" />
                            <span>{app.date} • {app.time}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* DOCTORS AVAILABILITY SUMMARY */}
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <UserCheck size={18} color="var(--teal)" />
              <h2>Medical Specialists Roster</h2>
              <span className="panel-badge-count">{doctors.length} doctors</span>
            </div>
            <Link to="/doctors" className="btn btn-outline" style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}>
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="panel-body" style={{ padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {doctors.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.specialization} • {doc.experience} yrs exp
                    </div>
                  </div>
                  <div>
                    {doc.available ? (
                      <span className="badge badge-available">
                        Available
                      </span>
                    ) : (
                      <span className="badge badge-unavailable">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
