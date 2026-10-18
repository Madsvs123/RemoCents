import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { routePaths } from '../routes/routePaths';

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  role: yup.string().required(),
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const form = useFormik({
    initialValues: { name: '', email: '', password: '', role: 'job-seeker' },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        setError('');
        await register(values);
        navigate(routePaths.dashboard);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Registration failed');
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <Stack component="form" spacing={2} onSubmit={form.handleSubmit}>
      <Typography variant="h5">Create account</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField label="Full name" name="name" value={form.values.name} onChange={form.handleChange} />
      <TextField label="Email" name="email" value={form.values.email} onChange={form.handleChange} />
      <TextField label="Password" type="password" name="password" value={form.values.password} onChange={form.handleChange} />
      <TextField select label="Role" name="role" value={form.values.role} onChange={form.handleChange}>
        <MenuItem value="job-seeker">Job seeker</MenuItem>
        <MenuItem value="employer">Employer</MenuItem>
      </TextField>
      <Button type="submit" variant="contained" disabled={form.isSubmitting}>
        Create account
      </Button>
    </Stack>
  );
}

export default RegisterPage;
