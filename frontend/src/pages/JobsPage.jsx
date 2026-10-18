import { useEffect, useState } from 'react';
import { Grid, Stack } from '@mui/material';
import PageContainer from '../components/common/PageContainer';
import JobCard from '../components/jobs/JobCard';
import EnhancedJobSearch from '../components/jobs/EnhancedJobSearch';
import EmptyState from '../components/common/EmptyState';
import LoadingScreen from '../components/common/LoadingScreen';
import { jobService } from '../services/jobService';
import SearchService from '../services/searchService';
import { useAuth } from '../hooks/useAuth';
import JobInfoModal from '../components/jobs/JobInfoModal';
import ApplyJobModal from '../components/applications/ApplyJobModal';

const initialFilters = { search: '', location: '', type: '' };

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (useAdvancedSearch) {
      // Use advanced search
      SearchService.searchJobs(filters.search, {
        skills: filters.skills,
        location: filters.location,
        is_remote: filters.is_remote,
        salary_min: filters.salary_min
      })
        .then(response => {
          if (response.success) {
            setSearchResults(response.data.jobs);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      // Use basic search
      jobService
        .getJobs(filters)
        .then(setJobs)
        .finally(() => setIsLoading(false));
    }
  }, [filters, useAdvancedSearch]);

  if (isLoading) return <LoadingScreen />;

  return (
    <PageContainer title="Open positions" subtitle="Filter by location, type, or keyword.">
      <Stack spacing={2.5}>
        <EnhancedJobSearch
          onSearch={(query, advancedFilters) => {
            setUseAdvancedSearch(true);
            setFilters({ ...filters, ...advancedFilters, search: query });
          }}
        />
        {(useAdvancedSearch ? searchResults : jobs).length === 0 ? (
          <EmptyState title="No jobs found" description="Try adjusting filters or search term." />
        ) : (
          <Grid container spacing={2}>
            {(useAdvancedSearch ? searchResults : jobs).map((job) => (
              <Grid item key={job._id} xs={12} md={6}>
                <JobCard
                  job={job}
                  canApply={user?.role === 'job-seeker'}
                  onOpenInfo={(selectedJob) => {
                    setActiveJob(selectedJob);
                    setIsInfoOpen(true);
                  }}
                  onOpenApply={(selectedJob) => {
                    setActiveJob(selectedJob);
                    setIsApplyOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
      <JobInfoModal
        job={activeJob}
        open={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
      <ApplyJobModal
        job={activeJob}
        open={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />
    </PageContainer>
  );
}

export default JobsPage;
