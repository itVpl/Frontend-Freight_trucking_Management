import { useEffect, useRef, useState } from 'react';

const LiveTrackerMap = ({ 
  selectedShipment, 
  expandedId, 
  routePaths, 
  mapView,
  onHelpClick,
  helpLoading
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const infoWindowsRef = useRef([]);
  const trafficLayerRef = useRef(null);
  const [showTraffic, setShowTraffic] = useState(false);

  // Function to calculate bearing/direction between two points
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const toRadians = (deg) => deg * (Math.PI / 180);
    const toDegrees = (rad) => rad * (180 / Math.PI);
    
    const dLon = toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
              Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
    
    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // Normalize to 0-360
  };

  // Create truck icon with rotation
  const createTruckIcon = (heading = 0) => {
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5,
      rotation: heading,
      fillColor: '#FF0000',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      anchor: new window.google.maps.Point(0, 0)
    };
  };

  // Create origin icon (green circle)
  const createOriginIcon = () => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#4CAF50',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
      anchor: new window.google.maps.Point(0, 0)
    };
  };

  // Create destination icon (red circle)
  const createDestinationIcon = () => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#FF5722',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 3,
      anchor: new window.google.maps.Point(0, 0)
    };
  };

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      
      // Initialize traffic layer
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }

    const map = mapInstanceRef.current;
    
    // Toggle traffic layer
    if (showTraffic) {
      trafficLayerRef.current.setMap(map);
    } else {
      trafficLayerRef.current.setMap(null);
    }

    // Clear existing markers, polylines, and info windows
    markersRef.current.forEach(marker => marker.setMap(null));
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
    markersRef.current = [];
    polylinesRef.current = [];
    infoWindowsRef.current = [];

    // Only render if shipment is selected and expanded
    if (!selectedShipment || !expandedId) {
      return;
    }

    const truck = selectedShipment;

    // Use fallback coordinates if current location is invalid
    const markerLat = truck.lat && truck.lat !== 0 ? truck.lat : truck.originLat;
    const markerLng = truck.lng && truck.lng !== 0 ? truck.lng : truck.originLng;

    // Only render if we have valid coordinates
    if (!markerLat || !markerLng || markerLat === 0 || markerLng === 0) {
      console.warn(`⚠️ No valid coordinates for truck ${truck.number}`);
      return;
    }

    // Calculate heading based on route direction
    let heading = 0;
    const routeData = routePaths[truck.id];

    if (routeData && routeData.path && routeData.path.length > 1) {
      // Find the closest point on the route to current position
      let closestIndex = 0;
      let minDistance = Infinity;

      routeData.path.forEach((point, index) => {
        const distance = Math.sqrt(
          Math.pow(point[0] - markerLat, 2) + Math.pow(point[1] - markerLng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      // Calculate heading from current point to next point on route
      if (closestIndex < routeData.path.length - 1) {
        const currentPoint = routeData.path[closestIndex];
        const nextPoint = routeData.path[closestIndex + 1];
        heading = calculateBearing(
          currentPoint[0], currentPoint[1],
          nextPoint[0], nextPoint[1]
        );
      }
    } else if (truck.destLat && truck.destLng && truck.destLat !== 0 && truck.destLng !== 0) {
      // Fallback: calculate heading from current position to destination
      heading = calculateBearing(markerLat, markerLng, truck.destLat, truck.destLng);
    }

    // Create truck marker
    const truckMarker = new window.google.maps.Marker({
      position: { lat: markerLat, lng: markerLng },
      map,
      icon: createTruckIcon(heading),
      title: truck.number
    });

    // Create info window content
    const infoWindowContent = `
      <div style="padding: 8px; min-width: 250px; font-family: Arial, sans-serif;">
        <div style="font-weight: bold; font-size: 16px; color: #1976d2; margin-bottom: 8px;">
          ${truck.number}
        </div>
        <div style="margin-bottom: 4px;">
          <strong>Vehicle:</strong> ${truck.vehicleNumber || 'N/A'}
        </div>
        <div style="margin-bottom: 4px;">
          <strong>Location:</strong> ${truck.currentLocation?.address || 'N/A'}
        </div>
        <div style="margin-bottom: 4px;">
          <strong>Battery:</strong> ${truck.currentLocation?.deviceInfo?.batteryLevel ? `${truck.currentLocation.deviceInfo.batteryLevel}%` : 'N/A'}
        </div>
        <div style="margin-bottom: 4px;">
          <strong>Speed:</strong> ${truck.currentLocation?.speed ? `${truck.currentLocation.speed} km/h` : 'N/A'}
        </div>
        ${truck.commodity ? `<div style="margin-bottom: 4px;"><strong>Commodity:</strong> ${truck.commodity}</div>` : ''}
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee;">
          <button
            id="help-btn-${truck.id}"
            style="
              width: 100%;
              padding: 8px 12px;
              background-color: ${helpLoading[truck.id] ? '#ccc' : '#1976d2'};
              color: white;
              border: none;
              border-radius: 4px;
              cursor: ${helpLoading[truck.id] ? 'not-allowed' : 'pointer'};
              font-size: 12px;
              font-weight: 500;
            "
            ${helpLoading[truck.id] ? 'disabled' : ''}
          >
            ${helpLoading[truck.id] ? 'Loading...' : '📧 Help & Support'}
          </button>
        </div>
      </div>
    `;

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: infoWindowContent
    });

    // Add click listener to marker
    truckMarker.addListener('click', () => {
      infoWindowsRef.current.forEach(iw => iw.close());
      infoWindow.open(map, truckMarker);
      
      // Attach help button click handler after info window opens
      setTimeout(() => {
        const helpBtn = document.getElementById(`help-btn-${truck.id}`);
        if (helpBtn && onHelpClick) {
          helpBtn.addEventListener('click', () => onHelpClick(truck));
        }
      }, 100);
    });

    markersRef.current.push(truckMarker);
    infoWindowsRef.current.push(infoWindow);

    // Create origin marker
    if (truck.originLat && truck.originLng && truck.originLat !== 0 && truck.originLng !== 0) {
      const originMarker = new window.google.maps.Marker({
        position: { lat: truck.originLat, lng: truck.originLng },
        map,
        icon: createOriginIcon(),
        title: 'Origin'
      });

      const originInfoWindow = new window.google.maps.InfoWindow({
        content: '<div style="padding: 4px;"><strong>Origin</strong></div>'
      });

      originMarker.addListener('click', () => {
        originInfoWindow.open(map, originMarker);
      });

      markersRef.current.push(originMarker);
      infoWindowsRef.current.push(originInfoWindow);
    }

    // Create destination marker
    if (truck.destLat && truck.destLng && truck.destLat !== 0 && truck.destLng !== 0) {
      const destMarker = new window.google.maps.Marker({
        position: { lat: truck.destLat, lng: truck.destLng },
        map,
        icon: createDestinationIcon(),
        title: 'Destination'
      });

      const destInfoWindow = new window.google.maps.InfoWindow({
        content: '<div style="padding: 4px;"><strong>Destination</strong></div>'
      });

      destMarker.addListener('click', () => {
        destInfoWindow.open(map, destMarker);
      });

      markersRef.current.push(destMarker);
      infoWindowsRef.current.push(destInfoWindow);
    }

    // Create route polyline
    const hasValidOrigin = truck.originLat && truck.originLng && 
                           truck.originLat !== 0 && truck.originLng !== 0;
    const hasValidDest = truck.destLat && truck.destLng && 
                         truck.destLat !== 0 && truck.destLng !== 0;

    if (routeData && routeData.path && routeData.path.length > 0) {
      // Convert path format from [lat, lng] to {lat, lng}
      const path = routeData.path.map(point => ({
        lat: point[0],
        lng: point[1]
      }));

      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#1976d2',
        strokeOpacity: 0.7,
        strokeWeight: 5
      });

      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    } else if (hasValidOrigin && hasValidDest) {
      // Fallback: straight line
      const polyline = new window.google.maps.Polyline({
        path: [
          { lat: truck.originLat, lng: truck.originLng },
          { lat: truck.destLat, lng: truck.destLng }
        ],
        geodesic: true,
        strokeColor: '#ff9800',
        strokeOpacity: 0.6,
        strokeWeight: 4,
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4
          },
          offset: '0',
          repeat: '20px'
        }]
      });

      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    }

    // Fit bounds to show all markers and route
    if (mapView === "route" && routeData && routeData.path && routeData.path.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      routeData.path.forEach(point => {
        bounds.extend({ lat: point[0], lng: point[1] });
      });
      map.fitBounds(bounds);
    } else if (markerLat && markerLng) {
      map.setCenter({ lat: markerLat, lng: markerLng });
      map.setZoom(10);
    }
  }, [selectedShipment, expandedId, routePaths, mapView, helpLoading, onHelpClick, showTraffic]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Traffic Toggle Button - Google Maps Style */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: '#ffffff',
          borderRadius: '2px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          fontFamily: 'Roboto, Arial, sans-serif',
        }}
      >
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          style={{
            padding: '10px 15px',
            backgroundColor: showTraffic ? '#e8eaed' : '#ffffff',
            color: '#202124',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: showTraffic ? 500 : 400,
            textAlign: 'left',
            minWidth: '100px',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!showTraffic) {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }
          }}
          onMouseLeave={(e) => {
            if (!showTraffic) {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }
          }}
        >
          <span style={{ fontSize: '16px' }}>🚦</span>
          Traffic
        </button>
      </div>
    </div>
  );
};

export default LiveTrackerMap;

