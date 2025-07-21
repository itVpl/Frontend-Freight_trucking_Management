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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Assignment,
  LocationOn,
  AttachMoney,
  Schedule,
  Add,
  Edit,
  Delete,
  LocalShipping,
  Person,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

const Loadboard = () => {
  const [loads, setLoads] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    origin: '',
    destination: '',
    weight: '',
    cargoType: '',
    rate: '',
    pickupDate: '',
    deliveryDate: '',
    specialRequirements: '',
    status: 'active',
  });

  useEffect(() => {
    // Mock loads data
    setLoads([
      {
        id: 1,
        title: 'Electronics - Mumbai to Delhi',
        origin: 'Mumbai, MH',
        destination: 'Delhi, DL',
        weight: '5 tons',
        cargoType: 'Electronics',
        rate: '₹25,000',
        pickupDate: '2024-03-20',
        deliveryDate: '2024-03-22',
        specialRequirements: 'Fragile items, temperature controlled',
        status: 'active',
        bids: 8,
        postedDate: '2024-03-18',
        shipper: 'XYZ Electronics',
      },
      {
        id: 2,
        title: 'Textiles - Delhi to Bangalore',
        origin: 'Delhi, DL',
        destination: 'Bangalore, KA',
        weight: '3 tons',
        cargoType: 'Textiles',
        rate: '₹18,000',
        pickupDate: '2024-03-21',
        deliveryDate: '2024-03-24',
        specialRequirements: 'Dry goods only',
        status: 'awarded',
        bids: 12,
        postedDate: '2024-03-17',
        shipper: 'ABC Textiles',
        awardedTo: 'ABC Trucking',
      },
      {
        id: 3,
        title: 'Machinery - Bangalore to Chennai',
        origin: 'Bangalore, KA',
        destination: 'Chennai, TN',
        weight: '8 tons',
        cargoType: 'Heavy Machinery',
        rate: '₹32,000',
        pickupDate: '2024-03-22',
        deliveryDate: '2024-03-23',
        specialRequirements: 'Heavy lift equipment required',
        status: 'expired',
        bids: 5,
        postedDate: '2024-03-15',
        shipper: 'PQR Industries',
      },
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'awarded':
        return 'primary';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle color="success" />;
      case 'awarded':
        return <LocalShipping color="primary" />;
      case 'expired':
        return <Warning color="error" />;
      default:
        return <Assignment />;
    }
  };

  const handleAddLoad = () => {
    setSelectedLoad(null);
    setFormData({
      title: '',
      origin: '',
      destination: '',
      weight: '',
      cargoType: '',
      rate: '',
      pickupDate: '',
      deliveryDate: '',
      specialRequirements: '',
      status: 'active',
    });
    setOpenDialog(true);
  };

  const handleEditLoad = (load) => {
    setSelectedLoad(load);
    setFormData({
      title: load.title,
      origin: load.origin,
      destination: load.destination,
      weight: load.weight,
      cargoType: load.cargoType,
      rate: load.rate,
      pickupDate: load.pickupDate,
      deliveryDate: load.deliveryDate,
      specialRequirements: load.specialRequirements,
      status: load.status,
    });
    setOpenDialog(true);
  };

  const handleDeleteLoad = (loadId) => {
    setLoads(loads.filter(load => load.id !== loadId));
  };

  const handleSave = () => {
    if (selectedLoad) {
      // Edit existing load
      setLoads(loads.map(l => 
        l.id === selectedLoad.id ? { ...l, ...formData } : l
      ));
    } else {
      // Add new load
      const newLoad = {
        id: Date.now(),
        ...formData,
        bids: 0,
        postedDate: new Date().toISOString().split('T')[0],
        shipper: 'Your Company',
      };
      setLoads([...loads, newLoad]);
    }
    setOpenDialog(false);
  };

  const filteredLoads = loads.filter(load => {
    if (tabValue === 0) return load.status === 'active';
    if (tabValue === 1) return load.status === 'awarded';
    if (tabValue === 2) return load.status === 'expired';
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Loadboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddLoad}
        >
          Post New Load
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Active Loads" />
          <Tab label="Awarded" />
          <Tab label="Expired" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredLoads.map((load) => (
          <Grid item xs={12} md={6} lg={4} key={load.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ flex: 1 }}>
                    {load.title}
                  </Typography>
                  <Box>
                    <Chip
                      label={load.status.toUpperCase()}
                      color={getStatusColor(load.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Tooltip title="Edit Load">
                      <IconButton size="small" onClick={() => handleEditLoad(load)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Load">
                      <IconButton size="small" onClick={() => handleDeleteLoad(load.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {load.cargoType} • {load.weight}
                </Typography>

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LocationOn color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Route"
                      secondary={`${load.origin} → ${load.destination}`}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AttachMoney color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Rate"
                      secondary={load.rate}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Schedule color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pickup Date"
                      secondary={load.pickupDate}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Person color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bids Received"
                      secondary={`${load.bids} bids`}
                    />
                  </ListItem>

                  {load.awardedTo && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocalShipping color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Awarded To"
                        secondary={load.awardedTo}
                      />
                    </ListItem>
                  )}

                  {load.specialRequirements && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Assignment color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Special Requirements"
                        secondary={load.specialRequirements}
                      />
                    </ListItem>
                  )}
                </List>

                <Typography variant="caption" color="text.secondary">
                  Posted: {load.postedDate}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredLoads.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No loads found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 && 'No active loads. Post a new load to get started.'}
            {tabValue === 1 && 'No awarded loads yet.'}
            {tabValue === 2 && 'No expired loads.'}
          </Typography>
        </Paper>
      )}

      {/* Add/Edit Load Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLoad ? 'Edit Load' : 'Post New Load'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Load Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cargo Type"
                value={formData.cargoType}
                onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rate"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="awarded">Awarded</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Pickup Date"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Delivery Date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Requirements"
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedLoad ? 'Update' : 'Post Load'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Loadboard; 