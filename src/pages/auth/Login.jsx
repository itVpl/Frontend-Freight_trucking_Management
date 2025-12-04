import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import alertify from 'alertifyjs';
import axios from 'axios';
import videoBg from "../../assets/BackgroundVideo.mp4";

import { BASE_API_URL } from '../../apiConfig';

const Login = () => {
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
    keepSignedIn: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    emailId: false,
    password: false,
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
    if (error) setError('');
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  const isFieldValid = (fieldName) => {
    if (!touched[fieldName]) return true;
    return String(formData[fieldName]).trim() !== '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { emailId, password } = formData;

    setTouched({ emailId: true, password: true });

    if (!emailId || !password) {
      alertify.error('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_API_URL}/api/v1/shipper_driver/login`,
        { email: emailId, password },
        { withCredentials: true } // ✅ move to config
      );

      const data = response.data;
      if (data.success) {
        const user = { ...data.user, type: data.user.userType };
        if (data.user.token) localStorage.setItem('token', data.user.token);
        login(user);
        alertify.success('Login successful! Welcome back.');
        navigate('/dashboard');
      } else {
        alertify.error(data.message || 'Login failed');
      }
    } catch (err) {
      alertify.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background Video */}
      <Box
        component="video"
        src={videoBg}
        autoPlay
        muted
        loop
        playsInline
        // poster optional fallback image: poster="/images/login_poster.jpg"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          filter: 'blur(2px)',
        }}
      />

      {/* Dark overlay for readability */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.6)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '92%', sm: '82%' },
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'saturate(180%) blur(6px)',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <img
              src="/images/logo_vpower.png"
              alt="V Power LOGISTICS"
              style={{ height: '60px', marginBottom: 8 }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                textAlign: 'center',
              }}
            >
              {/* keep blank if you don’t want text under logo */}
            </Typography>
          </Box>

          {error && (
            <Typography
              variant="body2"
              color="error"
              sx={{
                width: '100%',
                mb: 2,
                textAlign: 'center',
                backgroundColor: '#ffebee',
                p: 1,
                borderRadius: 1,
              }}
            >
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '90%' }} noValidate>
            {/* Email */}
            <TextField
              variant="standard"
              margin="normal"
              fullWidth
              id="emailId"
              name="emailId"
              placeholder="Email"
              autoComplete="username"
              autoFocus
              value={formData.emailId}
              onChange={handleChange}
              onBlur={() => handleBlur('emailId')}
              error={!isFieldValid('emailId')}
              InputProps={{ disableUnderline: false }}
              sx={{
                '& .MuiInputBase-root': { color: '#333' },
                '& .MuiInput-underline:before': {
                  borderBottom: !isFieldValid('emailId') ? '1.5px solid #d32f2f' : '1.5px solid #ccc',
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottom: !isFieldValid('emailId') ? '2px solid #d32f2f' : '2px solid #1976d2',
                },
                '& .MuiInput-underline:after': {
                  borderBottom: !isFieldValid('emailId') ? '2px solid #d32f2f' : '2px solid #1976d2',
                },
              }}
            />

            {/* Password */}
            <TextField
              variant="standard"
              margin="normal"
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              error={!isFieldValid('password')}
              InputProps={{
                disableUnderline: false,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': { color: '#333' },
                '& .MuiInput-underline:before': {
                  borderBottom: !isFieldValid('password') ? '1.5px solid #d32f2f' : '1.5px solid #ccc',
                },
                '& .MuiInput-underline:hover:before': {
                  borderBottom: !isFieldValid('password') ? '2px solid #d32f2f' : '2px solid #1976d2',
                },
                '& .MuiInput-underline:after': {
                  borderBottom: !isFieldValid('password') ? '2px solid #d32f2f' : '2px solid #1976d2',
                },
              }}
            />

            {/* Keep me signed in / Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="keepSignedIn"
                    checked={formData.keepSignedIn}
                    onChange={handleChange}
                    sx={{ color: '#1976d2', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label="Keep me signed in"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 14, color: '#666' } }}
              />
              {/* <Link
                href="#"
                variant="body2"
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: 14,
                  '&:hover': { textDecoration: 'underline' },
                }}
                // onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </Link> */}
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                backgroundColor: '#1976d2',
                borderRadius: 2,
                fontSize: 16,
                fontWeight: 600,
                textTransform: 'none',
                height: 40,
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              Log In
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
