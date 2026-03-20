import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { Loader, Alert } from '../components/UI';
import Avatar from '../components/Avatar';

const TeacherDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [teacher,  setTeacher]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/teachers/${id}`),
      api.get(`/schedules?teacherId=${id}`),
    ])
      .then(([t, s]) => { setTeacher(t.data); setSchedules(s.data); })
      .catch(() => setError('Failed to load teacher details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!teacher) return <Alert type="error" message={error || 'Teacher not found'} />;

  const fmt   = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const money = n => n ? `₹ ${Number(n).toLocaleString('en-IN')}` : '—';

  const info = [
    ['Designation',       teacher.designation  || '—'],
    ['Teacher ID',        teacher.teacherId],
    ['Email',             teacher.email],
    ['Phone',             teacher.phone],
    ['Gender',            teacher.gender],
    ['Date of Birth',     fmt(teacher.dob)],
    ['Blood Group',       teacher.bloodGroup   || '—'],
    ['Qualification',     teacher.qualification],
    ['Subject',           teacher.subject],
    ['Department',        teacher.department   || '—'],
    ['Experience',        teacher.experience   || '—'],
    ['Date of Joining',   fmt(teacher.joiningDate)],
    ['Monthly Salary',    money(teacher.salary)],
    ['Emergency Contact', teacher.emergencyContact || '—'],
    ['PAN / National ID', teacher.nationalId   || '—'],
    ['Status',            teacher.status],
    ['Area of Interest',  teacher.areaOfInterest || '—'],
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Teacher Profile</div>
          <div className="page-header-sub">NIT Kurukshetra — Full Details</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/teachers')}>← Back</button>
          <button className="btn btn-primary" onClick={() => navigate(`/teachers/edit/${id}`)}>✏️ Edit</button>
        </div>
      </div>

      <Alert type="error" message={error} />

      {/* Hero */}
      <div className="profile-hero" style={{ marginBottom: 22 }}>
        <div className="profile-avatar">
          {teacher.photo
            ?
            //  <img src={`http://localhost:5000${teacher.photo}`} alt={teacher.name} />
          <img
  src={`${process.env.REACT_APP_API_URL}${teacher.photo}`}
  alt={teacher.name}
/>

            : <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#f0f0ff', fontWeight: 800 }}>
                {teacher.name?.[0]?.toUpperCase()}
              </div>}
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{teacher.name}</div>
          <div className="profile-role">{teacher.subject} · {teacher.department || 'NIT Kurukshetra'}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span className={`badge badge-${teacher.status === 'Active' ? 'active' : teacher.status === 'On Leave' ? 'leave' : 'inactive'}`}>
              {teacher.status}
            </span>
            <span style={{ background: 'rgba(108,99,255,0.2)', color: '#8b7eff', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>
              {teacher.teacherId}
            </span>
            {teacher.experience && (
              <span style={{ background: 'rgba(0,212,161,0.15)', color: '#00d4a1', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>
                {teacher.experience}
              </span>
            )}
          </div>
        </div>
        {teacher.salary && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#55556a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Salary</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#00d4a1', marginTop: 4 }}>{money(teacher.salary)}</div>
          </div>
        )}
      </div>

      <div className="two-col">
        {/* Info grid */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, color: '#f0f0ff' }}>📋 Complete Information</div>
          <div className="profile-grid">
            {info.map(([k, v]) => (
              <div key={k} className="profile-field">
                <div className="profile-field-label">{k}</div>
                <div className="profile-field-value">{v}</div>
              </div>
            ))}
          </div>
          {teacher.address && (
            <div className="profile-field" style={{ marginTop: 14 }}>
              <div className="profile-field-label">Address</div>
              <div className="profile-field-value">{teacher.address}</div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>📅 Class Schedule</div>
          {schedules.length === 0
            ? <div style={{ color: '#55556a', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No schedule assigned.</div>
            : schedules.map(s => (
                <div key={s._id} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div className="day-pill" style={{ flexShrink: 0, marginTop: 2 }}>{s.day.slice(0, 3)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#f0f0ff' }}>{s.subject}</div>
                    <div style={{ fontSize: 11, color: '#8888aa', marginTop: 2 }}>
                      {s.className} · {s.startTime}–{s.endTime}{s.room ? ` · Room ${s.room}` : ''}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;
