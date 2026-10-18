import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import LoadingScreen from '../components/common/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';
import MetricCard from '../components/dashboard/MetricCard';
import ProfileSummaryCard from '../components/dashboard/ProfileSummaryCard';
import ApplicationStatusChip from '../components/dashboard/ApplicationStatusChip';
import { APPLICATION_STATUSES } from '../constants/applicationOptions';
import { formatDateTime } from '../utils/formatters';
import { routePaths } from '../routes/routePaths';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const [dashboard, appsData, jobsData] = await Promise.all([
          jobService.getDashboard(),
          user.role === 'admin'
            ? applicationService.getAll()
            : user.role === 'employer'
              ? applicationService.getApplicants()
              : applicationService.getMine(),
          user.role === 'employer' || user.role === 'admin' ? jobService.getMyJobs() : Promise.resolve([]),
        ]);
        setStats(dashboard);
        setApplications(appsData);
        setJobs(jobsData);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user.role]);

  const applicationsByStatus = useMemo(
    () =>
      applications.reduce(
        (acc, application) => {
          const status = application.status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { pending: 0, interview: 0, accepted: 0, declined: 0, reviewed: 0 }
      ),
    [applications]
  );

  const openJobsCount = useMemo(() => jobs.filter((job) => job.status === 'open').length, [jobs]);

  const handleEmployerStatusChange = async (applicationId, status) => {
    await applicationService.updateStatus(applicationId, status);
    setApplications((current) =>
      current.map((application) => (application._id === applicationId ? { ...application, status } : application))
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <PageContainer title="Dashboard" subtitle={`Signed in as ${user.role}.`}>
      <Stack spacing={2.5}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <MetricCard
              label={user.role === 'employer' ? 'Total Posted Jobs' : 'Total Applications'}
              value={user.role === 'employer' ? stats?.totalJobs || 0 : stats?.totalApplications || 0}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard label="Pending" value={applicationsByStatus.pending || 0} />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard label="Interview" value={applicationsByStatus.interview || 0} />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              label={user.role === 'employer' || user.role === 'admin' ? 'Open Jobs' : 'Accepted'}
              value={user.role === 'employer' || user.role === 'admin' ? openJobsCount : applicationsByStatus.accepted || 0}
            />
          </Grid>
        </Grid>

        <ProfileSummaryCard user={user} />

        {user.role === 'employer' || user.role === 'admin' ? (
          <>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">My Jobs Activity</Typography>
                  <Button component={RouterLink} to={routePaths.manageJobs} size="small" variant="outlined">
                    Open manager
                  </Button>
                </Stack>
                {jobs.length === 0 ? (
                  <Typography color="text.secondary">No jobs posted yet.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job._id}>
                          <TableCell>{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.status}</TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>{formatDateTime(job.updatedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">Applicants Pipeline</Typography>
                {applications.length === 0 ? (
                  <Typography color="text.secondary">No candidate applications yet.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Candidate</TableCell>
                        <TableCell>Job</TableCell>
                        <TableCell>Current Status</TableCell>
                        <TableCell>Resume</TableCell>
                        <TableCell>Change Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application._id}>
                          <TableCell>{application.applicant?.name || '-'}</TableCell>
                          <TableCell>{application.job?.title || '-'}</TableCell>
                          <TableCell>
                            <ApplicationStatusChip status={application.status} />
                          </TableCell>
                          <TableCell>
                            {application.resumeUrl ? (
                              <Button size="small" component="a" href={application.resumeUrl} target="_blank" rel="noreferrer">
                                View
                              </Button>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell sx={{ minWidth: 180 }}>
                            <TextField
                              select
                              size="small"
                              value={APPLICATION_STATUSES.includes(application.status) ? application.status : 'pending'}
                              onChange={(event) => handleEmployerStatusChange(application._id, event.target.value)}
                              fullWidth
                            >
                              {APPLICATION_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>
                                  {status}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            </Paper>
          </>
        ) : (
          <Paper sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">My Application Activity</Typography>
              {applications.length === 0 ? (
                <Typography color="text.secondary">You have not applied yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Job</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Salary</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Updated</TableCell>
                      <TableCell>Resume</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>{application.job?.title || '-'}</TableCell>
                        <TableCell>{application.job?.company || '-'}</TableCell>
                        <TableCell>{application.job?.salary || '-'}</TableCell>
                        <TableCell>
                          <ApplicationStatusChip status={application.status} />
                        </TableCell>
                        <TableCell>{formatDateTime(application.updatedAt)}</TableCell>
                        <TableCell>
                          {application.resumeUrl ? (
                            <Button size="small" component="a" href={application.resumeUrl} target="_blank" rel="noreferrer">
                              View
                            </Button>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          </Paper>
        )}
      </Stack>
    </PageContainer>
  );
}

export default DashboardPage;
