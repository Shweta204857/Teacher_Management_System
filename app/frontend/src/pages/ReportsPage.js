import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Loader, DashboardCard } from '../components/UI';
import Avatar from '../components/Avatar';

const ReportsPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [t, a] = await Promise.all([api.get('/teachers'), api.get('/attendance')]);
        setTeachers(t.data || []);
        setAttendance(a.data || []);
      } catch (err) {
        console.error('Reports error:', err?.response?.status);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const subjects = [...new Set(teachers.map(t => t.subject))].filter(Boolean);
  const filtered = teachers.filter(t =>
    (!filterSubject || t.subject === filterSubject) &&
    (!filterStatus || t.status === filterStatus)
  );

  const getTeacherAttendance = (id) => {
    const recs = attendance.filter(a => a.teacher?._id === id || a.teacher === id);
    const present = recs.filter(r => r.status === 'Present').length;
    return recs.length ? Math.round((present / recs.length) * 100) : null;
  };

  const active = teachers.filter(t => t.status === 'Active').length;
  const onLeave = teachers.filter(t => t.status === 'On Leave').length;
  const today = new Date().toISOString().split('T')[0];
  const todayRecs = attendance.filter(a => a.date === today);
  const presentToday = todayRecs.filter(a => a.status === 'Present').length;

  const printReport = () => window.print();

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Reports & Analytics</div>
          <div className="page-header-sub">Summary of all teacher and attendance data</div>
        </div>
        <button className="btn btn-primary" onClick={printReport}>🖨️ Print Report</button>
      </div>

      <div className="stats-row">
        <DashboardCard icon="👥" label="Total Teachers" value={teachers.length} accent="#4F6EF7" />
        <DashboardCard icon="✅" label="Active" value={active} accent="#10B981" />
        <DashboardCard icon="🏖️" label="On Leave" value={onLeave} accent="#F59E0B" />
        <DashboardCard icon="📋" label="Present Today" value={presentToday} accent="#F97316" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 16 }}>📊 Attendance Overview</div>
        {teachers.slice(0, 10).map((t, i) => {
          const pct = getTeacherAttendance(t._id);
          return (
            <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <Avatar name={t.name} photo={t.photo} size={36} />
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.subject}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${pct ?? 0}%`,
                    background: pct === null ? '#e2e8f0' : pct >= 90 ? 'linear-gradient(90deg,#10B981,#34d399)' : pct >= 75 ? 'linear-gradient(90deg,#F59E0B,#fcd34d)' : 'linear-gradient(90deg,#EF4444,#f87171)',
                  }} />
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 14, minWidth: 48, textAlign: 'right' }}>
                {pct === null ? '—' : `${pct}%`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 15 }}>👩‍🏫 Teacher Records</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 'auto' }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>On Leave</option>
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={t.name} photo={t.photo} size={30} />
                      <div>
                        <div style={{ fontWeight: 800 }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.teacherId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{t.subject}</td>
                  <td style={{ color: '#64748b' }}>{t.qualification}</td>
                  <td style={{ color: '#64748b' }}>{t.experience || '—'}</td>
                  <td style={{ color: '#64748b' }}>{t.joiningDate ? new Date(t.joiningDate).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge badge-${t.status === 'Active' ? 'active' : t.status === 'On Leave' ? 'leave' : 'inactive'}`}>{t.status}</span></td>
                  <td>
                    {(() => {
                      const p = getTeacherAttendance(t._id);
                      return p === null ? <span style={{ color: '#94a3b8' }}>—</span> : (
                        <span style={{ fontWeight: 800, color: p >= 90 ? '#10B981' : p >= 75 ? '#F59E0B' : '#EF4444' }}>{p}%</span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>No records match filters.</div>}
      </div>
    </div>
  );
};

export default ReportsPage;
