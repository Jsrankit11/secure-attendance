# 🛡️ SecureAttendance — Full-Stack Cryptographic Attendance Management System

> **"Cryptographic Proof of Presence. Zero-Trust Record Integrity."**  
> *Production-Style Full-Stack Cybersecurity System Built for Hackathons & Enterprise Classrooms*

---

## 🌟 Executive Summary

**SecureAttendance** is a full-stack, production-grade attendance management system engineered to prevent unauthorized tampering, record falsification, and unauthorized access in academic and enterprise environments.

It bridges modern web applications with zero-trust cryptographic primitives:
- **Authentication**: JWT session tokens with strict Role-Based Access Control (RBAC).
- **Password Hashing**: `bcrypt` with 12 salt rounds (plain-text passwords never stored).
- **Confidentiality**: **AES-256-GCM** authenticated symmetric encryption for sensitive student notes and accommodation records with 96-bit IVs and 128-bit authentication tags.
- **Integrity**: **HMAC-SHA256** canonical record verification to detect unauthorized database manipulation.
- **Auditability**: Cryptographically linked **SHA-256 block hash-chain** providing an immutable audit trail.
- **Face AI Biometric Attendance**: Camera kiosk & manual photo upload verification with confidence scoring.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Vite |
| **Backend** | Node.js, Express.js (REST API on Port 5000), CORS, dotenv |
| **Database** | MongoDB with Mongoose (Dual-mode: connects to MongoDB daemon or resilient zero-config embedded persistent engine) |
| **Authentication** | JWT (`jsonwebtoken`), HTTP Bearer tokens, RBAC (`Instructor`, `Student`, `Security Admin`) |
| **Password Security** | `bcryptjs` with 12 salt rounds |
| **Encryption** | `crypto` module: **AES-256-GCM** authenticated cipher |
| **Integrity** | `crypto` module: **HMAC-SHA256** canonicalization |
| **Audit Logs** | Cryptographically chained SHA-256 block ledger (`prevHash` ➔ `currentHash`) |

---

## 🔒 Security Architecture & Requirements

### 1. Zero Plain-Text Passwords
- All passwords are encrypted on creation and update using `bcrypt` with 12 work factor salt rounds.
- Resistant against rainbow tables, brute-force dictionaries, and credential stuffing.

### 2. Role-Based Access Control (RBAC) & Student Isolation
- **Instructor**: Full access to all attendance sessions, marking methods, student rosters, audit logs, and security telemetry.
- **Student**: Isolated view. The server-side API `/api/attendance` filters records so students can **only** inspect their own attendance history and cryptographic proofs.
- Unauthorized cross-student record modification attempts are blocked at the middleware layer and immediately logged as security violations.

### 3. Canonical String Specification & HMAC-SHA256 Integrity
Every attendance mark generates a deterministic RFC canonical format:
```text
CS-ATTENDANCE-V1|SESSION:{sessionId}|STUDENT:{studentId}|TIME:{timestamp}|STATUS:{status}|INSTRUCTOR:{instructorId}
```
An `HMAC-SHA256` signature is computed using a secure server-side root secret key. Any direct database modification (e.g., changing status from `Absent` to `Present`) invalidates the tag and flags the row as `CRITICAL_TAMPER_DETECTED`.

### 4. AES-256-GCM Private Attendance Storage
- Confidential medical or disability accommodations and private instructor notes are encrypted using AES-256 in Galois/Counter Mode (GCM).
- Only authenticated instructors can view decrypted notes; database dumps expose only ciphertext, IV, and auth tags.

### 5. Cryptographic Block Chaining (Audit Trail)
- All security-critical events (login, attendance mark, photo update, tamper detection, manual fix) are written to an immutable block ledger where each block includes the SHA-256 hash of the preceding block:
$$\text{Block Hash} = \text{SHA-256}(\text{BlockNumber} + \text{Timestamp} + \text{Actor} + \text{Action} + \text{PrevHash} + \text{Details})$$
- The entire chain can be audited and mathematically verified in 1 click.

---

## 👥 Pre-Seeded Hackathon Accounts

The system comes pre-seeded with 1 Instructor and 5 verified Student accounts:

| Role | Full Name | Student ID | Email | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Instructor** | Prof. Ankit Sharma | `INST-007` | `a.sharma@cybershield.edu` | `Password@2026!` |
| **Student** | Vedika Gupta | `STU-001` | `vedika.gupta@cybershield.edu` | `Password@2026!` |
| **Student** | Shashwat Srivastava | `STU-002` | `shashwat.srivastava@cybershield.edu` | `Password@2026!` |
| **Student** | Ankit Chaudhary | `STU-003` | `ankit.chaudhary@cybershield.edu` | `Password@2026!` |
| **Student** | Vaishnavi Tiwari | `STU-004` | `vaishnavi.tiwari@cybershield.edu` | `Password@2026!` |
| **Student** | Harshit Dwivedi | `STU-005` | `harshit.dwivedi@cybershield.edu` | `Password@2026!` |

