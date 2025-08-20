import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocationOn,
  CalendarMonth,
  Person,
  Flag,
  Translate,
  Call,
  Email,
  Business,
  LocalShipping,
  Assignment
} from '@mui/icons-material';
import { BASE_API_URL } from '../../apiConfig';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_API_URL}/api/v1/shipper_driver/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          // Filter data based on current logged-in user's userId
          const currentUserData = result.data.find(
            (user) => user.userId === currentUser?.userId
          );
          
          if (currentUserData) {
            setUserData(currentUserData);
          } else {
            throw new Error('User data not found');
          }
        } else {
          throw new Error('No user data found');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.userId) {
      fetchUserData();
    } else {
      setError('No user logged in');
      setLoading(false);
    }
  }, [currentUser?.userId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'orange';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">
          Error loading profile data: {error}
        </Alert>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box p={2}>
        <Alert severity="warning">
          No user data available
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      {/* Cover Photo + Basic Info */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3f51b5, #2196f3)',
          height: 150,
          borderRadius: '8px 8px 0 0',
          position: 'relative',
        }}
      >
        <Avatar
          src={userData.docUpload || '/avatar.png'}
          alt={userData.compName}
          sx={{
            width: 80,
            height: 80,
            position: 'absolute',
            bottom: -40,
            left: 24,
            border: '4px solid white',
          }}
        />
      </Box>

      <Box mt={6} px={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {userData.compName || 'Company Name'}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} color="gray" mt={0.5}>
              <Typography variant="body2">
                <Person sx={{ fontSize: 16, mr: 0.5 }} /> 
                {userData.userType === 'trucker' ? 'Trucker' : 'Shipper'}
              </Typography>
              <Typography variant="body2">
                <CalendarMonth sx={{ fontSize: 16, mr: 0.5 }} /> 
                {formatDate(userData.createdAt)}
              </Typography>
              <Typography variant="body2">
                <LocationOn sx={{ fontSize: 16, mr: 0.5 }} /> 
                {userData.city}, {userData.state}
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="body2" 
            color={getStatusColor(userData.status)} 
            fontWeight={500}
          >
            ● {getStatusText(userData.status)}
          </Typography>
        </Box>
      </Box>

      {/* Info Boxes */}
      <Grid container spacing={2} mt={3}>
        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Company Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">
                <Business sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Company Name:</strong> {userData.compName || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <Assignment sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>MC/DOT Number:</strong> {userData.mc_dot_no || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <LocalShipping sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Carrier Type:</strong> {userData.carrierType || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <LocalShipping sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Fleet Size:</strong> {userData.fleetsize || 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Location Information */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Location Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">
                <LocationOn sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Address:</strong> {userData.compAdd || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <Flag sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Country:</strong> {userData.country || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <LocationOn sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>State:</strong> {userData.state || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <LocationOn sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>City:</strong> {userData.city || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <LocationOn sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Zip Code:</strong> {userData.zipcode || 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Contact Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">
                <Call sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Phone:</strong> {userData.phoneNo || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <Email sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Email:</strong> {userData.email || 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Account Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">
                <Person sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>User Type:</strong> {userData.userType === 'trucker' ? 'Trucker' : 'Shipper'}
              </Typography>
              <Typography variant="body2">
                <CalendarMonth sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Created:</strong> {formatDate(userData.createdAt)}
              </Typography>
              <Typography variant="body2">
                <CalendarMonth sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Last Updated:</strong> {formatDate(userData.updatedAt)}
              </Typography>
              <Typography variant="body2">
                <Person sx={{ fontSize: 18, mr: 1 }} /> 
                <strong>Status:</strong> {getStatusText(userData.status)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
