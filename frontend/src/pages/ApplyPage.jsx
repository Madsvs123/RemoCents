import { useEffect, useState } from 'react';
import { Alert, Paper } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import LoadingScreen from '../components/common/LoadingScreen';
import ApplyJobForm from '../components/applications/ApplyJobForm';
import { jobService } from '../services/jobService';

function ApplyPage() {
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (!jobId) {
      setErrorMessage('Job id is required to apply.');
      setIsLoading(false);
      return;
    }

    jobService
      .getJobById(jobId)
      .then(setJob)
      .catch((error) => setErrorMessage(error?.response?.data?.message || 'Failed to load job details.'))
      .finally(() => setIsLoading(false));
  }, [searchParams]);

  if (isLoading) return <LoadingScreen />;

  return (
    <PageContainer title="Apply to job" subtitle="Submit your application details securely.">
      <Paper sx={{ p: 3 }}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {job ? <ApplyJobForm job={job} /> : null}
      </Paper>
    </PageContainer>
  );
}

export default ApplyPage;
