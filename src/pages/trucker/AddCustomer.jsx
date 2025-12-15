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
  Skeleton,
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
  PersonAdd,
  Business,
  Phone,
  Email,
  LocationOn,
  Save,
  Cancel,
  Description
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';
//just for github 
const AddCustomer = () => {
  const { user, userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState(() => ({
    companyName: '',
    mcDotNo: '',
    email: '',
    mobile: '',
    companyAddress: '',
    city: '',
    state: '',
    country: 'USA',
    zipCode: '',
    notes: ''
  }));

  // Fetch all customers on component mount
  useEffect(() => {
    fetchAllCustomers();
  }, []);

  // API Functions
  const fetchAllCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-customer/all`, {
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
        setCustomersData(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-customer/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to add customer');
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (customerId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-customer/${customerId}`, {
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
        throw new Error(result.message || 'Failed to update customer');
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-customer/${customerId}`, {
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
        throw new Error(result.message || 'Failed to delete customer');
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
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

  const handleAddCustomer = useCallback(() => {
    setFormData({
      companyName: '',
      mcDotNo: '',
      email: '',
      mobile: '',
      companyAddress: '',
      city: '',
      state: '',
      country: 'USA',
      zipCode: '',
      notes: ''
    });
    setAddModalOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer) => {
    // Map API response to form data
    setFormData({
      companyName: customer.companyInfo?.companyName || '',
      mcDotNo: customer.companyInfo?.mcDotNo || '',
      email: customer.contactInfo?.email || '',
      mobile: customer.contactInfo?.mobile || '',
      companyAddress: customer.locationDetails?.companyAddress || '',
      city: customer.locationDetails?.city || '',
      state: customer.locationDetails?.state || '',
      country: customer.locationDetails?.country || 'USA',
      zipCode: customer.locationDetails?.zipCode || '',
      notes: customer.notes || ''
    });
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  }, []);

  const handleViewCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  }, []);

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        await deleteCustomer(customerId);
        
        // Refresh the customer list
        await fetchAllCustomers();
        setSuccess('Customer deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete customer');
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveCustomer = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      setLoading(true);
      
      if (editModalOpen) {
        // Update existing customer with form data
        await updateCustomer(selectedCustomer.customerId, formData);
        setSuccess('Customer updated successfully');
      } else {
        // Add new customer
        await addCustomer(formData);
        setSuccess('Customer added successfully');
      }
      
      // Refresh the customer list
      await fetchAllCustomers();
      setAddModalOpen(false);
      setEditModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save customer');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };


  // Filter customers based on search term - memoized for performance
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return customersData;
    
    const searchLower = searchTerm.toLowerCase();
    return customersData.filter(customer =>
      customer.companyInfo?.companyName?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.email?.toLowerCase().includes(searchLower) ||
      customer.contactInfo?.mobile?.includes(searchTerm) ||
      customer.locationDetails?.city?.toLowerCase().includes(searchLower) ||
      customer.locationDetails?.state?.toLowerCase().includes(searchLower)
    );
  }, [customersData, searchTerm]);

  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // AddCustomer Skeleton Loading Component
  const AddCustomerSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>

      {/* Table Skeleton */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((col) => (
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
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={180} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
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
      </Paper>
    </Box>
  );

  if (loading && customersData.length === 0) {
    return <AddCustomerSkeleton />;
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
            Add Customer
          </Typography>
          <Chip
            label={`${customersData.length} Customer${customersData.length !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search customers..."
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
            onClick={handleAddCustomer}
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
            Add Customer
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
                'Company Name',
                'MC/DOT No',
                'Email',
                'Mobile',
                'Location',
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
            {filteredData && filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((customer) => (
                  <TableRow 
                    key={customer._id} 
                    hover 
                    sx={{ 
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        backgroundColor: '#f0f7ff',
                        transform: 'scale(1.01)',
                      },
                    }}
                  >
                    <TableCell sx={{ width: '150px', fontWeight: 600, color: '#334155' }}>
                      {customer.companyInfo?.companyName}
                    </TableCell>
                    <TableCell sx={{ width: '120px', color: '#475569' }}>
                      {customer.companyInfo?.mcDotNo}
                    </TableCell>
                    <TableCell sx={{ width: '150px', color: '#475569' }}>
                      {customer.contactInfo?.email}
                    </TableCell>
                    <TableCell sx={{ width: '120px', color: '#475569' }}>
                      {customer.contactInfo?.mobile}
                    </TableCell>
                    <TableCell sx={{ width: '200px', wordWrap: 'break-word', color: '#475569' }}>
                      {customer.locationDetails?.city}, {customer.locationDetails?.state} {customer.locationDetails?.zipCode}
                    </TableCell>
                    <TableCell sx={{ width: '100px' }}>
                      <Chip
                        label={customer.status}
                        size="small"
                        color={customer.status === 'active' ? 'success' : 'default'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewCustomer(customer)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1.5,
                            textTransform: 'none',
                            color: '#2563eb',
                            borderColor: '#2563eb',
                            '&:hover': {
                              backgroundColor: '#2563eb',
                              color: '#fff',
                            },
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditCustomer(customer)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1.5,
                            textTransform: 'none',
                            color: '#0284c7',
                            borderColor: '#0284c7',
                            '&:hover': {
                              backgroundColor: '#0284c7',
                              color: '#fff',
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteCustomer(customer.customerId)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 1.5,
                            textTransform: 'none',
                            color: '#dc2626',
                            borderColor: '#dc2626',
                            '&:hover': {
                              backgroundColor: '#dc2626',
                              color: '#fff',
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
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {customersData.length === 0 ? 'No customers found. Add your first customer!' : 'No customers match your search criteria'}
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

      {/* Add Customer Dialog */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'left', pb: 0 }}>
          <Typography variant="h5" color="primary" fontWeight={700} sx={{ textAlign: 'left' }}>
            Add Customer
          </Typography>
          <Divider sx={{ mt: 1, mb: 0.5, width: '100%', borderColor: '#e0e0e0', borderBottomWidth: 2, borderRadius: 2 }} />
        </DialogTitle>
        <DialogContent sx={{ pb: 4, maxHeight: '70vh', overflowY: 'auto', background: '#fff', borderRadius: 0 }}>
          <Box component="form" onSubmit={handleSaveCustomer} sx={{ mt: 1, px: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
              {/* Company Name | MC/DOT No */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Company Name" 
                  name="companyName" 
                  value={formData.companyName || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="MC/DOT No" 
                  name="mcDotNo" 
                  value={formData.mcDotNo || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Email | Mobile */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Email" 
                  name="email" 
                  value={formData.email || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Mobile" 
                  name="mobile" 
                  value={formData.mobile || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Company Address | City */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Company Address" 
                  name="companyAddress" 
                  value={formData.companyAddress || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="City" 
                  name="city" 
                  value={formData.city || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* State | Country */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="State" 
                  name="state" 
                  value={formData.state || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Country" 
                  name="country" 
                  value={formData.country || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Zip Code | Notes */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Zip Code" 
                  name="zipCode" 
                  value={formData.zipCode || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Notes" 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Additional notes about the customer..."
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 4, justifyContent: 'center', gap: 1 }}>
              <Button onClick={() => setAddModalOpen(false)} variant="contained" sx={{ borderRadius: 3, backgroundColor: '#f0f0f0', color: '#000', textTransform: 'none', px: 4, '&:hover': { backgroundColor: '#e0e0e0' } }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 3, textTransform: 'none', px: 4 }}>Submit</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-customer-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 850,
            bgcolor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px 12px 0 0'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#333' }}>
                Edit Customer
              </Typography>
              <IconButton 
                onClick={() => setEditModalOpen(false)}
                sx={{
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e0e0e0'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
          <Box component="form" onSubmit={handleSaveCustomer} sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
              {/* Company Name | MC/DOT No */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Company Name" 
                  name="companyName" 
                  value={formData.companyName || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="MC/DOT No" 
                  name="mcDotNo" 
                  value={formData.mcDotNo || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Email | Mobile */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Email" 
                  name="email" 
                  value={formData.email || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Mobile" 
                  name="mobile" 
                  value={formData.mobile || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Company Address | City */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Company Address" 
                  name="companyAddress" 
                  value={formData.companyAddress || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="City" 
                  name="city" 
                  value={formData.city || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* State | Country */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="State" 
                  name="state" 
                  value={formData.state || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Country" 
                  name="country" 
                  value={formData.country || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>

              {/* Zip Code | Notes */}
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Zip Code" 
                  name="zipCode" 
                  value={formData.zipCode || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  label="Notes" 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleFormInputChange} 
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Additional notes about the customer..."
                  sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
                />
              </Grid>
            </Grid>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              mt: 3
            }}>
              <Button
                variant="outlined"
                onClick={() => setEditModalOpen(false)}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#e0e0e0',
                  color: '#666',
                  backgroundColor: 'white',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#999'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Customer'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* View Customer Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
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
            <Business sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                Customer Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                Complete customer information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setViewModalOpen(false)}
            sx={{ color: '#fff' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
          {selectedCustomer ? (
            <Box sx={{ p: 3 }}>
              {/* Basic Information Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Business sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Basic Information
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Company Name</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedCustomer.companyInfo?.companyName || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>MC/DOT Number</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedCustomer.companyInfo?.mcDotNo || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Status</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <Chip 
                          label={selectedCustomer.status} 
                          size="small"
                          color={selectedCustomer.status === 'active' ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>Created Date</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Contact Information Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Phone sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Contact Information
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Email</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedCustomer.contactInfo?.email || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>Mobile</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>{selectedCustomer.contactInfo?.mobile || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Location Details Section */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LocationOn sx={{ color: '#1976d2', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                    Location Details
                  </Typography>
                </Box>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: '1px solid #e0e0e0' }}>Address</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedCustomer.locationDetails?.companyAddress || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>City</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedCustomer.locationDetails?.city || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>State</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedCustomer.locationDetails?.state || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Zip Code</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>{selectedCustomer.locationDetails?.zipCode || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, borderBottom: 'none' }}>Country</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>{selectedCustomer.locationDetails?.country || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Additional Notes Section */}
              {selectedCustomer.notes && (
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Description sx={{ color: '#1976d2', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      Additional Notes
                    </Typography>
                  </Box>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '40%', borderBottom: 'none' }}>Notes</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>{selectedCustomer.notes}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <Typography>No customer details available</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AddCustomer;
