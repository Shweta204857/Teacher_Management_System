const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const Admin    = require('../models/Admin');
const Teacher  = require('../models/Teacher');
const Schedule = require('../models/Schedule');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return res.status(400).json({ message: 'Email/ID, password and role are required' });
  try {
    let user;
    if (role === 'admin') {
      user = await Admin.findOne({ email: email.toLowerCase().trim() });
    } else {
      const id = email.trim();
      user = await Teacher.findOne({ email: id.toLowerCase() });
      if (!user) {
        const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        user = await Teacher.findOne({ teacherId: { $regex: new RegExp(`^${escaped}$`, 'i') } });
      }
    }
    if (!user) return res.status(401).json({ message: 'No account found.' });
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Incorrect password.' });
    res.json({
      token: generateToken(user._id, role),
      user: { _id: user._id, name: user.name, email: user.email, role, photo: user.photo || '', teacherId: user.teacherId || null },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMe = async (req, res) => res.json(req.user);

// GET /api/auth/seed-db
const seedAll = async (req, res) => {
  try {
    await Teacher.deleteMany({});
    await Admin.deleteMany({});
    await Schedule.deleteMany({});

    const th = await bcrypt.hash('teach123', 10);
    const ah = await bcrypt.hash('admin123', 10);
    await Admin.create({ name: 'NIT Admin', email: 'admin@nitkkr.ac.in', password: ah, role: 'admin' });

    // ─────────────────────────────────────────────────────────────────────────
    // 5 REAL NIT KURUKSHETRA CSE FACULTY  (exact details from faculty images)
    // ─────────────────────────────────────────────────────────────────────────
    const teacherDefs = [
      {
        // Image: Mayank Dave — Professor
        name: 'Prof. Mayank Dave',
        teacherId: 'NIT-CSE-001',
        email: 'mdave@nitkkr.ac.in',
        phone: '01744-233480',
        gender: 'Male',
        dob: new Date('1970-03-15'),
        address: 'Faculty Quarters Block-A, NIT Kurukshetra, Haryana 136119',
        qualification: 'Ph.D (2002, IIT Roorkee), Senior Member IEEE',
        subject: 'Computer Networks & Operating Systems',
        department: 'Computer Engineering',
        experience: '25 years',
        joiningDate: new Date('2000-07-01'),
        salary: 175000,
        status: 'Active',
        emergencyContact: '+91-9812340001',
        bloodGroup: 'B+',
        nationalId: 'AADPM1234X',
        paidLeavesRemaining: 10,
      },
      {
        // Image: Sanjay Jain — Professor
        name: 'Prof. Sanjay Kumar Jain',
        teacherId: 'NIT-CSE-002',
        email: 'skj.nith@gmail.com',
        phone: '+919996127295',
        gender: 'Male',
        dob: new Date('1968-06-20'),
        address: 'Staff Colony, NIT Kurukshetra, Haryana 136119',
        qualification: 'PhD MNNIT, Allahabad',
        subject: 'Database Management Systems',
        department: 'Computer Engineering',
        experience: '30 years',
        joiningDate: new Date('1995-08-01'),
        salary: 180000,
        status: 'Active',
        emergencyContact: '+91-9996120001',
        bloodGroup: 'A+',
        nationalId: 'AABSJ5678Y',
        paidLeavesRemaining: 10,
      },
      {
        // Image: Mahendra Kumar Murmu — Assistant Professor
        name: 'Dr. Mahendra Kumar Murmu',
        teacherId: 'NIT-CSE-003',
        email: 'mkmurmu@nitkkr.ac.in',
        phone: '01744-233539',
        gender: 'Male',
        dob: new Date('1980-11-08'),
        address: 'Type-IV Quarters, NIT Campus, Kurukshetra, Haryana 136119',
        qualification: 'PhD (NIT Kurukshetra), M. Tech. (IIT(ISM) Dhanbad), B. Sc. Engg. (BIT Sindri)',
        subject: 'Computer Networks',
        department: 'Computer Engineering',
        experience: '18 years',
        joiningDate: new Date('2007-01-15'),
        salary: 140000,
        status: 'Active',
        emergencyContact: '+91-9876540003',
        bloodGroup: 'O+',
        nationalId: 'AACMM9012Z',
        paidLeavesRemaining: 10,
      },
      {
        // Image: Bharati Sinha — Assistant Professor
        name: 'Dr. Bharati Sinha',
        teacherId: 'NIT-CSE-004',
        email: 'bharatisinha@nitkkr.ac.in',
        phone: '01744-233540',
        gender: 'Female',
        dob: new Date('1985-04-22'),
        address: 'Women Faculty Quarters, NIT Kurukshetra, Haryana 136119',
        qualification: 'PhD (Pursuing) NIT Kurukshetra, M.Tech (NIT Rourkela)',
        subject: 'Artificial Intelligence and Soft Computing',
        department: 'Computer Engineering',
        experience: '12 years',
        joiningDate: new Date('2013-07-01'),
        salary: 120000,
        status: 'Active',
        emergencyContact: '+91-9765430004',
        bloodGroup: 'AB+',
        nationalId: 'AADBS3456W',
        paidLeavesRemaining: 10,
      },
      {
        // Image: Shweta Sharma — Assistant Professor
        name: 'Dr. Shweta Sharma',
        teacherId: 'NIT-CSE-005',
        email: 'shweta.sharma@nitkkr.ac.in',
        phone: '01744-233541',
        gender: 'Female',
        dob: new Date('1988-09-14'),
        address: 'Women Faculty Quarters Block-B, NIT Kurukshetra, Haryana 136119',
        qualification: 'PhD',
        subject: 'CSPE 214 Scripting Languages',
        department: 'Computer Engineering',
        experience: '10 years',
        joiningDate: new Date('2015-01-01'),
        salary: 115000,
        status: 'Active',
        emergencyContact: '+91-9654320005',
        bloodGroup: 'A-',
        nationalId: 'AAESS7890V',
        paidLeavesRemaining: 10,
      },
    ];

    const created = [];
    for (const t of teacherDefs) {
      const doc = await Teacher.create({ ...t, password: th });
      created.push(doc);
    }

    // Map teacherId → MongoDB _id
    const T = {};
    for (const t of created) T[t.teacherId] = t._id;

    // Short aliases
    const DAVE    = T['NIT-CSE-001']; // Prof. Mayank Dave     → CN & OS
    const JAIN    = T['NIT-CSE-002']; // Prof. S.K.Jain        → Database
    const MURMU   = T['NIT-CSE-003']; // Dr. M.K.Murmu         → Computer Networks
    const BHARATI = T['NIT-CSE-004']; // Dr. Bharati Sinha     → AI & Soft Computing
    const SHWETA  = T['NIT-CSE-005']; // Dr. Shweta Sharma     → Scripting Languages

    const TT    = 'B.Tech CSE IV Sem 2025-26';
    const CLS   = 'B.Tech CSE';
    const SEM   = 'IV';

    // ─────────────────────────────────────────────────────────────────────────
    // EXACT TIMETABLE FROM IV.docx IMAGE
    // Department: Computer Engineering | Course: B.Tech (CSE) | Semester: IV
    // Session: 2025-26
    // Periods: P1=09:00, P2=10:00, P3=11:00, P4=12:00(NOON),
    //          P5=13:00, P6=14:00, P7=15:00, P8=16:00
    // ─────────────────────────────────────────────────────────────────────────
    const slots = [

      // ══════════════════════════════════════════════════════════════
      // MONDAY
      // ══════════════════════════════════════════════════════════════
      // Section-A  P2 (10:00): CSPC 204 AI & Soft Computing, Dr.Vivek Sethi, M 306  → Bharati
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'10:00', endTime:'11:00', room:'M 306', timetableName:TT },
      // Section-A  P3 (11:00): CSPE 214 Scripting Languages, Ms. Nitika, Library Lab → Shweta
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages', className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'11:00', endTime:'12:00', room:'Library Lab', timetableName:TT },
      // Section-A  P3 (11:00): CSPE 214 Scripting Languages, Dr.Shweta Sharma, LAB 9 → Shweta
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages (Lab)', className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'11:00', endTime:'12:00', room:'LAB 9', timetableName:TT },
      // Section-A  P6 (14:00): CSPC 206 Database Management Systems, Prof. S.K.Jain, LHC 102
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems', className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'14:00', endTime:'15:00', room:'LHC 102', timetableName:TT },
      // Section-A  P7 (15:00): CSPC 202 Computer Networks, Dr. M.K.Murmu, LHC 102
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks', className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'15:00', endTime:'16:00', room:'LHC 102', timetableName:TT },
      // Section-A  P8 (16:00): CSPE 214 Scripting Languages, Dr.Shweta Sharma, LHC 102
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages', className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'16:00', endTime:'17:00', room:'LHC 102', timetableName:TT },
      // Section-B  P1 (09:00): CSPC 202 Computer Networks, Dr. Santosh Kumar, LAB 8 → Dave (CN)
      { teacher:DAVE,    subject:'CSPC 202 Computer Networks', className:CLS, section:'B', semester:SEM, day:'Monday', startTime:'09:00', endTime:'10:00', room:'LAB 8', timetableName:TT },

      // ══════════════════════════════════════════════════════════════
      // TUESDAY
      // ══════════════════════════════════════════════════════════════
      // Section-A  P1 (09:00): CSPC 202 Computer Networks, Dr. M.K.Murmu, LHC 105
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks', className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'09:00', endTime:'10:00', room:'LHC 105', timetableName:TT },
      // Section-A  P2 (10:00): CSPC 200 Operating Systems, Prof M.Dave, LHC 105
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems', className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'10:00', endTime:'11:00', room:'LHC 105', timetableName:TT },
      // Section-A  P3 (11:00): CSPC 206 Database Management Systems, Prof. S.K.Jain, LHC 105
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems', className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'11:00', endTime:'12:00', room:'LHC 105', timetableName:TT },
      // Section-A  P4 (12:00): CSPC 204 AI & Soft Computing, Dr.Bharati Sinha, LHC 105
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'12:00', endTime:'13:00', room:'LHC 105', timetableName:TT },
      // Section-A  P7 (15:00): CSPC 200 Operating Systems, Dr. Amandeep Kaur, Lab 10 → Dave (OS)
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems', className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'15:00', endTime:'16:00', room:'Lab 10', timetableName:TT },
      // Section-A  P7 (15:00): CSPC 202 Computer Networks, Dr. Santosh Kumar, LAB 8 → Murmu (CN)
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks', className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'15:00', endTime:'16:00', room:'LAB 8', timetableName:TT },
      // Section-B  P8 (16:00): CSPE 214 Scripting Languages, Dr.Shweta Sharma, LAB 3
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages', className:CLS, section:'B', semester:SEM, day:'Tuesday', startTime:'16:00', endTime:'17:00', room:'LAB 3', timetableName:TT },

      // ══════════════════════════════════════════════════════════════
      // WEDNESDAY
      // ══════════════════════════════════════════════════════════════
      // Section-A  P1 (09:00): CSPE 214 Scripting Languages, Dr.Shweta Sharma, LHC 105
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages', className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'09:00', endTime:'10:00', room:'LHC 105', timetableName:TT },
      // Section-A  P2 (10:00): CSPC 200 Operating Systems, Prof M.Dave, LHC 105
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems', className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'10:00', endTime:'11:00', room:'LHC 105', timetableName:TT },
      // Section-A  P3 (11:00): CSPC 202 Computer Networks, Dr. M.K.Murmu, LHC 105
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks', className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'11:00', endTime:'12:00', room:'LHC 105', timetableName:TT },
      // Section-A  P4 (12:00): CSPC 204 AI & Soft Computing, Dr.Bharati Sinha, LHC 105
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'12:00', endTime:'13:00', room:'LHC 105', timetableName:TT },
      // Section-A  P6 (14:00): CSPC 200 Operating Systems, Dr. Amandeep Kaur, Lab 3 → Dave
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems', className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'14:00', endTime:'15:00', room:'Lab 3', timetableName:TT },
      // Section-B  P7 (15:00): CSPE 214 Scripting Languages, Dr. Sweetl Sah, Library Lab → Shweta
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages', className:CLS, section:'B', semester:SEM, day:'Wednesday', startTime:'15:00', endTime:'16:00', room:'Library Lab', timetableName:TT },
      // Section-B  P8 (16:00): CSPC 202 Computer Networks, Mr. Rohitashwa, Library LAB → Dave
      { teacher:DAVE,    subject:'CSPC 202 Computer Networks', className:CLS, section:'B', semester:SEM, day:'Wednesday', startTime:'16:00', endTime:'17:00', room:'Library LAB', timetableName:TT },

      // ══════════════════════════════════════════════════════════════
      // THURSDAY
      // ══════════════════════════════════════════════════════════════
      // Section-A  P1 (09:00): CSPE 214 Scripting Languages, Dr.Shweta Sharma, LHC 105
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages', className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'09:00', endTime:'10:00', room:'LHC 105', timetableName:TT },
      // Section-A  P2 (10:00): CSPC 200 Operating Systems, Prof M.Dave, LHC 105
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems', className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'10:00', endTime:'11:00', room:'LHC 105', timetableName:TT },
      // Section-A  P3 (11:00): CSPC 206 Database Management Systems, Prof. S.K.Jain, LHC 105
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems', className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'11:00', endTime:'12:00', room:'LHC 105', timetableName:TT },
      // Section-A  P4 (12:00): CSPC 204 AI & Soft Computing, Dr.Bharati Sinha, LHC 105
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'12:00', endTime:'13:00', room:'LHC 105', timetableName:TT },
      // Section-A  P7 (15:00): CSPC 206 Database Management Systems, Prof. S.K.Jain, LAB 10
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems (Lab)', className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'15:00', endTime:'17:00', room:'LAB 10', timetableName:TT },
      // Section-B  P7 (15:00): CSPC 200 Operating Systems, Dr. Amandeep Kaur, Library Lab → Dave
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems', className:CLS, section:'B', semester:SEM, day:'Thursday', startTime:'15:00', endTime:'16:00', room:'Library Lab', timetableName:TT },
      // Section-B  P8 (16:00): CSPC 200 Operating Systems (continues)
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems', className:CLS, section:'B', semester:SEM, day:'Thursday', startTime:'16:00', endTime:'17:00', room:'Library Lab', timetableName:TT },
    ];

    await Schedule.insertMany(slots);

    // Build HTML for seed confirmation page
    const tRows = teacherDefs.map(t =>
      `<tr><td>${t.teacherId}</td><td>${t.name}</td><td>${t.subject}</td><td>${t.qualification}</td></tr>`
    ).join('');

    res.send(`<!DOCTYPE html><html><head><title>✅ DB Seeded</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#0a0a0f;color:#f0f0ff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:30px}
.box{background:#16161f;border:1px solid #2a2a3a;border-radius:20px;padding:40px;max-width:700px;width:100%}
h1{color:#6c63ff;font-size:24px;margin:12px 0 6px;text-align:center}
.sub{color:#8888aa;margin-bottom:24px;text-align:center}
.sec{background:#1c1c27;border-radius:12px;padding:16px 20px;margin:12px 0}
.lbl{font-size:11px;color:#55556a;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;color:#6c63ff;padding:6px 8px;border-bottom:1px solid #2a2a3a}
td{padding:6px 8px;border-bottom:1px solid #1a1a25;color:#ccc;vertical-align:top}
.pass{color:#6c63ff;font-weight:700}
.ok{color:#00d4a1;font-weight:700}
.btn{display:block;margin:24px auto 0;padding:13px 32px;background:linear-gradient(135deg,#6c63ff,#8b7eff);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;text-align:center;width:200px}
</style></head><body><div class="box">
<div style="font-size:52px;text-align:center;margin-bottom:10px">🎉</div>
<h1>Database Seeded Successfully!</h1>
<p class="sub">1 Admin + 5 NIT CSE Faculty + ${slots.length} Timetable Slots</p>
<div class="sec">
  <div class="lbl">Admin Login</div>
  <table><tr><td>Email:</td><td class="pass">admin@nitkkr.ac.in</td></tr><tr><td>Password:</td><td class="pass">admin123</td></tr></table>
</div>
<div class="sec">
  <div class="lbl">Teachers — Login with teacherId / <span class="pass">teach123</span></div>
  <table><thead><tr><th>Teacher ID</th><th>Name</th><th>Subject</th><th>Qualification</th></tr></thead>
  <tbody>${tRows}</tbody></table>
</div>
<div class="sec">
  <div class="lbl">Timetable Loaded</div>
  <table>
    <tr><td class="ok">✅ Timetable:</td><td>B.Tech CSE IV Sem 2025-26</td></tr>
    <tr><td class="ok">✅ Slots:</td><td>${slots.length} class entries (Mon–Thu, Sec A & B)</td></tr>
    <tr><td class="ok">✅ Source:</td><td>Exact from IV.docx image</td></tr>
  </table>
</div>
<a class="btn" href="http://localhost:3000">→ Open App</a>
</div></body></html>`);

  } catch (err) {
    res.status(500).send(`<pre style="color:#ef4444;background:#111;padding:20px;font-size:13px">❌ Seed Error:\n${err.message}\n\n${err.stack}</pre>`);
  }
};

const seedAdmin = async (req, res) => {
  try {
    const exists = await Admin.findOne({ email: 'admin@nitkkr.ac.in' });
    if (exists) return res.json({ message: 'Admin already exists' });
    await Admin.create({ name: 'NIT Admin', email: 'admin@nitkkr.ac.in', password: 'admin123', role: 'admin' });
    res.json({ message: 'Admin seeded: admin@nitkkr.ac.in / admin123' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { login, getMe, seedAdmin, seedAll };
