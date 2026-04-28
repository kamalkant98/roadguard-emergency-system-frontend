// src/components/Dashboard/Emergency.jsx
import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Emergency as EmergencyIcon } from '@mui/icons-material';

const Emergency = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Emergency SOS
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <EmergencyIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Emergency Assistance
        </Typography>
        <Button variant="contained" color="error" size="large">
          CALL EMERGENCY
        </Button>
      </Paper>
    </Box>
  );
};

export default Emergency;