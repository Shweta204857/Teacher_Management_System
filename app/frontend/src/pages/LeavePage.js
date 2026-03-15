import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Loader, Alert } from '../components/UI';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Personal Leave', 'Other'];
const STATUS_COLORS = {
  Pending:  { bg:'rgba(255,184,48,0.15)',  color:'#ffb830', border:'rgba(255,184,48,0.3)' },
  Approved: { bg:'rgba(0,212,161,0.15)',   color:'#00d4a1', border:'rgba(0,212,161,0.3)' },
  Rejected: { bg:'rgba(239,68,68,0.15)',   color:'#ef4444', border:'rgba(239,68,68,0.3)' },
};
const BLANK = { leaveType: 'Sick Leave', fromDate: '', toDate: '', reason: '' };
const TOTAL_PAID = 10;

const LeavePage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves]   = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(BLANK);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, pRes] = await Promise.all([
        api.get('/leaves/my'),
        api.get(`/teachers/${user._id}`),
      ]);
      setLeaves(lRes.data || []);
      setProfile(pRes.data);
    } catch (e) {
      setError('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Live preview whenever dates change
  useEffect(() => {
    if (!form.fromDate || !form.toDate) { setPreview(null); return; }
    const from = new Date(form.fromDate);
    const to   = new Date(form.toDate);
    if (to < from) { setPreview(null); return; }
    const totalDays = Math.round((to - from) / (1000*60*60*24)) + 1;
    const paidLeft  = profile?.paidLeavesRemaining ?? TOTAL_PAID;
    const paidUsed  = Math.min(paidLeft, totalDays);
    const unpaidUsed= totalDays - paidUsed;
    setPreview({ totalDays, paidUsed, unpaidUsed });
  }, [form.fromDate, form.toDate, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/leaves', form);
      setSuccess('Leave application submitted!');
      setShowForm(false);
      setForm(BLANK);
      await fetchData(); // refreshes both leaves AND profile (paid balance)
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave application?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const paidLeft   = profile?.paidLeavesRemaining ?? TOTAL_PAID;
  const paidUsed   = TOTAL_PAID - paidLeft;
  const paidPct    = Math.max(0, Math.min(100, (paidLeft / TOTAL_PAID) * 100));
  const barColor   = paidLeft > 6 ? '#00d4a1' : paidLeft > 3 ? '#ffb830' : '#ef4444';

  const pending    = leaves.filter(l => l.status === 'Pending').length;
  const approved   = leaves.filter(l => l.status === 'Approved').length;
  const rejected   = leaves.filter(l => l.status === 'Rejected').length;
  const totalTaken = leaves.filter(l => l.status === 'Approved').reduce((s,l) => s + l.totalDays, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-title">🗓️ My Leave Applications</div>
          <div className="page-header-sub">{leaves.length} total · {pending} pending</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
          + Apply for Leave
        </button>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {/* Dynamic Leave Balance Card */}
      <div className="card" style={{ marginBottom:20, padding:'20px 22px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:'var(--text-primary)', marginBottom:2 }}>
              💚 Annual Paid Leave Balance
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>10 paid days per year · additional leaves are unpaid</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:32, fontWeight:900, color:barColor, lineHeight:1 }}>{paidLeft}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>of {TOTAL_PAID} days left</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background:'var(--bg-elevated)', borderRadius:10, height:16, overflow:'hidden', marginBottom:12, position:'relative' }}>
          <div style={{
            height:'100%', width:`${paidPct}%`,
            background:`linear-gradient(90deg, ${barColor}, ${barColor}bb)`,
            borderRadius:10, transition:'width 0.5s ease',
          }} />
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:10, fontWeight:800, color:'#fff', textShadow:'0 0 6px #0005' }}>
            {paidLeft}/{TOTAL_PAID} paid days remaining
          </div>
        </div>

        {/* Grid counters */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
          {[
            { label:'Total/Year',  value: TOTAL_PAID,  color:'#6c63ff' },
            { label:'Used Paid',   value: paidUsed,     color:'#ffb830' },
            { label:'Remaining',   value: paidLeft,     color: barColor },
            { label:'Days Taken',  value: totalTaken,   color:'#8888aa' },
            { label:'Pending',     value: pending,      color:'#ffb830' },
          ].map(item => (
            <div key={item.label} style={{ background:'var(--bg-elevated)', borderRadius:10, padding:'10px 6px', textAlign:'center', border:'1px solid var(--border-light)' }}>
              <div style={{ fontSize:22, fontWeight:900, color:item.color }}>{item.value}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, marginTop:2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {paidLeft === 0 && (
          <div style={{ marginTop:12, padding:'8px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', fontSize:12, color:'#ef4444', fontWeight:600 }}>
            ⚠️ All paid leaves exhausted. Any new leave will be unpaid.
          </div>
        )}
        {paidLeft > 0 && paidLeft <= 3 && (
          <div style={{ marginTop:12, padding:'8px 12px', borderRadius:8, background:'rgba(255,184,48,0.1)', border:'1px solid rgba(255,184,48,0.3)', fontSize:12, color:'#ffb830', fontWeight:600 }}>
            ⚠️ Only {paidLeft} paid day{paidLeft!==1?'s':''} remaining.
          </div>
        )}
      </div>

      {/* Applications List */}
      {loading ? <Loader /> : leaves.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'50px 20px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
          <div style={{ fontWeight:700, marginBottom:6, color:'var(--text-primary)' }}>No Leave Applications</div>
          <div style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>You haven't applied for any leave yet.</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Apply for Leave</button>
        </div>
      ) : (
        leaves.map(leave => {
          const sc = STATUS_COLORS[leave.status];
          return (
            <div key={leave._id} className="card" style={{ marginBottom:12, padding:'18px 20px', border:`1px solid ${sc.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:800, fontSize:15, color:'var(--text-primary)' }}>{leave.leaveType}</span>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:800, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                      {leave.status}
                    </span>
                    {leave.isPaid
                      ? <span style={{ fontSize:11, fontWeight:600, color:'#00d4a1', background:'rgba(0,212,161,0.1)', padding:'2px 8px', borderRadius:10 }}>💚 Paid</span>
                      : <span style={{ fontSize:11, fontWeight:600, color:'#ff8c42', background:'rgba(255,140,66,0.1)', padding:'2px 8px', borderRadius:10 }}>🔶 Unpaid</span>
                    }
                  </div>
                  <div style={{ display:'flex', gap:20, marginBottom:8, flexWrap:'wrap' }}>
                    <div><span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>FROM </span>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{new Date(leave.fromDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                    </div>
                    <div><span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>TO </span>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{new Date(leave.toDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                    </div>
                    <div><span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>DURATION </span>
                      <span style={{ fontSize:12, fontWeight:700, color:'#6c63ff' }}>{leave.totalDays} day{leave.totalDays!==1?'s':''}</span>
                    </div>
                    {leave.paidDaysUsed > 0 && <div><span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>PAID </span><span style={{ fontSize:12, fontWeight:700, color:'#00d4a1' }}>{leave.paidDaysUsed}d</span></div>}
                    {leave.unpaidDaysUsed > 0 && <div><span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>UNPAID </span><span style={{ fontSize:12, fontWeight:700, color:'#ff8c42' }}>{leave.unpaidDaysUsed}d</span></div>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>📝 <em>{leave.reason}</em></div>
                  {leave.adminRemarks && <div style={{ fontSize:12, color:sc.color, fontWeight:600, marginTop:4 }}>💬 Admin: {leave.adminRemarks}</div>}
                  {leave.reviewedAt && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Reviewed {new Date(leave.reviewedAt).toLocaleDateString('en-IN')}{leave.reviewedBy ? ` by ${leave.reviewedBy}` : ''}</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>Applied {new Date(leave.createdAt).toLocaleDateString('en-IN')}</span>
                  {leave.status === 'Pending' && (
                    <button onClick={() => handleCancel(leave._id)} style={{ padding:'4px 12px', borderRadius:8, border:'1px solid #ef4444', background:'transparent', color:'#ef4444', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Apply for Leave</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div style={{ background: paidLeft > 0 ? 'rgba(0,212,161,0.08)' : 'rgba(239,68,68,0.08)', border:`1px solid ${paidLeft>0?'rgba(0,212,161,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, fontWeight:600, color: paidLeft>0?'#00d4a1':'#ef4444' }}>
              {paidLeft > 0 ? `💚 ${paidLeft} paid leave day${paidLeft!==1?'s':''} remaining this year.` : '⚠️ No paid leaves remaining. This will be an unpaid leave.'}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Leave Type *</label>
                  <select className="form-select" value={form.leaveType} onChange={e => setForm(p=>({...p,leaveType:e.target.value}))} required>
                    {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">From Date *</label>
                  <input className="form-input" type="date" value={form.fromDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(p=>({...p,fromDate:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date *</label>
                  <input className="form-input" type="date" value={form.toDate} min={form.fromDate||new Date().toISOString().split('T')[0]} onChange={e => setForm(p=>({...p,toDate:e.target.value}))} required />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Reason *</label>
                  <textarea className="form-input" rows={3} value={form.reason} onChange={e => setForm(p=>({...p,reason:e.target.value}))} placeholder="Briefly describe the reason..." required style={{ resize:'vertical' }} />
                </div>
              </div>

              {/* Live preview */}
              {preview && (
                <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:10, padding:'14px 16px', marginTop:4 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>Leave Summary Preview</div>
                  <div style={{ display:'flex', gap:20 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:28, fontWeight:900, color:'#6c63ff' }}>{preview.totalDays}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>Total Days</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:28, fontWeight:900, color:'#00d4a1' }}>{preview.paidUsed}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>Paid Days</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:28, fontWeight:900, color: preview.unpaidUsed>0?'#ff8c42':'var(--text-muted)' }}>{preview.unpaidUsed}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>Unpaid Days</div>
                    </div>
                    <div style={{ textAlign:'center', flex:1 }}>
                      <div style={{ fontSize:28, fontWeight:900, color: barColor }}>{paidLeft - preview.paidUsed}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>Paid Left After</div>
                    </div>
                  </div>
                  {preview.unpaidUsed > 0 && (
                    <div style={{ fontSize:11, color:'#ff8c42', marginTop:8, fontWeight:600 }}>
                      ⚠️ {preview.unpaidUsed} day{preview.unpaidUsed!==1?'s':''} will be unpaid.
                    </div>
                  )}
                </div>
              )}

              <div style={{ display:'flex', gap:10, marginTop:18 }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePage;
