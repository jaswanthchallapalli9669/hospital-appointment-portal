/**
 * Hospital Appointment Management Portal - Dual-Mode API Service Layer
 * Supports:
 *  1. Local JSON Server on http://localhost:3000 (when running locally with `npm start`)
 *  2. Cloud Deployment (Vercel) with intelligent local-storage state persistence seeded from db.json
 */

import defaultDb from '../../db.json';

const BASE_URL = 'http://localhost:3000';

// Initialize and manage local persistence for cloud / Vercel deployment
const STORAGE_KEYS = {
  DOCTORS: 'medpulse_doctors_data',
  PATIENTS: 'medpulse_patients_data',
  APPOINTMENTS: 'medpulse_appointments_data',
};

function getLocalData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Storage access warning:', e);
  }
  return fallback;
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save warning:', e);
  }
}

// Ensure default records are initialized in browser storage if not already present
function ensureInitialized() {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      setLocalData(STORAGE_KEYS.DOCTORS, defaultDb.doctors || []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      setLocalData(STORAGE_KEYS.PATIENTS, defaultDb.patients || []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      setLocalData(STORAGE_KEYS.APPOINTMENTS, defaultDb.appointments || []);
    }
  }
}

ensureInitialized();

// Helper to determine if we should attempt network or fall back immediately
let useOfflineFallback = false;

async function executeWithFallback(networkAction, fallbackAction) {
  // If we already know we're on cloud (e.g. Vercel) where localhost:3000 is unavailable
  const isCloudHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  if (isCloudHost || useOfflineFallback) {
    return fallbackAction();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const result = await networkAction(controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (err) {
    // If connection to localhost:3000 failed, switch to fallback seamlessly
    console.warn('JSON Server (localhost:3000) not responding. Seamlessly using local data storage for cloud/offline resilience.', err.message);
    useOfflineFallback = true;
    return fallbackAction();
  }
}

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
  if (response.status === 204) return true;
  return response.json();
}

// ----------------- DOCTOR API -----------------
export const doctorApi = {
  getAll: async () => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/doctors`, { signal });
        return handleResponse(res);
      },
      () => getLocalData(STORAGE_KEYS.DOCTORS, defaultDb.doctors)
    );
  },

  getById: async (id) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/doctors/${id}`, { signal });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.DOCTORS, defaultDb.doctors);
        const item = list.find((d) => String(d.id) === String(id));
        if (!item) throw new Error(`Doctor #${id} not found`);
        return item;
      }
    );
  },

  create: async (doctor) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/doctors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doctor),
          signal,
        });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.DOCTORS, defaultDb.doctors);
        const newDoc = { ...doctor, id: String(Date.now()) };
        list.push(newDoc);
        setLocalData(STORAGE_KEYS.DOCTORS, list);
        return newDoc;
      }
    );
  },

  update: async (id, doctor) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/doctors/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doctor),
          signal,
        });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.DOCTORS, defaultDb.doctors);
        const index = list.findIndex((d) => String(d.id) === String(id));
        if (index === -1) throw new Error(`Doctor #${id} not found`);
        list[index] = { ...doctor, id: String(id) };
        setLocalData(STORAGE_KEYS.DOCTORS, list);
        return list[index];
      }
    );
  },

  delete: async (id) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/doctors/${id}`, {
          method: 'DELETE',
          signal,
        });
        return handleResponse(res);
      },
      () => {
        let list = getLocalData(STORAGE_KEYS.DOCTORS, defaultDb.doctors);
        list = list.filter((d) => String(d.id) !== String(id));
        setLocalData(STORAGE_KEYS.DOCTORS, list);
        return true;
      }
    );
  },
};

// ----------------- PATIENT API -----------------
export const patientApi = {
  getAll: async () => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/patients`, { signal });
        return handleResponse(res);
      },
      () => getLocalData(STORAGE_KEYS.PATIENTS, defaultDb.patients)
    );
  },

  getById: async (id) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/patients/${id}`, { signal });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.PATIENTS, defaultDb.patients);
        const item = list.find((p) => String(p.id) === String(id));
        if (!item) throw new Error(`Patient #${id} not found`);
        return item;
      }
    );
  },

  create: async (patient) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patient),
          signal,
        });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.PATIENTS, defaultDb.patients);
        const newPatient = { ...patient, id: String(Date.now()) };
        list.push(newPatient);
        setLocalData(STORAGE_KEYS.PATIENTS, list);
        return newPatient;
      }
    );
  },

  update: async (id, patient) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/patients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patient),
          signal,
        });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.PATIENTS, defaultDb.patients);
        const index = list.findIndex((p) => String(p.id) === String(id));
        if (index === -1) throw new Error(`Patient #${id} not found`);
        list[index] = { ...patient, id: String(id) };
        setLocalData(STORAGE_KEYS.PATIENTS, list);
        return list[index];
      }
    );
  },

  delete: async (id) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/patients/${id}`, {
          method: 'DELETE',
          signal,
        });
        return handleResponse(res);
      },
      () => {
        let list = getLocalData(STORAGE_KEYS.PATIENTS, defaultDb.patients);
        list = list.filter((p) => String(p.id) !== String(id));
        setLocalData(STORAGE_KEYS.PATIENTS, list);
        return true;
      }
    );
  },
};

// ----------------- APPOINTMENT API -----------------
export const appointmentApi = {
  getAll: async () => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/appointments`, { signal });
        return handleResponse(res);
      },
      () => getLocalData(STORAGE_KEYS.APPOINTMENTS, defaultDb.appointments)
    );
  },

  getById: async (id) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/appointments/${id}`, { signal });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.APPOINTMENTS, defaultDb.appointments);
        const item = list.find((a) => String(a.id) === String(id));
        if (!item) throw new Error(`Appointment #${id} not found`);
        return item;
      }
    );
  },

  create: async (appointment) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointment),
          signal,
        });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.APPOINTMENTS, defaultDb.appointments);
        const newApp = { ...appointment, id: String(Date.now()) };
        list.push(newApp);
        setLocalData(STORAGE_KEYS.APPOINTMENTS, list);
        return newApp;
      }
    );
  },

  update: async (id, appointment) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/appointments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointment),
          signal,
        });
        return handleResponse(res);
      },
      () => {
        const list = getLocalData(STORAGE_KEYS.APPOINTMENTS, defaultDb.appointments);
        const index = list.findIndex((a) => String(a.id) === String(id));
        if (index === -1) throw new Error(`Appointment #${id} not found`);
        list[index] = { ...appointment, id: String(id) };
        setLocalData(STORAGE_KEYS.APPOINTMENTS, list);
        return list[index];
      }
    );
  },

  delete: async (id) => {
    return executeWithFallback(
      async (signal) => {
        const res = await fetch(`${BASE_URL}/appointments/${id}`, {
          method: 'DELETE',
          signal,
        });
        return handleResponse(res);
      },
      () => {
        let list = getLocalData(STORAGE_KEYS.APPOINTMENTS, defaultDb.appointments);
        list = list.filter((a) => String(a.id) !== String(id));
        setLocalData(STORAGE_KEYS.APPOINTMENTS, list);
        return true;
      }
    );
  },
};
