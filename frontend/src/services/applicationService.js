import httpClient from './httpClient';

export const applicationService = {
  async submit(payload) {
    const { data } = await httpClient.post('/applications', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async parseResume(payload) {
    const { data } = await httpClient.post('/applications/parse', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async getMine() {
    const { data } = await httpClient.get('/applications/me');
    return data;
  },
  async getApplicants() {
    const { data } = await httpClient.get('/applications/applicants');
    return data;
  },
  async getAll() {
    const { data } = await httpClient.get('/applications/all');
    return data;
  },
  async updateStatus(applicationId, status) {
    const { data } = await httpClient.put(`/applications/${applicationId}/status`, { status });
    return data;
  },
};
