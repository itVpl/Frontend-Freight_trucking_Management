import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper
} from '@mui/material';
import {
  LocationOn,
  CalendarMonth,
  Person,
  Flag,
  Translate,
  Call,
  Email,
  Chat
} from '@mui/icons-material';

const Profile = () => {
  const user = {
    name: 'Steve Rogers',
    role: 'Trucker',
    joinDate: '2nd June 2025',
    location: 'Houston',
    status: 'Active',
    country: 'USA',
    language: 'English',
    phone: '+1 (555) 123-4567',
    email: 'steveroger@gmail.com',
    skype: 'Steve.rog',
    image: '/avatar.png', // use your avatar path
  };

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
          src={user.image}
          alt={user.name}
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
              {user.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} color="gray" mt={0.5}>
              <Typography variant="body2"><Person sx={{ fontSize: 16, mr: 0.5 }} /> {user.role}</Typography>
              <Typography variant="body2"><CalendarMonth sx={{ fontSize: 16, mr: 0.5 }} /> {user.joinDate}</Typography>
              <Typography variant="body2"><LocationOn sx={{ fontSize: 16, mr: 0.5 }} /> {user.location}</Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="green" fontWeight={500}>
            ● {user.status}
          </Typography>
        </Box>
      </Box>

      {/* Info Boxes */}
<Grid container spacing={2} mt={3}>
  {/* About */}
  <Grid item xs={12} md={6}>
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        About
      </Typography>
      <Box display="flex" flexDirection="column" gap={1} sx={{ gridColumn: 'span 2' }}>
        <Typography variant="body2"><Person sx={{ fontSize: 18, mr: 1 }} /> <strong>Full Name:</strong> Steve Rogers</Typography>
        <Typography variant="body2"><Flag sx={{ fontSize: 18, mr: 1 }} /> <strong>Country:</strong> USA</Typography>
        <Typography variant="body2"><Translate sx={{ fontSize: 18, mr: 1 }} /> <strong>Language:</strong> English</Typography>
      </Box>
    </Paper>
  </Grid>

  {/* Contacts */}
  <Grid item xs={12} md={6}>
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Contacts
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="body2"><Call sx={{ fontSize: 18, mr: 1 }} /> <strong>Contact:</strong> +1 (555) 123-4567</Typography>
        <Typography variant="body2"><Email sx={{ fontSize: 18, mr: 1 }} /> <strong>E-mail:</strong> steveroger@gmail.com</Typography>
        <Typography variant="body2"><Chat sx={{ fontSize: 18, mr: 1 }} /> <strong>Skype:</strong> Steve.rog</Typography>
      </Box>
    </Paper>
  </Grid>
</Grid>
    </Box>
  );
};

export default Profile;
