import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const adminNav = [
  { to: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/teachers', label: 'Teachers', icon: '👥' },
  { to: '/attendance', label: 'Attendance', icon: '✅' },
  { to: '/timetable', label: 'Timetables', icon: '📋' },
  { to: '/schedule', label: 'Schedule View', icon: '📅' },
  { to: '/admin/leaves', label: 'Leave Requests', icon: '🗓️' },
  { to: '/reports', label: 'Reports', icon: '📊' },
];

const teacherNav = [
  { to: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/attendance', label: 'My Attendance', icon: '✅' },
  { to: '/schedule', label: 'My Schedule', icon: '📅' },
  { to: '/leaves', label: 'My Leaves', icon: '🗓️' },
  { to: '/profile', label: 'My Profile', icon: '👤' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'admin' ? adminNav : teacherNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">T</div>
        <div>
          <div className="logo-text">TeachMS</div>
          <div className="logo-sub">Management</div>
        </div>
      </div>

      <div className="nav-section-label">Main Menu</div>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ marginBottom: 12 }}>
          <Avatar name={user?.name || 'User'} size={36} />
          <div className="sidebar-user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role === 'admin' ? 'Administrator' : 'Teacher'}</div>
          </div>
        </div>
        <button
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
          onClick={handleLogout}
        >
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
