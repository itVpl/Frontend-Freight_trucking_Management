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
import { BASE_API_URL, GOOGLE_MAPS_API_KEY } from '../../apiConfig';
import GoogleMap from '../../components/maps/GoogleMap';
import group23 from "../../assets/Icons super admin/Group23.png"
import group22 from "../../assets/Icons super admin/Group22.png"
import group26 from "../../assets/Icons super admin/Group26.png"
import group21 from "../../assets/Icons super admin/Group21.png"
import group28 from "../../assets/Icons super admin/Group28.png"
import cancel from "../../assets/Icons super admin/cancel.png"
import group29 from "../../assets/Icons super admin/Group29.png"
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
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // State for actual counts from API calls
  const [actualCounts, setActualCounts] = useState({
    totalLoads: 0,
    pendingDeliveries: 0,
    delivered: 0,
    inTransit: 0,
    bidding: 0,
    bills: 0
  });
  
  // State for map data
  const [mapData, setMapData] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  const handleTrackShipment = () => {
    navigate('/live-tracker');
  };

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

  // Fetch shipment data for map
  const fetchMapData = async () => {
    try {
      setMapLoading(true);
      const token = localStorage.getItem('token');
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      
      const response = await fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed`, {
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
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      
      // Build URL with optional status parameter
      let url = `${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed`;
      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
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
        // Debug logging to understand API response structure
        console.log('=== API Response for loads ===');
        console.log('Full API Response:', data);
        console.log('Loads Array:', data.data.loads);
        
        // Log first load to see structure
        if (data.data.loads.length > 0) {
          console.log('First Load Object:', data.data.loads[0]);
          console.log('Origin Structure:', data.data.loads[0].origin);
          console.log('Destination Structure:', data.data.loads[0].destination);
          console.log('Origin Type:', typeof data.data.loads[0].origin);
          console.log('Destination Type:', typeof data.data.loads[0].destination);
          console.log('Is Origin Array:', Array.isArray(data.data.loads[0].origin));
          console.log('Is Destination Array:', Array.isArray(data.data.loads[0].destination));
        }
        
        // Format the API data for table display
        const formattedData = data.data.loads.map(load => {
          // Helper function to format location from origins/destinations array
          const formatLocationFromArray = (locationArray) => {
            if (!locationArray || !Array.isArray(locationArray) || locationArray.length === 0) {
              return 'N/A';
            }
            
            // Take the first location from the array
            const firstLocation = locationArray[0];
            if (firstLocation.city && firstLocation.state) {
              return `${firstLocation.city}, ${firstLocation.state}`;
            }
            if (firstLocation.city) {
              return firstLocation.city;
            }
            if (firstLocation.extractedCity) {
              return firstLocation.extractedCity;
            }
            return 'N/A';
          };
          
          return {
            id: load.shipmentNumber || load._id || 'N/A',
            type: load.loadType || 'OTR',
            from: formatLocationFromArray(load.origins),
            to: formatLocationFromArray(load.destinations),
            eta: load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'N/A',
            status: load.status || 'N/A',
            weight: load.weight || 'N/A',
            rate: load.rate || 'N/A',
            pickupDate: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'N/A',
            driverName: load.acceptedBid?.driverName || 'N/A',
            vehicleNumber: load.acceptedBid?.vehicleNumber || 'N/A',
            commodity: load.commodity || 'N/A',
            vehicleType: load.vehicleType || 'N/A'
          };
        });
        
        setTableData(formattedData);
        setCurrentPage(1); // Reset to first page when new data loads
        
        // Update actual counts based on status
        if (status === 'Bidding') {
          setActualCounts(prev => ({ ...prev, bidding: data.data.loads.length }));
        } else if (status === 'Delivered') {
          setActualCounts(prev => ({ ...prev, delivered: data.data.loads.length }));
        } else if (status === 'In Transit') {
          setActualCounts(prev => ({ ...prev, inTransit: data.data.loads.length }));
        } else if (!status) {
          setActualCounts(prev => ({ ...prev, totalLoads: data.data.loads.length }));
        }
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

  // Fetch bills data from API
  const fetchBillsData = async () => {
    try {
      setTableLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_API_URL}/api/v1/bill/my-bills`, {
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
      
      console.log('Bills API Response:', data);
      console.log('Has bills?', data.bills);
      console.log('Bills count:', data.count);
      
      if (data.success && data.bills && data.bills.length > 0) {
        // Format the API data for table display
        const formattedData = data.bills.map(bill => ({
          id: bill.billNumber || bill._id || 'N/A',
          type: 'Invoice',
          from: bill.pickup?.city || bill.pickup?.address || 'N/A',
          to: bill.delivery?.city || bill.delivery?.address || 'N/A',
          eta: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A',
          status: bill.status || 'Pending',
          rate: bill.billing?.total || 0,
          pickupDate: bill.invoiceDate ? new Date(bill.invoiceDate).toLocaleDateString() : 'N/A',
          driverName: bill.paymentTerms?.description || 'N/A',
          vehicleNumber: 'N/A',
          commodity: 'N/A',
          vehicleType: 'N/A'
        }));
        
        setTableData(formattedData);
        setCurrentPage(1); // Reset to first page when new data loads
      } else {
        setTableData([]);
      }
    } catch (err) {
      console.error('Error fetching bills data:', err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch pending delivery data (In Transit loads only)
  const fetchPendingDeliveryData = async () => {
    try {
      setTableLoading(true);
      const token = localStorage.getItem('token');
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      
      // Fetch only In Transit status loads
      const inTransitResponse = await fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=In%20Transit`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!inTransitResponse.ok) {
        throw new Error('Failed to fetch pending delivery data');
      }

      const inTransitData = await inTransitResponse.json();

      // Get loads from In Transit response
      const allLoads = [];
      if (inTransitData.success && inTransitData.data.loads) {
        allLoads.push(...inTransitData.data.loads);
      }

      // Format the combined data for table display
      const formattedData = allLoads.map(load => {
        // Helper function to format location from origins/destinations array
        const formatLocationFromArray = (locationArray) => {
          if (!locationArray || !Array.isArray(locationArray) || locationArray.length === 0) {
            return 'N/A';
          }
          
          // Take the first location from the array
          const firstLocation = locationArray[0];
          if (firstLocation.city && firstLocation.state) {
            return `${firstLocation.city}, ${firstLocation.state}`;
          }
          if (firstLocation.city) {
            return firstLocation.city;
          }
          if (firstLocation.extractedCity) {
            return firstLocation.extractedCity;
          }
          return 'N/A';
        };
        
        return {
          id: load.shipmentNumber || load._id || 'N/A',
          type: load.loadType || 'OTR',
          from: formatLocationFromArray(load.origins),
          to: formatLocationFromArray(load.destinations),
          eta: load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : 'N/A',
          status: load.status || 'N/A',
          weight: load.weight || 'N/A',
          rate: load.rate || 'N/A',
          pickupDate: load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'N/A',
          driverName: load.acceptedBid?.driverName || 'N/A',
          vehicleNumber: load.acceptedBid?.vehicleNumber || 'N/A',
          commodity: load.commodity || 'N/A',
          vehicleType: load.vehicleType || 'N/A'
        };
      });
      
      setTableData(formattedData);
      setCurrentPage(1); // Reset to first page when new data loads
      
      // Update pending delivery count
      setActualCounts(prev => ({ ...prev, pendingDeliveries: allLoads.length }));
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

  // Pagination logic
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTableData = tableData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
    fetchPendingDeliveryData(); // Call API to get Bidding + Assigned + In Transit loads
    scrollToTable();
  };

  const handleCompletedDeliveryClick = () => {
    setSelectedCard('Completed Delivery');
    fetchDetailedLoadsData('Delivered'); // Call API with status=Delivered
    scrollToTable();
  };

  const handleBillsClick = () => {
    setSelectedCard('Bills');
    fetchBillsData(); // Call API to get real bills data
    scrollToTable();
  };

  const handleInTransitClick = () => {
    setSelectedCard('In Transit');
    fetchDetailedLoadsData('In Transit'); // Call API with status=In Transit
    scrollToTable();
  };

  const handleBidsOnLoadsClick = () => {
    setSelectedCard('Bids On Loads');
    fetchDetailedLoadsData('Bidding'); // Call API with status=Bidding to get loads with bids
    scrollToTable();
  };

  // Load actual counts for all categories
  const loadActualCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = userType === 'trucker' ? 'trucker' : 'shipper';
      
      // Load all counts in parallel including bills
      const [totalResponse, biddingResponse, deliveredResponse, inTransitResponse, billsResponse] = await Promise.all([
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=Bidding`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=Delivered`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BASE_API_URL}/api/v1/load/${role}/my-loads-detailed?status=In Transit`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BASE_API_URL}/api/v1/bill/my-bills`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [totalData, biddingData, deliveredData, inTransitData, billsData] = await Promise.all([
        totalResponse.json(),
        biddingResponse.json(),
        deliveredResponse.json(),
        inTransitResponse.json(),
        billsResponse.json()
      ]);

      // Update actual counts
      const inTransitCount = inTransitData.success ? inTransitData.data.loads.length : 0;
      const billsCount = billsData.success && billsData.bills ? billsData.bills.length : 0;
      
      setActualCounts({
        totalLoads: totalData.success ? totalData.data.loads.length : 0,
        bidding: biddingData.success ? biddingData.data.loads.length : 0,
        delivered: deliveredData.success ? deliveredData.data.loads.length : 0,
        inTransit: inTransitCount,
        pendingDeliveries: inTransitCount, // Same as In Transit
        bills: billsCount
      });

    } catch (err) {
      console.error('Error loading actual counts:', err);
    }
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
      
      const startTime = performance.now();
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
        // Set data first, then immediately hide loading
        setDashboardData(data.data);
        setLoading(false);
        const endTime = performance.now();
        console.log(`Dashboard API response time: ${(endTime - startTime).toFixed(2)}ms`);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data if user is a shipper or trucker
    if (userType === 'shipper' || userType === 'trucker') {
      // Main dashboard API - controls the loading state
      fetchDashboardData();
      
      // Load map data immediately in parallel (doesn't block UI)
      fetchMapData().catch(err => console.error('Error fetching map data:', err));
      
      // Lazy load actual counts after initial render (used to refine values)
      // These are used to override dashboard API values, but dashboard API has fallback values
      setTimeout(() => {
        loadActualCounts().catch(err => console.error('Error loading actual counts:', err));
      }, 300); // Load counts 300ms after initial render (reduced from 500ms)
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

  // Show loading state with skeleton
  if (loading) {
    return <DashboardSkeleton />;
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
  // Priority: dashboardData (from main API) > actualCounts (lazy loaded) > defaults
  const getDashboardValue = (key) => {
    // First, try to use main dashboard API data (fastest, already loaded)
    if ((userType === 'shipper' || userType === 'trucker') && dashboardData?.dashboard) {
      // Handle statusBreakdown data
      if (key === 'delivered') {
        const dashboardValue = dashboardData.dashboard.statusBreakdown?.delivered;
        if (dashboardValue !== undefined && dashboardValue !== null) {
          return dashboardValue;
        }
      }
      // Check if dashboard has this key
      const dashboardValue = dashboardData.dashboard[key];
      if (dashboardValue !== undefined && dashboardValue !== null) {
        return dashboardValue;
      }
      // Special handling for inTransitLoads - check dashboard first
      if (key === 'inTransitLoads' || key === 'pendingDeliveries') {
        const inTransitValue = dashboardData.dashboard.inTransitLoads || dashboardData.dashboard.inTransit;
        if (inTransitValue !== undefined && inTransitValue !== null) {
          return inTransitValue;
        }
      }
    }
    
    // Fallback to actualCounts if available (lazy loaded, more accurate)
    if (key === 'pendingDeliveries') {
      if (actualCounts.inTransit !== undefined && actualCounts.inTransit !== null) {
        return actualCounts.inTransit;
      }
    }
    
    if (key === 'inTransitLoads') {
      if (actualCounts.inTransit !== undefined && actualCounts.inTransit !== null) {
        return actualCounts.inTransit;
      }
    }
    
    // Use actual counts if available (check for undefined, not just > 0)
    if (actualCounts[key] !== undefined && actualCounts[key] !== null) {
      return actualCounts[key];
    }
    
    // Default values for non-shipper/trucker users or when data is not available
    const defaults = {
      totalLoads: 0,
      todayDeliveries: 0,
      pendingDeliveries: 0,
      activeLoads: 0,
      delayedLoads: 0,
      inTransitLoads: 0,
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
            value={getDashboardValue('delivered')} 
            icon={group26} 
            image={group20}
            onClick={handleCompletedDeliveryClick}
          />
        </Box>
        <Box sx={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <StatCard 
            title="Bills" 
            value={getDashboardValue('bills') || 0} 
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
                  currentTableData.map((row, index) => (
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