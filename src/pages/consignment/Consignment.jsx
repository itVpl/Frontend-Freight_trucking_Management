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
} from '@mui/material';
import { Receipt, Download, Search, Clear } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../apiConfig';
import SearchNavigationFeedback from '../../components/SearchNavigationFeedback';

const Consignment = () => {
  const location = useLocation();
  const { user, userType } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadsData, setLoadsData] = useState([]);
  const [originalLoadsData, setOriginalLoadsData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
        
        if (data.success && data.data && data.data.loads) {
          setLoadsData(data.data.loads);
          setOriginalLoadsData(data.data.loads); // Store original data
        } else {
          throw new Error('Invalid response format');
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

  // Transform API data to table format
  const transformedData = loadsData.map((load) => ({
    loadId: `L-${load._id.slice(-5)}`, // L- followed by last 5 digits
    consignmentNo: load.shipmentNumber || 'N/A',
    weight: `${load.weight} lbs`,
    pickup: `${load.origin.city}, ${load.origin.state}`,
    drop: `${load.destination.city}, ${load.destination.state}`,
    vehicle: load.acceptedBid?.vehicleNumber || 'N/A',
    loadType: load.loadType || 'N/A',
    driver: load.acceptedBid?.driverName || 'N/A',
    status: load.status || 'N/A',
  }));

  const filteredData = transformedData.filter((row) =>
    Object.values(row).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToCSV = () => {
    const headers = [
      'Load ID', 
      'Consignment No', 
      'Weight', 
      'Pick Up', 
      'Drop', 
      'Vehicle', 
      'Load Type', 
      'Driver', 
      'Status'
    ];
    const csvRows = [headers.join(',')];

    transformedData.forEach(row => {
      const values = [
        row.loadId,
        row.consignmentNo,
        row.weight,
        row.pickup,
        row.drop,
        row.vehicle,
        row.loadType,
        row.driver,
        row.status
      ];
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userType}_loads_data.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading consignment data...
        </Typography>
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

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
              <TableCell sx={{ fontWeight: 600 }}>Load ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Consignment No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Pick Up</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Drop</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Load Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
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
                      transition: '0.3s', 
                      '&:hover': { backgroundColor: '#e3f2fd' },
                      ...(isSearchedItem && {
                        backgroundColor: '#fff3e0',
                        borderLeft: '4px solid #ff9800',
                        '&:hover': { backgroundColor: '#ffe0b2' }
                      })
                    }}
                  >
                  <TableCell>{row.loadId}</TableCell>       
                  <TableCell>{row.consignmentNo}</TableCell>                                        
                  <TableCell>{row.weight}</TableCell>        
                  <TableCell>{row.pickup}</TableCell>        
                  <TableCell>{row.drop}</TableCell>         
                  <TableCell>{row.vehicle}</TableCell>        
                  <TableCell>{row.loadType}</TableCell>       
                  <TableCell>{row.driver}</TableCell>         
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === 'Pending' ? undefined : 'success'}
                      sx={
                        row.status === 'Pending'
                          ? { bgcolor: '#FFEB3B', color: '#000', fontWeight: 700 }
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
                );
              })}
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
  );
};

export default Consignment;