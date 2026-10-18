import { Paper, Typography } from '@mui/material';

function EmptyState({ title, description }) {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Paper>
  );
}

export default EmptyState;
