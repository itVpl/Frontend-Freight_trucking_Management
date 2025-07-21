import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Receipt,
  AttachMoney,
  Schedule,
  CheckCircle,
  Warning,
  Pending,
  Visibility,
  Download,
  Payment,
  AccountBalance,
  LocalShipping,
} from '@mui/icons-material';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Mock bills data
    setBills([
      {
        id: 1,
        billNumber: 'BILL-001',
        carrierName: 'ABC Trucking',
        consignmentNumber: 'CN-001',
        amount: 25000,
        dueDate: '2024-03-25',
        status: 'pending',
        description: 'Mumbai to Delhi - Electronics',
        items: [
          { description: 'Transportation Charges', quantity: 1, rate: 20000, amount: 20000 },
          { description: 'Loading Charges', quantity: 1, rate: 2000, amount: 2000 },
          { description: 'Unloading Charges', quantity: 1, rate: 3000, amount: 3000 },
        ],
        issuedDate: '2024-03-20',
        paymentTerms: 'Net 30',
        gstNumber: '27ABCDE1234F1Z5',
        carrierRating: 4.8,
      },
      {
        id: 2,
        billNumber: 'BILL-002',
        carrierName: 'XYZ Transport',
        consignmentNumber: 'CN-002',
        amount: 18000,
        dueDate: '2024-03-28',
        status: 'paid',
        description: 'Delhi to Bangalore - Textiles',
        items: [
          { description: 'Transportation Charges', quantity: 1, rate: 15000, amount: 15000 },
          { description: 'Loading Charges', quantity: 1, rate: 1500, amount: 1500 },
          { description: 'Unloading Charges', quantity: 1, rate: 1500, amount: 1500 },
        ],
        issuedDate: '2024-03-21',
        paymentTerms: 'Net 30',
        gstNumber: '27ABCDE1234F1Z5',
        paidDate: '2024-03-22',
        carrierRating: 4.6,
      },
      {
        id: 3,
        billNumber: 'BILL-003',
        carrierName: 'PQR Logistics',
        consignmentNumber: 'CN-003',
        amount: 32000,
        dueDate: '2024-03-30',
        status: 'overdue',
        description: 'Bangalore to Chennai - Machinery',
        items: [
          { description: 'Transportation Charges', quantity: 1, rate: 25000, amount: 25000 },
          { description: 'Loading Charges', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'Unloading Charges', quantity: 1, rate: 4000, amount: 4000 },
        ],
        issuedDate: '2024-03-22',
        paymentTerms: 'Net 30',
        gstNumber: '27ABCDE1234F1Z5',
        carrierRating: 4.4,
      },
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle color="success" />;
      case 'pending':
        return <Pending color="warning" />;
      case 'overdue':
        return <Warning color="error" />;
      default:
        return <Receipt />;
    }
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setOpenDialog(true);
  };

  const handlePayBill = (billId) => {
    // In real app, this would open payment gateway
    setBills(bills.map(bill => 
      bill.id === billId ? { ...bill, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : bill
    ));
  };

  const filteredBills = bills.filter(bill => {
    if (tabValue === 0) return bill.status === 'pending';
    if (tabValue === 1) return bill.status === 'paid';
    if (tabValue === 2) return bill.status === 'overdue';
    return true;
  });

  const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Bills & Payments
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Pending color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                ₹{(totalPending / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bills.filter(b => b.status === 'pending').length} bills
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Paid</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ₹{(totalPaid / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bills.filter(b => b.status === 'paid').length} bills
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Overdue</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                ₹{(totalOverdue / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bills.filter(b => b.status === 'overdue').length} bills
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ₹{((totalPending + totalPaid + totalOverdue) / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bills.length} bills
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Pending" />
          <Tab label="Paid" />
          <Tab label="Overdue" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredBills.map((bill) => (
          <Grid item xs={12} md={6} lg={4} key={bill.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    {bill.billNumber}
                  </Typography>
                  <Box>
                    <Chip
                      label={bill.status.toUpperCase()}
                      color={getStatusColor(bill.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Tooltip title="View Bill">
                      <IconButton size="small" onClick={() => handleViewBill(bill)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {bill.description}
                </Typography>

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LocalShipping color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Carrier"
                      secondary={bill.carrierName}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AttachMoney color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Amount"
                      secondary={`₹${bill.amount.toLocaleString()}`}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Schedule color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Due Date"
                      secondary={bill.dueDate}
                    />
                  </ListItem>

                  {bill.status === 'paid' && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Payment color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Paid Date"
                        secondary={bill.paidDate}
                      />
                    </ListItem>
                  )}

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Carrier Rating"
                      secondary={`${bill.carrierRating}/5`}
                    />
                  </ListItem>
                </List>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                  >
                    Download
                  </Button>
                  {bill.status === 'pending' && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Payment />}
                      onClick={() => handlePayBill(bill.id)}
                    >
                      Pay Now
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredBills.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No bills found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 && 'No pending bills.'}
            {tabValue === 1 && 'No paid bills.'}
            {tabValue === 2 && 'No overdue bills.'}
          </Typography>
        </Paper>
      )}

      {/* View Bill Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Bill Details - {selectedBill?.billNumber}
        </DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Carrier</Typography>
                  <Typography variant="body1">{selectedBill.carrierName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Consignment</Typography>
                  <Typography variant="body1">{selectedBill.consignmentNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1">₹{selectedBill.amount.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                  <Typography variant="body1">{selectedBill.dueDate}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedBill.status.toUpperCase()}
                    color={getStatusColor(selectedBill.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Carrier Rating</Typography>
                  <Typography variant="body1">{selectedBill.carrierRating}/5</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedBill.description}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2 }}>Bill Items</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBill.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.rate.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1"><strong>Total</strong></Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1"><strong>₹{selectedBill.amount.toLocaleString()}</strong></Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedBill?.status === 'pending' && (
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={() => {
                handlePayBill(selectedBill.id);
                setOpenDialog(false);
              }}
            >
              Pay Bill
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills; 