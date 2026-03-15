// Run this in mongosh to seed the database manually
// Usage: mongosh "mongodb://localhost:27017/nitkkr" mongosh_seed.js

db.teachers.deleteMany({});
db.admins.deleteMany({});
db.schedules.deleteMany({});

db.admins.insertOne({
  name: "NIT Admin",
  email: "admin@nitkkr.ac.in",
  password: "admin123",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});

const teachers = [
  { name:"Prof. Mayank Dave",          teacherId:"NIT-CSE-001", email:"mdave@nitkkr.ac.in",           phone:"01744-233480",   gender:"Male",   qualification:"Ph.D (2002, IIT Roorkee), Senior Member IEEE",                              subject:"Computer Networks",                  department:"Computer Engineering", experience:"25 years", salary:175000, status:"Active", paidLeavesRemaining:10 },
  { name:"Prof. Sanjay Kumar Jain",    teacherId:"NIT-CSE-002", email:"skj.nith@gmail.com",           phone:"+919996127295",  gender:"Male",   qualification:"PhD MNNIT, Allahabad",                                                      subject:"Database Management Systems",        department:"Computer Engineering", experience:"30 years", salary:180000, status:"Active", paidLeavesRemaining:10 },
  { name:"Dr. Mahendra Kumar Murmu",   teacherId:"NIT-CSE-003", email:"mkmurmu@nitkkr.ac.in",         phone:"01744-233539",   gender:"Male",   qualification:"PhD (NIT Kurukshetra), M. Tech. (IIT(ISM) Dhanbad), B.Sc.Engg (BIT Sindri)",subject:"Operating Systems",                  department:"Computer Engineering", experience:"18 years", salary:140000, status:"Active", paidLeavesRemaining:10 },
  { name:"Dr. Bharati Sinha",          teacherId:"NIT-CSE-004", email:"bharatisinha@nitkkr.ac.in",    phone:"01744-233540",   gender:"Female", qualification:"PhD (Pursuing) NIT Kurukshetra, M.Tech (NIT Rourkela)",                    subject:"Artificial Intelligence and Soft Computing", department:"Computer Engineering", experience:"12 years", salary:120000, status:"Active", paidLeavesRemaining:10 },
  { name:"Dr. Shweta Sharma",          teacherId:"NIT-CSE-005", email:"shweta.sharma@nitkkr.ac.in",   phone:"01744-233541",   gender:"Female", qualification:"PhD",                                                                       subject:"CSPE 214 Scripting Languages",       department:"Computer Engineering", experience:"10 years", salary:115000, status:"Active", paidLeavesRemaining:10 },
];

teachers.forEach(t => {
  db.teachers.insertOne({
    ...t,
    password: "teach123",
    role: "teacher",
    photo: "",
    joiningDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print("✅ Seeded: 1 Admin + 5 CSE Faculty");
print("Admin: admin@nitkkr.ac.in / admin123");
print("Teachers: teacherId / teach123");
