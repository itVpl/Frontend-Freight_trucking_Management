import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap, Polyline, useMapEvents, Tooltip, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import truckIconPng from "../../assets/Icons super admin/truck.png";

// Add CSS for spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = spinnerStyles;
  document.head.appendChild(styleSheet);
}

const truckIcon = new L.Icon({
  iconUrl: truckIconPng,
  iconSize: [70, 30],
  iconAnchor: [20, 40],
});

function RecenterMap({ lat, lng, mapView, routeData }) {
  const map = useMap();
  useEffect(() => {
    console.log('RecenterMap effect triggered:', { lat, lng, mapView, routeData });
    
    if (lat && lng) {
      if (mapView === "current") {
        // Zoom in to current location
        console.log('Setting view to current location:', [lat, lng]);
        map.setView([lat, lng], 12);
      } else if (routeData && routeData.path && routeData.path.length > 0) {
        // Fit the entire route in view
        console.log('Fitting bounds for route:', routeData.path);
        const bounds = L.latLngBounds(routeData.path);
        map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        // Default zoom
        console.log('Setting default view:', [lat, lng]);
        map.setView([lat, lng], 8);
      }
    }
  }, [lat, lng, mapView, routeData, map]);
  return null;
}

export default function LiveTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [consignments, setConsignments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [routePaths, setRoutePaths] = useState({});
  const [mapView, setMapView] = useState("route"); // "route" or "current"
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [helpLoading, setHelpLoading] = useState({});

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

  const toggleExpand = async (item) => {
    const isExpanding = expandedId !== item.id;
    setExpandedId((prev) => (prev === item.id ? null : item.id));
    setSelectedShipment(item);
    
    // If expanding and route data doesn't exist, fetch it
    if (isExpanding && !routePaths[item.id]) {
      console.log('Route data not found for item:', item.id, 'Fetching route...');
      console.log('Item coordinates:', {
        origin: [item.originLat, item.originLng],
        dest: [item.destLat, item.destLng]
      });
      
      if (item.originLat && item.originLng && item.destLat && item.destLng) {
        try {
          const routeData = await fetchRoute(item.originLat, item.originLng, item.destLat, item.destLng);
          if (routeData && routeData.path && routeData.path.length > 0) {
            setRoutePaths(prev => ({
              ...prev,
              [item.id]: routeData
            }));
            console.log('✅ Route data fetched and set for item:', item.id, 'with', routeData.path.length, 'points');
          } else {
            console.log('❌ Failed to fetch route data for item:', item.id);
          }
        } catch (error) {
          console.error('❌ Error fetching route for item:', item.id, error);
        }
      } else {
        console.log('❌ Invalid coordinates for item:', item.id);
      }
    } else if (isExpanding && routePaths[item.id]) {
      console.log('✅ Route data already exists for item:', item.id);
    }
    
    // Change map view based on expand/collapse
    if (isExpanding) {
      setMapView("current"); // Show current location when expanded
    } else {
      setMapView("route"); // Show full route when collapsed
    }
  };

  const fetchConsignments = async () => {
    // Check if we have a token first
    const token = getAuthToken();
    setHasToken(!!token);
    
    if (!token && !searchTerm.trim()) {
      console.log('No token found, skipping API call');
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
        
        // Single shipment response
        if (res.data?.tracking) {
          const track = res.data.tracking;
          console.log('Processing tracking data:', track);
          
          // Ensure coordinates are numbers
          const originLat = parseFloat(track.originLatLng?.lat) || 0;
          const originLng = parseFloat(track.originLatLng?.lon) || 0;
          const destLat = parseFloat(track.destinationLatLng?.lat) || 0;
          const destLng = parseFloat(track.destinationLatLng?.lon) || 0;
          const currentLat = parseFloat(track.currentLocation?.lat) || originLat;
          const currentLng = parseFloat(track.currentLocation?.lon) || originLng;
          
          console.log('Coordinates:', { originLat, originLng, destLat, destLng, currentLat, currentLng });
          
          const shipment = {
            id: track._id,
            number: track.shipmentNumber,
            location: `${track.originName || 'Origin'} → ${track.destinationName || 'Destination'}`,
            lat: currentLat,
            lng: currentLng,
            originLat: originLat,
            originLng: originLng,
            destLat: destLat,
            destLng: destLng,
            status: [
              {
                label: "Loading",
                name: track.driverName || "Driver",
                time: new Date(track.startedAt || Date.now()).toLocaleString(),
                done: true,
              },
              {
                label: "In-Transit",
                name: track.driverName || "Driver",
                time: new Date(track.currentLocation?.updatedAt || Date.now()).toLocaleString(),
                done: track.status !== "loading",
              },
              {
                label: "Delivered",
                name: track.driverName || "Driver",
                time: new Date(track.load?.deliveryDate || Date.now()).toLocaleString(),
                done: track.status === "delivered",
              },
            ],
          };
          
          setConsignments([shipment]);
          
          // Fetch optimized route for this shipment
          if (originLat && originLng && destLat && destLng) {
            const routeData = await fetchRoute(originLat, originLng, destLat, destLng);
            console.log('Route data received:', routeData);
            
            if (routeData && routeData.path && routeData.path.length > 0) {
              setRoutePaths(prev => ({
                ...prev,
                [track._id]: routeData
              }));
            }
          }
        } else {
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
        
        res = await axios.get(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipper/in-transit-loads-with-location`, {
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
            // Ensure coordinates are numbers with better parsing
            const originLat = parseFloat(load.origin?.lat) || parseFloat(load.origin?.latitude) || 0;
            const originLng = parseFloat(load.origin?.lon) || parseFloat(load.origin?.longitude) || 0;
            const destLat = parseFloat(load.destination?.lat) || parseFloat(load.destination?.latitude) || 0;
            const destLng = parseFloat(load.destination?.lon) || parseFloat(load.destination?.longitude) || 0;
            const currentLat = parseFloat(load.currentLocation?.latitude) || parseFloat(load.currentLocation?.lat) || originLat;
            const currentLng = parseFloat(load.currentLocation?.longitude) || parseFloat(load.currentLocation?.lon) || originLng;
            
            console.log('Load coordinates:', { 
              loadNumber: load.loadNumber,
              origin: load.origin,
              destination: load.destination,
              currentLocation: load.currentLocation,
              parsed: { originLat, originLng, destLat, destLng, currentLat, currentLng }
            });
            
            const shipment = {
              id: load._id,
              number: load.loadNumber,
              location: `${load.origin?.city || 'Origin'} → ${load.destination?.city || 'Destination'}`,
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
                  label: "Loading",
                  name: load.assignedTo?.contactPerson || "Driver",
                  time: new Date(load.timeInfo?.daysSincePickup ? Date.now() - (load.timeInfo.daysSincePickup * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                  done: true,
                },
                {
                  label: "In-Transit",
                  name: load.acceptedBid?.driverName || "Driver",
                  time: new Date(load.currentLocation?.lastUpdated || Date.now()).toLocaleString(),
                  done: load.status === "In Transit",
                },
                {
                  label: "Delivered",
                  name: load.acceptedBid?.driverName || "Driver",
                  time: new Date(load.timeInfo?.daysUntilDelivery ? Date.now() + (load.timeInfo.daysUntilDelivery * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                  done: load.status === "Delivered",
                },
              ],
              vehicleNumber: load.acceptedBid?.vehicleNumber,
              driverName: load.acceptedBid?.driverName,
              driverPhone: load.acceptedBid?.driverPhone,
              hasLocationData: load.hasLocationData,
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
            const originLat = parseFloat(load.origin?.lat) || parseFloat(load.origin?.latitude) || 0;
            const originLng = parseFloat(load.origin?.lon) || parseFloat(load.origin?.longitude) || 0;
            const destLat = parseFloat(load.destination?.lat) || parseFloat(load.destination?.latitude) || 0;
            const destLng = parseFloat(load.destination?.lon) || parseFloat(load.destination?.longitude) || 0;
            
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
                 label: "Loading",
                 name: track.driverName || "Driver",
                 time: new Date(track.startedAt).toLocaleString(),
                 done: true,
               },
               {
                 label: "In-Transit",
                 name: track.driverName || "Driver",
                 time: new Date(track.currentLocation.updatedAt).toLocaleString(),
                 done: track.status !== "loading",
               },
               {
                 label: "Delivered",
                 name: track.driverName || "Driver",
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
              const altRes = await axios.get(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipper/loads`, {
                headers: headers
              });
              console.log('Alternative API response:', altRes.data);
              
              if (altRes.data?.data && Array.isArray(altRes.data.data)) {
                const shipments = altRes.data.data.map(load => ({
                  id: load._id,
                  number: load.loadNumber || load.shipmentNumber,
                  location: `${load.origin?.city || load.originName || 'Origin'} → ${load.destination?.city || load.destinationName || 'Destination'}`,
                  lat: load.currentLocation?.latitude || load.currentLocation?.lat || 0,
                  lng: load.currentLocation?.longitude || load.currentLocation?.lon || 0,
                  originLat: load.origin?.lat || load.originLatLng?.lat || 0,
                  originLng: load.origin?.lon || load.originLatLng?.lon || 0,
                  destLat: load.destination?.lat || load.destinationLatLng?.lat || 0,
                  destLng: load.destination?.lon || load.destinationLatLng?.lon || 0,
                  weight: load.weight,
                  commodity: load.commodity,
                  status: [
                    {
                      label: "Loading",
                      name: load.assignedTo?.contactPerson || load.driverName || "Driver",
                      time: new Date(load.timeInfo?.daysSincePickup ? Date.now() - (load.timeInfo.daysSincePickup * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                      done: true,
                    },
                    {
                      label: "In-Transit",
                      name: load.acceptedBid?.driverName || load.driverName || "Driver",
                      time: new Date(load.currentLocation?.lastUpdated || load.currentLocation?.updatedAt || Date.now()).toLocaleString(),
                      done: load.status === "In Transit" || load.status === "in_transit",
                    },
                    {
                      label: "Delivered",
                      name: load.acceptedBid?.driverName || load.driverName || "Driver",
                      time: new Date(load.timeInfo?.daysUntilDelivery ? Date.now() + (load.timeInfo.daysUntilDelivery * 24 * 60 * 60 * 1000) : Date.now()).toLocaleString(),
                      done: load.status === "Delivered" || load.status === "delivered",
                    },
                  ],
                  vehicleNumber: load.acceptedBid?.vehicleNumber,
                  driverName: load.acceptedBid?.driverName || load.driverName,
                  driverPhone: load.acceptedBid?.driverPhone,
                  hasLocationData: load.hasLocationData,
                }));
                
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
  }, [searchTerm]);

  // Auto-create polylines when consignments are loaded
  useEffect(() => {
    if (consignments.length > 0 && Object.keys(routePaths).length === 0) {
      console.log(`🚀 Auto-creating polylines for ${consignments.length} loads...`);
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        forceFetchAllRoutes();
      }, 500);
    }
  }, [consignments]);

  // Monitor route data and fetch missing routes
  useEffect(() => {
    const fetchMissingRoutes = async () => {
      if (consignments.length > 0) {
        const missingRoutes = consignments.filter(consignment => 
          !routePaths[consignment.id] && 
          consignment.originLat && 
          consignment.originLng && 
          consignment.destLat && 
          consignment.destLng
        );
        
        if (missingRoutes.length > 0) {
          console.log(`🔍 Found ${missingRoutes.length} loads with missing route data, fetching...`);
          
          const routePromises = missingRoutes.map(async (consignment) => {
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
              console.log(`✅ Added ${validResults.length} missing routes`);
              return updated;
            });
          }
        }
      }
    };
    
    fetchMissingRoutes();
  }, [consignments, routePaths]);

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
    <Box sx={{ display: "flex", height: "93vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Paper
        elevation={3}
        sx={{ width: 380, p: 2, borderRadius: "0 20px 20px 0", overflowY: "auto", zIndex: 1000 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {searchTerm.trim() ? "Consignment" : "In-Transit Loads"}
            </Typography>
            <Typography variant="caption" color="GrayText">
              {consignments.length} loads • {consignments.filter(t => t.lat && t.lng && t.lat !== 0 && t.lng !== 0).length} markers on map
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={async () => {
              await fetchConsignments();
              // Force fetch routes after loading consignments
              setTimeout(() => {
                forceFetchAllRoutes();
              }, 1000);
            }}
            disabled={loading}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Refresh
          </Button>
        </Box>
        <TextField
          fullWidth
          placeholder={searchTerm.trim() ? "Search by Shipment Number..." : "Search by Load Number..."}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, borderRadius: "10px" }}
        />

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <Typography>Loading in-transit loads...</Typography>
          </Box>
        )}

        {!loading && !hasToken && !searchTerm.trim() && (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={4}>
            <Typography color="GrayText" mb={1}>Authentication Required</Typography>
            <Typography fontSize={12} color="GrayText" textAlign="center">
              Please login to view in-transit loads
            </Typography>
          </Box>
        )}

        {!loading && hasToken && consignments.length === 0 && !searchTerm.trim() && (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={4}>
            <Typography color="GrayText" mb={1}>No in-transit loads found</Typography>
            <Typography fontSize={12} color="GrayText" textAlign="center">
              All loads are either completed or not yet started
            </Typography>
          </Box>
        )}

        {consignments.map((item) => (
          <Paper
            key={item.id}
            sx={{ mb: 2, p: 2, backgroundColor: "#fafafa", borderRadius: 3, cursor: "pointer" }}
            onClick={() => toggleExpand(item)}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {/* <Avatar src={boxIconPng} alt="box" sx={{ width: 36, height: 36 }} /> */}
              <Box sx={{display:"flex",background: "#AABBCC" , height:"45px", width:"45px", borderRadius:"50%",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
              <Typography fontSize={32}>📦</Typography>
              </Box>

              <Box flexGrow={1}>
                <Typography fontWeight={700} fontSize={14}>{item.number}</Typography>
                <Typography fontSize={12} color="GrayText">{item.location}</Typography>
              </Box>
              <IconButton>{expandedId === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
            </Box>

            <Collapse in={expandedId === item.id}>
              <Box mt={2}>
                
                
                
                
                {/* Status Timeline */}
                <Typography fontSize={12} color="GrayText" mb={1}>Status Timeline</Typography>
                {item.status.map((step, index) => (
                  <Box key={index} display="flex" alignItems="flex-start" mb={2}>
                    <Box mt={0.5}>
                      {step.done ? (
                        <CheckCircleIcon sx={{ color: "green" }} fontSize="small" />
                      ) : index === 2 ? (
                        <LocationOnIcon sx={{ color: "gray" }} fontSize="small" />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: "gray" }} fontSize="small" />
                      )}
                    </Box>
                    <Box ml={1} borderLeft={index !== item.status.length - 1 ? "3px solid #16a34a" : "none"} pl={1}>
                      <Typography
                        fontWeight={600}
                        color={step.done && index !== 2 ? "#16a34a" : "text.primary"}
                        fontSize={14}
                      >
                        {step.label}
                      </Typography>
                      <Typography fontSize={13}>{step.name}</Typography>
                      <Typography fontSize={12} color="GrayText">{step.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Paper>

      {/* Map */}
      <Box flexGrow={1} position="relative">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          scrollWheelZoom={true}
          className="leaflet-container"
          style={{ height: "93vh", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {consignments.map((truck) => {
            // Debug: Log each truck being rendered
            console.log(`🗺️ Rendering marker for truck ${truck.number} at:`, [truck.lat, truck.lng]);
            console.log(`📍 Truck details:`, {
              id: truck.id,
              number: truck.number,
              lat: truck.lat,
              lng: truck.lng,
              originLat: truck.originLat,
              originLng: truck.originLng,
              destLat: truck.destLat,
              destLng: truck.destLng
            });
            
            // Use fallback coordinates if current location is invalid
            const markerLat = truck.lat && truck.lat !== 0 ? truck.lat : truck.originLat;
            const markerLng = truck.lng && truck.lng !== 0 ? truck.lng : truck.originLng;
            
            console.log(`🎯 Using coordinates for marker:`, [markerLat, markerLng]);
            
            // Only render if we have valid coordinates
            if (!markerLat || !markerLng || markerLat === 0 || markerLng === 0) {
              console.warn(`⚠️ Skipping truck ${truck.number} - no valid coordinates`);
              return null;
            }
            
            return (
              <Marker key={truck.id} position={[markerLat, markerLng]} icon={truckIcon}>
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1976d2', marginBottom: '8px' }}>
                    {truck.number}
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Driver:</strong> {truck.driverName || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Vehicle:</strong> {truck.vehicleNumber || 'N/A'}
                  </div>
                  
                  {truck.weight && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Weight:</strong> {truck.weight}
                    </div>
                  )}
                  {truck.commodity && (
                    <div>
                      <strong>Commodity:</strong> {truck.commodity}
                    </div>
                  )}
                  
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                    <button
                      onClick={async () => {
                        const token = getAuthToken();
                        if (!token) {
                          alert('Authentication required. Please login first.');
                          return;
                        }
                        
                        // Set loading state for this specific truck
                        setHelpLoading(prev => ({ ...prev, [truck.id]: true }));
                        
                        try {
                          // Make authenticated request to help API
                          const response = await axios.get(
                            `https://vpl-liveproject-1.onrender.com/api/v1/load/shipper/load/${truck.id}/help-auto`,
                            {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            }
                          );
                          
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
                      }}
                      disabled={helpLoading[truck.id]}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: helpLoading[truck.id] ? '#ccc' : '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: helpLoading[truck.id] ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {helpLoading[truck.id] ? (
                        <>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid #fff',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Loading...
                        </>
                      ) : (
                        '📧 Help & Support'
                      )}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
            );
          })}
          
          {/* Origin and Destination Markers */}
          {consignments.map((truck) => (
            <Marker 
              key={`origin-${truck.id}`} 
              position={[truck.originLat, truck.originLng]}
              icon={new L.Icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiM0Q0FGNTAiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMjEuNTIgMjYgMjYgMjEuNTIgMjYgMTZDMjYgMTAuNDggMjEuNTIgNiAxMiA2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDEwQzEwLjM0IDEwIDkgMTEuMzQgOSAxM0M5IDE0LjY2IDEwLjM0IDE2IDEyIDE2QzEzLjY2IDE2IDE1IDE0LjY2IDE1IDEzQzE1IDExLjM0IDEzLjY2IDEwIDEyIDEwWiIgZmlsbD0iIzRDQUY1MCIvPgo8L3N2Zz4K',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            />
          ))}
          
          {consignments.map((truck) => (
            <Marker 
              key={`dest-${truck.id}`} 
              position={[truck.destLat, truck.destLng]}
              icon={new L.Icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNGRjU3MjIiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMjEuNTIgMjYgMjYgMjEuNTIgMjYgMTZDMjYgMTAuNDggMjEuNTIgNiAxMiA2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDEwQzEwLjM0IDEwIDkgMTEuMzQgOSAxM0M5IDE0LjY2IDEwLjM0IDE2IDEyIDE2QzEzLjY2IDE2IDE1IDE0LjY2IDE1IDEzQzE1IDExLjM0IDEzLjY2IDEwIDEyIDEwWiIgZmlsbD0iI0ZGNTcyMiIvPgo8L3N2Zz4K',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            />
          ))}
          
          {/* Solid Route Lines - Force render for all loads */}
          {consignments.map((truck) => {
            const routeData = routePaths[truck.id];
            console.log(`🗺️ Rendering polyline for truck ${truck.id} (${truck.number}):`, {
              hasRouteData: !!routeData,
              hasPath: !!(routeData && routeData.path),
              pathLength: routeData?.path?.length || 0,
              coordinates: {
                origin: [truck.originLat, truck.originLng],
                dest: [truck.destLat, truck.destLng]
              },
              routePathsKeys: Object.keys(routePaths)
            });
            
            // Always try to render a polyline - either proper route or fallback
            if (truck.originLat && truck.originLng && truck.destLat && truck.destLng) {
            if (routeData && routeData.path && routeData.path.length > 0) {
                console.log(`✅ Creating optimized polyline with ${routeData.path.length} points for truck ${truck.id}`);
              return (
                <Polyline
                  key={`route-${truck.id}`}
                  positions={routeData.path}
                  color="#1976d2"
                  weight={4}
                  opacity={0.8}
                />
              );
            } else {
                console.log(`⚠️ Creating fallback polyline for truck ${truck.id} (no route data)`);
                return (
                  <Polyline
                    key={`route-fallback-${truck.id}`}
                    positions={[[truck.originLat, truck.originLng], [truck.destLat, truck.destLng]]}
                    color="#ff6b6b"
                    weight={3}
                    opacity={0.6}
                    dashArray="10, 5"
                  />
                );
              }
            } else {
              console.log(`❌ No coordinates available for truck ${truck.id}, skipping polyline`);
              return null;
            }
          })}
          
          {/* Debug: Show route paths count */}
          {console.log(`🔍 Total route paths available: ${Object.keys(routePaths).length}`)}
          {console.log(`🔍 Total consignments: ${consignments.length}`)}
          {console.log(`🔍 Route paths keys:`, Object.keys(routePaths))}
          {console.log(`🗺️ Rendering ${consignments.length} truck markers on map`)}
          {console.log(`📍 All consignments data:`, consignments)}
          {selectedShipment && (
            <RecenterMap 
              lat={selectedShipment.lat} 
              lng={selectedShipment.lng} 
              mapView={mapView}
              routeData={routePaths[selectedShipment.id]}
            />
          )}
        </MapContainer>
      </Box>
    </Box>
  );
}