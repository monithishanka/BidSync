import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.checkAuth();
      if (response.data.isAuthenticated) {
        const meResponse = await authAPI.getMe();
        setUser(meResponse.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const meResponse = await authAPI.getMe();
    setUser(meResponse.data.user);
    setIsAuthenticated(true);
    return response.data;
  };

  const adminLogin = async (credentials) => {
    const response = await authAPI.adminLogin(credentials);
    const meResponse = await authAPI.getMe();
    setUser(meResponse.data.user);
    setIsAuthenticated(true);
    return response.data;
  };

  const signup = async (userData) => {
    const response = await authAPI.signup(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    adminLogin,
    signup,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
