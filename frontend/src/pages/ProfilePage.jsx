import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import PageContainer from '../components/common/PageContainer';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';
import { formatDateTime } from '../utils/formatters';
import LoadingScreen from '../components/common/LoadingScreen';
import ApplicationStatusChip from '../components/dashboard/ApplicationStatusChip';

const schema = yup.object({
  name: yup.string().required(),
});

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [profile, applications, jobs] = await Promise.all([
          authService.getProfile(),
          user?.role === 'job-seeker' ? applicationService.getMine() : Promise.resolve([]),
          user?.role === 'employer' ? jobService.getMyJobs() : Promise.resolve([]),
        ]);
        setUser(profile);
        setRecentApplications(applications.slice(0, 5));
        setRecentJobs(jobs.slice(0, 5));
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Failed to load profile details.');
      } finally {
        setIsBootstrapping(false);
      }
    }
    bootstrap();
  }, [setUser, user?.role]);

  const form = useFormik({
    initialValues: {
      name: user?.name || '',
      title: user?.profile?.title || '',
      location: user?.profile?.location || '',
      experience: user?.profile?.experience || '',
      company: user?.profile?.company || '',
      website: user?.profile?.website || '',
      bio: user?.profile?.bio || '',
      skills: (user?.profile?.skills || []).join(', '),
      education: user?.profile?.education || '',
      linkedin: user?.profile?.linkedin || '',
      github: user?.profile?.github || '',
      resumeUrl: user?.profile?.resumeUrl || '',
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        setErrorMessage('');
        setNotice('');
        const payload = {
          name: values.name,
          profile: {
            title: values.title,
            location: values.location,
            experience: values.experience,
            company: values.company,
            website: values.website,
            bio: values.bio,
            skills: values.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean),
            education: values.education,
            linkedin: values.linkedin,
            github: values.github,
            resumeUrl: values.resumeUrl,
          },
        };
        const updated = await authService.updateProfile(payload);
        setUser(updated);
        setNotice('Profile saved successfully.');
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Could not save profile.');
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const profileCompletion = useMemo(() => {
    const keys = ['title', 'location', 'experience', 'bio', 'skills', 'education', 'linkedin', 'github', 'resumeUrl'];
    const completed = keys.filter((key) => {
      if (key === 'skills') return Array.isArray(user?.profile?.skills) && user.profile.skills.length > 0;
      return Boolean(user?.profile?.[key]);
    }).length;
    return Math.round((completed / keys.length) * 100);
  }, [user]);

  const handleResumeParse = async () => {
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append('resume', resumeFile);
    setIsParsingResume(true);
    setErrorMessage('');
    setNotice('');
    try {
      const parsed = await applicationService.parseResume(formData);
      form.setFieldValue('resumeUrl', parsed.resumeUrl || form.values.resumeUrl);
      form.setFieldValue('education', parsed.education || form.values.education);
      form.setFieldValue('experience', parsed.experience || form.values.experience);
      form.setFieldValue('linkedin', parsed.linkedin || form.values.linkedin);
      form.setFieldValue('github', parsed.github || form.values.github);
      form.setFieldValue('bio', parsed.summary || form.values.bio);
      if (parsed.skills) {
        form.setFieldValue('skills', parsed.skills);
      }
      setNotice('Resume parsed and profile fields were pre-filled.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Resume parsing failed.');
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      setErrorMessage('');
      const updated = await authService.updateProfilePicture(formData);
      setUser(updated);
      setNotice('Profile picture updated.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Could not upload profile picture.');
    }
  };

  if (isBootstrapping) return <LoadingScreen />;

  return (
    <PageContainer title="Profile" subtitle="Keep your profile current for better matching.">
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stack component="form" spacing={2} onSubmit={form.handleSubmit}>
              {notice ? <Alert severity="success">{notice}</Alert> : null}
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
              <Typography variant="h6">Personal Information</Typography>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar src={user?.profile?.avatarUrl} sx={{ width: 58, height: 58 }}>
                  {user?.profile?.avatarUrl ? '' : (user?.name || 'U').charAt(0)}
                </Avatar>
                <Button variant="outlined" component="label">
                  Select profile picture
                  <input hidden type="file" accept="image/png,image/jpeg" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                </Button>
                <Button variant="outlined" onClick={handleAvatarUpload} disabled={!avatarFile}>
                  Upload picture
                </Button>
              </Stack>
              <TextField label="Name" name="name" value={form.values.name} onChange={form.handleChange} />
              <TextField label="Professional title" name="title" value={form.values.title} onChange={form.handleChange} />
              <TextField label="Location" name="location" value={form.values.location} onChange={form.handleChange} />
              <TextField label="Experience" name="experience" value={form.values.experience} onChange={form.handleChange} />
              <TextField label="Company" name="company" value={form.values.company} onChange={form.handleChange} />
              <TextField label="Website" name="website" value={form.values.website} onChange={form.handleChange} />
              <TextField label="Education" name="education" value={form.values.education} onChange={form.handleChange} />
              <TextField
                multiline
                minRows={3}
                label="Bio"
                name="bio"
                value={form.values.bio}
                onChange={form.handleChange}
              />
              <TextField
                label="Skills (comma separated)"
                name="skills"
                value={form.values.skills}
                onChange={form.handleChange}
              />
              <Typography variant="h6">Links and Resume</Typography>
              <TextField label="LinkedIn" name="linkedin" value={form.values.linkedin} onChange={form.handleChange} />
              <TextField label="GitHub" name="github" value={form.values.github} onChange={form.handleChange} />
              <TextField label="Resume URL" name="resumeUrl" value={form.values.resumeUrl} onChange={form.handleChange} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Button variant="outlined" component="label">
                  Select Resume
                  <input hidden type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                </Button>
                <Button variant="outlined" onClick={handleResumeParse} disabled={!resumeFile || isParsingResume}>
                  {isParsingResume ? 'Parsing...' : 'Parse resume with backend'}
                </Button>
                <Button type="submit" variant="contained" disabled={form.isSubmitting}>
                  Save profile
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Profile Analytics</Typography>
                <Typography color="text.secondary">Completion: {profileCompletion}%</Typography>
                <Typography color="text.secondary">Role: {user?.role}</Typography>
                <Typography color="text.secondary">Saved jobs: {user?.savedJobs?.length || 0}</Typography>
                <Typography color="text.secondary">Account created: {formatDateTime(user?.createdAt)}</Typography>
              </Stack>
            </Paper>

            {user?.role === 'job-seeker' ? (
              <Paper sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="h6">Recent Application Activity</Typography>
                  {recentApplications.length === 0 ? (
                    <Typography color="text.secondary">No applications yet.</Typography>
                  ) : (
                    recentApplications.map((application) => (
                      <Stack
                        key={application._id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ py: 0.5 }}
                      >
                        <Stack>
                          <Typography variant="body2">{application.job?.title || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(application.updatedAt)}
                          </Typography>
                        </Stack>
                        <ApplicationStatusChip status={application.status} />
                      </Stack>
                    ))
                  )}
                </Stack>
              </Paper>
            ) : (
              <Paper sx={{ p: 2.5 }}>
                <Stack spacing={1}>
                  <Typography variant="h6">Recent Job Activity</Typography>
                  {recentJobs.length === 0 ? (
                    <Typography color="text.secondary">No posted jobs yet.</Typography>
                  ) : (
                    recentJobs.map((job) => (
                      <Stack
                        key={job._id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ py: 0.5 }}
                      >
                        <Stack>
                          <Typography variant="body2">{job.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(job.updatedAt)}
                          </Typography>
                        </Stack>
                        <Chip label={job.status} size="small" />
                      </Stack>
                    ))
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

export default ProfilePage;
