import { Box, CircularProgress } from '@mui/material';

function LoadingScreen() {
  return (
    <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

export default LoadingScreen;
