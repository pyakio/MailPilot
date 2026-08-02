import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const MOCK_USER = {
  id: 'usr_9981',
  name: 'Alex Morgan',
  email: 'alex.morgan@acmecloud.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Head of Marketing',
  company: 'Acme SaaS Labs',
  plan: 'Enterprise Pro',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('saas_auth_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
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

  const login = (email, password) => {
    const authUser = {
      ...MOCK_USER,
      email: email || MOCK_USER.email,
      name: email ? email.split('@')[0].replace('.', ' ') : MOCK_USER.name,
    };
    setUser(authUser);
    setIsAuthenticated(true);
    return Promise.resolve(authUser);
  };

  const logout = () => {
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
