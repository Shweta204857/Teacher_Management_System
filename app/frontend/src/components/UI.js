import React from 'react';

export const Loader = () => (
  <div className="loader-wrap"><div className="spinner" /></div>
);

export const DashboardCard = ({ icon, label, value, sub, accent = '#4F6EF7' }) => (
  <div className="stat-card" style={{ '--accent': accent }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="search-bar">
    <span>🔍</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    {value && <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => onChange('')}>✕</span>}
  </div>
);

export const FormInput = ({ label, error, ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <input className={`form-input${error ? ' error' : ''}`} {...props} />
    {error && <span className="error-msg">{error}</span>}
  </div>
);

export const Alert = ({ type = 'error', message }) =>
  message ? <div className={`alert alert-${type}`}>{message}</div> : null;

export const EmptyState = ({ icon = '📭', message = 'No records found.' }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <p>{message}</p>
  </div>
);

export default Loader;
