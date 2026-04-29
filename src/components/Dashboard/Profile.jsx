import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  Stack,
  useTheme,
  alpha,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  CreditCard as CardIcon,
  History as HistoryIcon,
  VpnKey as VpnKeyIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DirectionsCar as CarIcon,
  Star as StarIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Tab Panel Component
const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// Vehicle Card Component
const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <CarIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {vehicle.vehicle_make} {vehicle.vehicle_model}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vehicle.vehicle_number} • {vehicle.vehicle_year}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip label={vehicle.vehicle_type} size="small" />
                <Chip label={vehicle.fuel_type} size="small" variant="outlined" />
                {vehicle.is_default && (
                  <Chip label="Default" size="small" color="primary" />
                )}
              </Stack>
            </Box>
          </Box>
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(vehicle)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(vehicle.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Add/Edit Vehicle Dialog
const VehicleDialog = ({ open, onClose, vehicle, onSave }) => {
  const {addVehicle } = useAuth();
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    vehicle_type: 'car',
    fuel_type: 'petrol',
    color: '',
    is_default: false,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    } else {
      setFormData({
        vehicle_number: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: new Date().getFullYear(),
        vehicle_type: 'car',
        fuel_type: 'petrol',
        color: '',
        is_default: false,
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Vehicle Number"
            name="vehicle_number"
            value={formData.vehicle_number}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Make"
            name="vehicle_make"
            value={formData.vehicle_make}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Model"
            name="vehicle_model"
            value={formData.vehicle_model}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Year"
            name="vehicle_year"
            type="number"
            value={formData.vehicle_year}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              />
            }
            label="Set as default vehicle"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {vehicle ? 'Update' : 'Add'} Vehicle
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Change Password Dialog
const ChangePasswordDialog = ({ open, onClose }) => {
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwords.current_password, passwords.new_password);
      toast.success('Password changed successfully');
      onClose();
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Current Password"
            name="current_password"
            type={showPassword ? 'text' : 'password'}
            value={passwords.current_password}
            onChange={handleChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            name="new_password"
            type={showPassword ? 'text' : 'password'}
            value={passwords.new_password}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Confirm New Password"
            name="confirm_password"
            type={showPassword ? 'text' : 'password'}
            value={passwords.confirm_password}
            onChange={handleChange}
            fullWidth
            error={passwords.new_password !== passwords.confirm_password && passwords.confirm_password !== ''}
            helperText={
              passwords.new_password !== passwords.confirm_password && passwords.confirm_password !== ''
                ? 'Passwords do not match'
                : ''
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete Account Dialog
const DeleteAccountDialog = ({ open, onClose, onConfirm }) => {
  const [confirmation, setConfirmation] = useState('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          Warning: This action is irreversible! All your data will be permanently deleted.
        </Alert>
        <Typography variant="body2" gutterBottom>
          Please type <strong>DELETE</strong> to confirm:
        </Typography>
        <TextField
          fullWidth
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Type DELETE here"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          disabled={confirmation !== 'DELETE'}
        >
          Permanently Delete Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const { showLoading, hideLoading } = {} // useLoading();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    home_address: '',
    work_address: '',
    home_latitude: null,
    home_longitude: null,
    work_latitude: null,
    work_longitude: null,
  });
  
  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    language: 'en',
    dark_mode: false,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: true,
  });
  
  // Dialogs
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    averageRating: 0,
    memberSince: '',
    totalSpent: 0,
  });

  useEffect(() => {
    loadUserData();
    loadVehicles();
    loadSettings();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getProfile();
      setProfileData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        emergency_contact_name: userData.emergency_contact_name || '',
        emergency_contact_phone: userData.emergency_contact_phone || '',
        emergency_contact_relation: userData.emergency_contact_relation || '',
        home_address: userData.home_address || '',
        work_address: userData.work_address || '',
        home_latitude: userData.home_latitude || null,
        home_longitude: userData.home_longitude || null,
        work_latitude: userData.work_latitude || null,
        work_longitude: userData.work_longitude || null,
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load profile data');
    }
  };

  const loadVehicles = async () => {
    try {
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await getNotificationSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadStats = async () => {
    // Mock stats - replace with actual API call
    setStats({
      totalRequests: 24,
      completedRequests: 22,
      averageRating: 4.7,
      memberSince: '2024-01-15',
      totalSpent: 12500,
    });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      await loadUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (vehicleData) => {
    try {
      await addVehicle(vehicleData);
      toast.success('Vehicle added successfully');
      await loadVehicles();
    } catch (error) {
      toast.error('Failed to add vehicle');
    }
  };

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      await updateVehicle(vehicleData.id, vehicleData);
      toast.success('Vehicle updated successfully');
      await loadVehicles();
    } catch (error) {
      toast.error('Failed to update vehicle');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(vehicleId);
        toast.success('Vehicle deleted successfully');
        await loadVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleSettingChange = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
    // Save to API
    updateNotificationSettings({ [key]: !settings[key] });
  };

  const handleDeleteAccount = async () => {
    showLoading('Deleting account...');
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      hideLoading();
      setDeleteDialogOpen(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profile_picture', file);
      try {
        await updateProfilePicture(formData);
        toast.success('Profile picture updated');
        await loadUserData();
      } catch (error) {
        toast.error('Failed to upload image');
      }
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account details, vehicles, and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, overflow: 'visible', position: 'relative' }}>
            <Box
              sx={{
                position: 'relative',
                height: 120,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: -6 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Change photo">
                    <IconButton
                      component="label"
                      sx={{
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      size="small"
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '2.5rem',
                    border: `4px solid ${theme.palette.background.paper}`,
                  }}
                >
                  {profileData.full_name?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Badge>
            </Box>
            <CardContent sx={{ textAlign: 'center', pt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {profileData.full_name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main">
                  Verified Account
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Member since {stats.memberSince ? format(new Date(stats.memberSince), 'MMMM yyyy') : 'N/A'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{profileData.phone_number}</Typography>
                </Box>
                {profileData.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">{profileData.email}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Card sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Activity Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.totalRequests}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {stats.completedRequests}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.averageRating}
                      </Typography>
                      <StarIcon sx={{ color: 'warning.main' }} />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ₹{stats.totalSpent}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Tabs */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="Personal Info" />
                <Tab label="My Vehicles" />
                <Tab label="Settings" />
                <Tab label="Security" />
              </Tabs>
            </Box>

            {/* Personal Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  {!isEditing ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      variant="outlined"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setIsEditing(false);
                          loadUserData();
                        }}
                        variant="outlined"
                        color="error"
                      >
                        Cancel
                      </Button>
                      <Button
                        startIcon={<SaveIcon />}
                        onClick={handleUpdateProfile}
                        variant="contained"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      name="phone_number"
                      value={profileData.phone_number}
                      disabled
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      fullWidth
                      placeholder="your@email.com"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Home Address"
                      name="home_address"
                      value={profileData.home_address}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Work Address"
                      name="work_address"
                      value={profileData.work_address}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Emergency Contact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Name"
                      name="emergency_contact_name"
                      value={profileData.emergency_contact_name}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Phone"
                      name="emergency_contact_phone"
                      value={profileData.emergency_contact_phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Relationship"
                      name="emergency_contact_relation"
                      value={profileData.emergency_contact_relation}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      fullWidth
                      placeholder="e.g., Spouse, Parent, Sibling, Friend"
                    />
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* My Vehicles Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">My Vehicles</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => {
                      setSelectedVehicle(null);
                      setVehicleDialogOpen(true);
                    }}
                  >
                    Add Vehicle
                  </Button>
                </Box>

                {vehicles.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No vehicles added yet
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setVehicleDialogOpen(true)}
                      sx={{ mt: 2 }}
                    >
                      Add Your First Vehicle
                    </Button>
                  </Box>
                ) : (
                  vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onEdit={(v) => {
                        setSelectedVehicle(v);
                        setVehicleDialogOpen(true);
                      }}
                      onDelete={handleDeleteVehicle}
                    />
                  ))
                )}
              </Box>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Notification Preferences
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Push Notifications"
                      secondary="Receive push notifications for updates"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.push_notifications}
                        onChange={() => handleSettingChange('push_notifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Notifications"
                      secondary="Receive email updates about your requests"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.email_notifications}
                        onChange={() => handleSettingChange('email_notifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="SMS Notifications"
                      secondary="Receive SMS alerts for emergency updates"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.sms_notifications}
                        onChange={() => handleSettingChange('sms_notifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Preferences
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Language"
                      secondary="Select your preferred language"
                    />
                    <ListItemSecondaryAction>
                      <Button variant="outlined" size="small">
                        English
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DarkModeIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Dark Mode"
                      secondary="Switch between light and dark theme"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.dark_mode}
                        onChange={() => handleSettingChange('dark_mode')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Box>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ p: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Keep your account secure with strong password and regular updates.
                </Alert>

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Password & Security
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VpnKeyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Change Password"
                      secondary="Update your password regularly to keep your account secure"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        Change
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LockIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Two-Factor Authentication"
                      secondary="Add an extra layer of security to your account"
                    />
                    <ListItemSecondaryAction>
                      <Button variant="outlined">
                        Setup
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
                  Danger Zone
                </Typography>
                
                <Alert severity="error" sx={{ mb: 2 }}>
                  Once you delete your account, there is no going back. Please be certain.
                </Alert>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </Box>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <VehicleDialog
        open={vehicleDialogOpen}
        onClose={() => {
          setVehicleDialogOpen(false);
          setSelectedVehicle(null);
        }}
        vehicle={selectedVehicle}
        onSave={(data) => {
          if (selectedVehicle) {
            handleUpdateVehicle(data);
          } else {
            handleAddVehicle(data);
          }
        }}
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </Container>
  );
};

export default Profile;