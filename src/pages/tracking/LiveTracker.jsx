import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  LocationOn,
  LocalShipping,
  Schedule,
  CheckCircle,
  Warning,
  Search,
  DirectionsCar,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const LiveTracker = () => {
  const { userType } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [trackingData, setTrackingData] = useState([]);

  useEffect(() => {
    // Mock tracking data
    const mockData = userType === 'trucker' 
      ? [
          {
            id: 1,
            vehicleNumber: 'MH-12-AB-1234',
            driver: 'Rajesh Kumar',
            route: 'Mumbai → Delhi',
            status: 'in-transit',
            progress: 65,
            eta: '4 hours',
            currentLocation: 'Agra, UP',
            lastUpdate: '2 minutes ago',
            cargo: 'Electronics',
            distance: '1,400 km',
          },
          {
            id: 2,
            vehicleNumber: 'DL-01-CD-5678',
            driver: 'Amit Singh',
            route: 'Delhi → Bangalore',
            status: 'completed',
            progress: 100,
            eta: 'Delivered',
            currentLocation: 'Bangalore, KA',
            lastUpdate: '1 hour ago',
            cargo: 'Textiles',
            distance: '2,100 km',
          },
          {
            id: 3,
            vehicleNumber: 'KA-05-EF-9012',
            driver: 'Suresh Patel',
            route: 'Bangalore → Chennai',
            status: 'delayed',
            progress: 30,
            eta: '8 hours',
            currentLocation: 'Salem, TN',
            lastUpdate: '5 minutes ago',
            cargo: 'Machinery',
            distance: '350 km',
          },
        ]
      : [
          {
            id: 1,
            shipmentId: 'SH-001',
            carrier: 'ABC Trucking',
            route: 'Mumbai → Delhi',
            status: 'in-transit',
            progress: 65,
            eta: '4 hours',
            currentLocation: 'Agra, UP',
            lastUpdate: '2 minutes ago',
            cargo: 'Electronics',
            value: '₹25,000',
          },
          {
            id: 2,
            shipmentId: 'SH-002',
            carrier: 'XYZ Transport',
            route: 'Delhi → Bangalore',
            status: 'completed',
            progress: 100,
            eta: 'Delivered',
            currentLocation: 'Bangalore, KA',
            lastUpdate: '1 hour ago',
            cargo: 'Textiles',
            value: '₹18,000',
          },
          {
            id: 3,
            shipmentId: 'SH-003',
            carrier: 'PQR Logistics',
            route: 'Bangalore → Chennai',
            status: 'delayed',
            progress: 30,
            eta: '8 hours',
            currentLocation: 'Salem, TN',
            lastUpdate: '5 minutes ago',
            cargo: 'Machinery',
            value: '₹32,000',
          },
        ];

    setTrackingData(mockData);
  }, [userType]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-transit':
        return 'primary';
      case 'delayed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in-transit':
        return <Schedule color="primary" />;
      case 'delayed':
        return <Warning color="error" />;
      default:
        return <LocationOn />;
    }
  };

  const filteredData = trackingData.filter(item =>
    item.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userType === 'trucker' ? item.vehicleNumber : item.shipmentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Live Tracker
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder={`Search by ${userType === 'trucker' ? 'vehicle number' : 'shipment ID'} or route...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredData.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    {userType === 'trucker' ? item.vehicleNumber : item.shipmentId}
                  </Typography>
                  <Chip
                    label={item.status.replace('-', ' ').toUpperCase()}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DirectionsCar sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {item.route}
                  </Typography>
                </Box>

                {userType === 'trucker' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Driver: {item.driver}
                  </Typography>
                )}

                {userType === 'shipper' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Carrier: {item.carrier}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Cargo: {item.cargo}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.progress}%
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  sx={{ mb: 2 }}
                />

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LocationOn color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Current Location"
                      secondary={item.currentLocation}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Schedule color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="ETA"
                      secondary={item.eta}
                    />
                  </ListItem>

                  {userType === 'trucker' && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocalShipping color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Distance"
                        secondary={item.distance}
                      />
                    </ListItem>
                  )}

                  {userType === 'shipper' && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocalShipping color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Value"
                        secondary={item.value}
                      />
                    </ListItem>
                  )}
                </List>

                <Typography variant="caption" color="text.secondary">
                  Last updated: {item.lastUpdate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredData.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No tracking data found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default LiveTracker; 