import { useEffect, useState } from 'react';
import { Avatar, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';
import { jobService } from '../services/jobService';
import { useAuth } from '../hooks/useAuth';
import { routePaths } from '../routes/routePaths';
import ApplyJobModal from '../components/applications/ApplyJobModal';

function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  useEffect(() => {
    jobService
      .getJobById(id)
      .then(setJob)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingScreen />;
  if (!job) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h4">{job.title}</Typography>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar src={job?.companyId?.logoUrl || job.logoUrl} alt={job.company} />
          <Typography variant="h6" color="text.secondary">
            {job.company}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip label={job.type} />
          <Chip label={job.workMode} />
          <Chip label={job.location} />
        </Stack>
        <Typography>{job.description}</Typography>
        <Typography fontWeight={700}>Requirements</Typography>
        <ul>
          {(job.requirements || []).map((item) => (
            <li key={item}>
              <Typography>{item}</Typography>
            </li>
          ))}
        </ul>
        {user?.role === 'job-seeker' ? (
          <Button variant="contained" onClick={() => setIsApplyOpen(true)}>
            Apply now
          </Button>
        ) : null}
        <Button variant="outlined" href={`${routePaths.apply}?jobId=${job._id}`}>
          Open apply page
        </Button>
      </Stack>
      <ApplyJobModal job={job} open={isApplyOpen} onClose={() => setIsApplyOpen(false)} />
    </Paper>
  );
}

export default JobDetailsPage;
