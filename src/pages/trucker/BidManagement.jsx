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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { Receipt, Download, Search, Send } from '@mui/icons-material';
import axios from 'axios';
import { BASE_API_URL } from '../../apiConfig';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [bidData, setBidData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bidForm, setBidForm] = useState({
    pickupETA: '',
    dropETA: '',
    bidAmount: '',
    message: ''
  });
  const [bidErrors, setBidErrors] = useState({});
  const [tab, setTab] = useState(0);
  const [pendingBids, setPendingBids] = useState([]);
  const [acceptedBids, setAcceptedBids] = useState([]);
  const handleTabChange = (event, newValue) => setTab(newValue);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ driverId: '', vehicleNumber: '', vehicleType: '' });
  const [assignBidId, setAssignBidId] = useState(null);

  const handleAssignDriver = (bid) => {
    setAssignBidId(bid.bidId || bid._id);
    setAssignForm({ driverId: '', vehicleNumber: '', vehicleType: bid.vehicleType || '' });
    setAssignModalOpen(true);
  };
  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setAssignBidId(null);
  };
  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAssignSubmit = (e) => {
    e.preventDefault();
    // TODO: API call to assign driver
    setAssignModalOpen(false);
    setAssignBidId(null);
  };

  useEffect(() => {
    const fetchAvailableLoads = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_API_URL}/api/v1/load/available`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (Array.isArray(response.data.loads)) {
          setPendingBids(response.data.loads);
        } else {
          setPendingBids([]);
        }
      } catch (err) {
        setPendingBids([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchAcceptedBids = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_API_URL}/api/v1/bid/accepted`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (Array.isArray(response.data.acceptedBids)) {
          setAcceptedBids(response.data.acceptedBids);
        } else {
          setAcceptedBids([]);
        }
      } catch (err) {
        setAcceptedBids([]);
      } finally {
        setLoading(false);
      }
    };
    if (tab === 0) {
      fetchAvailableLoads();
    } else if (tab === 1) {
      fetchAcceptedBids();
    }
  }, [tab]);

  const filteredData = bidData.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBidNow = (load) => {
    setSelectedLoad(load);
    setBidModalOpen(true);
  };

  const handleCloseBidModal = () => {
    setBidModalOpen(false);
    setSelectedLoad(null);
    setBidForm({ pickupETA: '', dropETA: '', bidAmount: '', message: '' });
    setBidErrors({});
  };

  const handleBidFormChange = (e) => {
    setBidForm({
      ...bidForm,
      [e.target.name]: e.target.value
    });
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!bidForm.pickupETA) newErrors.pickupETA = true;
    if (!bidForm.dropETA) newErrors.dropETA = true;
    if (!bidForm.bidAmount) newErrors.bidAmount = true;
    if (!bidForm.message) newErrors.message = true;
    setBidErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alertify.error('Please fill in all required fields');
      return;
    }
    // TODO: Implement bid submission API
    console.log('Bid submitted:', { load: selectedLoad, bid: bidForm });
    alertify.success('Bid submitted successfully!');
    handleCloseBidModal();
  };

  const exportToCSV = () => {
    const headers = ['Load ID', 'From', 'To', 'ETA', 'Bid Status'];
    const csvRows = [headers.join(',')];

    driverData.forEach((row) => {
      const values = [
        row.loadId,
        row.from,
        row.to,
        row.eta,
        row.status,
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bid_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
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
        <Typography variant="h5" fontWeight={700}>
          Bid Overview
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
         <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        </Stack>
      </Box>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Pending Bids" />
        <Tab label="Accepted Bids" />
      </Tabs>
      {tab === 0 && (
        <Box>
          {/* Pending Bids Table */}
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>shipper Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ETA</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Bid Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Loading...</TableCell>
                  </TableRow>
                ) : pendingBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No available loads found</TableCell>
                  </TableRow>
                ) : (
                  pendingBids
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row._id || i}
                        hover
                        sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <TableCell>{row._id || row.loadId || '-'}</TableCell>
                        <TableCell>{row.shipper?.compName || row.shipperName || '-'}</TableCell>
                        <TableCell>{row.origin?.city || row.from || '-'}</TableCell>
                        <TableCell>{row.destination?.city || row.to || '-'}</TableCell>
                        <TableCell>{row.pickupDate ? new Date(row.pickupDate).toLocaleDateString() : (row.eta || '-')}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<Send />}
                            onClick={() => handleBidNow(row)}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', px: 2 }}
                          >
                            Bid Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={pendingBids.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 15, 20]}
            />
          </Paper>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          {/* Accepted Bids Table (API integration to be added) */}
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Shipment No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pickup Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Drop Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Loading...</TableCell>
                  </TableRow>
                ) : acceptedBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No accepted bids found</TableCell>
                  </TableRow>
                ) : (
                  acceptedBids
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row._id || i}
                        hover
                        sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <TableCell>{row.shipmentNumber}</TableCell>
                        <TableCell>{row.origin?.city}</TableCell>
                        <TableCell>{row.destination?.city}</TableCell>
                        <TableCell>{row.pickupDate}</TableCell>
                        <TableCell>{row.deliveryDate}</TableCell>
                        <TableCell>
                          <Chip label={row.status} color="success" />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ textTransform: 'none', fontSize: '0.75rem', px: 2, mr: 1 }}
                            // onClick={() => handleViewDetails(row)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            sx={{ textTransform: 'none', fontSize: '0.75rem', px: 2 }}
                            onClick={() => handleAssignDriver(row)}
                          >
                            Assign Driver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={acceptedBids.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 15, 20]}
            />
          </Paper>
        </Box>
      )}

      {/* Bid Modal */}
      <Dialog open={bidModalOpen} onClose={handleCloseBidModal} maxWidth="md" fullWidth PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 8,
          background: '#fff',
        }
      }}>
        <DialogTitle sx={{
          textAlign: 'left',
          fontWeight: 700,
          fontSize: 26,
          color: '#1976d2',
          borderBottom: '1px solid #e0e0e0',
          pb: 2,
          mb: 2,
        }}>
          Place Your Bid
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#fff' }}>
          {selectedLoad && (
            <Box component="form" onSubmit={handleBidSubmit}>
              {/* Load Details Table */}
              <Paper elevation={0} sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                background: '#f8fafc',
                boxShadow: '0 1px 6px rgba(25, 118, 210, 0.06)'
              }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Pickup</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Drop</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Commodity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Vehicle Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{selectedLoad.origin?.city || '-'}</TableCell>
                      <TableCell>{selectedLoad.destination?.city || '-'}</TableCell>
                      <TableCell>{selectedLoad.weight ? `${selectedLoad.weight} Kg` : '-'}</TableCell>
                      <TableCell>{selectedLoad.commodity || '-'}</TableCell>
                      <TableCell>{selectedLoad.vehicleType || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              {/* Bid Form */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Pickup ETA"
                    name="pickupETA"
                    type="datetime-local"
                    value={bidForm.pickupETA}
                    onChange={handleBidFormChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    error={!!bidErrors.pickupETA}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Drop ETA"
                    name="dropETA"
                    type="datetime-local"
                    value={bidForm.dropETA}
                    onChange={handleBidFormChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    error={!!bidErrors.dropETA}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bid Amount"
                    name="bidAmount"
                    type="number"
                    value={bidForm.bidAmount}
                    onChange={handleBidFormChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    error={!!bidErrors.bidAmount}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Message"
                    name="message"
                    value={bidForm.message || ''}
                    onChange={handleBidFormChange}
                    fullWidth
                    multiline
                    minRows={5}
                    maxRows={5}
                    placeholder="Write a message for the shipper..."
                    error={!!bidErrors.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        height: '80px',
                        width: '48rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, background: '#fff' }}>
          <Button
            onClick={handleCloseBidModal}
            variant="outlined"
            sx={{
              px: 4, py: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              color: '#1976d2',
              borderColor: '#1976d2',
              background: '#fff',
              '&:hover': {
                background: '#e3f0ff',
                borderColor: '#1565c0',
                color: '#1565c0',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBidSubmit}
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              px: 4, py: 1,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 16,
              background: '#1976d2',
              textTransform: 'none',
              letterSpacing: 1,
              '&:hover': {
                background: '#1565c0',
              },
            }}
          >
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Driver Modal */}
      <Dialog open={assignModalOpen} onClose={handleCloseAssignModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          Assign Driver
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          <Box component="form" onSubmit={handleAssignSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Driver ID"
                  name="driverId"
                  value={assignForm.driverId}
                  onChange={handleAssignFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={assignForm.vehicleNumber}
                  onChange={handleAssignFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Vehicle Type"
                  name="vehicleType"
                  value={assignForm.vehicleType}
                  onChange={handleAssignFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3, p: 0 }}>
              <Button onClick={handleCloseAssignModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }}>Assign</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;