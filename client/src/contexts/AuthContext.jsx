import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // True until initial session check completes

  // On mount: check if server has a valid session for the user (via httpOnly cookie)
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      // No valid session — user needs to log in
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Email + password login
   */
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  /**
   * Email + password registration
   */
  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  /**
   * Google OAuth — receives Google credential JWT from Google Identity Services
   */
  const loginWithGoogle = async (credential, name, email) => {
    const data = await authService.loginWithGoogle(credential, name, email);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  /**
   * Logout — clears server session (httpOnly cookie) and resets client state
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors — still clear client state
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Update local user state (e.g. after profile update in Settings)
   */
  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, loginWithGoogle, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
