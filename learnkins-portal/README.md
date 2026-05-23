# LearnKins Internship Student Portal

A modern, gamified learning student portal built for managing cohorts, daily video tracking, resource cataloging, and bulk broadcasts, featuring a stunning **Vanilla CSS** design system.

---

## 🚀 Quick Start Instructions

Follow these direct steps to spin up the local development servers for both the frontend and backend.

### 📋 Prerequisites
- Ensure **Node.js** (v18+) is installed on your local system.
- Ensure a local instance of **MongoDB** is running on your system (defaults to `mongodb://127.0.0.1:27017/learnkins`).

---

## 🛠️ Step 1: Backend Setup & Database Seeding

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd learnkins-portal/backend
   ```

2. Initialize environment configurations:
   - Verify that the default MONGODB_URI in `.env` is correct.
   - If needed, configure your custom SMTP mail server details for Nodemailer. (If left blank, the portal falls back to printing dispatched broadcast emails directly inside the Node terminal console log!)

3. Run the automated seed script to populate test data (1 Admin, 4 Students, 3 Cohorts, 5 Video Lessons, Pinned Announcements, Curated Links, and mock watch progress records):
   ```bash
   npm run seed
   ```

4. Boot up the backend development server (starts on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

---

## 💻 Step 2: Frontend Setup

1. Open a separate terminal window and navigate to the frontend directory:
   ```bash
   cd learnkins-portal/frontend
   ```

2. Spin up the Vite development server (starts on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to: `http://localhost:5173`

---

## 🔑 Default Seed Profiles

Use these pre-seeded developer credentials on the login screen to test different scopes immediately:

### 🎒 Admin Console Profile
- **Email:** `admin@learnkins.com`
- **Password:** `admin123`
- *Features:* View total analytics counters, post news announcements, upload video lessons, manage cohort directories, edit resource catalog lists, and send bulk template mail dispatches!

### 🎓 Student Profile (Batch Alpha)
- **Email:** `student1@learnkins.com`
- **Password:** `student123`
- *Features:* View daily recommendation cards, read notices board updates, access targeted resources, watch videos inside a custom player with background progress auto-syncing, and view earned achievement badges!

### 🎓 Student Profile (Batch Beta)
- **Email:** `student3@learnkins.com`
- **Password:** `student123`

---

## 🌟 Architectural Features

### 1. Credentials-Based Session (No JWT)
As per design specifications, this portal does **not use cryptographic JWT signatures**. 
- Successful login returns the standard MongoDB student user document, which the client persists inside `localStorage`.
- All subsequent Axios API dispatches automatically inject the standard header: `x-user-id: <user_id>`.
- The backend's authentication middleware validates this acting user ID directly against MongoDB to authorize active requests based on roles (`admin` or `student`).

### 2. Auto-Sync Video Progress Tracker
- The Student Video Player listens to playback updates, pausing, buffering, and seeks.
- Playback status automatically dispatches watch progress ratios (0-100%) incrementally to the `/api/progress/update` endpoint.
- Crossing a **90% watch rate** automatically flags the video module as `completed` and unlocks gamification badges!

### 3. Broadcast Template Engine Fallback
- Bulk email broadcasting includes three clean responsive templates (**Welcome**, **Weekly Reminder**, and **Custom Notice**).
- Fallback logging: In development, if SMTP credentials are not configured in `.env`, the system prints HTML templates and dispatch targets directly in the console, ensuring zero server crashes during testing!
