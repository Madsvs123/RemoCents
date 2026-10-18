import httpClient from './httpClient';

export const adminService = {
  async getUsers() {
    const { data } = await httpClient.get('/admin/users');
    return data;
  },
  async updateUserRole(userId, role) {
    const { data } = await httpClient.put(`/admin/users/${userId}/role`, { role });
    return data;
  },
};
