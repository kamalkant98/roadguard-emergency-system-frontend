import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom"; // Add this import
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(5);
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, reSendOTP } = useAuth();
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // For redirecting if no phone number

  const phoneNumber =
    location.state?.phone_number || location.state?.phoneNumber;

  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    const digits = pastedData.replace(/\D/g, "").split("");
    if (digits.length === 6) {
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        newOtp[idx] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    console.log("phone number ==", phoneNumber);

    if (otpValue.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }
    setLoading(true);

    // setLoading(true);
    setError("");

    try {
     let response = await verifyOTP(phoneNumber, otpValue);
      if (data.success) {
        setSuccess("OTP verified successfully! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (err) {
      console.log("err", err);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    console.log("phone number ==", phoneNumber);
    setLoading(true);
    try {
      let response = await reSendOTP(phoneNumber);
      if (response?.statusCode === 200) {
        setSuccess(response?.message);
        setTimer(5);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
        setLoading(false);
      } else {
        setError("Something went wrong. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="bold"
          >
            Verify OTP
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            sx={{ mb: 4 }}
          >
            Enter the 6-digit code sent to your phone number
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 4 }}
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <TextField
                key={index}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputRef={(el) => (inputRefs.current[index] = el)}
                variant="outlined"
                size="small"
                error={!!error}
                disabled={loading}
                sx={{
                  width: "60px",
                  "& input": { textAlign: "center", fontSize: "24px", py: 1.5 },
                }}
              />
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
          </Button>

          <Stack direction="row" justifyContent="center" spacing={1}>
            <Typography variant="body2" color="textSecondary">
              Didn't receive the code?
            </Typography>
            {canResend ? (
              <Button
                variant="text"
                size="small"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
              </Button>
            ) : (
              <Typography variant="body2" color="primary">
                Resend in {timer}s
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyOTP;
