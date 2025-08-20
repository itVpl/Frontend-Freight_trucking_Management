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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import { Receipt, Download, DateRange, Clear, Close, Add } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { jsPDF } from 'jspdf';

const Bills = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [generateBillOpen, setGenerateBillOpen] = useState(false);
  const [viewBillOpen, setViewBillOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billForm, setBillForm] = useState({
    billNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    billDate: new Date(),
    dueDate: new Date(),
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
  });

  const billingData = [
    { billId: 'INV-001', date: '2024-03-20', amount: 25000, status: 'Pending' },
    { billId: 'INV-002', date: '2024-03-21', amount: 18000, status: 'Paid' },
    { billId: 'INV-003', date: '2024-03-22', amount: 32000, status: 'Overdue' },
    { billId: 'INV-004', date: '2024-03-23', amount: 20000, status: 'Pending' },
    { billId: 'INV-005', date: '2024-03-24', amount: 15000, status: 'Paid' },
    { billId: 'INV-006', date: '2024-03-25', amount: 28000, status: 'Pending' },
    { billId: 'INV-007', date: '2024-03-26', amount: 21000, status: 'Overdue' },
    { billId: 'INV-008', date: '2024-03-27', amount: 19000, status: 'Pending' },
    { billId: 'INV-009', date: '2024-03-28', amount: 22000, status: 'Paid' },
    { billId: 'INV-010', date: '2024-03-29', amount: 30000, status: 'Overdue' },
  ];

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const filtered = billingData.filter((bill) => {
        const billDate = new Date(bill.date);
        return isWithinInterval(billDate, {
          start: startOfDay(dateRange[0]),
          end: endOfDay(dateRange[1]),
        });
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(billingData);
    }
    setPage(0);
  }, [dateRange]);

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
    const headers = ['Bill Id', 'Date', 'Amt', 'Status'];
    const csvRows = [headers.join(',')];

    filteredData.forEach((row) => {
      const values = [row.billId, row.date, row.amount, row.status];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bills_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    // Updated color scheme: pending=yellow, paid=green, overdue=red
    switch (status.toLowerCase()) {
      case 'pending':
        // return 'warning';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const open = Boolean(anchorEl);

  const handleGenerateBillClick = () => {
    setGenerateBillOpen(true);
  };

  const handleGenerateBillClose = () => {
    setGenerateBillOpen(false);
    // Reset form
    setBillForm({
      billNumber: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      billDate: new Date(),
      dueDate: new Date(),
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: '',
    });
  };

  const handleFormChange = (field, value) => {
    setBillForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...billForm.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    // Calculate subtotal
    const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax = (subtotal * billForm.tax) / 100;
    const total = subtotal + tax;
    
    setBillForm(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      total
    }));
  };

  const addItem = () => {
    setBillForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (billForm.items.length > 1) {
      const newItems = billForm.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const tax = (subtotal * billForm.tax) / 100;
      const total = subtotal + tax;
      
      setBillForm(prev => ({
        ...prev,
        items: newItems,
        subtotal,
        total
      }));
    }
  };

  const handleTaxChange = (value) => {
    const tax = parseFloat(value) || 0;
    const total = billForm.subtotal + (billForm.subtotal * tax / 100);
    setBillForm(prev => ({
      ...prev,
      tax,
      total
    }));
  };

  const handleSubmitBill = () => {
    // Here you would typically send the bill data to your backend
    console.log('Generating bill:', billForm);
    
    // Add the new bill to the billing data
    const newBill = {
      billId: billForm.billNumber || `INV-${Date.now()}`,
      date: format(billForm.billDate, 'yyyy-MM-dd'),
      amount: billForm.total,
      status: 'Pending'
    };
    
    // In a real app, you'd update the state properly
    // For now, just close the modal
    handleGenerateBillClose();
    
    // You could show a success message here
    alert('Bill generated successfully!');
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setViewBillOpen(true);
  };

  const handleViewBillClose = () => {
    setViewBillOpen(false);
    setSelectedBill(null);
  };

  const handleDownloadPDF = (bill) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL DETAILS', 105, 20, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Add bill information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill Information:', 20, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill ID: ${bill.billId}`, 20, 60);
    doc.text(`Date: ${bill.date}`, 20, 70);
    doc.text(`Amount: $${bill.amount.toLocaleString()}`, 20, 80);
    doc.text(`Status: ${bill.status}`, 20, 90);
    
    // Add description
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, 110);
    
    doc.setFont('helvetica', 'normal');
    const description = `This is a detailed view of bill ${bill.billId}. The bill was generated on ${bill.date} and is currently in ${bill.status.toLowerCase()} status.`;
    doc.text(description, 20, 120);
    
    // Save the PDF
    doc.save(`bill_${bill.billId}.pdf`);
  };

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
            gap: 2,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Bills Overview
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
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
                color: '#1976d2',
                borderColor: '#1976d2',
                minWidth: 200,
                justifyContent: 'space-between',
                '&:hover': {
                  borderColor: '#0d47a1',
                  color: '#0d47a1',
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
                },
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
                        sx: { minWidth: 140 },
                      },
                    }}
                  />
                  <DatePicker
                    label="To Date"
                    value={dateRange[1]}
                    onChange={handleDateChange(1)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 140 },
                      },
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
              startIcon={<Receipt />}
              onClick={handleGenerateBillClick}
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
              Generate Bill
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                <TableCell sx={{ fontWeight: 600 }}>Bill Id</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amt</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>View Detail</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((bill, i) => (
                                     <TableRow
                     key={i}
                     hover
                     sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}
                   >
                     <TableCell>{bill.billId}</TableCell>
                     <TableCell>{bill.date}</TableCell>
                     <TableCell>${bill.amount.toLocaleString()}</TableCell>
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
                            })
                          }}
                        />
                      </TableCell>
                                           <TableCell>
                        <Button 
                          size="small" 
                          variant="text"
                          onClick={() => handleViewBill(bill)}
                        >
                          View
                        </Button>
                      </TableCell>
                                           <TableCell>
                        <Button 
                          size="small" 
                          variant="text" 
                          startIcon={<Download />}
                          onClick={() => handleDownloadPDF(bill)}
                        >
                          Download
                        </Button>
                      </TableCell>
                   </TableRow>
                ))}
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
        </Paper>
      </Box>

             {/* Generate Bill Dialog */}
               <Dialog 
          open={generateBillOpen} 
          onClose={handleGenerateBillClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: '90vh',
              background: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
                  <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            background: '#f5f5f5',
            color: '#333',
            borderRadius: '8px 8px 0 0'
          }}>
            <Typography variant="h5" fontWeight={600}>
              Generate New Bill
            </Typography>
            <IconButton 
              onClick={handleGenerateBillClose} 
              size="small"
              sx={{
                color: '#666',
                '&:hover': {
                  background: '#e0e0e0',
                }
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
                         {/* Bill Information Section */}
             <Box>
                               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  📋 Bill Information
                </Typography>
                <Divider sx={{ 
                  mb: 3,
                  background: '#e0e0e0',
                  height: 1
                }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Bill Number"
                    value={billForm.billNumber}
                    onChange={(e) => handleFormChange('billNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Bill Date"
                      value={billForm.billDate}
                      onChange={(value) => handleFormChange('billDate', value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Due Date"
                      value={billForm.dueDate}
                      onChange={(value) => handleFormChange('dueDate', value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>

                         {/* Customer Information Section */}
             <Box>
                               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  👤 Customer Information
                </Typography>
                <Divider sx={{ 
                  mb: 3,
                  background: '#e0e0e0',
                  height: 1
                }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={billForm.customerName}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Customer Email"
                    type="email"
                    value={billForm.customerEmail}
                    onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Customer Phone"
                    value={billForm.customerPhone}
                    onChange={(e) => handleFormChange('customerPhone', e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>

                         {/* Bill Items Section */}
             <Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                   <Typography variant="h6" fontWeight={600} sx={{
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    🛍️ Bill Items
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={addItem}
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: '#1976d2',
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    }}
                  >
                    Add Item
                  </Button>
                </Box>
                <Divider sx={{ 
                  mb: 3,
                  background: '#e0e0e0',
                  height: 1
                }} />
              
              {billForm.items.map((item, index) => (
                                 <Box key={index} sx={{ 
                   display: 'flex', 
                   gap: 2, 
                   alignItems: 'flex-start',
                   p: 2,
                   border: '1px solid #e0e0e0',
                   borderRadius: 2,
                   background: '#fafafa',
                   mb: 2,
                   '&:hover': {
                     borderColor: '#ccc',
                     background: '#f5f5f5'
                   }
                 }}>
                                     <TextField
                     label="Product"
                     value={item.description}
                     onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                     size="small"
                     sx={{ flexGrow: 1 }}
                   />
                  <TextField
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <TextField
                    label="Rate ($)"
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="Amount ($)"
                    value={item.amount.toFixed(2)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{ readOnly: true }}
                  />
                  {billForm.items.length > 1 && (
                    <IconButton 
                      onClick={() => removeItem(index)}
                      size="small"
                      color="error"
                    >
                      <Clear />
                    </IconButton>
                  )}
                </Box>
              ))}

              {/* Tax and Total Section */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tax Rate (%)"
                    type="number"
                    value={billForm.tax}
                    onChange={(e) => handleTaxChange(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Tax Amount ($)"
                    value={((billForm.subtotal * billForm.tax) / 100).toFixed(2)}
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                                 <Grid item xs={12} md={4}>
                   <TextField
                     fullWidth
                     label="Total Amount ($)"
                     value={billForm.total.toFixed(2)}
                     size="small"
                     InputProps={{ readOnly: true }}
                                           sx={{
                        '& .MuiInputBase-input': {
                          fontWeight: 600,
                          color: '#1976d2',
                          fontSize: '1rem'
                        },
                        '& .MuiOutlinedInput-root': {
                          background: '#f8f9fa',
                          '&:hover': {
                            background: '#f0f0f0'
                          }
                        }
                      }}
                   />
                 </Grid>
              </Grid>
            </Box>

            {/* Notes Section */}
            <Box>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={billForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        
        <Divider />
        
                                   <DialogActions sx={{ p: 2, gap: 2, background: '#f5f5f5' }}>
            <Button 
              onClick={handleGenerateBillClose}
              variant="outlined"
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                borderColor: '#ccc',
                color: '#666',
                fontWeight: 500,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#999',
                  color: '#333',
                  background: '#f0f0f0'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBill}
              variant="contained"
              startIcon={<Receipt />}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                backgroundColor: '#1976d2',
                fontWeight: 500,
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
              }}
            >
              Generate Bill
            </Button>
                     </DialogActions>
       </Dialog>

       {/* View Bill Dialog */}
       <Dialog 
         open={viewBillOpen} 
         onClose={handleViewBillClose}
         maxWidth="md"
         fullWidth
         PaperProps={{
           sx: {
             borderRadius: 2,
             maxHeight: '90vh',
             background: '#ffffff',
             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
           }
         }}
       >
         <DialogTitle sx={{ 
           display: 'flex', 
           justifyContent: 'space-between', 
           alignItems: 'center',
           pb: 2,
           background: '#f5f5f5',
           color: '#333',
           borderRadius: '8px 8px 0 0'
         }}>
           <Typography variant="h5" fontWeight={600}>
             Bill Details
           </Typography>
           <IconButton 
             onClick={handleViewBillClose} 
             size="small"
             sx={{
               color: '#666',
               '&:hover': {
                 background: '#e0e0e0',
               }
             }}
           >
             <Close />
           </IconButton>
         </DialogTitle>
       
       <Divider />
       
       <DialogContent sx={{ pt: 2 }}>
         {selectedBill && (
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             
             {/* Bill Information Section */}
             <Box>
               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                 color: '#333',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1
               }}>
                 📋 Bill Information
               </Typography>
               <Divider sx={{ 
                 mb: 3,
                 background: '#e0e0e0',
                 height: 1
               }} />
               <Grid container spacing={2}>
                 <Grid item xs={12} md={4}>
                   <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Bill ID
                     </Typography>
                     <Typography variant="body1" fontWeight={600}>
                       {selectedBill.billId}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} md={4}>
                   <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Bill Date
                     </Typography>
                     <Typography variant="body1" fontWeight={600}>
                       {selectedBill.date}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} md={4}>
                   <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Status
                     </Typography>
                     <Chip 
                       label={selectedBill.status} 
                       color={getStatusColor(selectedBill.status)} 
                       size="small"
                       sx={{ fontWeight: 600 }}
                     />
                   </Box>
                 </Grid>
               </Grid>
             </Box>

             {/* Amount Details Section */}
             <Box>
               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                 color: '#333',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1
               }}>
                 💰 Amount Details
               </Typography>
               <Divider sx={{ 
                 mb: 3,
                 background: '#e0e0e0',
                 height: 1
               }} />
               <Grid container spacing={2}>
                 <Grid item xs={12} md={6}>
                   <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Amount
                     </Typography>
                     <Typography variant="h4" fontWeight={700} color="#1976d2">
                       ${selectedBill.amount.toLocaleString()}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                       Status
                     </Typography>
                     <Chip 
                       label={selectedBill.status} 
                       color={getStatusColor(selectedBill.status)} 
                       size="medium"
                       sx={{ fontWeight: 600 }}
                     />
                   </Box>
                 </Grid>
               </Grid>
             </Box>

             {/* Additional Information Section */}
             <Box>
               <Typography variant="h6" fontWeight={600} mb={2} sx={{
                 color: '#333',
                 display: 'flex',
                 alignItems: 'center',
                 gap: 1
               }}>
                 ℹ️ Additional Information
               </Typography>
               <Divider sx={{ 
                 mb: 3,
                 background: '#e0e0e0',
                 height: 1
               }} />
               <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                   Bill Description
                 </Typography>
                 <Typography variant="body1">
                   This is a detailed view of bill {selectedBill.billId}. The bill was generated on {selectedBill.date} and is currently in {selectedBill.status.toLowerCase()} status.
                 </Typography>
               </Box>
             </Box>
           </Box>
         )}
       </DialogContent>
       
       <Divider />
       
       <DialogActions sx={{ p: 2, gap: 2, background: '#f5f5f5' }}>
         <Button 
           onClick={handleViewBillClose}
           variant="outlined"
           sx={{ 
             borderRadius: 2, 
             textTransform: 'none',
             borderColor: '#ccc',
             color: '#666',
             fontWeight: 500,
             px: 3,
             py: 1,
             '&:hover': {
               borderColor: '#999',
               color: '#333',
               background: '#f0f0f0'
             }
           }}
         >
           Close
         </Button>
                   <Button 
            variant="contained"
            startIcon={<Download />}
            onClick={() => selectedBill && handleDownloadPDF(selectedBill)}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              backgroundColor: '#1976d2',
              fontWeight: 500,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Download PDF
          </Button>
       </DialogActions>
     </Dialog>
     </LocalizationProvider>
   );
 };

export default Bills;
