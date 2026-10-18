import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

function ConfirmDialog({ open, onClose, onConfirm, title, description, isLoading = false }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Please wait...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
