import React, { useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Collapse,
  IconButton,
  Avatar,
  Stack,
  Modal,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import SpeedIcon from "@mui/icons-material/Speed";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import { Button } from "@mui/material";
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "../../components/PageLoader";
import LiveTrackerMap from "../../components/maps/LiveTrackerMap";
import { GOOGLE_MAPS_API_KEY } from "../../apiConfig";

// Add CSS for spinner animation
const customStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default function LiveTracker() {
  const navigate = useNavigate();
  const { user, userType, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [consignments, setConsignments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [routePaths, setRoutePaths] = useState({});
  const [mapView, setMapView] = useState("route"); // "route" or "current"
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [helpLoading, setHelpLoading] = useState({});
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [selectedDriverInfo, setSelectedDriverInfo] = useState(null);

  // Function to get authentication token
  const getAuthToken = () => {
    const possibleKeys = ['token', 'authToken', 'accessToken', 'jwt'];
    const storages = [sessionStorage, localStorage];
    
    // Debug: Log all keys in storage
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    console.log('LocalStorage keys:', Object.keys(localStorage));
    
    for (const storage of storages) {
      for (const key of possibleKeys) {
        const token = storage.getItem(key);
        if (token && token.trim() !== '') {
          console.log(`Token found in ${storage === sessionStorage ? 'sessionStorage' : 'localStorage'} with key: ${key}`);
          return token;
        }
      }
    }
    
    // Try to find any key that might contain a token
    for (const storage of storages) {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        const value = storage.getItem(key);
        if (value && (value.includes('eyJ') || value.includes('Bearer') || value.length > 50)) {
          console.log(`Potential token found in ${storage === sessionStorage ? 'sessionStorage' : 'localStorage'} with key: ${key}`);
          return value.replace('Bearer ', ''); // Remove Bearer prefix if present
        }
      }
    }
    
    console.log('No authentication token found');
    return null;
  };

  // Function to fetch optimized route from OSRM with enhanced details
  const fetchRoute = async (originLat, originLng, destLat, destLng) => {
    try {
      console.log('Fetching route for:', { originLat, originLng, destLat, destLng });
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true&annotations=true`
      );
      
      if (response.data && response.data.routes && response.data.routes[0]) {
        const route = response.data.routes[0];
        const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        console.log('Route path created:', path.length, 'points');
        return {
          path: path,
          distance: route.distance,
          duration: route.duration,
          steps: route.legs[0]?.steps || []
        };
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      // Fallback: create a simple straight line if OSRM fails
      return {
        path: [[originLat, originLng], [destLat, destLng]],
        distance: 0,
        duration: 0,
        steps: []
      };
    }
    return null;
  };

  // Help button click handler
  const handleHelpClick = async (truck) => {
    const token = getAuthToken();
    if (!token) {
      alert('Authentication required. Please login first.');
      return;
    }
    
    // Set loading state for this specific truck
    setHelpLoading(prev => ({ ...prev, [truck.id]: true }));
    
    try {
      // Make authenticated request to help API based on user type
      const helpEndpoint = userType === 'trucker' 
        ? `https://vpl-liveproject-1.onrender.com/api/v1/load/trucker/load/${truck.id}/help-auto`
        : `https://vpl-liveproject-1.onrender.com/api/v1/load/shipper/load/${truck.id}/help-auto`;
      
      const response = await axios.get(helpEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If successful, open the help page
      if (response.data) {
        // Create a new window with the help content
        const helpWindow = window.open('', '_blank');
        helpWindow.document.write(response.data);
        helpWindow.document.close();
      }
    } catch (error) {
      console.error('Help API Error:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        alert('User not found. Please contact support.');
      } else {
        alert('Error loading help page. Please try again.');
      }
    } finally {
      // Clear loading state
      setHelpLoading(prev => ({ ...prev, [truck.id]: false }));
    }
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

  const toggleExpand = async (item) => {
    const isExpanding = expandedId !== item.id;
    
    if (isExpanding) {
      // Expanding - set the item as selected
      setExpandedId(item.id);
      setSelectedShipment(item);
      
      console.log('🔄 Expanding shipment:', item.id, item.number);
      console.log('📍 Shipment coordinates:', {
        originLat: item.originLat,
        originLng: item.originLng,
        destLat: item.destLat,
        destLng: item.destLng,
        currentLat: item.lat,
        currentLng: item.lng
      });
      console.log('📍 Full item data:', item);
      
      // Check if we have valid coordinates (not 0, null, undefined, or NaN)
      const hasValidOrigin = item.originLat && item.originLng && 
                            !isNaN(item.originLat) && !isNaN(item.originLng) &&
                            item.originLat !== 0 && item.originLng !== 0;
      const hasValidDest = item.destLat && item.destLng && 
                          !isNaN(item.destLat) && !isNaN(item.destLng) &&
                          item.destLat !== 0 && item.destLng !== 0;
      
      console.log('🔍 Validation:', { hasValidOrigin, hasValidDest });
      
      if (!hasValidOrigin || !hasValidDest) {
        console.log('⚠️ Invalid coordinates for shipment:', item.number, '- Cannot fetch route');
        console.log('💡 Origin valid:', hasValidOrigin, 'Destination valid:', hasValidDest);
      } else {
        // Check if route data exists, if not fetch it
        if (!routePaths[item.id]) {
          console.log('🔄 Route data not found for item:', item.id, 'Fetching route...');
          
          try {
            const routeData = await fetchRoute(item.originLat, item.originLng, item.destLat, item.destLng);
            if (routeData && routeData.path && routeData.path.length > 0) {
              setRoutePaths(prev => ({
                ...prev,
                [item.id]: routeData
              }));
              console.log('✅ Route data fetched and set for item:', item.id, 'with', routeData.path.length, 'points');
            }
          } catch (error) {
            console.error('❌ Error fetching route for item:', item.id, error);
          }
        } else {
          console.log('✅ Route data already exists for item:', item.id);
        }
      }
      
      // Change map view to show full route when expanded
      setMapView("route");
    } else {
      // Collapsing - clear selection
      setExpandedId(null);
      setSelectedShipment(null);
    }
  };

  const fetchConsignments = async () => {
    // Check if we have a token first
    const token = getAuthToken();
    setHasToken(!!token);
    
    // If no token and no search term, skip API call
    if (!token && !searchTerm.trim()) {
      console.log('No token found and no search term, skipping API call');
      setConsignments([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let res;
      if (searchTerm.trim()) {
        res = await axios.get(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipment/${searchTerm.toUpperCase()}`);
        console.log('API Response for single shipment:', res.data);
        
        // Handle different response structures
        let loadData = null;
        let trackingData = null;
        
        // Check if response has tracking data (old format)
        if (res.data?.tracking) {
          trackingData = res.data.tracking;
          loadData = res.data.tracking;
          console.log('Processing tracking data format:', loadData);
        } 
        // Check if response has verifiedLoads array (new format)
        else if (res.data?.success && res.data?.data?.verifiedLoads && Array.isArray(res.data.data.verifiedLoads) && res.data.data.verifiedLoads.length > 0) {
          // Get first load from verifiedLoads array
          loadData = res.data.data.verifiedLoads[0];
          console.log('Processing verifiedLoads format:', loadData);
          
          // Try to get tracking data separately if shipment number is available
          if (loadData.loadReference?.shipmentNumber) {
            try {
              const trackingRes = await axios.get(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipment/${loadData.loadReference.shipmentNumber}`);
              if (trackingRes.data?.tracking) {
                trackingData = trackingRes.data.tracking;
                console.log('✅ Found separate tracking data:', trackingData);
              }
            } catch (err) {
              console.log('Could not fetch separate tracking data');
            }
          }
        }
        // Check if response has data.load (single load format)
        else if (res.data?.success && res.data?.data?.load) {
          loadData = res.data.data.load;
          console.log('Processing single load format:', loadData);
        }
        
        if (loadData) {
          // Extract coordinates from different possible structures
          let originLat = 0, originLng = 0, destLat = 0, destLng = 0, currentLat = 0, currentLng = 0;
          let driverName = "Driver";
          let vehicleNumber = "N/A";
          let shipmentNumber = "";
          let originName = "Origin";
          let destinationName = "Destination";
          
          // Try to get coordinates from loadReference.origins/destinations (new format)
          if (loadData.loadReference?.origins?.[0]) {
            originLat = parseFloat(loadData.loadReference.origins[0].lat) || 0;
            originLng = parseFloat(loadData.loadReference.origins[0].lon) || 0;
            originName = loadData.loadReference.origins[0].city || loadData.loadReference.origins[0].addressLine1 || "Origin";
          }
          
          if (loadData.loadReference?.destinations?.[0]) {
            destLat = parseFloat(loadData.loadReference.destinations[0].lat) || 0;
            destLng = parseFloat(loadData.loadReference.destinations[0].lon) || 0;
            destinationName = loadData.loadReference.destinations[0].city || loadData.loadReference.destinations[0].addressLine1 || "Destination";
          }
          
          // Fallback to old format if new format doesn't have coordinates
          if ((originLat === 0 || originLng === 0) && loadData.originLatLng) {
            originLat = parseFloat(loadData.originLatLng.lat) || 0;
            originLng = parseFloat(loadData.originLatLng.lon) || 0;
          }
          
          if ((destLat === 0 || destLng === 0) && loadData.destinationLatLng) {
            destLat = parseFloat(loadData.destinationLatLng.lat) || 0;
            destLng = parseFloat(loadData.destinationLatLng.lon) || 0;
          }
          
          // Get current location
          if (loadData.currentLocation) {
            currentLat = parseFloat(loadData.currentLocation.lat) || parseFloat(loadData.currentLocation.latitude) || originLat;
            currentLng = parseFloat(loadData.currentLocation.lon) || parseFloat(loadData.currentLocation.longitude) || originLng;
          } else if (loadData.loadReference?.destinationPlace?.location) {
            // Use destination as current if no current location
            currentLat = destLat || originLat;
            currentLng = destLng || originLng;
          } else {
            currentLat = originLat;
            currentLng = originLng;
          }
          
          // Get driver name from multiple possible locations
          // Priority: tracking data > loadReference.acceptedBid > other sources
          driverName = trackingData?.driverName ||
                      loadData.loadReference?.acceptedBid?.driverName || 
                      loadData.acceptedBid?.driverName || 
                      loadData.driverName || 
                      loadData.tracking?.driverName ||
                      loadData.assignedTo?.driverName ||
                      loadData.assignedTo?.name ||
                      loadData.assignedTo?.contactPerson ||
                      "Driver";
          
          console.log('Driver name extraction:', {
            fromTracking: trackingData?.driverName,
            fromAcceptedBid: loadData.loadReference?.acceptedBid?.driverName,
            final: driverName
          });
          
          // Get vehicle number
          vehicleNumber = loadData.loadReference?.acceptedBid?.vehicleNumber || 
                         loadData.acceptedBid?.vehicleNumber || 
                         loadData.vehicleNumber || 
                         loadData.tracking?.vehicleNumber ||
                         "N/A";
          
          // Get shipment number
          shipmentNumber = loadData.loadReference?.shipmentNumber || 
                         loadData.shipmentNumber || 
                         loadData.tracking?.shipmentNumber ||
                         searchTerm.toUpperCase();
          
          // Get origin/destination names
          if (!originName || originName === "Origin") {
            originName = loadData.originName || 
                        loadData.loadReference?.originPlace?.location || 
                        loadData.shipper?.pickUpLocations?.[0]?.city ||
                        "Origin";
          }
          
          if (!destinationName || destinationName === "Destination") {
            destinationName = loadData.destinationName || 
                             loadData.loadReference?.destinationPlace?.location || 
                             loadData.shipper?.dropLocations?.[0]?.city ||
                             "Destination";
          }
          
          console.log('Extracted coordinates:', { 
            originLat, originLng, destLat, destLng, currentLat, currentLng,
            driverName, vehicleNumber, shipmentNumber
          });
          
          const shipment = {
            id: loadData._id || loadData.loadReference?._id || Date.now().toString(),
            number: shipmentNumber,
            location: `${originName} → ${destinationName}`,
            lat: currentLat,
            lng: currentLng,
            originLat: originLat,
            originLng: originLng,
            destLat: destLat,
            destLng: destLng,
            driverName: driverName,
            vehicleNumber: vehicleNumber,
            weight: loadData.loadReference?.weight || loadData.weight,
            commodity: loadData.loadReference?.commodity || loadData.commodity,
            status: [
              {
                label: "Assigned",
                name: `Driver Name: ${driverName}`,
                time: new Date(loadData.loadReference?.pickupDate || loadData.pickupDate || loadData.startedAt || Date.now()).toLocaleString(),
                done: true,
              },
              {
                label: "In-Transit",
                name: `Driver Name: ${driverName}`,
                time: new Date(loadData.currentLocation?.updatedAt || loadData.loadReference?.destinationPlace?.arrivedAt || Date.now()).toLocaleString(),
                done: loadData.status !== "loading" && loadData.status !== "Loading",
              },
              {
                label: "Delivered",
                name: `Driver Name: ${driverName}`,
                time: new Date(loadData.loadReference?.deliveryDate || loadData.deliveryDate || loadData.load?.deliveryDate || Date.now()).toLocaleString(),
                done: loadData.status === "delivered" || loadData.status === "Delivered",
              },
            ],
            // Add currentLocation data for popup
            currentLocation: {
              address: loadData.currentLocation?.address || 'N/A',
              speed: loadData.currentLocation?.speed || null,
              heading: loadData.currentLocation?.heading || null,
              accuracy: loadData.currentLocation?.accuracy || null,
              deviceInfo: loadData.currentLocation?.deviceInfo || null,
            },
          };
          
          console.log('Created shipment object:', shipment);
          setConsignments([shipment]);
          
          // Fetch optimized route for this shipment immediately
          if (originLat && originLng && destLat && destLng && originLat !== 0 && originLng !== 0 && destLat !== 0 && destLng !== 0) {
            console.log('📍 Fetching route for searched shipment:', shipment.number);
            try {
              const routeData = await fetchRoute(originLat, originLng, destLat, destLng);
              
              if (routeData && routeData.path && routeData.path.length > 0) {
                setRoutePaths(prev => ({
                  ...prev,
                  [shipment.id]: routeData
                }));
                console.log('✅ Route data set for searched shipment with', routeData.path.length, 'points');
              }
            } catch (error) {
              console.error('❌ Error fetching route for searched shipment:', error);
            }
          }
        } else {
          console.log('No valid load data found in API response');
          setConsignments([]);
        }
      } else {
        // Use the new API endpoint for in-transit loads with location
        console.log('Fetching in-transit loads from API...');
        
        // Try with authentication headers first
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log('Token found:', !!token);
        console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
        console.log('Making API call with headers:', headers);
        
        // If no token found, show message and return
        if (!token) {
          console.log('No authentication token found. Please login first.');
          setConsignments([]);
          setLoading(false);
          return;
        }
        
        // Use different API endpoints based on user type
        // Default to shipper if userType is not set
        const currentUserType = userType || 'shipper';
        const apiEndpoint = currentUserType === 'trucker' 
          ? 'https://vpl-liveproject-1.onrender.com/api/v1/load/trucker/in-transit-loads-with-location'
          : 'https://vpl-liveproject-1.onrender.com/api/v1/load/shipper/in-transit-loads-with-location';
        
        console.log(`Using API endpoint for ${currentUserType}:`, apiEndpoint);
        
        res = await axios.get(apiEndpoint, {
          headers: headers
        });
        console.log('Full API Response:', res);
        console.log('API Response data:', res.data);
        console.log('API Response status:', res.status);
        
        // Process the new API response format
        if (res.data?.success && res.data?.data?.loads && Array.isArray(res.data.data.loads)) {
          const loads = res.data.data.loads;
          console.log('Processing loads data:', loads);
          
          const shipments = loads.map(load => {
            // Handle different data structures for shipper vs trucker APIs
            let originData, destinationData, currentLocationData, trackingData;
            const currentUserType = userType || 'shipper';
            
            // Try both formats - origins array or origin object
            originData = load.origins?.[0] || load.origin || {};
            destinationData = load.destinations?.[0] || load.destination || {};
            currentLocationData = load.currentLocation || load.tracking?.currentLocation || {};
            trackingData = load.tracking || {};
            
            // Debug: Log the raw load data structure
            console.log('🔍 Raw load data for', load.loadNumber || load._id, ':', {
              hasOrigin: !!load.origin,
              hasDestination: !!load.destination,
              hasOrigins: !!load.origins,
              hasDestinations: !!load.destinations,
              originKeys: load.origin ? Object.keys(load.origin) : [],
              destinationKeys: load.destination ? Object.keys(load.destination) : [],
              originsKeys: load.origins?.[0] ? Object.keys(load.origins[0]) : [],
              destinationsKeys: load.destinations?.[0] ? Object.keys(load.destinations[0]) : []
            });
            
            // Ensure coordinates are numbers with better parsing
            const originLat = parseFloat(originData.lat) || parseFloat(originData.latitude) || 0;
            const originLng = parseFloat(originData.lon) || parseFloat(originData.longitude) || parseFloat(originData.lng) || 0;
            const destLat = parseFloat(destinationData.lat) || parseFloat(destinationData.latitude) || 0;
            const destLng = parseFloat(destinationData.lon) || parseFloat(destinationData.longitude) || parseFloat(destinationData.lng) || 0;
            const currentLat = parseFloat(currentLocationData.latitude) || parseFloat(currentLocationData.lat) || originLat;
            const currentLng = parseFloat(currentLocationData.longitude) || parseFloat(currentLocationData.lon) || parseFloat(currentLocationData.lng) || originLng;
            
            console.log('📍 Load coordinates:', { 
              loadNumber: load.loadNumber || load._id,
              originData: originData,
              destinationData: destinationData,
              currentLocationData: currentLocationData,
              parsed: { originLat, originLng, destLat, destLng, currentLat, currentLng }
            });
            
            const shipment = {
              id: load._id,
              number: load.loadNumber || load.tracking?.shipmentNumber || load._id,
              location: `${originData.city || 'Origin'} → ${destinationData.city || 'Destination'}`,
              lat: currentLat,
              lng: currentLng,
              originLat: originLat,
              originLng: originLng,
              destLat: destLat,
              destLng: destLng,
              weight: load.weight,
              commodity: load.commodity,
              status: [
                {
                  label: "Assigned",
                  name: `Driver Name: ${load.acceptedBid?.driverName || "Driver"}`,
                  time: new Date(load.pickupDate || load.timeInfo?.daysSincePickup ? Date.now() - (load.timeInfo.daysSincePickup * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                  done: true,
                },
                {
                  label: "In-Transit",
                  name: `Driver Name: ${load.acceptedBid?.driverName || "Driver"}`,
                  time: new Date(trackingData.startedAt || load.currentLocation?.lastUpdated || Date.now()).toLocaleString(),
                  done: load.status === "In Transit",
                },
                {
                  label: "Delivered",
                  name: `Driver Name: ${load.acceptedBid?.driverName || "Driver"}`,
                  time: new Date(load.deliveryDate || load.timeInfo?.daysUntilDelivery ? Date.now() + (load.timeInfo.daysUntilDelivery * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                  done: load.status === "Delivered",
                },
              ],
              vehicleNumber: load.tracking?.vehicleNumber || load.acceptedBid?.vehicleNumber,
              driverName: load.acceptedBid?.driverName,
              driverPhone: load.acceptedBid?.driverPhone,
              hasLocationData: load.hasLocationData,
              // Add currentLocation data for popup
              currentLocation: {
                address: load.currentLocation?.address || 'N/A',
                speed: load.currentLocation?.speed || null,
                heading: load.currentLocation?.heading || null,
                accuracy: load.currentLocation?.accuracy || null,
                deviceInfo: load.currentLocation?.deviceInfo || null,
              },
            };
            
            console.log(`Processed load ${load.loadNumber}:`, {
              id: shipment.id,
              coordinates: {
                origin: [shipment.originLat, shipment.originLng],
                dest: [shipment.destLat, shipment.destLng],
                current: [shipment.lat, shipment.lng]
              }
            });
            
            return shipment;
          });
          
          setConsignments(shipments);
          
          // Fetch optimized routes for all loads
          const newRoutePaths = {};
          console.log('Starting to fetch routes for', loads.length, 'loads');
          
          // Use Promise.all to fetch all routes in parallel for better performance
          const routePromises = loads.map(async (load) => {
            // Handle different data structures for shipper vs trucker APIs
            let originData, destinationData;
            const currentUserType = userType || 'shipper';
            
            if (currentUserType === 'trucker') {
              // Trucker API structure
              originData = load.origins?.[0] || {};
              destinationData = load.destinations?.[0] || {};
            } else {
              // Shipper API structure (existing)
              originData = load.origin || {};
              destinationData = load.destination || {};
            }
            
            const originLat = parseFloat(originData.lat) || parseFloat(originData.latitude) || 0;
            const originLng = parseFloat(originData.lon) || parseFloat(originData.longitude) || 0;
            const destLat = parseFloat(destinationData.lat) || parseFloat(destinationData.latitude) || 0;
            const destLng = parseFloat(destinationData.lon) || parseFloat(destinationData.longitude) || 0;
            
            console.log(`Load ${load.loadNumber} coordinates:`, { 
              originLat, originLng, destLat, destLng,
              origin: load.origin,
              destination: load.destination
            });
            
            if (originLat && originLng && destLat && destLng) {
              console.log(`Fetching route for load ${load.loadNumber}...`);
              try {
                const routeData = await fetchRoute(originLat, originLng, destLat, destLng);
                
                if (routeData && routeData.path && routeData.path.length > 0) {
                  console.log(`✅ Route data saved for load ${load.loadNumber} with ${routeData.path.length} points`);
                  return { loadId: load._id, routeData };
                } else {
                  console.log(`❌ Failed to fetch route for load ${load.loadNumber} - no path data`);
                  return null;
                }
              } catch (error) {
                console.error(`❌ Error fetching route for load ${load.loadNumber}:`, error);
                return null;
              }
            } else {
              console.log(`⚠️ Invalid coordinates for load ${load.loadNumber}, skipping route fetch`);
              return null;
            }
          });
          
          // Wait for all route fetches to complete
          const routeResults = await Promise.all(routePromises);
          
          // Process results
          routeResults.forEach(result => {
            if (result) {
              newRoutePaths[result.loadId] = result.routeData;
            }
          });
          
          console.log('Route fetching completed. Total routes:', Object.keys(newRoutePaths).length);
          
          setRoutePaths(prev => {
            const updated = {
              ...prev,
              ...newRoutePaths
            };
            console.log('🔄 Updating route paths state:', {
              previous: Object.keys(prev).length,
              new: Object.keys(newRoutePaths).length,
              total: Object.keys(updated).length,
              keys: Object.keys(updated)
            });
            return updated;
          });
        } else {
          console.log('No loads found in API response or API response format is different');
          console.log('Response structure:', {
            success: res.data?.success,
            hasData: !!res.data?.data,
            hasLoads: !!res.data?.data?.loads,
            loadsIsArray: Array.isArray(res.data?.data?.loads),
            loadsLength: res.data?.data?.loads?.length
          });
          
          // Fallback to old API if new API doesn't work
          console.log('Trying fallback API...');
          try {
            const fallbackRes = await axios.get(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipment/`, {
              headers: headers
            });
            console.log('Fallback API response:', fallbackRes.data);
            
            if (fallbackRes.data?.data && Array.isArray(fallbackRes.data.data)) {
              const shipments = fallbackRes.data.data.map(track => ({
             id: track._id,
             number: track.shipmentNumber,
             location: `${track.originName} → ${track.destinationName}`,
             lat: track.currentLocation.lat,
             lng: track.currentLocation.lon,
             originLat: track.originLatLng.lat,
             originLng: track.originLatLng.lon,
             destLat: track.destinationLatLng.lat,
             destLng: track.destinationLatLng.lon,
             status: [
               {
                 label: "Assigned",
                 name: `Driver Name: ${track.driverName || "Driver"}`,
                 time: new Date(track.startedAt).toLocaleString(),
                 done: true,
               },
               {
                 label: "In-Transit",
                 name: `Driver Name: ${track.driverName || "Driver"}`,
                 time: new Date(track.currentLocation.updatedAt).toLocaleString(),
                 done: track.status !== "loading",
               },
               {
                 label: "Delivered",
                 name: `Driver Name: ${track.driverName || "Driver"}`,
                 time: new Date(track.load?.deliveryDate || Date.now()).toLocaleString(),
                 done: track.status === "delivered",
               },
             ],
           }));
           
           setConsignments(shipments);
              console.log('Fallback API successful, loaded', shipments.length, 'shipments');
            } else {
              setConsignments([]);
            }
          } catch (fallbackErr) {
            console.error('Fallback API also failed:', fallbackErr);
            
            // Try one more alternative endpoint
            console.log('Trying alternative endpoint...');
            try {
              const currentUserType = userType || 'shipper';
              const altEndpoint = currentUserType === 'trucker' 
                ? 'https://vpl-liveproject-1.onrender.com/api/v1/load/trucker/loads'
                : 'https://vpl-liveproject-1.onrender.com/api/v1/load/shipper/loads';
              
              const altRes = await axios.get(altEndpoint, {
                headers: headers
              });
              console.log('Alternative API response:', altRes.data);
              
              if (altRes.data?.data && Array.isArray(altRes.data.data)) {
                const shipments = altRes.data.data.map(load => {
                  // Handle different data structures for shipper vs trucker APIs
                  let originData, destinationData, currentLocationData;
                  
                  if (currentUserType === 'trucker') {
                    // Trucker API structure
                    originData = load.origins?.[0] || {};
                    destinationData = load.destinations?.[0] || {};
                    currentLocationData = load.tracking?.currentLocation || load.currentLocation || {};
                  } else {
                    // Shipper API structure (existing)
                    originData = load.origin || {};
                    destinationData = load.destination || {};
                    currentLocationData = load.currentLocation || {};
                  }
                  
                  return {
                    id: load._id,
                    number: load.loadNumber || load.tracking?.shipmentNumber || load.shipmentNumber,
                    location: `${originData.city || load.originName || 'Origin'} → ${destinationData.city || load.destinationName || 'Destination'}`,
                    lat: currentLocationData.latitude || currentLocationData.lat || 0,
                    lng: currentLocationData.longitude || currentLocationData.lon || 0,
                    originLat: originData.lat || load.originLatLng?.lat || 0,
                    originLng: originData.lon || load.originLatLng?.lon || 0,
                    destLat: destinationData.lat || load.destinationLatLng?.lat || 0,
                    destLng: destinationData.lon || load.destinationLatLng?.lon || 0,
                  weight: load.weight,
                  commodity: load.commodity,
                  status: [
                    {
                      label: "Assigned",
                      name: `Driver Name: ${load.assignedTo?.contactPerson || load.driverName || "Driver"}`,
                      time: new Date(load.timeInfo?.daysSincePickup ? Date.now() - (load.timeInfo.daysSincePickup * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                      done: true,
                    },
                    {
                      label: "In-Transit",
                      name: `Driver Name: ${load.acceptedBid?.driverName || load.driverName || "Driver"}`,
                      time: new Date(load.currentLocation?.lastUpdated || load.currentLocation?.updatedAt || Date.now()).toLocaleString(),
                      done: load.status === "In Transit" || load.status === "in_transit",
                    },
                    {
                      label: "Delivered",
                      name: `Driver Name: ${load.acceptedBid?.driverName || load.driverName || "Driver"}`,
                      time: new Date(load.timeInfo?.daysUntilDelivery ? Date.now() + (load.timeInfo.daysUntilDelivery * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                      done: load.status === "Delivered" || load.status === "delivered",
                    },
                  ],
                  vehicleNumber: load.acceptedBid?.vehicleNumber,
                  driverName: load.acceptedBid?.driverName || load.driverName,
                  driverPhone: load.acceptedBid?.driverPhone,
                  hasLocationData: load.hasLocationData,
                };
                });
                
                setConsignments(shipments);
                console.log('Alternative API successful, loaded', shipments.length, 'loads');
              } else {
                setConsignments([]);
              }
            } catch (altErr) {
              console.error('Alternative API also failed:', altErr);
              setConsignments([]);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching data", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      });
      
      // Log the exact error response
      if (err.response?.data) {
        console.error("API Error Response:", JSON.stringify(err.response.data, null, 2));
      }
      
      setConsignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignments();
  }, [searchTerm, userType]);

  // Auto-fetch routes when consignments are loaded
  useEffect(() => {
    if (consignments.length > 0) {
      const missingRoutes = consignments.filter(consignment => 
        !routePaths[consignment.id] && 
        consignment.originLat && 
        consignment.originLng && 
        consignment.destLat && 
        consignment.destLng &&
        consignment.originLat !== 0 &&
        consignment.originLng !== 0 &&
        consignment.destLat !== 0 &&
        consignment.destLng !== 0
      );
      
      if (missingRoutes.length > 0) {
        console.log(`🚀 Auto-fetching routes for ${missingRoutes.length} loads...`);
        setTimeout(() => {
          forceFetchAllRoutes();
        }, 500);
      }
    }
  }, [consignments.length]);



  // Force fetch all routes function
  const forceFetchAllRoutes = async () => {
    if (consignments.length > 0) {
      console.log(`🔄 Force fetching routes for all ${consignments.length} loads...`);
      
      const routePromises = consignments.map(async (consignment) => {
        if (consignment.originLat && consignment.originLng && consignment.destLat && consignment.destLng) {
          try {
            const routeData = await fetchRoute(
              consignment.originLat, 
              consignment.originLng, 
              consignment.destLat, 
              consignment.destLng
            );
            
            if (routeData && routeData.path && routeData.path.length > 0) {
              return { id: consignment.id, routeData };
            }
          } catch (error) {
            console.error(`Error fetching route for ${consignment.id}:`, error);
          }
        }
        return null;
      });
      
      const results = await Promise.all(routePromises);
      const validResults = results.filter(result => result !== null);
      
      if (validResults.length > 0) {
        setRoutePaths(prev => {
          const updated = { ...prev };
          validResults.forEach(result => {
            updated[result.id] = result.routeData;
          });
          console.log(`✅ Force fetched ${validResults.length} routes`);
          return updated;
        });
      }
    }
  };

  return (
    <Box sx={{ display: "flex", height: "93vh", overflow: "hidden", bgcolor: "#f5f7fa" }}>
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{ 
          width: 420, 
          p: 0, 
          borderRadius: 0, 
          overflowY: "auto", 
          zIndex: 1000,
          bgcolor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.06)"
        }}
      >

        {/* Back Button */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", bgcolor: "white" }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            sx={{ 
              textTransform: "none", 
              fontWeight: 700,
              borderRadius: 2,
              width: "100%"
            }}
          >
            ← Back to Menu
          </Button>
        </Box>

        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, bgcolor: "white", zIndex: 10 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search Shipment Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: "#f9fafb",
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "#d1d5db" },
                "&.Mui-focused fieldset": { borderColor: "#667eea" },
              },
            }}
          />
        </Box>

        {/* Content Section */}
        <Box sx={{ p: 1.5 }}>
          {loading && (
            <PageLoader message="Loading in-transit loads..." />
          )}

          {!loading && !hasToken && !searchTerm.trim() && (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={8}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2
                }}
              >
                <LocationOnIcon sx={{ fontSize: 40, color: "#9ca3af" }} />
              </Box>
              <Typography variant="h6" fontWeight={600} color="text.secondary" mb={1}>
                Authentication Required
              </Typography>
              <Typography fontSize={14} color="text.secondary" textAlign="center">
                Please login to view in-transit loads
              </Typography>
            </Box>
          )}

          {!loading && hasToken && consignments.length === 0 && !searchTerm.trim() && (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={8}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 40, color: "#9ca3af" }} />
              </Box>
              <Typography variant="h6" fontWeight={600} color="text.secondary" mb={1}>
                No Active Loads
              </Typography>
              <Typography fontSize={14} color="text.secondary" textAlign="center">
                All loads are either completed or not yet started
              </Typography>
            </Box>
          )}

          {consignments.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{ 
                mb: 0.5, 
                p: 0,
                borderRadius: "10px", 
                cursor: "pointer",
                border: expandedId === item.id ? "2px solid #667eea" : "1px solid #e5e7eb",
                bgcolor: "transparent",
                background: expandedId === item.id ? "rgba(102, 126, 234, 0.05)" : "transparent",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  borderColor: "#667eea",
                  background: "rgba(102, 126, 234, 0.05)",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.12)",
                  transform: "translateY(-1px)"
                }
              }}
              onClick={() => toggleExpand(item)}
            >
              {/* Card Header */}
              <Box sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    background: expandedId === item.id 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    height: "40px",
                    width: "40px",
                    borderRadius: "10px",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: expandedId === item.id 
                      ? "0 2px 8px rgba(102, 126, 234, 0.25)"
                      : "0 1px 4px rgba(0, 0, 0, 0.06)",
                    transition: "all 0.3s ease",
                    flexShrink: 0
                  }}
                >
                  <Typography fontSize={20}>📦</Typography>
                </Box>

                <Box flexGrow={1} minWidth={0}>
                  <Typography 
                    fontWeight={600} 
                    fontSize={13}
                    sx={{ 
                      color: expandedId === item.id ? "#667eea" : "#111827",
                      mb: 0.25,
                      letterSpacing: "-0.2px",
                      lineHeight: 1.3
                    }}
                  >
                    {item.number}
                  </Typography>
                  <Typography 
                    fontSize={12} 
                    color="text.secondary"
                    sx={{ 
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      lineHeight: 1.4
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 12 }} />
                    {item.location}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    color: expandedId === item.id ? "#667eea" : "#6b7280",
                    transition: "transform 0.3s ease",
                    transform: expandedId === item.id ? "rotate(180deg)" : "rotate(0deg)",
                    p: 0.5
                  }}
                >
                  {expandedId === item.id ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>

              {/* Expanded Content */}
              <Collapse in={expandedId === item.id}>
                <Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
                  <Divider sx={{ mb: 1.5, borderColor: "#e5e7eb" }} />
                  
                  {/* Status Timeline */}
                  <Typography 
                    fontSize={10} 
                    fontWeight={600}
                    color="text.secondary" 
                    mb={1.5}
                    sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
                  >
                    Status Timeline
                  </Typography>
                  {item.status.map((step, index) => (
                    <Box 
                      key={index} 
                      display="flex" 
                      alignItems="flex-start" 
                      mb={index !== item.status.length - 1 ? 1.5 : 0}
                      sx={{
                        position: "relative",
                        "&::before": index !== item.status.length - 1 ? {
                          content: '""',
                          position: "absolute",
                          left: "9px",
                          top: "20px",
                          bottom: "-12px",
                          width: "2px",
                          bgcolor: step.done ? "#10b981" : "#e5e7eb",
                          zIndex: 0
                        } : {}
                      }}
                    >
                      <Box 
                        mt={0.25}
                        sx={{
                          position: "relative",
                          zIndex: 1,
                          bgcolor: "white",
                          borderRadius: "50%",
                          p: 0.25
                        }}
                      >
                        {step.done ? (
                          <CheckCircleIcon 
                            sx={{ 
                              color: "#10b981",
                              fontSize: 16,
                              filter: "drop-shadow(0 1px 2px rgba(16, 185, 129, 0.25))"
                            }} 
                          />
                        ) : index === 2 ? (
                          <LocationOnIcon 
                            sx={{ 
                              color: "#667eea",
                              fontSize: 16,
                              filter: "drop-shadow(0 1px 2px rgba(102, 126, 234, 0.25))"
                            }} 
                          />
                        ) : (
                          <RadioButtonUncheckedIcon 
                            sx={{ 
                              color: "#d1d5db",
                              fontSize: 16
                            }} 
                          />
                        )}
                      </Box>
                      <Box ml={1.5} flexGrow={1}>
                        <Typography
                          fontWeight={600}
                          color={step.done ? "#10b981" : step.done === false && index === 2 ? "#667eea" : "text.primary"}
                          fontSize={12}
                          sx={{ mb: 0.25, lineHeight: 1.4 }}
                        >
                          {step.label}
                        </Typography>
                        <Typography 
                          fontSize={11} 
                          color="text.primary"
                          fontWeight={500}
                          sx={{ mb: 0.25, lineHeight: 1.4 }}
                        >
                          {step.name}
                        </Typography>
                        <Typography 
                          fontSize={10} 
                          color="text.secondary"
                          sx={{ lineHeight: 1.4 }}
                        >
                          {step.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* Map */}
      <Box flexGrow={1} position="relative" sx={{ height: "93vh", width: "100%", zIndex: 1 }}>
        <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render}>
          <LiveTrackerMap
            selectedShipment={selectedShipment}
            expandedId={expandedId}
            routePaths={routePaths}
            mapView={mapView}
            helpLoading={helpLoading}
            onHelpClick={handleHelpClick}
          />
        </Wrapper>
      </Box>
    </Box>
  );
}