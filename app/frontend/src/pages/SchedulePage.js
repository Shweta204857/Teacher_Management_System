import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Loader, Alert, EmptyState } from '../components/UI';
import Avatar from '../components/Avatar';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const BLANK = { teacher: '', subject: '', className: '', section: '', semester: '', day: 'Monday', startTime: '', endTime: '', room: '', timetableName: '' };

const SchedulePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeDay, setActiveDay] = useState('All');

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = isAdmin ? '/schedules' : `/schedules?teacherId=${user._id}`;
      const [s, t] = await Promise.all([
        api.get(url),
        isAdmin ? api.get('/teachers') : Promise.resolve({ data: [] }),
      ]);
      setSchedules(s.data || []);
      if (isAdmin) setTeachers(t.data || []);
    } catch (err) {
      setError('Failed to load schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const openAdd = () => { setEditing(null); setForm(BLANK); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s._id);
    setForm({ teacher: s.teacher?._id || '', subject: s.subject, className: s.className, section: s.section || '', semester: s.semester || '', day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room, timetableName: s.timetableName || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) await api.put(`/schedules/${editing}`, form);
      else await api.post('/schedules', form);
      setSuccess(editing ? 'Schedule updated!' : 'Schedule created!');
      setShowModal(false);
      fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch {
      setError('Delete failed');
    }
  };

  const filteredDays = activeDay === 'All' ? DAYS : [activeDay];
  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  // Group by timetable for non-admin teacher view header
  const timetableNames = [...new Set(schedules.map(s => s.timetableName).filter(Boolean))];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">{isAdmin ? 'Schedule Overview' : '📅 My Weekly Timetable'}</div>
          <div className="page-header-sub">
            {isAdmin
              ? `${schedules.length} total class slots across all teachers`
              : timetableNames.length > 0
                ? timetableNames.join(' · ')
                : `${schedules.length} scheduled classes`}
          </div>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Add Schedule</button>}
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {/* Day filter tabs */}
      {schedules.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {['All', ...DAYS].map(d => {
            const count = d === 'All' ? schedules.length : grouped[d]?.length || 0;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                style={{
                  padding: '5px 12px', borderRadius: 16, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: activeDay === d ? '1px solid #6c63ff' : '1px solid var(--border-light)',
                  background: activeDay === d ? 'rgba(108,99,255,0.15)' : 'var(--bg-elevated)',
                  color: activeDay === d ? '#6c63ff' : 'var(--text-muted)',
                }}
              >
                {d === 'All' ? 'All Days' : d.slice(0, 3)} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
              </button>
            );
          })}
        </div>
      )}

      {loading ? <Loader /> : schedules.length === 0 ? (
        <div className="card"><EmptyState icon="📅" message={isAdmin ? "No schedules yet." : "No classes assigned yet. Contact admin to get your timetable set up."} /></div>
      ) : (
        filteredDays.map(day => grouped[day]?.length > 0 && (
          <div key={day} className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="day-pill">{day}</span>
              <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{grouped[day].length} class{grouped[day].length > 1 ? 'es' : ''}</span>
            </div>

            {/* Teacher view: card layout for each class */}
            {!isAdmin ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {grouped[day].map(s => (
                  <div
                    key={s._id}
                    style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
                      borderRadius: 14, padding: '14px 16px', minWidth: 200, maxWidth: 260,
                      borderLeft: '4px solid #6c63ff',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#6c63ff', marginBottom: 6 }}>
                      🕐 {s.startTime} – {s.endTime}
                      {s.section && <span style={{ marginLeft: 6, background: 'rgba(108,99,255,0.1)', padding: '1px 6px', borderRadius: 6 }}>§{s.section}</span>}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{s.subject}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.className}{s.semester ? ` · Sem ${s.semester}` : ''}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 Room {s.room}</div>
                    {s.timetableName && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>{s.timetableName}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Admin view: table layout */
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Teacher</th>
                      <th>Subject</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Time</th>
                      <th>Room</th>
                      <th>Timetable</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[day].map(s => (
                      <tr key={s._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar name={s.teacher?.name || '?'} photo={s.teacher?.photo} size={30} />
                            <span style={{ fontWeight: 700 }}>{s.teacher?.name}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{s.subject}</td>
                        <td>{s.className}</td>
                        <td>{s.section || '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ background: '#f0f4ff', padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800, color: '#4F6EF7' }}>
                            {s.startTime} – {s.endTime}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>{s.room}</td>
                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.timetableName || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="action-btn" onClick={() => openEdit(s)}>✏️</button>
                            <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(s._id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}

      {showModal && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Schedule' : 'Add Schedule'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Teacher *</label>
                  <select className="form-select" value={form.teacher} onChange={e => setForm(p => ({ ...p, teacher: e.target.value }))} required>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.subject})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Day *</label>
                  <select className="form-select" value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} required>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {[['subject','Subject *'],['className','Class *'],['section','Section'],['semester','Semester'],['startTime','Start Time *'],['endTime','End Time *'],['room','Room *'],['timetableName','Timetable Name']].map(([k, l]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" type={k.includes('Time') ? 'time' : 'text'} value={form[k]}
                      required={l.endsWith('*')}
                      onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
