import { Button, Grid, MenuItem, TextField } from '@mui/material';
import { JOB_TYPES } from '../../constants/jobOptions';

function JobFilters({ filters, onChange, onReset }) {
  return (
    <Grid container spacing={1.5}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Search"
          name="search"
          value={filters.search}
          onChange={onChange}
          placeholder="Title, company, description"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField fullWidth label="Location" name="location" value={filters.location} onChange={onChange} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField select fullWidth label="Type" name="type" value={filters.type} onChange={onChange}>
          <MenuItem value="">All</MenuItem>
          {JOB_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={2}>
        <Button onClick={onReset} fullWidth variant="outlined" sx={{ height: '100%' }}>
          Reset
        </Button>
      </Grid>
    </Grid>
  );
}

export default JobFilters;
