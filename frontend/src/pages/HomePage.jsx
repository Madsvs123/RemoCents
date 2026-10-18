import { Button, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import { routePaths } from '../routes/routePaths';

function HomePage() {
  return (
    <PageContainer title="Find your next opportunity" subtitle="Modern hiring experience for job seekers and employers.">
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            Explore open jobs, build your profile, and apply with your resume. Employers can post jobs and manage applicants in one dashboard.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button component={RouterLink} to={routePaths.jobs} variant="contained">
              Browse jobs
            </Button>
            <Button component={RouterLink} to={routePaths.register} variant="outlined">
              Create account
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </PageContainer>
  );
}

export default HomePage;
