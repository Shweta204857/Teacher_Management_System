import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Loader, Alert, EmptyState } from '../components/UI';
import Avatar from '../components/Avatar';

const AttendancePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState('');
  const [statuses, setStatuses] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = isAdmin
        ? (filterMonth ? `?month=${filterMonth}` : `?date=${date}`)
        : `?teacherId=${user._id}`;

      const [aRes, tRes] = await Promise.all([
        api.get(`/attendance${query}`),
        isAdmin ? api.get('/teachers') : Promise.resolve({ data: [] }),
      ]);
      setAttendance(aRes.data);
      if (isAdmin) {
        setTeachers(tRes.data);
        const map = {};
        tRes.data.forEach(t => {
          const rec = aRes.data.find(a => a.teacher?._id === t._id || a.teacher === t._id);
          map[t._id] = rec?.status || 'Present';
        });
        setStatuses(map);
      }
    } catch (e) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [date, filterMonth, isAdmin, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBulkSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const records = Object.entries(statuses).map(([teacherId, status]) => ({ teacherId, status }));
      await api.post('/attendance/bulk', { date, records });
      setSuccess('Attendance saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_COLORS = { Present: '#10B981', Absent: '#EF4444', Leave: '#F59E0B' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">{isAdmin ? 'Attendance Management' : 'My Attendance'}</div>
          <div className="page-header-sub">{isAdmin ? 'Mark and track daily attendance' : 'Your attendance history'}</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleBulkSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Attendance'}
          </button>
        )}
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {isAdmin && (
            <>
              <div className="form-group" style={{ gap: 4 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={date} onChange={e => { setDate(e.target.value); setFilterMonth(''); }} style={{ width: 'auto' }} />
              </div>
              <div className="form-group" style={{ gap: 4 }}>
                <label className="form-label">Filter by Month</label>
                <input type="month" className="form-input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 'auto' }} />
              </div>
              {filterMonth && <button className="btn btn-ghost btn-sm" onClick={() => setFilterMonth('')}>Clear</button>}
            </>
          )}
        </div>
      </div>

      {loading ? <Loader /> : (
        isAdmin ? (
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 16 }}>
              Attendance for {filterMonth || date} — {Object.values(statuses).filter(s => s === 'Present').length}/{teachers.length} Present
            </div>
            {teachers.length === 0 ? <EmptyState message="No teachers found." /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {teachers.map((t, i) => (
                  <div key={t._id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 12,
                    background: statuses[t._id] === 'Present' ? '#f0fdf4' : statuses[t._id] === 'Absent' ? '#fff5f5' : '#fffbeb',
                    border: `1.5px solid ${statuses[t._id] === 'Present' ? '#bbf7d0' : statuses[t._id] === 'Absent' ? '#fecaca' : '#fde68a'}`,
                  }}>
                    <Avatar name={t.name} photo={t.photo} size={42} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{t.subject} · {t.teacherId}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['Present', 'Absent', 'Leave'].map(s => (
                        <button key={s} className="att-status-btn"
                          onClick={() => setStatuses(p => ({ ...p, [t._id]: s }))}
                          style={{
                            background: statuses[t._id] === s ? STATUS_COLORS[s] : '#f1f5f9',
                            color: statuses[t._id] === s ? '#fff' : '#64748b',
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 16 }}>Attendance History</div>
            {attendance.length === 0 ? <EmptyState message="No attendance records." /> : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Status</th><th>Marked By</th></tr>
                  </thead>
                  <tbody>
                    {attendance.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 700 }}>{a.date}</td>
                        <td><span className={`badge badge-${a.status.toLowerCase()}`}>{a.status}</span></td>
                        <td style={{ color: '#64748b' }}>Admin</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AttendancePage;
