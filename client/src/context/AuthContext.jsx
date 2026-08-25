import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login state on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Retrieve fresh profile data from DB
          if (parsedUser.role === 'student') {
            const res = await API.get('/students/profile');
            const updated = { ...parsedUser, profile: res.data };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          } else if (parsedUser.role === 'parent') {
            const res = await API.get('/parents/profile');
            const updated = { ...parsedUser, profile: res.data };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          }
        } catch (error) {
          console.error('Session restoration failed:', error.message);
          logout(); // clear invalid credentials
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password, isAdmin = false) => {
    try {
      const url = isAdmin ? '/auth/admin/login' : '/auth/login';
      const res = await API.post(url, { email, password });
      
      const userData = res.data;
      localStorage.setItem('token', userData.token);
      
      const profile = userData.profile || null;
      const userObj = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        profile
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      return { success: true };
    } catch (error) {
      console.error('Login action failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const registerStudent = async (studentData) => {
    try {
      const res = await API.post('/auth/register/student', studentData);
      const userData = res.data;
      localStorage.setItem('token', userData.token);
      
      const userObj = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        profile: userData.studentDetails
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      return { success: true };
    } catch (error) {
      console.error('Student registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Student registration failed.'
      };
    }
  };

  const registerParent = async (parentData) => {
    try {
      const res = await API.post('/auth/register/parent', parentData);
      const userData = res.data;
      localStorage.setItem('token', userData.token);
      
      const userObj = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        profile: userData.parentDetails
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      return { success: true };
    } catch (error) {
      console.error('Parent registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Parent registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerStudent,
        registerParent,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
