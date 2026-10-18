import { Card, CardContent, Typography } from '@mui/material';

function MetricCard({ label, value, helperText }) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
        {helperText ? (
          <Typography color="text.secondary" variant="caption">
            {helperText}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default MetricCard;
