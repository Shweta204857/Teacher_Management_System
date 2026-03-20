import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Loader, Alert } from '../components/UI';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState({ newPass: '', confirm: '' });

  useEffect(() => {
    if (user?.role === 'teacher') {
      api.get(`/teachers/${user._id}`).then(r => setProfile(r.data)).finally(() => setLoading(false));
    } else {
      setProfile(user);
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Loader />;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) return setError('Passwords do not match');
    if (password.newPass.length < 6) return setError('Password must be at least 6 characters');
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put(`/teachers/${user._id}`, { password: password.newPass });
      setSuccess('Password updated successfully!');
      setPassword({ newPass: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (date) => date
    ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const fmtSalary = (amt) => amt
    ? `₹ ${Number(amt).toLocaleString('en-IN')}`
    : '—';

  const teacherFields = profile ? [
    ['Designation', profile.designation || '—'],
    ['Teacher ID', profile.teacherId],
    ['Email', profile.email],
    ['Phone', profile.phone],
    ['Gender', profile.gender],
    ['Date of Birth', fmt(profile.dob)],
    ['Qualification', profile.qualification],
    ['Subject', profile.subject],
    ['Department', profile.department || '—'],
    ['Experience', profile.experience || '—'],
    ['Date of Joining', fmt(profile.joiningDate)],
    ['Monthly Salary', fmtSalary(profile.salary)],
    ['Blood Group', profile.bloodGroup || '—'],
    ['PAN / Tax ID', profile.nationalId || '—'],
    ['Emergency Contact', profile.emergencyContact || '—'],
    ['Status', profile.status],
    ['Area of Interest', profile.areaOfInterest || '—'],
  ] : [];

  const adminFields = [
    ['Email', user?.email],
    ['Role', 'System Administrator'],
    ['Institute', 'NIT Kurukshetra'],
  ];

  const fields = user?.role === 'teacher' ? teacherFields : adminFields;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">My Profile</div>
          <div className="page-header-sub">NIT Kurukshetra, Haryana — Faculty Information System</div>
        </div>
      </div>

      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar">
          {profile?.photo
            ? 
            // <img src={`http://localhost:5000${profile.photo}`} alt={user?.name} />

            <img
  src={`${process.env.REACT_APP_API_URL}${profile.photo}`}
  alt={user?.name}
/>
            : (
              <div style={{
                width: 84, height: 84, borderRadius: '50%',
                background: 'rgba(108,99,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, color: '#f0f0ff', fontWeight: 800,
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-role">
            {user?.role === 'admin'
              ? 'System Administrator · NIT Kurukshetra'
              : `${profile?.subject || ''} · ${profile?.department || 'Department'}`}
          </div>
          {user?.role === 'teacher' && profile && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className={`badge badge-${profile.status === 'Active' ? 'active' : profile.status === 'On Leave' ? 'leave' : 'inactive'}`}>
                {profile.status}
              </span>
              {profile.teacherId && (
                <span style={{ background: 'rgba(108,99,255,0.2)', color: '#8b7eff', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>
                  {profile.teacherId}
                </span>
              )}
              {profile.experience && (
                <span style={{ background: 'rgba(0,212,161,0.15)', color: '#00d4a1', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>
                  {profile.experience}
                </span>
              )}
            </div>
          )}
        </div>
        {user?.role === 'teacher' && profile?.salary && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#55556a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Salary</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#00d4a1', marginTop: 4 }}>
              ₹ {Number(profile.salary).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, color: '#55556a', marginTop: 2 }}>per month</div>
          </div>
        )}
      </div>

      <div className="two-col">
        {/* Info Grid */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 18, color: '#f0f0ff' }}>
            👤 Account & Personal Information
          </div>
          <div className="profile-grid">
            {fields.map(([k, v]) => (
              <div key={k} className="profile-field">
                <div className="profile-field-label">{k}</div>
                <div className="profile-field-value">{v || '—'}</div>
              </div>
            ))}
          </div>
          {user?.role === 'teacher' && profile?.address && (
            <div className="profile-field" style={{ marginTop: 14 }}>
              <div className="profile-field-label">Address</div>
              <div className="profile-field-value">{profile.address}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick stats */}
          {user?.role === 'teacher' && profile && (
            <div className="card">
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: '#f0f0ff' }}>📊 Quick Info</div>
              {[
                { icon: '🏛️', label: 'Institute', value: 'NIT Kurukshetra', color: '#6c63ff' },
                { icon: '🏫', label: 'Department', value: profile.department || '—', color: '#8b7eff' },
                { icon: '📚', label: 'Subject', value: profile.subject || '—', color: '#00d4a1' },
                { icon: '⏳', label: 'Experience', value: profile.experience || '—', color: '#ffb830' },
                { icon: '📅', label: 'Joined', value: fmt(profile.joiningDate), color: '#38bdf8' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: 'var(--bg-elevated)',
                  borderRadius: 10, border: '1px solid var(--border-light)', marginBottom: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Change Password */}
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: '#f0f0ff' }}>🔒 Change Password</div>
            <Alert type="error" message={error} />
            <Alert type="success" message={success} />
            <form onSubmit={handlePasswordChange}>
              {[['newPass', 'New Password'], ['confirm', 'Confirm New Password']].map(([k, l]) => (
                <div key={k} className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">{l}</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={password[k]}
                    onChange={e => setPassword(p => ({ ...p, [k]: e.target.value }))}
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
