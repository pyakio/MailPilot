import { createContext, useState, useEffect } from 'react';
import { DEFAULT_USER } from '../constants';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('saas_auth_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('saas_is_authenticated') !== 'false';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('saas_auth_user', JSON.stringify(user));
      localStorage.setItem('saas_is_authenticated', 'true');
    } else {
      localStorage.removeItem('saas_auth_user');
      localStorage.setItem('saas_is_authenticated', 'false');
    }
  }, [user]);

  const login = async (email, password) => {
    const authUser = await authService.login(email, password);
    setUser(authUser);
    setIsAuthenticated(true);
    return authUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
