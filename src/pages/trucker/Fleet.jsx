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
  Skeleton,
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
  Chip,
  InputAdornment,
  Grid,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Visibility, 
  Search,
  Close,
  LocalShipping,
  DirectionsCar,
  Build,
  CalendarToday
} from '@mui/icons-material';
import { BASE_API_URL } from '../../apiConfig';
// just for github
const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
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

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.vehicleNo?.toLowerCase().includes(searchLower) ||
      vehicle.chassisNo?.toLowerCase().includes(searchLower) ||
      vehicle.engineNo?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleType?.toLowerCase().includes(searchLower) ||
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
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
      setViewLoading(true);
      setOpenViewDialog(true);
      const response = await makeAPICall(`/api/v1/vehicle/details/${vehicle._id}`);
      if (response.success) {
        setSelectedVehicle(response.vehicle);
      } else {
        setSnackbar({ open: true, message: 'Failed to load vehicle details', severity: 'error' });
        setOpenViewDialog(false);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error loading vehicle details: ' + err.message, severity: 'error' });
      setOpenViewDialog(false);
    } finally {
      setViewLoading(false);
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

  // Fleet Skeleton Loading Component
  const FleetSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((col) => (
                <TableCell key={col}>
                  <Skeleton variant="text" width={100} height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={80} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={70} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination Skeleton */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={200} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={100} />
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  if (loading) {
    return <FleetSkeleton />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Fleet Overview
          </Typography>
          <Chip
            label={`${vehicles.length} Vehicle${vehicles.length !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: '0.85rem',
                px: 1,
              },
            }}
          />
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
              backgroundColor: '#1976d2',
              color: 'white',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#0d47a1',
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

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
              }}
            >
              {[
                'Vehicle No',
                'Chassis No',
                'Engine No',
                'Model Year',
                'Vehicle Type',
                'Make',
                'Model',
                'Capacity',
                'Status',
                'Actions',
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 700,
                    color: '#374151',
                    fontSize: '0.95rem',
                    py: 1.5,
                    borderBottom: '2px solid #e2e8f0',
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={80} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={70} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <LocalShipping sx={{ fontSize: 48, color: '#cbd5e1' }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                      No vehicles found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vehicles.length === 0 
                        ? 'Add your first vehicle to get started!' 
                        : 'Try adjusting your search criteria'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((vehicle) => (
                  <TableRow 
                    key={vehicle._id} 
                    hover 
                    sx={{ 
                      transition: 'all 0.25s ease',
                      borderBottom: '1px solid #f1f5f9',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShipping sx={{ fontSize: 18, color: '#64748b' }} />
                        <Typography sx={{ fontWeight: 700 }}>{vehicle.vehicleNo}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', py: 2 }}>
                      <Typography variant="body2">{vehicle.chassisNo}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', py: 2 }}>
                      <Typography variant="body2">{vehicle.engineNo}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: '#94a3b8' }} />
                        <Typography variant="body2">{vehicle.modelYear}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={vehicle.vehicleType}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 26,
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          border: '1px solid #c7d2fe',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#475569', py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {vehicle.make}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {vehicle.model}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {vehicle.capacity} tons
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        size="small"
                        color={vehicle.status === 'active' ? 'success' : 'warning'}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 26,
                          ...(vehicle.status === 'active' && {
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                          }),
                          ...(vehicle.status !== 'active' && {
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a',
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => openViewDialogHandler(vehicle)}
                          sx={{
                            fontSize: '0.7rem',
                            px: 1.5,
                            py: 0.5,
                            textTransform: 'none',
                            color: '#2563eb',
                            borderColor: '#bfdbfe',
                            backgroundColor: '#eff6ff',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              borderColor: '#2563eb',
                            },
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => openEditDialogHandler(vehicle)}
                          sx={{
                            fontSize: '0.7rem',
                            px: 1.5,
                            py: 0.5,
                            textTransform: 'none',
                            color: '#0284c7',
                            borderColor: '#bae6fd',
                            backgroundColor: '#f0f9ff',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: '#0284c7',
                              color: '#fff',
                              borderColor: '#0284c7',
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => openDeleteDialogHandler(vehicle._id)}
                          sx={{
                            fontSize: '0.7rem',
                            px: 1.5,
                            py: 0.5,
                            textTransform: 'none',
                            color: '#dc2626',
                            borderColor: '#fecaca',
                            backgroundColor: '#fef2f2',
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: '#dc2626',
                              color: '#fff',
                              borderColor: '#dc2626',
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredVehicles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
          sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}
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
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
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
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditVehicle} variant="contained">
            Update Vehicle
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Vehicle Details Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(to right, #1976d2, #1565c0)',
          color: '#fff',
          py: 3,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalShipping sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                Vehicle Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                Complete vehicle information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setOpenViewDialog(false)}
            sx={{ color: '#fff' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
          {viewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={50} />
                <Typography variant="body1" color="text.secondary">
                  Loading vehicle details...
                </Typography>
              </Box>
            </Box>
          ) : selectedVehicle ? (
            <Box sx={{ p: 3 }}>
              {/* Vehicle Information Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <DirectionsCar sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Vehicle Information
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Vehicle Number</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.vehicleNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Chassis Number</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.chassisNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Engine Number</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.engineNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Model Year</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.modelYear}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Vehicle Type</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.vehicleType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Make</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.make}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Model</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Capacity</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.capacity} tons</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Fuel Type</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.fuelType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>Status</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>
                        <Chip
                          label={selectedVehicle.status}
                          size="small"
                          color={selectedVehicle.status === 'active' ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Trucker Information Section */}
              {selectedVehicle.truckerId && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Build sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Trucker Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Company Name</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.truckerId.compName || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>MC/DOT Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.truckerId.mc_dot_no || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Phone Number</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedVehicle.truckerId.phoneNo || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>Email</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>{selectedVehicle.truckerId.email || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Typography>No vehicle details available</Typography>
            </Box>
          )}
        </DialogContent>
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