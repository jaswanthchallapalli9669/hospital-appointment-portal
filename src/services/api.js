/**
 * Hospital Appointment Management Portal - API Service Layer
 * Interacts with JSON Server running on http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.message) errorMessage = parsed.message;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  // For DELETE responses or empty 204
  if (response.status === 204) return true;
  return response.json();
}

// ----------------- DOCTOR API -----------------
export const doctorApi = {
  // GET all doctors
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/doctors`);
    return handleResponse(response);
  },

  // GET doctor by ID
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/doctors/${id}`);
    return handleResponse(response);
  },

  // POST new doctor
  create: async (doctor) => {
    const response = await fetch(`${BASE_URL}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor),
    });
    return handleResponse(response);
  },

  // PUT update doctor
  update: async (id, doctor) => {
    const response = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor),
    });
    return handleResponse(response);
  },

  // DELETE doctor
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/doctors/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ----------------- PATIENT API -----------------
export const patientApi = {
  // GET all patients
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/patients`);
    return handleResponse(response);
  },

  // GET patient by ID
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/patients/${id}`);
    return handleResponse(response);
  },

  // POST new patient
  create: async (patient) => {
    const response = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    return handleResponse(response);
  },

  // PUT update patient
  update: async (id, patient) => {
    const response = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    return handleResponse(response);
  },

  // DELETE patient
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

// ----------------- APPOINTMENT API -----------------
export const appointmentApi = {
  // GET all appointments
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/appointments`);
    return handleResponse(response);
  },

  // GET appointment by ID
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/appointments/${id}`);
    return handleResponse(response);
  },

  // POST new appointment
  create: async (appointment) => {
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    return handleResponse(response);
  },

  // PUT update appointment
  update: async (id, appointment) => {
    const response = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    return handleResponse(response);
  },

  // DELETE appointment
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
