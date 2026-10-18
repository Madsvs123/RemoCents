import { Avatar, Chip, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

function JobInfoModal({ job, open, onClose }) {
  if (!job) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{job.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar src={job?.companyId?.logoUrl || job.logoUrl} alt={job.company} />
            <Typography color="text.secondary">{job.company}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={job.type} size="small" />
            <Chip label={job.workMode} size="small" />
            <Chip label={job.location} size="small" />
            <Chip label={job.category} size="small" />
          </Stack>
          <Typography fontWeight={600}>Salary: {job.salary}</Typography>
          <Typography>{job.description}</Typography>
          <Typography fontWeight={700}>Requirements</Typography>
          <ul>
            {(job.requirements || []).map((item) => (
              <li key={item}>
                <Typography>{item}</Typography>
              </li>
            ))}
          </ul>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default JobInfoModal;
