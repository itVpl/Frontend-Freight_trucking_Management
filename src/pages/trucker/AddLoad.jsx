import { useState, useEffect, useCallback, memo, useMemo } from 'react';
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
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Modal,
  IconButton,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  Clear,
  Close,
  Visibility,
  Edit,
  Delete,
  LocalShipping,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Description,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';

const AddLoad = () => {
  const { user, userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadsData, setLoadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [formData, setFormData] = useState(() => ({
    customerId: '',
    loadType: '',
    vehicleType: 'Dry Van',
    rate: '',
    rateType: 'Flat Rate',
    pickupLocation: '',
    pickupCity: '',
    pickupState: '',
    pickupZip: '',
    deliveryLocation: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    pickupDate: '',
    deliveryDate: '',
    weight: '',
    commodity: '',
    containerNo: '',
    poNumber: '',
    bolNumber: '',
    shipmentNo: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    specialInstructions: '',
  }));

  // Fetch all loads on component mount
  useEffect(() => {
    fetchAllLoads();
  }, []);

  // API Functions
  const fetchAllLoads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/customer-load`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setLoadsData(result.data.loads || []);
      } else {
        throw new Error(result.message || 'Failed to fetch loads');
      }
    } catch (err) {
      console.error('Error fetching loads:', err);
      setError(err.message || 'Failed to fetch loads');
    } finally {
      setLoading(false);
    }
  };

  const addLoad = async (loadData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Transform form data to match API structure
      const apiPayload = {
        customerId: loadData.customerId,
        loadType: loadData.loadType,
        vehicleType: loadData.vehicleType || 'Dry Van',
        rate: parseFloat(loadData.rate),
        rateType: loadData.rateType || 'Flat Rate',
        origins: [{
          addressLine1: loadData.pickupLocation,
          addressLine2: loadData.pickupLocation,
          city: loadData.pickupCity || '',
          state: loadData.pickupState || '',
          zip: loadData.pickupZip || '',
          weight: parseFloat(loadData.weight),
          commodity: loadData.commodity || '',
          pickupDate: loadData.pickupDate ? new Date(loadData.pickupDate).toISOString() : '',
          deliveryDate: loadData.deliveryDate ? new Date(loadData.deliveryDate).toISOString() : ''
        }],
        destinations: [{
          addressLine1: loadData.deliveryLocation,
          addressLine2: loadData.deliveryLocation,
          city: loadData.deliveryCity || '',
          state: loadData.deliveryState || '',
          zip: loadData.deliveryZip || '',
          weight: parseFloat(loadData.weight),
          commodity: loadData.commodity || '',
          deliveryDate: loadData.deliveryDate ? new Date(loadData.deliveryDate).toISOString() : ''
        }],
        containerNo: loadData.containerNo || '',
        poNumber: loadData.poNumber || '',
        bolNumber: loadData.bolNumber || '',
        shipmentNo: loadData.shipmentNo || ''
      };

      const response = await fetch(`${BASE_API_URL}/api/v1/customer-load/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to add load');
      }
    } catch (err) {
      console.error('Error adding load:', err);
      throw err;
    }
  };

  const updateLoad = async (loadId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-loads/${loadId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update load');
      }
    } catch (err) {
      console.error('Error updating load:', err);
      throw err;
    }
  };

  const deleteLoad = async (loadId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-loads/${loadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete load');
      }
    } catch (err) {
      console.error('Error deleting load:', err);
      throw err;
    }
  };

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleAddLoad = useCallback(() => {
    setFormData({
      customerId: '',
      loadType: '',
      vehicleType: 'Dry Van',
      rate: '',
      rateType: 'Flat Rate',
      pickupLocation: '',
      pickupCity: '',
      pickupState: '',
      pickupZip: '',
      deliveryLocation: '',
      deliveryCity: '',
      deliveryState: '',
      deliveryZip: '',
      pickupDate: '',
      deliveryDate: '',
      weight: '',
      commodity: '',
      containerNo: '',
      poNumber: '',
      bolNumber: '',
      shipmentNo: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      specialInstructions: '',
    });
    setAddModalOpen(true);
  }, []);

  const handleEditLoad = useCallback((load) => {
    setFormData({
      customerId: load.customerId || '',
      loadType: load.loadType || '',
      vehicleType: load.vehicleType || 'Dry Van',
      rate: load.rate || '',
      rateType: load.rateType || 'Flat Rate',
      pickupLocation: load.origins?.[0]?.addressLine1 || '',
      pickupCity: load.origins?.[0]?.city || '',
      pickupState: load.origins?.[0]?.state || '',
      pickupZip: load.origins?.[0]?.zip || '',
      deliveryLocation: load.destinations?.[0]?.addressLine1 || '',
      deliveryCity: load.destinations?.[0]?.city || '',
      deliveryState: load.destinations?.[0]?.state || '',
      deliveryZip: load.destinations?.[0]?.zip || '',
      pickupDate: load.origins?.[0]?.pickupDate ? load.origins[0].pickupDate.split('T')[0] : '',
      deliveryDate: load.destinations?.[0]?.deliveryDate ? load.destinations[0].deliveryDate.split('T')[0] : '',
      weight: load.origins?.[0]?.weight || '',
      commodity: load.origins?.[0]?.commodity || '',
      containerNo: load.containerNo || '',
      poNumber: load.poNumber || '',
      bolNumber: load.bolNumber || '',
      shipmentNo: load.shipmentNo || '',
      customerName: load.customerLoadDetails?.customerName || '',
      customerPhone: load.customerLoadDetails?.customerPhone || '',
      customerEmail: load.customerLoadDetails?.customerEmail || '',
      specialInstructions: load.specialInstructions || '',
    });
    setSelectedLoad(load);
    setEditModalOpen(true);
  }, []);

  const handleViewLoad = useCallback((load) => {
    setSelectedLoad(load);
    setViewModalOpen(true);
  }, []);

  const handleDeleteLoad = async (loadId) => {
    if (window.confirm('Are you sure you want to delete this load?')) {
      try {
        setLoading(true);
        await deleteLoad(loadId);
        
        // Refresh the load list
        await fetchAllLoads();
        setSuccess('Load deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete load');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveLoad = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      setLoading(true);
      
      if (editModalOpen) {
        // Update existing load with form data
        await updateLoad(selectedLoad.loadId, formData);
        setSuccess('Load updated successfully');
      } else {
        // Add new load
        await addLoad(formData);
        setSuccess('Load added successfully');
      }
      
      // Refresh the load list
      await fetchAllLoads();
      setAddModalOpen(false);
      setEditModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save load');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Filter loads based on search term - memoized for performance
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return loadsData;
    
    const searchLower = searchTerm.toLowerCase();
    return loadsData.filter(load =>
      load.loadType?.toLowerCase().includes(searchLower) ||
      load.origins?.[0]?.addressLine1?.toLowerCase().includes(searchLower) ||
      load.destinations?.[0]?.addressLine1?.toLowerCase().includes(searchLower) ||
      load.customerLoadDetails?.customerName?.toLowerCase().includes(searchLower) ||
      load.origins?.[0]?.commodity?.toLowerCase().includes(searchLower) ||
      load.containerNo?.toLowerCase().includes(searchLower) ||
      load.poNumber?.toLowerCase().includes(searchLower)
    );
  }, [loadsData, searchTerm]);

  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const loadTypes = [
    'OTR',
    'Local',
    'Regional',
    'Intermodal'
  ];

  if (loading && loadsData.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading loads...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
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
            Add Load
          </Typography>
          <Chip
            label={`${loadsData.length} Load${loadsData.length !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search loads..."
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
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddLoad}
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
            Add Load
          </Button>
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600, width: '120px' }}>Load Type</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Pickup</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Delivery</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '100px' }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '100px' }}>Rate</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '120px' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '100px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData && filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((load) => (
                  <TableRow 
                    key={load._id} 
                    hover 
                    sx={{ 
                      transition: '0.3s', 
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                  >
                    <TableCell sx={{ width: '120px', fontWeight: 600 }}>
                      {load.loadType}
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      {load.origins?.[0]?.addressLine1 || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      {load.destinations?.[0]?.addressLine1 || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      {load.origins?.[0]?.weight || 'N/A'} lbs
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      ${load.rate}
                    </TableCell>
                    <TableCell sx={{ width: '120px' }}>
                      {load.customerLoadDetails?.customerName || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      <Chip
                        label={load.status}
                        size="small"
                        color={load.status === 'Auto-Approved' ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewLoad(load)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.5,
                            textTransform: 'none',
                            minWidth: 'auto'
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditLoad(load)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.5,
                            textTransform: 'none',
                            minWidth: 'auto'
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteLoad(load._id)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1,
                            py: 0.5,
                            textTransform: 'none',
                            minWidth: 'auto',
                            color: 'error.main',
                            borderColor: 'error.main',
                            '&:hover': {
                              backgroundColor: 'error.main',
                              color: 'white'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {loadsData.length === 0 ? 'No loads found. Add your first load!' : 'No loads match your search criteria'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredData ? filteredData.length : 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}
        />
      </Paper>

      {/* Add Load Dialog */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'left', pb: 0 }}>
          <Typography variant="h5" color="primary" fontWeight={700} sx={{ textAlign: 'left' }}>
            Add Load
          </Typography>
          <Divider sx={{ mt: 1, mb: 0.5, width: '100%', borderColor: '#e0e0e0', borderBottomWidth: 2, borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent sx={{ pb: 4, maxHeight: '80vh', overflowY: 'auto', background: '#fff', borderRadius: 0 }}>
          <Box component="form" onSubmit={handleSaveLoad} sx={{ mt: 1, px: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
              {/* Customer Selection */}
              <Grid item xs={12}>
                <TextField 
                  label="Customer ID" 
                  name="customerId" 
                  value={formData.customerId || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  required
                  placeholder="Enter customer ID (e.g., d543f360-53a7-47f6-b37b-1b1d1dde46f6)"
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Load Type | Vehicle Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Load Type</InputLabel>
                  <Select
                    name="loadType"
                    value={formData.loadType || ''}
                    onChange={handleFormInputChange}
                    label="Load Type"
                    sx={{ '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                  >
                    <MenuItem value="OTR">OTR</MenuItem>
                    <MenuItem value="Local">Local</MenuItem>
                    <MenuItem value="Regional">Regional</MenuItem>
                    <MenuItem value="Intermodal">Intermodal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    name="vehicleType"
                    value={formData.vehicleType || ''}
                    onChange={handleFormInputChange}
                    label="Vehicle Type"
                    sx={{ '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                  >
                    <MenuItem value="Dry Van">Dry Van</MenuItem>
                    <MenuItem value="Refrigerated">Refrigerated</MenuItem>
                    <MenuItem value="Flatbed">Flatbed</MenuItem>
                    <MenuItem value="Container">Container</MenuItem>
                    <MenuItem value="Tanker">Tanker</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Rate | Rate Type */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Rate ($)" 
                  name="rate" 
                  type="number"
                  value={formData.rate || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  required
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rate Type</InputLabel>
                  <Select
                    name="rateType"
                    value={formData.rateType || ''}
                    onChange={handleFormInputChange}
                    label="Rate Type"
                    sx={{ '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                  >
                    <MenuItem value="Flat Rate">Flat Rate</MenuItem>
                    <MenuItem value="Per Mile">Per Mile</MenuItem>
                    <MenuItem value="Per Hour">Per Hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Pickup Address */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>Pickup Location</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Address Line 1" 
                  name="pickupLocation" 
                  value={formData.pickupLocation || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  required
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="City" 
                  name="pickupCity" 
                  value={formData.pickupCity || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="State" 
                  name="pickupState" 
                  value={formData.pickupState || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="ZIP Code" 
                  name="pickupZip" 
                  value={formData.pickupZip || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Pickup Date" 
                  name="pickupDate" 
                  type="datetime-local"
                  value={formData.pickupDate || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Delivery Address */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>Delivery Location</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Address Line 1" 
                  name="deliveryLocation" 
                  value={formData.deliveryLocation || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  required
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="City" 
                  name="deliveryCity" 
                  value={formData.deliveryCity || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="State" 
                  name="deliveryState" 
                  value={formData.deliveryState || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="ZIP Code" 
                  name="deliveryZip" 
                  value={formData.deliveryZip || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Delivery Date" 
                  name="deliveryDate" 
                  type="datetime-local"
                  value={formData.deliveryDate || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Weight | Commodity */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Weight (lbs)" 
                  name="weight" 
                  type="number"
                  value={formData.weight || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  required
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Commodity" 
                  name="commodity" 
                  value={formData.commodity || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Document Numbers */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>Document Numbers</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Container Number" 
                  name="containerNo" 
                  value={formData.containerNo || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="PO Number" 
                  name="poNumber" 
                  value={formData.poNumber || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="BOL Number" 
                  name="bolNumber" 
                  value={formData.bolNumber || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Shipment Number" 
                  name="shipmentNo" 
                  value={formData.shipmentNo || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>Customer Information</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Customer Name" 
                  name="customerName" 
                  value={formData.customerName || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Customer Phone" 
                  name="customerPhone" 
                  value={formData.customerPhone || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="Customer Email" 
                  name="customerEmail" 
                  type="email"
                  value={formData.customerEmail || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Special Instructions */}
              <Grid item xs={12}>
                <TextField 
                  label="Special Instructions" 
                  name="specialInstructions" 
                  multiline
                  rows={3}
                  value={formData.specialInstructions || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  placeholder="Any special handling requirements, delivery instructions, etc."
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            startIcon={<Cancel />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLoad}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
            }}
          >
            {loading ? 'Adding...' : 'Add Load'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Load Dialog */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'left', pb: 0 }}>
          <Typography variant="h5" color="primary" fontWeight={700} sx={{ textAlign: 'left' }}>
            Load Details
          </Typography>
          <Divider sx={{ mt: 1, mb: 0.5, width: '100%', borderColor: '#e0e0e0', borderBottomWidth: 2, borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent sx={{ pb: 4, background: '#fff', borderRadius: 0 }}>
          {selectedLoad && (
            <Box sx={{ mt: 1, px: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Load Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedLoad.loadType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Vehicle Type
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedLoad.vehicleType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Weight
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedLoad.origins?.[0]?.weight || 'N/A'} lbs
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Rate
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ${selectedLoad.rate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Pickup Location
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedLoad.origins?.[0]?.addressLine1 || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Delivery Location
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedLoad.destinations?.[0]?.addressLine1 || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Customer Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedLoad.customerLoadDetails?.customerName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedLoad.status}
                  </Typography>
                </Grid>
                {selectedLoad.containerNo && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Container Number
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedLoad.containerNo}
                    </Typography>
                  </Grid>
                )}
                {selectedLoad.poNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      PO Number
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedLoad.poNumber}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setViewModalOpen(false)}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddLoad;