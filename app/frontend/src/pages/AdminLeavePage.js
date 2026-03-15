import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { Loader, Alert } from '../components/UI';
import Avatar from '../components/Avatar';

const STATUS_COLORS = {
  Pending:  { bg: 'rgba(255,184,48,0.15)',  color: '#ffb830', border: 'rgba(255,184,48,0.3)' },
  Approved: { bg: 'rgba(0,212,161,0.15)',   color: '#00d4a1', border: 'rgba(0,212,161,0.3)' },
  Rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

const AdminLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending'); // 'All', 'Pending', 'Approved', 'Rejected'
  const [reviewing, setReviewing] = useState(null); // leave being reviewed
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'All' ? '/leaves' : `/leaves?status=${filter}`;
      const res = await api.get(url);
      setLeaves(res.data);
    } catch (e) {
      setError('Failed to load leave applications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleReview = async (status) => {
    setSaving(true); setError('');
    try {
      await api.put(`/leaves/${reviewing._id}/review`, { status, adminRemarks: remarks });
      setSuccess(`Leave ${status.toLowerCase()} successfully!`);
      setReviewing(null);
      setRemarks('');
      await fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    All: leaves.length,
    Pending: leaves.filter(l => l.status === 'Pending').length,
    Approved: leaves.filter(l => l.status === 'Approved').length,
    Rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">📋 Leave Management</div>
          <div className="page-header-sub">Review and manage teacher leave applications</div>
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: 16, padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                border: filter === f
                  ? `2px solid ${f === 'Pending' ? '#ffb830' : f === 'Approved' ? '#00d4a1' : f === 'Rejected' ? '#ef4444' : '#6c63ff'}`
                  : '1px solid var(--border-light)',
                background: filter === f
                  ? `${f === 'Pending' ? 'rgba(255,184,48,0.15)' : f === 'Approved' ? 'rgba(0,212,161,0.15)' : f === 'Rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(108,99,255,0.15)'}`
                  : 'var(--bg-elevated)',
                color: filter === f
                  ? (f === 'Pending' ? '#ffb830' : f === 'Approved' ? '#00d4a1' : f === 'Rejected' ? '#ef4444' : '#6c63ff')
                  : 'var(--text-muted)',
              }}
            >
              {f}
              {/* Show count only for current filter context */}
              <span style={{ marginLeft: 6, fontSize: 11 }}>
                ({filter === 'All' ? leaves.filter(l => l.status === f).length : f === filter ? leaves.length : '?'})
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : leaves.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No {filter !== 'All' ? filter.toLowerCase() : ''} leave applications
          </div>
        </div>
      ) : (
        <div>
          {leaves.map(leave => {
            const sc = STATUS_COLORS[leave.status];
            return (
              <div
                key={leave._id}
                className="card"
                style={{ marginBottom: 12, padding: '18px 20px', border: `1px solid ${sc.border}` }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Teacher info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
                    <Avatar name={leave.teacher?.name || '?'} photo={leave.teacher?.photo} size={44} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{leave.teacher?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{leave.teacher?.subject}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{leave.teacher?.department}</div>
                      <div style={{ fontSize: 11, color: '#6c63ff', fontWeight: 600, marginTop: 2 }}>
                        💚 {leave.teacher?.paidLeavesRemaining ?? '?'} paid days left
                      </div>
                    </div>
                  </div>

                  {/* Leave details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{leave.leaveType}</span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      }}>
                        {leave.status}
                      </span>
                      {leave.isPaid ? (
                        <span style={{ fontSize: 11, background: 'rgba(0,212,161,0.1)', color: '#00d4a1', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>💚 Paid</span>
                      ) : (
                        <span style={{ fontSize: 11, background: 'rgba(255,140,66,0.1)', color: '#ff8c42', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>🔶 Unpaid</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>FROM </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {new Date(leave.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>TO </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {new Date(leave.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>DAYS </span>
                        <span style={{ fontWeight: 800, color: '#6c63ff' }}>{leave.totalDays}</span>
                        {leave.paidDaysUsed > 0 && (
                          <span style={{ color: '#00d4a1', marginLeft: 8, fontWeight: 600 }}>{leave.paidDaysUsed} paid</span>
                        )}
                        {leave.unpaidDaysUsed > 0 && (
                          <span style={{ color: '#ff8c42', marginLeft: 8, fontWeight: 600 }}>{leave.unpaidDaysUsed} unpaid</span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      📝 <em>{leave.reason}</em>
                    </div>

                    {leave.adminRemarks && (
                      <div style={{ fontSize: 12, color: sc.color, fontWeight: 600, marginTop: 4 }}>
                        💬 Your remark: {leave.adminRemarks}
                      </div>
                    )}

                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      Applied on {new Date(leave.createdAt).toLocaleDateString('en-IN')}
                      {leave.reviewedAt && ` · Reviewed ${new Date(leave.reviewedAt).toLocaleDateString('en-IN')}`}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {leave.status === 'Pending' && (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: '7px 16px' }}
                        onClick={() => { setReviewing(leave); setRemarks(''); setError(''); }}
                      >
                        Review →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewing && (
        <div className="modal-overlay" onClick={() => setReviewing(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Review Leave Application</div>
              <button className="modal-close" onClick={() => setReviewing(null)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{reviewing.teacher?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                {reviewing.leaveType} · {reviewing.totalDays} day{reviewing.totalDays !== 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                {new Date(reviewing.fromDate).toLocaleDateString('en-IN')} → {new Date(reviewing.toDate).toLocaleDateString('en-IN')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                📝 {reviewing.reason}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 12 }}>
                <span style={{ color: '#00d4a1', fontWeight: 700 }}>Paid: {reviewing.paidDaysUsed}d</span>
                <span style={{ color: '#ff8c42', fontWeight: 700 }}>Unpaid: {reviewing.unpaidDaysUsed}d</span>
                <span style={{ color: '#6c63ff', fontWeight: 700 }}>Balance after: {(reviewing.teacher?.paidLeavesRemaining ?? 0) - reviewing.paidDaysUsed} paid days left</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label className="form-label">Admin Remarks (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Add a note for the teacher..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setReviewing(null)}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview('Rejected')}
                disabled={saving}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #ef4444',
                  background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700, cursor: 'pointer',
                }}
              >
                ✕ Reject
              </button>
              <button
                onClick={() => handleReview('Approved')}
                disabled={saving}
                style={{
                  flex: 1.5, padding: '10px', borderRadius: 10, border: 'none',
                  background: '#00d4a1', color: '#fff', fontWeight: 800, cursor: 'pointer',
                }}
              >
                ✓ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeavePage;
