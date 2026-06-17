import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  login as loginService,
  verifyOTP as verifyOTPService,
  register as registerService,
  getProfile as getProfileService,
  resendOTP as resendOTPService,
  updateProfile as updateProfileService,
  updateProfilePicture as updateProfilePictureService,
  updateLocation as updateLocationService,
  changePassword as changePasswordService,
  deleteAccount as deleteAccountService,
  getVehicle as getVehicleService,
  getVehicles as getVehiclesService,
  addVehicle as addVehicleService,
  updateVehicle as updateVehicleService,
  deleteVehicle as deleteVehicleService,
  getNotificationSettings as getNotificationSettingsService,
  updateNotificationSettings as updateNotificationSettingsService
} from "../services/auth";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  // ✅ FIX 1: Load user from localStorage synchronously on mount
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('userRole');
        const storedToken = localStorage.getItem('token');
        
        // console.log("Loading from localStorage:");
        // console.log("storedToken:", storedToken);
        // console.log("storedRole:", storedRole);
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // console.log("✅ Loaded user from storage:", userData);
        }
        
        if (storedRole) {
          setUserRole(storedRole);
          // console.log("✅ Loaded role from storage:", storedRole);
        }
        
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        // console.error("Error loading stored user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredUser();
  }, []); // Empty dependency array - runs only once

  // ✅ FIX 2: Refresh user from API in background (optional)
  const refreshUserProfile = async () => {
    if (!token) return;
    
    try {
      // console.log("Refreshing user profile from API...");
      const userData = await getProfileService();
      let role = userData?.role?.slug || userData?.role;
      
      // console.log("Refreshed role:", role);
      
      setUser(userData);
      setUserRole(role);
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(userData));
      if (role) {
        localStorage.setItem('userRole', role);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      // If API fails, we still have localStorage data
      return false;
    }
  };

  // ✅ FIX 3: Refresh profile in background after mount
  useEffect(() => {
    if (token && !loading) {
      refreshUserProfile();
    }
  }, [token, loading]);

  const login = async (phoneNumber, pin) => {
    try {
      const response = await loginService(phoneNumber, pin);
      const { token: authToken, user: userData } = response;

      console.log("Login response userData:", userData);
      
      // ✅ FIX 4: Extract role correctly (handle both formats)
      let role = userData?.role?.slug || userData?.role;
      
      // Save to localStorage FIRST
      localStorage.setItem("token", authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', role);
      
      // Update state
      setToken(authToken);
      setUser(userData);
      setUserRole(role);
      
      toast.success("Login successful!");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      toast.error(error);
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerService(userData);
      toast.success("Registration successful! Please verify your OTP.");
      navigate("/verify-otp", {
        state: { phone_number: userData.phone_number },
      });
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const verifyOTP = async (phoneNumber, otpCode) => {
    try {
      const response = await verifyOTPService(phoneNumber, otpCode);
      const { token: authToken, user: userData } = response;
      
      // ✅ FIX 5: Extract role after OTP verification
      let role = userData?.role?.slug || userData?.role;

      localStorage.setItem("token", authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', role);
      
      setToken(authToken);
      setUser(userData);
      setUserRole(role);

      toast.success("Phone verified successfully!");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const reSendOTP = async (phoneNumber) => {
    try {
      const response = await resendOTPService(phoneNumber);
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || "Resend failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');

    setToken(null);
    setUser(null);
    setUserRole(null);

    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getProfile = async () => {
    try {
      const userData = await getProfileService();
      let role = userData?.role?.slug || userData?.role;
      
      setUser(userData);
      setUserRole(role);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      if (role) {
        localStorage.setItem('userRole', role);
      }
      
      return { success: true, data: userData };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await updateProfileService(data);
      
      // ✅ FIX 6: Update user in state and localStorage after profile update
      if (response.user) {
        const updatedUser = response.user;
        let role = updatedUser?.role?.slug || updatedUser?.role;
        
        setUser(updatedUser);
        setUserRole(role);
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (role) {
          localStorage.setItem('userRole', role);
        }
      }
      
      toast.success("Profile updated successfully");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateProfilePicture = async (file) => {
    try {
      const response = await updateProfilePictureService(file);
      
      // Update user with new profile picture
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      toast.success("Profile picture updated");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateLocation = async (locationData) => {
    try {
      const response = await updateLocationService(locationData);
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Location update failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await changePasswordService(passwordData);
      toast.success("Password changed successfully");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await deleteAccountService();
      logout(); // Log out after deleting account
      toast.success("Account deleted successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Account deletion failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const getVehicles = async () => {
    try {
      const response = await getVehiclesService();
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch vehicles");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const getVehicle = async (vehicleId) => {
    try {
      const response = await getVehicleService(vehicleId);
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch vehicle");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const addVehicle = async (vehicleData) => {
    try {
      const response = await addVehicleService(vehicleData);
      toast.success("Vehicle added successfully");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add vehicle");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateVehicle = async (vehicleId, vehicleData) => {
    try {
      const response = await updateVehicleService(vehicleId, vehicleData);
      toast.success("Vehicle updated successfully");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update vehicle");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const deleteVehicle = async (vehicleId) => {
    try {
      const response = await deleteVehicleService(vehicleId);
      toast.success("Vehicle deleted successfully");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const getNotificationSettings = async () => {
    try {
      const response = await getNotificationSettingsService();
      return { success: true, data: response };
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateNotificationSettings = async (settings) => {
    try {
      const response = await updateNotificationSettingsService(settings);
      toast.success("Notification settings updated");
      return { success: true, data: response };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    user,
    userRole, // ✅ EXPOSE userRole
    loading,
    token,
    login,
    register,
    verifyOTP,
    logout,
    reSendOTP,
    getProfile,
    updateProfile,
    updateProfilePicture,
    updateLocation,
    changePassword,
    deleteAccount,
    getVehicle,
    getVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getNotificationSettings,
    updateNotificationSettings,
    refreshUserProfile,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};