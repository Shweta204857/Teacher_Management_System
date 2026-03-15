import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Loader, EmptyState } from '../components/UI';
import Avatar from '../components/Avatar';

// Local stat card - does NOT depend on DashboardCard to avoid prop issues
const StatCard = ({ icon, label, value, sub, accent = '#4F6EF7', onClick }) => (
  <div
    className="stat-card"
    style={{ borderTopColor: accent, cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <div className="stat-icon">{icon}</div>
    <div className="stat-value" style={{ color: accent }}>{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavesError, setLeavesError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats — required
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setStats({});
      }

      // Fetch pending leaves separately — non-fatal if it fails
      try {
        const leavesRes = await api.get('/leaves?status=Pending');
        setPendingLeaves(leavesRes.data || []);
      } catch (err) {
        console.warn('Could not load pending leaves:', err?.response?.status, err?.message);
        setLeavesError(true);
        setPendingLeaves([]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <div className="banner-title">Good Morning, {user?.name?.split(' ')[0]}! 👋</div>
          <div className="banner-sub">
            {stats?.presentToday ?? 0} teachers present today.
            {pendingLeaves.length > 0 && (
              <span style={{
                marginLeft: 10,
                background: 'rgba(255,184,48,0.25)',
                padding: '2px 10px', borderRadius: 12,
                color: '#ffb830', fontWeight: 800,
              }}>
                ⏳ {pendingLeaves.length} leave{pendingLeaves.length !== 1 ? 's' : ''} pending review
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              className="btn btn-outline"
              style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }}
              onClick={() => navigate('/teachers')}
            >
              View Teachers →
            </button>
            {pendingLeaves.length > 0 && (
              <button
                className="btn btn-outline"
                style={{ background: 'rgba(255,184,48,0.25)', border: '2px solid rgba(255,184,48,0.5)', color: '#ffb830' }}
                onClick={() => navigate('/admin/leaves')}
              >
                Review Leaves ({pendingLeaves.length}) →
              </button>
            )}
          </div>
        </div>
        <div className="banner-emoji">🏫</div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <StatCard icon="👩‍🏫" label="Total Teachers"  value={stats?.totalTeachers ?? 0}  sub={`${stats?.activeTeachers ?? 0} active`}  accent="#4F6EF7" onClick={() => navigate('/teachers')} />
        <StatCard icon="✅"    label="Present Today"   value={stats?.presentToday ?? 0}   sub="Marked today"        accent="#10B981" />
        <StatCard icon="❌"    label="Absent Today"    value={stats?.absentToday ?? 0}    sub="Not in today"        accent="#EF4444" />
        <StatCard icon="📅"    label="Total Schedules" value={stats?.totalSchedules ?? 0} sub="Across all days"     accent="#F97316" onClick={() => navigate('/schedule')} />
        <StatCard
          icon="⏳"
          label="Pending Leaves"
          value={leavesError ? '—' : pendingLeaves.length}
          sub={leavesError ? 'Unavailable' : 'Awaiting review'}
          accent="#ffb830"
          onClick={() => navigate('/admin/leaves')}
        />
      </div>

      <div className="two-col">
        {/* Pending Leaves Quick View */}
        {!leavesError && pendingLeaves.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 900, fontSize: 15 }}>⏳ Pending Leave Requests</span>
              <span
                onClick={() => navigate('/admin/leaves')}
                style={{ fontSize: 12, color: '#ffb830', fontWeight: 700, cursor: 'pointer' }}
              >
                Review All →
              </span>
            </div>
            {pendingLeaves.slice(0, 4).map((l) => (
              <div
                key={l._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', marginBottom: 8,
                  background: 'rgba(255,184,48,0.07)', borderRadius: 10,
                  border: '1px solid rgba(255,184,48,0.2)',
                }}
              >
                <Avatar name={l.teacher?.name || '?'} photo={l.teacher?.photo} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{l.teacher?.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {l.leaveType} · {l.totalDays} day{l.totalDays !== 1 ? 's' : ''}
                    {' · '}
                    {new Date(l.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/leaves')}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 8,
                    border: '1px solid #ffb830', background: 'transparent',
                    color: '#ffb830', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recent Teachers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 15 }}>Recent Teachers</span>
            <span
              onClick={() => navigate('/teachers')}
              style={{ fontSize: 12, color: '#4F6EF7', fontWeight: 700, cursor: 'pointer' }}
            >
              View All →
            </span>
          </div>
          {!stats?.recentTeachers?.length
            ? <EmptyState message="No teachers yet." />
            : stats.recentTeachers.map((t, i) => (
              <div
                key={t._id}
                onClick={() => navigate(`/teachers/${t._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < stats.recentTeachers.length - 1 ? '1px solid var(--border-light)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Avatar name={t.name} photo={t.photo} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{t.subject} · {t.teacherId}</div>
                </div>
                <span className={`badge badge-${t.status === 'Active' ? 'active' : t.status === 'On Leave' ? 'leave' : 'inactive'}`}>
                  {t.status}
                </span>
              </div>
            ))}
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 15 }}>Today's Schedule</span>
            <span
              onClick={() => navigate('/schedule')}
              style={{ fontSize: 12, color: '#4F6EF7', fontWeight: 700, cursor: 'pointer' }}
            >
              View All →
            </span>
          </div>
          {!stats?.todaySchedules?.length
            ? <EmptyState icon="📅" message="No schedules yet." />
            : stats.todaySchedules.map((s) => (
              <div key={s._id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{
                  background: '#f0f4ff', borderRadius: 8, padding: '4px 8px',
                  fontSize: 10, fontWeight: 800, color: '#4F6EF7',
                  whiteSpace: 'nowrap', alignSelf: 'flex-start', marginTop: 2,
                }}>
                  {s.startTime}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{s.teacher?.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.className} · {s.room}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 4 }}>
        {[
          { icon: '📋', label: 'Manage Timetables', path: '/timetable',    color: '#6c63ff' },
          { icon: '👥', label: 'All Teachers',       path: '/teachers',    color: '#4F6EF7' },
          { icon: '✅', label: 'Attendance',          path: '/attendance',  color: '#10B981' },
          { icon: '🗓️', label: 'Leave Requests',     path: '/admin/leaves',color: '#ffb830' },
          { icon: '📊', label: 'Reports',             path: '/reports',    color: '#F97316' },
        ].map(q => (
          <div
            key={q.path}
            onClick={() => navigate(q.path)}
            style={{
              background: `${q.color}12`, border: `1px solid ${q.color}30`,
              borderRadius: 14, padding: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${q.color}22`}
            onMouseLeave={e => e.currentTarget.style.background = `${q.color}12`}
          >
            <span style={{ fontSize: 22 }}>{q.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: q.color }}>{q.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
