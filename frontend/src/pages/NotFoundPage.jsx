import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { routePaths } from '../routes/routePaths';

function NotFoundPage() {
  return (
    <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
      <Typography variant="h3">404</Typography>
      <Typography color="text.secondary">The page you are looking for does not exist.</Typography>
      <Button component={RouterLink} to={routePaths.home} variant="contained">
        Back to home
      </Button>
    </Stack>
  );
}

export default NotFoundPage;
