
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyOTP from './components/Auth/VerifyOTP';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Dashboard/Profile';
import BreakdownRequest from './components/Dashboard/BreakdownHistory';
import Vehicles from './components/Dashboard/Vehicles';
import History from './components/Dashboard/History';
import Emergency from './components/Dashboard/Emergency';
import Settings from './components/Dashboard/Settings';
import Wallet from './components/Dashboard/Wallet';
import HelpCenter from './components/Dashboard/HelpCenter';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        {/* Protected Routes */}
        {/* <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/breakdown/new" element={<BreakdownRequest />} />
          </Route>
        </Route> */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/history" element={<History />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/breakdown/new" element={<BreakdownRequest />} />
            <Route path="/towing" element={<BreakdownRequest />} />
            <Route path="/saved-locations" element={<Profile />} />
            <Route path="/payment-methods" element={<Wallet />} />
            <Route path="/payment-history" element={<History />} />
            <Route path="/ratings" element={<Profile />} />
            <Route path="/chat" element={<HelpCenter />} />
            <Route path="/faq" element={<HelpCenter />} />
            <Route path="/feedback" element={<Profile />} />
            <Route path="/privacy" element={<Settings />} />
            <Route path="/security" element={<Settings />} />
            <Route path="/notifications" element={<Settings />} />
            <Route path="/terms" element={<Settings />} />
            <Route path="/track-service" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;