import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const History = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Service History
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Service history coming soon...</Typography>
      </Paper>
    </Box>
  );
};

export default History;