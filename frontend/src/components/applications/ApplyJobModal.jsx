import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import ApplyJobForm from './ApplyJobForm';

function ApplyJobModal({ job, open, onClose, onApplied }) {
  if (!job) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Apply to job</DialogTitle>
      <DialogContent>
        <ApplyJobForm
          job={job}
          onApplied={(application) => {
            onApplied?.(application);
            onClose?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ApplyJobModal;
