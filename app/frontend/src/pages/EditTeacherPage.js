import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { Loader, Alert } from '../components/UI';

const DEPTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Engineering',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Electronics & Communication', 'Information Technology', 'Humanities',
];
const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EditTeacherPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [form,    setForm]    = useState({});
  const [photo,   setPhoto]   = useState(null);
  const [preview, setPreview] = useState('');
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    api.get(`/teachers/${id}`)
      .then(r => {
        const d = r.data;
        setTeacher(d);
        setForm({
          name:             d.name             || '',
          teacherId:        d.teacherId        || '',
          email:            d.email            || '',
          phone:            d.phone            || '',
          gender:           d.gender           || '',
          dob:              d.dob              ? d.dob.split('T')[0]          : '',
          address:          d.address          || '',
          qualification:    d.qualification    || '',
          subject:          d.subject          || '',
          department:       d.department       || '',
          experience:       d.experience       || '',
          joiningDate:      d.joiningDate      ? d.joiningDate.split('T')[0] : '',
          salary:           d.salary           || '',
          bloodGroup:       d.bloodGroup       || '',
          emergencyContact: d.emergencyContact || '',
          nationalId:       d.nationalId       || '',
          status:           d.status           || 'Active',
          password:         '',
        });
        setPreview(d.photo || '');
      })
      .catch(() => setError('Failed to load teacher data'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) { setPhoto(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, v);
    });
    if (photo) fd.append('photo', photo);

    try {
      await api.put(`/teachers/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('✅ Teacher updated successfully! Redirecting…');
      setTimeout(() => navigate('/teachers'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const F = ({ label, name, type = 'text', as, opts = [], placeholder }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {as === 'select' ? (
        <select className="form-select" value={form[name] || ''}
          onChange={e => set(name, e.target.value)}>
          <option value="">— Select —</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className="form-input" type={type} placeholder={placeholder}
          value={form[name] || ''} onChange={e => set(name, e.target.value)} />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="page-header">
        <div>
          <div className="page-header-title">Edit Teacher</div>
          <div className="page-header-sub">Updating: {teacher?.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/teachers')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '⏳ Saving…' : '💾 Update Teacher'}
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
            {/* {preview
              ? <img src={preview.startsWith('blob') ? preview : `http://localhost:5000${preview}`} alt="preview" />
              : <span style={{ fontSize: 32 }}>👤</span>} */}

              {preview ? (
  <img
    src={
      preview.startsWith('blob')
        ? preview
        : `${process.env.REACT_APP_API_URL}${preview}`
    }
    alt="preview"
  />
) : (
  <span style={{ fontSize: 32 }}>👤</span>
)}
          </div>
          <div>
            <input type="file" accept="image/*" id="photo-edit" style={{ display: 'none' }} onChange={handlePhoto} />
            <label htmlFor="photo-edit" className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              Change Photo
            </label>
          </div>
        </div>
      </div>

      {/* Personal */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>👤 Personal Information</div>
        <div className="form-grid">
          <F label="Full Name"          name="name"             placeholder="Full name" />
          <F label="Teacher ID"         name="teacherId"        placeholder="NIT-TCH-001" />
          <F label="Email"              name="email"            type="email" />
          <F label="Phone"              name="phone"            placeholder="+91-9XXXXXXXXX" />
          <F label="Gender"             name="gender"           as="select" opts={['Male', 'Female', 'Other']} />
          <F label="Date of Birth"      name="dob"              type="date" />
          <F label="Blood Group"        name="bloodGroup"       as="select" opts={BLOOD} />
          <F label="Emergency Contact"  name="emergencyContact" placeholder="+91-9XXXXXXXXX" />
          <div className="form-group full">
            <label className="form-label">Address</label>
            <input className="form-input" type="text" placeholder="Full address"
              value={form.address || ''} onChange={e => set('address', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Academic */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>🎓 Academic Information</div>
        <div className="form-grid">
          <F label="Qualification" name="qualification" placeholder="e.g. Ph.D. IIT Delhi" />
          <F label="Subject"       name="subject"       placeholder="e.g. Mathematics" />
          <F label="Department"    name="department"    as="select" opts={DEPTS} />
          <F label="Experience"    name="experience"    placeholder="e.g. 10 years" />
          <F label="Joining Date"  name="joiningDate"   type="date" />
          <F label="Status"        name="status"        as="select" opts={['Active', 'Inactive', 'On Leave']} />
        </div>
      </div>

      {/* Salary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>💰 Salary & Identity</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Monthly Salary (₹)</label>
            <input className="form-input" type="number" min="0" placeholder="e.g. 125000"
              value={form.salary || ''} onChange={e => set('salary', e.target.value)} />
          </div>
          <F label="PAN / National ID" name="nationalId" placeholder="e.g. AAAPK1234M" />
        </div>
      </div>

      {/* Password */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>🔒 Change Password</div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">New Password <span style={{ color: '#55556a', fontWeight: 400 }}>(leave blank to keep current)</span></label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditTeacherPage;
