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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Payment,
  CheckCircle,
  Person,
  Close,
  AttachMoney,
  FileUpload,
  LocalShipping,
  Refresh,
  Description,
  Pending,
  Visibility,
} from '@mui/icons-material';
import { BASE_API_URL } from '../../apiConfig';

const Payments = () => {
  // Tab state
  const [currentTab, setCurrentTab] = useState(0); // 0 = Unpaid List, 1 = Paid List

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Unpaid drivers list
  const [unpaidDrivers, setUnpaidDrivers] = useState([]);
  const [unpaidDriversLoading, setUnpaidDriversLoading] = useState(true);
  const [unpaidPage, setUnpaidPage] = useState(0);
  const [unpaidRowsPerPage, setUnpaidRowsPerPage] = useState(10);

  // Paid drivers list
  const [paidDrivers, setPaidDrivers] = useState([]);
  const [paidDriversLoading, setPaidDriversLoading] = useState(true);
  const [paidPage, setPaidPage] = useState(0);
  const [paidRowsPerPage, setPaidRowsPerPage] = useState(10);
  const [paidDateFrom, setPaidDateFrom] = useState('');
  const [paidDateTo, setPaidDateTo] = useState('');

  // Summary
  const [summary, setSummary] = useState(null);

  // Dialog states
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [openLoadDetailsDialog, setOpenLoadDetailsDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDriverForDetails, setSelectedDriverForDetails] = useState(null);

  // Pay driver form
  const [payDriverForm, setPayDriverForm] = useState({
    driverId: '',
    paymentMethod: '',
    paymentReference: '',
    paymentNotes: '',
    paymentProof: null,
  });

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load Unpaid Drivers List
  const loadUnpaidDrivers = async () => {
    try {
      setUnpaidDriversLoading(true);
      const response = await makeAPICall('/api/v1/trucker-payments/driver/unpaid');
      
      if (response.success) {
        setUnpaidDrivers(response.data.drivers || []);
        setSummary(response.data.summary || null);
      } else {
        setError('Failed to load unpaid drivers');
      }
    } catch (err) {
      setError('Error loading unpaid drivers: ' + err.message);
    } finally {
      setUnpaidDriversLoading(false);
    }
  };

  // Load Paid Drivers List
  const loadPaidDrivers = async () => {
    try {
      setPaidDriversLoading(true);
      const params = new URLSearchParams();
      if (paidDateFrom) params.append('dateFrom', paidDateFrom);
      if (paidDateTo) params.append('dateTo', paidDateTo);
      
      const endpoint = `/api/v1/trucker-payments/driver/paid${params.toString() ? '?' + params.toString() : ''}`;
      const response = await makeAPICall(endpoint);
      
      if (response.success) {
        setPaidDrivers(response.data.drivers || []);
      } else {
        setError('Failed to load paid drivers');
      }
    } catch (err) {
      setError('Error loading paid drivers: ' + err.message);
    } finally {
      setPaidDriversLoading(false);
    }
  };

  // Pay Driver
  const handlePayDriver = async () => {
    if (!payDriverForm.driverId || !payDriverForm.paymentMethod) {
      setSnackbar({ open: true, message: 'Driver ID and Payment Method are required', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('paymentMethod', payDriverForm.paymentMethod);
      if (payDriverForm.paymentReference) formData.append('paymentReference', payDriverForm.paymentReference);
      if (payDriverForm.paymentNotes) formData.append('paymentNotes', payDriverForm.paymentNotes);
      if (payDriverForm.paymentProof) formData.append('paymentProof', payDriverForm.paymentProof);

      const token = getAuthToken();
      if (!token) {
        setSnackbar({ open: true, message: 'Authentication required. Please login again.', severity: 'error' });
        return;
      }

      // Use driverId in URL path
      const response = await fetch(`${BASE_API_URL}/api/v1/trucker-payments/driver/pay/${payDriverForm.driverId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || 'Failed to process payment';
        
        if (response.status === 400) {
          errorMessage = data.message || 'Invalid request. Please check all fields.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = data.message || 'You do not have permission to pay this driver.';
        } else if (response.status === 404) {
          errorMessage = data.message || 'Driver not found or no pending loads found.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        return;
      }

      if (data.success) {
        const successMessage = data.message || `Driver payment processed successfully - ${data.data?.paidLoads?.length || 0} load(s) paid`;
        setSnackbar({ 
          open: true, 
          message: successMessage, 
          severity: 'success' 
        });
        setOpenPayDialog(false);
        setPayDriverForm({
          driverId: '',
          paymentMethod: '',
          paymentReference: '',
          paymentNotes: '',
          paymentProof: null,
        });
        setSelectedDriver(null);
        // Reload data after successful payment
        await Promise.all([
          loadUnpaidDrivers(),
          loadPaidDrivers()
        ]);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to process payment', severity: 'error' });
      }
    } catch (err) {
      console.error('Pay Driver Error:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Network error. Please check your connection and try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Open pay dialog
  const handleOpenPayDialog = (driver) => {
    // Use driverId from the response
    const driverId = driver.driverId || driver._id || driver.driver?._id;
    const driverData = driver.driver || driver;
    
    setSelectedDriver({
      ...driverData,
      driverId: driverId,
      pendingLoads: driver.pendingLoads || [],
      pendingLoadCount: driver.loadCount || driver.pendingLoadCount,
      totalPendingAmount: driver.totalPendingAmount,
      loadCount: driver.loadCount,
    });
    
    setPayDriverForm({
      driverId: driverId,
      paymentMethod: '',
      paymentReference: '',
      paymentNotes: '',
      paymentProof: null,
    });
    setOpenPayDialog(true);
  };

  // Effects
  useEffect(() => {
    if (currentTab === 0) {
      loadUnpaidDrivers();
    } else {
      loadPaidDrivers();
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 1) {
      loadPaidDrivers();
    }
  }, [paidDateFrom, paidDateTo]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            Driver Payments
          </Typography>
          {summary && (
            <Chip
              label={`${summary.totalDrivers || 0} Unpaid Driver${(summary.totalDrivers || 0) !== 1 ? 's' : ''}`}
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            onClick={currentTab === 0 ? loadUnpaidDrivers : loadPaidDrivers}
            disabled={currentTab === 0 ? unpaidDriversLoading : paidDriversLoading}
            startIcon={currentTab === 0 ? (unpaidDriversLoading ? <CircularProgress size={16} /> : <Refresh />) : (paidDriversLoading ? <CircularProgress size={16} /> : <Refresh />)}
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
            Refresh
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={3} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minHeight: 64,
            },
          }}
        >
          <Tab 
            icon={<Pending />} 
            iconPosition="start"
            label="Unpaid List" 
            sx={{ 
              '&.Mui-selected': { 
                color: '#1976d2',
              },
            }}
          />
          <Tab 
            icon={<CheckCircle />} 
            iconPosition="start"
            label="Paid List"
            sx={{ 
              '&.Mui-selected': { 
                color: '#1976d2',
              },
            }}
          />
        </Tabs>
      </Paper>

      {/* Unpaid List Tab */}
      {currentTab === 0 && (
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
                  'Driver Name',
                  'Phone',
                  'Email',
                  'Pending Loads',
                  'Total Amount',
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
              {unpaidDriversLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body1" color="text.secondary">
                        Loading unpaid drivers...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : unpaidDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ fontSize: 48, color: '#cbd5e1' }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        All drivers are paid!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No unpaid drivers found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                unpaidDrivers
                  .slice(unpaidPage * unpaidRowsPerPage, unpaidPage * unpaidRowsPerPage + unpaidRowsPerPage)
                  .map((driver) => (
                    <>
                      <TableRow 
                        key={driver.driverId} 
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
                            <Person sx={{ fontSize: 18, color: '#64748b' }} />
                            <Typography sx={{ fontWeight: 700 }}>{driver.driver?.fullName || driver.driverName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', py: 2 }}>
                          <Typography variant="body2">{driver.driver?.phone || driver.phone}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', py: 2 }}>
                          <Typography variant="body2">{driver.driver?.email || driver.email}</Typography>
                        </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={driver.loadCount || driver.pendingLoadCount}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 26,
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                            }}
                          />
                          {driver.pendingLoads && driver.pendingLoads.length > 0 && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDriverForDetails(driver);
                                setOpenLoadDetailsDialog(true);
                              }}
                              sx={{
                                fontSize: '0.7rem',
                                px: 1.5,
                                py: 0.3,
                                textTransform: 'none',
                                color: '#1976d2',
                                borderColor: '#bfdbfe',
                                backgroundColor: '#eff6ff',
                                fontWeight: 600,
                                minWidth: 'auto',
                                '&:hover': {
                                  backgroundColor: '#dbeafe',
                                  borderColor: '#1976d2',
                                },
                              }}
                            >
                              View Details
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem', py: 2 }}>
                          {formatCurrency(driver.totalPendingAmount)}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Payment />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPayDialog(driver);
                            }}
                            sx={{
                              backgroundColor: '#1976d2',
                              color: 'white',
                              px: 2,
                              py: 0.5,
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              '&:hover': {
                                backgroundColor: '#0d47a1',
                              },
                            }}
                          >
                            Pay Driver
                          </Button>
                        </TableCell>
                      </TableRow>
                    </>
                  ))
              )}
            </TableBody>
          </Table>
          {!unpaidDriversLoading && unpaidDrivers.length > 0 && (
            <TablePagination
              component="div"
              count={unpaidDrivers.length}
              page={unpaidPage}
              onPageChange={(e, newPage) => setUnpaidPage(newPage)}
              rowsPerPage={unpaidRowsPerPage}
              onRowsPerPageChange={(e) => {
                setUnpaidRowsPerPage(parseInt(e.target.value, 10));
                setUnpaidPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#fafafa'
              }}
            />
          )}
        </Paper>
      )}

      {/* Paid List Tab */}
      {currentTab === 1 && (
        <>
          {/* Date Filters for Paid List */}
          <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Date From"
                  type="date"
                  fullWidth
                  size="small"
                  value={paidDateFrom}
                  onChange={(e) => setPaidDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Date To"
                  type="date"
                  fullWidth
                  size="small"
                  value={paidDateTo}
                  onChange={(e) => setPaidDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setPaidDateFrom('');
                    setPaidDateTo('');
                  }}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#1976d2',
                    borderColor: '#1976d2',
                    '&:hover': {
                      borderColor: '#0d47a1',
                      color: '#0d47a1',
                    },
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

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
                  'Driver Name',
                  'Phone',
                  'Email',
                  'Paid Loads',
                  'Total Amount',
                  'Paid Date',
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
              {paidDriversLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body1" color="text.secondary">
                        Loading paid drivers...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paidDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <LocalShipping sx={{ fontSize: 48, color: '#cbd5e1' }} />
                      <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        No paid drivers found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Paid driver records will appear here
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paidDrivers
                  .slice(paidPage * paidRowsPerPage, paidPage * paidRowsPerPage + paidRowsPerPage)
                  .map((driver) => (
                    <TableRow 
                      key={driver.driverId || driver._id} 
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
                          <Person sx={{ fontSize: 18, color: '#64748b' }} />
                          <Typography sx={{ fontWeight: 700 }}>{driver.driver?.fullName || driver.driverName || driver.fullName || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', py: 2 }}>
                        <Typography variant="body2">{driver.driver?.phone || driver.phone || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', py: 2 }}>
                        <Typography variant="body2">{driver.driver?.email || driver.email || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={driver.loadCount || driver.paidLoadCount || 0}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 26,
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem', py: 2 }}>
                        {formatCurrency(driver.totalPaidAmount || driver.totalAmount || 0)}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', py: 2 }}>
                        <Typography variant="body2">
                          {driver.lastPaymentDate ? formatDateTime(driver.lastPaymentDate) : (driver.paidAt ? formatDateTime(driver.paidAt) : 'N/A')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          {!paidDriversLoading && paidDrivers.length > 0 && (
            <TablePagination
              component="div"
              count={paidDrivers.length}
              page={paidPage}
              onPageChange={(e, newPage) => setPaidPage(newPage)}
              rowsPerPage={paidRowsPerPage}
              onRowsPerPageChange={(e) => {
                setPaidRowsPerPage(parseInt(e.target.value, 10));
                setPaidPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#fafafa'
              }}
            />
          )}
        </Paper>
        </>
      )}

      {/* Pay Driver Dialog */}
      <Dialog 
        open={openPayDialog} 
        onClose={() => setOpenPayDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
            py: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
            Pay Driver
          </Typography>
          <IconButton
            onClick={() => setOpenPayDialog(false)}
            sx={{ 
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#e2e8f0',
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedDriver && (
            <Box 
              sx={{ 
                mb: 3, 
                p: 2.5, 
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>
                Driver Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Name: <strong style={{ color: '#1e293b' }}>{selectedDriver.fullName || selectedDriver.driverName}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone: <strong style={{ color: '#1e293b' }}>{selectedDriver.phone}</strong>
                  </Typography>
                </Grid>
                {(selectedDriver.pendingLoadCount || selectedDriver.loadCount) && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pending Loads: <strong style={{ color: '#1e293b' }}>{selectedDriver.loadCount || selectedDriver.pendingLoadCount}</strong>
                    </Typography>
                  </Grid>
                )}
                {selectedDriver.totalPendingAmount && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount: <strong style={{ color: '#059669', fontSize: '1.1em' }}>{formatCurrency(selectedDriver.totalPendingAmount)}</strong>
                    </Typography>
                  </Grid>
                )}
                {selectedDriver.pendingLoads && selectedDriver.pendingLoads.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Loads: {selectedDriver.pendingLoads.map((load, idx) => (
                        <span key={load.loadId}>
                          {load.shipmentNumber}{idx < selectedDriver.pendingLoads.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={payDriverForm.paymentMethod}
                onChange={(e) => setPayDriverForm({ ...payDriverForm, paymentMethod: e.target.value })}
                label="Payment Method"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Payment Reference (Optional)"
              fullWidth
              value={payDriverForm.paymentReference}
              onChange={(e) => setPayDriverForm({ ...payDriverForm, paymentReference: e.target.value })}
              placeholder="e.g., TXN123456"
            />
            <TextField
              label="Payment Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={payDriverForm.paymentNotes}
              onChange={(e) => setPayDriverForm({ ...payDriverForm, paymentNotes: e.target.value })}
              placeholder="Add any notes about this payment..."
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUpload />}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: '#f8fafc',
                  },
                }}
              >
                Upload Payment Proof (Optional)
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPayDriverForm({ ...payDriverForm, paymentProof: e.target.files[0] });
                    }
                  }}
                />
              </Button>
              {payDriverForm.paymentProof && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    backgroundColor: '#f1f5f9',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Description sx={{ color: '#1976d2', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                    {payDriverForm.paymentProof.name}
                  </Typography>
                </Box>
              )}
            </Box>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                This will automatically pay all pending completed loads for this driver.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setOpenPayDialog(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#f1f5f9',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayDriver} 
            variant="contained"
            disabled={loading || !payDriverForm.paymentMethod}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
              '&:disabled': {
                backgroundColor: '#cbd5e1',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Process Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Details Dialog */}
      <Dialog 
        open={openLoadDetailsDialog} 
        onClose={() => {
          setOpenLoadDetailsDialog(false);
          setSelectedDriverForDetails(null);
        }} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
            py: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalShipping sx={{ fontSize: 28, color: '#1976d2' }} />
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                Load Details
              </Typography>
              {selectedDriverForDetails && (
                <Typography variant="body2" color="text.secondary">
                  {selectedDriverForDetails.driver?.fullName || selectedDriverForDetails.driverName} - {selectedDriverForDetails.pendingLoads?.length || 0} Pending Load{selectedDriverForDetails.pendingLoads?.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={() => {
              setOpenLoadDetailsDialog(false);
              setSelectedDriverForDetails(null);
            }}
            sx={{ 
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#e2e8f0',
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedDriverForDetails && selectedDriverForDetails.pendingLoads && selectedDriverForDetails.pendingLoads.length > 0 ? (
            <Box>
              {/* Driver Summary */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 3, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Driver Name</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#1e293b' }}>
                      {selectedDriverForDetails.driver?.fullName || selectedDriverForDetails.driverName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1e293b' }}>
                      {selectedDriverForDetails.driver?.phone || selectedDriverForDetails.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Loads</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#1976d2' }}>
                      {selectedDriverForDetails.loadCount || selectedDriverForDetails.pendingLoads.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#059669', fontSize: '1.1rem' }}>
                      {formatCurrency(selectedDriverForDetails.totalPendingAmount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Loads Table */}
              <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5 }}>
                        Shipment Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5 }}>
                        Shipper
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5 }}>
                        Payment Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5 }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5 }}>
                        Delivered At
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDriverForDetails.pendingLoads.map((load, idx) => (
                      <TableRow 
                        key={load.loadId}
                        hover
                        sx={{
                          transition: 'all 0.25s ease',
                          borderBottom: idx < selectedDriverForDetails.pendingLoads.length - 1 ? '1px solid #f1f5f9' : 'none',
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalShipping sx={{ fontSize: 18, color: '#64748b' }} />
                            <Typography sx={{ fontWeight: 700 }}>{load.shipmentNumber}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', py: 2 }}>
                          <Typography variant="body2">{load.shipper}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem', py: 2 }}>
                          {formatCurrency(load.paymentAmount)}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={load.status}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 26,
                              backgroundColor: '#d1fae5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', py: 2 }}>
                          <Typography variant="body2">{formatDateTime(load.deliveredAt)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LocalShipping sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                No load details available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          {selectedDriverForDetails && (
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={() => {
                setOpenLoadDetailsDialog(false);
                handleOpenPayDialog(selectedDriverForDetails);
              }}
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#0d47a1',
                },
              }}
            >
              Pay Driver
            </Button>
          )}
          <Button 
            onClick={() => {
              setOpenLoadDetailsDialog(false);
              setSelectedDriverForDetails(null);
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#f1f5f9',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Payments;
