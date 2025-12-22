import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from '@mui/material';
import { Receipt, Download, Search, Clear, Close, Visibility, ExpandMore, Print, GetApp, LocationOn, LocalShipping, Assignment, Chat, Info, AttachMoney, Description, TrackChanges, Business, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeConfig } from '../../context/ThemeContext';
import { BASE_API_URL } from '../../apiConfig';
import SearchNavigationFeedback from '../../components/SearchNavigationFeedback';
import LoadLocationMap from './LoadLocationMap';

const Consignment = () => {
  const location = useLocation();
  const { user, userType } = useAuth();
  const { themeConfig } = useThemeConfig();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadsData, setLoadsData] = useState([]);
  const [originalLoadsData, setOriginalLoadsData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [activeTab, setActiveTab] = useState('Load Info');
  const [loadDetails, setLoadDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  
  // Handle search result from universal search
  useEffect(() => {
    if (location.state?.selectedShipment) {
      const shipment = location.state.selectedShipment;
      setSearchTerm(shipment.shipmentNumber || '');
      console.log('Navigated from search:', shipment);
      
      // Filter to show only the searched shipment
      if (originalLoadsData.length > 0) {
        const filteredShipment = originalLoadsData.find(load => 
          load.shipmentNumber === shipment.shipmentNumber ||
          load._id === shipment.id
        );
        
        if (filteredShipment) {
          // Set the filtered data to show only this shipment
          setLoadsData([filteredShipment]);
          setIsFiltered(true);
        }
      }
    }
  }, [location.state, originalLoadsData]);

  // Clear search filter
  const clearSearchFilter = () => {
    setLoadsData(originalLoadsData);
    setIsFiltered(false);
    setSearchTerm('');
  };

  // Fetch loads data based on user type
  useEffect(() => {
    const fetchLoadsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        let apiUrl;
        if (userType === 'trucker') {
          apiUrl = `${BASE_API_URL}/api/v1/load/trucker/my-loads-detailed`;
        } else if (userType === 'shipper') {
          apiUrl = `${BASE_API_URL}/api/v1/load/shipper/my-loads-detailed`;
        } else {
          throw new Error('Invalid user type');
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.success && data.data && data.data.loads) {
          setLoadsData(data.data.loads);
          setOriginalLoadsData(data.data.loads); // Store original data
        } else if (data.success && Array.isArray(data.data)) {
          // Handle case where data.data is directly an array
          setLoadsData(data.data);
          setOriginalLoadsData(data.data);
        } else if (Array.isArray(data)) {
          // Handle case where response is directly an array
          setLoadsData(data);
          setOriginalLoadsData(data);
        } else {
          console.warn('Unexpected API response format:', data);
          setLoadsData([]);
          setOriginalLoadsData([]);
        }
      } catch (err) {
        console.error('Error fetching loads data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && userType) {
      fetchLoadsData();
    }
  }, [user, userType]);

  // Transform API data to table format with error handling
  const transformedData = loadsData.map((load) => {
    try {
      // Helper function to get pickup location
      const getPickupLocation = () => {
        if (load.origins && load.origins.length > 0) {
          const origin = load.origins[0]; // Take first origin
          return `${origin.city || 'N/A'}, ${origin.state || 'N/A'}`;
        } else if (load.originPlace?.location) {
          return load.originPlace.location;
        } else if (load.destination?.city) {
          // Fallback to destination city if origin not available
          return `${load.destination.city || 'N/A'}, ${load.destination.state || 'N/A'}`;
        }
        return 'N/A';
      };

      // Helper function to get drop location
      const getDropLocation = () => {
        if (load.destinations && load.destinations.length > 0) {
          const destination = load.destinations[0]; // Take first destination
          return `${destination.city || 'N/A'}, ${destination.state || 'N/A'}`;
        } else if (load.destination?.city) {
          return `${load.destination.city || 'N/A'}, ${load.destination.state || 'N/A'}`;
        } else if (load.destinationPlace?.location) {
          return load.destinationPlace.location;
        }
        return 'N/A';
      };

      return {
        loadId: `L-${load._id ? load._id.slice(-5) : 'N/A'}`, // L- followed by last 5 digits
        consignmentNo: load.shipmentNumber || 'N/A',
        weight: `${load.weight || 0} lbs`,
        pickup: getPickupLocation(),
        drop: getDropLocation(),
        vehicle: load.acceptedBid?.vehicleNumber || 'N/A',
        loadType: load.loadType || 'N/A',
        driver: load.acceptedBid?.driverName || 'N/A',
        status: load.status || 'N/A',
      };
    } catch (error) {
      console.error('Error transforming load data:', error, load);
      return {
        loadId: 'N/A',
        consignmentNo: 'N/A',
        weight: 'N/A',
        pickup: 'N/A',
        drop: 'N/A',
        vehicle: 'N/A',
        loadType: 'N/A',
        driver: 'N/A',
        status: 'N/A',
      };
    }
  });

  const filteredData = transformedData.filter((row) => {
    try {
      return Object.values(row).some((val) =>
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error filtering data:', error, row);
      return false;
    }
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetail = (load) => {
    setSelectedLoad(load);
    setPopupOpen(true);
    
    // Extract load ID from the load data
    // The load object from the table might have a different structure
    // We need to find the original load data to get the _id
    const originalLoad = loadsData.find(l => 
      l.shipmentNumber === load.consignmentNo || 
      l._id === load.loadId?.replace('L-', '')
    );
    
    if (originalLoad && originalLoad._id) {
      fetchLoadDetails(originalLoad._id);
    } else {
      console.error('Could not find load ID for detailed fetch');
      setDetailsError('Could not find load ID');
    }
  };


  // Fetch detailed load information
  const fetchLoadDetails = async (loadId) => {
    try {
      setLoadingDetails(true);
      setDetailsError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = userType === 'trucker'
        ? `${BASE_API_URL}/api/v1/load/trucker/load/${loadId}`
        : `${BASE_API_URL}/api/v1/load/shipper/load/${loadId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Load Details API Response:', data);
      
      if (data.success && data.data && data.data.load) {
        setLoadDetails(data.data);
        
        // Use the same tracking API for location history
        if (data.data.load.shipmentNumber) {
          try {
            setLoadingHistory(true);
            setHistoryError(null);
            
            const trackingResponse = await fetch(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipment/${data.data.load.shipmentNumber}`);
            const trackingData = await trackingResponse.json();
            
            if (trackingData.success && trackingData.tracking) {
              // Create location history from tracking data
              const historyData = [];
              
              // Add origin location as first history point
              if (trackingData.tracking.originLatLng && trackingData.tracking.originName) {
                historyData.push({
                  _id: `origin-${Date.now()}`,
                  latitude: trackingData.tracking.originLatLng.lat,
                  longitude: trackingData.tracking.originLatLng.lon,
                  timestamp: trackingData.tracking.startedAt || new Date().toISOString(),
                  status: 'completed',
                  vehicleNumber: trackingData.tracking.vehicleNumber || 'N/A',
                  locationName: trackingData.tracking.originName,
                  locationType: 'Origin',
                  locationQuality: {
                    isAccurate: true,
                    source: 'gps'
                  }
                });
              }
              
              // Add current location as a history point
              if (trackingData.tracking.currentLocation) {
                historyData.push({
                  _id: `current-${Date.now()}`,
                  latitude: trackingData.tracking.currentLocation.lat,
                  longitude: trackingData.tracking.currentLocation.lon,
                  timestamp: trackingData.tracking.currentLocation.updatedAt,
                  status: 'active',
                  vehicleNumber: trackingData.tracking.vehicleNumber || 'N/A',
                  locationName: 'Current Location',
                  locationType: 'Current',
                  locationQuality: {
                    isAccurate: true,
                    source: 'gps'
                  }
                });
              }
              
              // Add destination location as last history point
              if (trackingData.tracking.destinationLatLng && trackingData.tracking.destinationName) {
                historyData.push({
                  _id: `destination-${Date.now()}`,
                  latitude: trackingData.tracking.destinationLatLng.lat,
                  longitude: trackingData.tracking.destinationLatLng.lon,
                  timestamp: trackingData.tracking.load?.deliveryDate || new Date().toISOString(),
                  status: 'pending',
                  vehicleNumber: trackingData.tracking.vehicleNumber || 'N/A',
                  locationName: trackingData.tracking.destinationName,
                  locationType: 'Destination',
                  locationQuality: {
                    isAccurate: true,
                    source: 'gps'
                  }
                });
              }
              
              setLocationHistory(historyData);
            }
          } catch (error) {
            console.error('Error fetching tracking data for location history:', error);
            setHistoryError('Failed to load location data');
          } finally {
            setLoadingHistory(false);
          }
        }
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Error fetching load details:', err);
      setDetailsError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedLoad(null);
    setLoadDetails(null);
    setDetailsError(null);
    setLocationHistory([]);
    setHistoryError(null);
    setActiveTab('Load Info'); // Reset to default tab
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Load ID', 
        'Consignment No', 
        'Weight', 
        'Pick Up', 
        'Drop', 
        'Load Type'
      ];
      const csvRows = [headers.join(',')];

      if (transformedData && transformedData.length > 0) {
        transformedData.forEach(row => {
          const values = [
            row.loadId,
            row.consignmentNo,
            row.weight,
            row.pickup,
            row.drop,
            row.loadType
          ];
          csvRows.push(values.join(','));
        });
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${userType}_loads_data.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Consignment Skeleton Loading Component
  const ConsignmentSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
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
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={80} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination Skeleton */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
          <Skeleton variant="text" width={200} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={100} />
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  // Show loading state
  if (loading) {
    return <ConsignmentSkeleton />;
  }

  // Show message if user data is not available
  if (!user || !userType) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          User information not available. Please log in again.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading consignment data: {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <SearchNavigationFeedback 
        searchResult={location.state?.selectedShipment} 
        searchQuery={location.state?.searchQuery} 
      />
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
            Consignment
          </Typography>
          {isFiltered && (
            <Chip
              label={`Filtered: ${loadsData.length} result${loadsData.length !== 1 ? 's' : ''}`}
              color="primary"
              onDelete={clearSearchFilter}
              deleteIcon={<Clear />}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
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
            disabled={transformedData.length === 0}
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
            Export CSV ({transformedData.length} loads)
          </Button>
        </Stack>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: (themeConfig?.content?.bgImage ? 'rgba(255,255,255,0.92)' : (themeConfig?.table?.bg || '#fff')), position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(2px)' }}>
        {themeConfig?.table?.bgImage && (
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
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5, borderBottom: '2px solid #e2e8f0' }}>Load ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5, borderBottom: '2px solid #e2e8f0' }}>Consignment No</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5, borderBottom: '2px solid #e2e8f0' }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5, borderBottom: '2px solid #e2e8f0' }}>Pick Up</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5, borderBottom: '2px solid #e2e8f0' }}>Drop</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5, borderBottom: '2px solid #e2e8f0' }}>Load Type</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem', py: 1.5, borderBottom: '2px solid #e2e8f0' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={80} height={26} sx={{ borderRadius: 1 }} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} /></TableCell>
                </TableRow>
              ))
            ) : filteredData && filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, i) => {
                const isSearchedItem = isFiltered && location.state?.selectedShipment && 
                  (row.consignmentNo === location.state.selectedShipment.shipmentNumber ||
                   row.loadId === location.state.selectedShipment.id);
                
                return (
                  <TableRow 
                    key={i} 
                    hover 
                    sx={{ 
                      transition: 'all 0.25s ease',
                      borderBottom: '1px solid #f1f5f9',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                      ...(isSearchedItem && {
                        backgroundColor: '#fff3e0',
                        borderLeft: '4px solid #ff9800',
                        '&:hover': { 
                          backgroundColor: '#ffe0b2',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }
                      })
                    }}
                  >
                  <TableCell sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping sx={{ fontSize: 18, color: '#64748b' }} />
                      <Typography sx={{ fontWeight: 700 }}>{row.loadId}</Typography>
                    </Box>
                  </TableCell>       
                  <TableCell sx={{ color: '#475569', py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {row.consignmentNo}
                    </Typography>
                  </TableCell>                                        
                  <TableCell sx={{ color: '#64748b', py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {row.weight}
                    </Typography>
                  </TableCell>        
                  <TableCell sx={{ color: '#475569', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: '#94a3b8', mt: 0.5 }} />
                      <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                        {row.pickup}
                      </Typography>
                    </Box>
                  </TableCell>        
                  <TableCell sx={{ color: '#475569', py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: '#94a3b8', mt: 0.5 }} />
                      <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                        {row.drop}
                      </Typography>
                    </Box>
                  </TableCell>         
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={row.loadType}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 26,
                        backgroundColor: row.loadType === 'DRAYAGE' ? '#dbeafe' : '#e0e7ff',
                        color: row.loadType === 'DRAYAGE' ? '#1e40af' : '#3730a3',
                        border: row.loadType === 'DRAYAGE' ? '1px solid #bfdbfe' : '1px solid #c7d2fe',
                      }}
                    />
                  </TableCell>       
                  <TableCell sx={{ py: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetail(row)}
                      sx={{
                        fontSize: '0.7rem',
                        px: 1.5,
                        py: 0.5,
                        textTransform: 'none',
                        color: '#2563eb',
                        borderColor: '#bfdbfe',
                        backgroundColor: '#eff6ff',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          borderColor: '#2563eb',
                        },
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <LocalShipping sx={{ fontSize: 48, color: '#cbd5e1' }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                      No consignments found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {loadsData.length === 0 
                        ? 'No consignment data available' 
                        : 'Try adjusting your search criteria'}
                    </Typography>
                  </Box>
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
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </Paper>

      {/* Full Screen Popup Modal */}
      <Modal
        open={popupOpen}
        onClose={handleClosePopup}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'white',
            zIndex: 1300,
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 3,
              borderBottom: '1px solid #e0e0e0',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <LocalShipping sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'white', mb: 0.5 }}>
                    Load #: {loadDetails?.load ? `L-${loadDetails.load._id.slice(-5)}` : 'Loading...'}
                  </Typography>
                  <Chip
                    label={loadDetails?.load?.status || 'Loading...'}
                    sx={{
                      backgroundColor: loadDetails?.load?.status === 'Pending' ? '#ff9800' : 
                                      loadDetails?.load?.status === 'Bidding' ? '#2196f3' :
                                      loadDetails?.load?.status === 'Assigned' ? '#4caf50' :
                                      loadDetails?.load?.status === 'In Transit' ? '#ff9800' :
                                      loadDetails?.load?.status === 'Delivered' ? '#4caf50' : '#9e9e9e',
                      color: 'white',
                      fontWeight: 600,
                      height: 28,
                    }}
                  />
                </Box>
              </Box>
              <IconButton 
                onClick={handleClosePopup}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Content Area */}
          <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
            {/* Left Sidebar */}
            <Box
              sx={{
                width: '300px',
                backgroundColor: '#f9f9f9',
                borderRight: '1px solid #e0e0e0',
                p: 2,
                overflow: 'auto',
              }}
            >
              {/* Customer Section */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Business sx={{ fontSize: 20, color: '#64748b' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                    Customer
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: '#334155' }}>
                  {loadDetails?.shipper?.compName || 'Loading...'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {loadDetails?.shipper?.email || 'Loading...'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {loadDetails?.shipper?.phoneNo || 'Loading...'}
                </Typography>
              </Paper>

              {/* Pick Up Location */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOn sx={{ fontSize: 20, color: '#64748b' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                    Pick Up Location
                  </Typography>
                </Box>
                {loadDetails?.load?.origins && loadDetails.load.origins.length > 0 ? (
                  loadDetails.load.origins.map((origin, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: '#334155' }}>
                        {origin.addressLine1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {origin.addressLine2 && `${origin.addressLine2}, `}
                        {origin.city}, {origin.state} {origin.zip}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Weight: {origin.weight} lbs | Commodity: {origin.commodity}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="body2" color="text.secondary">
                          Pickup: {new Date(origin.pickupDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : loadDetails?.load?.originPlace?.location ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: '#334155' }}>
                      {loadDetails.load.originPlace.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {loadDetails.load.originPlace.status === 1 ? 'Arrived' : 'Pending'}
                    </Typography>
                    {loadDetails.load.originPlace.arrivedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Arrived At: {new Date(loadDetails.load.originPlace.arrivedAt).toLocaleString()}
                      </Typography>
                    )}
                    {loadDetails.load.originPlace.notes && (
                      <Typography variant="body2" color="text.secondary">
                        Notes: {loadDetails.load.originPlace.notes}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {loadingDetails ? 'Loading...' : 'No pickup location data'}
                  </Typography>
                )}
              </Paper>

              {/* Delivery Location */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOn sx={{ fontSize: 20, color: '#64748b' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                    Delivery Location
                  </Typography>
                </Box>
                {loadDetails?.load?.destinations && loadDetails.load.destinations.length > 0 ? (
                  loadDetails.load.destinations.map((destination, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: '#334155' }}>
                        {destination.addressLine1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {destination.addressLine2 && `${destination.addressLine2}, `}
                        {destination.city}, {destination.state} {destination.zip}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Weight: {destination.weight} lbs | Commodity: {destination.commodity}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography variant="body2" color="text.secondary">
                          Delivery: {new Date(destination.deliveryDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : loadDetails?.load?.destination?.city ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: '#334155' }}>
                      {loadDetails.load.destination.city}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      State: {loadDetails.load.destination.state}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Extracted City: {loadDetails.load.destination.extractedCity}
                    </Typography>
                  </Box>
                ) : loadDetails?.load?.destinationPlace?.location ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: '#334155' }}>
                      {loadDetails.load.destinationPlace.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {loadDetails.load.destinationPlace.status === 1 ? 'Arrived' : 'Pending'}
                    </Typography>
                    {loadDetails.load.destinationPlace.arrivedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Arrived At: {new Date(loadDetails.load.destinationPlace.arrivedAt).toLocaleString()}
                      </Typography>
                    )}
                    {loadDetails.load.destinationPlace.notes && (
                      <Typography variant="body2" color="text.secondary">
                        Notes: {loadDetails.load.destinationPlace.notes}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {loadingDetails ? 'Loading...' : 'No delivery location data'}
                  </Typography>
                )}
              </Paper>

              {/* Return Location */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOn sx={{ fontSize: 20, color: '#64748b' }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                    Return Location
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {loadDetails?.load?.returnAddress || 'N/A'}
                </Typography>
                {loadDetails?.load?.returnCity && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {loadDetails.load.returnCity}, {loadDetails.load.returnState || ''} {loadDetails.load.returnZip || ''}
                  </Typography>
                )}
                {loadDetails?.load?.returnDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 14, color: '#94a3b8' }} />
                    <Typography variant="body2" color="text.secondary">
                      Return Date: {new Date(loadDetails.load.returnDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Load Info Summary */}
              <Accordion defaultExpanded sx={{ mb: 3 }}>
                <AccordionSummary 
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info sx={{ fontSize: 20, color: '#64748b' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                      Load Info Summary
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Load Status:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.status || 'Loading...'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Load Type:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.loadType || 'Loading...'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Vehicle Type:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.vehicleType || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Container #:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.containerNo || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Total Weight:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.weight ? `${loadDetails.load.weight} LBS` : 'Loading...'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Commodity:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.commodity || 'Loading...'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Rate:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.rate ? `$${loadDetails.load.rate} (${loadDetails.load.rateType})` : 'Loading...'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Shipment #:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.shipmentNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>PO Number:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.poNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>BOL Number:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.bolNumber || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Created Date:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.createdAt ? new Date(loadDetails.load.createdAt).toLocaleDateString() : 'Loading...'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Pickup Date:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.pickupDate ? new Date(loadDetails.load.pickupDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Delivery Date:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.deliveryDate ? new Date(loadDetails.load.deliveryDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" component="span">
                        <strong>Return Date:</strong>
                      </Typography>
                      <Typography variant="body2" component="span">
                        {loadDetails?.load?.returnDate ? new Date(loadDetails.load.returnDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                    {loadDetails?.load?.returnLocation && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" component="span">
                          <strong>Return Location:</strong>
                        </Typography>
                        <Typography variant="body2" component="span">
                          {loadDetails.load.returnLocation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Map Section */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" fontWeight={600}>
                    Load Location Map
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ height: '400px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                    <LoadLocationMap loadDetails={loadDetails} />
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Location History Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" fontWeight={600}>
                    Location History
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 2 }}>
                    {loadingHistory ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography variant="body2">Loading location history...</Typography>
                      </Box>
                    ) : historyError ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Error loading location history: {historyError}
                      </Alert>
                    ) : locationHistory.length > 0 ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Total {locationHistory.length} location points found
                        </Typography>
                        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {locationHistory.map((location, index) => (
                            <Paper 
                              key={location._id} 
                              elevation={1} 
                              sx={{ 
                                p: 2, 
                                mb: 2, 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                              }}
                            >
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {location.locationType || `Point #${locationHistory.length - index}`}
                                </Typography>
                                {location.locationName && (
                                  <Typography variant="body2" color="text.secondary">
                                    {location.locationName}
                                  </Typography>
                                )}
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" component="span" color="text.secondary">
                                  <strong>Coordinates:</strong>
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {location.latitude != null && location.longitude != null 
                                    ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                                    : 'N/A'}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" component="span" color="text.secondary">
                                  <strong>Vehicle:</strong>
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {location.vehicleNumber}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" component="span" color="text.secondary">
                                  <strong>Timestamp:</strong>
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {new Date(location.timestamp).toLocaleString()}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" component="span" color="text.secondary">
                                  <strong>Quality:</strong>
                                </Typography>
                                <Typography variant="body2" component="span">
                                  {location.locationQuality?.isAccurate ? 'Accurate' : 'Low Accuracy'} 
                                  ({location.locationQuality?.source || 'Unknown'})
                                </Typography>
                              </Box>
                              
                              {location.notes && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    <strong>Notes:</strong>
                                  </Typography>
                                  <Typography variant="body2" component="span">
                                    {location.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No location history available for this shipment
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Navigation Tabs */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#fafafa',
                  px: 3,
                  pt: 2,
                }}
              >
                {[
                  { name: 'Load Info', icon: <Info /> },
                  { name: 'Billing', icon: <AttachMoney /> },
                  { name: 'Documents', icon: <Description /> },
                  { name: 'Tracking', icon: <TrackChanges /> }
                ].map((tab) => (
                  <Button
                    key={tab.name}
                    onClick={() => handleTabChange(tab.name)}
                    startIcon={tab.icon}
                    sx={{
                      px: 3,
                      py: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      color: activeTab === tab.name ? '#1976d2' : '#666',
                      borderBottom: activeTab === tab.name ? '2px solid #1976d2' : '2px solid transparent',
                      borderRadius: 0,
                      flex: 1,
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    }}
                  >
                    {tab.name}
                  </Button>
                ))}
              </Box>

              {/* Tab Content Area */}
              <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                {/* Loading State */}
                {loadingDetails && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      Loading load details...
                    </Typography>
                  </Box>
                )}

                {/* Error State */}
                {detailsError && (
                  <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Error loading load details: {detailsError}
                    </Alert>
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        if (selectedLoad) {
                          const originalLoad = loadsData.find(l => 
                            l.shipmentNumber === selectedLoad.consignmentNo || 
                            l._id === selectedLoad.loadId?.replace('L-', '')
                          );
                          if (originalLoad && originalLoad._id) {
                            fetchLoadDetails(originalLoad._id);
                          }
                        }
                      }}
                      sx={{ mt: 2 }}
                    >
                      Retry
                    </Button>
                  </Box>
                )}

                {/* Load Info Tab Content */}
              {!loadingDetails && !detailsError && activeTab === 'Load Info' && (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={4}>
                    {/* Left Column */}
                    <Grid item xs={6}>
                      {/* Load Info Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Load Information
                        </Typography>
                        <TextField
                          fullWidth
                          label="Customer"
                          value={loadDetails?.shipper?.compName || ''}
                          variant="outlined"
                          size="small"
                          required
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          fullWidth
                          label="Load Type"
                          value={loadDetails?.load?.loadType || ''}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          fullWidth
                          label="Vehicle Type"
                          value={loadDetails?.load?.vehicleType || ''}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          fullWidth
                          label="Commodity"
                          value={loadDetails?.load?.commodity || ''}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          fullWidth
                          label="Weight (lbs)"
                          value={loadDetails?.load?.weight || ''}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          fullWidth
                          label="Rate"
                          value={loadDetails?.load?.rate ? `$${loadDetails.load.rate}` : ''}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                      </Paper>

                      {/* Pick Up Location Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Pick Up Location
                        </Typography>
                        {loadDetails?.load?.origins && loadDetails.load.origins.length > 0 ? (
                          loadDetails.load.origins.map((origin, index) => (
                            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                              <TextField
                                fullWidth
                                label="Pick Up Location"
                                value={`${origin.addressLine1}, ${origin.city}, ${origin.state}`}
                                variant="outlined"
                                size="small"
                                sx={{ mb: 2 }}
                                InputProps={{ readOnly: true }}
                              />
                              <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    label="Pick Up Date"
                                    value={new Date(origin.pickupDate).toLocaleDateString()}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    label="Weight"
                                    value={`${origin.weight} lbs`}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                  />
                                </Grid>
                              </Grid>
                              <TextField
                                fullWidth
                                label="Commodity"
                                value={origin.commodity}
                                variant="outlined"
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                            </Box>
                          ))
                        ) : loadDetails?.load?.originPlace?.location ? (
                          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <TextField
                              fullWidth
                              label="Pick Up Location"
                              value={loadDetails.load.originPlace.location}
                              variant="outlined"
                              size="small"
                              sx={{ mb: 2 }}
                              InputProps={{ readOnly: true }}
                            />
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="Status"
                                  value={loadDetails.load.originPlace.status === 1 ? 'Arrived' : 'Pending'}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="Arrived At"
                                  value={loadDetails.load.originPlace.arrivedAt ? new Date(loadDetails.load.originPlace.arrivedAt).toLocaleString() : 'N/A'}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </Grid>
                            </Grid>
                            {loadDetails.load.originPlace.notes && (
                              <TextField
                                fullWidth
                                label="Notes"
                                value={loadDetails.load.originPlace.notes}
                                variant="outlined"
                                size="small"
                                multiline
                                rows={2}
                                InputProps={{ readOnly: true }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No pickup location data available
                          </Typography>
                        )}
                      </Paper>

                      {/* Delivery Location Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Delivery Location
                        </Typography>
                        {loadDetails?.load?.destinations && loadDetails.load.destinations.length > 0 ? (
                          loadDetails.load.destinations.map((destination, index) => (
                            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                              <TextField
                                fullWidth
                                label="Delivery Location"
                                value={`${destination.addressLine1}, ${destination.city}, ${destination.state}`}
                                variant="outlined"
                                size="small"
                                sx={{ mb: 2 }}
                                InputProps={{ readOnly: true }}
                              />
                              <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    label="Delivery Date"
                                    value={new Date(destination.deliveryDate).toLocaleDateString()}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    fullWidth
                                    label="Weight"
                                    value={`${destination.weight} lbs`}
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                  />
                                </Grid>
                              </Grid>
                              <TextField
                                fullWidth
                                label="Commodity"
                                value={destination.commodity}
                                variant="outlined"
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                            </Box>
                          ))
                        ) : loadDetails?.load?.destination?.city ? (
                          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <TextField
                              fullWidth
                              label="Delivery Location"
                              value={loadDetails.load.destination.city}
                              variant="outlined"
                              size="small"
                              sx={{ mb: 2 }}
                              InputProps={{ readOnly: true }}
                            />
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="State"
                                  value={loadDetails.load.destination.state}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="Extracted City"
                                  value={loadDetails.load.destination.extractedCity}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        ) : loadDetails?.load?.destinationPlace?.location ? (
                          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <TextField
                              fullWidth
                              label="Delivery Location"
                              value={loadDetails.load.destinationPlace.location}
                              variant="outlined"
                              size="small"
                              sx={{ mb: 2 }}
                              InputProps={{ readOnly: true }}
                            />
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="Status"
                                  value={loadDetails.load.destinationPlace.status === 1 ? 'Arrived' : 'Pending'}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="Arrived At"
                                  value={loadDetails.load.destinationPlace.arrivedAt ? new Date(loadDetails.load.destinationPlace.arrivedAt).toLocaleString() : 'N/A'}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </Grid>
                            </Grid>
                            {loadDetails.load.destinationPlace.notes && (
                              <TextField
                                fullWidth
                                label="Notes"
                                value={loadDetails.load.destinationPlace.notes}
                                variant="outlined"
                                size="small"
                                multiline
                                rows={2}
                                InputProps={{ readOnly: true }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No delivery location data available
                          </Typography>
                        )}
                      </Paper>

                      {/* Return Location Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Return Location
                        </Typography>
                        <TextField
                          fullWidth
                          label="Return Address"
                          value={loadDetails?.load?.returnAddress || 'N/A'}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Return City"
                              value={loadDetails?.load?.returnCity || 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Return State"
                              value={loadDetails?.load?.returnState || 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Return Zip"
                              value={loadDetails?.load?.returnZip || 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Return Date"
                              value={loadDetails?.load?.returnDate ? new Date(loadDetails.load.returnDate).toLocaleDateString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Chassis Locations Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Chassis Locations
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Hook Chassis Location"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Terminate Chassis Location"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Container Visibility Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Container Visibility
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Freight Hold"
                              value="No"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Custom Hold"
                              value="No"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Carrier Hold"
                              value="No"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Broker Hold"
                              value="No"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Freight Description Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Freight Description
                        </Typography>
                        <Table size="small" sx={{ mb: 2 }}>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: (themeConfig?.table?.headerBg || '#f5f5f5') }}>
                              <TableCell sx={{ fontWeight: 600 }}>Commodity</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Pieces</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Weight LBS</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Weight KGS</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Pallets</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  value={loadDetails?.load?.commodity || 'N/A'}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  value="N/A"
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  value="N/A"
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  value={loadDetails?.load?.weight ? `${loadDetails.load.weight}` : 'N/A'}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  value={loadDetails?.load?.weight && typeof loadDetails.load.weight === 'number' 
                                    ? `${(loadDetails.load.weight * 0.453592).toFixed(2)}` 
                                    : 'N/A'}
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  value="N/A"
                                  variant="outlined"
                                  size="small"
                                  InputProps={{ readOnly: true }}
                                />
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Paper>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={6}>
                      {/* Dates Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Important Dates
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Vessel ETA"
                              value={loadDetails?.load?.importantDates?.vesselDate ? new Date(loadDetails.load.importantDates.vesselDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Last Free Day"
                              value={loadDetails?.load?.importantDates?.lastFreeDate ? new Date(loadDetails.load.importantDates.lastFreeDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Discharge Date"
                              value={loadDetails?.load?.importantDates?.dischargeDate ? new Date(loadDetails.load.importantDates.dischargeDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Outgate Date"
                              value={loadDetails?.load?.importantDates?.outgateDate ? new Date(loadDetails.load.importantDates.outgateDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Empty Date"
                              value={loadDetails?.load?.importantDates?.emptyDate ? new Date(loadDetails.load.importantDates.emptyDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Per Diem Free Day"
                              value={loadDetails?.load?.importantDates?.perDiemFreeDate ? new Date(loadDetails.load.importantDates.perDiemFreeDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Ingate Date"
                              value={loadDetails?.load?.importantDates?.ingateDate ? new Date(loadDetails.load.importantDates.ingateDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Ready To Return Date"
                              value={loadDetails?.load?.importantDates?.readyToReturnDate ? new Date(loadDetails.load.importantDates.readyToReturnDate).toLocaleString() : 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Equipment Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Equipment Details
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Container #"
                              value={loadDetails?.load?.containerNo || 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Container Size"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Container Type"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="SSL"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Chassis #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Chassis Size"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Chassis Type"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Chassis Owner"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Genset #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Temperature"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Route"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="SCAC"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                        
                        {/* Equipment Options */}
                        <Box sx={{ 
                          p: 2, 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: 1,
                          border: '1px solid #e9ecef'
                        }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#495057' }}>
                            Equipment Options
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Hazmat</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Hot</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Street Turn</Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Overweight</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Genset</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>OOG</Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Overheight</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Scale</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Bonded</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Liquor</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" disabled style={{ marginRight: '8px', transform: 'scale(1.1)' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>EV</Typography>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>

                      {/* Reference Numbers Section */}
                      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1976d2' }}>
                          Reference Numbers
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Master Bill Of Lading"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="House Bill Of Lading"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Seal #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Reference #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Vessel Name"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Voyage"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Purchase Order #"
                              value={loadDetails?.load?.poNumber || 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Shipment #"
                              value={loadDetails?.load?.shipmentNumber || 'N/A'}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Pick Up #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Appointment #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Return #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Reservation #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Delivery Reference #"
                              value="N/A"
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Billing Tab Content */}
              {!loadingDetails && !detailsError && activeTab === 'Billing' && (
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Billing Information
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                          Rate Information
                        </Typography>
                        <TextField
                          fullWidth
                          label="Rate"
                          value={loadDetails?.load?.rate ? `$${loadDetails.load.rate}` : 'N/A'}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          fullWidth
                          label="Rate Type"
                          value={loadDetails?.load?.rateType || 'N/A'}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                          Load Details
                        </Typography>
                        <TextField
                          fullWidth
                          label="Weight"
                          value={loadDetails?.load?.weight ? `${loadDetails.load.weight} lbs` : 'N/A'}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                        <TextField
                          fullWidth
                          label="Commodity"
                          value={loadDetails?.load?.commodity || 'N/A'}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </Grid>
                    
                    {loadDetails?.load?.acceptedBid && (
                      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                          Accepted Bid Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Driver Name"
                              value={loadDetails.load.acceptedBid.driverName}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Vehicle Number"
                              value={loadDetails.load.acceptedBid.vehicleNumber}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Vehicle Type"
                              value={loadDetails.load.acceptedBid.vehicleType}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              // fullWidth
                              label="Bid Message"
                              value={loadDetails.load.acceptedBid.message}
                              variant="outlined"
                              size="small"
                              multiline
                              rows={1}
                              InputProps={{ readOnly: true }}
                              sx={{ width: '40rem' }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                   
                  </Paper>
                </Box>
              )}

              {/* Documents Tab Content */}
              {!loadingDetails && !detailsError && activeTab === 'Documents' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#1976d2' }}>
                      📄 Document Gallery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click on any image to view full size
                    </Typography>
                  </Box>
                  
                  {/* Document Categories - Organized by Priority */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* 1. Proof of Delivery - Always show first */}
                    <Paper
                        elevation={1}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          minHeight: '300px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            backgroundColor: '#28a745', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>📋</Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                            Proof of Delivery
                          </Typography>
                        </Box>
                        {loadDetails?.load?.proofOfDelivery && loadDetails.load.proofOfDelivery.length > 0 ? (
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.proofOfDelivery.length} file(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.proofOfDelivery.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid #ddd'
                                  }}>
                                    <img
                                      src={url}
                                      alt={`Proof of Delivery ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6c757d'
                          }}>
                            <Typography variant="h3" sx={{ mb: 2, opacity: 0.5 }}>📄</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              No files uploaded
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                              Upload proof of delivery documents
                            </Typography>
                          </Box>
                        )}
                    </Paper>

                    {/* 2. Empty Truck Images - Always show second */}
                    <Paper
                        elevation={1}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          minHeight: '300px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            backgroundColor: '#2196f3', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>🚛</Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                            Empty Truck Images
                          </Typography>
                        </Box>
                        {loadDetails?.load?.emptyTruckImages && loadDetails.load.emptyTruckImages.length > 0 ? (
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.emptyTruckImages.length} image(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.emptyTruckImages.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#2196f3',
                                      transform: 'scale(1.02)',
                                    }
                                  }}>
                                    <img
                                      src={url}
                                      alt={`Empty Truck Image ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6c757d'
                          }}>
                            <Typography variant="h3" sx={{ mb: 2, opacity: 0.5 }}>🚛</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              No images uploaded
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                              Upload empty truck photos
                            </Typography>
                          </Box>
                        )}
                    </Paper>

                    {/* 3. Loaded Truck Images - Always show third */}
                    <Paper
                        elevation={1}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          minHeight: '300px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            backgroundColor: '#ff9800', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>📦</Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                            Loaded Truck Images
                          </Typography>
                        </Box>
                        {loadDetails?.load?.loadedTruckImages && loadDetails.load.loadedTruckImages.length > 0 ? (
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.loadedTruckImages.length} image(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.loadedTruckImages.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#ff9800',
                                      transform: 'scale(1.02)',
                                    }
                                  }}>
                                    <img
                                      src={url}
                                      alt={`Loaded Truck Image ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6c757d'
                          }}>
                            <Typography variant="h3" sx={{ mb: 2, opacity: 0.5 }}>📦</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              No images uploaded
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                              Upload loaded truck photos
                            </Typography>
                          </Box>
                        )}
                    </Paper>

                    {/* 4. Container Images - Always show fourth */}
                    <Paper
                        elevation={1}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          minHeight: '300px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            backgroundColor: '#9c27b0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>📦</Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                            Container Images
                          </Typography>
                        </Box>
                        {loadDetails?.load?.containerImages && loadDetails.load.containerImages.length > 0 ? (
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.containerImages.length} image(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.containerImages.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#9c27b0',
                                      transform: 'scale(1.02)',
                                    }
                                  }}>
                                    <img
                                      src={url}
                                      alt={`Container Image ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6c757d'
                          }}>
                            <Typography variant="h3" sx={{ mb: 2, opacity: 0.5 }}>📦</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              No images uploaded
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                              Upload container photos
                            </Typography>
                          </Box>
                        )}
                    </Paper>

                    {/* 5. POD Images - Show if available */}
                    {loadDetails?.load?.podImages && loadDetails.load.podImages.length > 0 && (
                      <Paper
                          elevation={1}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            minHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              backgroundColor: '#4caf50', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mr: 2
                            }}>
                              <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>📄</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                              POD Images
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.podImages.length} image(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.podImages.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#4caf50',
                                      transform: 'scale(1.02)',
                                    }
                                  }}>
                                    <img
                                      src={url}
                                      alt={`POD Image ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                      </Paper>
                    )}

                    {/* 6. EIR Tickets - Show if available */}
                    {loadDetails?.load?.eirTickets && loadDetails.load.eirTickets.length > 0 && (
                      <Paper
                          elevation={1}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            minHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              backgroundColor: '#ff9800', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mr: 2
                            }}>
                              <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>🎫</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                              EIR Tickets
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.eirTickets.length} file(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.eirTickets.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#ff9800',
                                      transform: 'scale(1.02)',
                                    }
                                  }}>
                                    <img
                                      src={url}
                                      alt={`EIR Ticket ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                      </Paper>
                    )}

                    {/* 7. Seal Images - Show if available */}
                    {loadDetails?.load?.sealImages && loadDetails.load.sealImages.length > 0 && (
                      <Paper
                          elevation={1}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            minHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              backgroundColor: '#03a9f4', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mr: 2
                            }}>
                              <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>🔒</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                              Seal Images
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.sealImages.length} image(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.sealImages.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#03a9f4',
                                      transform: 'scale(1.02)',
                                    }
                                  }}>
                                    <img
                                      src={url}
                                      alt={`Seal Image ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                      </Paper>
                    )}

                    {/* 8. Damage Images - Show if available */}
                    {loadDetails?.load?.damageImages && loadDetails.load.damageImages.length > 0 && (
                      <Paper
                          elevation={1}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid #e0e0e0',
                            minHeight: '300px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              backgroundColor: '#f44336', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mr: 2
                            }}>
                              <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>⚠️</Typography>
                            </Box>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50' }}>
                              Damage Images
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {loadDetails.load.damageImages.length} image(s) uploaded
                            </Typography>
                            <Grid container spacing={2}>
                              {loadDetails.load.damageImages.map((url, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                  <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid #e9ecef',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#f44336',
                                      transform: 'scale(1.02)',
                                    }
                                  }}>
                                    <img
                                      src={url}
                                      alt={`Damage Image ${index + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => window.open(url, '_blank')}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                    <Box sx={{ 
                                      display: 'none',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: 'rgba(0,0,0,0.7)',
                                      color: 'white',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexDirection: 'column'
                                    }}>
                                      <Typography variant="body2" color="error">
                                        ❌ Failed to load image
                                      </Typography>
                                    </Box>
                                    <Box sx={{ 
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                      color: 'white',
                                      p: 1,
                                      textAlign: 'center'
                                    }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                        📖 Click to view full size
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                      </Paper>
                    )}

                  </Box>

                  {/* Notes Section */}
                  {loadDetails?.load?.notes && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Driver Notes
                      </Typography>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2">
                          {loadDetails.load.notes}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tracking Tab Content */}
              {!loadingDetails && !detailsError && activeTab === 'Tracking' && (
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Live Tracking & Location History
                  </Typography>
                  
                  {/* Location History Section */}
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Location History
                    </Typography>
                    {loadingHistory ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography variant="body2">Loading location history...</Typography>
                      </Box>
                    ) : historyError ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Error loading location history: {historyError}
                      </Alert>
                    ) : locationHistory.length > 0 ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Total {locationHistory.length} location points found
                        </Typography>
                        <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {locationHistory.slice(0, 10).map((location, index) => (
                            <Paper 
                              key={location._id} 
                              elevation={1} 
                              sx={{ 
                                p: 2, 
                                mb: 2, 
                                borderRadius: 2,
                                border: '1px solid #e0e0e0'
                              }}
                            >
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {location.locationType || `Point #${locationHistory.length - index}`}
                                </Typography>
                                {location.locationName && (
                                  <Typography variant="body2" color="text.secondary">
                                    {location.locationName}
                                  </Typography>
                                )}
                              </Box>
                              
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Coordinates:</strong>
                                  </Typography>
                                  <Typography variant="body2">
                                    {location.latitude != null && location.longitude != null 
                                      ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                                      : 'N/A'}
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Vehicle:</strong>
                                  </Typography>
                                  <Typography variant="body2">
                                    {location.vehicleNumber}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Timestamp:</strong>
                                  </Typography>
                                  <Typography variant="body2">
                                    {new Date(location.timestamp).toLocaleString()}
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Quality:</strong>
                                  </Typography>
                                  <Typography variant="body2">
                                    {location.locationQuality?.isAccurate ? 'Accurate' : 'Low Accuracy'} 
                                    ({location.locationQuality?.source || 'Unknown'})
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          ))}
                          {locationHistory.length > 10 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                              Showing latest 10 locations. Total: {locationHistory.length} points
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No location history available for this shipment
                        </Typography>
                      </Box>
                    )}
                  </Paper>

                  {/* Full Map Section */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Live Tracking Map
                    </Typography>
                    <Box sx={{ height: '500px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                      <LoadLocationMap loadDetails={loadDetails} />
                    </Box>
                  </Paper>

                </Box>
              )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Consignment;
