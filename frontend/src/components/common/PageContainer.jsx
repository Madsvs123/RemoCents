import { Stack, Typography } from '@mui/material';

function PageContainer({ title, subtitle, children }) {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">{title}</Typography>
        {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
      </Stack>
      {children}
    </Stack>
  );
}

export default PageContainer;
