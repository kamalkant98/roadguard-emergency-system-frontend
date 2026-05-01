import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';

// Lazy Imports
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const VerifyOTP = lazy(() => import('./components/Auth/VerifyOTP'));

const ProtectedRoute = lazy(() => import('./components/Common/ProtectedRoute'));
const MainLayout = lazy(() => import('./components/Layout/MainLayout'));

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Profile = lazy(() => import('./components/Dashboard/Profile'));
const Vehicles = lazy(() => import('./components/Dashboard/Vehicles'));
const History = lazy(() => import('./components/Dashboard/History'));
const Emergency = lazy(() => import('./components/Dashboard/Emergency'));
const Settings = lazy(() => import('./components/Dashboard/Settings'));
const Wallet = lazy(() => import('./components/Dashboard/Wallet'));
const HelpCenter = lazy(() => import('./components/Dashboard/HelpCenter'));
const BreakdownRequest = lazy(() => import('./components/Dashboard/BreakdownHistory'));
import { FullScreenLoader } from './components/Common/Loader';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Suspense fallback={<FullScreenLoader text="Loading..." />}>
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
        </Suspense>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;