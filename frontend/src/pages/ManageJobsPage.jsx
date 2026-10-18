import { useEffect, useState } from 'react';
import { Alert, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import PageContainer from '../components/common/PageContainer';
import LoadingScreen from '../components/common/LoadingScreen';
import { jobService } from '../services/jobService';
import JobUpsertModal from '../components/jobs/JobUpsertModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import JobInfoModal from '../components/jobs/JobInfoModal';

function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [upsertState, setUpsertState] = useState({ open: false, job: null });
  const [deleteState, setDeleteState] = useState({ open: false, job: null, isDeleting: false });
  const [previewState, setPreviewState] = useState({ open: false, job: null });

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await jobService.getMyJobs();
      setJobs(response);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Failed to load your jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async () => {
    if (!deleteState.job?._id) return;
    setDeleteState((prev) => ({ ...prev, isDeleting: true }));
    try {
      await jobService.deleteJob(deleteState.job._id);
      setNotice('Job deleted successfully.');
      setJobs((current) => current.filter((item) => item._id !== deleteState.job._id));
      setDeleteState({ open: false, job: null, isDeleting: false });
    } catch (error) {
      setDeleteState((prev) => ({ ...prev, isDeleting: false }));
      setErrorMessage(error?.response?.data?.message || 'Could not delete the job.');
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <PageContainer title="Manage Jobs" subtitle="Create, edit, preview, and remove your published jobs.">
      <Stack spacing={2}>
        {notice ? <Alert severity="success">{notice}</Alert> : null}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary">Total jobs: {jobs.length}</Typography>
          <Button variant="contained" onClick={() => setUpsertState({ open: true, job: null })}>
            Create new job
          </Button>
        </Stack>
        <Paper sx={{ p: 2 }}>
          {jobs.length === 0 ? (
            <Typography color="text.secondary">No jobs found. Create your first posting.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job._id}>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.status}</TableCell>
                    <TableCell>{job.type}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => setPreviewState({ open: true, job })}>
                          View
                        </Button>
                        <Button size="small" onClick={() => setUpsertState({ open: true, job })}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setDeleteState({ open: true, job, isDeleting: false })}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>

      <JobUpsertModal
        open={upsertState.open}
        existingJob={upsertState.job}
        onClose={() => setUpsertState({ open: false, job: null })}
        onSaved={(savedJob, action) => {
          setNotice(`Job ${action} successfully.`);
          setJobs((current) => {
            if (action === 'created') return [savedJob, ...current];
            return current.map((item) => (item._id === savedJob._id ? savedJob : item));
          });
        }}
      />

      <ConfirmDialog
        open={deleteState.open}
        title="Delete this job?"
        description="This action cannot be undone. The posting will be permanently removed."
        onClose={() => setDeleteState({ open: false, job: null, isDeleting: false })}
        onConfirm={handleDelete}
        isLoading={deleteState.isDeleting}
      />

      <JobInfoModal
        open={previewState.open}
        job={previewState.job}
        onClose={() => setPreviewState({ open: false, job: null })}
      />
    </PageContainer>
  );
}

export default ManageJobsPage;
