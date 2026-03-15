import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🏫</div>
      <h1 style={{ fontSize: 72, fontWeight: 900, color: '#4F6EF7', lineHeight: 1 }}>404</h1>
      <p style={{ fontSize: 18, fontWeight: 700, color: '#64748b', margin: '12px 0 28px' }}>Page not found</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
    </div>
  );
};

export default NotFoundPage;
