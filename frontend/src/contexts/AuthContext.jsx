import { createContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser());
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(storage.getToken()));

  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    authService
      .getProfile()
      .then((profile) => {
        setUser(profile);
        storage.setAuth({ token, user: profile });
      })
      .catch(() => {
        storage.clearAuth();
        setUser(null);
      })
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    storage.setAuth({
      token: response.token,
      user: { _id: response._id, name: response.name, email: response.email, role: response.role },
    });
    const profile = await authService.getProfile();
    storage.setAuth({ token: response.token, user: profile });
    setUser(profile);
    return profile;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    storage.setAuth({
      token: response.token,
      user: { _id: response._id, name: response.name, email: response.email, role: response.role },
    });
    const profile = await authService.getProfile();
    storage.setAuth({ token: response.token, user: profile });
    setUser(profile);
    return profile;
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingAuth,
      login,
      register,
      logout,
      setUser,
    }),
    [user, isCheckingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
