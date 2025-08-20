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
import { MapContainer, TileLayer, Marker, useMap, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import truckIconPng from "../../assets/Icons super admin/truck.png";

const truckIcon = new L.Icon({
  iconUrl: truckIconPng,
  iconSize: [40, 40],
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

  const toggleExpand = (item) => {
    const isExpanding = expandedId !== item.id;
    setExpandedId((prev) => (prev === item.id ? null : item.id));
    setSelectedShipment(item);
    
    // Change map view based on expand/collapse
    if (isExpanding) {
      setMapView("current"); // Show current location when expanded
    } else {
      setMapView("route"); // Show full route when collapsed
    }
  };

  const fetchConsignments = async () => {
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
        res = await axios.get(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipment/`);
                 // Multiple shipments response
         if (res.data?.data && Array.isArray(res.data.data)) {
           const shipments = res.data.data.map(track => ({
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
           
                       // Fetch optimized routes for all shipments
            const newRoutePaths = {};
            for (const track of res.data.data) {
              const routeData = await fetchRoute(
                track.originLatLng.lat,
                track.originLatLng.lon,
                track.destinationLatLng.lat,
                track.destinationLatLng.lon
              );
              
              if (routeData) {
                newRoutePaths[track._id] = routeData;
              }
            }
           
           setRoutePaths(prev => ({
             ...prev,
             ...newRoutePaths
           }));
        } else {
          setConsignments([]);
        }
      }
    } catch (err) {
      console.error("Error fetching data", err);
      setConsignments([]);
    }
  };

  useEffect(() => {
    fetchConsignments();
    const interval = setInterval(fetchConsignments, 10000);
    return () => clearInterval(interval);
  }, [searchTerm]);

  return (
    <Box sx={{ display: "flex", height: "93vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Paper
        elevation={3}
        sx={{ width: 380, p: 2, borderRadius: "0 20px 20px 0", overflowY: "auto", zIndex: 1000 }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>Consignment</Typography>
        <TextField
          fullWidth
          placeholder="Search by Shipment Number..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, borderRadius: "10px" }}
        />

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
          {consignments.map((truck) => (
            <Marker key={truck.id} position={[truck.lat, truck.lng]} icon={truckIcon} />
          ))}
          
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
          
          {/* Solid Route Lines */}
          {consignments.map((truck) => {
            const routeData = routePaths[truck.id];
            console.log(`Rendering polyline for truck ${truck.id}:`, routeData);
            
            if (routeData && routeData.path && routeData.path.length > 0) {
              console.log(`Creating polyline with ${routeData.path.length} points for truck ${truck.id}`);
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
              // Fallback: create a simple straight line if no route data
              if (truck.originLat && truck.originLng && truck.destLat && truck.destLng) {
                console.log(`Creating fallback polyline for truck ${truck.id}`);
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
            }
            return null;
          })}
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