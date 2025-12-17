import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { BASE_API_URL } from '../../apiConfig';
import { useThemeConfig } from '../../context/ThemeContext';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state for adding/editing vehicles
  const [formData, setFormData] = useState({
    vehicleNo: '',
    chassisNo: '',
    engineNo: '',
    modelYear: '',
    vehicleType: '',
    make: '',
    model: '',
    capacity: '',
    fuelType: '',
  });

  // Vehicle types and fuel types for dropdowns
  const vehicleTypes = ['Dry Van', 'Flatbed', 'Refrigerated', 'Container', 'Tanker', 'Car Carrier', 'Lowboy'];
  const fuelTypes = ['Diesel', 'Gasoline', 'Electric', 'Hybrid', 'CNG', 'LPG'];
  const { themeConfig } = useThemeConfig();

  // API Helper Functions
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const makeAPICall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${BASE_API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load vehicles on component mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await makeAPICall('/api/v1/vehicle/my-vehicles');
      if (response.success) {
        setVehicles(response.vehicles || []);
      } else {
        setError('Failed to load vehicles');
      }
    } catch (err) {
      setError('Error loading vehicles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddVehicle = async () => {
    try {
      const response = await makeAPICall('/api/v1/vehicle/add', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (response.success) {
        setSnackbar({ open: true, message: 'Vehicle added successfully', severity: 'success' });
        setOpenAddDialog(false);
        resetForm();
        loadVehicles();
      } else {
        setSnackbar({ open: true, message: 'Failed to add vehicle', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error adding vehicle: ' + err.message, severity: 'error' });
    }
  };

  const handleEditVehicle = async () => {
    try {
      const response = await makeAPICall(`/api/v1/vehicle/update/${selectedVehicle._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (response.success) {
        setSnackbar({ open: true, message: 'Vehicle updated successfully', severity: 'success' });
        setOpenEditDialog(false);
        resetForm();
        loadVehicles();
      } else {
        setSnackbar({ open: true, message: 'Failed to update vehicle', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating vehicle: ' + err.message, severity: 'error' });
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      const response = await makeAPICall(`/api/v1/vehicle/delete/${vehicleToDelete}`, {
        method: 'DELETE',
      });
      if (response.success) {
        setSnackbar({ open: true, message: 'Vehicle deleted successfully', severity: 'success' });
        setOpenDeleteDialog(false);
        setVehicleToDelete(null);
        loadVehicles();
      } else {
        setSnackbar({ open: true, message: 'Failed to delete vehicle', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error deleting vehicle: ' + err.message, severity: 'error' });
    }
  };

  const openDeleteDialogHandler = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setOpenDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      vehicleNo: '',
      chassisNo: '',
      engineNo: '',
      modelYear: '',
      vehicleType: '',
      make: '',
      model: '',
      capacity: '',
      fuelType: '',
    });
    setSelectedVehicle(null);
  };

  const openEditDialogHandler = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      vehicleNo: vehicle.vehicleNo || '',
      chassisNo: vehicle.chassisNo || '',
      engineNo: vehicle.engineNo || '',
      modelYear: vehicle.modelYear || '',
      vehicleType: vehicle.vehicleType || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      capacity: vehicle.capacity || '',
      fuelType: vehicle.fuelType || '',
    });
    setOpenEditDialog(true);
  };

  const openViewDialogHandler = async (vehicle) => {
    try {
      const response = await makeAPICall(`/api/v1/vehicle/details/${vehicle._id}`);
      if (response.success) {
        setSelectedVehicle(response.vehicle);
        setOpenViewDialog(true);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error loading vehicle details: ' + err.message, severity: 'error' });
    }
  };

  const exportToCSV = () => {
    const headers = ['Vehicle No', 'Chassis No', 'Engine No', 'Model Year', 'Vehicle Type', 'Make', 'Model', 'Capacity', 'Fuel Type', 'Status'];
    const csvRows = [headers.join(',')];

    vehicles.forEach(vehicle => {
      const values = [
        vehicle.vehicleNo,
        vehicle.chassisNo,
        vehicle.engineNo,
        vehicle.modelYear,
        vehicle.vehicleType,
        vehicle.make,
        vehicle.model,
        vehicle.capacity,
        vehicle.fuelType,
        vehicle.status
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fleet_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Fleet Overview
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={exportToCSV}
            disabled={vehicles.length === 0}
            sx={{
              borderRadius: 2,
              fontSize: '0.75rem',
              px: 2,
              py: 0.8,
              fontWeight: 500,
              textTransform: 'none',
              color: '#1976d2',
              borderColor: '#1976d2',
              '&:hover': {
                borderColor: '#0d47a1',
                color: '#0d47a1',
              },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddDialog(true)}
            sx={{
              borderRadius: 2,
              fontSize: '0.75rem',
              px: 2,
              py: 0.8,
              fontWeight: 500,
              textTransform: 'none',
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Add Vehicle
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: (themeConfig?.content?.bgImage ? 'rgba(255,255,255,0.94)' : (themeConfig?.table?.bg || '#fff')), position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
        {themeConfig?.table?.bgImage && (
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${themeConfig.table.bgImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: themeConfig.table?.bgImageOpacity ?? 0,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        )}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: (themeConfig?.table?.headerBg || '#f0f4f8') }}>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Chassis No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Engine No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Model Year</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Make</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No vehicles found. Add your first vehicle to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vehicles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle) => (
                  <TableRow key={vehicle._id} hover sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                    <TableCell>{vehicle.vehicleNo}</TableCell>
                    <TableCell>{vehicle.chassisNo}</TableCell>
                    <TableCell>{vehicle.engineNo}</TableCell>
                    <TableCell>{vehicle.modelYear}</TableCell>
                    <TableCell>{vehicle.vehicleType}</TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.capacity} tons</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: vehicle.status === 'active' ? 'success.main' : 'warning.main',
                          fontWeight: 500,
                        }}
                      >
                        {vehicle.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => openViewDialogHandler(vehicle)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openEditDialogHandler(vehicle)}
                          sx={{ color: 'warning.main' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialogHandler(vehicle._id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        </Box>
        <TablePagination
          component="div"
          count={vehicles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </Paper>

      {/* Add Vehicle Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Vehicle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Vehicle Number"
              value={formData.vehicleNo}
              onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Chassis Number"
              value={formData.chassisNo}
              onChange={(e) => setFormData({ ...formData, chassisNo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Engine Number"
              value={formData.engineNo}
              onChange={(e) => setFormData({ ...formData, engineNo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Model Year"
              type="number"
              value={formData.modelYear}
              onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                label="Vehicle Type"
              >
                {vehicleTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Make"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Capacity (tons)"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                label="Fuel Type"
              >
                {fuelTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} sx={{ color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}>Cancel</Button>
          <Button onClick={handleAddVehicle} variant="contained">
            Add Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Vehicle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Vehicle Number"
              value={formData.vehicleNo}
              onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Chassis Number"
              value={formData.chassisNo}
              onChange={(e) => setFormData({ ...formData, chassisNo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Engine Number"
              value={formData.engineNo}
              onChange={(e) => setFormData({ ...formData, engineNo: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Model Year"
              type="number"
              value={formData.modelYear}
              onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                label="Vehicle Type"
              >
                {vehicleTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Make"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Capacity (tons)"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                label="Fuel Type"
              >
                {fuelTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}>Cancel</Button>
          <Button onClick={handleEditVehicle} variant="contained">
            Update Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Vehicle Details Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Vehicle Details</DialogTitle>
        <DialogContent>
          {selectedVehicle && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Vehicle Number"
                  value={selectedVehicle.vehicleNo}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Chassis Number"
                  value={selectedVehicle.chassisNo}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Engine Number"
                  value={selectedVehicle.engineNo}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Model Year"
                  value={selectedVehicle.modelYear}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Vehicle Type"
                  value={selectedVehicle.vehicleType}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Make"
                  value={selectedVehicle.make}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Model"
                  value={selectedVehicle.model}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Capacity"
                  value={`${selectedVehicle.capacity} tons`}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Fuel Type"
                  value={selectedVehicle.fuelType}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <TextField
                  label="Status"
                  value={selectedVehicle.status}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Box>
              {selectedVehicle.truckerId && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Trucker Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label="Company Name"
                      value={selectedVehicle.truckerId.compName}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField
                      label="MC/DOT Number"
                      value={selectedVehicle.truckerId.mc_dot_no}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField
                      label="Phone Number"
                      value={selectedVehicle.truckerId.phoneNo}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      value={selectedVehicle.truckerId.email}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} sx={{ color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDeleteDialog(false);
              setVehicleToDelete(null);
            }}
            variant="outlined"
            sx={{ borderColor: '#d32f2f', color: '#d32f2f', '&:hover': { borderColor: '#b71c1c', color: '#b71c1c' } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteVehicle} 
            variant="contained" 
            color="error"
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
