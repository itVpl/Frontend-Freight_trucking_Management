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
  Chip,
  TextField,
  IconButton,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { Receipt, Download, DateRange, Clear } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import axios from 'axios';
import { useThemeConfig } from '../../context/ThemeContext';

const BASE_API_URL = 'https://vpl-liveproject-1.onrender.com';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Bill generation popup state
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    invoiceDate: null,
    pickUpAddress: '',
    pickUpCity: '',
    weight: '',
    container: '',
    containerType: '',
    quantity: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryDate: null,
    workOrder: '',
    lineHaul: '',
    fsc: '',
    otherNotes: '',
    notes: '',
    loadReference: '',
    paymentTermsDays: 30,
    paymentTermsDescription: 'Net 30 days'
  });
  const [billErrors, setBillErrors] = useState({});
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const { themeConfig } = useThemeConfig();
  const brand = (themeConfig.header?.bg && themeConfig.header.bg !== 'white') ? themeConfig.header.bg : (themeConfig.tokens?.primary || '#1976d2');
  const headerTextColor = themeConfig.header?.text || '#ffffff';
  const textColor = themeConfig.tokens?.text || '#333333';
  const buttonTextColor = themeConfig.tokens?.buttonText || textColor || '#ffffff';
  const highlight = themeConfig.tokens?.highlight || '#e3f2fd';
  
  // View bill modal state
  const [viewBillModalOpen, setViewBillModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [viewBillLoading, setViewBillLoading] = useState(false);
  
  // Mark as paid popup state
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'bank_transfer',
    paymentReference: '',
    paymentNotes: ''
  });
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const [billingData, setBillingData] = useState([]);

  // Fetch bills from API
  const fetchBills = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/bill/my-bills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.bills) {
        // Transform API data to match table format
        const transformedBills = response.data.bills.map(bill => {
          const billDate = new Date(bill.invoiceDate);
          const dueDate = new Date(billDate);
          // Use payment terms days if available, otherwise default to 30 days
          const paymentDays = bill.paymentTerms?.days || 30;
          dueDate.setDate(dueDate.getDate() + paymentDays);
          
          return {
            billId: bill.billNumber,
            billDate: billDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            pickupAddress: bill.pickup.address,
            deliveryAddress: bill.delivery.address,
            amount: bill.billing.total,
            status: bill.status,
            customerName: bill.billTo.customerName,
            pickupCity: bill.pickup.city,
            deliveryCity: bill.delivery.city,
            createdAt: bill.createdAt,
            _id: bill._id,
            paymentTerms: bill.paymentTerms
          };
        });
        
        setBillingData(transformedBills);
        setFilteredData(transformedBills);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBillingData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills on component mount
  useEffect(() => {
    fetchBills();
  }, []);

  // Filter data based on date range
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const filtered = billingData.filter(bill => {
        const billDate = new Date(bill.billDate);
        return isWithinInterval(billDate, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1])
        });
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(billingData);
    }
    setPage(0);
  }, [dateRange, billingData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateRangeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setAnchorEl(null);
  };

  const handleDateChange = (index) => (newValue) => {
    const newDateRange = [...dateRange];
    newDateRange[index] = newValue;
    setDateRange(newDateRange);
  };

  const clearDateRange = () => {
    setDateRange([null, null]);
    handleDateRangeClose();
  };

  const getDateRangeText = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}`;
    }
    return 'Select Date Range';
  };

  const exportToCSV = () => {
    const headers = ['Bill Id', 'Date', 'Amount', 'Status'];
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const values = [row.billId, row.billDate, row.amount, row.status];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'billing_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  // Bill generation handlers
  const handleBillFormChange = (field) => (event) => {
    setBillForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (billErrors[field]) {
      setBillErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBillDateChange = (field) => (newValue) => {
    setBillForm(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const handleGenerateBill = () => {
    setBillModalOpen(true);
  };

  const handleCloseBillModal = () => {
    setBillModalOpen(false);
    setBillForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      invoiceDate: null,
      pickUpAddress: '',
      pickUpCity: '',
      weight: '',
      container: '',
      containerType: '',
      quantity: '',
      deliveryAddress: '',
      deliveryCity: '',
      deliveryDate: null,
      workOrder: '',
      lineHaul: '',
      fsc: '',
      otherNotes: '',
      notes: '',
      loadReference: '',
      paymentTermsDays: 30,
      paymentTermsDescription: 'Net 30 days'
    });
    setBillErrors({});
  };

  const handleSubmitBill = async () => {
    // Basic validation
    const newErrors = {};
    
    if (!billForm.customerName.trim()) newErrors.customerName = 'Customer Name is required';
    if (!billForm.pickUpCity.trim()) newErrors.pickUpCity = 'Pick Up City is required';
    if (!billForm.pickUpAddress.trim()) newErrors.pickUpAddress = 'Pick Up Address is required';
    if (!billForm.weight.trim()) newErrors.weight = 'Weight is required';
    if (!billForm.container.trim()) newErrors.container = 'Container is required';
    if (!billForm.containerType.trim()) newErrors.containerType = 'Container Type is required';
    if (!billForm.deliveryDate) newErrors.deliveryDate = 'Delivery Date is required';
    if (!billForm.deliveryCity.trim()) newErrors.deliveryCity = 'Delivery City is required';
    if (!billForm.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery Address is required';
    if (!billForm.lineHaul.trim()) newErrors.lineHaul = 'Line Haul is required';

    if (Object.keys(newErrors).length > 0) {
      setBillErrors(newErrors);
      return;
    }

    setIsSubmittingBill(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare the API payload according to the provided structure
      const billPayload = {
        billTo: {
          customerName: billForm.customerName,
          customerEmail: billForm.customerEmail || undefined,
          customerPhone: billForm.customerPhone || undefined,
          customerAddress: {
            addressLine1: billForm.customerAddress || undefined,
            addressLine2: billForm.addressLine2 || undefined,
            city: billForm.city || undefined,
            state: billForm.state || undefined,
            zipCode: billForm.zipCode || undefined,
            country: billForm.country || 'USA'
          }
        },
        invoiceDate: billForm.invoiceDate ? billForm.invoiceDate.toISOString() : new Date().toISOString(),
        pickup: {
          city: billForm.pickUpCity,
          address: billForm.pickUpAddress,
          weight: parseFloat(billForm.weight) || 0,
          container: billForm.container,
          containerType: billForm.containerType,
          quantity: parseInt(billForm.quantity) || 1
        },
        delivery: {
          date: billForm.deliveryDate.toISOString(),
          city: billForm.deliveryCity,
          address: billForm.deliveryAddress
        },
        billing: {
          wO: parseFloat(billForm.workOrder) || 0,
          lineHaul: parseFloat(billForm.lineHaul) || 0,
          fsc: parseFloat(billForm.fsc) || 0,
          other: parseFloat(billForm.otherNotes) || 0
        },
        paymentTerms: {
          days: parseInt(billForm.paymentTermsDays) || 30,
          description: billForm.paymentTermsDescription || 'Net 30 days'
        },
        notes: billForm.notes || undefined,
        loadReference: billForm.loadReference || undefined
      };

      const response = await axios.post(`${BASE_API_URL}/api/v1/bill/create`, billPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert('Bill generated successfully!');
        handleCloseBillModal();
        // Refresh the billing data
        fetchBills();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create bill';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmittingBill(false);
    }
  };

  // View bill handler
  const handleViewBill = async (billId) => {
    setSelectedBill(null);
    setViewBillModalOpen(true);
    setViewBillLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/bill/trucker/${billId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSelectedBill(response.data.bill);
      }
    } catch (error) {
      console.error('Error fetching bill details:', error);
      alert('Failed to fetch bill details');
    } finally {
      setViewBillLoading(false);
    }
  };

  const handleCloseViewBillModal = () => {
    setViewBillModalOpen(false);
    setSelectedBill(null);
  };

  // Mark as paid handlers
  const handleMarkAsPaid = (bill) => {
    setSelectedBillForPayment(bill);
    setMarkPaidModalOpen(true);
  };

  const handleCloseMarkPaidModal = () => {
    setMarkPaidModalOpen(false);
    setSelectedBillForPayment(null);
    setPaymentForm({
      paymentMethod: 'bank_transfer',
      paymentReference: '',
      paymentNotes: ''
    });
  };

  const handlePaymentFormChange = (field) => (event) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmitMarkAsPaid = async () => {
    if (!selectedBillForPayment) return;
    
    setIsMarkingPaid(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_API_URL}/api/v1/bill/trucker/${selectedBillForPayment._id}/mark-paid`,
        paymentForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        alert('Bill marked as paid successfully!');
        handleCloseMarkPaidModal();
        fetchBills(); // Refresh the bills list
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark bill as paid';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Billing Overview
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Date Range Picker */}
            <Button
              variant="outlined"
              onClick={handleDateRangeClick}
              startIcon={<DateRange />}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                px: 2,
                py: 0.8,
                fontWeight: 500,
                textTransform: 'none',
                color: brand,
                borderColor: brand,
                minWidth: 200,
                justifyContent: 'space-between',
                '&:hover': {
                  borderColor: brand,
                  color: brand,
                },
              }}
            >
              {getDateRangeText()}
            </Button>
            
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleDateRangeClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              PaperProps={{
                sx: {
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 3,
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Select Date Range
                  </Typography>
                  <IconButton size="small" onClick={clearDateRange}>
                    <Clear />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="From Date"
                    value={dateRange[0]}
                    onChange={handleDateChange(0)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 140 }
                      }
                    }}
                  />
                  <DatePicker
                    label="To Date"
                    value={dateRange[1]}
                    onChange={handleDateChange(1)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 140 }
                      }
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={handleDateRangeClose}
                    sx={{
                      fontSize: '0.75rem',
                      px: 2,
                      py: 0.5,
                      textTransform: 'none',
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleDateRangeClose}
                    sx={{
                      fontSize: '0.75rem',
                      px: 2,
                      py: 0.5,
                      textTransform: 'none',
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            </Popover>

            <Button
              variant="outlined"
              onClick={exportToCSV}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                px: 2,
                py: 0.8,
                fontWeight: 500,
                textTransform: 'none',
                color: brand,
                borderColor: brand,
                '&:hover': {
                  borderColor: brand,
                  color: brand,
                },
              }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={handleGenerateBill}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                px: 2,
                py: 0.8,
                fontWeight: 500,
                textTransform: 'none',
                background: (themeConfig.table?.buttonBg || brand),
                color: (themeConfig.table?.buttonText || buttonTextColor),
                '&:hover': { opacity: 0.9 },
              }}
            >
              Generate Bill
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: (themeConfig.content?.bgImage ? 'rgba(255,255,255,0.94)' : (themeConfig.table?.bg || '#fff')), position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
          {themeConfig.table?.bgImage && (
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
              <TableRow sx={{ backgroundColor: (themeConfig.table?.headerBg || '#f0f4f8') }}>
                <TableCell sx={{ fontWeight: 600 }}>Bill Id</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pickup Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Delivery Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bill Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment Terms</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
             <TableBody>
               {loading ? (
                 <TableRow>
                   <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                     <Typography>Loading bills...</Typography>
                   </TableCell>
                 </TableRow>
               ) : filteredData.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                     <Typography>No bills found</Typography>
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredData
                   .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                   .map((bill, i) => {
                     const today = new Date();
                     const dueDate = new Date(bill.dueDate);
                     const isOverdue = today > dueDate && bill.status.toLowerCase() !== 'paid';
                     
                     return (
                      <TableRow key={bill._id || i} hover sx={{ transition: '0.3s', '&:hover': { backgroundColor: highlight } }}>
                         <TableCell>{bill.billId}</TableCell>
                         <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word' }}>
                           {bill.pickupAddress}
                         </TableCell>
                         <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word' }}>
                           {bill.deliveryAddress}
                         </TableCell>
                         <TableCell>${bill.amount.toLocaleString()}</TableCell>
                         <TableCell>{bill.billDate}</TableCell>
                         <TableCell sx={{ 
                           color: isOverdue ? '#d32f2f' : 'inherit',
                           fontWeight: isOverdue ? 600 : 'normal'
                         }}>
                           {bill.dueDate}
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2" sx={{ 
                             fontSize: '0.875rem',
                             color: '#666',
                             fontWeight: 500
                           }}>
                             {bill.paymentTerms?.days || 30} days
                           </Typography>
                         </TableCell>
                         <TableCell>
                           <Chip 
                             label={bill.status} 
                             color={getStatusColor(bill.status)} 
                             size="small"
                             sx={{
                               ...(bill.status.toLowerCase() === 'pending' && {
                                 backgroundColor: '#ffeb3b',
                                 color: '#000',
                                 '&:hover': {
                                   backgroundColor: '#fdd835'
                                 }
                               }),
                               ...(bill.status.toLowerCase() === 'draft' && {
                                 backgroundColor: '#e0e0e0',
                                 color: '#000',
                                 '&:hover': {
                                   backgroundColor: '#d0d0d0'
                                 }
                               })
                             }}
                           />
                         </TableCell>
                         <TableCell>
                           <Stack direction="row" spacing={1}>
                           <Button
                             size="small"
                             variant="outlined"
                             onClick={() => handleViewBill(bill._id)}
                             sx={{
                               fontSize: '0.75rem',
                               px: 1.5,
                               py: 0.5,
                               textTransform: 'none',
                               borderColor: brand,
                               color: brand,
                               '&:hover': {
                                 borderColor: brand,
                                 color: brand,
                               }
                             }}
                           >
                             View
                           </Button>
                             {bill.status.toLowerCase() !== 'paid' && (
                               <Button
                                 size="small"
                                 variant="contained"
                                 onClick={() => handleMarkAsPaid(bill)}
                                 sx={{
                                   fontSize: '0.75rem',
                                   px: 1.5,
                                   py: 0.5,
                                   textTransform: 'none',
                                   backgroundColor: '#2e7d32',
                                   color: '#fff',
                                   '&:hover': { backgroundColor: '#1b5e20' }
                                 }}
                               >
                                 Mark Paid
                               </Button>
                             )}
                           </Stack>
                         </TableCell>
                       </TableRow>
                     );
                   })
               )}
             </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 15, 20]}
          />
          </Box>
        </Paper>

        {/* Bill Generation Modal */}
        <Dialog 
          open={billModalOpen} 
          onClose={handleCloseBillModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: brand, 
            color: headerTextColor,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Receipt sx={{ color: headerTextColor }} />
            <Typography variant="h6" fontWeight={600} color={headerTextColor}>
              Generate New Bill
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4, background: '#fff' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              {/* Customer Information Section */}
              <Box>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: brand, 
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Customer Information
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: '2px', 
                  background: `linear-gradient(90deg, ${brand}, #e0e0e0)`,
                  mb: 3
                }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Customer Name *"
                      value={billForm.customerName}
                      onChange={handleBillFormChange('customerName')}
                      fullWidth
                      error={!!billErrors.customerName}
                      helperText={billErrors.customerName}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Customer Email *"
                      type="email"
                      value={billForm.customerEmail}
                      onChange={handleBillFormChange('customerEmail')}
                      fullWidth
                      error={!!billErrors.customerEmail}
                      helperText={billErrors.customerEmail}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <DatePicker
                      label="Invoice Date *"
                      value={billForm.invoiceDate}
                      onChange={handleBillDateChange('invoiceDate')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!billErrors.invoiceDate,
                          helperText: billErrors.invoiceDate,
                          sx: {
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                            },
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Customer Address *"
                      multiline
                      rows={2}
                      value={billForm.customerAddress}
                      onChange={handleBillFormChange('customerAddress')}
                      fullWidth
                      error={!!billErrors.customerAddress}
                      helperText={billErrors.customerAddress}
                      sx={{
                        width: '100%',
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Pick Up Information Section */}
              <Box>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: brand, 
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Pick Up Information
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: '2px', 
                  background: `linear-gradient(90deg, ${brand}, #e0e0e0)`,
                  mb: 3
                }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Pick-up Address *"
                      value={billForm.pickUpAddress}
                      onChange={handleBillFormChange('pickUpAddress')}
                      fullWidth
                      error={!!billErrors.pickUpAddress}
                      helperText={billErrors.pickUpAddress}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                   <Grid item xs={12} sm={6}>
                     <TextField
                       label="City *"
                       value={billForm.pickUpCity}
                       onChange={handleBillFormChange('pickUpCity')}
                       fullWidth
                       error={!!billErrors.pickUpCity}
                       helperText={billErrors.pickUpCity}
                       sx={{
                         '& .MuiInputBase-root': {
                           borderRadius: 2,
                         },
                       }}
                     />
                   </Grid>
                </Grid>
              </Box>

              {/* Delivery Information Section */}
              <Box>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: brand, 
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Delivery Information
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: '2px', 
                  background: `linear-gradient(90deg, ${brand}, #e0e0e0)`,
                  mb: 3
                }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Delivery Address *"
                      value={billForm.deliveryAddress}
                      onChange={handleBillFormChange('deliveryAddress')}
                      fullWidth
                      error={!!billErrors.deliveryAddress}
                      helperText={billErrors.deliveryAddress}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="City *"
                      value={billForm.deliveryCity}
                      onChange={handleBillFormChange('deliveryCity')}
                      fullWidth
                      error={!!billErrors.deliveryCity}
                      helperText={billErrors.deliveryCity}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Delivery Date *"
                      value={billForm.deliveryDate}
                      onChange={handleBillDateChange('deliveryDate')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!billErrors.deliveryDate,
                          helperText: billErrors.deliveryDate,
                          sx: {
                            '& .MuiInputBase-root': {
                              borderRadius: 2,
                            },
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Information Section */}
              <Box>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: brand, 
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}>
                  Additional Information
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: '2px', 
                  background: `linear-gradient(90deg, ${brand}, #e0e0e0)`,
                  mb: 3
                }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Weight *"
                      value={billForm.weight}
                      onChange={handleBillFormChange('weight')}
                      fullWidth
                      error={!!billErrors.weight}
                      helperText={billErrors.weight}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Container *"
                      value={billForm.container}
                      onChange={handleBillFormChange('container')}
                      fullWidth
                      error={!!billErrors.container}
                      helperText={billErrors.container}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Container Type *"
                      value={billForm.containerType}
                      onChange={handleBillFormChange('containerType')}
                      fullWidth
                      error={!!billErrors.containerType}
                      helperText={billErrors.containerType}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Quantity *"
                      value={billForm.quantity}
                      onChange={handleBillFormChange('quantity')}
                      fullWidth
                      error={!!billErrors.quantity}
                      helperText={billErrors.quantity}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Work Order *"
                      value={billForm.workOrder}
                      onChange={handleBillFormChange('workOrder')}
                      fullWidth
                      error={!!billErrors.workOrder}
                      helperText={billErrors.workOrder}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Line Haul *"
                      value={billForm.lineHaul}
                      onChange={handleBillFormChange('lineHaul')}
                      fullWidth
                      error={!!billErrors.lineHaul}
                      helperText={billErrors.lineHaul}
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="FSC"
                      value={billForm.fsc}
                      onChange={handleBillFormChange('fsc')}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                   <Grid item xs={12} sm={6}>
                     <TextField
                       label="Other"
                       value={billForm.otherNotes}
                       onChange={handleBillFormChange('otherNotes')}
                       fullWidth
                       sx={{
                         '& .MuiInputBase-root': {
                           borderRadius: 2,
                         },
                       }}
                     />
                   </Grid>
                   
                   <Grid item xs={12} sm={6}>
                     <TextField
                       label="Payment Terms (Days)"
                       type="number"
                       value={billForm.paymentTermsDays}
                       onChange={handleBillFormChange('paymentTermsDays')}
                       fullWidth
                       sx={{
                         '& .MuiInputBase-root': {
                           borderRadius: 2,
                         },
                       }}
                     />
                   </Grid>
                   
                   <Grid item xs={12} sm={6}>
                     <TextField
                       label="Payment Terms Description"
                       value={billForm.paymentTermsDescription}
                       onChange={handleBillFormChange('paymentTermsDescription')}
                       fullWidth
                       sx={{
                         '& .MuiInputBase-root': {
                           borderRadius: 2,
                         },
                       }}
                     />
                   </Grid>
                   
                   <Grid item xs={12}>
                     <TextField
                       label="Notes"
                       multiline
                       rows={3}
                       value={billForm.notes}
                       onChange={handleBillFormChange('notes')}
                       fullWidth
                       sx={{
                         '& .MuiInputBase-root': {
                           borderRadius: 2,
                         },
                       }}
                     />
                   </Grid>
                </Grid>
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
            <Button
              onClick={handleCloseBillModal}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderColor: brand,
                color: brand,
                '&:hover': {
                  borderColor: brand,
                  color: brand,
                },
              }}
            >
              Cancel
            </Button>
             <Button
               onClick={handleSubmitBill}
               variant="contained"
               disabled={isSubmittingBill}
               sx={{
                 borderRadius: 2,
                 textTransform: 'none',
                 px: 3,
                 py: 1,
                 background: brand,
                 color: buttonTextColor,
                 '&:hover': { opacity: 0.9 },
                 '&:disabled': {
                   backgroundColor: '#ccc',
                   color: '#666'
                 }
               }}
             >
               {isSubmittingBill ? 'Generating...' : 'Generate Bill'}
             </Button>
          </DialogActions>
        </Dialog>

        {/* View Bill Modal */}
        <Dialog 
          open={viewBillModalOpen} 
          onClose={handleCloseViewBillModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: brand, 
            color: headerTextColor,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Receipt sx={{ color: headerTextColor }} />
            <Typography variant="h6" fontWeight={600} color={headerTextColor}>
              Bill Details
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3, background: '#fff' }}>
            {viewBillLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading bill details...</Typography>
              </Box>
            ) : selectedBill ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Bill Header */}
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedBill.billNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invoice Date: {new Date(selectedBill.invoiceDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: <Chip label={selectedBill.status} color={getStatusColor(selectedBill.status)} size="small" />
                  </Typography>
                </Box>

                {/* Customer Information */}
                <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
              Customer Information
            </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography><strong>Name:</strong> {selectedBill.billTo.customerName}</Typography>
                    <Typography><strong>Email:</strong> {selectedBill.billTo.customerEmail || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {selectedBill.billTo.customerPhone || 'N/A'}</Typography>
                    {selectedBill.billTo.customerAddress && (
                      <Box sx={{ mt: 1 }}>
                        <Typography><strong>Address:</strong></Typography>
                        <Typography sx={{ pl: 2 }}>
                          {selectedBill.billTo.customerAddress.addressLine1}
                          {selectedBill.billTo.customerAddress.addressLine2 && `, ${selectedBill.billTo.customerAddress.addressLine2}`}
                        </Typography>
                        <Typography sx={{ pl: 2 }}>
                          {selectedBill.billTo.customerAddress.city}, {selectedBill.billTo.customerAddress.state} {selectedBill.billTo.customerAddress.zipCode}
                        </Typography>
                        <Typography sx={{ pl: 2 }}>{selectedBill.billTo.customerAddress.country}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Pickup Information */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: brand, fontWeight: 600 }}>
                    Pickup Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography><strong>Address:</strong> {selectedBill.pickup.address}</Typography>
                    <Typography><strong>City:</strong> {selectedBill.pickup.city}</Typography>
                    <Typography><strong>Weight:</strong> {selectedBill.pickup.weight} lbs</Typography>
                    <Typography><strong>Container:</strong> {selectedBill.pickup.container}</Typography>
                    <Typography><strong>Container Type:</strong> {selectedBill.pickup.containerType}</Typography>
                    <Typography><strong>Quantity:</strong> {selectedBill.pickup.quantity}</Typography>
                  </Box>
                </Box>

                {/* Delivery Information */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: brand, fontWeight: 600 }}>
                    Delivery Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography><strong>Address:</strong> {selectedBill.delivery.address}</Typography>
                    <Typography><strong>City:</strong> {selectedBill.delivery.city}</Typography>
                    <Typography><strong>Date:</strong> {new Date(selectedBill.delivery.date).toLocaleDateString()}</Typography>
                  </Box>
                </Box>

                {/* Billing Information */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: brand, fontWeight: 600 }}>
                    Billing Information
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography><strong>Work Order:</strong> ${selectedBill.billing.wO}</Typography>
                    <Typography><strong>Line Haul:</strong> ${selectedBill.billing.lineHaul}</Typography>
                    <Typography><strong>FSC:</strong> ${selectedBill.billing.fsc}</Typography>
                    <Typography><strong>Other:</strong> ${selectedBill.billing.other}</Typography>
                    <Typography variant="h6" sx={{ mt: 2, color: '#2e7d32' }}>
                      <strong>Total: ${selectedBill.billing.total}</strong>
                    </Typography>
                  </Box>
                </Box>

                {/* Notes */}
                {selectedBill.notes && (
                  <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: brand, fontWeight: 600 }}>
                    Notes
                  </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography>{selectedBill.notes}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>No bill details available</Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
            <Button
              onClick={handleCloseViewBillModal}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderColor: brand,
                color: brand,
                '&:hover': {
                  borderColor: brand,
                  color: brand,
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Mark as Paid Modal */}
        <Dialog 
          open={markPaidModalOpen} 
          onClose={handleCloseMarkPaidModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#f0f4f8', 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Receipt sx={{ color: '#2e7d32' }} />
            <Typography variant="h6" fontWeight={600}>
              Mark Bill as Paid
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3, background: '#fff' }}>
            {selectedBillForPayment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedBillForPayment.billId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Amount: ${selectedBillForPayment.amount.toLocaleString()}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={paymentForm.paymentMethod}
                        onChange={handlePaymentFormChange('paymentMethod')}
                        label="Payment Method"
                      >
                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                        <MenuItem value="credit_card">Credit Card</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Payment Reference *"
                      value={paymentForm.paymentReference}
                      onChange={handlePaymentFormChange('paymentReference')}
                      fullWidth
                      placeholder="e.g., TXN123456789"
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Payment Notes"
                      multiline
                      rows={3}
                      value={paymentForm.paymentNotes}
                      onChange={handlePaymentFormChange('paymentNotes')}
                      fullWidth
                      placeholder="Additional notes about the payment..."
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
            <Button
              onClick={handleCloseMarkPaidModal}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderColor: brand,
                color: brand,
                '&:hover': {
                  borderColor: brand,
                  color: brand,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitMarkAsPaid}
              variant="contained"
              disabled={isMarkingPaid || !paymentForm.paymentReference.trim()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                backgroundColor: '#2e7d32',
                color: '#fff',
                '&:hover': { backgroundColor: '#1b5e20' },
                '&:disabled': {
                  backgroundColor: '#ccc',
                  color: '#666'
                }
              }}
            >
              {isMarkingPaid ? 'Marking...' : 'Mark as Paid'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard;
