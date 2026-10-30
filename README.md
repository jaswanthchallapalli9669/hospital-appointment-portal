# 🏥 MedPulse - Hospital Appointment Management Portal
> **College Capstone Project** | Built with **React JS**, **Vite**, **JSON Server**, and **Vanilla CSS**

A modern, full-featured hospital management application designed for clinical administrators and healthcare desks to manage medical specialists, registered patients, and appointment schedules with real-time feedback and validation.

---

## 🌟 Key Features & Modules

### 1. 📊 Dashboard
- **Live Statistics Cards**: Total Doctors (with active on-duty count), Registered Patients, Booked/Confirmed Appointments, and Completed Consultations.
- **Upcoming Appointments**: Real-time list of upcoming appointments with patient and doctor details, date & time, and status pills.
- **Specialist Roster**: Quick overview of hospital doctors and their current on-duty availability.
- **Quick Actions**: One-click shortcuts to book appointments, register doctors, and add patients.

### 2. 🩺 Doctors Management
- **Directory Table**: View all doctors with their Specialization, Experience (years), Phone, and Email.
- **Search & Filter**: Search doctors by name; filter by clinical specialization (Cardiology, Neurology, Pediatrics, Orthopedics, Dermatology, General Medicine, etc.).
- **Doctor Availability**: Visual status badges (`Available` / `Unavailable`). Doctors can be toggled on/off-duty with a single click.
- **Add & Edit Doctors**: Modal form with validation for name, specialization, experience, phone, email, and availability.
- **Delete Doctor**: Remove doctor records with confirmation protection.

### 3. 👥 Patients Management
- **Patients Directory**: View all registered patients with Age, Gender badge, Phone, and Email.
- **Search**: Instant search by patient name.
- **Add & Edit Patients**: Register new patients with form validation (Name, Age, Gender, Phone, Email).
- **Delete Patient**: Remove patient records with confirmation dialog.

### 4. 📅 Appointments Management
- **Comprehensive Schedule Table**: Displays Patient, Assigned Doctor, Specialization, Date, Time, Reason, and Status.
- **Booking Flow**:
  - Select patient from registered roster.
  - Select doctor (shows real-time availability status).
  - **Availability Enforcement**: Selecting an unavailable doctor displays an alert banner and disables submission.
- **Appointment Statuses**: `Booked`, `Confirmed`, `Completed`, and `Cancelled`.
- **Quick Status Changer**: Change statuses inline or via the modal.
- **Cancellation Notice**: Cancelling an appointment triggers a clear, user-friendly cancellation banner with slot details.
- **Filtering**: Filter appointments by status or by appointment date.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | User interface components and state management |
| **Vite** | Blazing-fast development server and production bundler |
| **React Router v7** | Client-side routing and page navigation |
| **JSON Server** | REST API mock backend running on port `3000` |
| **Fetch API** | Native promise-based HTTP client in `src/services/api.js` |
| **Vanilla CSS** | Modern design system (clean white background, `#0284c7` blue and `#0d9488` teal accents) |
| **Lucide React** | Medical and dashboard icons |

---

## 📂 Project Structure

```
L&T/
├── db.json                     # JSON Server mock database (doctors, patients, appointments)
├── index.html                  # HTML entry point with Google Fonts (Plus Jakarta Sans)
├── package.json                # Project dependencies and startup scripts
├── vite.config.js              # Vite configuration
└── src/
    ├── main.jsx                # Application entry point
    ├── App.jsx                 # Routing configuration (Dashboard, Doctors, Patients, Appointments)
    ├── index.css               # Modern healthcare design system & responsive layout
    ├── services/
    │   └── api.js              # API service layer (GET, POST, PUT, DELETE for all entities)
    ├── context/
    │   └── ToastContext.jsx    # Real-time alert and toast notification system
    ├── components/
    │   ├── Layout.jsx          # App wrapper with sidebar, topbar, and server monitoring
    │   ├── Sidebar.jsx         # Left navigation bar with logo and connection status
    │   ├── Topbar.jsx          # Header with live clock, active page title, and admin badge
    │   └── ConfirmModal.jsx    # Reusable confirmation dialog for delete/cancel actions
    └── pages/
        ├── Dashboard.jsx       # Metrics, stat cards, and upcoming appointments
        ├── Doctors.jsx         # Doctors directory, search, filter, and CRUD
        ├── Patients.jsx        # Patient registry, search, and CRUD
        └── Appointments.jsx    # Appointment scheduler, filters, status updater, and availability guards
```

