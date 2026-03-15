import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Alert } from '../components/UI';

const INITIAL = {
  name: '', teacherId: '', email: '', phone: '', gender: '',
  dob: '', address: '', qualification: '', subject: '', department: '',
  experience: '', joiningDate: '', salary: '', bloodGroup: '',
  emergencyContact: '', nationalId: '', password: '', status: 'Active',
};

const DEPTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Engineering',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Electronics & Communication', 'Information Technology', 'Humanities',
];

const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AddTeacherPage = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INITIAL);
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name)          e.name          = 'Required';
    if (!form.teacherId)     e.teacherId     = 'Required';
    if (!form.email)         e.email         = 'Required';
    if (!form.phone)         e.phone         = 'Required';
    if (!form.gender)        e.gender        = 'Required';
    if (!form.qualification) e.qualification = 'Required';
    if (!form.subject)       e.subject       = 'Required';
    if (!form.password)      e.password      = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) { setPhoto(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setError(''); setSuccess('');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    if (photo) fd.append('photo', photo);

    try {
      await api.post('/teachers', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('✅ Teacher added successfully! Redirecting…');
      setTimeout(() => navigate('/teachers'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── tiny field component ── */
  const F = ({ label, name, type = 'text', as, opts = [], placeholder, required, full }) => (
    <div className={`form-group${full ? ' full' : ''}`}>
      <label className="form-label">{label}{required && <span style={{ color: '#ff4d6a' }}> *</span>}</label>
      {as === 'select' ? (
        <select className={`form-select${errors[name] ? ' error' : ''}`}
          value={form[name]} onChange={e => set(name, e.target.value)}>
          <option value="">— Select —</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className={`form-input${errors[name] ? ' error' : ''}`}
          type={type} placeholder={placeholder}
          value={form[name]} onChange={e => set(name, e.target.value)} />
      )}
      {errors[name] && <span className="error-msg">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Add New Teacher</div>
          <div className="page-header-sub">NIT Kurukshetra — Faculty Registration</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/teachers')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Saving…' : '💾 Save Teacher'}
          </button>
        </div>
      </div>

      <Alert type="error"   message={error} />
      <Alert type="success" message={success} />

      {/* Photo */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>📷 Profile Photo</div>
        <div className="photo-upload-wrap">
          <div className="photo-preview">
            {preview ? <img src={preview} alt="preview" /> : <span style={{ fontSize: 32 }}>👤</span>}
          </div>
          <div>
            <input type="file" accept="image/*" id="photo-up" style={{ display: 'none' }} onChange={handlePhoto} />
            <label htmlFor="photo-up" className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              Upload Photo
            </label>
            <div style={{ fontSize: 11, color: '#55556a', marginTop: 6 }}>JPG / PNG, max 5 MB</div>
          </div>
        </div>
      </div>

      {/* Personal */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>👤 Personal Information</div>
        <div className="form-grid">
          <F label="Full Name"     name="name"     required placeholder="e.g. Rajesh Kumar Sharma" />
          <F label="Teacher ID"    name="teacherId" required placeholder="e.g. NIT-TCH-006" />
          <F label="Email Address" name="email"    required type="email" placeholder="name@nitkkr.ac.in" />
          <F label="Phone"         name="phone"    required placeholder="+91-9XXXXXXXXX" />
          <F label="Gender"        name="gender"   required as="select" opts={['Male', 'Female', 'Other']} />
          <F label="Date of Birth" name="dob"      type="date" />
          <F label="Blood Group"   name="bloodGroup" as="select" opts={BLOOD} />
          <F label="Emergency Contact" name="emergencyContact" placeholder="+91-9XXXXXXXXX" />
          <div className="form-group full">
            <label className="form-label">Address</label>
            <input className="form-input" type="text"
              placeholder="e.g. Faculty Quarters Block-A, NIT Kurukshetra, Haryana 136119"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Academic */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>🎓 Academic Information</div>
        <div className="form-grid">
          <F label="Qualification" name="qualification" required placeholder="e.g. Ph.D. Mathematics, IIT Delhi" />
          <F label="Subject"       name="subject"       required placeholder="e.g. Mathematics" />
          <F label="Department"    name="department"    as="select" opts={DEPTS} />
          <F label="Experience"    name="experience"    placeholder="e.g. 10 years" />
          <F label="Joining Date"  name="joiningDate"   type="date" />
          <F label="Status"        name="status"        as="select"
             opts={['Active', 'Inactive', 'On Leave']} />
        </div>
      </div>

      {/* Salary & ID */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>💰 Salary & Identity</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Monthly Salary (₹)</label>
            <input className="form-input" type="number" min="0"
              placeholder="e.g. 125000"
              value={form.salary} onChange={e => set('salary', e.target.value)} />
          </div>
          <F label="PAN / National ID" name="nationalId" placeholder="e.g. AAAPK1234M" />
        </div>
      </div>

      {/* Account */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>🔒 Login Account</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Password <span style={{ color: '#ff4d6a' }}>*</span></label>
            <input className={`form-input${errors.password ? ' error' : ''}`} type="password"
              placeholder="Set login password (min 6 chars)"
              value={form.password} onChange={e => set('password', e.target.value)} />
            {errors.password && <span className="error-msg">{errors.password}</span>}
            <div style={{ fontSize: 11, color: '#55556a', marginTop: 4 }}>
              Teacher can login with their email <strong>or</strong> Teacher ID + this password.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddTeacherPage;
