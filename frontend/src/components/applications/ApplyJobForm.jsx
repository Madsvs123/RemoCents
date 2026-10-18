import { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../hooks/useAuth';
import VideoResumeUpload from './VideoResumeUpload';

const schema = yup.object({
  coverLetter: yup.string().max(2000),
  resumeUrl: yup.string().url('Enter a valid URL').nullable(),
});

function ApplyJobForm({ job, onApplied }) {
  const { user } = useAuth();
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const form = useFormik({
    initialValues: {
      coverLetter: '',
      resumeUrl: user?.profile?.resumeUrl || '',
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setNotice('');
      setErrorMessage('');
      try {
        const formData = new FormData();
        formData.append('jobId', job._id);
        if (values.coverLetter) formData.append('coverLetter', values.coverLetter);
        if (values.resumeUrl) formData.append('resumeUrl', values.resumeUrl);
        if (resumeFile) formData.append('resume', resumeFile);

        const result = await applicationService.submit(formData);
        setNotice('Application submitted successfully.');
        onApplied?.(result);
        helpers.resetForm({ values: { coverLetter: '', resumeUrl: values.resumeUrl } });
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Could not submit application.');
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  if (user?.role !== 'job-seeker') {
    return <Alert severity="info">Only job seekers can apply for jobs.</Alert>;
  }

  return (
    <Stack component="form" spacing={2} onSubmit={form.handleSubmit}>
      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Typography variant="h6">Apply for {job.title}</Typography>
      <Typography color="text.secondary">{job.company}</Typography>

      <TextField
        multiline
        minRows={4}
        label="Cover letter"
        name="coverLetter"
        value={form.values.coverLetter}
        onChange={form.handleChange}
        placeholder="Share why you are a strong fit for this role."
      />

      <TextField
        label="Resume URL (optional)"
        name="resumeUrl"
        value={form.values.resumeUrl}
        onChange={form.handleChange}
        helperText="If you upload a file below, backend will prefer uploaded resume."
      />

      <Button variant="outlined" component="label">
        Upload Resume (PDF)
        <input
          hidden
          type="file"
          accept="application/pdf"
          onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
        />
      </Button>

      <VideoResumeUpload 
        applicationId={job._id}
        onUploadSuccess={(videoData) => {
          // You could store the video ID or show a success message
          console.log('Video resume uploaded:', videoData);
        }}
      />

      <Button type="submit" variant="contained" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Submitting...' : 'Submit application'}
      </Button>
    </Stack>
  );
}

export default ApplyJobForm;
