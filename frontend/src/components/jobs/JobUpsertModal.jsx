import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Dialog, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { JOB_TYPES, WORK_MODES } from '../../constants/jobOptions';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';

const schema = yup.object({
  title: yup.string().required(),
  company: yup.string().required(),
  location: yup.string().required(),
  type: yup.string().required(),
  workMode: yup.string().required(),
  category: yup.string().required(),
  salary: yup.string().required(),
  description: yup.string().required(),
});

function JobUpsertModal({ open, onClose, onSaved, existingJob }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const isEdit = Boolean(existingJob?._id);

  const initialValues = useMemo(
    () => ({
      title: existingJob?.title || '',
      company: existingJob?.company || '',
      companyId: existingJob?.companyId?._id || '',
      location: existingJob?.location || '',
      type: existingJob?.type || 'full-time',
      workMode: existingJob?.workMode || 'on-site',
      category: existingJob?.category || '',
      salary: existingJob?.salary || '',
      description: existingJob?.description || '',
      requirements: (existingJob?.requirements || []).join(', '),
    }),
    [existingJob]
  );

  const form = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        setErrorMessage('');
        const payload = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'requirements') payload.append(key, value);
        });
        values.requirements
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => payload.append('requirements[]', item));
        if (logoFile) payload.append('logo', logoFile);

        const result = isEdit
          ? await jobService.updateJob(existingJob._id, payload)
          : await jobService.createJob(payload);
        onSaved?.(result, isEdit ? 'updated' : 'created');
        onClose?.();
      } catch (error) {
        setErrorMessage(error?.response?.data?.message || 'Could not save job.');
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) return;
    companyService.getCompanies().then(setCompanies).catch(() => setCompanies([]));
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit Job' : 'Create Job'}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} sx={{ pt: 1 }} onSubmit={form.handleSubmit}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Title" name="title" value={form.values.title} onChange={form.handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Company" name="company" value={form.values.company} onChange={form.handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Linked Company (optional)"
                name="companyId"
                value={form.values.companyId}
                onChange={(event) => {
                  const selectedId = event.target.value;
                  const selectedCompany = companies.find((item) => item._id === selectedId);
                  form.setFieldValue('companyId', selectedId);
                  if (selectedCompany?.name) {
                    form.setFieldValue('company', selectedCompany.name);
                  }
                }}
              >
                <MenuItem value="">None</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company._id} value={company._id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Location" name="location" value={form.values.location} onChange={form.handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Category" name="category" value={form.values.category} onChange={form.handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Type" name="type" value={form.values.type} onChange={form.handleChange}>
                {JOB_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Work mode" name="workMode" value={form.values.workMode} onChange={form.handleChange}>
                {WORK_MODES.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {mode}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Salary" name="salary" value={form.values.salary} onChange={form.handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                multiline
                minRows={3}
                fullWidth
                label="Description"
                name="description"
                value={form.values.description}
                onChange={form.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements (comma separated)"
                name="requirements"
                value={form.values.requirements}
                onChange={form.handleChange}
              />
            </Grid>
          </Grid>
          <Button variant="outlined" component="label">
            Upload Logo (optional)
            <input hidden type="file" accept="image/png,image/jpeg" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} />
          </Button>
          <Stack direction="row" spacing={1.2} justifyContent="flex-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Saving...' : isEdit ? 'Update Job' : 'Create Job'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default JobUpsertModal;
