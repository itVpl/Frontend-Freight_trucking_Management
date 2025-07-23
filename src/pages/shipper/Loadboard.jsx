import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../../apiConfig';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputAdornment,
  Avatar
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Download, Search } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';

const LoadBoard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadType, setLoadType] = useState('OTR');
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    weight: '',
    containerNo: '',
    vehicleType: '',
    poNumber: '',
    commodity: '',
    bolNumber: '',
    pickupLocation: '',
    dropLocation: '',
    pickupDate: '',
    dropDate: '',
    price: '',
    returnDate: '',
    drayageLocation: '',
    rateType: '',
    bidDeadline: '',
    loadType: '',
  });

  // Naya state for errors
  const [errors, setErrors] = useState({});
  const [loadData, setLoadData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bidsModalOpen, setBidsModalOpen] = useState(false);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bids, setBids] = useState([]);
  const [selectedLoadId, setSelectedLoadId] = useState(null);

  const [bidDetailsModalOpen, setBidDetailsModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptForm, setAcceptForm] = useState({ status: 'Accepted', shipmentNumber: '', origin: { addressLine1: '', addressLine2: '' }, destination: { addressLine1: '', addressLine2: '' }, poNumber: '', bolNumber: '', message: '' });
  const [acceptBidId, setAcceptBidId] = useState(null);
  const [acceptErrors, setAcceptErrors] = useState({});

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // If response is an array, set directly. If object, wrap in array.
        let data = response.data;
        if (Array.isArray(data.loads)) {
          setLoadData(data.loads);
        } else {
          setLoadData([]);
        }
      } catch (err) {
        setLoadData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLoads();
  }, []);

  
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'posted':
        return 'info';
      case 'assigned':
        return 'warning';
      case 'in transit':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    alert('Form submit triggered');
    console.log('Form submit triggered', form);
    e.preventDefault();
    const newErrors = {};
    // Required fields ki list bana le, loadType ke hisaab se
    const requiredFields = [
      'weight', 'vehicleType', 'commodity', 'pickupLocation', 'dropLocation', 'pickupDate', 'dropDate', 'price'
    ];
    requiredFields.forEach(field => {
      if (!safeForm[field]) newErrors[field] = true;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Map form data to API fields
      const payload = {
        fromAddressLine1: safeForm.pickupLocation,
        fromAddressLine2: '',
        fromCity: safeForm.pickupLocation,
        fromState: '',
        toAddressLine1: safeForm.dropLocation,
        toAddressLine2: '',
        toCity: safeForm.dropLocation,
        toState: '',
        weight: Number(safeForm.weight),
        commodity: safeForm.commodity,
        vehicleType: safeForm.vehicleType,
        pickupDate: safeForm.pickupDate,
        deliveryDate: safeForm.dropDate,
        rate: Number(safeForm.price),
        rateType: safeForm.rateType,
        bidDeadline: safeForm.bidDeadline,
        loadType: safeForm.loadType,
        containerNo: safeForm.containerNo || '',
        poNumber: safeForm.poNumber || '',
        bolNumber: safeForm.bolNumber || ''
      };
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${BASE_API_URL}/api/v1/load/create`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alertify.success('Load created successfully!');
        handleCloseModal();
        // Refresh loads
        setLoading(true);
        const response = await axios.get(`${BASE_API_URL}/api/v1/load/shipper`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        let data = response.data;
        if (Array.isArray(data.loads)) {
          setLoadData(data.loads);
        } else {
          setLoadData([]);
        }
      } catch (err) {
        alertify.error(err.response?.data?.message || 'Failed to create load');
      }
    }
  };

  const handleViewBids = async (loadId) => {
    setSelectedLoadId(loadId);
    setBidsModalOpen(true);
    setBidsLoading(true);
    setBids([]);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_API_URL}/api/v1/bid/load/${loadId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (Array.isArray(response.data.bids)) {
        setBids(response.data.bids);
      } else {
        setBids([]);
      }
    } catch (err) {
      setBids([]);
    } finally {
      setBidsLoading(false);
    }
  };
  const handleCloseBidsModal = () => {
    setBidsModalOpen(false);
    setBids([]);
    setSelectedLoadId(null);
  };

  const handleViewBidDetails = (bid) => {
    setSelectedBid(bid);
    setBidDetailsModalOpen(true);
  };
  const handleCloseBidDetailsModal = () => {
    setBidDetailsModalOpen(false);
    setSelectedBid(null);
  };

  const handleAcceptBid = (bid) => {
    setAcceptBidId(bid._id);
    setAcceptForm({
      status: 'Accepted',
      shipmentNumber: bid.shipmentNumber || '',
      origin: { addressLine1: bid.origin?.addressLine1 || '', addressLine2: bid.origin?.addressLine2 || '' },
      destination: { addressLine1: bid.destination?.addressLine1 || '', addressLine2: bid.destination?.addressLine2 || '' },
      poNumber: bid.poNumber || '',
      bolNumber: bid.bolNumber || '',
      message: bid.message || ''
    });
    setAcceptModalOpen(true);
  };
  const handleCloseAcceptModal = () => {
    setAcceptModalOpen(false);
    setAcceptBidId(null);
  };
  const handleAcceptFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('origin.')) {
      setAcceptForm((prev) => ({ ...prev, origin: { ...prev.origin, [name.split('.')[1]]: value } }));
    } else if (name.startsWith('destination.')) {
      setAcceptForm((prev) => ({ ...prev, destination: { ...prev.destination, [name.split('.')[1]]: value } }));
    } else {
      setAcceptForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!acceptForm.shipmentNumber) newErrors.shipmentNumber = true;
    if (!acceptForm.origin.addressLine1) newErrors['origin.addressLine1'] = true;
    if (!acceptForm.destination.addressLine1) newErrors['destination.addressLine1'] = true;
    if (!acceptForm.poNumber) newErrors.poNumber = true;
    if (!acceptForm.bolNumber) newErrors.bolNumber = true;
    if (!acceptForm.reason) newErrors.reason = true;
    setAcceptErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alertify.error('Please fill in all required fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_API_URL}/api/v1/bid/${acceptBidId}/status`, {
        status: acceptForm.status,
        shipmentNumber: acceptForm.shipmentNumber,
        origin: acceptForm.origin,
        destination: acceptForm.destination,
        poNumber: acceptForm.poNumber,
        bolNumber: acceptForm.bolNumber,
        reason: acceptForm.reason
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBids((prev) => prev.map((bid) => bid._id === acceptBidId ? { ...bid, status: 'Accepted' } : bid));
      alertify.success('Bid accepted successfully!');
      setAcceptModalOpen(false);
      setAcceptBidId(null);
    } catch (err) {
      alertify.error(err.response?.data?.message || 'Failed to accept bid');
    }
  };

  // Search and filter logic
  const filteredData = loadData.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Export CSV function (Consignment.jsx style)
  const exportToCSV = () => {
    const headers = ['Load ID', 'Weight', 'Pick-Up', 'Drop', 'Vehicle', 'Bids', 'Status'];
    const csvRows = [headers.join(',')];
    loadData.forEach(row => {
      const values = [row.id, row.weight, row.pickup, row.drop, row.vehicle, row.bids, row.status];
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loadboard_data.csv';
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
          Load Board
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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenModal}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Load
          </Button>
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Shipment No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Pick-Up</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Drop</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bids</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">No data found</TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((load, i) => (
                  <TableRow key={load._id} hover>
                    <TableCell>{load._id}</TableCell>
                    <TableCell>{load.shipmentNumber}</TableCell>
                    <TableCell>{load.weight !== undefined && load.weight !== null && load.weight !== '' ? `${load.weight} Kg` : '-'}</TableCell>
                    <TableCell>{(load.origin && load.origin.city) ? load.origin.city : '-'}</TableCell>
                    <TableCell>{(load.destination && load.destination.city) ? load.destination.city : '-'}</TableCell>
                    <TableCell>{load.vehicleType || '-'}</TableCell>
                    <TableCell>{Array.isArray(load.bids) ? load.bids.length : (typeof load.bids === 'number' ? load.bids : 0)}</TableCell>
                    <TableCell>
                      <Chip label={load.status || '-'} color={getStatusColor(load.status || '')} size="small" />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => handleViewBids(load._id)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={loadData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </Paper>

      {/* Modal Form */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pb: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, px: 2 }}>
            {/* Tab Toggle */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }} justifyContent="center">
              <Button
                variant={loadType === 'OTR' ? 'contained' : 'outlined'}
                onClick={() => setLoadType('OTR')}
                sx={{ borderRadius: 5, minWidth: 120 }}
              >
                OTR
              </Button>
              <Button
                variant={loadType === 'Drayage' ? 'contained' : 'outlined'}
                onClick={() => setLoadType('Drayage')}
                sx={{ borderRadius: 5, minWidth: 120 }}
              >
                Drayage
              </Button>
            </Stack>

            {/* Grid Fields */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                ['Enter Weight', 'weight'],
                ['Container No', 'containerNo'],
                ['Vehicle/Equipment Type', 'vehicleType'],
                ['PO Number', 'poNumber'],
                ['Commodity', 'commodity'],
                ['BOL Number', 'bolNumber'],
                ['Pick-up Location', 'pickupLocation'],
                ['Drop Location', 'dropLocation'],
                ['Pick-up Date', 'pickupDate', false, 'date'],
                ['Drop Date', 'dropDate', false, 'date'],
                ...(loadType === 'Drayage'
                  ? [
                      ['Return Date', 'returnDate', false, 'date'],
                      ['Drayage Location', 'drayageLocation'],
                    ]
                  : []),
              ].map(([label, name, showIcon, type = 'text']) => (
                <Grid item xs={12} sm={6} key={name}>
                  <TextField
                    type={type}
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleFormChange}
                    fullWidth
                    // required hata diya
                    error={!!errors[name]}
                    InputLabelProps={type === 'date' ? { shrink: true } : {}}
                    sx={{
                      minWidth: '100%',
                      '& .MuiInputBase-root': {
                        borderRadius: '12px',
                        paddingRight: 3,
                      },
                      // Fix for date fields: ensure consistent font size and height
                      '& input[type="date"]': {
                        fontSize: '16px',
                        height: '1.4375em',
                        padding: '16.5px 14px',
                        width: '195px',
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Price */}
            <TextField
              label="Expected Price"
              name="price"
              value={form.price}
              onChange={handleFormChange}
              fullWidth
              // required hata diya
              error={!!errors.price}
              sx={{
                
                '& .MuiInputBase-root': {
                  borderRadius: '12px',
                  fontSize: '20px',
                  fontWeight: 600,
                  paddingY: 1.5,
                  width: '510px',
                },
                '& input': {
                  textAlign: 'center',
                },
              }}
            />

            {/* Buttons */}
            <DialogActions sx={{ mt: 4, justifyContent: 'center', gap: 1 }}>
              <Button
                onClick={handleCloseModal}
                variant="contained"
                sx={{
                  borderRadius: 3,
                  backgroundColor: '#f0f0f0',
                  color: '#000',
                  textTransform: 'none',
                  px: 4,
                  '&:hover': { backgroundColor: '#e0e0e0' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 4,
                }}
              >
                Submit
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Bids Modal */}
      <Dialog open={bidsModalOpen} onClose={handleCloseBidsModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          Bids for Load
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#fff' }}>
          {bidsLoading ? (
            <Typography align="center" sx={{ my: 4 }}>Loading...</Typography>
          ) : bids.length === 0 ? (
            <Typography align="center" sx={{ my: 4 }}>No bids found for this load.</Typography>
          ) : (
            <Grid container spacing={3} sx={{ minHeight: 400, alignItems: 'center', justifyContent: 'center' }}>
              {bids.map((bid, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={bid._id || i}>
                  <Box sx={{
                    background: '#eaf4fb',
                    borderRadius: 4,
                    boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: 260,
                  }}>
                    <Avatar
                      src={bid.bidder?.avatar || ''}
                      alt={bid.carrier?.compName || 'Trucker'}
                      sx={{ width: 70, height: 70, mb: 2, fontSize: 32, bgcolor: '#fff', color: '#1976d2', border: '2px solid #fff', boxShadow: 1 }}
                    >
                      {bid.carrier?.compName ?
                        (bid.carrier.compName.split(' ').map(w => w[0]).join('').toUpperCase()) :
                        <PersonIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                      }
                    </Avatar>
                    <Typography sx={{ fontWeight: 600, fontSize: 18, mb: 1, textAlign: 'center' }}>
                      {bid.carrier?.compName || 'Trucker'}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 2, color: '#222', textAlign: 'center' }}>
                      ${bid.intermediateRate?.toLocaleString() || '-'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center', mt: 'auto' }}>
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ borderRadius: 3, fontWeight: 600, px: 3, textTransform: 'none', fontSize: 15 }}
                        onClick={() => handleAcceptBid(bid)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ borderRadius: 3, fontWeight: 600, px: 3, textTransform: 'none', fontSize: 15, borderColor: '#222', color: '#222', '&:hover': { borderColor: '#1976d2', color: '#1976d2' } }}
                        onClick={() => handleViewBidDetails(bid)}
                      >
                        View details
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#fff' }}>
          <Button onClick={handleCloseBidsModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Bid Details Modal */}
      <Dialog open={bidDetailsModalOpen} onClose={handleCloseBidDetailsModal} maxWidth="xs" fullWidth PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 8,
          background: '#f8fafc',
        }
      }}>
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#1976d2',
          fontSize: 24,
          background: 'linear-gradient(90deg, #e3f0ff 60%, #dbeafe 100%)',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          py: 3,
          textAlign: 'center',
          letterSpacing: 1,
        }}>
          Bid Details
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          {selectedBid && (
            <Box sx={{
              background: '#fff',
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'flex-start',
              minWidth: 320,
            }}>
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Carrier Name</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#222', mt: 0.5 }}>{selectedBid.carrier?.compName || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Message</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.message || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2, width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Pickup ETA</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.estimatedPickupDate ? new Date(selectedBid.estimatedPickupDate).toLocaleString() : '-'}</Typography>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: 16 }}>Drop ETA</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: 16, color: '#333', mt: 0.5 }}>{selectedBid.estimatedDeliveryDate ? new Date(selectedBid.estimatedDeliveryDate).toLocaleString() : '-'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f8fafc', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          <Button onClick={handleCloseBidDetailsModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Accept Bid Modal */}
      <Dialog open={acceptModalOpen} onClose={handleCloseAcceptModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          Accept Bid
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          <Box component="form" onSubmit={handleAcceptSubmit}>
            <Grid container spacing={2} sx={{ mt: 1.5}}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Status"
                  name="status"
                  value={acceptForm.status}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Shipment Number"
                  name="shipmentNumber"
                  value={acceptForm.shipmentNumber}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors.shipmentNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Origin Address Line 1"
                  name="origin.addressLine1"
                  value={acceptForm.origin.addressLine1}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors['origin.addressLine1']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Origin Address Line 2"
                  name="origin.addressLine2"
                  value={acceptForm.origin.addressLine2}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Destination Address Line 1"
                  name="destination.addressLine1"
                  value={acceptForm.destination.addressLine1}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors['destination.addressLine1']}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Destination Address Line 2"
                  name="destination.addressLine2"
                  value={acceptForm.destination.addressLine2}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Po Number"
                  name="poNumber"
                  value={acceptForm.poNumber}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors.poNumber}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bol Number"
                  name="bolNumber"
                  value={acceptForm.bolNumber}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  error={!!acceptErrors.bolNumber}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Message"
                  name="reason"
                  value={acceptForm.reason}
                  onChange={handleAcceptFormChange}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={10}
                  placeholder="Write a message..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, width: '29rem' } }}
                  error={!!acceptErrors.reason}
                />
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3, p: 0 }}>
              <Button onClick={handleCloseAcceptModal} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2' }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }}>Accept</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoadBoard;
