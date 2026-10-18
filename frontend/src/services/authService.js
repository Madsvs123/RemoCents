import httpClient from './httpClient';

export const authService = {
  async login(payload) {
    const { data } = await httpClient.post('/auth/login', payload);
    return data;
  },
  async register(payload) {
    const { data } = await httpClient.post('/auth/register', payload);
    return data;
  },
  async getProfile() {
    const { data } = await httpClient.get('/auth/profile');
    return data;
  },
  async updateProfile(payload) {
    const { data } = await httpClient.put('/auth/profile', payload);
    return data;
  },
  async updateProfilePicture(payload) {
    const { data } = await httpClient.put('/auth/profile-picture', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
