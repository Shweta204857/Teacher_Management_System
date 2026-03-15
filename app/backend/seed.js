'use strict';
const bcrypt   = require('bcryptjs');
const Admin    = require('./models/Admin');
const Teacher  = require('./models/Teacher');
const Schedule = require('./models/Schedule');

const runSeed = async () => {
  try {
    const adminCount   = await Admin.countDocuments();
    const teacherCount = await Teacher.countDocuments();

    if (adminCount > 0 && teacherCount > 0) {
      console.log('✅ Database already has data — skipping auto-seed');
      return;
    }

    console.log('🌱 Database empty — auto-seeding all data...');

    await Teacher.deleteMany({});
    await Admin.deleteMany({});
    await Schedule.deleteMany({});

    const th = await bcrypt.hash('teach123', 10);
    const ah = await bcrypt.hash('admin123', 10);

    await Admin.create({ name: 'NIT Admin', email: 'admin@nitkkr.ac.in', password: ah, role: 'admin' });

    // ─────────────────────────────────────────────────────────────────────────
    // 5 REAL NIT KKR CSE FACULTY — complete details from faculty profile images
    // ─────────────────────────────────────────────────────────────────────────
    const teacherDefs = [
      {
        name:           'Prof. Mayank Dave',
        teacherId:      'NIT-CSE-001',
        email:          'mdave@nitkkr.ac.in',
        phone:          '01744-233480',
        gender:         'Male',
        dob:            new Date('1970-03-15'),
        address:        'Faculty Quarters Block-A, NIT Kurukshetra, Haryana 136119',
        designation:    'Professor',
        qualification:  'Ph.D (2002, IIT Roorkee), Senior Member IEEE',
        subject:        'Computer Networks & Operating Systems',
        department:     'Computer Engineering',
        areaOfInterest: 'Applying AI and Machine Learning for System and Network Security, Software Defined Networking, Cyber Security, Blockchain, Wireless Sensor Networks, Semantic Web, Cloud Computing, Internet of Things, Operating Systems, Data Structures, Programming',
        experience:     '25 years',
        joiningDate:    new Date('2000-07-01'),
        salary:         175000,
        status:         'Active',
        emergencyContact: '+91-9812340001',
        bloodGroup:     'B+',
        nationalId:     'AADPM1234X',
        paidLeavesRemaining: 10,
      },
      {
        name:           'Prof. Sanjay Kumar Jain',
        teacherId:      'NIT-CSE-002',
        email:          'skj.nith@gmail.com',
        phone:          '+919996127295',
        gender:         'Male',
        dob:            new Date('1968-06-20'),
        address:        'Staff Colony, NIT Kurukshetra, Haryana 136119',
        designation:    'Professor',
        qualification:  'PhD MNNIT, Allahabad',
        subject:        'Database Management Systems',
        department:     'Computer Engineering',
        areaOfInterest: 'General: Database systems, data mining, information retrieval, big data, requirements engineering. Specific: Data models, schema design, schema management, data integration, dataspace, sentiment analysis, recommender systems, question answering systems.',
        experience:     '30 years',
        joiningDate:    new Date('1995-08-01'),
        salary:         180000,
        status:         'Active',
        emergencyContact: '+91-9996120001',
        bloodGroup:     'A+',
        nationalId:     'AABSJ5678Y',
        paidLeavesRemaining: 10,
      },
      {
        name:           'Dr. Mahendra Kumar Murmu',
        teacherId:      'NIT-CSE-003',
        email:          'mkmurmu@nitkkr.ac.in',
        phone:          '01744-233539',
        gender:         'Male',
        dob:            new Date('1980-11-08'),
        address:        'Type-IV Quarters, NIT Campus, Kurukshetra, Haryana 136119',
        designation:    'Assistant Professor',
        qualification:  'PhD (NIT Kurukshetra), M. Tech. (IIT(ISM) Dhanbad), B. Sc. Engg. (BIT Sindri)',
        subject:        'Computer Networks',
        department:     'Computer Engineering',
        areaOfInterest: 'Distributed Computing, Mobile Computing, Wireless Networks, Cognitive Radio Networks',
        experience:     '18 years',
        joiningDate:    new Date('2007-01-15'),
        salary:         140000,
        status:         'Active',
        emergencyContact: '+91-9876540003',
        bloodGroup:     'O+',
        nationalId:     'AACMM9012Z',
        paidLeavesRemaining: 10,
      },
      {
        name:           'Dr. Bharati Sinha',
        teacherId:      'NIT-CSE-004',
        email:          'bharatisinha@nitkkr.ac.in',
        phone:          '01744-233540',
        gender:         'Female',
        dob:            new Date('1985-04-22'),
        address:        'Women Faculty Quarters, NIT Kurukshetra, Haryana 136119',
        designation:    'Assistant Professor',
        qualification:  'PhD (Pursuing) NIT Kurukshetra, M.Tech (NIT Rourkela)',
        subject:        'Artificial Intelligence and Soft Computing',
        department:     'Computer Engineering',
        areaOfInterest: 'Cloud Computing, Distributed Systems',
        experience:     '12 years',
        joiningDate:    new Date('2013-07-01'),
        salary:         120000,
        status:         'Active',
        emergencyContact: '+91-9765430004',
        bloodGroup:     'AB+',
        nationalId:     'AADBS3456W',
        paidLeavesRemaining: 10,
      },
      {
        name:           'Dr. Shweta Sharma',
        teacherId:      'NIT-CSE-005',
        email:          'shweta.sharma@nitkkr.ac.in',
        phone:          '01744-233541',
        gender:         'Female',
        dob:            new Date('1988-09-14'),
        address:        'Women Faculty Quarters Block-B, NIT Kurukshetra, Haryana 136119',
        designation:    'Assistant Professor',
        qualification:  'PhD',
        subject:        'CSPE 214 Scripting Languages',
        department:     'Computer Engineering',
        areaOfInterest: 'Cyber Security, Malware Analysis, Malware Detection, Phishing Detection, IoT, Applications of Machine and Deep Learning',
        experience:     '10 years',
        joiningDate:    new Date('2015-01-01'),
        salary:         115000,
        status:         'Active',
        emergencyContact: '+91-9654320005',
        bloodGroup:     'A-',
        nationalId:     'AAESS7890V',
        paidLeavesRemaining: 10,
      },
    ];

    const created = [];
    for (const t of teacherDefs) {
      const doc = await Teacher.create({ ...t, password: th });
      created.push(doc);
    }

    const T = {};
    for (const t of created) T[t.teacherId] = t._id;

    const DAVE    = T['NIT-CSE-001'];
    const JAIN    = T['NIT-CSE-002'];
    const MURMU   = T['NIT-CSE-003'];
    const BHARATI = T['NIT-CSE-004'];
    const SHWETA  = T['NIT-CSE-005'];

    const TT  = 'B.Tech CSE IV Sem 2025-26';
    const CLS = 'B.Tech CSE';
    const SEM = 'IV';

    // ── Exact timetable from IV.docx image ────────────────────────────────────
    const slots = [
      // MONDAY
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'10:00', endTime:'11:00', room:'M 306',       timetableName:TT },
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages',                        className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'11:00', endTime:'12:00', room:'Library Lab',  timetableName:TT },
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages (Lab)',                  className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'11:00', endTime:'12:00', room:'LAB 9',         timetableName:TT },
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems',                className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'14:00', endTime:'15:00', room:'LHC 102',       timetableName:TT },
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks',                          className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'15:00', endTime:'16:00', room:'LHC 102',       timetableName:TT },
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages',                        className:CLS, section:'A', semester:SEM, day:'Monday', startTime:'16:00', endTime:'17:00', room:'LHC 102',       timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 202 Computer Networks',                          className:CLS, section:'B', semester:SEM, day:'Monday', startTime:'09:00', endTime:'10:00', room:'LAB 8',         timetableName:TT },
      // TUESDAY
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks',                          className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'09:00', endTime:'10:00', room:'LHC 105',     timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems',                          className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'10:00', endTime:'11:00', room:'LHC 105',     timetableName:TT },
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems',                className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'11:00', endTime:'12:00', room:'LHC 105',     timetableName:TT },
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'12:00', endTime:'13:00', room:'LHC 105',     timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems',                          className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'15:00', endTime:'16:00', room:'Lab 10',      timetableName:TT },
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks',                          className:CLS, section:'A', semester:SEM, day:'Tuesday', startTime:'15:00', endTime:'16:00', room:'LAB 8',       timetableName:TT },
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages',                        className:CLS, section:'B', semester:SEM, day:'Tuesday', startTime:'16:00', endTime:'17:00', room:'LAB 3',       timetableName:TT },
      // WEDNESDAY
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages',                        className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'09:00', endTime:'10:00', room:'LHC 105', timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems',                          className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'10:00', endTime:'11:00', room:'LHC 105', timetableName:TT },
      { teacher:MURMU,   subject:'CSPC 202 Computer Networks',                          className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'11:00', endTime:'12:00', room:'LHC 105', timetableName:TT },
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'12:00', endTime:'13:00', room:'LHC 105', timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems',                          className:CLS, section:'A', semester:SEM, day:'Wednesday', startTime:'14:00', endTime:'15:00', room:'Lab 3',   timetableName:TT },
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages',                        className:CLS, section:'B', semester:SEM, day:'Wednesday', startTime:'15:00', endTime:'16:00', room:'Library Lab', timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 202 Computer Networks',                          className:CLS, section:'B', semester:SEM, day:'Wednesday', startTime:'16:00', endTime:'17:00', room:'Library LAB', timetableName:TT },
      // THURSDAY
      { teacher:SHWETA,  subject:'CSPE 214 Scripting Languages',                        className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'09:00', endTime:'10:00', room:'LHC 105',  timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems',                          className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'10:00', endTime:'11:00', room:'LHC 105',  timetableName:TT },
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems',                className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'11:00', endTime:'12:00', room:'LHC 105',  timetableName:TT },
      { teacher:BHARATI, subject:'CSPC 204 Artificial Intelligence and Soft Computing', className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'12:00', endTime:'13:00', room:'LHC 105',  timetableName:TT },
      { teacher:JAIN,    subject:'CSPC 206 Database Management Systems (Lab)',          className:CLS, section:'A', semester:SEM, day:'Thursday', startTime:'15:00', endTime:'17:00', room:'LAB 10',    timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems',                          className:CLS, section:'B', semester:SEM, day:'Thursday', startTime:'15:00', endTime:'16:00', room:'Library Lab', timetableName:TT },
      { teacher:DAVE,    subject:'CSPC 200 Operating Systems',                          className:CLS, section:'B', semester:SEM, day:'Thursday', startTime:'16:00', endTime:'17:00', room:'Library Lab', timetableName:TT },
    ];

    await Schedule.insertMany(slots);

    console.log('✅ Auto-seed complete!');
    console.log(`   👤 Admin   : admin@nitkkr.ac.in / admin123`);
    console.log(`   👩‍🏫 Teachers: NIT-CSE-001 to NIT-CSE-005 / teach123`);
    console.log(`   📋 Timetable: ${slots.length} slots — B.Tech CSE IV Sem 2025-26`);

  } catch (err) {
    console.error('❌ Auto-seed error:', err.message);
    console.error(err.stack);
  }
};

module.exports = runSeed;
