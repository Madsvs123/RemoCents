import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { routePaths } from '../routes/routePaths';
import { useAuth } from '../hooks/useAuth';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const form = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        setError('');
        await login(values);
        navigate(routePaths.dashboard);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Login failed');
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <Stack component="form" spacing={2} onSubmit={form.handleSubmit}>
      <Typography variant="h5">Welcome back</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField label="Email" name="email" value={form.values.email} onChange={form.handleChange} />
      <TextField label="Password" type="password" name="password" value={form.values.password} onChange={form.handleChange} />
      <Button type="submit" variant="contained" disabled={form.isSubmitting}>
        Sign in
      </Button>
      <Button component={RouterLink} to={routePaths.register}>
        Need an account?
      </Button>
    </Stack>
  );
}

export default LoginPage;
