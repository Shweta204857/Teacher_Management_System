import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeachersListPage from './pages/TeachersListPage';
import AddTeacherPage from './pages/AddTeacherPage';
import EditTeacherPage from './pages/EditTeacherPage';
import TeacherDetailPage from './pages/TeacherDetailPage';
import AttendancePage from './pages/AttendancePage';
import SchedulePage from './pages/SchedulePage';
import TimetablePage from './pages/TimetablePage';
import AdminLeavePage from './pages/AdminLeavePage';
import LeavePage from './pages/LeavePage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import Loader from './components/Loader';

function App() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={user?.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />} />
            <Route path="/teachers" element={<ProtectedRoute adminOnly />}>
              <Route index element={<TeachersListPage />} />
            </Route>
            <Route path="/teachers/add" element={<ProtectedRoute adminOnly />}>
              <Route index element={<AddTeacherPage />} />
            </Route>
            <Route path="/teachers/edit/:id" element={<ProtectedRoute adminOnly />}>
              <Route index element={<EditTeacherPage />} />
            </Route>
            <Route path="/teachers/:id" element={<TeacherDetailPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/timetable" element={<ProtectedRoute adminOnly />}>
              <Route index element={<TimetablePage />} />
            </Route>
            <Route path="/leaves" element={<LeavePage />} />
            <Route path="/admin/leaves" element={<ProtectedRoute adminOnly />}>
              <Route index element={<AdminLeavePage />} />
            </Route>
            <Route path="/reports" element={<ProtectedRoute adminOnly />}>
              <Route index element={<ReportsPage />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
