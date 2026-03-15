import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI';

const LoginPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [role,    setRole]   = useState('admin');
  const [form,    setForm]   = useState({ email: '', password: '' });
  const [error,   setError]  = useState('');
  const [loading, setLoading]= useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill all fields');
    setLoading(true); setError('');
    try {
      await login(form.email.trim(), form.password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (r) => { setRole(r); setError(''); setForm({ email: '', password: '' }); };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Institute header */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #6c63ff, #8b7eff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, boxShadow: '0 0 30px rgba(108,99,255,0.4)',
          }}>🎓</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#f0f0ff', letterSpacing: '-0.5px' }}>
            NIT Kurukshetra
          </div>
          <div style={{ fontSize: 11, color: '#6c63ff', fontWeight: 700, marginTop: 4, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Teacher Management Portal
          </div>
          <div style={{ fontSize: 11, color: '#55556a', marginTop: 3 }}>Haryana — 136119</div>
        </div>

        {/* Role tabs */}
        <div className="role-tabs">
          <button className={`role-tab${role === 'admin'   ? ' active' : ''}`} onClick={() => switchRole('admin')}>
            🔑 Admin
          </button>
          <button className={`role-tab${role === 'teacher' ? ' active' : ''}`} onClick={() => switchRole('teacher')}>
            👩‍🏫 Teacher
          </button>
        </div>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">
              {role === 'teacher' ? 'Email Address or Teacher ID' : 'Admin Email'}
            </label>
            <input
              className="form-input"
              type="text"
              placeholder={role === 'admin' ? 'admin@nitkkr.ac.in' : 'e.g. NIT-TCH-001  or  name@nitkkr.ac.in'}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="username"
            />
            {role === 'teacher' && (
              <div style={{ fontSize: 11, color: '#55556a', marginTop: 4 }}>
                💡 Login with your <strong style={{ color: '#8b7eff' }}>email</strong> or <strong style={{ color: '#8b7eff' }}>Teacher ID</strong>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 26 }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ padding: '13px', fontSize: 14, borderRadius: 12 }}
          >
            {loading ? '⏳ Signing in…' : `Sign In as ${role === 'admin' ? 'Admin' : 'Teacher'}`}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="demo-creds">
          <div className="demo-creds-title">📋 Demo Credentials</div>

          <div style={{ fontSize: 11, color: '#55556a', marginBottom: 5, marginTop: 8 }}>Admin</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#8888aa' }}>
            admin@nitkkr.ac.in &nbsp;/&nbsp; admin123
          </div>

          <div style={{ height: 1, background: '#2a2a3a', margin: '10px 0' }} />

          <div style={{ fontSize: 11, color: '#55556a', marginBottom: 8 }}>
            Teachers — password: <strong style={{ color: '#6c63ff' }}>teach123</strong>
          </div>
          {[
            ['NIT-TCH-001', 'Rajesh Kumar Sharma'],
            ['NIT-TCH-002', 'Anita Singh'],
            ['NIT-TCH-003', 'Vikram Mehta'],
            ['NIT-TCH-004', 'Pooja Agarwal'],
            ['NIT-TCH-005', 'Suresh Nair'],
          ].map(([tid, name]) => (
            <div key={tid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6c63ff', fontWeight: 700 }}>{tid}</span>
              <span style={{ fontSize: 11, color: '#8888aa' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
