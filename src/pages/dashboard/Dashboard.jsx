import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../context/AuthContext';

// Fix for Leaflet default icons
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
import group23 from "../../assets/Icons super admin/Group23.png"
import group22 from "../../assets/Icons super admin/Group22.png"
import group26 from "../../assets/Icons super admin/Group26.png"
import group21 from "../../assets/Icons super admin/Group21.png"
import group28 from "../../assets/Icons super admin/Group28.png"
import cancel from "../../assets/Icons super admin/cancel.png"
import group29 from "../../assets/Icons super admin/group29.png"
import group20 from "../../assets/Icons super admin/Vectors/Group20.png"
import group30 from "../../assets/Icons super admin/Vectors/Group30.png"
import group27 from "../../assets/Icons super admin/Vectors/Group27.png"
import CardBoard from "../../assets/Icons super admin/Vectors/CardBoard.png"
import Deliver from "../../assets/Icons super admin/Vectors/Deliver.png"
import USA from "../../assets/Icons super admin/Vectors/USA.png"
import localshipping from "../../assets/Icons super admin/Vectors/localshipping.png"
import autotowing from "../../assets/Icons super admin/Vectors/autotowing.png"

const Dashboard = () => {
  const { user, userType } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dynamic table
  const [selectedCard, setSelectedCard] = useState('Bid Management');
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  
  // State for map data
  const [mapData, setMapData] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  const handleTrackShipment = () => {
    navigate('/live-tracker');
  };

  // Fetch shipment data for map
  const fetchMapData = async () => {
    try {
      setMapLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_API_URL}/api/v1/load/shipper/my-loads-detailed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.loads) {
        // Process shipment data for map markers
        const processedData = data.data.loads.map(load => {
          // Get coordinates from city names (you might want to use a geocoding service)
          const originCoords = getCoordinatesFromCity(load.origin.city, load.origin.state);
          const destinationCoords = getCoordinatesFromCity(load.destination.city, load.destination.state);
          
          return {
            id: load._id,
            shipmentNumber: load.shipmentNumber,
            status: load.status,
            origin: {
              city: load.origin.city,
              state: load.origin.state,
              coordinates: originCoords
            },
            destination: {
              city: load.destination.city,
              state: load.destination.state,
              coordinates: destinationCoords
            },
            pickupDate: load.pickupDate,
            deliveryDate: load.deliveryDate,
            rate: load.rate,
            loadType: load.loadType,
            weight: load.weight
          };
        }).filter(load => load.origin.coordinates && load.destination.coordinates);
        
        setMapData(processedData);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setMapLoading(false);
    }
  };

  // Helper function to get coordinates from city names
  const getCoordinatesFromCity = (city, state) => {
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
    for (const [key, coords] of Object.entries(cityCoordinates)) {
      if (city.includes(key) || key.includes(city)) {
        return coords;
      }
    }
    
    // Default coordinates (Houston, TX)
    return [29.7604, -95.3698];
  };

  // Fetch detailed loads data from API
  const fetchDetailedLoadsData = async (status = null) => {
    try {
      setTableLoading(true);
      const token = localStorage.getItem('token');
      
      // Build URL with optional status parameter
      let url = `${BASE_API_URL}/api/v1/load/shipper/my-loads-detailed`;
      if (status) {
        url += `?status=${status}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.loads) {
        // Format the API data for table display
        const formattedData = data.data.loads.slice(0, 5).map(load => ({
          id: load.shipmentNumber || 'N/A',
          type: load.loadType || 'OTR',
          from: `${load.origin.city}, ${load.origin.state}`,
          to: `${load.destination.city}, ${load.destination.state}`,
          eta: load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'N/A',
          status: load.status,
          weight: load.weight,
          rate: load.rate,
          pickupDate: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'N/A',
          driverName: load.acceptedBid?.driverName || 'N/A',
          vehicleNumber: load.acceptedBid?.vehicleNumber || 'N/A',
          commodity: load.commodity,
          vehicleType: load.vehicleType
        }));
        
        setTableData(formattedData);
      } else {
        throw new Error(data.message || 'Failed to fetch detailed loads data');
      }
    } catch (err) {
      console.error('Error fetching detailed loads data:', err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch pending delivery data (Bidding + Assigned loads)
  const fetchPendingDeliveryData = async () => {
    try {
      setTableLoading(true);
      const token = localStorage.getItem('token');
      
      // Make two API calls for Bidding and Assigned statuses
      const [biddingResponse, assignedResponse] = await Promise.all([
        fetch(`${BASE_API_URL}/api/v1/load/shipper/my-loads-detailed?status=Bidding`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${BASE_API_URL}/api/v1/load/shipper/my-loads-detailed?status=Assigned`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      if (!biddingResponse.ok || !assignedResponse.ok) {
        throw new Error('Failed to fetch pending delivery data');
      }

      const [biddingData, assignedData] = await Promise.all([
        biddingResponse.json(),
        assignedResponse.json()
      ]);

      // Combine loads from both responses
      const allLoads = [];
      if (biddingData.success && biddingData.data.loads) {
        allLoads.push(...biddingData.data.loads);
      }
      if (assignedData.success && assignedData.data.loads) {
        allLoads.push(...assignedData.data.loads);
      }

      // Format the combined data for table display
      const formattedData = allLoads.slice(0, 5).map(load => ({
        id: load.shipmentNumber || 'N/A',
        type: load.loadType || 'OTR',
        from: `${load.origin.city}, ${load.origin.state}`,
        to: `${load.destination.city}, ${load.destination.state}`,
        eta: load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'N/A',
        status: load.status,
        weight: load.weight,
        rate: load.rate,
        pickupDate: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'N/A',
        driverName: load.acceptedBid?.driverName || 'N/A',
        vehicleNumber: load.acceptedBid?.vehicleNumber || 'N/A',
        commodity: load.commodity,
        vehicleType: load.vehicleType
      }));
      
      setTableData(formattedData);
    } catch (err) {
      console.error('Error fetching pending delivery data:', err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Sample data for different categories
  const getTableDataForCategory = (category) => {
    const sampleData = {
      'Total Delivery': [
        { id: 'LD0331', type: 'OTR', from: 'New York', to: 'Dallas', eta: '1d', status: 'Posted' },
        { id: 'LD0332', type: 'OTR', from: 'San Diego', to: 'Dallas', eta: '3d', status: 'Bidding' },
        { id: 'LD0333', type: 'OTR', from: 'Dallas', to: 'New York', eta: '5d', status: 'Assigned' },
        { id: 'LD0334', type: 'OTR', from: 'Dallas', to: 'Houston', eta: '7d', status: 'In Transit' },
        { id: 'LD0335', type: 'OTR', from: 'Houston', to: 'Phoenix', eta: '1d', status: 'Delivered' },
      ],
      'Pending Delivery': [
        { id: 'LD0331', type: 'OTR', from: 'New York', to: 'Dallas', eta: '1d', status: 'Posted' },
        { id: 'LD0332', type: 'OTR', from: 'San Diego', to: 'Dallas', eta: '3d', status: 'Bidding' },
      ],
      'Completed Delivery': [
        { id: 'LD0335', type: 'OTR', from: 'Houston', to: 'Phoenix', eta: '1d', status: 'Delivered' },
        { id: 'LD0336', type: 'OTR', from: 'Miami', to: 'Atlanta', eta: '2d', status: 'Delivered' },
      ],
      'Bills': [
        { id: 'BILL001', type: 'Invoice', from: 'JBL Logistics', to: 'Client A', eta: 'Due', status: 'Pending' },
        { id: 'BILL002', type: 'Invoice', from: 'JBL Logistics', to: 'Client B', eta: 'Overdue', status: 'Overdue' },
        { id: 'BILL003', type: 'Invoice', from: 'JBL Logistics', to: 'Client C', eta: 'Due', status: 'Paid' },
      ],
      'In Transit': [
        { id: 'LD0334', type: 'OTR', from: 'Dallas', to: 'Houston', eta: '7d', status: 'In Transit' },
        { id: 'LD0337', type: 'OTR', from: 'Chicago', to: 'Denver', eta: '4d', status: 'In Transit' },
      ],
      'Bids On Loads': [
        { id: 'LD0331', type: 'OTR', from: 'New York', to: 'Dallas', eta: '1d', status: 'Bidding' },
        { id: 'LD0332', type: 'OTR', from: 'San Diego', to: 'Dallas', eta: '3d', status: 'Bidding' },
        { id: 'LD0338', type: 'OTR', from: 'Seattle', to: 'Portland', eta: '2d', status: 'Bidding' },
      ],
      'Bid Management': [
        { id: 'LD0331', type: 'OTR', from: 'New York', to: 'Dallas', eta: '1d', status: 'Bidding' },
        { id: 'LD0332', type: 'OTR', from: 'San Diego', to: 'Dallas', eta: '3d', status: 'Bidding' },
        { id: 'LD0333', type: 'OTR', from: 'Dallas', to: 'New York', eta: '5d', status: 'Assigned' },
        { id: 'LD0334', type: 'OTR', from: 'Dallas', to: 'Houston', eta: '7d', status: 'In Transit' },
        { id: 'LD0335', type: 'OTR', from: 'Houston', to: 'Phoenix', eta: '1d', status: 'Delivered' },
      ]
    };
    return sampleData[category] || [];
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
    }, 100); // Small delay to ensure table is rendered
  };

  // Click handlers for dashboard cards
  const handleTotalDeliveryClick = () => {
    setSelectedCard('Total Delivery');
    fetchDetailedLoadsData(); // Call API to get real data
    scrollToTable();
  };

  const handlePendingDeliveryClick = () => {
    setSelectedCard('Pending Delivery');
    setTableData([]); // Set empty data array
    scrollToTable();
  };

  const handleCompletedDeliveryClick = () => {
    setSelectedCard('Completed Delivery');
    fetchDetailedLoadsData('Delivered'); // Call API with status=Delivered
    scrollToTable();
  };

  const handleBillsClick = () => {
    setSelectedCard('Bills');
    setTableData(getTableDataForCategory('Bills'));
    scrollToTable();
  };

  const handleInTransitClick = () => {
    setSelectedCard('In Transit');
    fetchDetailedLoadsData('In Transit'); // Call API with status=In Transit
    scrollToTable();
  };

  const handleBidsOnLoadsClick = () => {
    setSelectedCard('Bids On Loads');
    setTableData(getTableDataForCategory('Bids On Loads'));
    scrollToTable();
  };

  // Fetch dashboard data based on user type
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      
      // Determine API endpoint based on user type
      const endpoint = userType === 'shipper' 
        ? '/api/v1/load/shipper/dashboard'
        : '/api/v1/load/trucker/dashboard';
      
      const response = await fetch(`${BASE_API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data if user is a shipper or trucker
    if (userType === 'shipper' || userType === 'trucker') {
      fetchDashboardData();
      fetchMapData(); // Fetch map data
    } else {
      setLoading(false);
    }
    
    // Initialize table as empty (no default data)
    setTableData([]);
  }, [userType]);

  
  const StatCard = ({ title, value, icon, image, onClick }) => (
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
        '&:hover': onClick ? {
          elevation: 4,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        } : {},
      }}
    >
      {/* Top Header */}
      <Box display="flex" alignItems="center" gap={1}>
        <Box
        // sx={{
        //   backgroundColor: '#1E293B',
        //   p: 1,
        //   borderRadius: '50%',
        //   display: 'flex',
        //   alignItems: 'center',
        //   justifyContent: 'center',
        // }}
        >
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
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading dashboard data: {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  // Get dashboard values from API data or use defaults
  const getDashboardValue = (key) => {
    if ((userType === 'shipper' || userType === 'trucker') && dashboardData?.dashboard) {
      // Handle statusBreakdown data
      if (key === 'delivered') {
        return dashboardData.dashboard.statusBreakdown?.delivered || 0;
      }
      return dashboardData.dashboard[key] || 0;
    }
    // Default values for non-shipper/trucker users or when data is not available
    const defaults = {
      totalLoads: 100,
      todayDeliveries: 60,
      pendingDeliveries: 0,
      activeLoads: 40,
      delayedLoads: 5,
      inTransitLoads: 15,
      overdueLoads: 0,
      delivered: 0
      
    };
    return defaults[key] || 0;
  };

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
            value={getDashboardValue('totalLoads')} 
            icon={group23} 
            image={CardBoard}
            onClick={handleTotalDeliveryClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard 
            title="Pending Delivery" 
            value={getDashboardValue('pendingDeliveries')} 
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
                <MapContainer
                  center={[39.8283, -98.5795]} // Center of USA
                  zoom={4}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Render current location markers */}
                  {mapData.map((shipment) => {
                    // Calculate current location (midpoint between origin and destination for demo)
                    const currentLat = (shipment.origin.coordinates[0] + shipment.destination.coordinates[0]) / 2;
                    const currentLng = (shipment.origin.coordinates[1] + shipment.destination.coordinates[1]) / 2;
                    
                    return (
                      <Marker key={shipment.id} position={[currentLat, currentLng]}>
                        <Popup>
                          <Box sx={{ p: 1, minWidth: 200 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                              {shipment.shipmentNumber}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Status:</strong> {shipment.status}
                            </Typography>
                            <Typography variant="body2">
                              <strong>From:</strong> {shipment.origin.city}, {shipment.origin.state}
                            </Typography>
                            <Typography variant="body2">
                              <strong>To:</strong> {shipment.destination.city}, {shipment.destination.state}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Pickup:</strong> {new Date(shipment.pickupDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Delivery:</strong> {new Date(shipment.deliveryDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Rate:</strong> ${shipment.rate}
                            </Typography>
                          </Box>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
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
            value={getDashboardValue('delivered')} 
            icon={group26} 
            image={group20}
            onClick={handleCompletedDeliveryClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <StatCard 
            title="Bills" 
            value={getDashboardValue('delayedLoads')} 
            icon={group21} 
            image={group30}
            onClick={handleBillsClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard 
            title="In Transit" 
            value={getDashboardValue('inTransitLoads')} 
            icon={group28} 
            image={group27}
            onClick={handleInTransitClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1' }}>
          <StatCard 
            title="Bids On Loads" 
            value={getDashboardValue('overdueLoads')} 
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
          sx={{ borderRadius: 3, overflow: 'hidden' }}
        >
          <Box
            sx={{
              bgcolor: '#1976d2',
              color: '#fff',
              py: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {selectedCard}
            </Typography>
          </Box>
          

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
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
                  tableData.map((row, index) => (
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

          {/* <Box textAlign="center" py={2}>
          <Button
            variant="contained"
            sx={{
              borderRadius: 10,
              textTransform: 'none',
              backgroundColor: '#2196f3',
              px: 4,
              '&:hover': { backgroundColor: '#1976d2' },
            }}
          >
            View all
          </Button>
        </Box> */}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;