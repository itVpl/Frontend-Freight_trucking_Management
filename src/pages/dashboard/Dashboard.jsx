import { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  useMediaQuery,
  useTheme,
  TableContainer,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  CheckCircle,
  Schedule,
  Cancel,
  DirectionsCar,
  Build,
  TrendingUp,
  LocationOn,
} from '@mui/icons-material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useAuth } from '../../context/AuthContext';
import {
  fetchDashboardData,
  fetchActualCounts,
  fetchMapData,
  fetchDetailedLoads,
  fetchBills,
  fetchPendingDeliveryData,
  setSelectedCard as setSelectedCardAction,
  setCurrentPage as setCurrentPageAction,
  clearDashboardError,
} from '../../redux/slices/dashboardSlice';
import {
  selectDashboardData,
  selectDashboardLoading,
  selectDashboardError,
  selectActualCounts,
  selectMapData,
  selectMapLoading,
  selectTableData,
  selectTableLoading,
  selectSelectedCard,
  selectCurrentPage,
  selectPaginatedTableData,
  selectTotalPages,
  selectItemsPerPage,
  selectDashboardValue,
} from '../../redux/selectors/dashboardSelectors';

// Fix for Leaflet default icons
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
import { BASE_API_URL } from '../../apiConfig';
import { useThemeConfig } from '../../context/ThemeContext';
import PageLoader from '../../components/PageLoader';
import {GOOGLE_MAPS_API_KEY } from '../../apiConfig';
import GoogleMap from '../../components/maps/GoogleMap';
import group23 from "../../assets/Icons super admin/Group23.png"
import group22 from "../../assets/Icons super admin/Group22.png"
import group26 from "../../assets/Icons super admin/Group26.png"
import group21 from "../../assets/Icons super admin/Group21.png"
import group28 from "../../assets/Icons super admin/Group28.png"
import cancel from "../../assets/Icons super admin/cancel.png"
import group20 from "../../assets/Icons super admin/Vectors/Group20.png"
import group30 from "../../assets/Icons super admin/Vectors/Group30.png"
import group27 from "../../assets/Icons super admin/Vectors/Group27.png"
import CardBoard from "../../assets/Icons super admin/Vectors/CardBoard.png"
import Deliver from "../../assets/Icons super admin/Vectors/Deliver.png"
import USA from "../../assets/Icons super admin/Vectors/USA.png"
import localshipping from "../../assets/Icons super admin/Vectors/localshipping.png"

// Memoized stat card to avoid unnecessary re-renders
const StatCard = memo(function StatCard({ title, value, icon, image, onClick }) {
  return (
    <Paper
      elevation={2}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick
          ? {
              elevation: 4,
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }
          : {},
      }}
    >
      {/* Top Header */}
      <Box display="flex" alignItems="center" gap={1}>
        <Box>
          <img src={icon} alt={title} width={50} />
        </Box>
        <Typography fontWeight="bold" fontSize={20}>
          {title}
        </Typography>
      </Box>

      {/* Value & Image */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography fontWeight="bold" fontSize={24}>
          {value}
        </Typography>
        {image && <img src={image} alt={title} width={100} />}
      </Box>
    </Paper>
  );
});

