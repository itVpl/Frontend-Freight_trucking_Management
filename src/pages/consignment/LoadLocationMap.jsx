import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, CircularProgress } from '@mui/material';

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

// Function to create custom numbered icons for origins and destinations
const createNumberedIcon = (number, type) => {
  const color = type === 'origin' ? '#4CAF50' : '#FF5722';
  const label = type === 'origin' ? 'O' : 'D';
  
  const svg = `
    <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0 C8.95 0 0 8.95 0 20 C0 30 20 50 20 50 C20 50 40 30 40 20 C40 8.95 31.05 0 20 0 Z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <text x="20" y="28" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${label}${number}</text>
    </svg>
  `;
  
  return L.divIcon({
    html: svg,
    className: 'custom-numbered-icon',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

// Custom icons for pickup and delivery (fallback)
const pickupIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTIiIGZpbGw9IiM0Q0FGNTAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjE2IiB5PSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5QPC90ZXh0Pgo8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTIiIGZpbGw9IiNGRjU3MjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjE2IiB5PSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5EPC90ZXh0Pgo8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const currentLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTIiIGZpbGw9IiMxOTc2ZDIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjE2IiB5PSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5DPC90ZXh0Pgo8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Component to fit map bounds to show all markers
function FitBounds({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [markers, map]);
  
  return null;
}

const LoadLocationMap = ({ loadDetails }) => {
  const [markers, setMarkers] = useState([]);
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]); // Center of USA
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [originDestinationPaths, setOriginDestinationPaths] = useState([]);

  // Function to fetch tracking data
  const fetchTrackingData = async (shipmentNumber) => {
    try {
      const response = await fetch(`https://vpl-liveproject-1.onrender.com/api/v1/load/shipment/${shipmentNumber}`);
      const data = await response.json();
      
      if (data.success && data.tracking) {
        return data.tracking;
      }
    } catch (error) {
      console.error('Tracking API error:', error);
    }
    return null;
  };

  // Function to geocode address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  // Function to fetch optimized route from OSRM
  const fetchOptimizedRoute = async (originLat, originLng, destLat, destLng) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data && data.routes && data.routes[0]) {
        const route = data.routes[0];
        // Convert GeoJSON coordinates to Leaflet format [lat, lng]
        const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        return {
          path: path,
          distance: route.distance,
          duration: route.duration
        };
      }
    } catch (error) {
      console.error('OSRM routing error:', error);
    }
    return null;
  };

  // Function to create route path from markers
  const createRoutePath = async (markers) => {
    const path = [];
    
    // Find pickup, current, and delivery markers
    const pickupMarker = markers.find(m => m.type === 'pickup');
    const currentMarker = markers.find(m => m.type === 'current');
    const deliveryMarker = markers.find(m => m.type === 'delivery');
    
    // Create optimized routes between points
    if (pickupMarker && currentMarker) {
      // Route from pickup to current location
      const route1 = await fetchOptimizedRoute(
        pickupMarker.position[0], pickupMarker.position[1],
        currentMarker.position[0], currentMarker.position[1]
      );
      if (route1 && route1.path) {
        path.push(...route1.path);
      } else {
        // Fallback to straight line
        path.push(pickupMarker.position, currentMarker.position);
      }
    } else if (pickupMarker) {
      path.push(pickupMarker.position);
    }
    
    if (currentMarker && deliveryMarker) {
      // Route from current to delivery location
      const route2 = await fetchOptimizedRoute(
        currentMarker.position[0], currentMarker.position[1],
        deliveryMarker.position[0], deliveryMarker.position[1]
      );
      if (route2 && route2.path) {
        // Remove the first point to avoid duplication
        path.push(...route2.path.slice(1));
      } else {
        // Fallback to straight line
        if (path.length === 0) {
          path.push(currentMarker.position);
        }
        path.push(deliveryMarker.position);
      }
    } else if (deliveryMarker && !currentMarker && pickupMarker) {
      // Direct route from pickup to delivery if no current location
      const route3 = await fetchOptimizedRoute(
        pickupMarker.position[0], pickupMarker.position[1],
        deliveryMarker.position[0], deliveryMarker.position[1]
      );
      if (route3 && route3.path) {
        path.push(...route3.path);
      } else {
        // Fallback to straight line
        path.push(pickupMarker.position, deliveryMarker.position);
      }
    } else if (deliveryMarker && path.length === 0) {
      path.push(deliveryMarker.position);
    }
    
    return path;
  };

  // Function to create road-based polylines from origins to destinations using OSRM
  const createOriginDestinationPolylines = async (load) => {
    const polylinePaths = [];
    
    // Get all origins with lat/lon and their details
    const origins = [];
    if (load.origins && load.origins.length > 0) {
      load.origins.forEach((origin, index) => {
        if (origin.lat != null && origin.lon != null) {
          origins.push({
            lat: parseFloat(origin.lat),
            lon: parseFloat(origin.lon),
            address: `${origin.addressLine1 || ''}, ${origin.city || ''}, ${origin.state || ''}`.trim(),
            city: origin.city || 'Origin',
            index: index
          });
        }
      });
    }
    
    // Get all destinations with lat/lon and their details
    const destinations = [];
    if (load.destinations && load.destinations.length > 0) {
      load.destinations.forEach((destination, index) => {
        if (destination.lat != null && destination.lon != null) {
          destinations.push({
            lat: parseFloat(destination.lat),
            lon: parseFloat(destination.lon),
            address: `${destination.addressLine1 || ''}, ${destination.city || ''}, ${destination.state || ''}`.trim(),
            city: destination.city || 'Destination',
            index: index
          });
        }
      });
    }
    
    // Create road-based routes for each origin-destination pair
    if (origins.length > 0 && destinations.length > 0) {
      // If we have multiple origins and destinations, connect first origin to first destination, etc.
      // Otherwise, connect all origins to all destinations
      const maxPairs = Math.max(origins.length, destinations.length);
      
      for (let i = 0; i < maxPairs; i++) {
        const origin = origins[Math.min(i, origins.length - 1)];
        const destination = destinations[Math.min(i, destinations.length - 1)];
        
        if (origin && destination) {
          // Fetch road-based route from OSRM
          const route = await fetchOptimizedRoute(
            origin.lat,
            origin.lon,
            destination.lat,
            destination.lon
          );
          
          if (route && route.path && route.path.length > 0) {
            // Use road-based route
            polylinePaths.push({
              path: route.path,
              originLabel: `${origin.city} (Origin ${origin.index + 1})`,
              destinationLabel: `${destination.city} (Destination ${destination.index + 1})`,
              originIndex: origin.index + 1,
              destinationIndex: destination.index + 1,
              color: i === 0 ? '#4CAF50' : i === 1 ? '#2196F3' : i === 2 ? '#FF9800' : '#9C27B0',
              key: `route-${origin.index}-${destination.index}`
            });
          } else {
            // Fallback to straight line if routing fails
            polylinePaths.push({
              path: [[origin.lat, origin.lon], [destination.lat, destination.lon]],
              originLabel: `${origin.city} (Origin ${origin.index + 1})`,
              destinationLabel: `${destination.city} (Destination ${destination.index + 1})`,
              originIndex: origin.index + 1,
              destinationIndex: destination.index + 1,
              color: i === 0 ? '#4CAF50' : i === 1 ? '#2196F3' : i === 2 ? '#FF9800' : '#9C27B0',
              key: `route-${origin.index}-${destination.index}`
            });
          }
        }
      }
    }
    
    return polylinePaths;
  };

  useEffect(() => {
    const processLocations = async () => {
      if (loadDetails?.load?.shipmentNumber) {
        setLoading(true);
        const newMarkers = [];
        
        // Fetch tracking data first
        const tracking = await fetchTrackingData(loadDetails.load.shipmentNumber);
        setTrackingData(tracking);
        
        if (tracking) {
          // Add origin marker from tracking data
          if (tracking.originLatLng && tracking.originLatLng.lat && tracking.originLatLng.lon) {
            newMarkers.push({
              position: [tracking.originLatLng.lat, tracking.originLatLng.lon],
              type: 'pickup',
              data: {
                location: tracking.originName,
                status: 1,
                addressLine1: tracking.originName
              },
              key: 'pickup-origin'
            });
          }
          
          // Add destination marker from tracking data
          if (tracking.destinationLatLng && tracking.destinationLatLng.lat && tracking.destinationLatLng.lon) {
            newMarkers.push({
              position: [tracking.destinationLatLng.lat, tracking.destinationLatLng.lon],
              type: 'delivery',
              data: {
                location: tracking.destinationName,
                status: 0,
                addressLine1: tracking.destinationName
              },
              key: 'delivery-destination'
            });
          }
          
          // Add current location marker from tracking data
          if (tracking.currentLocation && tracking.currentLocation.lat && tracking.currentLocation.lon) {
            newMarkers.push({
              position: [tracking.currentLocation.lat, tracking.currentLocation.lon],
              type: 'current',
              data: {
                location: 'Current Location',
                status: 'active',
                updatedAt: tracking.currentLocation.updatedAt,
                vehicleNumber: tracking.vehicleNumber || 'N/A',
                driverName: tracking.driverName || 'N/A'
              },
              key: 'current-location'
            });
          }
        } else {
          // Fallback to original logic if tracking API fails
          // Get pickup locations from load details
          if (loadDetails.load.origins && loadDetails.load.origins.length > 0) {
            for (let index = 0; index < loadDetails.load.origins.length; index++) {
              const origin = loadDetails.load.origins[index];
              let coordinates = null;
              
              if (origin.lat != null && origin.lon != null) {
                coordinates = {
                  lat: parseFloat(origin.lat),
                  lng: parseFloat(origin.lon)
                };
              } else {
                const address = `${origin.addressLine1 || ''}, ${origin.city || ''}, ${origin.state || ''}`.trim();
                if (address && address !== ', ,') {
                  coordinates = await geocodeAddress(address);
                }
              }
              
              if (coordinates) {
                newMarkers.push({
                  position: [coordinates.lat, coordinates.lng],
                  type: 'pickup',
                  data: {
                    ...origin,
                    originIndex: index + 1,
                    isOrigin: true
                  },
                  key: `pickup-${index}`,
                  originIndex: index + 1
                });
              }
            }
          } else if (loadDetails.load.originPlace) {
            let coordinates = null;
            
            if (loadDetails.load.originPlace.lat != null && loadDetails.load.originPlace.lon != null) {
              coordinates = {
                lat: parseFloat(loadDetails.load.originPlace.lat),
                lng: parseFloat(loadDetails.load.originPlace.lon)
              };
            } else if (loadDetails.load.originPlace.location) {
              coordinates = await geocodeAddress(loadDetails.load.originPlace.location);
            }
            
            if (coordinates) {
              newMarkers.push({
                position: [coordinates.lat, coordinates.lng],
                type: 'pickup',
                data: loadDetails.load.originPlace,
                key: 'pickup-origin'
              });
            }
          }

          // Get delivery locations from load details
          if (loadDetails.load.destinations && loadDetails.load.destinations.length > 0) {
            for (let index = 0; index < loadDetails.load.destinations.length; index++) {
              const destination = loadDetails.load.destinations[index];
              let coordinates = null;
              
              if (destination.lat != null && destination.lon != null) {
                coordinates = {
                  lat: parseFloat(destination.lat),
                  lng: parseFloat(destination.lon)
                };
              } else {
                const address = `${destination.addressLine1 || ''}, ${destination.city || ''}, ${destination.state || ''}`.trim();
                if (address && address !== ', ,') {
                  coordinates = await geocodeAddress(address);
                }
              }
              
              if (coordinates) {
                newMarkers.push({
                  position: [coordinates.lat, coordinates.lng],
                  type: 'delivery',
                  data: {
                    ...destination,
                    destinationIndex: index + 1,
                    isDestination: true
                  },
                  key: `delivery-${index}`,
                  destinationIndex: index + 1
                });
              }
            }
          } else if (loadDetails.load.destinationPlace) {
            let coordinates = null;
            
            if (loadDetails.load.destinationPlace.lat != null && loadDetails.load.destinationPlace.lon != null) {
              coordinates = {
                lat: parseFloat(loadDetails.load.destinationPlace.lat),
                lng: parseFloat(loadDetails.load.destinationPlace.lon)
              };
            } else if (loadDetails.load.destinationPlace.location) {
              coordinates = await geocodeAddress(loadDetails.load.destinationPlace.location);
            }
            
            if (coordinates) {
              newMarkers.push({
                position: [coordinates.lat, coordinates.lng],
                type: 'delivery',
                data: loadDetails.load.destinationPlace,
                key: 'delivery-destination'
              });
            }
          }
        }

        setMarkers(newMarkers);
        
        // Create route path from markers (async)
        const route = await createRoutePath(newMarkers);
        setRoutePath(route);
        
        // Create road-based polylines from origins to destinations using OSRM routing
        if (loadDetails.load) {
          const originDestPaths = await createOriginDestinationPolylines(loadDetails.load);
          setOriginDestinationPaths(originDestPaths);
        }
        
        // Set map center to current location if available, otherwise first marker
        if (newMarkers.length > 0) {
          const currentMarker = newMarkers.find(m => m.type === 'current');
          setMapCenter(currentMarker ? currentMarker.position : newMarkers[0].position);
        }
        setLoading(false);
      }
    };

    processLocations();
  }, [loadDetails]);

  if (loading) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading locations...
        </Typography>
      </Box>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={markers.length > 0 ? 6 : 4}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map((marker) => {
        // Determine which icon to use
        let iconToUse;
        if (marker.type === 'current') {
          iconToUse = currentLocationIcon;
        } else if (marker.originIndex) {
          // Use numbered icon for origins
          iconToUse = createNumberedIcon(marker.originIndex, 'origin');
        } else if (marker.destinationIndex) {
          // Use numbered icon for destinations
          iconToUse = createNumberedIcon(marker.destinationIndex, 'destination');
        } else {
          // Fallback to default icons
          iconToUse = marker.type === 'pickup' ? pickupIcon : deliveryIcon;
        }

        // Find connected routes for this marker
        const connectedRoutes = originDestinationPaths.filter(route => {
          if (marker.originIndex) {
            return route.originIndex === marker.originIndex;
          } else if (marker.destinationIndex) {
            return route.destinationIndex === marker.destinationIndex;
          }
          return false;
        });

        return (
          <Marker
            key={marker.key}
            position={marker.position}
            icon={iconToUse}
          >
            <Popup>
              <Box sx={{ p: 1, minWidth: '200px' }}>
                <Typography variant="h6" sx={{ 
                  color: marker.type === 'pickup' ? '#4CAF50' : marker.type === 'current' ? '#1976d2' : '#FF5722',
                  mb: 1,
                  fontWeight: 'bold'
                }}>
                  {marker.originIndex ? `Origin ${marker.originIndex}` : 
                   marker.destinationIndex ? `Destination ${marker.destinationIndex}` :
                   marker.type === 'pickup' ? 'Pickup Location' : 
                   marker.type === 'current' ? 'Current Location' : 'Delivery Location'}
                </Typography>
                
                {marker.data.addressLine1 && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Address:</strong> {marker.data.addressLine1}
                  </Typography>
                )}
                
                {marker.data.city && marker.data.state && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>City:</strong> {marker.data.city}, {marker.data.state}
                  </Typography>
                )}
                
                {marker.data.zip && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>ZIP:</strong> {marker.data.zip}
                  </Typography>
                )}
                
                {marker.data.zipCode && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>ZIP:</strong> {marker.data.zipCode}
                  </Typography>
                )}
                
                {marker.data.status !== undefined && (
                  <Typography variant="body2" sx={{ 
                    mb: 0.5,
                    color: marker.data.status === 1 ? '#4CAF50' : '#FF9800'
                  }}>
                    <strong>Status:</strong> {marker.data.status === 1 ? 'Arrived' : 'Pending'}
                  </Typography>
                )}
                
                {marker.data.location && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Location:</strong> {marker.data.location}
                  </Typography>
                )}
                
                {/* Show connected routes */}
                {connectedRoutes.length > 0 && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: '#1976d2' }}>
                      Connected Routes:
                    </Typography>
                    {connectedRoutes.map((route, idx) => (
                      <Typography key={idx} variant="caption" sx={{ display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                        {marker.originIndex 
                          ? `→ ${route.destinationLabel}` 
                          : `← ${route.originLabel}`}
                      </Typography>
                    ))}
                  </Box>
                )}
                
                {marker.type === 'current' && marker.data.updatedAt && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Last Updated:</strong> {new Date(marker.data.updatedAt).toLocaleString()}
                  </Typography>
                )}
                
                {marker.type === 'current' && marker.data.vehicleNumber && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Vehicle:</strong> {marker.data.vehicleNumber}
                  </Typography>
                )}
                
                {marker.type === 'current' && marker.data.driverName && (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Driver:</strong> {marker.data.driverName}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Route Polyline */}
      {routePath.length > 1 && (
        <Polyline
          positions={routePath}
          color="#1976d2"
          weight={5}
          opacity={0.9}
          lineCap="round"
          lineJoin="round"
        />
      )}
      
      {/* Origin to Destination Polylines (Road-based routes) */}
      {originDestinationPaths.map((routeData, index) => (
        <Polyline
          key={routeData.key || `route-${index}`}
          positions={routeData.path}
          color={routeData.color || '#4CAF50'}
          weight={5}
          opacity={0.8}
          lineCap="round"
          lineJoin="round"
        />
      ))}
      
      {markers.length > 0 && (
        <FitBounds 
          markers={[
            ...markers.map(m => m.position),
            ...originDestinationPaths.flatMap(route => route.path)
          ]} 
        />
      )}
      
      {markers.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 2,
            borderRadius: 1,
            textAlign: 'center',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No location data found for this load
          </Typography>
        </Box>
      )}

      {/* Route Legend */}
      {originDestinationPaths.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: '250px',
            maxWidth: '300px'
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#1976d2' }}>
            Route Information
          </Typography>
          {originDestinationPaths.map((routeData, index) => (
            <Box key={routeData.key || `legend-${index}`} sx={{ mb: 1.5, pb: 1.5, borderBottom: index < originDestinationPaths.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 4,
                    backgroundColor: routeData.color || '#4CAF50',
                    borderRadius: 1,
                    mr: 1
                  }}
                />
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  Route {index + 1}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', ml: 3 }}>
                <strong>From:</strong> {routeData.originLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', ml: 3 }}>
                <strong>To:</strong> {routeData.destinationLabel}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </MapContainer>
  );
};

export default LoadLocationMap;
