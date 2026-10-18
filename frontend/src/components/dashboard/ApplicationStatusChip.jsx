import { Chip } from '@mui/material';

const COLOR_BY_STATUS = {
  pending: 'warning',
  reviewed: 'info',
  interview: 'primary',
  accepted: 'success',
  declined: 'error',
};

function ApplicationStatusChip({ status }) {
  return <Chip size="small" label={status || 'unknown'} color={COLOR_BY_STATUS[status] || 'default'} />;
}

export default ApplicationStatusChip;
