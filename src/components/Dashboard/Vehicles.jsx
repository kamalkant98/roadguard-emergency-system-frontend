import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Vehicles = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Vehicles
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Vehicles management coming soon...</Typography>
      </Paper>
    </Box>
  );
};

export default Vehicles;