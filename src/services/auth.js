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
  const response = await api.put('/profile', profileData);
  return response.data.data;
};


export const updateProfilePicture = async (formData) => {
  const response = await api.put('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const updateLocation = async (latitude, longitude) => {
  const response = await api.put('/users/location', { latitude, longitude });
  return response.data.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.post('/users/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/users/account');
  return response.data.data;
};

// Vehicles
export const getVehicles = async () => {
  const response = await api.get('/users/vehicles');
  return response.data.data;
};

export const addVehicle = async (vehicleData) => {
  const response = await api.post('/users/vehicles', vehicleData);
  return response.data.data;
};

export const updateVehicle = async (vehicleId, vehicleData) => {
  const response = await api.put(`/users/vehicles/${vehicleId}`, vehicleData);
  return response.data.data;
};

export const deleteVehicle = async (vehicleId) => {
  const response = await api.delete(`/users/vehicles/${vehicleId}`);
  return response.data.data;
};

// Settings
export const getNotificationSettings = async () => {
  const response = await api.get('/users/notification-settings');
  return response.data.data;
};

export const updateNotificationSettings = async (settings) => {
  const response = await api.put('/users/notification-settings', settings);
  return response.data.data;
};