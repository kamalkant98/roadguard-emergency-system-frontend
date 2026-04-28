import api from './api';

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data.data;
};

export const verifyOTP = async (phoneNumber, otpCode) => {
  const response = await api.post('/verify-otp', { 
    phone_number: phoneNumber, 
    otp_code: otpCode 
  });
  return response.data.data;
};

export const resendOTP = async (phoneNumber) => {
  const response = await api.post('/resend-otp', { 
    phone_number: phoneNumber 
  });
  return response.data;
};

export const login = async (phoneNumber, pin) => {
  const response = await api.post('/login', { 
    phone_number: phoneNumber, 
    pin 
  });
  return response.data.data;
};

export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data.data;
};

export const updateLocation = async (latitude, longitude) => {
  const response = await api.put('/users/location', { latitude, longitude });
  return response.data.data;
};