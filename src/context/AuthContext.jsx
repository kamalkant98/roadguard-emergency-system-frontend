
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, verifyOTP as verifyOTPService, register as registerService, getProfile , resendOTP } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber, pin) => {
    try {
      const response = await loginService(phoneNumber, pin);
      const { token: authToken, user: userData } = response;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      toast.success('Login successful!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerService(userData);
      toast.success('Registration successful! Please verify your OTP.');
      navigate('/verify-otp', { state: { phone_number: userData.phone_number } });
      return { success: true, data: response };
    } catch (error) {
        console.log("===========",error.response?.data);
        
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const verifyOTP = async (phoneNumber, otpCode) => {
    try {
      const response = await verifyOTPService(phoneNumber, otpCode);
      const { token: authToken, user: userData } = response;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      toast.success('Phone verified successfully!');
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const reSendOTP = async (phoneNumber)=> {
    try {
        const response = await resendOTP(phoneNumber);
        return response;
    } catch (error) {
        toast.error(error.response?.data?.message || 'Resend failed');
        return { success: false, error: error.response?.data?.message };
    }
  }

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    reSendOTP,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};