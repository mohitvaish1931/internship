import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('learnkins_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // Verify session profile is still valid on backend
          const response = await api.get('/api/auth/me', {
            headers: { 'x-user-id': parsedUser._id }
          });
          
          setUser(response.data.user);
          localStorage.setItem('learnkins_user', JSON.stringify(response.data.user));
        } catch (error) {
          console.error('Session verify failed. Clearing stale login cache.', error);
          localStorage.removeItem('learnkins_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Simple Login operation (No JWT)
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const authenticatedUser = response.data.user;
      
      setUser(authenticatedUser);
      localStorage.setItem('learnkins_user', JSON.stringify(authenticatedUser));
      return { success: true, user: authenticatedUser };
    } catch (error) {
      console.error('Context login error:', error);
      const errorMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: errorMsg };
    }
  };

  // Logout operation
  const logout = () => {
    localStorage.removeItem('learnkins_user');
    setUser(null);
  };

  // Fetch updated student status/progress markers
  const refreshMe = async () => {
    if (!user) return;
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      localStorage.setItem('learnkins_user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Error refreshing session details:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshMe, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
