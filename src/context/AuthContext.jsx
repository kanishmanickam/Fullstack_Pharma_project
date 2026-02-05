import { createContext, useState, useContext, useEffect } from 'react';

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
      
      // Temporary mock login for testing
      const mockUsers = [
        { id: 1, username: 'admin', password: 'admin123', role: 'owner', email: 'admin@medistock.com' },
        { id: 2, username: 'staff', password: 'staff123', role: 'staff', email: 'staff@medistock.com' },
      ];
      
      const user = mockUsers.find(u => u.username === username && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        setToken('mock-token-123');
        localStorage.setItem('medistock_user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('medistock_token', 'mock-token-123');
        return { success: true, user: userWithoutPassword };
      }
      
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      return { success: false, message: 'Login failed' };
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