---

## 🚀 How to Run the Application

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm**

### 2. Start Both Backend and Frontend Together
Run the unified npm script:
```bash
npm start
```
*(This starts both **JSON Server** on port `3000` and the **Vite Dev Server** on port `5173` concurrently.)*

### 3. Or Start Services Individually
- **Terminal 1: JSON Server Backend (Port 3000)**
  ```bash
  npm run server
  ```
- **Terminal 2: React Frontend (Port 5173)**
  ```bash
  npm run dev
  ```

### 4. Open in Your Browser
Visit [http://localhost:5173](http://localhost:5173) to view the portal.

---

## 🧪 Testing Guide for Capstone Submission

### 1. Test Dashboard
1. Open [http://localhost:5173](http://localhost:5173).
2. Check the 4 metric cards:
   - **Total Doctors** (and available doctor count)
   - **Total Patients**
   - **Booked / Confirmed Appointments**
   - **Completed Consultations**
3. Review the **Upcoming Appointments** table.

### 2. Test Doctors Module
1. Click **Doctors** in the sidebar.
2. **Search**: Type `"Ananya"` into the search box — only Dr. Ananya Reddy will appear. Clear the search.
3. **Filter**: Select `"Cardiology"` in the dropdown — only cardiologists will display.
4. **Toggle Availability**: Click on the `"Available"` or `"Unavailable"` badge on any doctor — it toggles status in real-time and updates the database.
5. **Add Doctor**: Click **+ Add Doctor**, fill in all required fields, and click Save. Notice the success toast.
6. **Edit Doctor**: Click the pencil icon on any doctor, change details, and submit.
7. **Delete Doctor**: Click the trash icon, confirm in the modal, and verify the record is removed.

### 3. Test Patients Module
1. Click **Patients** in the sidebar.
2. **Search**: Search for any patient by name (e.g. `"Ravi"` or `"Lakshmi"`).
3. **Add Patient**: Click **+ Add Patient**, enter name, age, gender, phone, email, and submit.
4. **Edit Patient**: Click the edit button and update the patient's phone or email.
5. **Delete Patient**: Click the delete button and confirm.

### 4. Test Appointments Module
1. Click **Appointments** in the sidebar.
2. **Filter by Status**: Choose `"Booked"`, `"Confirmed"`, or `"Completed"` to filter.
3. **Filter by Date**: Select a date using the date picker.
4. **Quick Status Change**: Use the dropdown directly in any row to update from `Booked` to `Confirmed` or `Completed`.
5. **Test Doctor Availability Validation**:
   - Click **Book Appointment**.
   - Select an unavailable doctor (e.g. *Dr. Priya Nair*).
   - Notice the prominent warning banner: *"Doctor Unavailable: Dr. Priya Nair is currently marked as unavailable..."*
   - Notice that the **Confirm Booking** button is disabled with validation feedback.
   - Now select an available doctor (e.g. *Dr. Ananya Reddy* or *Dr. Rahul Sharma*), fill in the date, time, reason, and click **Confirm Booking**.
6. **Test Cancellation Message**:
   - Click the red **Cancel (Ban)** icon on any appointment.
   - Confirm cancellation in the modal dialog.
   - Notice the distinct amber banner at the top: *"Cancellation Notice: Appointment #[ID] ... has been cancelled successfully."*

---

## 📡 REST API Documentation (JSON Server)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/doctors` | Get all doctors |
| `GET` | `/doctors/:id` | Get doctor by ID |
| `POST` | `/doctors` | Add a new doctor |
| `PUT` | `/doctors/:id` | Update doctor details |
| `DELETE` | `/doctors/:id` | Remove a doctor |
| `GET` | `/patients` | Get all patients |
| `GET` | `/patients/:id` | Get patient by ID |
| `POST` | `/patients` | Add a new patient |
| `PUT` | `/patients/:id` | Update patient details |
| `DELETE` | `/patients/:id` | Remove a patient |
| `GET` | `/appointments` | Get all appointments |
| `GET` | `/appointments/:id` | Get appointment by ID |
| `POST` | `/appointments` | Book a new appointment |
| `PUT` | `/appointments/:id` | Update an appointment |
| `DELETE` | `/appointments/:id` | Remove an appointment |
