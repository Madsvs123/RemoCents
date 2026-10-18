import { useEffect, useState } from 'react';
import { Avatar, Chip, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import PageContainer from '../components/common/PageContainer';
import LoadingScreen from '../components/common/LoadingScreen';
import { companyService } from '../services/companyService';

function CompanyDetailsPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    companyService
      .getCompanyById(id)
      .then(setCompany)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingScreen />;
  if (!company) return null;

  return (
    <PageContainer title={company.name} subtitle={company.industry || 'Company'}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={company.logoUrl} alt={company.name} sx={{ width: 64, height: 64 }} />
            <Stack>
              <Typography variant="h6">{company.name}</Typography>
              <Typography color="text.secondary">{company.location || 'Unknown location'}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={company.industry || 'Industry'} />
            <Chip label={company.size || 'Size not specified'} />
          </Stack>
          <Typography>{company.description || 'No description available.'}</Typography>
          {company.website ? (
            <Typography component="a" href={company.website} target="_blank" rel="noreferrer">
              {company.website}
            </Typography>
          ) : null}
        </Stack>
      </Paper>
    </PageContainer>
  );
}

export default CompanyDetailsPage;
