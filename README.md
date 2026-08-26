# 🎬 CineReserve - Fullstack Movie Reservation System

Welcome to the CineReserve project! This is a complete, fullstack application built for managing movie reservations. It includes a robust Python FastAPI backend and a beautiful, modern Next.js frontend.

## 🏗 Project Architecture
- **Backend**: FastAPI (Python), SQLAlchemy, PostgreSQL/SQLite, Alembic (Migrations), JWT Authentication.
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion (Animations), Axios.

---

## 🚀 How to Run the Project locally

You need to run both the backend and the frontend simultaneously in two separate terminals.

### Step 1: Start the Backend (FastAPI)

The backend handles all the database logic, authentication (OTP and JWT), movies, and seat bookings.

1. Open your terminal in the root folder of the project (`movie reservation system`).
2. Activate your virtual environment:
   - On Windows: `source venv/Scripts/activate`
   - On Mac/Linux: `source venv/bin/activate`
3. Install Python dependencies (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations to ensure your database is up to date:
   ```bash
   alembic upgrade head
   ```
5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will now be running at `http://localhost:8000`*
   *You can view the interactive API documentation at `http://localhost:8000/docs`*

### Step 2: Start the Frontend (Next.js)

The frontend provides the interactive user interface.

1. Open a **new** terminal window.
2. Navigate into the frontend directory:
   ```bash
   cd frontend
   ```
3. Install the Node.js dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will now be running at `http://localhost:3000`*

---

## 🌟 Key Features

### User Experience (Frontend)
- **Premium Design**: Dark mode UI with glassmorphism and smooth animations.
- **Movie Browsing**: View all available movies and their specific showtimes.
- **Interactive Seat Selection**: A visual cinema screen mapping out available and taken seats.
- **Secure Authentication**: Register using an email OTP flow and login securely via JWT.

### Core Logic (Backend)
- **Role-based Access Control**: Distinguishes between standard users and admins.
- **Automated OTP system**: Temporarily stores users until they verify their email.
- **Seat Conflict Prevention**: Ensures no two users can book the same seat for the same showtime.
- **Robust Database**: Relational schema mapping screens, showtimes, seats, and reservations.

---
**Enjoy the cinema experience with CineReserve! 🍿**
