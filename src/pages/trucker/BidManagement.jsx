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
  MenuItem,
  Autocomplete,
  Skeleton,
} from '@mui/material';
import { Receipt, Download, Search, Send } from '@mui/icons-material';
import alertify from 'alertifyjs';
import axios from 'axios';
import { BASE_API_URL } from '../../apiConfig';
import { useThemeConfig } from '../../context/ThemeContext';
import { useNegotiation } from '../../context/NegotiationContext';
import { useSocket } from '../../context/SocketContext';

const Dashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true); 
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bidForm, setBidForm] = useState({
    pickupETA: '',
    dropETA: '',
    bidAmount: '',
    message: '',
    driverName: '',
    vehicleNumber: '',
    vehicleType: ''
  });
  const [bidErrors, setBidErrors] = useState({});
  const [tab, setTab] = useState(0);
  const { themeConfig } = useThemeConfig();
  const brand = (themeConfig.header?.bg && themeConfig.header.bg !== 'white') ? themeConfig.header.bg : (themeConfig.tokens?.primary || '#1976d2');
  const headerTextColor = themeConfig.header?.text || '#ffffff';
  const [pendingBids, setPendingBids] = useState([]);
  const [acceptedBids, setAcceptedBids] = useState([]);
  const handleTabChange = (event, newValue) => setTab(newValue);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ driverId: '', vehicleNumber: '' });
  const [assignBidId, setAssignBidId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedBidDetails, setSelectedBidDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { addNotification, unreadBids, pollNegotiations } = useNegotiation();
  const { socket } = useSocket();
  const [negotiationHistory, setNegotiationHistory] = useState(null);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [negotiationLoading, setNegotiationLoading] = useState(false);

  const formatCityState = (obj) => {
    if (!obj) return '';
    const city = obj.city || '';
    const state = obj.state || '';
    if (!city && !state) return '';
    return `${city}${state ? `, ${state}` : ''}`;
  };

  const formatLatLng = (latLng) => {
    if (!latLng || (latLng.lat == null && latLng.lon == null)) return '';
    const lat = latLng.lat;
    const lon = latLng.lon;
    if (lat === 0 && lon === 0) return '';
    return `${lat.toFixed ? lat.toFixed(4) : lat}, ${lon.toFixed ? lon.toFixed(4) : lon}`;
  };

  const resolvePickupLocation = (row) => {
    // Prefer array structure
    if (row.origins && row.origins.length > 0) {
      const loc = formatCityState(row.origins[0]) || row.origins[0]?.addressLine1 || '';
      if (loc) return loc;
    }
    // Fallback: single origin object
    const single = formatCityState(row.origin) || row.origin?.addressLine1 || '';
    if (single) return single;
    // Fallback: tracking coordinates
    const coords = formatLatLng(row.tracking?.originLatLng);
    if (coords) return coords;
    return '-';
  };

  const resolveDropLocation = (row) => {
    if (row.destinations && row.destinations.length > 0) {
      const loc = formatCityState(row.destinations[0]) || row.destinations[0]?.addressLine1 || '';
      if (loc) return loc;
    }
    const single = formatCityState(row.destination) || row.destination?.addressLine1 || '';
    if (single) return single;
    const coords = formatLatLng(row.tracking?.destinationLatLng);
    if (coords) return coords;
    return '-';
  };

  // Function to format Load ID as "L-last 4 digits"
  const formatLoadId = (loadId) => {
    if (!loadId) return '-';
    const idString = loadId.toString();
    const last4Digits = idString.slice(-4);
    return `L-${last4Digits}`;
  };

  const handleViewDetails = async (bid) => {
    setLoadingDetails(true);
    setViewDetailsModalOpen(true);
    setNegotiationHistory(null);
    setNegotiationMessage('');

    try {
      const token = localStorage.getItem('token');
      const bidId = bid.bidId || bid._id;
      const response = await axios.get(`${BASE_API_URL}/api/v1/bid/accepted`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Find the specific bid from the response
      let specificBid = bid;
      if (Array.isArray(response.data.acceptedBids)) {
        specificBid = response.data.acceptedBids.find(
          b => (b.bidId || b._id) === bidId
        ) || bid;
      }
      setSelectedBidDetails(specificBid);

      // Fetch Negotiation History
      try {
        const negotiationResponse = await axios.get(`${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (negotiationResponse.data.success && negotiationResponse.data.data?.internalNegotiation) {
          setNegotiationHistory(negotiationResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching negotiation history:', err);
      }
    } catch (err) {
      console.error('Error fetching bid details:', err);
      setSelectedBidDetails(bid); // Fallback to the bid data we already have
      if (window.alertify) {
        window.alertify.error('Failed to fetch complete bid details');
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseViewDetailsModal = () => {
    setViewDetailsModalOpen(false);
    setSelectedBidDetails(null);
  };

  const handleAssignDriver = (bid) => {
    setAssignBidId(bid.bidId || bid._id);
    setAssignForm({ driverId: '', vehicleNumber: '' });
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
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.driverId || !assignForm.vehicleNumber) {
      if (window.alertify) {
        window.alertify.error('Please select driver and enter vehicle number');
      }
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Try to include origin/destination if backend expects them
      const currentBid = acceptedBids.find(b => (b.bidId || b._id) === assignBidId) || {};
      const parseCityState = (str) => {
        if (!str || str === '-' || typeof str !== 'string') return { city: '', state: '' };
        const parts = str.split(',').map(s => s.trim());
        return { city: parts[0] || '', state: parts[1] || '' };
      };
      const originText = resolvePickupLocation(currentBid);
      const destText = resolveDropLocation(currentBid);
      const originObj = parseCityState(originText);
      const destObj = parseCityState(destText);
      await axios.post(
        `${BASE_API_URL}/api/v1/bid/${assignBidId}/assign-driver`,
        {
          driverId: assignForm.driverId,
          vehicleNumber: assignForm.vehicleNumber,
          origin: originObj,
          destination: destObj,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (window.alertify) {
        window.alertify.success('Driver assigned successfully');
      }
      setAssignModalOpen(false);
      setAssignBidId(null);
      setAssignForm({ driverId: '', vehicleNumber: '' });
      // refresh accepted bids list
      try {
        const refresh = await axios.get(`${BASE_API_URL}/api/v1/bid/accepted`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAcceptedBids(Array.isArray(refresh.data.acceptedBids) ? refresh.data.acceptedBids : []);
      } catch (_) { console.error(_); }
    } catch (err) {
      if (window.alertify) {
        window.alertify.error(err.response?.data?.message || 'Failed to assign driver');
      }
    }
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
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_API_URL}/api/v1/driver/my-drivers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDrivers(Array.isArray(response.data) ? response.data : (response.data.drivers || []));
      } catch (err) {
        setDrivers([]);
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
      if (pollNegotiations) {
        pollNegotiations();
      }
    }
    fetchDrivers();
  }, [tab]);

  const bidData = tab === 0 ? pendingBids : acceptedBids;
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
    setBidForm({ pickupETA: '', dropETA: '', bidAmount: '', message: '', driverName: '', vehicleNumber: '', vehicleType: '' });
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
    if (!bidForm.driverName) newErrors.driverName = true;
    if (!bidForm.vehicleNumber) newErrors.vehicleNumber = true;
    if (!bidForm.vehicleType) newErrors.vehicleType = true;
    setBidErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alertify.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const bidData = {
        loadId: selectedLoad._id || selectedLoad.loadId,
        rate: parseFloat(bidForm.bidAmount),
        message: bidForm.message,
        estimatedPickupDate: bidForm.pickupETA.split('T')[0], // Extract date part only
        estimatedDeliveryDate: bidForm.dropETA.split('T')[0], // Extract date part only
        driverName: bidForm.driverName,
        driverPhone: '', // Always send blank
        vehicleNumber: bidForm.vehicleNumber,
        vehicleType: bidForm.vehicleType
      };

      const response = await axios.post(`${BASE_API_URL}/api/v1/bid/place`, bidData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        alertify.success('Bid submitted successfully!');
        handleCloseBidModal();
        // Refresh the data after successful bid submission
        if (tab === 0) {
          // Refresh pending bids
          const refreshResponse = await axios.get(`${BASE_API_URL}/api/v1/load/available`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (Array.isArray(refreshResponse.data.loads)) {
            setPendingBids(refreshResponse.data.loads);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      if (error.response?.data?.message) {
        alertify.error(error.response.data.message);
      } else {
        alertify.error('Failed to submit bid. Please try again.');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Load ID', 'From', 'To', 'ETA', 'Bid Status'];
    const csvRows = [headers.join(',')];

    pendingBids.forEach((row) => {
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

  const handleSendNegotiation = async () => {
    if (!negotiationMessage.trim()) return;
    
    setNegotiationLoading(true);
    try {
      const token = localStorage.getItem('token');
      const bidId = selectedBidDetails.bidId || selectedBidDetails._id;
      
      const response = await axios.put(`${BASE_API_URL}/api/v1/bid/${bidId}/trucker-internal-negotiate`, {
        message: negotiationMessage
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alertify.success('Message sent');

        setNegotiationMessage('');
        // Refresh history immediately
        const historyResponse = await axios.get(`${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (historyResponse.data.success && historyResponse.data.data?.internalNegotiation) {
          setNegotiationHistory(historyResponse.data.data);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alertify.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setNegotiationLoading(false);
    }
  };

  // Polling for negotiation history updates
  useEffect(() => {
    let interval;
    if (viewDetailsModalOpen && selectedBidDetails) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          const bidId = selectedBidDetails.bidId || selectedBidDetails._id;
          const response = await axios.get(`${BASE_API_URL}/api/v1/bid/${bidId}/internal-negotiation-thread`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success && response.data.data?.internalNegotiation) {
            setNegotiationHistory(prev => {
              const newHistory = response.data.data.internalNegotiation.history || [];
              const prevHistory = prev?.internalNegotiation?.history || [];
              
              if (newHistory.length > prevHistory.length) {
                // New messages found
                const newMessages = newHistory.slice(prevHistory.length);
                // Note: Notification is now handled globally in NegotiationContext
                // We just return the new data to update the UI
                return response.data.data;
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Error polling negotiation history:', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [viewDetailsModalOpen, selectedBidDetails, addNotification]);

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
                <TableRow sx={{ backgroundColor: (themeConfig.table?.headerBg || '#f0f4f8') }}>
                  <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>shipper Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pickup</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Drop</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Shipment Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ETA</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Bid Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Loading...</TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} /></TableCell>
                    </TableRow>
                  ))
                ) : pendingBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No available loads found</TableCell>
                  </TableRow>
                ) : (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row._id || i}
                        hover
                        sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <TableCell>{formatLoadId(row._id || row.loadId)}</TableCell>
                        <TableCell>{row.shipper?.compName || row.shipperName || '-'}</TableCell>
                        <TableCell>
                          {row.origins && row.origins.length > 0 
                            ? `${row.origins[0].city || ''}${row.origins[0].state ? `, ${row.origins[0].state}` : ''}` 
                            : (row.origin?.city || row.from || '-')
                          }
                        </TableCell>
                        <TableCell>
                          {row.destinations && row.destinations.length > 0 
                            ? `${row.destinations[0].city || ''}${row.destinations[0].state ? `, ${row.destinations[0].state}` : ''}` 
                            : (row.destination?.city || row.to || '-')
                          }
                        </TableCell>
                                                <TableCell>{row.shipper?.loadType || row.loadType || '-'}</TableCell>

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
              count={filteredData.length}
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
                <TableRow sx={{ backgroundColor: (themeConfig.table?.headerBg || '#f0f4f8') }}>
                  <TableCell sx={{ fontWeight: 600 }}>Shipment No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pickup Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Drop Location</TableCell>
                   {/* <TableCell sx={{ fontWeight: 600 }}>Shipment Type</TableCell> */}
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
                ) : filteredData.length === 0 ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      {/* <TableCell><Skeleton variant="text" width={100} /></TableCell> */}
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} /></TableCell>
                    </TableRow>
                  ))
                ) : acceptedBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No accepted bids found</TableCell>
                  </TableRow>
                ) : (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, i) => (
                      <TableRow
                        key={row._id || i}
                        hover
                        sx={{ transition: '0.3s', '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <TableCell>{row.shipmentNumber}</TableCell>
                        <TableCell>{resolvePickupLocation(row)}</TableCell>
                        <TableCell>{resolveDropLocation(row)}</TableCell>
                        {/* <TableCell>{row.loadType}</TableCell> */}
                        <TableCell>{row.pickupDate ? new Date(row.pickupDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <Chip label={row.status} color="success" />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ textTransform: 'none', fontSize: '0.75rem', px: 2, mr: 1, position: 'relative' }}
                            onClick={() => handleViewDetails(row)}
                          >
                            View Details
                            {unreadBids.has(row._id || row.bidId) && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -4,
                                    right: -4,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'error.main',
                                    borderRadius: '50%',
                                    border: '2px solid white'
                                  }}
                                />
                            )}
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
              count={filteredData.length}
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
        <DialogTitle sx={{ textAlign: 'left', color: headerTextColor }}>
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
                      <TableCell>
                        {selectedLoad.origins && selectedLoad.origins.length > 0 
                          ? `${selectedLoad.origins[0].city || ''}${selectedLoad.origins[0].state ? `, ${selectedLoad.origins[0].state}` : ''}` 
                          : (selectedLoad.origin?.city || '-')
                        }
                      </TableCell>
                      <TableCell>
                        {selectedLoad.destinations && selectedLoad.destinations.length > 0 
                          ? `${selectedLoad.destinations[0].city || ''}${selectedLoad.destinations[0].state ? `, ${selectedLoad.destinations[0].state}` : ''}` 
                          : (selectedLoad.destination?.city || '-')
                        }
                      </TableCell>
                      <TableCell>{selectedLoad.weight ? `${selectedLoad.weight} Kg` : '-'}</TableCell>
                      <TableCell>{selectedLoad.commodity || '-'}</TableCell>
                      <TableCell>{selectedLoad.vehicleType || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

                                            {/* Bid Form */}
               <Box sx={{ mt: 3 }}>
                 {/* Row 1: Pickup ETA, Drop ETA, Bid Amount */}
                 <Grid container spacing={3} sx={{ mb: 3 }}>
                   <Grid item xs={12} md={4}>
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
                           borderRadius: 2,
                           backgroundColor: '#fafafa',
                           '&:hover': {
                             backgroundColor: '#f5f5f5',
                           },
                           '&.Mui-focused': {
                             backgroundColor: '#fff',
                           },
                         },
                         '& .MuiInputLabel-root': {
                           fontWeight: 500,
                           color: '#666',
                         },
                       }}
                     />
                   </Grid>
                   <Grid item xs={12} md={4}>
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
                           borderRadius: 2,
                           backgroundColor: '#fafafa',
                           '&:hover': {
                             backgroundColor: '#f5f5f5',
                           },
                           '&.Mui-focused': {
                             backgroundColor: '#fff',
                           },
                         },
                         '& .MuiInputLabel-root': {
                           fontWeight: 500,
                           color: '#666',
                         },
                       }}
                     />
                   </Grid>
                   <Grid item xs={12} md={4}>
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
                           borderRadius: 2,
                           backgroundColor: '#fafafa',
                           '&:hover': {
                             backgroundColor: '#f5f5f5',
                           },
                           '&.Mui-focused': {
                             backgroundColor: '#fff',
                           },
                         },
                         '& .MuiInputLabel-root': {
                           fontWeight: 500,
                           color: '#666',
                         },
                       }}
                     />
                   </Grid>
                 </Grid>

                 {/* Divider */}
                 <Box sx={{ 
                   borderBottom: '2px solid #e0e0e0', 
                   mb: 3,
                   mx: -2,
                   opacity: 0.6
                 }} />

                                   {/* Row 2: Driver Name, Vehicle Number, Vehicle Type */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Driver Name"
                        name="driverName"
                        value={bidForm.driverName}
                        onChange={handleBidFormChange}
                        fullWidth
                        required
                        error={!!bidErrors.driverName}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fafafa',
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#fff',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontWeight: 500,
                            color: '#666',
                          },
                        }}
                      />
                    </Grid>
                                         <Grid item xs={12} md={6}>
                       <TextField
                         label="Vehicle Number"
                         name="vehicleNumber"
                         value={bidForm.vehicleNumber}
                         onChange={handleBidFormChange}
                         fullWidth
                         required
                         error={!!bidErrors.vehicleNumber}
                         sx={{
                           '& .MuiOutlinedInput-root': {
                             borderRadius: 2,
                             backgroundColor: '#fafafa',
                             '&:hover': {
                               backgroundColor: '#f5f5f5',
                             },
                             '&.Mui-focused': {
                               backgroundColor: '#fff',
                             },
                           },
                           '& .MuiInputLabel-root': {
                             fontWeight: 500,
                             color: '#666',
                           },
                         }}
                       />
                     </Grid>
                     <Grid item xs={12} md={6}>
                       <TextField
                         label="Vehicle Type"
                         name="vehicleType"
                         value={bidForm.vehicleType}
                         onChange={handleBidFormChange}
                         fullWidth
                         required
                         error={!!bidErrors.vehicleType}
                         sx={{
                           '& .MuiOutlinedInput-root': {
                             borderRadius: 2,
                             backgroundColor: '#fafafa',
                             '&:hover': {
                               backgroundColor: '#f5f5f5',
                             },
                             '&.Mui-focused': {
                               backgroundColor: '#fff',
                             },
                           },
                           '& .MuiInputLabel-root': {
                             fontWeight: 500,
                             color: '#666',
                           },
                         }}
                       />
                     </Grid>
                  </Grid>

                 {/* Divider */}
                 <Box sx={{ 
                   borderBottom: '2px solid #e0e0e0', 
                   mb: 3,
                   mx: -2,
                   opacity: 0.6
                 }} />

                 {/* Row 3: Message */}
                 <Grid container spacing={3}>
                   <Grid item xs={12}>
                     <TextField
                       label="Message"
                       name="message"
                       value={bidForm.message || ''}
                       onChange={handleBidFormChange}
                       fullWidth
                       multiline
                       rows={2}
                       placeholder="Write a message for the shipper..."
                       error={!!bidErrors.message}
                       sx={{
                         '& .MuiOutlinedInput-root': {
                           borderRadius: 2,
                           backgroundColor: '#fafafa',
                           '&:hover': {
                             backgroundColor: '#f5f5f5',
                           },
                           '&.Mui-focused': {
                             backgroundColor: '#fff',
                           },
                         },
                         '& .MuiInputLabel-root': {
                           fontWeight: 500,
                           color: '#666',
                         },
                         '& .MuiInputBase-input': {
                           padding: '16px 14px',
                         },
                       }}
                     />
                   </Grid>
                 </Grid>
               </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, background: '#fff' }}>
          <Button
            onClick={handleCloseBidModal}
            variant="outlined"
            sx={{ borderRadius: 3, backgroundColor: '#ffff', color: '#d32f2f', textTransform: 'none', px: 4, borderColor: '#d32f2f' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBidSubmit}
            type="submit"
            variant="contained"
            color="primary"
           sx={{ borderRadius: 3, textTransform: 'none', px: 4 }}
          >
            Submit Bid
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog 
        open={viewDetailsModalOpen} 
        onClose={handleCloseViewDetailsModal} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '75vh',
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          pt: 2,
          px: 3,
          background: brand,
          color: headerTextColor,
          borderRadius: '8px 8px 0 0',
          minHeight: 64
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Receipt sx={{ fontSize: 28, color: headerTextColor }} />
            <Typography variant="h5" fontWeight={600} color={headerTextColor}>
              Bid Details
            </Typography>
          </Box>
          <Button
            onClick={handleCloseViewDetailsModal}
            sx={{
              color: 'white',
              minWidth: 'auto',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            ✕
          </Button>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2, overflowY: 'auto', flex: 1 }}>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography>Loading bid details...</Typography>
            </Box>
          ) : selectedBidDetails ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Information Card */}
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e3f2fd' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    i
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="#0d47a1">Basic Information</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: 220, color: 'text.secondary' }}>Shipment Number</TableCell>
                        <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{selectedBidDetails.shipmentNumber || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                        <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                        <TableCell>
                          <Chip 
                            label={selectedBidDetails.status || 'Accepted'} 
                            size="small"
                            sx={{ 
                              backgroundColor: '#4caf50',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: 11
                            }}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary' }}>Pickup Date</TableCell>
                        <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {selectedBidDetails.pickupDate ? new Date(selectedBidDetails.pickupDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary' }}>Delivery Date</TableCell>
                        <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {selectedBidDetails.deliveryDate ? new Date(selectedBidDetails.deliveryDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Paper>

              {/* Shipment Information Card */}
              <Paper elevation={0} sx={{ border: '1px solid #c8e6c9', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e8f5e9' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#2e7d32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    📍
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="#1b5e20">Shipment Information</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ width: 220, color: 'text.secondary' }}>Pickup Location</TableCell>
                        <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{resolvePickupLocation(selectedBidDetails)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary' }}>Drop Location</TableCell>
                        <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{resolveDropLocation(selectedBidDetails)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Paper>

              {/* Load Details Card */}
              {(selectedBidDetails.weight || selectedBidDetails.commodity || selectedBidDetails.vehicleType) && (
                <Paper elevation={0} sx={{ border: '1px solid #b2dfdb', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e0f2f1' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#00897b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      📦
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#00695c">Load Details</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        {selectedBidDetails.weight && (
                          <TableRow>
                            <TableCell sx={{ width: 220, color: 'text.secondary' }}>Weight</TableCell>
                            <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{selectedBidDetails.weight} Kg</TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.commodity && (
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Commodity</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{selectedBidDetails.commodity}</TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.vehicleType && (
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Vehicle Type</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{selectedBidDetails.vehicleType}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              )}

              {/* Driver Information Card */}
              {(selectedBidDetails.driverName || selectedBidDetails.driverPhone || selectedBidDetails.vehicleNumber) && (
                <Paper elevation={0} sx={{ border: '1px solid #ce93d8', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#f3e5f5' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#6a1b9a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      🧑‍✈️
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#4a148c">Driver Information</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Table size="small" sx={{ '& td, & th': { border: 0, py: 1.2 } }}>
                      <TableBody>
                        {selectedBidDetails.driverName && (
                          <TableRow>
                            <TableCell sx={{ width: 220, color: 'text.secondary' }}>Driver Name</TableCell>
                            <TableCell sx={{ width: 80, color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{selectedBidDetails.driverName}</TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.driverPhone && (
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Driver Phone</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{selectedBidDetails.driverPhone}</TableCell>
                          </TableRow>
                        )}
                        {selectedBidDetails.vehicleNumber && (
                          <TableRow>
                            <TableCell sx={{ color: 'text.secondary' }}>Vehicle Number</TableCell>
                            <TableCell sx={{ color: '#9e9e9e' }}>-----</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{selectedBidDetails.vehicleNumber}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              )}

              {/* Negotiation History Card */}
              <Paper elevation={0} sx={{ border: '1px solid #90caf9', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, background: '#e3f2fd' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, background: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    💬
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="#0d47a1">Negotiation History</Typography>
                </Box>
                <Box sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
                  {negotiationHistory?.internalNegotiation?.history?.length > 0 ? (
                    negotiationHistory.internalNegotiation.history.map((msg, index) => (
                      <Box key={index} sx={{ mb: 1.5, p: 1.5, bgcolor: (msg.by || '').toLowerCase().includes('shipper') ? '#f5f5f5' : '#e3f2fd', borderRadius: 2, maxWidth: '90%', ml: (msg.by || '').toLowerCase().includes('shipper') ? 0 : 'auto' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          {msg.by} • {new Date(msg.at).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.message}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No negotiation history found.
                    </Typography>
                  )}
                </Box>
                <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={negotiationMessage}
                    onChange={(e) => setNegotiationMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendNegotiation()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendNegotiation}
                    disabled={negotiationLoading || !negotiationMessage.trim()}
                  >
                    Send
                  </Button>
                </Box>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Typography>No details available</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Driver Modal */}
      <Dialog open={assignModalOpen} onClose={handleCloseAssignModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1976d2', fontSize: 22, borderBottom: '1px solid #e0e0e0' }}>
          Assign Driver
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3, background: '#f8fafc' }}>
          <Box component="form" onSubmit={handleAssignSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={drivers}
                  getOptionLabel={(d) => d?.fullName || d?.name || d?.email || 'Driver'}
                  value={drivers.find((d) => d._id === assignForm.driverId) || null}
                  onChange={(e, newVal) => setAssignForm((prev) => ({ ...prev, driverId: newVal?._id || '' }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Driver Name"
                      size="medium"
                    />
                  )}
                  sx={{
                    width: '180px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={assignForm.vehicleNumber}
                  onChange={handleAssignFormChange}
                  fullWidth
                  size="medium"
                  sx={{
                    width: '180px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                    }
                  }}
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
