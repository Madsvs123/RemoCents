import { Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 460, p: 3.5 }}>
        <Outlet />
      </Paper>
    </Box>
  );
}

export default AuthLayout;
