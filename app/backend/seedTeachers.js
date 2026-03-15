'use strict';
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '.env') }); } catch(e) {}

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/teacher_management';

// Inline schemas — avoids model import issues
const Teacher = mongoose.model('Teacher', new mongoose.Schema({
  name:String, teacherId:{type:String,unique:true}, email:{type:String,unique:true,lowercase:true},
  phone:String, gender:String, dob:Date, address:String, qualification:String, subject:String,
  department:String, experience:String, joiningDate:Date, salary:Number, photo:{type:String,default:''},
  password:{type:String,required:true}, role:{type:String,default:'teacher'}, status:{type:String,default:'Active'},
  emergencyContact:String, bloodGroup:String, nationalId:String
}, { timestamps:true }));

const Admin = mongoose.model('Admin', new mongoose.Schema({
  name:String, email:{type:String,unique:true,lowercase:true},
  password:{type:String,required:true}, role:{type:String,default:'admin'}
}, { timestamps:true }));

async function seed() {
  console.log('\n================================================');
  console.log('  NIT Kurukshetra — Seed Script');
  console.log('  URI:', MONGO_URI);
  console.log('================================================\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch(e) {
    console.error('❌ Cannot connect:', e.message);
    console.error('   Is mongod running?\n');
    process.exit(1);
  }

  await Teacher.deleteMany({});
  await Admin.deleteMany({});
  console.log('🗑️  Cleared old data\n');

  const th = await bcrypt.hash('teach123', 10);
  const ah = await bcrypt.hash('admin123', 10);

  await Admin.create({ name:'NIT Admin', email:'admin@nitkkr.ac.in', password:ah, role:'admin' });
  console.log('✅ Admin: admin@nitkkr.ac.in / admin123');

  const teachers = [
    { name:'Rajesh Kumar Sharma', teacherId:'NIT-TCH-001', email:'rajesh.sharma@nitkkr.ac.in', phone:'+91-9812345678', gender:'Male', dob:new Date('1978-04-12'), address:'Faculty Quarters Block-A, NIT Kurukshetra, Haryana 136119', qualification:'Ph.D. Mathematics, IIT Delhi', subject:'Mathematics', department:'Mathematics', experience:'20 years', joiningDate:new Date('2004-07-15'), salary:125000, status:'Active', emergencyContact:'+91-9812345670', bloodGroup:'B+', nationalId:'AAAPK1234M' },
    { name:'Anita Singh',         teacherId:'NIT-TCH-002', email:'anita.singh@nitkkr.ac.in',   phone:'+91-9876543210', gender:'Female', dob:new Date('1985-09-25'), address:'Staff Colony House-12, NIT Kurukshetra, Haryana 136119', qualification:'M.Tech. Computer Science, NIT Kurukshetra', subject:'Computer Science', department:'Computer Engineering', experience:'14 years', joiningDate:new Date('2010-08-01'), salary:110000, status:'Active', emergencyContact:'+91-9876543200', bloodGroup:'A+', nationalId:'AABPS5678F' },
    { name:'Vikram Mehta',        teacherId:'NIT-TCH-003', email:'vikram.mehta@nitkkr.ac.in',  phone:'+91-9988776655', gender:'Male', dob:new Date('1982-01-18'), address:'Type-IV Quarters, NIT Campus, Kurukshetra, Haryana 136119', qualification:'Ph.D. Physics, IIT Roorkee', subject:'Physics', department:'Physics', experience:'17 years', joiningDate:new Date('2007-01-10'), salary:118000, status:'Active', emergencyContact:'+91-9988776600', bloodGroup:'O+', nationalId:'AACPM9012X' },
    { name:'Pooja Agarwal',       teacherId:'NIT-TCH-004', email:'pooja.agarwal@nitkkr.ac.in', phone:'+91-9765432109', gender:'Female', dob:new Date('1990-06-05'), address:'Guest House Road, NIT Kurukshetra, Haryana 136119', qualification:'M.Sc. Chemistry, Delhi University', subject:'Chemistry', department:'Chemistry', experience:'9 years', joiningDate:new Date('2015-09-20'), salary:95000, status:'Active', emergencyContact:'+91-9765432100', bloodGroup:'AB+', nationalId:'AADPA3456Z' },
    { name:'Suresh Nair',         teacherId:'NIT-TCH-005', email:'suresh.nair@nitkkr.ac.in',   phone:'+91-9654321098', gender:'Male', dob:new Date('1975-11-30'), address:'Residential Complex, NIT Kurukshetra, Haryana 136119', qualification:'Ph.D. Electrical Engineering, IIT Bombay', subject:'Electrical Engineering', department:'Electrical Engineering', experience:'24 years', joiningDate:new Date('2000-06-01'), salary:145000, status:'Active', emergencyContact:'+91-9654321000', bloodGroup:'O-', nationalId:'AAEPN7890Y' },
  ];

  for (const t of teachers) {
    await Teacher.create({ ...t, password: th });
    console.log(`✅ ${t.teacherId}  ${t.name}`);
  }

  console.log('\n================================================');
  console.log('  🎉 Seed complete! 5 teachers + 1 admin');
  console.log('  Admin:   admin@nitkkr.ac.in / admin123');
  console.log('  Teacher: NIT-TCH-001        / teach123');
  console.log('================================================\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
