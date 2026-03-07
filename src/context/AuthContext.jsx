import { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('medistock_user');
    const savedToken = localStorage.getItem('medistock_token');

    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);

      const res = await axiosInstance.post('/auth/login', { username, password });

      if (res.data.success) {
        if (res.data.requires2FA) {
          return { success: true, requires2FA: true, username: res.data.username };
        }

        const { user, token } = res.data;
        setCurrentUser(user);
        setToken(token);
        localStorage.setItem('medistock_user', JSON.stringify(user));
        localStorage.setItem('medistock_token', token);
        return { success: true, user: user };
      }

      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (username, tokenStr) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post('/auth/login/verify-2fa', { username, token: tokenStr });

      if (res.data.success) {
        const { user, token } = res.data;
        setCurrentUser(user);
        setToken(token);
        localStorage.setItem('medistock_user', JSON.stringify(user));
        localStorage.setItem('medistock_token', token);
        return { success: true, user: user };
      }
      return { success: false, message: res.data.message || 'Invalid 2FA token' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('medistock_user');
    localStorage.removeItem('medistock_token');
  };

  const hasRole = (roles) => {
    if (!currentUser) return false;
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    return currentUser.role === roles;
  };

  const value = {
    currentUser,
    token,
    login,
    verify2FA,
    logout,
    hasRole,
    loading,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
