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
  const [loadType, setLoadType] = useState('OTR');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [formData, setFormData] = useState(() => ({
    customerId: '',
    loadType: 'OTR',
    vehicleType: 'Dry Van',
    rate: '',
    rateType: 'Flat Rate',
    lineHaul: '',
    fsc: '',
    other: '',
    total: '',
    bidDeadline: '',
    // DRAYAGE single fields
    fromAddress: '',
    fromCity: '',
    fromState: '',
    toAddress: '',
    toCity: '',
    toState: '',
    // Common single pickup/delivery (backward compat)
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
    // OTR arrays (preferred)
    origins: [{
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      weight: '',
      commodity: '',
      pickupDate: '',
      deliveryDate: ''
    }],
    destinations: [{
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      weight: '',
      commodity: '',
      deliveryDate: ''
    }],
    // Common
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
    returnDate: '',
    returnLocation: ''
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
      const hasArrays = Array.isArray(loadData.origins) && loadData.origins.length > 0 && Array.isArray(loadData.destinations) && loadData.destinations.length > 0;
      const fallbackOrigin = {
          addressLine1: loadData.pickupLocation,
          addressLine2: loadData.pickupLocation,
          city: loadData.pickupCity || '',
          state: loadData.pickupState || '',
          zip: loadData.pickupZip || '',
        weight: loadData.weight ? parseFloat(loadData.weight) : undefined,
          commodity: loadData.commodity || '',
          pickupDate: loadData.pickupDate ? new Date(loadData.pickupDate).toISOString() : '',
          deliveryDate: loadData.deliveryDate ? new Date(loadData.deliveryDate).toISOString() : ''
      };
      const fallbackDestination = {
          addressLine1: loadData.deliveryLocation,
          addressLine2: loadData.deliveryLocation,
          city: loadData.deliveryCity || '',
          state: loadData.deliveryState || '',
          zip: loadData.deliveryZip || '',
        weight: loadData.weight ? parseFloat(loadData.weight) : undefined,
          commodity: loadData.commodity || '',
          deliveryDate: loadData.deliveryDate ? new Date(loadData.deliveryDate).toISOString() : ''
      };

      const computedTotal =
        (loadData.total && parseFloat(loadData.total)) ||
        ((loadData.lineHaul ? parseFloat(loadData.lineHaul) : 0) + (loadData.fsc ? parseFloat(loadData.fsc) : 0) + (loadData.other ? parseFloat(loadData.other) : 0)) ||
        (loadData.rate ? parseFloat(loadData.rate) : 0);

      const apiPayload = {
        ...(loadData.customerId ? { customerId: loadData.customerId } : {}),
        loadType: loadData.loadType,
        vehicleType: loadData.vehicleType || 'Dry Van',
        rate: computedTotal,
        rateType: loadData.rateType || 'Flat Rate',
        origins: hasArrays ? loadData.origins.map(o => ({
          addressLine1: o.addressLine1 || '',
          addressLine2: o.addressLine2 || '',
          city: o.city || '',
          state: o.state || '',
          zip: o.zip || '',
          weight: o.weight ? parseFloat(o.weight) : undefined,
          commodity: o.commodity || '',
          pickupDate: o.pickupDate ? new Date(o.pickupDate).toISOString() : '',
          deliveryDate: o.deliveryDate ? new Date(o.deliveryDate).toISOString() : ''
        })) : [fallbackOrigin],
        destinations: hasArrays ? loadData.destinations.map(d => ({
          addressLine1: d.addressLine1 || '',
          addressLine2: d.addressLine2 || '',
          city: d.city || '',
          state: d.state || '',
          zip: d.zip || '',
          weight: d.weight ? parseFloat(d.weight) : undefined,
          commodity: d.commodity || '',
          deliveryDate: d.deliveryDate ? new Date(d.deliveryDate).toISOString() : ''
        })) : [fallbackDestination],
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
    setLoadType('OTR');
    setFormData({
      customerId: '',
      loadType: 'OTR',
      vehicleType: 'Dry Van',
      rate: '',
      rateType: 'Flat Rate',
      bidDeadline: '',
      fromAddress: '',
      fromCity: '',
      fromState: '',
      toAddress: '',
      toCity: '',
      toState: '',
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
      origins: [{
        addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', pickupDate: '', deliveryDate: ''
      }],
      destinations: [{
        addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', deliveryDate: ''
      }],
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
      returnDate: '',
      returnLocation: ''
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

      {/* Add Load Dialog - Styled like Shipper Loadboard */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Add New Load</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={loadType === 'OTR' ? 'contained' : 'outlined'}
                onClick={() => { setLoadType('OTR'); setFormData(prev => ({ ...prev, loadType: 'OTR' })); }}
                sx={{ borderRadius: 5, minWidth: 88 }}
              >
                OTR
              </Button>
              <Button
                variant={loadType === 'DRAYAGE' ? 'contained' : 'outlined'}
                onClick={() => { setLoadType('DRAYAGE'); setFormData(prev => ({ ...prev, loadType: 'DRAYAGE' })); }}
                sx={{ borderRadius: 5, minWidth: 110 }}
              >
                DRAYAGE
              </Button>
            </Stack>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 3, background: '#fff' }}>
          <Box sx={{ mt: 2 }}>
            {/* Customer Name */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Customer Name</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Customer Name"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleFormInputChange}
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Customer ID removed as requested */}

            {/* OTR: Origins/Destinations; DRAYAGE: From/To */}
            {loadType === 'OTR' ? (
              <>
                {/* Location Details */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', background: '#e3f2fd', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocationOn color="primary" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Location Details
                    </Typography>
                  </Box>
                  {formData.origins.map((origin, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, position: 'relative' }}>
                      {formData.origins.length > 1 && (
                        <IconButton aria-label="remove" size="small" onClick={() => setFormData(prev => ({ ...prev, origins: prev.origins.filter((_, i) => i !== index) }))} sx={{ position: 'absolute', top: 6, right: 6 }}>
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Pickup Locations {index + 1}</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="Address Line 1 *"
                            value={origin.addressLine1}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].addressLine1 = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                            sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
                  required
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="Address Line 2"
                            value={origin.addressLine2}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].addressLine2 = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="City *"
                            value={origin.city}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].city = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                            required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  label="State" 
                            value={origin.state}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].state = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                            label="ZIP"
                            value={origin.zip}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].zip = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                            label="Weight (lbs) *"
                            value={origin.weight}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].weight = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                            required
                            InputProps={{ startAdornment: <InputAdornment position="start">⏳</InputAdornment> }}
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="Commodity *"
                            value={origin.commodity}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].commodity = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                  required
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            type="date"
                            label="Pickup Date *"
                            value={origin.pickupDate}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].pickupDate = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                            type="date"
                            label="Delivery Date"
                            value={origin.deliveryDate || ''}
                            onChange={(e) => {
                              const arr = [...formData.origins];
                              arr[index].deliveryDate = e.target.value;
                              setFormData(prev => ({ ...prev, origins: arr }));
                            }}
                  fullWidth
                            InputLabelProps={{ shrink: true }}
                />
              </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => setFormData(prev => ({ ...prev, origins: [...prev.origins, { addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', pickupDate: '', deliveryDate: '' }] }))}
                  >
                    Add Pickup Location
                  </Button>
                </Paper>

                {/* Destinations */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: '8px', background: '#e8f5e8', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LocalShipping sx={{ color: '#2e7d32' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      Delivery Locations
                    </Typography>
                  </Box>
                  {formData.destinations.map((destination, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, position: 'relative' }}>
                      {formData.destinations.length > 1 && (
                        <IconButton aria-label="remove" size="small" onClick={() => setFormData(prev => ({ ...prev, destinations: prev.destinations.filter((_, i) => i !== index) }))} sx={{ position: 'absolute', top: 6, right: 6 }}>
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Delivery Location {index + 1}</Typography>
                      <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField 
                            label="Address Line 1 *"
                            value={destination.addressLine1}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].addressLine1 = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                            required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                            label="Address Line 2"
                            value={destination.addressLine2}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].addressLine2 = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="City *"
                            value={destination.city}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].city = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                  required
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="State"
                            value={destination.state}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].state = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="ZIP"
                            value={destination.zip}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].zip = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="Weight (lbs) *"
                            value={destination.weight}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].weight = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                            required
                            InputProps={{ startAdornment: <InputAdornment position="start">⏳</InputAdornment> }}
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            label="Commodity *"
                            value={destination.commodity}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].commodity = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                            required
                />
              </Grid>
                        <Grid item xs={12} sm={4}>
                <TextField 
                            type="date"
                            label="Delivery Date *"
                            value={destination.deliveryDate}
                            onChange={(e) => {
                              const arr = [...formData.destinations];
                              arr[index].deliveryDate = e.target.value;
                              setFormData(prev => ({ ...prev, destinations: arr }));
                            }}
                  fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                />
              </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => setFormData(prev => ({ ...prev, destinations: [...prev.destinations, { addressLine1: '', addressLine2: '', city: '', state: '', zip: '', weight: '', commodity: '', deliveryDate: '' }] }))}
                  >
                    Add Delivery Location
                  </Button>
                </Paper>
              </>
            ) : (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: '#e0f2f1' }}>
                    <LocationOn sx={{ color: '#00695c' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#00695c' }}>
                    Drayage Route
                  </Typography>
                </Box>
                <Grid container spacing={2}>
              <Grid item xs={12}>
                    <TextField label="From Address" name="fromAddress" value={formData.fromAddress} onChange={handleFormInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                    <TextField label="From City" name="fromCity" value={formData.fromCity} onChange={handleFormInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                    <TextField label="From State" name="fromState" value={formData.fromState} onChange={handleFormInputChange} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="To Address" name="toAddress" value={formData.toAddress} onChange={handleFormInputChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                    <TextField label="To City" name="toCity" value={formData.toCity} onChange={handleFormInputChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="To State" name="toState" value={formData.toState} onChange={handleFormInputChange} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField type="date" label="Pickup Date" name="pickupDate" value={formData.pickupDate} onChange={handleFormInputChange} fullWidth InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField type="date" label="Delivery Date" name="deliveryDate" value={formData.deliveryDate} onChange={handleFormInputChange} fullWidth InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Load Details */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: '#f3e5f5' }}>
                  <Description sx={{ color: '#7b1fa2' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                  Load Details
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select name="vehicleType" value={formData.vehicleType} onChange={handleFormInputChange} label="Vehicle Type" sx={{ borderRadius: 2 }}>
                      <MenuItem value="Dry Van">Dry Van</MenuItem>
                      <MenuItem value="Refrigerated">Refrigerated</MenuItem>
                      <MenuItem value="Flatbed">Flatbed</MenuItem>
                      <MenuItem value="Container">Container</MenuItem>
                      <MenuItem value="Tanker">Tanker</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Line Haul" name="lineHaul" value={formData.lineHaul} onChange={handleFormInputChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="FSC" name="fsc" value={formData.fsc} onChange={handleFormInputChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Other" name="other" value={formData.other} onChange={handleFormInputChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Total" name="total" value={String(((Number(formData.lineHaul)||0) + (Number(formData.fsc)||0) + (Number(formData.other)||0)).toFixed ? ((Number(formData.lineHaul)||0) + (Number(formData.fsc)||0) + (Number(formData.other)||0)).toFixed(2) : (Number(formData.lineHaul)||0) + (Number(formData.fsc)||0) + (Number(formData.other)||0))} fullWidth disabled InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rate Type</InputLabel>
                    <Select name="rateType" value={formData.rateType} onChange={handleFormInputChange} label="Rate Type">
                      <MenuItem value="Flat Rate">Flat Rate</MenuItem>
                      <MenuItem value="Per Mile">Per Mile</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {loadType === 'DRAYAGE' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Weight (lbs)" name="weight" value={formData.weight} onChange={handleFormInputChange} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Commodity" name="commodity" value={formData.commodity} onChange={handleFormInputChange} fullWidth />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>

            {/* Schedule & Timeline */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: '#e8f5e8' }}>
                  <CalendarToday sx={{ color: '#2e7d32' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  Schedule & Timeline
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField type="date" label="Bid Deadline" name="bidDeadline" value={formData.bidDeadline} onChange={handleFormInputChange} fullWidth InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </Paper>

            {/* Additional Details */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, background: '#e0f2f1' }}>
                  <Description sx={{ color: '#00695c' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#00695c' }}>
                  Additional Details
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Container No." name="containerNo" value={formData.containerNo} onChange={handleFormInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="PO Number" name="poNumber" value={formData.poNumber} onChange={handleFormInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="BOL Number" name="bolNumber" value={formData.bolNumber} onChange={handleFormInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Shipment Number" name="shipmentNo" value={formData.shipmentNo} onChange={handleFormInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleFormInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Customer Phone" name="customerPhone" value={formData.customerPhone} onChange={handleFormInputChange} fullWidth />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="Customer Email" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleFormInputChange} fullWidth />
                </Grid>
              <Grid item xs={12}>
                  <TextField label="Special Instructions" name="specialInstructions" multiline rows={3} value={formData.specialInstructions} onChange={handleFormInputChange} fullWidth />
              </Grid>
            </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" startIcon={<Cancel />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3, py: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveLoad} variant="contained" startIcon={loading ? <CircularProgress size={20} /> : <Save />} disabled={loading} sx={{ backgroundColor: '#1976d2', color: 'white', borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3, py: 1 }}>
            {loading ? 'Adding...' : 'Create Load'}
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