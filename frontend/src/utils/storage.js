const TOKEN_KEY = 'jobs_token';
const USER_KEY = 'jobs_user';

export const storage = {
  setAuth(authPayload) {
    localStorage.setItem(TOKEN_KEY, authPayload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authPayload.user));
  },
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser() {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  },
};