const Dashboard = () => {
  const { userType } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const { themeConfig } = useThemeConfig();
  
  // Redux dispatch and selectors
  const dispatch = useDispatch();
  
  const dashboardData = useSelector(selectDashboardData);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const actualCounts = useSelector(selectActualCounts);
  const mapData = useSelector(selectMapData);
  const mapLoading = useSelector(selectMapLoading);
  const tableData = useSelector(selectTableData);
  const tableLoading = useSelector(selectTableLoading);
  const selectedCard = useSelector(selectSelectedCard);
  const currentPage = useSelector(selectCurrentPage);
  const paginatedTableData = useSelector(selectPaginatedTableData);
  const totalPages = useSelector(selectTotalPages);
  const itemsPerPage = useSelector(selectItemsPerPage);

  // Use memoized selector for each dashboard metric instead of
  // constructing a fake state object on every render
  const totalLoads = useSelector((state) => selectDashboardValue(state, 'totalLoads'));
  const pendingDeliveries = useSelector((state) => selectDashboardValue(state, 'pendingDeliveries'));
  const delivered = useSelector((state) => selectDashboardValue(state, 'delivered'));
  const bills = useSelector((state) => selectDashboardValue(state, 'bills') || 0);
  const inTransitLoads = useSelector((state) => selectDashboardValue(state, 'inTransitLoads'));

  // Render function for Google Maps wrapper
  const render = (status) => {
    if (status === Status.LOADING) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (status === Status.FAILURE) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Alert severity="error">Error loading Google Maps. Please check your API key.</Alert>
        </Box>
      );
    }
    return null;
  };

  // Helper function to get coordinates from city names
  const getCoordinatesFromCity = (city) => {
    // This is a simplified mapping - in production, you'd use a geocoding service
    const cityCoordinates = {
      'Houston': [29.7604, -95.3698],
      'Texas': [31.9686, -99.9018],
      'California': [36.7783, -119.4179],
      'Fresno': [36.7378, -119.7871],
      'Pennsylvania': [41.2033, -77.1945],
      'Jenkins Township': [41.2033, -77.1945],
      'Seabrook': [29.5638, -95.0255],
      'Bayport Container Terminal': [29.5638, -95.0255],
      'Tanner Rd': [29.7604, -95.3698],
      'Port Rd': [29.5638, -95.0255],
      'Penrod St': [29.7604, -95.3698]
    };
    
    // Try to find coordinates by city name
    const cityStr = String(city || '').toLowerCase();
    for (const [key, coords] of Object.entries(cityCoordinates)) {
      const keyStr = key.toLowerCase();
      if (cityStr && (cityStr.includes(keyStr) || keyStr.includes(cityStr))) {
        return coords;
      }
    }
    
    // Default coordinates (Houston, TX)
    return [29.7604, -95.3698];
  };

  // Function to scroll to table
  const scrollToTable = () => {
    setTimeout(() => {
      const tableElement = document.getElementById('dashboard-table');
      if (tableElement) {
        tableElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  // Click handlers for dashboard cards
  const handleTotalDeliveryClick = useCallback(() => {
    dispatch(setSelectedCardAction('Total Delivery'));
    const token = localStorage.getItem('token');
    dispatch(fetchDetailedLoads({ userType, token }));
    scrollToTable();
  }, [dispatch, userType]);

  const handlePendingDeliveryClick = useCallback(() => {
    dispatch(setSelectedCardAction('Pending Delivery'));
    const token = localStorage.getItem('token');
    dispatch(fetchPendingDeliveryData({ userType, token }));
    scrollToTable();
  }, [dispatch, userType]);

  const handleCompletedDeliveryClick = useCallback(() => {
    dispatch(setSelectedCardAction('Completed Delivery'));
    const token = localStorage.getItem('token');
    dispatch(fetchDetailedLoads({ userType, token, status: 'Delivered' }));
    scrollToTable();
  }, [dispatch, userType]);

  const handleBillsClick = useCallback(() => {
    dispatch(setSelectedCardAction('Bills'));
    const token = localStorage.getItem('token');
    dispatch(fetchBills({ token }));
    scrollToTable();
  }, [dispatch]);

  const handleInTransitClick = useCallback(() => {
    dispatch(setSelectedCardAction('In Transit'));
    const token = localStorage.getItem('token');
    dispatch(fetchDetailedLoads({ userType, token, status: 'In Transit' }));
    scrollToTable();
  }, [dispatch, userType]);

  const handleBidsOnLoadsClick = useCallback(() => {
    dispatch(setSelectedCardAction('Bids On Loads'));
    const token = localStorage.getItem('token');
    dispatch(fetchDetailedLoads({ userType, token, status: 'Bidding' }));
    scrollToTable();
  }, [dispatch, userType]);

  const handleTrackShipment = useCallback(() => {
    navigate('/live-tracker');
  }, [navigate]);

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    dispatch(setCurrentPageAction(Math.max(currentPage - 1, 1)));
  }, [dispatch, currentPage]);

  const handleNextPage = useCallback(() => {
    dispatch(setCurrentPageAction(Math.min(currentPage + 1, totalPages)));
  }, [dispatch, currentPage, totalPages]);

  // Main useEffect for initial data loading
  useEffect(() => {
    if (!userType) return; // Wait for userType to be available
    
    if (userType === 'shipper' || userType === 'trucker') {
      const token = localStorage.getItem('token');
      
      // CRITICAL: Check if token exists before making requests
      if (!token) {
        console.error('No authentication token found. Please log in.');
        navigate('/login');
        return;
      }

      // Clear any previous errors on refresh/mount
      dispatch(clearDashboardError());

      // Dispatch all API calls in parallel for faster loading
      dispatch(fetchDashboardData({ userType, token }));
      dispatch(fetchMapData({ userType, token, getCoordinatesFromCity }));
      dispatch(fetchActualCounts({ userType, token }));
    }
  }, [userType, dispatch, navigate]);



  // Skeleton loading component
  const DashboardSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, auto)',
          gap: 2,
          p: 2,
        }}
      >
        {/* Row 1 - Stat Cards */}
        <Box sx={{ gridColumn: 'span 1' }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 5, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={120} height={24} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="rectangular" width={100} height={80} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ gridColumn: 'span 1' }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 5, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={120} height={24} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="rectangular" width={100} height={80} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        </Box>

        {/* Map Area */}
        <Box sx={{ gridColumn: 'span 2', gridRow: 'span 4' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            }}
          >
            <Skeleton 
              variant="rectangular" 
              height={400} 
              sx={{ borderRadius: 2, mb: 2 }} 
            />
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Skeleton variant="rectangular" width={200} height={36} sx={{ borderRadius: 2, mx: 'auto' }} />
            </Box>
          </Paper>
        </Box>

        {/* Row 2 - More Stat Cards */}
        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 5, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={140} height={24} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="rectangular" width={100} height={80} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 5, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={80} height={24} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="rectangular" width={100} height={80} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ gridColumn: 'span 1' }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 5, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={100} height={24} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="rectangular" width={100} height={80} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ gridColumn: 'span 1' }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 5, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Skeleton variant="rectangular" width={50} height={50} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={120} height={24} />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Skeleton variant="text" width={60} height={32} />
              <Skeleton variant="rectangular" width={100} height={80} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Table Skeleton */}
      <Box mt={4}>
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              bgcolor: '#1976d2',
              color: '#fff',
              py: 2,
              textAlign: 'center',
            }}
          >
            <Skeleton variant="text" width={200} height={28} sx={{ mx: 'auto' }} />
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width={100} height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                      <TableCell key={col}>
                        <Skeleton variant="text" width={80} height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );

    // Show loading state while data is being fetched
  if (loading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Error loading dashboard data
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => {
              const token = localStorage.getItem('token');
              if (token) {
                dispatch(fetchDashboardData({ userType, token }));
              } else {
                navigate('/login');
              }
            }}
          >
            Retry
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/login')}
          >
            Log In Again
          </Button>
        </Box>
      </Box>
    );
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, auto)',
          gap: 2,
          p: 2,
        }}
      >
        {/* Row 1 */}
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard 
            title="Total Delivery" 
            value={totalLoads} 
            icon={group23} 
            image={CardBoard}
            onClick={handleTotalDeliveryClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard 
            title="Pending Delivery" 
            value={pendingDeliveries} 
            icon={group22} 
            image={Deliver}
            onClick={handlePendingDeliveryClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 2', gridRow: 'span 4' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              height: '100%',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '1px solid #e0e0e0',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease-in-out',
              }
            }}
          >
            {/* Interactive Map Container - Full Card */}
            <Box 
              sx={{ 
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #fff',
                height: '400px',
                flex: 1
              }}
            >
              {mapLoading ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%' 
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render}>
                  <GoogleMap mapData={mapData} center={{ lat: 39.8283, lng: -98.5795 }} zoom={4} />
                </Wrapper>
              )}
            </Box>
            
            {/* Track Shipment Button */}
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleTrackShipment}
                startIcon={<LocationOn />}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Track Your Shipment
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Row 2 */}
        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <StatCard 
            title="Completed Delivery" 
            value={delivered} 
            icon={group26} 
            image={group20}
            onClick={handleCompletedDeliveryClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <StatCard 
            title="Bills" 
            value={bills} 
            icon={group21} 
            image={group30}
            onClick={handleBillsClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard 
            title="In Transit" 
            value={inTransitLoads} 
            icon={group28} 
            image={group27}
            onClick={handleInTransitClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard 
            title="Bids On Loads" 
            value={0} 
            icon={cancel} 
            image={localshipping}
            onClick={handleBidsOnLoadsClick}
          />
        </Box>

        {/* Row 3 */}
        {/* <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard title="Fleet Breakdown" value="0" icon={group29} image={autotowing} />
        </Box> */}
      </Box>
      <Box mt={4} id="dashboard-table">
        <Paper
          elevation={3}
          sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: (themeConfig?.content?.bgImage ? 'rgba(255,255,255,0.94)' : (themeConfig?.table?.bg || '#fff')), position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
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
          <Box
            sx={{
              bgcolor: (themeConfig?.table?.headerBg || '#1976d2'),
              color: (themeConfig?.table?.headerText || '#fff'),
              py: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {selectedCard}
            </Typography>
          </Box>
          

          <Box sx={{ position: 'relative', zIndex: 1 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: (themeConfig?.table?.headerBg || '#f8f9fa') }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {selectedCard === 'Bills' ? 'Bill ID' : 'Shipment ID'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {selectedCard === 'Bills' ? 'Type' : 'Load Type'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {selectedCard === 'Bills' ? 'From' : 'Origin'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {selectedCard === 'Bills' ? 'To' : 'Destination'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {selectedCard === 'Bills' ? 'Due Date' : 'Pickup Date'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {selectedCard === 'Bills' ? 'Amount' : 'Delivery Date'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {selectedCard === 'Bills' ? 'Status' : 'Driver'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography sx={{ mt: 1 }}>Loading data...</Typography>
                    </TableCell>
                  </TableRow>
                ) : tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography>No data available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.from}</TableCell>
                      <TableCell>{row.to}</TableCell>
                      <TableCell>{row.pickupDate || row.eta}</TableCell>
                      <TableCell>
                        {selectedCard === 'Bills' ? `$${row.rate || 'N/A'}` : (row.eta || 'N/A')}
                      </TableCell>
                      <TableCell>
                        {selectedCard === 'Bills' ? row.status : (row.driverName || 'N/A')}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: 
                              row.status === 'Delivered' ? '#4caf50' :
                              row.status === 'In Transit' ? '#2196f3' :
                              row.status === 'Bidding' ? '#ff9800' :
                              row.status === 'Assigned' ? '#9c27b0' :
                              row.status === 'Posted' ? '#607d8b' :
                              row.status === 'Paid' ? '#4caf50' :
                              row.status === 'Overdue' ? '#f44336' :
                              row.status === 'Pending' ? '#ff9800' : '#e0e0e0',
                            color: 'white',
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>

          {/* Pagination Controls */}
          {tableData.length > itemsPerPage && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2,
                borderTop: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {startIndex + 1} to {Math.min(endIndex, tableData.length)} of {tableData.length} entries
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    minWidth: 80
                  }}
                >
                  Previous
                </Button>
                
                <Typography variant="body2" sx={{ mx: 2 }}>
                  Page {currentPage} of {totalPages}
                </Typography>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    minWidth: 80
                  }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
