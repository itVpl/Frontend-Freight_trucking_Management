import { useEffect, useRef } from 'react';

const GoogleMap = ({ mapData, center = { lat: 39.8283, lng: -98.5795 }, zoom = 4 }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Clear existing markers and info windows
    markersRef.current.forEach(marker => marker.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    // Create markers for each shipment
    mapData.forEach((shipment) => {
      // Calculate current location (midpoint between origin and destination for demo)
      const currentLat = (shipment.origin.coordinates[0] + shipment.destination.coordinates[0]) / 2;
      const currentLng = (shipment.origin.coordinates[1] + shipment.destination.coordinates[1]) / 2;

      const position = { lat: currentLat, lng: currentLng };

      // Create marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: shipment.shipmentNumber,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Create info window content
      const infoWindowContent = `
        <div style="padding: 8px; min-width: 200px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px; font-weight: 600;">
            ${shipment.shipmentNumber}
          </h3>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Status:</strong> ${shipment.status}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>From:</strong> ${shipment.origin.city}, ${shipment.origin.state}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>To:</strong> ${shipment.destination.city}, ${shipment.destination.state}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Pickup:</strong> ${new Date(shipment.pickupDate).toLocaleDateString()}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Delivery:</strong> ${new Date(shipment.deliveryDate).toLocaleDateString()}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Rate:</strong> $${shipment.rate}
          </p>
        </div>
      `;

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        // Close all other info windows
        infoWindowsRef.current.forEach(iw => iw.close());
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });

    // Fit bounds to show all markers
    if (mapData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mapData.forEach((shipment) => {
        const currentLat = (shipment.origin.coordinates[0] + shipment.destination.coordinates[0]) / 2;
        const currentLng = (shipment.origin.coordinates[1] + shipment.destination.coordinates[1]) / 2;
        bounds.extend({ lat: currentLat, lng: currentLng });
      });
      map.fitBounds(bounds);
    }
  }, [mapData, center, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMap;

