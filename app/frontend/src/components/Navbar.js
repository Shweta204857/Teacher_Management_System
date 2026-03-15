import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const titles = {
  '/': 'Dashboard',
  '/teachers': 'Teachers',
  '/teachers/add': 'Add Teacher',
  '/attendance': 'Attendance',
  '/schedule': 'Schedule',
  '/reports': 'Reports',
  '/profile': 'Profile',
};

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || 'Teacher Management System';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="page-title">{title}</div>
        <div className="page-subtitle">{today}</div>
      </div>
      <div className="navbar-right">
        <button className="notif-btn">
          🔔
          <span className="notif-badge" />
        </button>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <Avatar name={user?.name || 'User'} size={38} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