> 💡 *Quick Login*: The Login page includes a **Quick Demo Login** selector that populates credentials with one click.

---

## 🖥️ System Pages & Navigation

1. **Login & Registration (`/auth`)**:
   - Zero-Trust login with password strength calculator, TOTP challenge simulation, and rate-limiting lockout timer (30s).
2. **Instructor Dashboard (`/dashboard`)**:
   - Comprehensive telemetry, active attendance rate, security alerts, and attendance distribution donut chart.
3. **Student Dashboard (`/student-dashboard`)**:
   - Student-isolated private view: personal attendance rate, exam eligibility meter (75% threshold), cryptographic HMAC proof validator, and historical logs.
4. **Student Management (`/students`)**:
   - Roster of all 5 enrolled students, real profile photos, key fingerprints, and manual photo upload triggers.
5. **Attendance Management (`/attendance`)**:
   - Face AI biometrics kiosk with webcam and manual photo upload scanner, confidence HUD, and manual mark overrides.
6. **Attendance History (`/history`)**:
   - Complete ledger with canonical string inspector, cryptographic HMAC hash badges, and authenticated CSV export.
7. **Security Monitoring & Tamper Lab (`/lab`)**:
   - Real-time tampering simulator: modify database rows without authorization, inspect the signature mismatch, trigger critical security alerts, and execute authorized re-signing.
8. **Audit Logs (`/audit`)**:
   - Blockchain-inspired SHA-256 immutable block chain visualizer with 1-click full chain mathematical verification.
9. **Profile & Settings (`/settings`)**:
   - Security keys, cryptographic engine specifications, active device sessions, and remote revocation.

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB (Optional — built-in embedded storage provides 100% zero-configuration operation if MongoDB is not installed locally)

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/cybershield/secure-attendance.git
cd secure-attendance
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default keys are pre-configured in `.env` for hackathon evaluation:
- `PORT=5000`
- `MONGO_URI=mongodb://localhost:27017/secure_attendance`
- `JWT_SECRET=super_secret_jwt_key_hackathon_2026_cybershield_ai`
- `HMAC_SECRET_KEY=CS_K1_PRODUCTION_SECRET_98fbc10`
- `AES_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`

### Step 3: Run the Full-Stack Application

**Terminal 1 — Backend Express Server (Port 5000):**
```bash
npm run server
```

**Terminal 2 — Frontend React + Vite Client (Port 5173):**
```bash
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🧪 Testing Instructions

### Run Automated Security Test Suite
We have bundled an automated cryptographic verification test suite that verifies all 20 security assertions:
```bash
npm run test:security
```
**Test Coverage Includes:**
- `bcrypt` 12-round salt hashing and negative password testing
- `AES-256-GCM` authenticated encryption, decryption, and tampered ciphertext rejection
- `HMAC-SHA256` deterministic canonical string hashing and constant-time verification
- Simulated database tampering and verification rejection
- Student role data isolation
- SHA-256 immutable audit block chaining

### Run Production Build
```bash
npm run build
```

---

## 🚨 Hackathon Demo Walkthrough: Detecting Unauthorized Tampering

To demonstrate Requirement 9 (**Tampering detection alerts**) to judges:

1. Log in as **Prof. Ankit Sharma** (Instructor).
2. Navigate to **Security Monitoring & Tamper Lab** (`/lab`) or **Attendance History** (`/history`).
3. Locate student **Vedika Gupta** (`STU-001`). Note the status is `Present` and the integrity status is `VERIFIED` with a valid green HMAC-SHA256 badge.
4. Click **"Tamper Record"** (or trigger `POST /api/attendance/:id/tamper`).
5. Change the status from `Present` to `Absent` directly in the database without calculating the authorized HMAC tag.
6. Observe what happens instantly:
   - The status changes to `FAILED` with a red pulsing shield.
   - A critical security alarm banner appears: *"Manual DB row manipulation detected! Canonical record status changed to Absent but HMAC was signed for previous state."*
   - A `CRITICAL` severity event is appended to the SHA-256 Audit Log.
7. Click **"Re-compute & Fix"** to show authorized cryptographic re-sealing using the server's private key. The record returns to `VERIFIED`.

---

## 🌐 Production Deployment Guide

### Deploying to MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Set network access to `0.0.0.0/0` and create a database user.
3. Update `MONGO_URI` in `.env` with your connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/secure_attendance?retryWrites=true&w=majority
   ```

### Deploying the Backend (Render / Railway / Heroku)
1. Set the root directory to project root.
2. Build command: `npm install`
3. Start command: `npm run server`
4. Set environment variables: `JWT_SECRET`, `HMAC_SECRET_KEY`, `AES_ENCRYPTION_KEY`, `MONGO_URI`, `NODE_ENV=production`.

### Deploying the Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Add API rewrite/proxy pointing `/api/*` to your deployed backend URL.

---

## 📜 License
MIT License. Built for the **Build It Secure Hackathon**.
Designed and developed with enterprise security standards by **CyberShield AI Team**.
