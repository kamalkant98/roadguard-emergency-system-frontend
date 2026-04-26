
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/Common/ProtectedRoute.jsx';
import MainLayout from './components/Layout/MainLayout.jsx';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import VerifyOTP from './components/Auth/VerifyOTP.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Profile from './components/Dashboard/Profile.jsx';
import BreakdownRequest from './components/Dashboard/BreakdownHistory.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/breakdown/new" element={<BreakdownRequest />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;