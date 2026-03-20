# ================================================================
#  HOW TO GET DATA INTO MONGODB  — 3 Methods (pick any one)
# ================================================================

## ✅ METHOD 1 — Easiest: Browser URL (Recommended)
No command line needed!

STEP 1: Start your backend server
  cd backend
  npm install
  node server.js

STEP 2: Open this URL in your browser:
  http://localhost:5000/api/auth/seed-db

STEP 3: You will see this JSON response:
  { "success": true, "message": "🎉 Database seeded successfully!", ... }

STEP 4: Refresh MongoDB Compass → you will see 1 admin + 5 teachers!

═══════════════════════════════════════════════════════════════

## ✅ METHOD 2 — Command Line seed script

STEP 1: Open terminal/command prompt in the backend folder
STEP 2: Run:
  npm install
  node seedTeachers.js

STEP 3: You should see green ✅ checkmarks for each teacher
STEP 4: Refresh MongoDB Compass to verify

═══════════════════════════════════════════════════════════════

## ✅ METHOD 3 — MongoDB Compass Shell (mongosh_seed.js)

STEP 1: Open MongoDB Compass
STEP 2: Click ">_ Open MongoDB Shell" button (top-right)
STEP 3: Type this command (replace path with yours):

  load("C:\\Users\\YourName\\Downloads\\nitkkr\\backend\\mongosh_seed.js")

  ⚠️ Common path examples:
  load("C:\\nitkkr\\backend\\mongosh_seed.js")
  load("C:\\Users\\Rishav\\Desktop\\nitkkr\\backend\\mongosh_seed.js")

STEP 4: Press Enter — you will see ✅ messages
STEP 5: Refresh MongoDB Compass

═══════════════════════════════════════════════════════════════

## 📋 Login Credentials (after seeding)

  ADMIN:
  Email:    admin@nitkkr.ac.in
  Password: admin123

  TEACHERS (all use password: teach123):
  NIT-TCH-001 → Rajesh Kumar Sharma  → rajesh.sharma@nitkkr.ac.in
  NIT-TCH-002 → Anita Singh          → anita.singh@nitkkr.ac.in
  NIT-TCH-003 → Vikram Mehta         → vikram.mehta@nitkkr.ac.in
  NIT-TCH-004 → Pooja Agarwal        → pooja.agarwal@nitkkr.ac.in
  NIT-TCH-005 → Suresh Nair          → suresh.nair@nitkkr.ac.in

  💡 Teachers can login with EITHER email OR Teacher ID
     Example: type "NIT-TCH-001" in the email field

═══════════════════════════════════════════════════════════════

## 🔁 Full Start Sequence (every time you work on the project)

  Terminal 1 — Backend:
    cd backend
    node server.js

  Terminal 2 — Frontend:
    cd frontend
    npm start

  Browser → process.env.REACT_APP_API_URL
