import { useState, useEffect } from 'react';
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
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Warehouse,
  LocationOn,
  CalendarToday,
  Close,
  Person,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';

const Yard = () => {
  const { user, userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [yardsData, setYardsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedYard, setSelectedYard] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    yardName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    coordinates: {
      latitude: '',
      longitude: '',
    },
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });

  // Fetch all yards on component mount
  useEffect(() => {
    fetchAllYards();
  }, []);

  // API Functions
  const fetchAllYards = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Get truckerId from various sources
      const truckerId =
        localStorage.getItem('truckerId') ||
        sessionStorage.getItem('truckerId') ||
        user?.truckerId ||
        user?._id ||
        user?.id ||
        null;

      if (!truckerId) {
        throw new Error('Trucker ID not found. Please login again.');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/yard/by-trucker?truckerId=${truckerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch yards');
      }

      const result = await response.json();
      
      // Handle the new API response structure
      if (result.success && result.data) {
        setYardsData(result.data || []);
      } else {
        setYardsData([]);
      }
    } catch (err) {
      console.error('Error fetching yards:', err);
      setError(err.message || 'Failed to fetch yards');
      // Set empty array if API fails (for development)
      setYardsData([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddYard = () => {
    setSelectedYard(null);
    setFormErrors({});
    setFormData({
      yardName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      coordinates: {
        latitude: '',
        longitude: '',
      },
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
    });
    setAddModalOpen(true);
  };

  const handleViewYard = (yard) => {
    setSelectedYard(yard);
    setViewModalOpen(true);
  };

  const handleEditYard = (yard) => {
    setSelectedYard(yard);
    setFormErrors({});
    setFormData({
      yardName: yard.yardName || '',
      address: yard.address || '',
      city: yard.city || '',
      state: yard.state || '',
      zipCode: yard.zipCode || '',
      country: yard.country || '',
      coordinates: {
        latitude: yard.coordinates?.latitude || '',
        longitude: yard.coordinates?.longitude || '',
      },
      contactPerson: yard.contactPerson || '',
      contactPhone: yard.contactPhone || '',
      contactEmail: yard.contactEmail || '',
      notes: yard.notes || '',
    });
    setAddModalOpen(true);
  };

  const handleDeleteYard = async (yardId) => {
    if (!window.confirm('Are you sure you want to delete this yard?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_API_URL}/api/v1/yard/${yardId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete yard');
      }

      window.alertify.success('Yard deleted successfully');
      fetchAllYards();
    } catch (err) {
      console.error('Error deleting yard:', err);
      window.alertify.error(err.message || 'Failed to delete yard');
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.yardName || formData.yardName.trim() === '') {
      errors.yardName = 'Yard Name is required';
    }
    
    if (!formData.address || formData.address.trim() === '') {
      errors.address = 'Address is required';
    }
    
    if (!formData.city || formData.city.trim() === '') {
      errors.city = 'City is required';
    }
    
    if (!formData.state || formData.state.trim() === '') {
      errors.state = 'State is required';
    }
    
    if (!formData.zipCode || formData.zipCode.trim() === '') {
      errors.zipCode = 'ZIP Code is required';
    }
    
    if (!formData.country || formData.country.trim() === '') {
      errors.country = 'Country is required';
    }
    
    if (formData.contactEmail && formData.contactEmail.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email address';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveYard = async () => {
    // Validate form
    if (!validateForm()) {
      window.alertify.error('Please fill in all required fields correctly');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setFormErrors({});
      const token = localStorage.getItem('token');
      
      const url = selectedYard
        ? `${BASE_API_URL}/api/v1/yard/${selectedYard._id}`
        : `${BASE_API_URL}/api/v1/yard`;
      
      const method = selectedYard ? 'PUT' : 'POST';

      // Prepare data with proper coordinate formatting
      const payload = {
        ...formData,
        coordinates: {
          latitude: formData.coordinates.latitude ? parseFloat(formData.coordinates.latitude) : 0,
          longitude: formData.coordinates.longitude ? parseFloat(formData.coordinates.longitude) : 0,
        }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || (selectedYard ? 'Failed to update yard' : 'Failed to create yard'));
      }

      // Success - only show success when status is 200
      if (response.status === 200 || response.status === 201) {
        window.alertify.success(selectedYard ? 'Yard updated successfully' : 'Yard created successfully');
        setAddModalOpen(false);
        setFormErrors({});
        fetchAllYards();
      }
    } catch (err) {
      console.error('Error saving yard:', err);
      window.alertify.error(err.message || 'Failed to save yard');
    } finally {
      setSaving(false);
    }
  };

  // Filter yards based on search term
  const filteredData = yardsData.filter((yard) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (yard.yardName && yard.yardName.toLowerCase().includes(searchLower)) ||
      (yard.address && yard.address.toLowerCase().includes(searchLower)) ||
      (yard.city && yard.city.toLowerCase().includes(searchLower)) ||
      (yard.state && yard.state.toLowerCase().includes(searchLower)) ||
      (yard.contactPerson && yard.contactPerson.toLowerCase().includes(searchLower))
    );
  });

  // Yard Skeleton Loading Component
  const YardSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="text" width={180} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              {[1, 2, 3, 4, 5].map((col) => (
                <TableCell key={col}>
                  <Skeleton variant="text" width={100} height={20} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={200} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} /></TableCell>
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

  if (loading && yardsData.length === 0) {
    return <YardSkeleton />;
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
            Yard Management
          </Typography>
          <Chip
            label={`${yardsData.length} Yard${yardsData.length !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search yards..."
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
            onClick={handleAddYard}
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
            Add Yard
          </Button>
        </Stack>
      </Box>

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
                'Yard Name',
                'Location',
                'Country',
                'Contact Person',
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
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={200} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} /></TableCell>
                </TableRow>
              ))
            ) : filteredData && filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((yard) => (
                  <TableRow
                    key={yard._id}
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
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warehouse sx={{ fontSize: 20, color: '#1976d2' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {yard.yardName || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#94a3b8', mt: 0.5 }} />
                        <Typography variant="body2">
                          {yard.address ? `${yard.address}, ${yard.city || ''}, ${yard.state || ''} ${yard.zipCode || ''}`.trim() : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {yard.country || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', py: 2 }}>
                      <Typography variant="body2">
                        {yard.contactPerson || 'N/A'}
                      </Typography>
                      {yard.contactPhone && (
                        <Typography variant="caption" color="text.secondary">
                          {yard.contactPhone}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewYard(yard)}
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
                          onClick={() => handleEditYard(yard)}
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
                          onClick={() => handleDeleteYard(yard._id)}
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
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Warehouse sx={{ fontSize: 48, color: '#cbd5e1' }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                      No yards found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {yardsData.length === 0
                        ? 'Add your first yard to get started!'
                        : 'Try adjusting your search criteria'}
                    </Typography>
                  </Box>
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

      {/* Add/Edit Yard Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            minHeight: '85vh',
            maxHeight: '95vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
            <Box sx={{ bgcolor: 'white', borderRadius: 2, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Warehouse sx={{ fontSize: 24, color: '#1976d2' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.25rem', mb: 0.5 }}>
                {selectedYard ? 'Edit Yard' : 'Create New Yard'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.875rem' }}>
                {selectedYard ? 'Update the yard details below' : 'Fill in the details to create a new yard'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setAddModalOpen(false)}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5', flex: 1, overflowY: 'auto' }}>
          <Box component="form" sx={{ p: 3 }}>
            {/* Form Sections */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Yard Information Section */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Warehouse sx={{ color: '#1976d2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Yard Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      label="Yard Name"
                      fullWidth
                      value={formData.yardName}
                      onChange={(e) => {
                        setFormData({ ...formData, yardName: e.target.value });
                        if (formErrors.yardName) {
                          setFormErrors({ ...formErrors, yardName: '' });
                        }
                      }}
                      placeholder="Yard name"
                      required
                      error={!!formErrors.yardName}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                            width: '500px',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: formErrors.yardName ? '#d32f2f' : '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Location Details Section */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* Main Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocationOn sx={{ color: '#388e3c', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Location Details
                  </Typography>
                </Box>

                {/* Yard Address Subsection */}
                <Box sx={{ 
                  backgroundColor: '#fafafa', 
                  borderRadius: 2, 
                  p: 2, 
                  mb: 1.5,
                  border: '1px solid #e5e7eb'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <LocationOn sx={{ fontSize: 20, color: '#1976d2' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>
                      Yard Address
                    </Typography>
                  </Box>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Address"
                        fullWidth
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          if (formErrors.address) {
                            setFormErrors({ ...formErrors, address: '' });
                          }
                        }}
                        placeholder="Full Address"
                        required
                        error={!!formErrors.address}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.address ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.address ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.address ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.address ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="City"
                        fullWidth
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value });
                          if (formErrors.city) {
                            setFormErrors({ ...formErrors, city: '' });
                          }
                        }}
                        placeholder="City"
                        required
                        error={!!formErrors.city}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.city ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.city ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.city ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.city ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="State"
                        fullWidth
                        value={formData.state}
                        onChange={(e) => {
                          setFormData({ ...formData, state: e.target.value });
                          if (formErrors.state) {
                            setFormErrors({ ...formErrors, state: '' });
                          }
                        }}
                        placeholder="State"
                        required
                        error={!!formErrors.state}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.state ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.state ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.state ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.state ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="ZIP Code"
                        fullWidth
                        value={formData.zipCode}
                        onChange={(e) => {
                          setFormData({ ...formData, zipCode: e.target.value });
                          if (formErrors.zipCode) {
                            setFormErrors({ ...formErrors, zipCode: '' });
                          }
                        }}
                        placeholder="ZIP code"
                        required
                        error={!!formErrors.zipCode}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.zipCode ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.zipCode ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.zipCode ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.zipCode ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Country"
                        fullWidth
                        value={formData.country}
                        onChange={(e) => {
                          setFormData({ ...formData, country: e.target.value });
                          if (formErrors.country) {
                            setFormErrors({ ...formErrors, country: '' });
                          }
                        }}
                        placeholder="Country"
                        required
                        error={!!formErrors.country}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            transition: 'all 0.2s ease',
                            height: '42px',
                            '& .MuiOutlinedInput-input': {
                              padding: '10px 14px',
                              '&::placeholder': {
                                fontSize: '0.8rem',
                                opacity: 0.7,
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.country ? '#d32f2f' : '#d1d5db',
                              borderWidth: '1.5px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.country ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: formErrors.country ? '#d32f2f' : '#1976d2',
                                borderWidth: '2px',
                              },
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: formErrors.country ? '#d32f2f' : '#1976d2',
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              {/* Contact Information Section */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f3e5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Person sx={{ color: '#7b1fa2', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', fontSize: '1.125rem' }}>
                    Contact Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Contact Person"
                      fullWidth
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Contact Person"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Phone"
                      fullWidth
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="e.g., +1-9876543210"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Contact Email"
                      fullWidth
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => {
                        setFormData({ ...formData, contactEmail: e.target.value });
                        if (formErrors.contactEmail) {
                          setFormErrors({ ...formErrors, contactEmail: '' });
                        }
                      }}
                      placeholder="e.g., yard.mumbai@example.com"
                      error={!!formErrors.contactEmail}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          transition: 'all 0.2s ease',
                          height: '42px',
                          '& .MuiOutlinedInput-input': {
                            padding: '10px 14px',
                            '&::placeholder': {
                              fontSize: '0.8rem',
                              opacity: 0.7,
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: formErrors.contactEmail ? '#d32f2f' : '#d1d5db',
                            borderWidth: '1.5px',
                          },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formErrors.yardName ? '#d32f2f' : '#1976d2',
                              borderWidth: '2px',
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: '#cbd5e1',
              color: '#64748b',
              px: 4,
              py: 1,
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f0f7ff',
                borderColor: '#357ABD',
                color: '#357ABD',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveYard}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: '#2F5AA8',
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#244A8F',
              },
              '&:disabled': {
                backgroundColor: '#94a3b8',
              },
            }}
          >
            {saving ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                {selectedYard ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              selectedYard ? 'Update Yard' : 'Create Yard'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Yard Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedYard(null);
        }}
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
            <Warehouse sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                Yard Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                Complete yard information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => {
              setViewModalOpen(false);
              setSelectedYard(null);
            }}
            sx={{ color: '#fff' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
          {selectedYard ? (
            <Box sx={{ p: 2 }}>
              {/* Yard Information Section */}
              {selectedYard.yardName && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Warehouse sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Yard Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0', py: 1 }}>Yard Name</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.yardName}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Location Details Section */}
              {(selectedYard.address || selectedYard.city || selectedYard.state || selectedYard.zipCode || selectedYard.country) && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Location Details
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      {selectedYard.address && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0', py: 1 }}>Address</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.address}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.city && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0', py: 1 }}>City</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.city}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.state && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0', py: 1 }}>State</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.state}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.zipCode && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0', py: 1 }}>ZIP Code</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.zipCode}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.country && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: 'none', py: 1 }}>Country</TableCell>
                          <TableCell sx={{ borderBottom: 'none', py: 1 }}>{selectedYard.country}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Contact Information Section */}
              {(selectedYard.contactPerson || selectedYard.contactPhone || selectedYard.contactEmail) && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Person sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Contact Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      {selectedYard.contactPerson && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0', py: 1 }}>Contact Person</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>{selectedYard.contactPerson}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.contactPhone && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: selectedYard.contactEmail ? '1px solid #e0e0e0' : 'none', py: 1 }}>Contact Phone</TableCell>
                          <TableCell sx={{ borderBottom: selectedYard.contactEmail ? '1px solid #e0e0e0' : 'none', py: 1 }}>{selectedYard.contactPhone}</TableCell>
                        </TableRow>
                      )}
                      {selectedYard.contactEmail && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: 'none', py: 1 }}>Contact Email</TableCell>
                          <TableCell sx={{ borderBottom: 'none', py: 1 }}>{selectedYard.contactEmail}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {/* Notes Section */}
              {selectedYard.notes && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Additional Information
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: 'none', py: 1 }}>Notes</TableCell>
                        <TableCell sx={{ borderBottom: 'none', py: 1 }}>{selectedYard.notes}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No yard data available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end', backgroundColor: '#f5f5f5' }}>
          <Button
            onClick={() => {
              setViewModalOpen(false);
              setSelectedYard(null);
            }}
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

export default Yard;
