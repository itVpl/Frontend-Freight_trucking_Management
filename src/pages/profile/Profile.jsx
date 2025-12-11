import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider
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
  Assignment,
  CheckCircle,
  Pending,
  Cancel
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
          // Filter data based on current logged-in user's userIddfd
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
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'pending':
        return <Pending sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return <Person sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Verified';
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3
    }}>
      {/* Hero Section */}
      <Card 
        sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          background: 'white'
        }}
      >
        {/* Cover Section */}
        <Box
          sx={{
            height: 200,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Profile Avatar */}
          <Avatar
            src={userData.docUpload || '/avatar.png'}
            alt={userData.compName}
            sx={{
              width: 120,
              height: 120,
              border: '6px solid white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              position: 'absolute',
              bottom: -60
            }}
          />
        </Box>

        {/* Profile Info */}
        <CardContent sx={{ pt: 8, pb: 4 }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" mb={1}>
                {userData.compName || 'Company Name'}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={2}>
                <Chip
                  icon={<Person />}
                  label={userData.userType === 'trucker' ? 'Trucker' : 'Shipper'}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip
                  icon={<CalendarMonth />}
                  label={`Joined ${formatDate(userData.createdAt)}`}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                <Chip
                  icon={<LocationOn />}
                  label={`${userData.city}, ${userData.state}`}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>

            <Chip
              icon={getStatusIcon(userData.status)}
              label={getStatusText(userData.status)}
              sx={{
                background: getStatusColor(userData.status),
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                mt: { xs: 2, sm: 0 }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <Grid container spacing={3}>
        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(102,126,234,0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Card Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 3,
                  borderRadius: '16px 16px 0 0',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Business sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Company Information
                  </Typography>
                </Box>
              </Box>
              
              {/* Card Content */}
              <Box sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Business sx={{ color: '#667eea', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Company Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.compName || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Assignment sx={{ color: '#667eea', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        MC/DOT Number
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.mc_dot_no || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocalShipping sx={{ color: '#667eea', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Carrier Type
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.carrierType || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocalShipping sx={{ color: '#667eea', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Fleet Size
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.fleetsize || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Information */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(240,147,251,0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Card Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  p: 3,
                  borderRadius: '16px 16px 0 0',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <LocationOn sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Location Information
                  </Typography>
                </Box>
              </Box>
              
              {/* Card Content */}
              <Box sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationOn sx={{ color: '#f093fb', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Address
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.compAdd || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Flag sx={{ color: '#f093fb', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Country
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.country || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationOn sx={{ color: '#f093fb', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        State
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.state || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationOn sx={{ color: '#f093fb', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        City
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.city || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationOn sx={{ color: '#f093fb', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Zip Code
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.zipcode || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(79,172,254,0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Card Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  p: 3,
                  borderRadius: '16px 16px 0 0',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Call sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Contact Information
                  </Typography>
                </Box>
              </Box>
              
              {/* Card Content */}
              <Box sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Call sx={{ color: '#4facfe', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.phoneNo || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Email sx={{ color: '#4facfe', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(67,233,123,0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Card Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  p: 3,
                  borderRadius: '16px 16px 0 0',
                  color: 'white'
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Person sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Account Information
                  </Typography>
                </Box>
              </Box>
              
              {/* Card Content */}
              <Box sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Person sx={{ color: '#43e97b', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        User Type
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {userData.userType === 'trucker' ? 'Trucker' : 'Shipper'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <CalendarMonth sx={{ color: '#43e97b', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Account Created
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {formatDate(userData.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <CalendarMonth sx={{ color: '#43e97b', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {formatDate(userData.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Person sx={{ color: '#43e97b', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Account Status
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {getStatusText(userData.status)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
