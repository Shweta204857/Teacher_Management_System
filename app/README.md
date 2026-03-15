# Teacher Management System — MERN Stack

A full-stack Teacher Management System built with **MongoDB, Express.js, React.js, and Node.js**.

---

## 📁 Folder Structure

```
teacher-management/
├── backend/
│   ├── config/         → db.js
│   ├── controllers/    → auth, teacher, attendance, schedule, dashboard
│   ├── middleware/     → authMiddleware.js, upload.js
│   ├── models/         → Admin, Teacher, Attendance, Schedule
│   ├── routes/         → all route files
│   ├── uploads/        → teacher photo uploads (auto-created)
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/ → Sidebar, Navbar, Avatar, UI, Loader, etc.
        ├── context/    → AuthContext.js
        ├── pages/      → All 12 pages
        ├── utils/      → api.js (axios)
        ├── App.js
        ├── index.js
        └── index.css
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Create Admin Account
Open your browser or Postman and run once:
```
POST http://localhost:5000/api/auth/seed-admin
```
This creates: **admin@school.com / admin123**

---

## 🌐 Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/teacher_management
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 🔑 User Roles

| Role    | Email              | Password  |
|---------|--------------------|-----------|
| Admin   | admin@school.com   | admin123  |
| Teacher | (teacher's email)  | (set when adding) |

---

## 🚀 API Endpoints

### Auth
| Method | Route                  | Description       |
|--------|------------------------|-------------------|
| POST   | /api/auth/login        | Login             |
| GET    | /api/auth/me           | Get current user  |
| POST   | /api/auth/seed-admin   | Create default admin |

### Teachers
| Method | Route               | Description          |
|--------|---------------------|----------------------|
| GET    | /api/teachers       | Get all teachers     |
| POST   | /api/teachers       | Add teacher (admin)  |
| GET    | /api/teachers/:id   | Get single teacher   |
| PUT    | /api/teachers/:id   | Update teacher       |
| DELETE | /api/teachers/:id   | Delete teacher       |

### Attendance
| Method | Route                    | Description           |
|--------|--------------------------|-----------------------|
| GET    | /api/attendance          | Get records           |
| POST   | /api/attendance          | Mark single           |
| POST   | /api/attendance/bulk     | Bulk mark (admin)     |
| GET    | /api/attendance/today    | Today's summary       |

### Schedules
| Method | Route                | Description     |
|--------|----------------------|-----------------|
| GET    | /api/schedules       | Get schedules   |
| POST   | /api/schedules       | Create          |
| PUT    | /api/schedules/:id   | Update          |
| DELETE | /api/schedules/:id   | Delete          |

### Dashboard
| Method | Route                    | Description   |
|--------|--------------------------|---------------|
| GET    | /api/dashboard/stats     | Admin stats   |

---

## 🧩 Features

- ✅ JWT Authentication (Admin + Teacher roles)
- ✅ Protected routes (role-based)
- ✅ Teacher CRUD with photo upload
- ✅ Daily attendance with bulk marking
- ✅ Timetable/Schedule management
- ✅ Reports with attendance analytics
- ✅ Fully responsive UI
- ✅ Search & filter across all modules
- ✅ Password hashing with bcrypt
