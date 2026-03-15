import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Loader, SearchBar, Alert, EmptyState } from '../components/UI';
import Avatar from '../components/Avatar';

const TeachersListPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchTeachers = (q = '') => {
    setLoading(true);
    api.get(`/teachers${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then(r => setTeachers(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load teachers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTeachers(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchTeachers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/teachers/${id}`);
      setSuccess(`${name} removed successfully`);
      fetchTeachers(search);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">Faculty Directory</div>
          <div className="page-header-sub">NIT Kurukshetra — {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/teachers/add')}>
          + Add Teacher
        </button>
      </div>

      <Alert type="error"   message={error} />
      <Alert type="success" message={success} />

      <div className="card">
        <div className="filter-row">
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, ID, subject, email, department…" />
        </div>

        {loading ? <Loader /> : teachers.length === 0 ? (
          <EmptyState icon="👥" message="No teachers found. Click '+ Add Teacher' to get started." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Teacher ID</th>
                  <th>Department</th>
                  <th>Subject</th>
                  <th>Experience</th>
                  <th>Salary (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t._id} onClick={() => navigate(`/teachers/${t._id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={t.name} photo={t.photo} size={36} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#f0f0ff' }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: '#55556a' }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: 'rgba(108,99,255,0.15)', color: '#8b7eff', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>
                        {t.teacherId}
                      </span>
                    </td>
                    <td style={{ color: '#8888aa', fontSize: 12 }}>{t.department || '—'}</td>
                    <td style={{ fontWeight: 600, color: '#f0f0ff' }}>{t.subject}</td>
                    <td style={{ color: '#8888aa' }}>{t.experience || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#00d4a1' }}>
                      {t.salary ? `₹ ${Number(t.salary).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${t.status === 'Active' ? 'active' : t.status === 'On Leave' ? 'leave' : 'inactive'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="action-btn" title="Edit"
                          onClick={() => navigate(`/teachers/edit/${t._id}`)}>✏️</button>
                        <button className="action-btn" title="View"
                          onClick={() => navigate(`/teachers/${t._id}`)}>👁️</button>
                        <button className="action-btn" title="Delete"
                          disabled={deleting === t._id}
                          onClick={() => handleDelete(t._id, t.name)}
                          style={{ color: '#ff4d6a' }}>
                          {deleting === t._id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersListPage;
