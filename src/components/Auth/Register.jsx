import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const steps = ['Basic Information', 'Emergency Contact', 'Address'];

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    phone_number: '',
    full_name: '',
    email: '',
    password: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    home_address: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phone_number: value?.replace(/\+91/, '') || '',
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await register(formData);
    setLoading(false);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
            <TextField
                margin="normal"
                name='phone_number'
                label="Phone Number"
                placeholder="(555) 555-5555"
                type="tel"
                value={formData.phone_number}
                fullWidth
                onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email (Optional)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="PIN (Optional - 4-6 digits)"
              name="password"
              type="password"
              inputProps={{ maxLength: 6, pattern: '\\d*' }}
              value={formData.password}
              onChange={handleChange}
              helperText="Set a 4-6 digit PIN for quick login"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              margin="normal"
              fullWidth
              label="Emergency Contact Name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Emergency Contact Phone"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Relation"
              name="emergency_contact_relation"
              value={formData.emergency_contact_relation}
              onChange={handleChange}
              placeholder="e.g., Spouse, Parent, Friend"
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <TextField
              margin="normal"
              fullWidth
              label="Home Address"
              name="home_address"
              multiline
              rows={3}
              value={formData.home_address}
              onChange={handleChange}
              placeholder="Your home address for faster service"
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ my: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign In
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;