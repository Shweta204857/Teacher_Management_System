'use strict';
const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const connectDB = require('./config/db');
const runSeed   = require('./seed');

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/teachers',   require('./routes/teacherRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/schedules',  require('./routes/scheduleRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/leaves',     require('./routes/leaveRoutes'));

app.get('/', (req, res) => res.json({ message: '✅ NIT KKR Teacher Management API Running' }));

const PORT = parseInt(process.env.PORT) || 5000;

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  // Auto-seed if database is empty — no manual step needed
  await runSeed();

  const server = app.listen(PORT, () => {
    console.log('\n================================================');
    console.log('  NIT Kurukshetra — Teacher Management API');
    console.log('================================================');
    console.log(`  Server  : http://localhost:${PORT}`);
    console.log(`  Re-Seed : http://localhost:${PORT}/api/auth/seed-db`);
    console.log('  Admin   : admin@nitkkr.ac.in / admin123');
    console.log('  Teachers: NIT-CSE-001 to 005 / teach123');
    console.log('================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const next = PORT + 1;
      console.log(`⚠️  Port ${PORT} busy — trying ${next}`);
      app.listen(next, () => console.log(`✅ Server on http://localhost:${next}`));
    } else { throw err; }
  });
};

startServer();
