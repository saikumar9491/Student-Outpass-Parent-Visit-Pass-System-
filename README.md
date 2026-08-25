# Student Outpass & Parent Visit Pass Management System

A production-quality, full-stack college hostel gate-clearance and visitor monitoring portal built with Node.js, Express, React, and Tailwind CSS.

---

## Technical Stack
- **Frontend**: React.js + Vite, Tailwind CSS (v4), Lucide React, React Hot Toast
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Atlas) + Mongoose
- **Auth**: JWT + Bcrypt password hashing
- **QR Code**: Server-side QR data URL generator

---

## Features
- **Student Portal**: Register, apply for outpasses (with overlap validation), view digital passes, and download/print Passes with secure verification QR codes.
- **Parent Portal**: Register, link to student roll number, request visitor passes (with calendar duplicate check), view status logs.
- **Admin Dashboard**: Stat metrics counters, CSS-based charts for outpass/visitor trends, unified pending request queue, approve/reject operations (mandatory rejection reason required).
- **Public QR Validation**: Publicly accessible gate checkpoint `/verify-pass?id=PASS_ID` to verify pass legitimacy, check active times, and handle lazy pass expirations.

---

## Directory Structure
- `server/`: Express backend APIs, Mongoose models, security middlewares, controllers, and seed scripts.
- `client/`: Vite-based React SPA styled with Tailwind CSS v4.

---

## Getting Started

### 1. Prerequisite
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory.

`server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://user:user123@cluster0.dmaf4l4.mongodb.net/hostel_pass_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=supersecuresecretkey123!@#
CLIENT_URL=http://localhost:5173
```

### 3. Installation

Install Server Dependencies:
```bash
cd server
npm install
```

Install Client Dependencies:
```bash
cd ../client
npm install
```

### 4. Seed Admin Account
Run the database seeder script to initialize the system administrator account:
```bash
cd ../server
npm run seed
```
*Seeded credentials:*
- **Email**: `admin@hostel.edu`
- **Password**: `adminpassword123`

### 5. Running the Application

Open two terminal windows to run both application layers:

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
```
The server will run on `http://localhost:5000`.

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`.

---

## Testing / Verification Walkthrough

1. **Start Server and Client**: Run `npm run dev` in both folders.
2. **Student Flow**:
   - Go to `http://localhost:5173` and click **Student Portal**.
   - Register a student profile (e.g., Name: `Sai Kumar`, Roll: `CS202604`).
   - Click **Apply Outpass** and apply for a weekend outing. It status becomes `PENDING`.
3. **Parent Flow**:
   - Register a parent profile and link using roll `CS202604`.
   - Submit a visitor request (Date: tomorrow). Its status becomes `PENDING`.
4. **Admin Flow**:
   - Login to the Admin Portal using `admin@hostel.edu` / `adminpassword123`.
   - View dashboard metrics.
   - Click **Approve** on the Student Outpass request.
   - Click **Reject** on the Parent Visit request, inputting "Hostel floor renovation" as the reason.
5. **Security Gate Check**:
   - Go to the student portal and view the approved outpass details card. You will see a cryptographically secure `passId` (e.g. `9F4B3C`) and a verification QR code.
   - Go to `http://localhost:5173/verify-pass?id=9F4B3C` (simulating a gate guard scan). The pass is verified as `VALID` and student info is displayed.
