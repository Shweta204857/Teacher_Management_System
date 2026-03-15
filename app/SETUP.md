# ============================================================
#  NIT Kurukshetra — Teacher Management Portal
#  COMPLETE SETUP GUIDE
# ============================================================

## ✅ STEP 1 — Start MongoDB
Make sure MongoDB is running locally:
```
mongod
```
Or if it runs as a service:
```
net start MongoDB       (Windows)
sudo systemctl start mongod  (Linux/Mac)
```

## ✅ STEP 2 — Install backend dependencies
```
cd backend
npm install
```

## ✅ STEP 3 — Seed the database  ← DO THIS FIRST!
```
node seedTeachers.js
```
Expected output:
  ✅ Connected to mongodb://localhost:27017/teacher_management
  🗑️  Cleared existing teachers and admins
  ✅ Admin created  →  admin@nitkkr.ac.in  /  admin123
  ✅ Rajesh Kumar Sharma    NIT-TCH-001  →  rajesh.sharma@nitkkr.ac.in
  ✅ Anita Singh            NIT-TCH-002  →  anita.singh@nitkkr.ac.in
  ... (5 teachers total)
  🎉 Seed complete!

## ✅ STEP 4 — Start backend server
```
node server.js
```
Server: http://localhost:5000

## ✅ STEP 5 — Start frontend (new terminal)
```
cd frontend
npm install
npm start
```
App: http://localhost:3000

---

## 🔑 Login Credentials

### Admin
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@nitkkr.ac.in     |
| Password | admin123               |

### Teachers — all use password: `teach123`
| Teacher ID  | Name                  | Email                          | Salary     |
|-------------|-----------------------|--------------------------------|------------|
| NIT-TCH-001 | Rajesh Kumar Sharma   | rajesh.sharma@nitkkr.ac.in     | ₹1,25,000  |
| NIT-TCH-002 | Anita Singh           | anita.singh@nitkkr.ac.in       | ₹1,10,000  |
| NIT-TCH-003 | Vikram Mehta          | vikram.mehta@nitkkr.ac.in      | ₹1,18,000  |
| NIT-TCH-004 | Pooja Agarwal         | pooja.agarwal@nitkkr.ac.in     | ₹95,000    |
| NIT-TCH-005 | Suresh Nair           | suresh.nair@nitkkr.ac.in       | ₹1,45,000  |

Teachers can login with EITHER email OR Teacher ID (e.g. NIT-TCH-001)

---

## 👩‍🏫 Teacher Dashboard (after login)
3 main options shown immediately:
  📅 My Schedule   — class timetable, time, room number
  ✅ My Attendance — attendance & leave history
  👤 My Profile    — salary, joining date, department, personal info

---

## 🔧 Admin Features
  • View all teachers in Faculty Directory
  • Add a new teacher (stored in MongoDB immediately)
  • Edit any teacher's details
  • Delete a teacher
  • Manage schedules & attendance
  • View reports/dashboard

---

## 🗄️ MongoDB
  URI      : mongodb://localhost:27017/teacher_management
  Database : teacher_management
  Collections: teachers, admins, schedules, attendances
