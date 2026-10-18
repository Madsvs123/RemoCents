import { useEffect, useState } from 'react';
import { Avatar, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import LoadingScreen from '../components/common/LoadingScreen';
import EmptyState from '../components/common/EmptyState';
import { companyService } from '../services/companyService';

function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    companyService
      .getCompanies(search ? { search } : {})
      .then(setCompanies)
      .finally(() => setIsLoading(false));
  }, [search]);

  if (isLoading) return <LoadingScreen />;

  return (
    <PageContainer title="Companies" subtitle="Discover employers and learn more about their teams.">
      <Stack spacing={2}>
        <TextField
          label="Search companies"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, industry, location"
        />
        {companies.length === 0 ? (
          <EmptyState title="No companies found" description="Try a different search term." />
        ) : (
          <Grid container spacing={2}>
            {companies.map((company) => (
              <Grid item xs={12} md={6} key={company._id}>
                <Card component={RouterLink} to={`/companies/${company._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={company.logoUrl} alt={company.name} sx={{ width: 52, height: 52 }} />
                      <Stack spacing={0.4}>
                        <Typography variant="h6">{company.name}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {company.industry || 'General'} • {company.location || 'Unknown location'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </PageContainer>
  );
}

export default CompaniesPage;
