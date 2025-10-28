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
  PersonAdd,
  Business,
  Phone,
  Email,
  LocationOn,
  Save,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';

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
        // Update existing customer - only send status for now as per API
        await updateCustomer(selectedCustomer.customerId, { status: 'active' });
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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (prev[name] === value) return prev; // Prevent unnecessary updates
      return {
        ...prev,
        [name]: value
      };
    });
  }, []);

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

  const CustomerForm = memo(({ isEdit = false }) => (
    <DialogContent sx={{ pb: 4, maxHeight: '70vh', overflowY: 'auto', background: '#fff', borderRadius: 0 }}>
      <Box component="form" onSubmit={handleSaveCustomer} sx={{ mt: 1, px: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
          {/* Company Name | MC/DOT No */}
          <Grid item xs={12} sm={6}>
            <TextField 
              label="Company Name" 
              name="companyName" 
              value={formData.companyName || ''} 
              onChange={handleInputChange} 
              fullWidth
              sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              label="MC/DOT No" 
              name="mcDotNo" 
              value={formData.mcDotNo || ''} 
              onChange={handleInputChange} 
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
              onChange={handleInputChange} 
              fullWidth
              sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              label="Mobile" 
              name="mobile" 
              value={formData.mobile || ''} 
              onChange={handleInputChange} 
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
              onChange={handleInputChange} 
              fullWidth
              sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              label="City" 
              name="city" 
              value={formData.city || ''} 
              onChange={handleInputChange} 
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
              onChange={handleInputChange} 
              fullWidth
              sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              label="Country" 
              name="country" 
              value={formData.country || ''} 
              onChange={handleInputChange} 
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
              onChange={handleInputChange} 
              fullWidth
              sx={{ minWidth: '100%', '& .MuiInputBase-root': { borderRadius: '12px', paddingRight: 3 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              label="Notes" 
              name="notes" 
              value={formData.notes || ''} 
              onChange={handleInputChange} 
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
  ));

  if (loading && customersData.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading customers...
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
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '120px' }}>MC/DOT No</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '120px' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '200px' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '100px' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '150px' }}>Actions</TableCell>
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
                      transition: '0.3s', 
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                  >
                    <TableCell sx={{ width: '150px', fontWeight: 600 }}>
                      {customer.companyInfo?.companyName}
                    </TableCell>
                    <TableCell sx={{ width: '120px' }}>
                      {customer.companyInfo?.mcDotNo}
                    </TableCell>
                    <TableCell sx={{ width: '150px' }}>
                      {customer.contactInfo?.email}
                    </TableCell>
                    <TableCell sx={{ width: '120px' }}>
                      {customer.contactInfo?.mobile}
                    </TableCell>
                    <TableCell sx={{ width: '200px', wordWrap: 'break-word' }}>
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
                          onClick={() => handleEditCustomer(customer)}
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
                          onClick={() => handleDeleteCustomer(customer.customerId)}
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
        <CustomerForm key="add-customer-form" />
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
          <CustomerForm key="edit-customer-form" isEdit={true} />
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid #e0e0e0', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2,
            backgroundColor: '#f8f9fa',
            borderRadius: '0 0 12px 12px'
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
              variant="contained"
              onClick={handleSaveCustomer}
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
      </Modal>

      {/* View Customer Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="view-customer-modal"
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
                Customer Details
              </Typography>
              <IconButton 
                onClick={() => setViewModalOpen(false)}
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
          {selectedCustomer && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {selectedCustomer.companyInfo?.companyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight={600}>MC/DOT Number</Typography>
                  <Typography variant="body1">{selectedCustomer.companyInfo?.mcDotNo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight={600}>Email</Typography>
                  <Typography variant="body1">{selectedCustomer.contactInfo?.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight={600}>Mobile</Typography>
                  <Typography variant="body1">{selectedCustomer.contactInfo?.mobile}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight={600}>Status</Typography>
                  <Chip
                    label={selectedCustomer.status}
                    color={selectedCustomer.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600}>Address</Typography>
                  <Typography variant="body1">
                    {selectedCustomer.locationDetails?.companyAddress}<br />
                    {selectedCustomer.locationDetails?.city}, {selectedCustomer.locationDetails?.state} {selectedCustomer.locationDetails?.zipCode}<br />
                    {selectedCustomer.locationDetails?.country}
                  </Typography>
                </Grid>
                {selectedCustomer.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight={600}>Notes</Typography>
                    <Typography variant="body1">{selectedCustomer.notes}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600}>Added By</Typography>
                  <Typography variant="body1">
                    {selectedCustomer.addedByTrucker?.truckerName} ({selectedCustomer.addedByTrucker?.truckerEmail})
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid #e0e0e0', 
            display: 'flex', 
            justifyContent: 'flex-end',
            backgroundColor: '#f8f9fa',
            borderRadius: '0 0 12px 12px'
          }}>
            <Button
              variant="contained"
              onClick={() => setViewModalOpen(false)}
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
                }
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AddCustomer;
