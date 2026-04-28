import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Wallet = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Wallet
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Wallet management coming soon...</Typography>
      </Paper>
    </Box>
  );
};

export default Wallet;