import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Navbar />
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AppLayout;
