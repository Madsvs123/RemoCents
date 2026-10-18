import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function JobCard({ job, onOpenInfo, onOpenApply, canApply }) {
  const logo = job?.companyId?.logoUrl || job.logoUrl;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={job.title}
        subheader={job.company}
        avatar={<Avatar src={logo} alt={job.company} />}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={job.type} size="small" />
            <Chip label={job.workMode} size="small" />
            <Chip label={job.location} size="small" />
          </Stack>
          <Typography variant="body2">{job.salary}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {job.description}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ mt: 'auto' }}>
        <Button size="small" onClick={() => onOpenInfo?.(job)}>
          Quick view
        </Button>
        {canApply ? (
          <Button size="small" variant="contained" onClick={() => onOpenApply?.(job)}>
            Apply
          </Button>
        ) : null}
        <Button component={RouterLink} to={`/jobs/${job._id}`} size="small">
          Open page
        </Button>
      </CardActions>
    </Card>
  );
}

export default JobCard;
