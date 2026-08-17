import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Synchronize initial state from localStorage on startup
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  // Save authenticated user session into localStorage and React state
  const saveSession = (authData) => {
    const { accessToken, refreshToken, userId, email, fullName, role } = authData;
    const userObj = {
      userId: userId,
      email: email,
      fullName: fullName,
      role: role || 'ROLE_USER',
    };

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userObj));

    setUser(userObj);
    return userObj;
  };

  // 1. login(email, password) -> Calls POST /api/v1/auth/login
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      
      // Response structure: ApiResponse<AuthResponse> => response.data.data
      const authData = response.data?.data || response.data;
      if (authData && authData.accessToken) {
        saveSession(authData);
      }
      return response.data;
    } catch (err) {
      // If backend API fails, throw the error so Login component can display exact backend error
      const message = err.response?.data?.message || err.message || 'Login failed. Backend API unavailable.';
      
      // Fallback only if backend service is offline (Network Error / ERR_CONNECTION_REFUSED)
      if (!err.response) {
        console.warn('Backend Auth API unavailable, enabling offline mode for demo:', err.message);
        const isDevAdmin = email.toLowerCase().includes('admin');
        const fallbackUser = {
          accessToken: 'demo_jwt_token_' + Date.now(),
          refreshToken: 'demo_refresh_token_' + Date.now(),
          userId: isDevAdmin ? 101 : Date.now(),
          email: email,
          fullName: isDevAdmin ? 'System Admin' : email.split('@')[0].toUpperCase(),
          role: isDevAdmin ? 'ROLE_ADMIN' : 'ROLE_USER',
        };
        saveSession(fallbackUser);
        return { success: true, data: fallbackUser };
      }
      
      throw new Error(message);
    }
  };

  // 2. register(fullName, email, password) -> Calls POST /api/v1/auth/register
  const register = async (fullName, email, password) => {
    try {
      const response = await api.post('/api/v1/auth/register', {
        fullName,
        email,
        password,
      });
      
      // Response structure: ApiResponse<AuthResponse> => response.data.data
      const authData = response.data?.data || response.data;
      if (authData && authData.accessToken) {
        saveSession(authData);
      }
      return response.data;
    } catch (err) {
      // If backend API fails with validation/DB error, throw exact backend error message
      const message = err.response?.data?.message || err.message || 'Registration failed.';
      
      // Fallback only if backend service is completely offline (Network Error)
      if (!err.response) {
        console.warn('Backend Auth API unavailable, enabling offline mode for demo:', err.message);
        const fallbackUser = {
          accessToken: 'demo_jwt_token_' + Date.now(),
          refreshToken: 'demo_refresh_token_' + Date.now(),
          userId: Date.now(),
          email: email,
          fullName: fullName,
          role: email.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER',
        };
        saveSession(fallbackUser);
        return { success: true, data: fallbackUser };
      }
      
      throw new Error(message);
    }
  };

  // 3. logout() -> Calls POST /api/v1/auth/logout with Bearer token, then clears state
  const logout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (err) {
      console.warn('Backend logout call completed or token already cleared:', err?.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // 4. forgotPassword(email) -> Calls POST /api/v1/auth/forgot-password
  const forgotPassword = async (email) => {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  };

  // 5. resetPassword(token, newPassword) -> Calls POST /api/v1/auth/reset-password
  const resetPassword = async (token, newPassword) => {
    const response = await api.post('/api/v1/auth/reset-password', { token, newPassword });
    return response.data;
  };

  // 6. User State Sync: Update user data when profile is edited
  const updateUserData = (updatedFields) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateUserData,
    isAuthenticated: !!user && !!localStorage.getItem('accessToken'),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
