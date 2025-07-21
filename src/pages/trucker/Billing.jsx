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
} from '@mui/material';
import { Receipt, Download, DateRange, Clear } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

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

  // Filter data based on date range
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const filtered = billingData.filter(bill => {
        const billDate = new Date(bill.date);
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
    const headers = ['Bill Id', 'Date', 'Amount', 'Status'];
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const values = [row.billId, row.date, row.amount, row.status];
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
      case 'pending': return 'error';
      case 'paid': return 'success';
      case 'overdue': return 'warning';
      default: return 'default';
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
                    renderInput={(params) => <TextField {...params} size="small" />}
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
                    renderInput={(params) => <TextField {...params} size="small" />}
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
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>View Detail</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((bill, i) => (
                  <TableRow key={i} hover sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                    <TableCell>{bill.billId}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={bill.status} color={getStatusColor(bill.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="text">View</Button>
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="text" startIcon={<Download />}>Download</Button>
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
    </LocalizationProvider>
  );
};

export default Dashboard;