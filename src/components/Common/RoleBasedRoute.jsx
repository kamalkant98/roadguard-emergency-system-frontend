import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

// Component shown when access is denied
const AccessDenied = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h4">Access Denied</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          You don't have permission to view this page
        </Typography>
        <Button variant="contained" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Paper>
    </Box>
  );
};

// Main Role-Based Route Component
const RoleBasedRoute = ({ allowedRoles, children }) => {
  // Get current user role from AuthContext
  const { user, userRole, loading } = useAuth();

  // Show loading while checking
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  // If not logged in, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ★★★ CRITICAL CHECK ★★★
  // Does the user's role match the allowed roles for this route?
  if (!allowedRoles.includes(userRole)) {
    return <AccessDenied />; // No → Show access denied
  }

  // Yes → Allow access to the page
  return children;
};

// Specific route guards for each role
export const UserRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['user']}>{children}</RoleBasedRoute>
);

export const MechanicRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['mechanic']}>{children}</RoleBasedRoute>
);

export const AdminRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['admin']}>{children}</RoleBasedRoute>
);

// Route accessible by both user and mechanic
export const UserAndMechanicRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['user', 'mechanic']}>{children}</RoleBasedRoute>
);