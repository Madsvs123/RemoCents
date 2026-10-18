import httpClient from './httpClient';

export const companyService = {
  async getCompanies(params = {}) {
    const { data } = await httpClient.get('/companies', { params });
    return data;
  },
  async getCompanyById(companyId) {
    const { data } = await httpClient.get(`/companies/${companyId}`);
    return data;
  },
  async getMyCompany() {
    const { data } = await httpClient.get('/companies/me');
    return data;
  },
  async createCompany(payload) {
    const { data } = await httpClient.post('/companies', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async updateCompany(companyId, payload) {
    const { data } = await httpClient.put(`/companies/${companyId}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
