import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { Loader, Alert } from '../components/UI';
import Avatar from '../components/Avatar';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '14:00', '15:00', '16:00', '17:00',
];

const BLANK_ENTRY = {
  teacher: '', subject: '', className: '', section: '', semester: '',
  day: 'Monday', startTime: '09:00', endTime: '10:00', room: '', timetableName: '',
};

const TimetablePage = () => {
  const [timetables, setTimetables] = useState([]); // list of timetable names
  const [selectedTT, setSelectedTT] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK_ENTRY);
  const [newTTName, setNewTTName] = useState('');
  const [newTTSemester, setNewTTSemester] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, teachRes] = await Promise.all([
        api.get('/schedules/timetables'),
        api.get('/teachers'),
      ]);
      setTimetables(tRes.data);
      setTeachers(teachRes.data);
      if (tRes.data.length > 0 && !selectedTT) {
        setSelectedTT(tRes.data[0]);
      }
    } catch (e) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedTT]);

  const fetchSchedules = useCallback(async () => {
    if (!selectedTT) { setSchedules([]); return; }
    try {
      const res = await api.get(`/schedules?timetableName=${encodeURIComponent(selectedTT)}`);
      setSchedules(res.data);
    } catch (e) {
      setError('Failed to load schedules');
    }
  }, [selectedTT]);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchSchedules(); }, [selectedTT]);

  const sections = ['All', ...new Set(schedules.map(s => s.section).filter(Boolean))];
  const filteredSchedules = activeSection === 'All'
    ? schedules
    : schedules.filter(s => s.section === activeSection);

  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = filteredSchedules.filter(s => s.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const handleCreateTimetable = async () => {
    if (!newTTName.trim()) return;
    setSaving(true);
    setError('');
    try {
      // Create a placeholder entry or just set selectedTT (timetable created via first entry)
      setTimetables(prev => [...prev, newTTName.trim()]);
      setSelectedTT(newTTName.trim());
      setShowCreateModal(false);
      setForm(prev => ({ ...prev, timetableName: newTTName.trim(), semester: newTTSemester }));
      setNewTTName('');
      setNewTTSemester('');
      setSuccess('Timetable created! Now add class entries.');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const openAddEntry = () => {
    setEditing(null);
    setForm({ ...BLANK_ENTRY, timetableName: selectedTT });
    setShowEntryModal(true);
  };

  const openEditEntry = (s) => {
    setEditing(s._id);
    setForm({
      teacher: s.teacher?._id || '',
      subject: s.subject,
      className: s.className,
      section: s.section || '',
      semester: s.semester || '',
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      timetableName: s.timetableName || selectedTT,
    });
    setShowEntryModal(true);
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) {
        await api.put(`/schedules/${editing}`, form);
      } else {
        await api.post('/schedules', form);
      }
      // Make sure timetable is in list
      if (!timetables.includes(form.timetableName)) {
        setTimetables(prev => [...prev, form.timetableName]);
      }
      setSelectedTT(form.timetableName);
      setSuccess(editing ? 'Class updated!' : 'Class added!');
      setShowEntryModal(false);
      await fetchSchedules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Remove this class from timetable?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      await fetchSchedules();
    } catch {
      setError('Delete failed');
    }
  };

  const handleDeleteTimetable = async () => {
    if (!window.confirm(`Delete entire timetable "${selectedTT}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/schedules/timetable/${encodeURIComponent(selectedTT)}`);
      setTimetables(prev => prev.filter(t => t !== selectedTT));
      setSelectedTT('');
      setSchedules([]);
      setSuccess('Timetable deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete timetable');
    }
  };

  const teacherById = (id) => teachers.find(t => t._id === id);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">📋 Timetable Management</div>
          <div className="page-header-sub">Create & assign class schedules to teachers</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setShowCreateModal(true)}>+ New Timetable</button>
          {selectedTT && <button className="btn btn-primary" onClick={openAddEntry}>+ Add Class</button>}
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {loading ? <Loader /> : (
        <>
          {/* Timetable Tabs */}
          {timetables.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Timetables Yet</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Create a timetable to start assigning classes to teachers</div>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create First Timetable</button>
            </div>
          ) : (
            <>
              {/* Timetable Selector */}
              <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>TIMETABLE:</span>
                  {timetables.map(tt => (
                    <button
                      key={tt}
                      onClick={() => { setSelectedTT(tt); setActiveSection('All'); }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: selectedTT === tt ? '2px solid #6c63ff' : '1px solid var(--border-light)',
                        background: selectedTT === tt ? 'rgba(108,99,255,0.15)' : 'var(--bg-elevated)',
                        color: selectedTT === tt ? '#6c63ff' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      {tt}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTT && (
                <>
                  {/* Header with actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{selectedTT}</span>
                      <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>{schedules.length} classes assigned</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="btn btn-ghost"
                        style={{ fontSize: 12 }}
                      >
                        {viewMode === 'grid' ? '☰ List' : '⊞ Grid'}
                      </button>
                      <button
                        onClick={handleDeleteTimetable}
                        style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        🗑️ Delete Timetable
                      </button>
                    </div>
                  </div>

                  {/* Section Filter */}
                  {sections.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                      {sections.map(sec => (
                        <button
                          key={sec}
                          onClick={() => setActiveSection(sec)}
                          style={{
                            padding: '4px 12px', borderRadius: 14,
                            border: activeSection === sec ? '1px solid #6c63ff' : '1px solid var(--border-light)',
                            background: activeSection === sec ? 'rgba(108,99,255,0.12)' : 'transparent',
                            color: activeSection === sec ? '#6c63ff' : 'var(--text-muted)',
                            fontWeight: 600, fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          {sec === 'All' ? 'All Sections' : `Section ${sec}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {schedules.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>No classes yet</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                        Add class entries to build this timetable
                      </div>
                      <button className="btn btn-primary" onClick={openAddEntry}>+ Add First Class</button>
                    </div>
                  ) : viewMode === 'grid' ? (
                    /* GRID VIEW - like a real timetable */
                    <div>
                      {DAYS.map(day => grouped[day]?.length > 0 && (
                        <div key={day} className="card" style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <span className="day-pill">{day}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                              {grouped[day].length} class{grouped[day].length !== 1 ? 'es' : ''}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {grouped[day].map(s => (
                              <div
                                key={s._id}
                                style={{
                                  background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-light)',
                                  borderRadius: 12,
                                  padding: '12px 14px',
                                  minWidth: 200,
                                  maxWidth: 240,
                                  position: 'relative',
                                }}
                              >
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#6c63ff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                                  {s.startTime} – {s.endTime}
                                  {s.section && <span style={{ marginLeft: 6, background: 'rgba(108,99,255,0.12)', padding: '1px 6px', borderRadius: 8 }}>§{s.section}</span>}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{s.subject}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                                  {s.className}{s.semester ? ` · Sem ${s.semester}` : ''} · Room {s.room}
                                </div>
                                {s.teacher && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Avatar name={s.teacher.name} photo={s.teacher.photo} size={22} />
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.teacher.name}</span>
                                  </div>
                                )}
                                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                                  <button className="action-btn" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => openEditEntry(s)}>✏️</button>
                                  <button className="action-btn" style={{ padding: '2px 6px', fontSize: 11, color: '#ef4444' }} onClick={() => handleDeleteEntry(s._id)}>🗑️</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* LIST VIEW */
                    <div className="card">
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Day</th>
                              <th>Time</th>
                              <th>Subject</th>
                              <th>Class</th>
                              <th>Section</th>
                              <th>Room</th>
                              <th>Teacher</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSchedules.map(s => (
                              <tr key={s._id}>
                                <td><span className="day-pill" style={{ fontSize: 10 }}>{s.day.slice(0, 3)}</span></td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                  <span style={{ background: '#f0f4ff', padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800, color: '#4F6EF7' }}>
                                    {s.startTime} – {s.endTime}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 700 }}>{s.subject}</td>
                                <td>{s.className}</td>
                                <td>{s.section || '—'}</td>
                                <td>{s.room}</td>
                                <td>
                                  {s.teacher ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Avatar name={s.teacher.name} photo={s.teacher.photo} size={28} />
                                      <span style={{ fontWeight: 600, fontSize: 12 }}>{s.teacher.name}</span>
                                    </div>
                                  ) : '—'}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="action-btn" onClick={() => openEditEntry(s)}>✏️</button>
                                    <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteEntry(s._id)}>🗑️</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Create Timetable Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create New Timetable</div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div style={{ padding: '4px 0 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
                Give this timetable a descriptive name like "B.Tech CSE IV Sem 2025-26"
              </p>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Timetable Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. B.Tech CSE IV Sem 2025-26"
                  value={newTTName}
                  onChange={e => setNewTTName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Semester (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. IV"
                  value={newTTSemester}
                  onChange={e => setNewTTSemester(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreateTimetable} disabled={!newTTName.trim() || saving}>
                  {saving ? 'Creating...' : 'Create Timetable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Entry Modal */}
      {showEntryModal && (
        <div className="modal-overlay" onClick={() => setShowEntryModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Class Entry' : 'Add Class to Timetable'}</div>
              <button className="modal-close" onClick={() => setShowEntryModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSaveEntry}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Timetable *</label>
                  <select
                    className="form-select"
                    value={form.timetableName}
                    onChange={e => setForm(p => ({ ...p, timetableName: e.target.value }))}
                    required
                  >
                    <option value="">Select Timetable</option>
                    {timetables.map(tt => <option key={tt} value={tt}>{tt}</option>)}
                    <option value={newTTName}>{newTTName || '— New —'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Teacher *</label>
                  <select
                    className="form-select"
                    value={form.teacher}
                    onChange={e => {
                      const t = teacherById(e.target.value);
                      setForm(p => ({ ...p, teacher: e.target.value, subject: t?.subject || p.subject }));
                    }}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} — {t.subject}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    className="form-input"
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. CSPC 202"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Day *</label>
                  <select className="form-select" value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} required>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Class / Course *</label>
                  <input
                    className="form-input"
                    value={form.className}
                    onChange={e => setForm(p => ({ ...p, className: e.target.value }))}
                    placeholder="e.g. B.Tech CSE"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    className="form-input"
                    value={form.section}
                    onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                    placeholder="e.g. A, B"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    className="form-input"
                    value={form.semester}
                    onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
                    placeholder="e.g. IV"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <select className="form-select" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <select className="form-select" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Room *</label>
                  <input
                    className="form-input"
                    value={form.room}
                    onChange={e => setForm(p => ({ ...p, room: e.target.value }))}
                    placeholder="e.g. LHC 102"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowEntryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Class' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
