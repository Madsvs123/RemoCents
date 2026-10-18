import httpClient from './httpClient';

export const jobService = {
  async getJobs(params = {}) {
    const { data } = await httpClient.get('/jobs', { params });
    return data;
  },
  async getJobById(jobId) {
    const { data } = await httpClient.get(`/jobs/${jobId}`);
    return data;
  },
  async getMyJobs() {
    const { data } = await httpClient.get('/jobs/my-jobs');
    return data;
  },
  async getDashboard() {
    const { data } = await httpClient.get('/jobs/dashboard');
    return data;
  },
  async createJob(payload) {
    const { data } = await httpClient.post('/jobs', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async updateJob(jobId, payload) {
    const { data } = await httpClient.put(`/jobs/${jobId}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async deleteJob(jobId) {
    const { data } = await httpClient.delete(`/jobs/${jobId}`);
    return data;
  },
};
