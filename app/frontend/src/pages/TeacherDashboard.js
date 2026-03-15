import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Loader } from '../components/UI';
import Avatar from '../components/Avatar';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const TeacherDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [schedules,  setSchedules]  = useState([]);
  const [profile,    setProfile]    = useState(null);
  const [leaves,     setLeaves]     = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    const load = async () => {
      try { const r = await api.get(`/attendance?teacherId=${user._id}`); setAttendance(r.data || []); } catch {}
      try { const r = await api.get(`/schedules?teacherId=${user._id}`);  setSchedules(r.data  || []); } catch {}
      try { const r = await api.get(`/teachers/${user._id}`);             setProfile(r.data);          } catch {}
      try { const r = await api.get('/leaves/my');                        setLeaves(r.data    || []); } catch {}
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <Loader />;

  // ── Attendance stats ──────────────────────────────────────────────────────
  const present    = attendance.filter(a => a.status === 'Present').length;
  const absent     = attendance.filter(a => a.status === 'Absent').length;
  const onLeave    = attendance.filter(a => a.status === 'Leave').length;
  const pct        = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

  // ── Leave stats ───────────────────────────────────────────────────────────
  const TOTAL_PAID      = 10;
  const paidLeft        = profile?.paidLeavesRemaining ?? TOTAL_PAID;
  const paidUsed        = TOTAL_PAID - paidLeft;
  const paidPct         = Math.max(0, Math.min(100, (paidLeft / TOTAL_PAID) * 100));
  const approvedLeaves  = leaves.filter(l => l.status === 'Approved');
  const pendingLeaves   = leaves.filter(l => l.status === 'Pending').length;
  const rejectedLeaves  = leaves.filter(l => l.status === 'Rejected').length;
  const totalDaysTaken  = approvedLeaves.reduce((s, l) => s + l.totalDays, 0);
  const leaveBarColor   = paidLeft > 6 ? '#00d4a1' : paidLeft > 3 ? '#ffb830' : '#ef4444';

  // ── Today's schedule ──────────────────────────────────────────────────────
  const today        = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = schedules.filter(s => s.day === today).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // ── Teacher info rows ─────────────────────────────────────────────────────
  const fmt   = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const money = n => n ? `₹ ${Number(n).toLocaleString('en-IN')}/mo` : '—';

  const infoRows = profile ? [
    { icon:'🏅', label:'Designation',      value: profile.designation || '—' },
    { icon:'🪪', label:'Teacher ID',       value: profile.teacherId },
    { icon:'📧', label:'Email',            value: profile.email },
    { icon:'📞', label:'Phone',            value: profile.phone },
    { icon:'🎓', label:'Qualification',    value: profile.qualification },
    { icon:'📚', label:'Subject',          value: profile.subject },
    { icon:'🏛️', label:'Department',       value: profile.department || 'Computer Engineering' },
    { icon:'⏳', label:'Experience',       value: profile.experience || '—' },
    { icon:'📅', label:'Joined',           value: fmt(profile.joiningDate) },
    { icon:'💰', label:'Salary',           value: money(profile.salary) },
    { icon:'🩸', label:'Blood Group',      value: profile.bloodGroup || '—' },
    { icon:'🚨', label:'Emergency Contact',value: profile.emergencyContact || '—' },
    { icon:'🟢', label:'Status',           value: profile.status },
    { icon:'🔬', label:'Area of Interest',  value: profile.areaOfInterest || '—' },
  ] : [];

  const quickActions = [
    { icon:'📅', label:'My Schedule',     desc:`${schedules.length} classes assigned`,                          color:'#6c63ff', bg:'rgba(108,99,255,0.1)', border:'rgba(108,99,255,0.25)', path:'/schedule' },
    { icon:'✅', label:'My Attendance',   desc:`${pct}% attendance this semester`,                              color:'#00d4a1', bg:'rgba(0,212,161,0.1)',  border:'rgba(0,212,161,0.25)',  path:'/attendance' },
    { icon:'🗓️', label:'Apply for Leave', desc:`${paidLeft}/${TOTAL_PAID} paid days left`,                      color:'#ffb830', bg:'rgba(255,184,48,0.1)', border:'rgba(255,184,48,0.25)', path:'/leaves', badge: pendingLeaves || null },
    { icon:'👤', label:'My Profile',      desc:'View & update your full profile',                                color:'#ff6b6b', bg:'rgba(255,107,107,0.1)', border:'rgba(255,107,107,0.25)', path:'/profile' },
  ];

  return (
    <div>
      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div className="welcome-banner">
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <Avatar name={profile?.name || user?.name || '?'} photo={profile?.photo} size={62} />
          <div>
            <div className="banner-title">Welcome, {profile?.name || user?.name}! 🙏</div>
            <div className="banner-sub">
              {profile?.qualification && <span>{profile.qualification} &nbsp;·&nbsp; </span>}
              {profile?.department || 'Computer Engineering'}
              {profile?.teacherId && <>&nbsp;·&nbsp; {profile.teacherId}</>}
            </div>
            <div style={{ marginTop:6, fontSize:12, color:'rgba(255,255,255,0.7)' }}>
              📧 {profile?.email || user?.email}
              {profile?.phone && <>&nbsp;·&nbsp; 📞 {profile.phone}</>}
            </div>
          </div>
        </div>
        <div className="banner-emoji">👨‍🏫</div>
      </div>

      {/* ── Teacher Info Card ───────────────────────────────────────────────── */}
      {profile && (
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontWeight:800, fontSize:15, color:'var(--text-primary)' }}>👤 My Information</div>
            <button
              onClick={() => navigate('/profile')}
              style={{ fontSize:12, color:'#6c63ff', fontWeight:600, cursor:'pointer', background:'none', border:'none', padding:0 }}
            >
              Edit Profile →
            </button>
          </div>

          {/* Name + designation hero */}
          <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', background:'var(--bg-elevated)', borderRadius:12, marginBottom:14, border:'1px solid var(--border-light)' }}>
            <Avatar name={profile.name} photo={profile.photo} size={56} />
            <div>
              <div style={{ fontWeight:900, fontSize:18, color:'var(--text-primary)' }}>{profile.name}</div>
              <div style={{ fontSize:13, color:'#6c63ff', fontWeight:600, marginTop:2 }}>
                {profile.experience ? `${profile.experience} Experience` : 'Faculty'} &nbsp;·&nbsp; {profile.department || 'Computer Engineering'}
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{profile.qualification}</div>
            </div>
            <span style={{
              marginLeft:'auto', padding:'4px 14px', borderRadius:20,
              background: profile.status === 'Active' ? 'rgba(0,212,161,0.15)' : 'rgba(239,68,68,0.15)',
              color: profile.status === 'Active' ? '#00d4a1' : '#ef4444',
              fontWeight:700, fontSize:12, border: `1px solid ${profile.status === 'Active' ? 'rgba(0,212,161,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {profile.status}
            </span>
          </div>

          {/* Info grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:10 }}>
            {infoRows.map(({ icon, label, value }) => (
              <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:10, border:'1px solid var(--border-light)' }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{icon}</span>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', wordBreak:'break-word' }}>{value || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:14, marginBottom:22 }}>
        {quickActions.map(a => (
          <div key={a.path} onClick={() => navigate(a.path)}
            style={{ background:a.bg, border:`1px solid ${a.border}`, borderRadius:16, padding:'18px 16px', cursor:'pointer', transition:'all 0.2s', position:'relative' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 10px 24px ${a.border}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            {a.badge && (
              <div style={{ position:'absolute', top:12, right:12, background:'#ef4444', color:'#fff', borderRadius:'50%', width:18, height:18, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {a.badge}
              </div>
            )}
            <div style={{ fontSize:30, marginBottom:10 }}>{a.icon}</div>
            <div style={{ fontWeight:800, fontSize:14, color:a.color, marginBottom:4 }}>{a.label}</div>
            <div style={{ fontSize:11, color:'#8888aa', lineHeight:1.5 }}>{a.desc}</div>
            <div style={{ marginTop:10, fontSize:11, color:a.color, fontWeight:600 }}>Open →</div>
          </div>
        ))}
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card" style={{ borderTopColor:'#00d4a1' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{present}</div>
          <div className="stat-label">Days Present</div>
        </div>
        <div className="stat-card" style={{ borderTopColor:'#ff4d6a' }}>
          <div className="stat-icon">❌</div>
          <div className="stat-value">{absent}</div>
          <div className="stat-label">Days Absent</div>
        </div>
        <div className="stat-card" style={{ borderTopColor:'#ffb830' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-value">{onLeave}</div>
          <div className="stat-label">Leave Days</div>
        </div>
        <div className="stat-card" style={{ borderTopColor:leaveBarColor, cursor:'pointer' }} onClick={() => navigate('/leaves')}>
          <div className="stat-icon">💚</div>
          <div className="stat-value" style={{ color:leaveBarColor }}>{paidLeft}</div>
          <div className="stat-label">Paid Leaves Left</div>
          <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{paidUsed} used of {TOTAL_PAID}</div>
        </div>
        <div className="stat-card" style={{ borderTopColor:'#6c63ff' }}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">{schedules.length}</div>
          <div className="stat-label">Total Classes</div>
        </div>
      </div>

      {/* ── Leave Balance ─────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom:20, padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:14, color:'var(--text-primary)' }}>💚 Annual Paid Leave Balance</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>10 paid days/year · additional leaves are unpaid</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:30, fontWeight:900, color:leaveBarColor, lineHeight:1 }}>{paidLeft}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)' }}>of {TOTAL_PAID} remaining</div>
          </div>
        </div>
        <div style={{ background:'var(--bg-elevated)', borderRadius:8, height:12, overflow:'hidden', marginBottom:12 }}>
          <div style={{ height:'100%', width:`${paidPct}%`, background:`linear-gradient(90deg,${leaveBarColor},${leaveBarColor}99)`, borderRadius:8, transition:'width 0.5s ease' }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
          {[
            { label:'Total/Year', value:TOTAL_PAID,   color:'#6c63ff' },
            { label:'Used',       value:paidUsed,      color:'#ffb830' },
            { label:'Remaining',  value:paidLeft,      color:leaveBarColor },
            { label:'Days Taken', value:totalDaysTaken,color:'#8888aa' },
            { label:'Pending',    value:pendingLeaves, color:'#ffb830' },
          ].map(item => (
            <div key={item.label} style={{ background:'var(--bg-elevated)', borderRadius:8, padding:'8px 6px', textAlign:'center', border:'1px solid var(--border-light)' }}>
              <div style={{ fontSize:20, fontWeight:900, color:item.color }}>{item.value}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, marginTop:1 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background:'rgba(0,212,161,0.12)', color:'#00d4a1', fontWeight:700 }}>✅ {approvedLeaves.length} Approved</span>
          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background:'rgba(255,184,48,0.12)', color:'#ffb830', fontWeight:700 }}>⏳ {pendingLeaves} Pending</span>
          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:12, background:'rgba(239,68,68,0.12)', color:'#ef4444', fontWeight:700 }}>✕ {rejectedLeaves} Rejected</span>
          <span onClick={() => navigate('/leaves')} style={{ marginLeft:'auto', fontSize:11, padding:'3px 10px', borderRadius:12, background:'rgba(108,99,255,0.12)', color:'#6c63ff', fontWeight:700, cursor:'pointer' }}>Apply for Leave →</span>
        </div>
        {paidLeft === 0 && <div style={{ marginTop:10, padding:'8px 12px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', fontSize:12, color:'#ef4444', fontWeight:600 }}>⚠️ All paid leaves exhausted. Future leaves will be unpaid.</div>}
        {paidLeft > 0 && paidLeft <= 3 && <div style={{ marginTop:10, padding:'8px 12px', borderRadius:8, background:'rgba(255,184,48,0.08)', border:'1px solid rgba(255,184,48,0.3)', fontSize:12, color:'#ffb830', fontWeight:600 }}>⚠️ Only {paidLeft} paid day{paidLeft!==1?'s':''} remaining.</div>}
      </div>

      {/* ── Today & Weekly ────────────────────────────────────────────────────── */}
      <div className="two-col">
        {/* Today's classes */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontWeight:800, fontSize:14, color:'#f0f0ff' }}>📅 Today — <span style={{ color:'#6c63ff' }}>{today}</span></span>
            <span onClick={() => navigate('/schedule')} style={{ fontSize:12, color:'#6c63ff', fontWeight:600, cursor:'pointer' }}>Full Week →</span>
          </div>
          {todayClasses.length === 0 ? (
            <div style={{ color:'#55556a', fontSize:13, textAlign:'center', padding:'24px 0' }}>🎉 No classes today!</div>
          ) : todayClasses.map(s => (
            <div key={s._id} style={{ display:'flex', gap:10, marginBottom:10, background:'var(--bg-elevated)', borderRadius:10, padding:'10px 12px', borderLeft:'3px solid #6c63ff' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'#6c63ff', background:'rgba(108,99,255,0.12)', borderRadius:6, padding:'2px 7px', alignSelf:'flex-start', whiteSpace:'nowrap', marginTop:2 }}>{s.startTime}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'#f0f0ff' }}>{s.subject}</div>
                <div style={{ fontSize:11, color:'#8888aa', marginTop:2 }}>{s.className}{s.section?` §${s.section}`:''} · {s.startTime}–{s.endTime} · {s.room}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly overview */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontWeight:800, fontSize:14, color:'#f0f0ff' }}>📋 Weekly Timetable</span>
            <span onClick={() => navigate('/schedule')} style={{ fontSize:12, color:'#6c63ff', fontWeight:600, cursor:'pointer' }}>Full View →</span>
          </div>
          {schedules.length === 0 ? (
            <div style={{ color:'#55556a', fontSize:13, textAlign:'center', padding:'24px 0' }}>No schedule assigned yet.</div>
          ) : (
            DAYS.map(day => {
              const ds = schedules.filter(s => s.day === day);
              if (!ds.length) return null;
              return (
                <div key={day} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:'#6c63ff', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{day}</div>
                  {ds.map(s => (
                    <div key={s._id} style={{ display:'flex', gap:8, marginBottom:4, alignItems:'center' }}>
                      <span style={{ fontSize:10, fontWeight:800, color:'#4F6EF7', background:'#f0f4ff', padding:'2px 6px', borderRadius:5, whiteSpace:'nowrap' }}>{s.startTime}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'#f0f0ff', flex:1 }}>{s.subject}</span>
                      <span style={{ fontSize:11, color:'#8888aa', whiteSpace:'nowrap' }}>§{s.section} · {s.room}</span>
                    </div>
                  ))}
                </div>
              );
            })
          )}
          {schedules.length > 0 && (
            <button className="btn btn-outline btn-block btn-sm" style={{ marginTop:8 }} onClick={() => navigate('/schedule')}>
              View Full Timetable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
