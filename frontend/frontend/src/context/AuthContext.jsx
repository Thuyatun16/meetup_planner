import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { api } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Configure axios to include credentials
        axios.defaults.withCredentials = true;
        
        // Try to access a protected endpoint to verify authentication
        const response = await axios.get(api.defaults.baseURL+'/auth/me');
        if (response.data) {
          setUser(response.data);
          console.log('User authenticated:', response.data);
        }
      } catch (err) {
        // User is not authenticated, but this isn't an error
        console.log('User not authenticated');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email, password, remember = true) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(
        api.defaults.baseURL + '/auth/login',
        { email, password, remember },
        { withCredentials: true }
      );
      
      // The backend sets cookies automatically
      // We can store some user info in state if needed
      setUser({email});
      console.log('User logged in:', response);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // You may need to implement a logout endpoint in your backend
      await axios.post(api.defaults.baseURL+'/auth/logout', {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed');
      // Even if the API call fails, we clear the user from state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};